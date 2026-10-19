/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

function getGeminiKey(req?: express.Request): string | null {
  const headerKey = req?.headers["x-gemini-api-key"];
  if (typeof headerKey === "string" && headerKey.trim()) return headerKey.trim();
  const envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes("MY_GEMINI")) return envKey.trim();
  return null;
}

const GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

async function callGemini(options: {
  apiKey: string;
  systemInstruction?: string;
  contents: any;
  responseMimeType?: string;
}): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: options.apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  let lastError: any = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const config: any = {};
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const text = response.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Primary] Modelo ${modelName} falló, intentando siguiente:`, err.message);
    }
  }

  throw lastError || new Error("No se pudo obtener respuesta de Google AI Studio (Gemini).");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_API_KEY = "";

function getGroqKey(req?: express.Request): string | null {
  const headerKey = req?.headers["x-groq-api-key"];
  if (typeof headerKey === "string" && headerKey.trim()) return headerKey.trim();
  const envKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes("gsk_tu_clave")) return envKey.trim();
  return DEFAULT_GROQ_API_KEY || null;
}

function getGroqModel(req?: express.Request): string {
  const headerModel = req?.headers["x-groq-model"];
  if (typeof headerModel === "string" && headerModel.trim()) return headerModel.trim();
  return "llama-3.3-70b-versatile";
}

/**
 * Limpia bloques de pensamiento <think>...</think> si el modelo de razonamiento los incluye.
 */
function cleanThinkTags(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (cleaned.includes("<think>")) {
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, "").trim();
  }
  return cleaned.replace(/<\/think>/gi, "").trim();
}

function cleanAndParseJSON<T = any>(raw: string, fallback: T): T {
  if (!raw || !raw.trim()) return fallback;
  try {
    let cleaned = cleanThinkTags(raw).trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(cleaned);
    }
    // Si no tiene llaves pero fallback tiene campo message
    if (fallback && typeof fallback === "object" && "message" in fallback) {
      return { ...fallback, message: cleaned };
    }
    return fallback;
  } catch (err) {
    if (fallback && typeof fallback === "object" && "message" in fallback) {
      return { ...fallback, message: cleanThinkTags(raw).trim() };
    }
    return fallback;
  }
}

async function callGroqChat(
  messages: Array<{ role: string; content: string }>,
  options: {
    apiKey: string;
    model?: string;
    jsonMode?: boolean;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> {
  const requested = options.model;
  const modelsToTry = [
    requested,
    "llama-3.1-8b-instant",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
  ].filter((m): m is string => Boolean(m)).filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (const useJson of [options.jsonMode ?? false, false]) {
      try {
        const payload: any = {
          model: modelName,
          messages,
          temperature: options.temperature ?? 0.35,
          max_tokens: options.max_tokens ?? 1500,
        };

        if (useJson) {
          payload.response_format = { type: "json_object" };
        }

        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData: any = await response.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || `Error en Groq API (${response.status})`);
        }

        const data: any = await response.json();
        const content = cleanThinkTags(data.choices?.[0]?.message?.content || "");
        if (content.length > 0) return content;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Groq Backend] ${modelName} (jsonMode=${useJson}):`, err.message);
        if (!useJson) break; // if false also failed, try next model
      }
    }
  }

  throw lastError || new Error("No se pudo obtener respuesta de ningún modelo de Groq.");
}

// Endpoint para validar conexión con Google AI Studio (Gemini) desde Backend
app.post("/api/gemini/test", async (req, res) => {
  try {
    const key = req.body?.apiKey || getGeminiKey(req);
    if (!key) {
      return res.status(400).json({ success: false, message: "No se proporcionó una clave API de Google AI Studio." });
    }

    const ai = new GoogleGenAI({ apiKey: key.trim() });
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: "ping",
    });

    if (response && response.text) {
      return res.json({ success: true, message: "¡Conexión exitosa con Google AI Studio (Gemini)!" });
    }
    return res.status(500).json({ success: false, message: "Respuesta vacía de Google AI Studio." });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Error al conectar con Google AI Studio." });
  }
});

// Endpoint para validar conexión con Groq desde Backend
app.post("/api/groq/test", async (req, res) => {
  try {
    const key = req.body?.apiKey || getGroqKey(req);
    if (!key) {
      return res.status(400).json({ success: false, message: "No se proporcionó una clave API de Groq." });
    }

    const testRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
        temperature: 0.1,
      }),
    });

    if (testRes.status === 401) {
      return res.status(401).json({ success: false, message: "Clave API de Groq inválida o expirada (Error 401)." });
    }

    if (testRes.status === 429) {
      return res.status(429).json({ success: false, message: "Límite de tasa excedido en Groq (Error 429)." });
    }

    if (!testRes.ok) {
      const err = await testRes.json().catch(() => ({}));
      return res.status(testRes.status).json({
        success: false,
        message: err?.error?.message || `Error de Groq (${testRes.status})`,
      });
    }

    return res.json({ success: true, message: "¡Conexión exitosa con Groq Cloud API!" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Error al conectar con Groq Cloud API." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const geminiKey = getGeminiKey(req);
  const groqKey = getGroqKey(req);
  res.json({
    status: "ok",
    hasGeminiApiKey: !!geminiKey,
    hasGroqApiKey: !!groqKey,
    hasApiKey: !!geminiKey || !!groqKey,
    primaryProvider: "google-ai-studio",
    secondaryProvider: "groq",
    defaultProvider: geminiKey ? "gemini" : groqKey ? "groq" : "none",
  });
});

