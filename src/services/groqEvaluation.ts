/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FichaVivenciaInmutable, RamaTematica } from "../types";
import { detectarRamaYTags } from "../lib/baseContext";

export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const GROQ_MODELS = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B Versatile",
    description: "Recomendado para Consejo Táctico. Razonamiento contrastivo, adherencia a fichas inmutables y cero clichés.",
    recommended: true,
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen 3.6 27B",
    description: "Razonamiento profundo. Ideal para deducciones complejas y lógica.",
    recommended: false,
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B Instant",
    description: "Pipeline Asíncrono de Extracción. Ultra-rápido y económico para destilar las 5 variables de vivencias.",
    recommended: false,
  },
];

export const PRIMARY_GROQ_MODEL = "llama-3.3-70b-versatile";
export const EXTRACTION_GROQ_MODEL = "llama-3.1-8b-instant";
export const FALLBACK_GROQ_MODEL = "llama-3.1-8b-instant";
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GROQ_API_KEY = "";

export const DEFAULT_GEMINI_API_KEY = "";

/**
 * Obtiene la clave de Google AI Studio (Gemini) almacenada en el navegador o en variables Vite.
 */
export function getStoredGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("gemini_api_key");
    if (local && local.trim()) return local.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();
  return DEFAULT_GEMINI_API_KEY;
}

/**
 * Guarda la clave de Google AI Studio en localStorage.
 */
export function setStoredGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  }
}

/**
 * Valida una clave API de Google AI Studio realizando una consulta mínima de prueba.
 */
export async function testGeminiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: "La clave API de Google AI Studio no puede estar vacía." };
  }

  const trimmedKey = apiKey.trim();
  try {
    const srvRes = await fetch("/api/gemini/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: trimmedKey }),
    });

    const srvData = await srvRes.json().catch(() => ({}));
    if (srvRes.ok && srvData.success) {
      return { success: true, message: srvData.message || "¡Conexión exitosa con Google AI Studio (Gemini)!" };
    }
    return { success: false, message: srvData.message || `Error al validar clave (${srvRes.status})` };
  } catch (err: any) {
    return { success: false, message: err.message || "Error al conectar con el servidor para validar Google AI Studio." };
  }
}

/**
 * Obtiene la clave de Groq almacenada en el navegador o en variables de entorno Vite.
 */
export function getStoredGroqApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("groq_api_key");
    if (local && local.trim()) return local.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();
  return DEFAULT_GROQ_API_KEY;
}

/**
 * Guarda la clave de Groq en localStorage.
 */
export function setStoredGroqApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("groq_api_key", key.trim());
    } else {
      localStorage.removeItem("groq_api_key");
    }
  }
}

/**
 * Obtiene el modelo de Groq seleccionado por el usuario.
 */
export function getStoredGroqModel(): string {
  if (typeof window !== "undefined") {
    const model = localStorage.getItem("groq_model");
    if (model && model.trim()) return model.trim();
  }
  return DEFAULT_GROQ_MODEL;
}

/**
 * Guarda el modelo de Groq en localStorage.
 */
export function setStoredGroqModel(model: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("groq_model", model);
  }
}

export interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqRequestOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
  assistantPrefill?: string;
}

/**
 * Valida una clave API realizando una consulta mínima de prueba.
 */
export async function testGroqKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: "La clave API no puede estar vacía." };
  }

  const trimmedKey = apiKey.trim();

  try {
    const srvRes = await fetch("/api/groq/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: trimmedKey }),
    });

    const srvData = await srvRes.json().catch(() => ({}));
    if (srvRes.ok && srvData.success) {
      return { success: true, message: srvData.message || "¡Conexión exitosa con Groq Cloud API!" };
    }
    if (srvData.message) {
      return { success: false, message: srvData.message };
    }
  } catch {
    // Fallback a llamada directa
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
        temperature: 0.1,
      }),
    });

    if (response.status === 401) {
      return { success: false, message: "Clave API inválida o expirada (Error 401)." };
    }

    if (response.status === 429) {
      return { success: false, message: "Límite de tasa excedido en Groq (Error 429)." };
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errData?.error?.message || `Error de Groq API (${response.status}).`,
      };
    }

    return { success: true, message: "¡Conexión exitosa con Groq Cloud API!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error de conexión con Groq Cloud API.",
    };
  }
}

