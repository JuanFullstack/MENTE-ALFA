import {
  detectarRamaYTags,
  podarFichasParaInferencia,
  formatearFichasInmutablesCompactas,
  construirHiloActivoTexto,
  buildRepairedSystemPrompt,
  ASSISTANT_PREFILL_TAG,
  parseRepairedTacticalOutput,
  consultarArbolPorRamaYNodo,
  obtenerHechoDosificadoSinRepetir,
  evaluarModoInteraccion,
  ModoInteraccionIA,
} from "../src/lib/baseContext";
import {
  clasificarFranjaHoraria,
  generarAuditoriaComoVamos,
  formatearAuditoriaParaPrompt,
} from "../src/lib/progressAuditor";
import { construirArbolDesdeDatos } from "../src/lib/storage";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PRIMARY_MODEL = "qwen/qwen3.8-27b";

function cleanThinkTags(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (cleaned.includes("<think>")) {
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, "").trim();
  }
  return cleaned.replace(/<\/think>/gi, "").trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      messages = [],
      memories = [],
      logs = [],
      strategies = [],
      conversations = [],
      previousSummaries = [],
      currentState,
      decisions = [],
      objetivosEstructurados = [],
      horaActualTexto,
      modoInteraccion,
      auditoriaComoVamosTexto,
      desgloseReporteTexto,
    } = req.body || {};

    const ultimoMensajeUsuario =
      (messages || [])
        .filter((m: any) => m.sender === "user" || m.role === "user")
        .slice(-1)[0]?.text || "";

    const { rama: ramaActiva, tags: tagsDetectados } = detectarRamaYTags(
      ultimoMensajeUsuario,
      messages || []
    );

    const arbol = construirArbolDesdeDatos(memories || [], conversations || [], strategies || []);
    let fichasPodadas = consultarArbolPorRamaYNodo(arbol, ramaActiva, tagsDetectados, 5);
    if (!fichasPodadas || fichasPodadas.length === 0) {
      fichasPodadas = podarFichasParaInferencia(
        memories || [],
        strategies || [],
        ramaActiva,
        tagsDetectados,
        5
      );
    }
    const fichasCompactasTexto = formatearFichasInmutablesCompactas(fichasPodadas, ramaActiva);

    const hiloRecienteTexto = construirHiloActivoTexto(
      messages || [],
      decisions || [],
      currentState,
      ramaActiva
    );

    const hechoDosificadoTexto = obtenerHechoDosificadoSinRepetir(
      messages || [],
      ultimoMensajeUsuario
    );

    const infoHora = clasificarFranjaHoraria();
    const horaActualTextoFinal = horaActualTexto || `${infoHora.horaExacta} hs (${infoHora.labelFranja})`;
    const modoInteraccionFinal: ModoInteraccionIA =
      modoInteraccion || evaluarModoInteraccion(ultimoMensajeUsuario, messages || []).modo;

    let auditoriaTextoFinal = auditoriaComoVamosTexto;
    if (!auditoriaTextoFinal && (objetivosEstructurados.length > 0 || logs.length > 0)) {
      const audObj = generarAuditoriaComoVamos(
        logs || [],
        objetivosEstructurados || [],
        memories || [],
        strategies || []
      );
      auditoriaTextoFinal = formatearAuditoriaParaPrompt(audObj);
    }

    const systemInstruction = buildRepairedSystemPrompt({
      ramaActiva,
      tagsDetectados,
      hiloRecienteTexto,
      fichasCompactasTexto,
      hechoDosificadoTexto,
      horaActualTexto: horaActualTextoFinal,
      modoInteraccion: modoInteraccionFinal,
      auditoriaComoVamosTexto: auditoriaTextoFinal,
      desgloseReporteTexto,
    });

    const headerKey = req.headers?.["x-groq-api-key"];
    const groqKey =
      (typeof headerKey === "string" && headerKey.trim()) ||
      process.env.GROQ_API_KEY ||
      process.env.VITE_GROQ_API_KEY;

    if (!groqKey) {
      return res.status(400).json({
        error: "No se encontró clave API de Groq configurada en el servidor ni en las cabeceras.",
      });
    }

    const recentMessages = (messages || []).slice(-5);
    const groqMessages = [
      { role: "system", content: systemInstruction },
      ...recentMessages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "assistant", content: ASSISTANT_PREFILL_TAG },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: groqMessages,
        temperature: 0.25,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || `Error en Groq API (${response.status})`,
      });
    }

    const data: any = await response.json();
    const rawContent = cleanThinkTags(data.choices?.[0]?.message?.content || "");
    const fullContent = rawContent.startsWith("<analisis_contextual>")
      ? rawContent
      : `${ASSISTANT_PREFILL_TAG} ${rawContent}`;

    const { formattedMessage, tacticalAnalysis } = parseRepairedTacticalOutput(
      fullContent,
      ramaActiva,
      true
    );

    return res.status(200).json({
      message: formattedMessage,
      tacticalAnalysis,
      energyLevel: 7,
    });
  } catch (error: any) {
    console.error("Error en api/chat serverless:", error);
    return res.status(500).json({ error: error.message || "Error procesando chat" });
  }
}