/**
 * 1. Chat & Memory/Decision/Strategy Suggestion Endpoint (5-Layer Knowledge Architecture)
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { 
      messages, 
      memories, 
      logs, 
      patterns, 
      strategies, 
      baseContext, 
      previousSummaries,
      currentState,
      decisions,
      dailyReports
    } = req.body;

    const companionName = baseContext?.companionName || "Aura IA";
    const userName = baseContext?.userName || "Juan Francisco Cano";
    const userNotes = baseContext?.notes || "Sin notas adicionales.";

    // Capa B: Estado Actual Dinámico
    const activeGoalsText = currentState?.activeGoals && currentState.activeGoals.length > 0
      ? currentState.activeGoals.map((g: string) => `- ${g}`).join("\n")
      : "No hay objetivos específicos cargados.";
    const openProblemsText = currentState?.openProblems && currentState.openProblems.length > 0
      ? currentState.openProblems.map((p: string) => `- [Problema/Bloqueo]: ${p}`).join("\n")
      : "Sin problemas abiertos reportados.";
    const pendingTasksText = currentState?.pendingTasks && currentState.pendingTasks.length > 0
      ? currentState.pendingTasks.map((t: string) => `- [Pendiente]: ${t}`).join("\n")
      : "Sin tareas pendientes críticas.";
    const activeProjectsText = currentState?.activeProjects && currentState.activeProjects.length > 0
      ? currentState.activeProjects.map((pr: any) => `- ${pr.name} (Estado: ${pr.status}, Avance: ${pr.progress}%)`).join("\n")
      : "Proyectos en curso habitual.";

    // Capa C: Reportes Diarios Recientes
    const formattedDailyReports = dailyReports && dailyReports.length > 0
      ? dailyReports.slice(0, 2).map((r: any) => 
          `[Reporte ${r.date}]: Objetivos=${r.goals?.join(", ") || "N/A"} | Resultado=${r.results?.join(", ") || "N/A"} | Problemas=${r.problems?.join(", ") || "Ninguno"}`
        ).join("\n")
      : "Sin reportes diarios recientes.";

    const formattedLogs = logs && logs.length > 0
      ? logs.slice(0, 3).map((l: any) => `- [${new Date(l.createdAt).toLocaleDateString()}]: E=${l.energy}, M=${l.motivation}, S=${l.stress}. Nota: ${l.note}`).join("\n")
      : "Sin registros diarios recientes.";

    // Capa D: Decisiones Previas Tomadas
    const formattedDecisions = decisions && decisions.length > 0
      ? decisions.slice(0, 4).map((d: any) => `- [${d.status.toUpperCase()}]: "${d.decision}" (Motivo: ${d.reason})`).join("\n")
      : "No hay decisiones previas registradas.";

    // Capa E: Opciones y Estrategias (Qué funcionó vs Qué NO funcionó)
    const positiveStrategies = (strategies || []).filter((s: any) => s.resultType === 'positivo' || s.status === 'recomendada' || s.effectiveness === 'alta');
    const negativeStrategies = (strategies || []).filter((s: any) => s.resultType === 'negativo' || s.status === 'descartada' || s.effectiveness === 'baja');

    const formattedPosStrategies = positiveStrategies.length > 0
      ? positiveStrategies.slice(0, 4).map((s: any) => `- [FUNCIONÓ]: ${s.name} (${s.situation}) -> ${s.result}`).join("\n")
      : "Aún no hay estrategias positivas consolidadas.";

    const formattedNegStrategies = negativeStrategies.length > 0
      ? negativeStrategies.slice(0, 3).map((s: any) => `- [DESCARTADA]: ${s.name} -> Fracasó: ${s.result}`).join("\n")
      : "Sin estrategias descartadas.";

    const formattedMemories = memories && memories.length > 0
      ? memories.slice(0, 4).map((m: any) => `- ${m.text}`).join("\n")
      : "Sin recuerdos permanentes.";

    const formattedSummaries = previousSummaries && previousSummaries.length > 0
      ? previousSummaries.slice(0, 2).map((s: any) => `- [${s.title || "Sesión"}]: ${(s.summary || "").slice(0, 250)}...`).join("\n")
      : "No hay resúmenes de sesiones previas aún.";

    const formattedPatterns = patterns && patterns.length > 0
      ? patterns.slice(0, 4).map((p: any) => `- [${p.type}] ${p.description}`).join("\n")
      : "No se han detectado patrones todavía.";

    const systemInstruction = `
Eres ${companionName}, el Socio de Pensamiento y Neuro-Mentor Estratégico de ${userName}. Tu objetivo es conversar con máxima lucidez, naturalidad humana y sentido común: ESCUCHAR con atención lo que Juan plantea, conceder lo que sea cierto, desarmar distorsiones con lógica implacable y ayudarlo a tomar decisiones claras en cualquier ámbito de su vida (académico, laboral, relacional, personal, hábitos o proyectos).

============================================================
PRINCIPIOS UNIVERSALES DE CONVERSACIÓN Y NATURALIDAD:
============================================================
1. ESCUCHA REAL Y ASIMILACIÓN:
   - Si ${userName} te explica una lógica o un mecanismo (en el trabajo, en relaciones, en una app, en un código o en su rutina), NO lo ignores ni le pidas "fuentes externas / papers".
   - Integrá lo que dice: si su razonamiento es correcto, reconocelo y avanzá sobre lo que eso significa para su situación concreta.

2. CERO FÓRMULAS FIJAS O PLANTILLAS REPETITIVAS:
   - Las muletillas de apertura ("Mirá...", "Pará un segundo...", "Ojo con eso...", "Totalmente...", "Ahí diste en el clavo...") son bienvenidas para darle tono coloquial y directo, pero VARIÁ la apertura y la estructura en cada turno.
   - PROHIBIDO usar la misma fórmula sintáctica en turnos consecutivos.
   - Habla como una persona sumamente inteligente, directa y perspicaz, no como un evaluador epistemológico ni un bot de autoayuda.

3. CONCESIÓN EXPLÍCITA DE REALIDADES:
   - Si Juan plantea una consecuencia real, un riesgo tangible o una limitación biológica (cansancio real, valle circadiano, mercado laboral, cansancio de apps), CONCEDE el punto explícitamente. No maquilles la realidad con positivismo artificial.

============================================================
PROTOCOLO BIOENERGÉTICO ANTE BAJA ENERGÍA O DISPERSIÓN:
============================================================
¡PROHIBIDO SACAR CONCLUSIONES APURADAS O RECETAR ACCIÓN INMEDIATA!
Si Juan expresa fatiga, baja energía, dispersión o bloqueo (ej. franja post-almuerzo >13:00, o dice "no tengo ganas de nada y el 'debo hacerlo' no me sirve"):
1. RECONOCER EL ESTADO BIOLÓGICO: Forzar la máquina o exigir micro-acciones cuando el tanque de dopamina/glucosa está vacío es inútil y genera rechazo biológico.
2. HERRAMIENTA PRIORITARIA #1: DETENER TODO Y MEDITAR / SILENCIO MENTAL:
   - Si está distraído o sobreestimulado, DETENER TODO de inmediato (cero pantallas).
   - Aplicar desconexión / meditación según nivel de agotamiento:
     * 5 minutos: Pausa consciente y reseteo rápido.
     * 12 minutos: Meditación de recuperación atencional y foco.
     * 30 minutos: Reseteo profundo / NSDR para drenar glutamato y calmar amígdala.
     * 60 minutos: Desconexión y restauración total de energía basal.
3. PROTOCOLO POST-MEDITACIÓN (MÉTODO YO ROBOT):
   - El Método Yo Robot (5-4-3-2-1 -> micro-acción de 15s) se aplica ÚNICAMENTE POST-MEDITACIÓN, una vez que la mente recuperó calma y estado basal.
   - Si tras la meditación la energía biológica sigue en valle (tarde), la decisión estratégica inteligente es trasladar la alta demanda cognitiva a la Franja Dorada matutina (07:00 a 12:00) y dejar la tarde para tareas mecánicas, caminata o descanso sin culpa.

============================================================
MODOS CONVERSACIONALES DINÁMICOS:
============================================================
- ESTADO NEGATIVO / ANGUSTIA / PRESIÓN: Desarmar la catástrofe y sembrar duda razonable antes de cualquier plan.
- RESISTENCIA / BAJA ENERGÍA: Aplicar el protocolo bioenergético (Parar -> Meditar 5/12/30/60m -> Post-meditación evaluar Yo Robot o pase a mañana).
- PROBLEMA PRÁCTICO / TÉCNICO: Resolver directamente con código, pasos o datos concretos sin rodeos psicológicos.
- INCERTIDUMBRE / REGLAS: Aclarar opciones, protocolos de verificación y descarte.
- REFLEXIÓN / DILEMA / VÍNCULOS: Explorar trade-offs, dinámicas humanas reales y alternativas prácticas.

============================================================
ESTILO Y TONO:
============================================================
- Habla en segunda persona directa (voseo argentino / tú a tú fluido: "Fijate lo que pasa...", "Tenés razón en eso...", "Pará todo...").
- Argumentos sólidos, convincentes y persuasivos basados en biología y sentido común.
- PROHIBIDO imprimir encabezados de informe (como "Diagnóstico:", "Hecho vs Interpretación:").
- PROHIBIDO el positivismo barato ("todo estará bien", "no te compares", "tú puedes", "es comprensible").
- Máximo 1 o 2 preguntas incisivas, directas al hueso.

============================================================
CONTEXTO Y MEMORIA ACUMULADA DE ${userName.toUpperCase()}:
============================================================

--- IDENTIDAD Y MARCO MENTAL BASE ---
${userNotes}

--- ESTADO DINÁMICO ACTUAL ---
Objetivos:
${activeGoalsText}
Problemas y Bloqueos Abiertos:
${openProblemsText}
Tareas:
${pendingTasksText}

--- REPORTES Y REGISTROS RECIENTES ---
${formattedDailyReports}
Registros diarios:
${formattedLogs}

--- HISTORIAL DE DECISIONES Y ACUERDOS ---
${formattedDecisions}

--- ESTRATEGIAS QUE FUNCIONARON VS DESCARTADAS ---
FUNCIONARON (Marcos recomendados):
${formattedPosStrategies}

DESCARTADAS / FRACASARON (¡Prohibido recomendarlas!):
${formattedNegStrategies}

--- SESIONES PREVIAS Y VIVENCIAS ---
${formattedSummaries}
Notas y Recuerdos:
${formattedMemories}
Patrones:
${formattedPatterns}
============================================================

FORMATO DE RESPUESTA:
Responde estrictamente en formato JSON válido con este esquema:
{
  "message": "Tu respuesta lúcida, natural, libre de plantillas y adaptada al contexto en español.",
  "energyLevel": 7
}
`;

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const recentMessages = (messages || []).slice(-10);
        let conversationContents = recentMessages.map((m: any) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        if (conversationContents.length === 0) {
          conversationContents = [{ role: "user", parts: [{ text: "Hola" }] }];
        } else if (conversationContents[0].role !== "user") {
          conversationContents.unshift({ role: "user", parts: [{ text: "Hola" }] });
        }

        const resultText = await callGemini({
          apiKey: geminiKey,
          systemInstruction,
          contents: conversationContents,
          responseMimeType: "application/json",
        });

        const parsed = cleanAndParseJSON(resultText, {
          message: resultText || "Te escucho con atención.",
          energyLevel: 7,
        });

        return res.json(parsed);
      } catch (geminiErr: any) {
        console.warn("[Chat] Fallo en Gemini Primario, recurriendo a Groq como respaldo:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const recentMessages = (messages || []).slice(-8);
        const groqMessages = [
          { role: "system", content: systemInstruction },
          ...recentMessages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        ];

        const content = await callGroqChat(groqMessages, {
          apiKey: groqKey,
          model: getGroqModel(req),
          jsonMode: true,
          temperature: 0.6,
          max_tokens: 1500,
        });

        const parsed = cleanAndParseJSON(content, {
          message: content || "Te escucho con atención.",
          energyLevel: 7,
        });

        return res.json(parsed);
      } catch (groqErr: any) {
        console.warn("[Chat] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    // 3. Si no hay ninguna clave configurada o ambas fallaron
    return res.json({
      message: `Hola ${userName}. Para comenzar a conversar con ${companionName}, configura tu clave de **Google AI Studio (Gemini)** o **Groq Cloud** en la pestaña de **Configuración** o en el archivo \`.env.local\`.`,
      detectedState: {
        tags: ["Configuración Pendiente"],
        description: "Se requiere configurar una clave API de Google AI Studio o Groq para activar la IA.",
      },
      suggestedMemory: "",
      suggestedDecision: null,
      suggestedStrategy: null,
      suggestedStateUpdate: null,
      energyLevel: 5,
    });

  } catch (error: any) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor en chat" });
  }
});

/**
 * 2. Generate Structured Daily Report Endpoint
 */