/**
 * Limpia bloques de pensamiento <think>...</think> si el modelo de razonamiento los incluye.
 */
export function cleanModelOutput(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (cleaned.includes("<think>")) {
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, "").trim();
  }
  cleaned = cleaned.replace(/<\/think>/gi, "").trim();
  return cleaned;
}

/**
 * FASE 3 & FASE 4: Envía consulta a Groq AI con:
 * - Temperatura reducida por defecto (0.25, rango 0.2-0.3) para apego estricto a datos.
 * - Poda de ventana activa (últimas 5 interacciones del hilo) para <1.000 tokens.
 * - Soporte de Prefill del Asistente (`assistantPrefill`) para iniciar directo en `<analisis_contextual>`.
 */
export async function chatWithGroq(
  messages: GroqChatMessage[],
  options: GroqRequestOptions = {}
): Promise<string> {
  const apiKey = options.apiKey || getStoredGroqApiKey();
  const primaryModel = options.model || getStoredGroqModel() || PRIMARY_GROQ_MODEL;
  const fallbackModel = primaryModel === PRIMARY_GROQ_MODEL ? FALLBACK_GROQ_MODEL : PRIMARY_GROQ_MODEL;
  // Fase 4: Fijar temperatura entre 0.2 y 0.3 (0.25 por defecto)
  const temperature = options.temperature ?? 0.25;
  const maxTokens = options.max_tokens ?? 900;

  if (!apiKey) {
    throw new Error("No se ha configurado la clave API de Groq (GROQ_API_KEY).");
  }

  // Poda del hilo activo: mantener System Prompt + últimas 5 interacciones
  let optimizedMessages = [...messages];
  if (optimizedMessages.length > 6) {
    const sysMsg = optimizedMessages.find((m) => m.role === "system");
    const recentMessages = optimizedMessages.filter((m) => m.role !== "system").slice(-5);
    optimizedMessages = sysMsg ? [sysMsg, ...recentMessages] : recentMessages;
  }

  // Fase 3: Inyección de Prefill del Asistente si no es jsonMode
  if (options.assistantPrefill && !options.jsonMode) {
    optimizedMessages = [
      ...optimizedMessages,
      { role: "assistant", content: options.assistantPrefill },
    ];
  }

  const doRequest = async (modelToUse: string) => {
    const payload: any = {
      model: modelToUse,
      messages: optimizedMessages,
      temperature,
      max_tokens: maxTokens,
    };

    if (options.jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("groq_api_key");
      }
      throw new Error("Clave API de Groq inválida o expirada (Error 401).");
    }

    if (response.status === 429) {
      throw new Error("Límite de peticiones excedido en Groq (Error 429). Por favor, intenta en unos segundos.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Error de Groq API (${response.status})`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    const cleaned = cleanModelOutput(rawContent);

    if (options.assistantPrefill && !options.jsonMode && cleaned && !cleaned.startsWith("<analisis_contextual>")) {
      return `${options.assistantPrefill} ${cleaned}`;
    }
    return cleaned;
  };

  try {
    const out = await doRequest(primaryModel);
    if (out.length > 0) return out;
    throw new Error(`El modelo (${primaryModel}) devolvió una respuesta vacía.`);
  } catch (primaryErr: any) {
    console.warn(`[Groq AI] Falló modelo ${primaryModel}. Conmutando a respaldo (${fallbackModel})...`, primaryErr);

    try {
      const fallbackOut = await doRequest(fallbackModel);
      if (fallbackOut.length > 0) return fallbackOut;
      throw new Error(`El modelo de respaldo (${fallbackModel}) devolvió respuesta vacía.`);
    } catch (fallbackErr: any) {
      console.error(`[Groq AI] Error crítico en ambos modelos (${primaryModel} y ${fallbackModel}):`, fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Consulta directa con prompt simple.
 */
export async function askGroq(
  prompt: string,
  apiKey?: string,
  model?: string,
  systemPrompt: string = "Eres un asistente táctico de alta precisión."
): Promise<string> {
  return chatWithGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    { apiKey, model, temperature: 0.25 }
  );
}

/**
 * FASE 1, 3 y 4: PIPELINE ASÍNCRONO DE EXTRACCIÓN DE VARIABLES INMUTABLES
 * Utiliza el modelo ultrarrápido `llama-3.1-8b-instant` a temperatura 0.1 para
 * descartar prosa narrativa/anécdotas y destilar únicamente las 5 variables
 * obligatorias (~60 a 90 tokens por ficha).
 */
export async function extractFichaVivenciaGroq(
  rawNarrativeText: string,
  ramaSugerida?: RamaTematica,
  sequenceIndex = 1
): Promise<FichaVivenciaInmutable> {
  const fechaHoy = new Date().toISOString().split("T")[0];
  const { rama: ramaDetectada, tags: tagsDetectados } = detectarRamaYTags(rawNarrativeText);
  const ramaInicial: RamaTematica = ramaSugerida || ramaDetectada;
  const fichaId = `VIV-${fechaHoy}-${String(sequenceIndex).padStart(2, "0")}`;

  const prompt = `Extrae una Ficha Episódica Inmutable de 60 a 90 tokens a partir del siguiente relato de vivencia.

REGLAS DE FILTRADO ESTRICTO:
1. DESCARTE DE RUIDO: Elimina toda prosa narrativa, anécdotas circunstanciales ("fui a la cocina, tomé un café..."), nombres irrelevantes y reflexiones abstractas.
2. CONSERVA SOLO LAS 5 VARIABLES OBLIGATORIAS:
   - detonante_exacto: El hecho puntual objetivo que disparó el conflicto, bloqueo o acción.
   - contexto_situacional: { momento (franja horaria y entorno), nivel_energia ("alto"|"medio"|"bajo"), factores_externos (interrupciones o presión) }.
   - reaccion_inicial: El sesgo o loop automático en el que se cayó (ej. perfeccionismo, multitarea, evitación, búsqueda de aprobación).
   - solucion_aplicada: La micro-acción real de quiebre ejecutada o acordada.
   - resultado: "exito" | "neutro" | "fallo".
3. CLASIFICACIÓN:
   - rama_id: "proyectos" | "vinculos" | "habitos" (Rama sugerida: "${ramaInicial}").
   - tags_mecanismo: Array de 1 a 3 etiquetas de mecanismo en snake_case con # (ej. ["#paralisis_perfeccionismo", "#fatiga_tarde", "#ambiguedad_externa", "#busqueda_aprobacion", "#ansiedad_examen", "#efecto_que_carajo", "#sobreestimulacion_digital"]).

RELATO DE ENTRADA:
"${rawNarrativeText.trim()}"

RESPONDE ESTRICTAMENTE EN JSON VÁLIDO CON ESTE ESQUEMA:
{
  "rama_id": "proyectos",
  "tags_mecanismo": ["#paralisis_perfeccionismo"],
  "contexto_situacional": {
    "momento": "Franja y entorno conciso",
    "nivel_energia": "alto",
    "factores_externos": "Presión o entorno"
  },
  "detonante_exacto": "Hecho objetivo disparador (máx 15 palabras)",
  "reaccion_inicial": "Loop automático observado (máx 12 palabras)",
  "solucion_aplicada": "Micro-acción de quiebre aplicada (máx 18 palabras)",
  "resultado": "exito"
}`;

  try {
    const rawJson = await chatWithGroq(
      [
        {
          role: "system",
          content: "Eres un extractor quirúrgico de variables conductuales estructuradas. Descartas toda prosa narrativa y respondes únicamente JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      {
        model: EXTRACTION_GROQ_MODEL,
        temperature: 0.1,
        max_tokens: 320,
        jsonMode: true,
      }
    );

    const parsed = JSON.parse(rawJson);
    const ramaValida: RamaTematica =
      parsed.rama_id === "proyectos" || parsed.rama_id === "vinculos" || parsed.rama_id === "habitos"
        ? parsed.rama_id
        : ramaInicial;

    const nivelEnergiaValido: "alto" | "medio" | "bajo" =
      parsed.contexto_situacional?.nivel_energia === "alto" ||
      parsed.contexto_situacional?.nivel_energia === "medio" ||
      parsed.contexto_situacional?.nivel_energia === "bajo"
        ? parsed.contexto_situacional.nivel_energia
        : "medio";

    const resultadoValido: "exito" | "neutro" | "fallo" =
      parsed.resultado === "exito" || parsed.resultado === "neutro" || parsed.resultado === "fallo"
        ? parsed.resultado
        : "exito";

    return {
      id: fichaId,
      fecha: fechaHoy,
      rama_id: ramaValida,
      tags_mecanismo:
        Array.isArray(parsed.tags_mecanismo) && parsed.tags_mecanismo.length > 0
          ? parsed.tags_mecanismo
          : tagsDetectados,
      contexto_situacional: {
        momento: parsed.contexto_situacional?.momento || "Horario operativo habitual",
        nivel_energia: nivelEnergiaValido,
        factores_externos: parsed.contexto_situacional?.factores_externos || "Sin factores externos críticos",
      },
      detonante_exacto: parsed.detonante_exacto || rawNarrativeText.slice(0, 120),
      reaccion_inicial: parsed.reaccion_inicial || "Fricción inicial ante la situación",
      solucion_aplicada: parsed.solucion_aplicada || rawNarrativeText.slice(0, 140),
      resultado: resultadoValido,
      inmutable: true,
    };
  } catch (err) {
    console.warn("[Groq Extraction Pipeline] Usando extracción determinista local:", err);
    return {
      id: fichaId,
      fecha: fechaHoy,
      rama_id: ramaInicial,
      tags_mecanismo: tagsDetectados,
      contexto_situacional: {
        momento: "Registro directo",
        nivel_energia: "medio",
        factores_externos: "Ingreso manual",
      },
      detonante_exacto: rawNarrativeText.slice(0, 120),
      reaccion_inicial: "Registrado para seguimiento de patrón",
      solucion_aplicada: rawNarrativeText.slice(0, 150),
      resultado: "exito",
      inmutable: true,
    };
  }
}

/**
 * Evaluación conceptual de respuestas con Groq.
 */
export async function evaluateWithGroq(
  documentTitle: string,
  projectName: string,
  unitName: string,
  questions: any[]
): Promise<string> {
  const systemPrompt = `Eres un evaluador académico y forense riguroso.
DOCUMENTO: ${documentTitle}
PROYECTO: ${projectName}
UNIDAD: ${unitName}
Evalúa las respuestas de los estudiantes garantizando precisión conceptual y aceptando equivalencias matemáticas/algebraicas en KaTeX/LaTeX. Responde en JSON con { "evaluations": [...] }.`;

  return chatWithGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(questions, null, 2) },
    ],
    { jsonMode: true, temperature: 0.2 }
  );
}

/**
 * Reescribe de forma autónoma secciones de Markdown aplicando feedback.
 */
export async function applyFeedbackWithGroq(
  fullMarkdown: string,
  pendingSections: any
): Promise<string> {
  const systemPrompt = `Eres un editor técnico experto en Markdown.
Recibes un documento Markdown y una lista de secciones con retroalimentación.
Reescribe las secciones indicadas aplicando el feedback y manteniendo el resto del documento exactamente intacto.`;

  return chatWithGroq([
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `DOCUMENTO ORIGINAL:\n${fullMarkdown}\n\nSECCIONES Y FEEDBACK:\n${JSON.stringify(pendingSections, null, 2)}`,
    },
  ]);
}

/**
 * Sintetiza una nota mental estructurándola bajo las 5 variables obligatorias
 * (Detonante, Contexto/Energía, Sesgo de reacción, Acción de quiebre y Resultado),
 * evitando la compresión destructiva de texto libre.
 */
export async function summarizeMentalNoteWithGroq(
  noteText: string,
  existingNotes: { text: string; summary?: string; category?: string }[] = [],
  _userName: string = "Juan"
): Promise<string> {
  const ficha = await extractFichaVivenciaGroq(noteText, undefined, existingNotes.length + 1);
  return JSON.stringify(ficha);
}

/**
 * Extrae los 4 ejes dimensionales (Seguridad, Libertad, Regulación, Relaciones)
 * con intensidad (-10 a +10) y evidencia a partir del resumen estructurado.
 */
export async function extractDimensionalAxesGroq(
  summaryText: string,
  userName: string = "Juan"
): Promise<{
  axes: Array<{
    axis: "seguridad" | "libertad" | "regulacion" | "relaciones";
    label: string;
    positive: string;
    negative: string;
    intensity: number;
    evidence: string;
  }>;
  dominantPattern: string;
  evolutionVsPrevious: "mejora" | "regresion" | "estable" | "nuevo";
  contradictions: string[];
  novelInsights: string[];
}> {
  const prompt = `Analiza el siguiente Resumen Estructurado de la vivencia/sesión de ${userName}.
Tu tarea es calificar los 4 Ejes Dimensionales y extraer contradicciones y novedades.

EJES A EVALUAR (Puntuación de -10 a +10, donde +10 es positivo máximo, 0 es neutro, -10 es negativo máximo):
1. EJE SEGURIDAD (axis: "seguridad"): Confianza, Autoestima independiente (+) vs Inseguridad, Duda constante, Dependencia (-).
2. EJE LIBERTAD (axis: "libertad"): Autenticidad, Espontaneidad, Aceptación (+) vs Forzar, Control rígido, Sobre-análisis (-).
3. EJE REGULACIÓN (axis: "regulacion"): Inteligencia emocional, Resiliencia, Paciencia (+) vs Reacciones reactivas, Ansiedad, Aceleración (-).
4. EJE RELACIONES (axis: "relaciones"): Interacción abierta, Empatía, Humor (+) vs Temor al rechazo, Victimización, Timidez (-).

RESUMEN A ANALIZAR:
---
${summaryText}
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
  "contradictions": ["Contradicción o tensión detectada en la narrativa"],
  "novelInsights": ["Elemento novedoso reportado por primera vez"]
}`;

  try {
    const raw = await chatWithGroq(
      [
        { role: "system", content: "Eres un analista neuroconductual de métricas dimensionales. Responde solo JSON." },
        { role: "user", content: prompt },
      ],
      { model: EXTRACTION_GROQ_MODEL, jsonMode: true, temperature: 0.1, max_tokens: 1000 }
    );
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Fallo al extraer ejes dimensionales en JSON, usando fallback:", err);
    return {
      axes: [
        { axis: "seguridad", label: "Seguridad Personal", positive: "Confianza", negative: "Inseguridad", intensity: 5, evidence: "Sesión procesada" },
        { axis: "libertad", label: "Libertad y Espontaneidad", positive: "Espontaneidad", negative: "Control", intensity: 4, evidence: "Sesión procesada" },
        { axis: "regulacion", label: "Regulación Emocional", positive: "Calma", negative: "Ansiedad", intensity: 6, evidence: "Sesión procesada" },
        { axis: "relaciones", label: "Relaciones e Interacción", positive: "Apertura", negative: "Búsqueda aprobación", intensity: 4, evidence: "Sesión procesada" },
      ],
      dominantPattern: "Interacción general",
      evolutionVsPrevious: "estable",
      contradictions: [],
      novelInsights: [],
    };
  }
}
