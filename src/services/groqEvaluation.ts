/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const GROQ_MODELS = [
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B Versatile",
    description: "Recomendado. Máxima potencia, razonamiento confrontativo, adherencia a marcos y respuestas directas sin clichés.",
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
    description: "Ultra-rápido. Tareas breves, resúmenes ágiles y clasificación.",
    recommended: false,
  },
];

export const PRIMARY_GROQ_MODEL = "llama-3.3-70b-versatile";
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
}

/**
 * Valida una clave API realizando una consulta mínima de prueba.
 */
export async function testGroqKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: "La clave API no puede estar vacía." };
  }

  const trimmedKey = apiKey.trim();

  // 1. Intentar prueba a través de endpoint proxy del servidor
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
    // Si falla el servidor local, intentar llamada directa a la API de Groq
  }

  // 2. Llamada directa a Groq Cloud API
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
 * Limpia bloques de pensamiento <think>...</think> si el modelo de razonamiento los incluye,
 * incluso si el bloque quedó truncado sin etiqueta de cierre.
 */
export function cleanModelOutput(text: string): string {
  if (!text) return '';
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (cleaned.includes('<think>')) {
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, '').trim();
  }
  cleaned = cleaned.replace(/<\/think>/gi, '').trim();
  return cleaned;
}

/**
 * Envía una consulta conversacional a Groq AI (LPU Inference).
 * Conmuta automáticamente al modelo de respaldo si el principal no responde.
 */
export async function chatWithGroq(
  messages: GroqChatMessage[],
  options: GroqRequestOptions = {}
): Promise<string> {
  const apiKey = options.apiKey || getStoredGroqApiKey();
  const primaryModel = options.model || getStoredGroqModel() || PRIMARY_GROQ_MODEL;
  const fallbackModel = primaryModel === PRIMARY_GROQ_MODEL ? FALLBACK_GROQ_MODEL : PRIMARY_GROQ_MODEL;
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.max_tokens ?? 1200;

  if (!apiKey) {
    throw new Error("No se ha configurado la clave API de Groq (GROQ_API_KEY).");
  }

  // Optimización de tokens para respetar límites TPM
  let optimizedMessages = messages;
  if (messages.length > 7) {
    const sysMsg = messages.find(m => m.role === 'system');
    const recentMessages = messages.filter(m => m.role !== 'system').slice(-6);
    optimizedMessages = sysMsg ? [sysMsg, ...recentMessages] : recentMessages;
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
    return data.choices?.[0]?.message?.content || "";
  };

  // 1. Intentar con el modelo principal
  try {
    const raw = await doRequest(primaryModel);
    const cleaned = cleanModelOutput(raw);
    if (cleaned.length > 0) return cleaned;
    throw new Error(`El modelo (${primaryModel}) devolvió una respuesta vacía.`);
  } catch (primaryErr: any) {
    console.warn(`[Groq AI] Falló modelo ${primaryModel}. Conmutando a respaldo (${fallbackModel})...`, primaryErr);

    // 2. Fallback al modelo secundario
    try {
      const fallbackRaw = await doRequest(fallbackModel);
      const fallbackCleaned = cleanModelOutput(fallbackRaw);
      if (fallbackCleaned.length > 0) return fallbackCleaned;
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
  systemPrompt: string = "Eres un asistente de alta precisión."
): Promise<string> {
  return chatWithGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    { apiKey, model }
  );
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
    { jsonMode: true }
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
 * Resume una nota mental de forma concisa, contextual y dimensional con Groq AI.
 */
export async function summarizeMentalNoteWithGroq(
  noteText: string,
  existingNotes: { text: string; summary?: string; category?: string }[] = [],
  userName: string = "Juan"
): Promise<string> {
  const existingContext = (existingNotes || [])
    .slice(0, 8)
    .map((n) => `- ${n.summary || n.text}`)
    .join("\n");

  const prompt = `Actúa como el motor analítico de memoria evolutiva y síntesis de notas para ${userName}.
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

  return chatWithGroq(
    [
      { role: "system", content: "Eres un sintetizador de conocimiento neuroconductual conciso y preciso." },
      { role: "user", content: prompt },
    ],
    { temperature: 0.2, max_tokens: 300 }
  );
}

/**
 * Extrae los 4 ejes dimensionales (Seguridad, Libertad, Regulación, Relaciones)
 * con intensidad (-10 a +10) y evidencia a partir del resumen Markdown estructurado.
 */
export async function extractDimensionalAxesGroq(
  summaryText: string,
  userName: string = "Juan"
): Promise<{
  axes: Array<{
    axis: 'seguridad' | 'libertad' | 'regulacion' | 'relaciones';
    label: string;
    positive: string;
    negative: string;
    intensity: number;
    evidence: string;
  }>;
  dominantPattern: string;
  evolutionVsPrevious: 'mejora' | 'regresion' | 'estable' | 'nuevo';
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
  "evolutionVsPrevious": "mejora" | "regresion" | "estable" | "nuevo",
  "contradictions": ["Contradicción o tensión detectada en la narrativa"],
  "novelInsights": ["Elemento novedoso reportado por primera vez"]
}`;

  try {
    const raw = await chatWithGroq(
      [
        { role: "system", content: "Eres un analista neuroconductual de métricas dimensionales. Responde solo JSON." },
        { role: "user", content: prompt }
      ],
      { jsonMode: true, temperature: 0.1, max_tokens: 1000 }
    );
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Fallo al extraer ejes dimensionales en JSON, usando fallback:", err);
    return {
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
  }
}