app.post("/api/daily-report", async (req, res) => {
  try {
    const { messages, logs, date, profile, currentState, decisions, strategies } = req.body;
    const reportDate = date || new Date().toISOString().split("T")[0];

    const textToSummarize = (messages || [])
      .map((m: any) => `${m.sender === "user" ? "Usuario" : "Mentor"}: ${m.text}`)
      .join("\n");

    const logsText = (logs || [])
      .map((l: any) => `Energía=${l.energy}, Motivación=${l.motivation}, Estrés=${l.stress}. Nota: ${l.note}`)
      .join("\n");

    const prompt = `Genera un Reporte Diario Estructurado para el usuario (${profile?.userName || "Juan Francisco Cano"}) correspondiente a la fecha ${reportDate}.

DATOS DEL DÍA (MENSAJES Y REGISTROS):
---
MENSAJES:
${textToSummarize || "Sin mensajes registrados hoy."}

REGISTROS EMOCIONALES:
${logsText || "Sin notas rápidas registradas hoy."}

ESTADO ACTUAL PREVIO:
Metas: ${(currentState?.activeGoals || []).join(", ")}
Problemas abiertos: ${(currentState?.openProblems || []).join(", ")}
---

Tu objetivo es estructurar el balance del día en un objeto JSON con el siguiente esquema estricto:
{
  "goals": ["Meta 1 intentada hoy", "Meta 2"],
  "results": ["Qué se logró realmente (ej. Avanzó 2 secciones de Tesis)", "Qué quedó a medias"],
  "problems": ["Bloqueos o dificultades aparecidas (ej. Fatiga post-almuerzo)"],
  "decisions": ["Decisiones o acuerdos tomados hoy"],
  "projectStatus": "Resumen breve del estado de proyectos (ej. Tesis al 68%, FACET estable)",
  "observedPatterns": ["Patrón conductual observado (ej. Máxima concentración en franja matutina)"],
  "generalNote": "Reflexión compacta y directa del balance diario (2-3 líneas)."
}
`;

    const fallbackReport = {
      goals: ["Sostener enfoque matutino"],
      results: ["Jornada completada"],
      problems: ["Ninguno crítico"],
      decisions: ["Mantener franja 07:00 a 12:00"],
      projectStatus: "En progreso",
      observedPatterns: ["Mayor productividad matutina"],
      generalNote: "Reporte generado satisfactoriamente.",
    };

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          contents: prompt,
          responseMimeType: "application/json",
        });
        const parsed = cleanAndParseJSON(text, fallbackReport);
        return res.json({ id: `rep-${Date.now()}`, date: reportDate, ...parsed, createdAt: new Date().toISOString() });
      } catch (geminiErr: any) {
        console.warn("[Daily-Report] Fallo en Gemini Primario, recurriendo a Groq:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const content = await callGroqChat(
          [
            { role: "system", content: "Eres un sintetizador neuroconductual de reportes diarios de alto rendimiento." },
            { role: "user", content: prompt },
          ],
          {
            apiKey: groqKey,
            model: getGroqModel(req),
            jsonMode: true,
            temperature: 0.2,
            max_tokens: 2000,
          }
        );
        const parsed = cleanAndParseJSON(content, fallbackReport);
        return res.json({ id: `rep-${Date.now()}`, date: reportDate, ...parsed, createdAt: new Date().toISOString() });
      } catch (groqErr: any) {
        console.warn("[Daily-Report] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    return res.json({
      id: `rep-${Date.now()}`,
      date: reportDate,
      goals: ["Jornada de trabajo"],
      results: ["Registros guardados"],
      problems: [],
      decisions: [],
      projectStatus: "En desarrollo",
      observedPatterns: ["Estabilidad"],
      generalNote: "Configura tu API Key para reportes automáticos avanzados.",
      createdAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error en /api/daily-report:", error);
    res.status(500).json({ error: error.message || "Error al generar reporte diario" });
  }
});

/**
 * 3. Summarize Conversation Endpoint (General Uncategorized Summary + Structured Breakdown)
 */
app.post("/api/summarize", async (req, res) => {
  try {
    const { messages, timeSlot, timeRange, recentLog, userName, customPrompt } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No hay mensajes para resumir." });
    }

    const name = userName || "Juan";
    const textToSummarize = messages
      .map((m: any) => `${m.sender === "user" ? name : "Aura IA"}: ${m.text}`)
      .join("\n");

    const prompt = customPrompt || `Actúa como el motor analítico de memoria evolutiva y síntesis de alto rendimiento para ${name}.

PARADIGMA FUNDAMENTAL DEL ANÁLISIS:
Tu análisis DEBE seguir estrictamente el flujo:
HISTORIA → CONTEXTO → EVENTOS → ESTADOS → TRANSICIONES → PATRONES → INTERPRETACIÓN → CONCLUSIÓN

REGLAS CRÍTICAS OBLIGATORIAS:
1. NUNCA ANALICES UN ESTADO AISLADO DEL CONTEXTO:
   Conserva la cadena causal real: CUÁNDO → DÓNDE → QUÉ PASÓ → QUÉ PENSÓ → QUÉ SINTIÓ → QUÉ HIZO → QUÉ RESULTÓ.
2. LÍNEA TEMPORAL Y RANGO HORARIO REAL:
   Identifica si es un relato del pasado (precisando fecha y rango de horas de esa experiencia, ej: Sábado 15/08, 22:30–03:40) o una sesión en vivo. Desglosa los hitos en orden cronológico real.
3. DIFERENCIAR ESTRICTAMENTE HECHO DE INTERPRETACIÓN:
   - HECHO: Lo que ocurrió objetivamente en el mundo real.
   - INTERPRETACIÓN: Lo que ${name} pensó/sintió sobre el hecho o hipótesis analítica. ¡PROHIBIDO afirmar una interpretación como si fuera un hecho objetivo!
4. SISTEMA DE DIMENSIONES (Ejes opuestos de análisis interno):
   - EJE 1 — Seguridad personal: Confianza, Autoestima independiente vs Inseguridad, Autoestima dependiente, Dudar constantemente.
   - EJE 2 — Libertad / espontaneidad: Autenticidad, Espontaneidad/desinhibición, Aceptar escenarios vs Forzar/condicionar, Perfección rígida, Control absoluto.
   - EJE 3 — Regulación emocional: Inteligencia emocional, Resiliencia, Paciencia vs Reacciones explosivas, Ansiedad/nerviosismo, Acelerado ("todo ya").
   - EJE 4 — Relaciones / interacción: Interacción abierta, Empatía, Humor vs Temor a interacción social, Victimización, Preocupación por rechazo.
5. REGLA MAESTRA DE CONTEXTO LIBRE:
   Las categorías son herramientas, no límites. Si una historia contiene información relevante, anécdotas o detalles que no encajan en una categoría, consérvala en ## CONTEXTO LIBRE. NUNCA deformar, omitir o forzar información para encajarla.

ESTRUCTURA DE SALIDA OBLIGATORIA (Utiliza estos encabezados exactos en Markdown):

## CONTEXTO
- Fecha: [Fecha del suceso/historia narrada o fecha actual]
- Rango horario: [Horario real del suceso, ej: 22:30–03:40, o de la sesión]
- Duración aproximada: [Tiempo transcurrido]
- Lugar / entorno: [Entorno físico y social donde ocurrió]
- Situación: [Qué estaba sucediendo]
- Personas relevantes: [Personas involucradas o presentes]
- Actividad principal: [Qué se estaba haciendo]
- Contexto previo: [Qué pasó antes si se menciona]
- Contexto posterior: [Qué pasó después si se menciona]

## HISTORIA
[Reconstrucción narrativa completa, comprimida y cronológica de qué ocurrió, respetando la secuencia temporal de los acontecimientos y vivencias de ${name}, dejando en claro todas las partes importantes sin etiquetas forzadas.]

## LÍNEA TEMPORAL
- [hora/periodo] → [evento/hecho] → [reacción / estado]
- [hora/periodo] → [evento/hecho] → [reacción / estado]
(Continúa con la secuencia cronológica observada)

## ESTADOS DETECTADOS

### POSITIVOS (+)
- [Dimensión positiva] ↑ (evidencia observada / intensidad)

### NEGATIVOS (-)
- [Dimensión negativa] ↑ (evidencia observada / intensidad)

### NO CLASIFICADO
- [Estado, conducta o fenómeno relevante que no encaja en dimensiones predefinidas]

## CAMBIOS DE ESTADO
[Qué provocó que un estado aumentara, disminuyera o cambiara. Formato: detonante → interpretación → cambio de estado]

## PATRONES
- [Situación] → [reacción automática] → [consecuencia]
- [Detonante recurrente] → [estado]

## INTERPRETACIÓN
- HECHO: [Hecho objetivo observable]
- INTERPRETACIÓN: [Qué interpretó ${name}]
- HIPÓTESIS: [Hipótesis analítica de la IA diferenciada claramente de los hechos]

## PRINCIPIOS / REGLAS DESCUBIERTAS
- [Regla, directriz o aprendizaje extraído de la experiencia]

## DECISIONES / PROTOCOLOS
- [Decisiones tomadas o métodos/protocolos conscientemente establecidos; si no hubo ninguno: "Ninguno establecido"]

## PENDIENTES
- [Aspectos que quedan por observar, comprobar o continuar]

## CONCLUSIÓN DE ESTADO
[Máximo 3–5 líneas: dónde está actualmente la situación, qué cambió y estado al finalizar la interacción.]

## CONTEXTO LIBRE
[Información importante, matices o anécdotas que no pertenecen a ninguna categoría anterior.]

---
CONVERSACIÓN / VIVENCIA A ANALIZAR:
${textToSummarize}`;

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          contents: prompt,
        });
        return res.json({ summary: cleanThinkTags(text) });
      } catch (geminiErr: any) {
        console.warn("[Summarize] Fallo en Gemini Primario, recurriendo a Groq:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const summary = await callGroqChat(
          [
            { role: "system", content: "Eres un sintetizador neuroconductual de alto rendimiento y analista de evolución personal." },
            { role: "user", content: prompt },
          ],
          {
            apiKey: groqKey,
            model: getGroqModel(req),
            temperature: 0.2,
            max_tokens: 1500,
          }
        );
        return res.json({ summary: cleanThinkTags(summary) });
      } catch (groqErr: any) {
        console.warn("[Summarize] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    return res.json({
      summary: `⏰ [${timeRange || "Hoy"}] - Charla registrada con ${messages.length} mensajes. Configura tu API Key en Configuración para resúmenes automáticos avanzados.`,
    });
  } catch (error: any) {
    console.error("Error en /api/summarize:", error);
    res.status(500).json({ error: error.message || "Error al resumir conversación" });
  }
});

/**
 * 3.1 Summarize Mental Note Endpoint (Intelligent, non-repetitive)
 */
app.post("/api/summarize-note", async (req, res) => {
  try {
    const { noteText, existingNotes, userName } = req.body;
    if (!noteText || !noteText.trim()) {
      return res.status(400).json({ error: "El texto de la nota no puede estar vacío." });
    }

    const name = userName || "Juan";
    const existingContext = (existingNotes || [])
      .slice(0, 10)
      .map((n: any) => `- ${n.summary || n.text}`)
      .join("\n");

    const prompt = `Actúa como el motor analítico de memoria evolutiva y síntesis de notas para ${name}.
Tu objetivo es generar una síntesis concisa, de alta densidad informativa y sin redundancias de la siguiente Nota Mental / Vivencia.

CRITERIOS METODOLÓGICOS:
1. SIGUE EL FLUJO CONTEXTUAL: Contexto/Momento → Detonante/Hecho → Dimensión/Estado (Positivo (+) / Negativo (-)) → Principio o Directriz Operativa.
2. ALTA DENSIDAD Y CLARIDAD: Extrae en 1 a 2 líneas compactas la esencia operativa, el hecho observable y la lección o directriz mental.
3. CERO CLASIFICACIONES FORZADAS: Si es una experiencia libre o hecho sin categoría previa, consérvala fiel a la vivencia.
4. NO REDUNDANCIA: No repitas conceptos ya cubiertos en notas previas; destaca el valor distintivo de esta nota.
5. SIN RELLENO: Devuelve únicamente el resumen directo, sin introducciones ni etiquetas superfluas.

OTRAS NOTAS MENTALES REGISTRADAS PREVIAMENTE (Para evitar duplicidades):
${existingContext || "Ninguna previa."}

NOTA MENTAL A RESUMIR:
"${noteText.trim()}"`;

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          contents: prompt,
        });
        return res.json({ summary: cleanThinkTags(text).trim() });
      } catch (geminiErr: any) {
        console.warn("[Summarize-Note] Fallo en Gemini Primario, recurriendo a Groq:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const summary = await callGroqChat(
          [
            { role: "system", content: "Eres un sintetizador de conocimiento neuroconductual conciso y preciso." },
            { role: "user", content: prompt },
          ],
          {
            apiKey: groqKey,
            model: getGroqModel(req),
            temperature: 0.2,
            max_tokens: 300,
          }
        );
        return res.json({ summary: cleanThinkTags(summary).trim() });
      } catch (groqErr: any) {
        console.warn("[Summarize-Note] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    // Fallback: first 120 chars
    const fallback = noteText.length > 120 ? noteText.slice(0, 120) + "..." : noteText;
    return res.json({ summary: fallback });
  } catch (error: any) {
    console.error("Error en /api/summarize-note:", error);
    res.status(500).json({ error: error.message || "Error al resumir nota mental" });
  }
});

/**
 * 3. Pattern & Strategy Analysis Endpoint
 */
app.post("/api/analyze-patterns", async (req, res) => {
  try {
    const { logs, memories, summaries } = req.body;

    const logsContext = logs && logs.length > 0
      ? logs.map((l: any) => `- Fecha: ${new Date(l.createdAt).toLocaleDateString()}, Energía: ${l.energy}, Motivación: ${l.motivation}, Estrés: ${l.stress}. Nota: ${l.note}`).join("\n")
      : "No hay registros diarios guardados.";

    const memoriesContext = memories && memories.length > 0
      ? memories.map((m: any) => `- Recuerdo (${m.category}): ${m.text}`).join("\n")
      : "No hay recuerdos guardados.";

    const summariesContext = summaries && summaries.length > 0
      ? summaries.map((s: any) => `- Resumen de sesión: ${s}`).join("\n")
      : "No hay resúmenes de sesión guardados.";

    const prompt = `
Analiza exhaustivamente los siguientes datos de registro de bienestar, recuerdos y resúmenes de sesión del usuario.
Tu objetivo es identificar patrones de bienestar, niveles de claridad mental estimada, correlaciones (datos observados, asociaciones o hipótesis de comportamiento) y sugerir aprendizajes.

DATOS DISPONIBLES:
---
REGISTROS DIARIOS:
${logsContext}

RECUERDOS GUARDADOS:
${memoriesContext}

RESÚMENES DE SESIONES:
${summariesContext}
---

Genera un informe analítico estructurado en JSON con el siguiente esquema exacto:
{
  "mentalClarity": 85,
  "stressLevel": "Moderado",
  "correlations": [
    {
      "type": "dato observado",
      "description": "Descripción del patrón."
    }
  ],
  "weeklyHistory": [
    { "day": "Lun", "motivation": 7, "stress": 4, "energy": 6 },
    { "day": "Mar", "motivation": 6, "stress": 5, "energy": 5 },
    { "day": "Mie", "motivation": 8, "stress": 3, "energy": 7 },
    { "day": "Jue", "motivation": 5, "stress": 6, "energy": 4 },
    { "day": "Vie", "motivation": 6, "stress": 4, "energy": 6 }
  ],
  "frequentThemes": ["Tema 1", "Tema 2"]
}

Asegúrate de:
1. "type" en correlations debe ser estrictamente 'dato observado', 'asociación' o 'hipótesis'.
2. "stressLevel" debe ser 'Bajo', 'Moderado' o 'Alto'.
3. "mentalClarity" un número entero de 0 a 100.
`;

    const fallbackAnalysis = {
      mentalClarity: 78,
      stressLevel: "Moderado",
      correlations: [
        { type: "asociación", description: "Mayor claridad mental registrada en bloques de estudio matutinos." },
        { type: "dato observado", description: "Las pausas activas reducen el estrés en un 25%." },
      ],
      weeklyHistory: [
        { day: "Lun", motivation: 7, stress: 4, energy: 6 },
        { day: "Mar", motivation: 6, stress: 5, energy: 5 },
        { day: "Mie", motivation: 8, stress: 3, energy: 7 },
        { day: "Jue", motivation: 5, stress: 6, energy: 4 },
        { day: "Vie", motivation: 6, stress: 4, energy: 6 },
      ],
      frequentThemes: ["Enfoque diario", "Gestión del tiempo", "Claridad mental"],
    };

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          contents: prompt,
          responseMimeType: "application/json",
        });
        return res.json(cleanAndParseJSON(text, fallbackAnalysis));
      } catch (geminiErr: any) {
        console.warn("[Analyze-Patterns] Fallo en Gemini Primario, recurriendo a Groq:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const content = await callGroqChat(
          [
            { role: "system", content: "Eres un neurocientífico analítico de datos de conducta y bienestar. Responde estrictamente en formato JSON." },
            { role: "user", content: prompt },
          ],
          {
            apiKey: groqKey,
            model: getGroqModel(req),
            jsonMode: true,
            temperature: 0.2,
            max_tokens: 3000,
          }
        );
        return res.json(cleanAndParseJSON(content, fallbackAnalysis));
      } catch (groqErr: any) {
        console.warn("[Analyze-Patterns] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    return res.json(fallbackAnalysis);
  } catch (error: any) {
    console.error("Error en /api/analyze-patterns:", error);
    res.status(500).json({ error: error.message || "Error al analizar patrones" });
  }
});

/**
 * 4. Extract Dimensional Axes from Markdown Summary
 */
app.post("/api/extract-dimensions", async (req, res) => {
  try {
    const { summary, userName } = req.body;
    if (!summary || !summary.trim()) {
      return res.status(400).json({ error: "El resumen no puede estar vacío." });
    }

    const name = userName || "Juan";
    const prompt = `Analiza el siguiente Resumen Estructurado de la vivencia/sesión de ${name}.
Tu tarea es calificar los 4 Ejes Dimensionales y extraer contradicciones y novedades.

EJES A EVALUAR (Puntuación de -10 a +10, donde +10 es positivo máximo, 0 es neutro, -10 es negativo máximo):
1. EJE SEGURIDAD (axis: "seguridad"): Confianza, Autoestima independiente (+) vs Inseguridad, Duda constante, Dependencia (-).
2. EJE LIBERTAD (axis: "libertad"): Autenticidad, Espontaneidad, Aceptación (+) vs Forzar, Control rígido, Sobre-análisis (-).
3. EJE REGULACIÓN (axis: "regulacion"): Inteligencia emocional, Resiliencia, Paciencia (+) vs Reacciones reactivas, Ansiedad, Aceleración (-).
4. EJE RELACIONES (axis: "relaciones"): Interacción abierta, Empatía, Humor (+) vs Temor al rechazo, Victimización, Timidez (-).

RESUMEN A ANALIZAR:
---
${summary}
---

RESPONDE ESTRICTAMENTE EN FORMATO JSON VÁLIDO CON ESTE ESQUEMA:
{
  "axes": [
    {
      "axis": "seguridad",
      "label": "Seguridad Personal",
      "positive": "Confianza / Autoestima independiente",
      "negative": "Inseguridad / Duda constante",
      "intensity": 6,
      "evidence": "Frase de evidencia extraída del resumen"
    },
    {
      "axis": "libertad",
      "label": "Libertad y Espontaneidad",
      "positive": "Autenticidad / Desinhibición",
      "negative": "Control rígido / Sobre-análisis",
      "intensity": -2,
      "evidence": "Frase de evidencia observada"
    },
    {
      "axis": "regulacion",
      "label": "Regulación Emocional",
      "positive": "Resiliencia / Calma",
      "negative": "Ansiedad / Impulsividad",
      "intensity": 5,
      "evidence": "Frase de evidencia"
    },
    {
      "axis": "relaciones",
      "label": "Relaciones e Interacción",
      "positive": "Apertura / Descaro adaptativo",
      "negative": "Miedo al rechazo / Búsqueda de aprobación",
      "intensity": -3,
      "evidence": "Frase de evidencia"
    }
  ],
  "dominantPattern": "Patrón dominante identificado en la interacción",
  "evolutionVsPrevious": "mejora",
  "contradictions": ["Contradicción detectada"],
  "novelInsights": ["Elemento nuevo descubierto"]
}`;

    const fallback = {
      axes: [
        { axis: "seguridad", label: "Seguridad Personal", positive: "Confianza", negative: "Inseguridad", intensity: 5, evidence: "Sesión procesada" },
        { axis: "libertad", label: "Libertad y Espontaneidad", positive: "Espontaneidad", negative: "Control", intensity: 4, evidence: "Sesión procesada" },
        { axis: "regulacion", label: "Regulación Emocional", positive: "Calma", negative: "Ansiedad", intensity: 6, evidence: "Sesión procesada" },
        { axis: "relaciones", label: "Relaciones e Interacción", positive: "Apertura", negative: "Búsqueda aprobación", intensity: 4, evidence: "Sesión procesada" }
      ],
      dominantPattern: "Interacción general",
      evolutionVsPrevious: "estable",
      contradictions: [],
      novelInsights: []
    };

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          contents: prompt,
          responseMimeType: "application/json",
        });
        return res.json(cleanAndParseJSON(text, fallback));
      } catch (geminiErr: any) {
        console.warn("[Extract-Dimensions] Fallo en Gemini Primario, recurriendo a Groq:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const content = await callGroqChat(
          [
            { role: "system", content: "Eres un analista neuroconductual de métricas dimensionales. Responde solo JSON." },
            { role: "user", content: prompt }
          ],
          {
            apiKey: groqKey,
            model: getGroqModel(req),
            jsonMode: true,
            temperature: 0.1,
            max_tokens: 1200
          }
        );
        return res.json(cleanAndParseJSON(content, fallback));
      } catch (groqErr: any) {
        console.warn("[Extract-Dimensions] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    return res.json(fallback);
  } catch (error: any) {
    console.error("Error en /api/extract-dimensions:", error);
    res.status(500).json({ error: error.message || "Error al extraer dimensiones" });
  }
});

/**
 * 5. Motor de Memoria Evolutiva (Análisis y Actualización de Contexto)
 */
app.post("/api/analyze-context", async (req, res) => {
  try {
    const { conversations, memories, logs, patterns, strategies, profile, currentState } = req.body;
    const name = profile?.userName || "Juan Francisco Cano";

    const summariesText = (conversations || [])
      .filter((c: any) => c.summary && c.summary.trim())
      .slice(0, 10)
      .map((c: any, idx: number) => `[SESIÓN ${idx + 1} - ${c.title}]:\n${c.summary}`)
      .join("\n\n---\n\n");

    const memoriesText = (memories || [])
      .slice(0, 15)
      .map((m: any) => `- [${m.category || "General"}] ${m.summary || m.text}`)
      .join("\n");

    const logsText = (logs || [])
      .slice(0, 10)
      .map((l: any) => `- ${new Date(l.createdAt).toLocaleDateString()}: Energía ${l.energy}/10, Motivación ${l.motivation}/10, Estrés ${l.stress}/10. Nota: ${l.note}`)
      .join("\n");

    const strategiesText = (strategies || [])
      .map((s: any) => `- [${s.status.toUpperCase()} / ${s.resultType.toUpperCase()}]: ${s.name} -> ${s.result}. Razón: ${s.reason || "N/A"}`)
      .join("\n");

    const patternsText = (patterns || [])
      .map((p: any) => `- [${p.type}]: ${p.description}`)
      .join("\n");

    const prompt = `Actúa como el Motor de Memoria Evolutiva de alto rendimiento para ${name}.
Tu objetivo es realizar un análisis transversal de TODO el historial acumulado en las 8 dimensiones de su sistema.

REGLA MAESTRA DEL MOTOR EVOLUTIVO:
Evalúa la trayectoria temporal: HISTORIA → CONTEXTO → EVENTOS → ESTADOS → TRANSICIONES → PATRONES → INTERPRETACIÓN → CONCLUSIÓN.
Diferencia rigurosamente:
1. CAPA SISTEMA: Reglas y leyes biológicas inmutables.
2. CAPA PERSONAL: Experiencias, decisiones y notas construidas por ${name}.
3. CAPA DERIVADA: Métricas, tendencias e hipótesis calculadas por la IA.

DATOS ACUMULADOS EN EL SISTEMA:
============================================================
RESÚMENES DE SESIONES PREVIAS (14 PUNTOS):
${summariesText || "Sin resúmenes de sesiones previas aún."}

NOTAS MENTALES Y VIVENCIAS:
${memoriesText || "Sin notas mentales."}

REGISTROS DE BIENESTAR:
${logsText || "Sin registros diarios."}

ESTRATEGIAS EVALUADAS (QUÉ FUNCIONÓ VS QUÉ NO):
${strategiesText || "Sin estrategias cargadas."}

PATRONES OBSERVADOS:
${patternsText || "Sin patrones previos."}
============================================================

GENERA UN INFORME EVOLUTIVO ESTRUCTURADO EN JSON CON EL SIGUIENTE ESQUEMA EXACTO:
{
  "overallTrend": "Síntesis narrativa (3-5 líneas) de la evolución psicológica, conductual y emocional observada en el período.",
  "axes": [
    {
      "axis": "seguridad",
      "label": "Seguridad Personal",
      "score": 6,
      "trend": "mejora",
      "delta": 2,
      "evidence": "Evidencia observable extraída de las vivencias o notas"
    },
    {
      "axis": "libertad",
      "label": "Libertad y Espontaneidad",
      "score": 4,
      "trend": "mejora",
      "delta": 1,
      "evidence": "Evidencia observable de soltura o de resistencia restante"
    },
    {
      "axis": "regulacion",
      "label": "Regulación Emocional",
      "score": 7,
      "trend": "estable",
      "delta": 0,
      "evidence": "Evidencia de manejo del estrés o de fatiga"
    },
    {
      "axis": "relaciones",
      "label": "Relaciones e Interacción",
      "score": 5,
      "trend": "mejora",
      "delta": 2,
      "evidence": "Evidencia de interacciones sociales y manejo de búsqueda de aprobación"
    }
  ],
  "contradictions": [
    {
      "previousBelief": "Creencia o hipótesis anterior",
      "newEvidence": "Nueva evidencia observada que la contradice o matiza",
      "resolution": "Resolución o principio integrado actual"
    }
  ],
  "novelDiscoveries": [
    "Descubrimiento o elemento nuevo identificado por primera vez en las vivencias"
  ],
  "recommendedActions": [
    {
      "type": "consolidar",
      "title": "Estrategia o hábito a consolidar",
      "detail": "Por qué mantenerlo y cómo protegerlo"
    },
    {
      "type": "revisar",
      "title": "Patrón o disparador a revisar",
      "detail": "Qué ajustar o neutralizar según la evidencia"
    },
    {
      "type": "investigar",
      "title": "Hipótesis a comprobar",
      "detail": "Qué observar en las próximas interacciones"
    }
  ],
  "activePrinciples": [
    "Principio 1 rector del sistema mental",
    "Principio 2"
  ]
}
`;

    const fallbackReport = {
      id: `ctx-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      overallTrend: `Evolución sostenida hacia mayor desinhibición social y enfoque productivo matutino en ${name}.`,
      axes: [
        { axis: "seguridad", label: "Seguridad Personal", score: 6, trend: "mejora", delta: 1, evidence: "Mayor confianza en interacciones sociales y toma de decisiones." },
        { axis: "libertad", label: "Libertad y Espontaneidad", score: 5, trend: "mejora", delta: 1, evidence: "Capacidad de actuar sin sobre-planificación excesiva." },
        { axis: "regulacion", label: "Regulación Emocional", score: 7, trend: "estable", delta: 0, evidence: "Manejo adecuado de momentos de fatiga aplicando pausas 52/17." },
        { axis: "relaciones", label: "Relaciones e Interacción", score: 6, trend: "mejora", delta: 2, evidence: "Interacción desinhibida reconociendo sesgos de aprobación." }
      ],
      contradictions: [
        {
          previousBelief: "La espontaneidad surge sin ninguna preparación",
          newEvidence: "El aislamiento mental previo de 5 minutos habilita la fluidez",
          resolution: "Preparar el estado basal facilita la desinhibición natural"
        }
      ],
      novelDiscoveries: [
        "Identificación de la atracción como disparador de búsqueda de validación inconsciente."
      ],
      recommendedActions: [
        {
          type: "consolidar",
          title: "Franja Dorada 07:00 a 12:00",
          detail: "Mantener protegida para tesis y tareas de alta demanda cognitiva."
        },
        {
          type: "revisar",
          title: "Búsqueda de Aprobación",
          detail: "Activar el principio 'Da igual' ante situaciones de atracción social."
        },
        {
          type: "investigar",
          title: "Micro-videos explicativos",
          detail: "Comprobar efectividad de grabaciones de 2 minutos sin editar."
        }
      ],
      activePrinciples: [
        "La duda solo en la reflexión, NUNCA en la acción.",
        "El valor personal no depende de la respuesta ajena.",
        "Política del Día No Cero para sostener identidad."
      ]
    };

    const geminiKey = getGeminiKey(req);
    const groqKey = getGroqKey(req);

    // 1. Google AI Studio (Gemini) como OPCIÓN PRINCIPAL
    if (geminiKey) {
      try {
        const text = await callGemini({
          apiKey: geminiKey,
          contents: prompt,
          responseMimeType: "application/json",
        });
        const parsed = cleanAndParseJSON(text, fallbackReport);
        return res.json({ id: `ctx-${Date.now()}`, generatedAt: new Date().toISOString(), ...parsed });
      } catch (geminiErr: any) {
        console.warn("[Analyze-Context] Fallo en Gemini Primario, recurriendo a Groq:", geminiErr.message);
      }
    }

    // 2. Groq Cloud AI como OPCIÓN SECUNDARIA (Respaldo)
    if (groqKey) {
      try {
        const content = await callGroqChat(
          [
            { role: "system", content: "Eres el motor de memoria evolutiva y metaanálisis neuroconductual. Responde estrictamente en formato JSON." },
            { role: "user", content: prompt }
          ],
          {
            apiKey: groqKey,
            model: getGroqModel(req),
            jsonMode: true,
            temperature: 0.2,
            max_tokens: 3000
          }
        );
        const parsed = cleanAndParseJSON(content, fallbackReport);
        return res.json({ id: `ctx-${Date.now()}`, generatedAt: new Date().toISOString(), ...parsed });
      } catch (groqErr: any) {
        console.warn("[Analyze-Context] Fallo también en Groq Secundario:", groqErr.message);
      }
    }

    return res.json(fallbackReport);
  } catch (error: any) {
    console.error("Error en /api/analyze-context:", error);
    res.status(500).json({ error: error.message || "Error al analizar contexto evolutivo" });
  }
});


// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  🚀 Servidor listo y corriendo:`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://127.0.0.1:${PORT}/\n`);
  });
}

startServer();
