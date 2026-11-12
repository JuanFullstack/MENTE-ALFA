import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Send, 
  Plus, 
  Sparkles, 
  Trash2, 
  MessageSquare, 
  AlertCircle, 
  Brain, 
  Edit2, 
  Check, 
  X, 
  Eraser, 
  CloudUpload, 
  BookmarkCheck, 
  Loader2, 
  FileText, 
  CheckCircle2,
  Menu,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Target,
  ShieldCheck,
  Ban,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Compass,
  Layers,
  Zap,
  Flame,
  Scale,
  Database,
  BarChart3
} from "lucide-react";
import { 
  Conversation, 
  Message, 
  Memory, 
  DailyLog, 
  Pattern, 
  Strategy,
  CurrentState,
  Decision,
  DailyReport,
  DecisionSuggestion,
  StrategySuggestion,
  StateUpdateSuggestion,
  AnalysisMetadata,
  DimensionalAxis,
  ContextEvolutionReport,
  ObjetivoEstructurado,
  ChatChannel,
  DesgloseResumenSesion
} from "../types";
import { UserProfile, ZenDB, construirArbolDesdeDatos } from "../lib/storage";
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
} from "../lib/baseContext";
import {
  clasificarFranjaHoraria,
  generarAuditoriaComoVamos,
  formatearAuditoriaParaPrompt,
} from "../lib/progressAuditor";
import { 
  getStoredGroqApiKey, 
  getStoredGroqModel, 
  chatWithGroq, 
  extractDimensionalAxesGroq,
  extractFichaVivenciaGroq
} from "../services/groqEvaluation";
import {
  extraerReporteOperativo,
  ReporteOperativoDesglose,
  compilarCargasDelDiaSeparadas,
  verificarSiEsMetodoNuevo,
} from "../lib/reportExtractor";
import {
  getLocalTucumanIsoDate,
  getLocalTucumanTime,
  getLocalTucumanFullDescription,
  getTelemetriaTemporalCompleta,
  sincronizarLogsConMensajesChatA,
  compilarHistorialCompletoCargas,
} from "../lib/dateTimeUtils";
import { 
  upsertConversacionSummaryPB, 
  deleteConversacionPB,
  createMensajePB,
  deleteMensajesByConvPB,
  createEstrategiaPB,
  createMemoriaPB
} from "../services/pocketbaseService";

export const CONV_CARGA_DIARIA_ID = "conv-canal-cargas-diarias";
export const CONV_CONSULTAS_DEFAULT_ID = "conv-canal-consultas-principal";

interface ChatViewProps {
  conversations: Conversation[];
  messages: Message[];
  memories: Memory[];
  logs: DailyLog[];
  patterns: Pattern[];
  strategies: Strategy[];
  currentState: CurrentState;
  decisions: Decision[];
  dailyReports: DailyReport[];
  objetivosEstructurados?: ObjetivoEstructurado[];
  profile: UserProfile;
  activeChatChannel?: ChatChannel;
  onChangeChatChannel?: (channel: ChatChannel) => void;
  activeConversationId: string;
  onUpdateConversations: (convs: Conversation[]) => void;
  onUpdateMessages: (msgs: Message[]) => void;
  onUpdateMemories: (mems: Memory[]) => void;
  onUpdateCurrentState: (state: CurrentState) => void;
  onUpdateDecisions: (decs: Decision[]) => void;
  onUpdateStrategies: (strats: Strategy[]) => void;
  onUpdatePatterns?: (pats: Pattern[]) => void;
  onSaveNewStrategy?: (strat: Strategy) => void;
  onSaveNewPattern?: (pat: Pattern) => void;
  onSetActiveConvId: (id: string) => void;
  onOpenQuickLog?: () => void;
  onOpenAddMemory?: () => void;
  onSaveQuickLog?: (log: DailyLog) => void;
  onUpdateObjetivos?: (objs: ObjetivoEstructurado[]) => void;
  autoRequestReportTrigger?: number;
  autoLoadDataTrigger?: number;
}

export default function ChatView({
  conversations,
  messages,
  memories,
  logs,
  patterns,
  strategies,
  currentState,
  decisions,
  dailyReports,
  objetivosEstructurados = [],
  profile,
  activeChatChannel = "carga_datos",
  onChangeChatChannel,
  activeConversationId,
  onUpdateConversations,
  onUpdateMessages,
  onUpdateMemories,
  onUpdateCurrentState,
  onUpdateDecisions,
  onUpdateStrategies,
  onUpdatePatterns,
  onSaveNewStrategy,
  onSaveNewPattern,
  onSetActiveConvId,
  onOpenQuickLog,
  onOpenAddMemory,
  onSaveQuickLog,
  onUpdateObjetivos,
  autoRequestReportTrigger = 0,
  autoLoadDataTrigger = 0,
}: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Responsive Drawer states for mobile/tablet
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Summarize & Dimensional analysis state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryToast, setSummaryToast] = useState<{ 
    summary: string; 
    uploaded: boolean;
    analysisMetadata?: AnalysisMetadata | null;
  } | null>(null);

  // Evolutionary Context Analysis state
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false);
  const [contextReport, setContextReport] = useState<ContextEvolutionReport | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

  // Edit conversation title state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [guardandoEnArbolId, setGuardandoEnArbolId] = useState<string | null>(null);

  const limpiarFormatoPlano = (txt: string): string => {
    return txt
      .replace(/<analisis_contextual>[\s\S]*?<\/analisis_contextual>/gi, "")
      .replace(/<\/?consejo_tactico>/gi, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^[0-9]+\.\s*/gm, "")
      .replace(/^[-•]\s*/gm, "")
      .trim();
  };

  const handleConsolidarIntercambioEnArbol = async (assistantMsg: Message) => {
    setGuardandoEnArbolId(assistantMsg.id);
    try {
      const idx = currentMessages.findIndex((m) => m.id === assistantMsg.id);
      const userMsgPrevio = idx >= 0
        ? currentMessages.slice(0, idx).reverse().find((m) => m.sender === "user") || null
        : null;
      const relatoCompleto = userMsgPrevio
        ? `Situacion/Consulta: ${userMsgPrevio.text}\nRespuesta/Accion tactica: ${assistantMsg.text}`
        : assistantMsg.text;

      const ficha = await extractFichaVivenciaGroq(relatoCompleto);
      const nuevaMemoria: Memory = {
        id: ficha.id,
        text: `[${ficha.id} · ${ficha.rama_id.toUpperCase()}] Detonante: ${ficha.detonante_exacto} | Sesgo: ${ficha.reaccion_inicial} | Quiebre: ${ficha.solucion_aplicada}`,
        category: ficha.rama_id,
        createdAt: new Date().toISOString(),
        isApproved: true,
        summary: JSON.stringify(ficha),
        fichaInmutable: ficha,
        rama_id: ficha.rama_id,
        tags_mecanismo: ficha.tags_mecanismo,
        isImmutable: true,
      };

      const nuevasMemorias = [nuevaMemoria, ...memories];
      onUpdateMemories(nuevasMemorias);
      await createMemoriaPB(nuevaMemoria);

      if (userMsgPrevio) await createMensajePB(userMsgPrevio);
      await createMensajePB(assistantMsg);

      setErrorMsg(null);
      alert(`Vivencia consolidada en el Arbol (Rama: ${ficha.rama_id.toUpperCase()} | Nodo: ${ficha.tags_mecanismo.join(", ")})`);
    } catch (e) {
      console.error("Error al consolidar vivencia:", e);
      setErrorMsg("No se pudo consolidar la vivencia en el Árbol.");
    } finally {
      setGuardandoEnArbolId(null);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Estado para ocultar/mostrar el sub-encabezado en mobile y ahorrar espacio vertical
  const [isSubHeaderHidden, setIsSubHeaderHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mente_alfa_subheader_hidden") === "true";
    } catch {
      return false;
    }
  });

  const toggleSubHeader = () => {
    setIsSubHeaderHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mente_alfa_subheader_hidden", String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Estado para expandir aún más la caja de escritura cuando el usuario edita textos largos
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(false);

  // Auto-ajuste dinámico de altura del textarea en ambos chats (Chat A y Chat B)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxH = isInputExpanded ? 300 : 165;
    const minH = isInputExpanded ? 130 : 52;
    const targetH = Math.max(minH, Math.min(el.scrollHeight, maxH));
    el.style.height = `${targetH}px`;
  }, [inputText, isInputExpanded, activeChatChannel]);

  const esCanalCargaDatos = activeChatChannel === "carga_datos";

  // Separación estricta de conversaciones entre Chat A (Carga Diaria) y Chat B (Consultas)
  const conversacionesCanal = conversations.filter((c) =>
    esCanalCargaDatos
      ? c.channel === "carga_datos" || c.id === CONV_CARGA_DIARIA_ID
      : c.channel !== "carga_datos" && c.id !== CONV_CARGA_DIARIA_ID
  );

  // Asegurar que exista la conversación del canal activo
  useEffect(() => {
    if (esCanalCargaDatos) {
      const existeCarga = conversations.some(
        (c) => c.id === CONV_CARGA_DIARIA_ID || c.channel === "carga_datos"
      );
      if (!existeCarga) {
        const convCarga: Conversation = {
          id: CONV_CARGA_DIARIA_ID,
          title: "📥 Bitácora de Cargas Diarias (BD)",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          summary: null,
          isSummarized: false,
          channel: "carga_datos",
        };
        onUpdateConversations([convCarga, ...conversations]);
        onSetActiveConvId(CONV_CARGA_DIARIA_ID);
      } else if (
        activeConversationId !== CONV_CARGA_DIARIA_ID &&
        !conversations.find((c) => c.id === activeConversationId && c.channel === "carga_datos")
      ) {
        const target =
          conversations.find((c) => c.id === CONV_CARGA_DIARIA_ID || c.channel === "carga_datos") ||
          conversations[0];
        if (target) onSetActiveConvId(target.id);
      }
    } else {
      const convsConsulta = conversations.filter(
        (c) => c.id !== CONV_CARGA_DIARIA_ID && c.channel !== "carga_datos"
      );
      if (convsConsulta.length === 0) {
        const convCons: Conversation = {
          id: CONV_CONSULTAS_DEFAULT_ID,
          title: "💬 Sesión de Consultas",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          summary: null,
          isSummarized: false,
          channel: "consultas",
        };
        onUpdateConversations([convCons, ...conversations]);
        onSetActiveConvId(CONV_CONSULTAS_DEFAULT_ID);
      } else if (
        activeConversationId === CONV_CARGA_DIARIA_ID ||
        !convsConsulta.some((c) => c.id === activeConversationId)
      ) {
        onSetActiveConvId(convsConsulta[0].id);
      }
    }
  }, [activeChatChannel, conversations.length]);

  // Active conversation object según el canal activo
  const activeConv =
    conversacionesCanal.find((c) => c.id === activeConversationId) ||
    conversacionesCanal[0] ||
    conversations[0];

  const effectiveConvId =
    activeConv?.id ||
    (esCanalCargaDatos ? CONV_CARGA_DIARIA_ID : CONV_CONSULTAS_DEFAULT_ID);

  // Filter messages belonging strictly to the active channel's conversation
  const currentMessages = messages.filter(
    (m) => m.conversationId === effectiveConvId
  );

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isLoading]);

  // Recopilar resúmenes de conversaciones previas para la memoria continua de la IA
  const getPreviousSummaries = () => {
    return conversations
      .filter((c) => c.id !== effectiveConvId && c.isSummarized && c.summary)
      .map((c) => ({
        id: c.id,
        title: c.title,
        summary: c.summary,
        updatedAt: c.updatedAt,
      }));
  };

  // 1. [CREATE] Nueva conversación en el canal activo
  const handleCreateNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: esCanalCargaDatos ? "Nueva carga diaria" : "Nueva consulta",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: null,
      isSummarized: false,
      channel: activeChatChannel,
    };

    onUpdateConversations([newConv, ...conversations]);
    onSetActiveConvId(newConv.id);
    setIsLeftDrawerOpen(false);
  };

  // 2. [UPDATE / RENAME] Iniciar y guardar edición de título
  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = (convId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTitle.trim()) {
      setEditingConvId(null);
      return;
    }

    const trimmed = editingTitle.trim();
    const updated = conversations.map((c) => {
      if (c.id === convId) {
        return { ...c, title: trimmed, updatedAt: new Date().toISOString() };
      }
      return c;
    });

    onUpdateConversations(updated);

    const targetConv = conversations.find((c) => c.id === convId);
    if (targetConv && targetConv.isSummarized && targetConv.summary) {
      upsertConversacionSummaryPB(convId, trimmed, targetConv.summary).catch(console.warn);
    }

    setEditingConvId(null);
  };

  // 3. [DELETE] Eliminar conversación
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que deseas eliminar esta conversación?")) return;

    const updatedConvs = conversations.filter((c) => c.id !== convId);
    const updatedMsgs = messages.filter((m) => m.conversationId !== convId);

    onUpdateConversations(updatedConvs);
    onUpdateMessages(updatedMsgs);

    deleteConversacionPB(convId).catch(console.warn);
    deleteMensajesByConvPB(convId).catch(console.warn);

    if (activeConversationId === convId) {
      if (updatedConvs.length > 0) {
        onSetActiveConvId(updatedConvs[0].id);
      } else {
        handleCreateNewConversation();
      }
    }
  };

  // Helper para calcular horario, franja e impacto circadiano
  const computeTimeSlotAndRange = (msgs: Message[]) => {
    if (!msgs || msgs.length === 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const hour = now.getHours();
      let slot = "Franja Diurna";
      if (hour >= 7 && hour < 12) slot = "Franja Matutina de Máximo Rendimiento (07:00 a 12:00)";
      else if (hour >= 12 && hour < 15) slot = "Franja Mediodía / Post-Almuerzo (12:00 a 15:00)";
      else if (hour >= 15 && hour < 19) slot = "Franja Vespertina / Tarde (15:00 a 19:00)";
      else if (hour >= 19) slot = "Franja Nocturna (19:00 a 00:00)";
      else slot = "Franja Madrugada (00:00 a 07:00)";
      return {
        timeRange: `${timeStr}`,
        timeSlot: slot,
        date: now.toLocaleDateString(),
      };
    }

    const firstDate = new Date(msgs[0].createdAt || Date.now());
    const lastDate = new Date(msgs[msgs.length - 1].createdAt || Date.now());
    const startStr = firstDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endStr = lastDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const hour = firstDate.getHours();

    let slot = "Franja Diurna";
    if (hour >= 7 && hour < 12) slot = "Franja Matutina de Máximo Rendimiento (07:00 a 12:00)";
    else if (hour >= 12 && hour < 15) slot = "Franja Mediodía / Post-Almuerzo (12:00 a 15:00)";
    else if (hour >= 15 && hour < 19) slot = "Franja Vespertina / Tarde (15:00 a 19:00)";
    else if (hour >= 19) slot = "Franja Nocturna (19:00 a 00:00)";
    else slot = "Franja Madrugada (00:00 a 07:00)";

    return {
      timeRange: `${startStr} a ${endStr} (${firstDate.toLocaleDateString()})`,
      timeSlot: slot,
      date: firstDate.toLocaleDateString(),
    };
  };

  // 4. [CLEAR WINDOW] Limpiar ventana actual (vaciar mensajes del chat actual y limpiar de localStorage)
  const handleClearCurrentWindow = () => {
    if (currentMessages.length === 0) return;
    if (!window.confirm("¿Deseas limpiar todos los mensajes de esta ventana y reiniciar la charla? Se borrarán del almacenamiento local.")) return;

    const remainingMsgs = messages.filter((m) => m.conversationId !== effectiveConvId);
    onUpdateMessages(remainingMsgs);
    ZenDB.setMessages(remainingMsgs);
  };

  // 5. [GUARDAR RESUMEN DE SESIÓN EN CHAT B — CONSULTAS]
  // Desglosa la sesión (patrones, respuestas, emociones, autoimagen/primitivas, métodos),
  // envía todo a la Base de Datos y responde en el chat confirmando qué hizo.
  const handleSummarizeAndUpload = async () => {
    const userMsgs = currentMessages.filter((m) => m.sender === "user");
    if (userMsgs.length === 0) {
      setErrorMsg("Escribe algún mensaje en la consulta antes de guardar el resumen de sesión.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsSummarizing(true);
    setErrorMsg(null);
    setSummaryToast(null);

    const timeData = computeTimeSlotAndRange(currentMessages);
    const infoHora = clasificarFranjaHoraria();
    const textToSummarize = currentMessages
      .map((m) => `${m.sender === "user" ? profile.userName : profile.companionName}: ${m.text}`)
      .join("\n");

    let desgloseSesion: DesgloseResumenSesion = {
      fechaHora: `${infoHora.dateKey} · ${infoHora.horaExacta} hs (${infoHora.labelFranja})`,
      temaPrincipal: userMsgs[0]?.text.slice(0, 90) || "Sesión de consulta",
      emocionesDetectadas: ["Reflexión / Análisis"],
      autoimagenYSensacionesPrimitivas: "Evaluación del estado actual sin reactividad externa",
      detonanteContexto: `Consulta en ${timeData.timeSlot}`,
      respuestaUsuario: userMsgs[userMsgs.length - 1]?.text.slice(0, 120) || "Búsqueda de claridad contextual",
      controloEmocion: "si",
      patronesIdentificados: [`Contexto (${infoHora.horaExacta} hs) → Análisis de detonante y respuesta`],
      metodoReguladorDetectado: "Ninguno específico",
      esMetodoNuevo: false,
      guardadoEnBD: true,
    };

    let summaryText = "";

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();

      if (groqKey) {
        try {
          const promptJson = `Analiza y desglosa esta sesión de consulta de ${profile.userName} para guardarla en la Base de Datos.
Extrae estrictamente lo conversado en la sesión (NO inventes cosas de otros días):

CONVERSACIÓN:
${textToSummarize}

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "temaPrincipal": "De qué trató la consulta en 1 frase clara",
  "emocionesDetectadas": ["Emoción 1", "Emoción 2"],
  "autoimagenYSensacionesPrimitivas": "Cómo intervino la autoimagen o sensaciones primitivas (aceptación/rechazo) o 'No aplica'",
  "detonanteContexto": "Contexto (lugar, hora, actividad, tema difícil, algo nuevo, respuesta de otros, cansancio real)",
  "respuestaUsuario": "Cómo reaccionó o qué conclusión/acción tomó Juan",
  "controloEmocion": "si",
  "patronesIdentificados": ["Patrón 1: Contexto -> Emoción -> Respuesta"],
  "metodoReguladorDetectado": "Método mencionado (ej. Meditación, Yo Robot, otro nuevo) o 'Ninguno específico'",
  "resumenNarrativo": "Resumen ejecutivo de 3 a 4 líneas de lo analizado y acordado en la sesión"
}`;

          const rawJson = await chatWithGroq(
            [
              {
                role: "system",
                content:
                  "Eres el motor de desglose de sesiones hacia Base de Datos. Identificas patrones, respuestas, emociones, detonantes y métodos sin inventar datos. Responde solo JSON válido.",
              },
              { role: "user", content: promptJson },
            ],
            { apiKey: groqKey, model: groqModel, temperature: 0.15, max_tokens: 700, jsonMode: true }
          );

          const parsed = JSON.parse(rawJson);
          if (parsed && parsed.temaPrincipal) {
            const met = parsed.metodoReguladorDetectado || "Ninguno específico";
            const esNuevo = verificarSiEsMetodoNuevo(met, strategies);
            desgloseSesion = {
              fechaHora: `${infoHora.dateKey} · ${infoHora.horaExacta} hs (${infoHora.labelFranja})`,
              temaPrincipal: parsed.temaPrincipal,
              emocionesDetectadas: Array.isArray(parsed.emocionesDetectadas) && parsed.emocionesDetectadas.length > 0
                ? parsed.emocionesDetectadas
                : ["Análisis situacional"],
              autoimagenYSensacionesPrimitivas:
                parsed.autoimagenYSensacionesPrimitivas || "Sin activación crítica",
              detonanteContexto: parsed.detonanteContexto || `Consulta en ${infoHora.horaExacta} hs`,
              respuestaUsuario: parsed.respuestaUsuario || "Identificación consciente del contexto",
              controloEmocion:
                parsed.controloEmocion === "no" || parsed.controloEmocion === "parcial"
                  ? parsed.controloEmocion
                  : "si",
              patronesIdentificados:
                Array.isArray(parsed.patronesIdentificados) && parsed.patronesIdentificados.length > 0
                  ? parsed.patronesIdentificados
                  : [`${parsed.detonanteContexto || "Contexto"} → ${parsed.respuestaUsuario || "Respuesta"}`],
              metodoReguladorDetectado: met,
              esMetodoNuevo: esNuevo,
              guardadoEnBD: true,
            };
            summaryText = parsed.resumenNarrativo || `${parsed.temaPrincipal}. Patrones: ${desgloseSesion.patronesIdentificados.join("; ")}`;
          }
        } catch (groqErr) {
          console.warn("Usando desglose determinista de sesión:", groqErr);
        }
      }

      if (!summaryText) {
        summaryText = `Sesión de consulta (${desgloseSesion.fechaHora}): ${desgloseSesion.temaPrincipal}. Emociones: ${desgloseSesion.emocionesDetectadas.join(", ")}. Patrón: ${desgloseSesion.patronesIdentificados.join(" | ")}.`;
      }

      // 1. Si hay un método nuevo detectado en la sesión, guardarlo como Método en la Base de Datos
      if (
        desgloseSesion.esMetodoNuevo &&
        desgloseSesion.metodoReguladorDetectado &&
        desgloseSesion.metodoReguladorDetectado !== "Ninguno específico"
      ) {
        const nuevoMet: Strategy = {
          id: `strat-ses-${Date.now()}`,
          name: desgloseSesion.metodoReguladorDetectado,
          situation: desgloseSesion.detonanteContexto,
          result: desgloseSesion.respuestaUsuario,
          effectiveness: "alta",
          status: "recomendada",
          resultType: "positivo",
          reason: `Método regulador identificado y guardado desde Resumen de Sesión (${desgloseSesion.fechaHora}).`,
          createdAt: new Date().toISOString(),
          rama_id: "habitos",
        };
        onSaveNewStrategy?.(nuevoMet);
      }

      // 2. Guardar los patrones identificados en la Base de Datos
      for (const patTexto of desgloseSesion.patronesIdentificados) {
        const nuevoPat: Pattern = {
          id: `pat-ses-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: "asociación",
          description: `[Sesión ${infoHora.dateKey} ${infoHora.horaExacta} hs] ${patTexto} (Emociones: ${desgloseSesion.emocionesDetectadas.join(", ")} | Control: ${desgloseSesion.controloEmocion.toUpperCase()})`,
          createdAt: new Date().toISOString(),
        };
        onSaveNewPattern?.(nuevoPat);
      }

      // 3. Guardar memoria sintetizada de la sesión en Base de Datos
      const nuevaMemoriaSesion: Memory = {
        id: `mem-ses-${Date.now()}`,
        text: `[Resumen Sesión · ${desgloseSesion.fechaHora}] Tema: ${desgloseSesion.temaPrincipal} | Contexto/Detonante: ${desgloseSesion.detonanteContexto} | Emociones: ${desgloseSesion.emocionesDetectadas.join(", ")} | Respuesta: ${desgloseSesion.respuestaUsuario} | Método: ${desgloseSesion.metodoReguladorDetectado || "Ninguno"}`,
        category: "experiencias",
        createdAt: new Date().toISOString(),
        isApproved: true,
        summary: summaryText,
      };
      const nuevasMems = [nuevaMemoriaSesion, ...memories];
      onUpdateMemories(nuevasMems);
      await createMemoriaPB(nuevaMemoriaSesion);

      // 4. Actualizar la conversación y subir a PocketBase
      const currentTitle = activeConv?.title || "Sesión de Consulta";
      const updatedConvs = conversations.map((c) => {
        if (c.id === effectiveConvId) {
          return {
            ...c,
            summary: summaryText,
            isSummarized: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      onUpdateConversations(updatedConvs);
      ZenDB.setConversations(updatedConvs);

      const pbResult = await upsertConversacionSummaryPB(effectiveConvId, currentTitle, summaryText, null);

      // 5. Publicar mensaje de confirmación con el desglose directamente en el Chat B
      const textoConfirmacion = `✅ Resumen de Sesión desglosado y enviado a la Base de Datos (${desgloseSesion.fechaHora}).

• Tema analizado: ${desgloseSesion.temaPrincipal}
• Contexto / Detonante: ${desgloseSesion.detonanteContexto}
• Emociones identificadas: ${desgloseSesion.emocionesDetectadas.join(", ")}
• Autoimagen y Sensaciones Primitivas: ${desgloseSesion.autoimagenYSensacionesPrimitivas}
• Respuesta y Control Emocional: ${desgloseSesion.respuestaUsuario} (Control: ${desgloseSesion.controloEmocion.toUpperCase()})
• Patrones guardados en BD: ${desgloseSesion.patronesIdentificados.join(" | ")}
• Método regulador: ${desgloseSesion.metodoReguladorDetectado || "Ninguno específico"}${
        desgloseSesion.esMetodoNuevo ? " (✨ Guardado como NUEVO MÉTODO en tu catálogo)" : ""
      }`;

      const msgConfirmacionSesion: Message = {
        id: `m-ses-${Date.now()}`,
        conversationId: effectiveConvId,
        sender: "assistant",
        text: textoConfirmacion,
        createdAt: new Date().toISOString(),
        desgloseResumenSesion: {
          ...desgloseSesion,
          guardadoEnBD: pbResult.success || true,
        },
      };

      const msgsActualizados = [...messages, msgConfirmacionSesion];
      onUpdateMessages(msgsActualizados);
      ZenDB.setMessages(msgsActualizados);
      await createMensajePB(msgConfirmacionSesion);
    } catch (err: any) {
      console.error("Error al resumir sesión:", err);
      setErrorMsg("Error al desglosar y guardar el resumen de sesión.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // 5.1 [ANALIZAR CONTEXTO EVOLUTIVO] Ejecuta el meta-análisis transversal de las 8 colecciones
  const handleAnalyzeContext = async () => {
    setIsAnalyzingContext(true);
    setErrorMsg(null);

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (groqKey) {
        headers["x-groq-api-key"] = groqKey;
        headers["x-groq-model"] = groqModel;
      }

      const res = await fetch("/api/analyze-context", {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversations,
          memories,
          logs,
          patterns,
          strategies,
          profile,
          currentState,
        }),
      });

      if (res.ok) {
        const report: ContextEvolutionReport = await res.json();
        setContextReport(report);
        setIsContextModalOpen(true);
      } else {
        throw new Error(`Error en servidor (${res.status})`);
      }
    } catch (err: any) {
      console.error("Error al analizar contexto evolutivo:", err);
      setErrorMsg("Error al analizar contexto evolutivo. Verifica tu conexión.");
    } finally {
      setIsAnalyzingContext(false);
    }
  };

  // 6. Enviar mensaje según el Chat Activo:
  // - CHAT A (carga_datos): Siempre desglosa previamente en las 3 Variables Clave -> Envía a la Base de Datos -> Responde confirmando el envío y mostrando cómo lo desglosó.
  // - CHAT B (consultas): NO envía reportes diarios a la Base de Datos; evalúa suficiencia de contexto e indaga o responde sin plantillas genéricas.
  const handleSendMessage = async (
    e?: React.FormEvent,
    overrideOpts?: {
      customText?: string;
      forcedMode?: ModoInteraccionIA;
    }
  ) => {
    if (e) e.preventDefault();
    const rawToProcess = overrideOpts?.customText !== undefined ? overrideOpts.customText : inputText;
    if (!rawToProcess.trim() || isLoading) return;

    setErrorMsg(null);
    const userText = rawToProcess.trim();
    if (overrideOpts?.customText === undefined) {
      setInputText("");
    }

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      conversationId: effectiveConvId,
      sender: "user",
      text: userText,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    onUpdateMessages(updatedMessages);

    if (
      !esCanalCargaDatos &&
      activeConv &&
      (activeConv.title === "Nueva reflexión" ||
        activeConv.title === "Nueva consulta" ||
        activeConv.title.startsWith("Conversación"))
    ) {
      const summaryTitle = userText.slice(0, 36) + (userText.length > 36 ? "..." : "");
      const updatedConvs = conversations.map((c) =>
        c.id === effectiveConvId
          ? { ...c, title: summaryTitle, updatedAt: new Date().toISOString() }
          : c
      );
      onUpdateConversations(updatedConvs);
    }

    setIsLoading(true);

    try {
      const infoHora = clasificarFranjaHoraria();
      const horaActualTexto = `${infoHora.horaExacta} hs (${infoHora.labelFranja})`;

      // =====================================================================
      // FLUJO 1: CHAT A — CARGA DIARIA DE REPORTES (SIEMPRE VA A LA BASE DE DATOS)
      // =====================================================================
      if (esCanalCargaDatos || overrideOpts?.forcedMode === "carga_datos_momento") {
        // Paso 1: Desglosar previamente el reporte en las 3 Variables Clave + Contexto + Métodos
        const reporteOperativo = await extraerReporteOperativo(
          userText,
          horaActualTexto,
          objetivosEstructurados,
          true,
          strategies
        );

        // Paso 2: Enviar siempre el registro desglosado a la Base de Datos
        onSaveQuickLog?.(reporteOperativo.log);

        // Si detectó un nuevo método regulador, guardarlo automáticamente como Método en la BD
        if (reporteOperativo.nuevoMetodoParaGuardar) {
          onSaveNewStrategy?.(reporteOperativo.nuevoMetodoParaGuardar);
        }

        // Si detectó un patrón o factor contextual, registrarlo en Patrones de la BD
        if (
          reporteOperativo.desglose.seccionesInformadas?.patronObservado ||
          reporteOperativo.desglose.patronesContexto.factoresContextuales.length > 0
        ) {
          const descPatron =
            reporteOperativo.desglose.patronesContexto.patronDetectado ||
            reporteOperativo.desglose.camposExtraidosReales?.find((c) => c.categoria === "patron_observado")?.valor ||
            userText;
          onSaveNewPattern?.({
            id: `pat-carga-${Date.now()}`,
            type: "dato observado",
            description: descPatron,
            createdAt: new Date().toISOString(),
          });
        }

        // Paso 3: Responder confirmando el envío a la Base de Datos y mostrando cómo desglosó el envío
        const aiConfirmMsg: Message = {
          id: `m-${Date.now() + 1}`,
          conversationId: effectiveConvId,
          sender: "assistant",
          text: reporteOperativo.mensajeConfirmacionBD,
          createdAt: new Date().toISOString(),
          energyLevel: reporteOperativo.desglose.energia,
          desgloseReporte: reporteOperativo.desglose,
        };

        const finalMsgs = [...updatedMessages, aiConfirmMsg];
        onUpdateMessages(finalMsgs);
        createMensajePB(userMsg);
        createMensajePB(aiConfirmMsg);
        return;
      }

      // =====================================================================
      // FLUJO 2: CHAT B — CONSULTAS (NO GUARDA EN BD A LA PRIMERA)
      // =====================================================================
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();
      const previousSummaries = getPreviousSummaries();
      const activeThreadMsgs = updatedMessages.filter((m) => m.conversationId === effectiveConvId);

      const evalModo = evaluarModoInteraccion(userText, activeThreadMsgs);
      const modoInteraccion: ModoInteraccionIA = overrideOpts?.forcedMode || evalModo.modo;

      // Sincronizar logs con mensajes del canal de cargas para nunca perder reportes
      const logsSincronizados = sincronizarLogsConMensajesChatA(logs, updatedMessages);
      const auditoriaObj = generarAuditoriaComoVamos(logsSincronizados, objetivosEstructurados, memories, strategies);
      const historialCargasTexto = compilarHistorialCompletoCargas(logs, updatedMessages);
      const auditoriaComoVamosTexto = `${historialCargasTexto}\n\n${formatearAuditoriaParaPrompt(auditoriaObj)}`;

      let data: any = null;

      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (groqKey) {
          headers["x-groq-api-key"] = groqKey;
          headers["x-groq-model"] = groqModel;
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: activeThreadMsgs,
            memories: memories.filter((m) => m.isApproved),
            logs: logsSincronizados,
            patterns,
            strategies,
            currentState,
            decisions,
            dailyReports,
            previousSummaries,
            conversations: conversations.filter((c) => c.isSummarized && c.summary),
            objetivosEstructurados,
            horaActualTexto,
            modoInteraccion,
            auditoriaComoVamosTexto,
            desgloseReporteTexto: historialCargasTexto,
            baseContext: {
              userName: profile.userName,
              companionName: profile.companionName,
              notes: profile.notes,
            },
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.message && !resJson.detectedState?.tags?.includes("Configuración Pendiente")) {
            data = resJson;
          }
        }
      } catch (_srvErr) {
        // Fallback
      }

      if (!data || !data.message) {
        const { rama: ramaActiva, tags: tagsDetectados } = detectarRamaYTags(userText, activeThreadMsgs);

        const arbolLocal = construirArbolDesdeDatos(
          memories.filter((m) => m.isApproved),
          conversations,
          strategies
        );
        let fichasPodadas = consultarArbolPorRamaYNodo(arbolLocal, ramaActiva, tagsDetectados, 5);
        if (!fichasPodadas || fichasPodadas.length === 0) {
          fichasPodadas = podarFichasParaInferencia(
            memories.filter((m) => m.isApproved),
            strategies,
            ramaActiva,
            tagsDetectados,
            5
          );
        }

        const fichasCompactasTexto = formatearFichasInmutablesCompactas(fichasPodadas, ramaActiva);
        const hiloRecienteTexto = construirHiloActivoTexto(activeThreadMsgs, decisions, currentState, ramaActiva);

        const systemInstruction = buildRepairedSystemPrompt({
          ramaActiva,
          tagsDetectados,
          hiloRecienteTexto,
          fichasCompactasTexto,
          horaActualTexto,
          modoInteraccion,
          auditoriaComoVamosTexto,
          desgloseReporteTexto: historialCargasTexto,
          evaluacionContexto: evalModo.evaluacionContexto,
        });

        const convHistory = activeThreadMsgs
          .slice(-5)
          .map((m) => ({
            role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
            content: m.text,
          }));

        const groqResponse = await chatWithGroq(
          [
            { role: "system", content: systemInstruction },
            ...convHistory,
          ],
          {
            apiKey: groqKey,
            model: groqModel,
            jsonMode: false,
            temperature: 0.35,
            max_tokens: 900,
          }
        );

        const { formattedMessage, tacticalAnalysis } = parseRepairedTacticalOutput(
          groqResponse,
          ramaActiva,
          false
        );
        data = {
          message: formattedMessage,
          tacticalAnalysis,
          energyLevel: 7,
        };
      }

      const aiMsg: Message = {
        id: `m-${Date.now() + 1}`,
        conversationId: effectiveConvId,
        sender: "assistant",
        text: data?.message || "He procesado tu consulta.",
        createdAt: new Date().toISOString(),
        energyLevel: data?.energyLevel,
        tacticalAnalysis: data?.tacticalAnalysis,
        desgloseReporte: null,
      };

      onUpdateMessages([...updatedMessages, aiMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMsg("Error al comunicar con Groq AI. Verifica tu conexión o clave en Configuración.");

      const fallbackAiMsg: Message = {
        id: `m-${Date.now() + 1}`,
        conversationId: effectiveConvId,
        sender: "assistant",
        text: `Recibí tu mensaje: "${userText}". Para darte una respuesta precisa sin asumir nada, contame brevemente qué estabas haciendo y en qué contexto surgió.`,
        createdAt: new Date().toISOString(),
      };
      onUpdateMessages([...updatedMessages, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Botón 1: Cargar Información en diferentes momentos del día (Optimizado Mobile)
  const handleBotonCargarInformacion = () => {
    if (isLoading) return;
    if (inputText.trim().length > 0) {
      handleSendMessage(undefined, {
        forcedMode: "carga_datos_momento",
      });
    } else {
      onOpenQuickLog?.();
    }
  };

  // Botón 2: Pedir Reporte con Consejos (basado en las cargas del día + psicología)
  const handleBotonPedirReporteConConsejos = () => {
    if (isLoading) return;
    const textoUsuarioActual = inputText.trim();
    if (textoUsuarioActual.length > 0) {
      setInputText("");
      handleSendMessage(undefined, {
        customText: `${textoUsuarioActual}\n\n[Solicitud: Con esta nueva carga, dame el Reporte Integral separando mis Datos Operativos del Día vs mi Aspecto Psicológico, y el Consejo Táctico por bloques para ahora.]`,
        forcedMode: "carga_datos_momento",
      });
      return;
    }

    handleSendMessage(undefined, {
      customText:
        "📊 Pedir Reporte con Consejos: Analizá por separado mis cargas de datos operativos de hoy (horarios, avances y pendientes) vs mi aspecto psicológico (estado, fricciones y métodos que me funcionaron), y dame el consejo táctico por bloques para esta franja.",
      forcedMode: "reporte_con_consejos",
    });
  };

  // Disparador automático cuando se pide Reporte + Consejos desde el botón superior
  const lastTriggerRef = useRef<number>(autoRequestReportTrigger);
  useEffect(() => {
    if (autoRequestReportTrigger > 0 && autoRequestReportTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = autoRequestReportTrigger;
      handleBotonPedirReporteConConsejos();
    }
  }, [autoRequestReportTrigger]);

  // Disparador automático cuando se toca "Cargar" desde el botón superior
  const lastLoadTriggerRef = useRef<number>(autoLoadDataTrigger);
  useEffect(() => {
    if (autoLoadDataTrigger > 0 && autoLoadDataTrigger !== lastLoadTriggerRef.current) {
      lastLoadTriggerRef.current = autoLoadDataTrigger;
      handleBotonCargarInformacion();
    }
  }, [autoLoadDataTrigger]);

  const hoyIso = getLocalTucumanIsoDate();
  // Mostrar primero las cargas más recientes para reflejar el estado actual y no quedarse pegado a la primera hora.
  // Sincroniza logs con mensajes del canal de cargas para que las píldoras siempre reflejen la jornada de Tucumán.
  const cargasDeHoy = useMemo(() => {
    const logsSincronizados = sincronizarLogsConMensajesChatA(logs, messages);
    return logsSincronizados
      .filter((l) => (l.dateKey || getLocalTucumanIsoDate(l.createdAt)) === hoyIso)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, messages, hoyIso]);

  // Aceptar sugerencia de decisión de la IA
  const handleAcceptDecision = (decisionSug: DecisionSuggestion, msgId: string) => {
    const newDec: Decision = {
      id: `dec-${Date.now()}`,
      date: new Date().toISOString(),
      decision: decisionSug.decision,
      reason: decisionSug.reason,
      status: decisionSug.status || "en prueba",
      reviewDate: decisionSug.reviewDate,
    };
    onUpdateDecisions([newDec, ...decisions]);
    onUpdateMessages(
      messages.map((m) =>
        m.id === msgId
          ? { ...m, suggestions: { ...m.suggestions, decision: null } }
          : m
      )
    );
  };

  // Aceptar sugerencia de estrategia de la IA
  const handleAcceptStrategy = (stratSug: StrategySuggestion, msgId: string) => {
    const newStrat: Strategy = {
      id: `strat-${Date.now()}`,
      name: stratSug.name,
      situation: stratSug.situation,
      result: stratSug.result,
      effectiveness: stratSug.effectiveness || "alta",
      status: stratSug.status || "recomendada",
      resultType: stratSug.resultType || "positivo",
      reason: stratSug.reason || "",
      createdAt: new Date().toISOString(),
    };
    onUpdateStrategies([newStrat, ...strategies]);
    createEstrategiaPB(newStrat).catch(console.warn);
    onUpdateMessages(
      messages.map((m) =>
        m.id === msgId
          ? { ...m, suggestions: { ...m.suggestions, strategy: null } }
          : m
      )
    );
  };

  // Aceptar sugerencia de actualización de estado
  const handleAcceptStateUpdate = (stateSug: StateUpdateSuggestion, msgId: string) => {
    const updatedGoals = stateSug.newGoal 
      ? [...currentState.activeGoals, stateSug.newGoal] 
      : currentState.activeGoals;
    
    let updatedProblems = stateSug.newProblem 
      ? [...currentState.openProblems, stateSug.newProblem] 
      : currentState.openProblems;
      
    if (stateSug.resolvedProblem) {
      updatedProblems = updatedProblems.filter((p) => p !== stateSug.resolvedProblem);
    }

    const updatedPending = stateSug.newPendingTask
      ? [...currentState.pendingTasks, stateSug.newPendingTask]
      : currentState.pendingTasks;

    onUpdateCurrentState({
      ...currentState,
      activeGoals: updatedGoals,
      openProblems: updatedProblems,
      pendingTasks: updatedPending,
      updatedAt: new Date().toISOString(),
    });

    onUpdateMessages(
      messages.map((m) =>
        m.id === msgId
          ? { ...m, suggestions: { ...m.suggestions, stateUpdate: null } }
          : m
      )
    );
  };

  const getFormattedDate = () => {
    const d = new Date();
    const dia = d.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Tucuman", day: "numeric" });
    const mes = d.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Tucuman", month: "long" }).toUpperCase();
    return `HOY, ${dia} DE ${mes}`;
  };

  // Escuchar eventos de los botones en ícono de la barra superior (TopNavbar)
  useEffect(() => {
    const onToggleLeft = () => setIsLeftDrawerOpen((prev) => !prev);
    const onToggleRight = () => setIsRightDrawerOpen((prev) => !prev);
    const onClearChat = () => handleClearCurrentWindow();

    window.addEventListener("mente-alfa:toggle-left-drawer", onToggleLeft);
    window.addEventListener("mente-alfa:toggle-right-drawer", onToggleRight);
    window.addEventListener("mente-alfa:clear-chat", onClearChat);
    return () => {
      window.removeEventListener("mente-alfa:toggle-left-drawer", onToggleLeft);
      window.removeEventListener("mente-alfa:toggle-right-drawer", onToggleRight);
      window.removeEventListener("mente-alfa:clear-chat", onClearChat);
    };
  }, [effectiveConvId, messages.length]);

  const primaryMemory = memories[0] || {
    text: "Prefiere trabajar sin música cuando realiza tareas analíticas. Se siente más productivo por la mañana (07:00 a 12:00).",
    category: "preferencias",
  };

  // Reusable Left Conversations Panel Content
  const renderConversationsList = () => (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D6]/60">
        <h2 className="text-[11px] font-bold text-[#A69D91] uppercase tracking-wider">
          {esCanalCargaDatos ? "HISTORIAL CARGA DIARIA" : "SESIONES DE CONSULTA"}
        </h2>
        <button
          onClick={handleCreateNewConversation}
          className="p-1.5 rounded-xl bg-[#8BA888]/15 hover:bg-[#8BA888]/25 text-[#6D856B] transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
          title="Nueva conversación"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nueva</span>
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {conversacionesCanal.map((conv) => {
          const isActive = conv.id === effectiveConvId;
          const msgCount = messages.filter((m) => m.conversationId === conv.id).length;
          const isEditing = editingConvId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => {
                if (!isEditing) {
                  onSetActiveConvId(conv.id);
                  setIsLeftDrawerOpen(false);
                }
              }}
              className={`p-3 rounded-2xl cursor-pointer transition text-left relative group border ${
                isActive
                  ? "bg-white border-[#EAE2D6] shadow-sm ring-1 ring-[#8BA888]/30"
                  : "hover:bg-[#F4EFE6] border-transparent"
              }`}
            >
              {isEditing ? (
                <form
                  onSubmit={(e) => handleSaveRename(conv.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    autoFocus
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-[#8BA888] rounded-lg bg-white outline-none text-[#2D332D]"
                  />
                  <button
                    type="submit"
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"
                    title="Guardar"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingConvId(null)}
                    className="p-1 text-neutral-400 hover:bg-neutral-100 rounded-md"
                    title="Cancelar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className={`text-xs font-bold leading-snug truncate flex-1 ${
                      isActive ? "text-[#2D332D]" : "text-[#5A534D]"
                    }`}>
                      {conv.title}
                    </h3>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(conv, e)}
                        className="p-1 text-[#7A7167] hover:text-[#2D332D] hover:bg-[#EAE2D6] rounded-md transition"
                        title="Renombrar conversación"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="p-1 text-[#7A7167] hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Eliminar conversación"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-[#A69D91] font-medium">
                      {msgCount} mensajes
                    </span>
                    {esCanalCargaDatos ? (
                      <span className="text-[9px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <CloudUpload className="h-2.5 w-2.5 text-sky-700" />
                        Directo a BD
                      </span>
                    ) : conv.isSummarized ? (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <BookmarkCheck className="h-2.5 w-2.5 text-emerald-600" />
                        Resumido en BD
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#A69D91] italic">
                        Sin guardar en BD
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div 
        onClick={onOpenQuickLog}
        className="mt-auto bg-[#F5F1E8] border border-[#EAE2D6] rounded-2xl p-3 space-y-2 cursor-pointer hover:bg-[#ECE6DA] transition group shrink-0"
      >
        <span className="text-[10px] font-bold text-[#7A7167] uppercase tracking-wider block">
          CARGA RÁPIDA CON SLIDERS
        </span>
        <div className="flex items-end justify-between h-10 px-2 pt-1">
          <div className="w-3.5 bg-[#8BA888] rounded-t-md h-4 transition-all group-hover:h-5" />
          <div className="w-3.5 bg-[#8BA888] rounded-t-md h-7 transition-all group-hover:h-8" />
          <div className="w-3.5 bg-[#D98E73] rounded-t-md h-9 transition-all" title="Pico de estrés" />
          <div className="w-3.5 bg-[#8BA888] rounded-t-md h-6 transition-all group-hover:h-7" />
          <div className="w-3.5 bg-[#8BA888] rounded-t-md h-3.5 transition-all group-hover:h-4" />
        </div>
      </div>
    </div>
  );

  // Reusable Right Context Panel Content (5 Layers)
  const renderContextPanel = () => (
    <div className="space-y-5 flex flex-col h-full justify-between">
      <div className="space-y-4 overflow-y-auto pr-1">
        
        {/* Capa B: Estado Actual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-[#A69D91] uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[#8BA888]" />
              ESTADO ACTUAL
            </h2>
            <span className="text-[9px] text-[#A69D91] font-semibold">Capa B</span>
          </div>

          <div className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-xl p-3 space-y-2 text-xs shadow-2xs">
            <div>
              <span className="text-[9px] font-bold text-[#6D856B] uppercase tracking-wider block">
                Objetivo Activo
              </span>
              <p className="text-xs text-[#2D332D] font-semibold mt-0.5">
                {currentState?.activeGoals?.[0] || "Sostener franja matutina 07:00 a 12:00"}
              </p>
            </div>
            {currentState?.openProblems?.[0] && (
              <div className="pt-1.5 border-t border-[#EAE2D6]/60">
                <span className="text-[9px] font-bold text-[#D98E73] uppercase tracking-wider block">
                  Problema Abierto
                </span>
                <p className="text-[11px] text-[#7A7167] mt-0.5">
                  {currentState.openProblems[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Capa D: Decisiones Clave */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-[#A69D91] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#6D856B]" />
              DECISIONES ACORDADAS
            </h2>
            <span className="text-[9px] text-[#A69D91] font-semibold">Capa D</span>
          </div>

          <div className="space-y-1.5">
            {decisions.slice(0, 2).map((dec) => (
              <div key={dec.id} className="bg-[#FBF9F4] border-l-3 border-l-[#8BA888] border border-[#EAE2D6] rounded-xl p-2.5 space-y-1 text-xs shadow-2xs">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold text-[#6D856B] uppercase">{dec.status}</span>
                  <span className="text-[#A69D91]">{new Date(dec.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-bold text-[#2D332D] leading-snug">{dec.decision}</p>
                <p className="text-[10px] text-[#7A7167] leading-tight">{dec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Capa E: Qué Funcionó vs Qué NO Funcionó */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-[#A69D91] uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-[#D98E73]" />
              ESTRATEGIAS CONOCIDAS
            </h2>
            <span className="text-[9px] text-[#A69D91] font-semibold">Capa E</span>
          </div>

          {/* Positivas */}
          {strategies.filter((s) => s.resultType === 'positivo' || s.status === 'recomendada').slice(0, 1).map((s) => (
            <div key={s.id} className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-1 text-xs text-emerald-950 shadow-2xs">
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 uppercase">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                FUNCIONÓ (Recomendada)
              </div>
              <p className="font-bold text-xs">{s.name}</p>
              <p className="text-[10px] text-emerald-800 leading-snug">{s.result}</p>
            </div>
          ))}

          {/* Negativas / Descartadas */}
          {strategies.filter((s) => s.resultType === 'negativo' || s.status === 'descartada').slice(0, 1).map((s) => (
            <div key={s.id} className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 space-y-1 text-xs text-rose-950 shadow-2xs">
              <div className="flex items-center gap-1 text-[9px] font-bold text-rose-700 uppercase">
                <Ban className="h-3 w-3 text-rose-600" />
                DESCARTADA (No repetir)
              </div>
              <p className="font-bold text-xs">{s.name}</p>
              <p className="text-[10px] text-rose-800 leading-snug">{s.reason || s.result}</p>
            </div>
          ))}
        </div>

        {/* Resumen de Charla si existe */}
        {activeConv?.summary && (
          <div className="space-y-1.5 pt-1">
            <h2 className="text-[11px] font-bold text-[#A69D91] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#8BA888]" />
              RESUMEN DE ESTA CHARLA
            </h2>
            <div className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-xl p-2.5 text-[11px] text-[#4A443F] leading-relaxed font-medium">
              {activeConv.summary}
            </div>
          </div>
        )}

      </div>

      <div className="pt-2 border-t border-[#EAE2D6] shrink-0">
        <button
          onClick={() => {
            if (onOpenAddMemory) onOpenAddMemory();
            setIsRightDrawerOpen(false);
          }}
          className="w-full border-2 border-dashed border-[#DCD5C9] hover:border-[#7D9B7A] bg-transparent hover:bg-white text-[#7A7167] hover:text-[#2D332D] py-2 px-3 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar Nota de Memoria
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#FDFBF7] font-sans relative">
      
      {/* Modal Preview of Generated Summary with Dimensional Axes */}
      {summaryToast && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FDFBF7] border border-[#EAE2D6] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D332D]">Resumen de 14 Puntos y Ejes Guardados</h3>
                  <p className="text-[11px] text-[#7A7167]">
                    {summaryToast.uploaded ? "Sincronizado con PocketBase y LocalStorage." : "Guardado en almacenamiento local."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSummaryToast(null)}
                className="p-1.5 rounded-xl hover:bg-[#EAE2D6] text-[#7A7167] hover:text-[#2D332D] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dimensional Badges if available */}
            {summaryToast.analysisMetadata?.axes && summaryToast.analysisMetadata.axes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F5F2EB] p-3 rounded-2xl border border-[#EAE2D6]">
                {summaryToast.analysisMetadata.axes.map((ax, i) => {
                  const isPositive = ax.intensity >= 0;
                  return (
                    <div key={i} className="bg-white p-2 rounded-xl border border-[#EAE2D6]/80 text-center space-y-1 shadow-2xs">
                      <div className="text-[10px] font-bold text-[#7A7167] uppercase truncate">{ax.label}</div>
                      <div className={`text-xs font-black ${isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isPositive ? `+${ax.intensity}` : ax.intensity} / 10
                      </div>
                      <div className="text-[9px] text-[#A69D91] truncate font-medium">
                        {isPositive ? ax.positive : ax.negative}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 bg-white border border-[#EAE2D6] rounded-2xl p-4 text-xs text-[#2D332D] leading-relaxed whitespace-pre-wrap font-medium">
              {summaryToast.summary}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summaryToast.summary);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#7A7167] bg-white border border-[#EAE2D6] hover:bg-[#F9F6F1] rounded-xl transition cursor-pointer"
              >
                Copiar Resumen
              </button>
              <button
                onClick={() => setSummaryToast(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#8BA888] hover:bg-[#6D856B] rounded-xl transition shadow-2xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Context Evolution Report (Motor de Memoria Evolutiva) */}
      {isContextModalOpen && contextReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#FDFBF7] border border-[#EAE2D6] w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Compass className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D332D]">Motor de Contexto Evolutivo</h3>
                  <p className="text-xs text-[#7A7167]">
                    Meta-análisis transversal de las 8 dimensiones y trayectoria de {profile.userName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsContextModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#EAE2D6] text-[#7A7167] hover:text-[#2D332D] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-5">
              
              {/* 1. Síntesis Global */}
              <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8BA888] uppercase tracking-wider">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trayectoria y Evolución Observada</span>
                </div>
                <p className="text-xs sm:text-sm text-[#2D332D] leading-relaxed font-medium">
                  {contextReport.overallTrend}
                </p>
              </div>

              {/* 2. Los 4 Ejes Dimensionales */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-amber-700" />
                  <span>Estado Dimensional Actual (Ejes Biológicos y Conductuales)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contextReport.axes?.map((ax, idx) => {
                    const normalized = Math.min(Math.max(ax.score, -10), 10);
                    const percentage = ((normalized + 10) / 20) * 100;
                    const isPositive = normalized >= 0;
                    return (
                      <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#EAE2D6] space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2D332D]">{ax.label}</span>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                            isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isPositive ? `+${normalized}` : normalized} / 10
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-[#F0EBE1] h-2 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              isPositive ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#7A7167] leading-relaxed italic">
                          "{ax.evidence}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Contradicciones y Tensiones Resueltas */}
              {contextReport.contradictions && contextReport.contradictions.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Zap className="h-4 w-4 text-amber-700" />
                    <span>Contradicciones Identificadas y Resueltas</span>
                  </div>
                  <div className="space-y-2">
                    {contextReport.contradictions.map((c, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-amber-100 text-xs space-y-1">
                        <div className="text-amber-950"><strong>Antes:</strong> {c.previousBelief}</div>
                        <div className="text-emerald-900"><strong>Nueva Evidencia:</strong> {c.newEvidence}</div>
                        <div className="text-amber-800 font-semibold pt-0.5 border-t border-amber-50">
                          <strong>Resolución:</strong> {c.resolution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Descubrimientos Novedosos */}
              {contextReport.novelDiscoveries && contextReport.novelDiscoveries.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    <span>Novedades y Descubrimientos Claves</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {contextReport.novelDiscoveries.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. Acciones Recomendadas */}
              {contextReport.recommendedActions && contextReport.recommendedActions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider">
                    Directrices Operativas Recomendadas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {contextReport.recommendedActions.map((act, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-[#EAE2D6] space-y-1 shadow-2xs">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          act.type === 'consolidar' ? 'bg-emerald-100 text-emerald-800' :
                          act.type === 'revisar' ? 'bg-amber-100 text-amber-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {act.type}
                        </span>
                        <div className="text-xs font-bold text-[#2D332D]">{act.title}</div>
                        <div className="text-[11px] text-[#7A7167] leading-relaxed">{act.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-[#EAE2D6]">
              <button
                onClick={() => setIsContextModalOpen(false)}
                className="px-5 py-2 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition"
              >
                Cerrar Informe
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP LEFT COLUMN: CONVERSATIONS (Hidden on < lg)
          ======================================================== */}
      <aside className="hidden lg:flex w-64 xl:w-72 border-r border-[#EAE2D6] flex-col justify-between p-4 xl:p-5 bg-[#FDFBF7] shrink-0 overflow-y-auto">
        {renderConversationsList()}
      </aside>

      {/* ========================================================
          MOBILE/TABLET LEFT DRAWER (Slide-over)
          ======================================================== */}
      {isLeftDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsLeftDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#FDFBF7] h-full shadow-2xl p-4 flex flex-col z-10 border-r border-[#EAE2D6]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE2D6]">
              <span className="text-xs font-bold text-[#2D332D]">Panel de Conversaciones</span>
              <button 
                onClick={() => setIsLeftDrawerOpen(false)}
                className="p-1 text-[#7A7167] hover:text-[#2D332D] rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderConversationsList()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MIDDLE COLUMN: ACTIVE CHAT, ADAPTIVE HEADER & INPUT
          ======================================================== */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFBF7] px-3 sm:px-6 lg:px-10 py-3 sm:py-4 max-w-4xl mx-auto w-full pb-16 md:pb-4">
        
        {/* Píldoras de momentos cargados hoy (más reciente primero; muestra solo lo informado) */}
        {cargasDeHoy.length > 0 && (
          <div className="mb-1.5 shrink-0 bg-[#F6F3EC] border border-[#EAE2D6] rounded-xl px-2.5 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A534D] shrink-0 flex items-center gap-1">
              <Clock className="h-3 w-3 text-sky-700" />
              Hoy ({cargasDeHoy.length}):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {cargasDeHoy.map((c) => {
                const hora = c.horaExacta || clasificarFranjaHoraria(c.createdAt).horaExacta;
                const etiquetaPrincipal =
                  c.camposExtraidosReales?.[0]?.valor ||
                  c.actividadRealizada ||
                  c.metasEspecificas?.[0] ||
                  "Registro";
                const actCorta = etiquetaPrincipal.slice(0, 22);
                return (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#EAE2D6] text-[10px] font-semibold text-[#2D332D] shrink-0 shadow-2xs"
                    title={c.note}
                  >
                    <strong className="text-sky-700">{hora}</strong>
                    <span className="text-[#7A7167]">·</span>
                    <span>{actCorta}</span>
                    {c.energiaMencionada === true && (
                      <span className="text-amber-700">⚡ E:{c.energy}</span>
                    )}
                    {typeof c.tiempoProductivoMin === "number" && c.tiempoProductivoMin > 0 && (
                      <span className="text-emerald-700">⏱️ {c.tiempoProductivoMin}m</span>
                    )}
                    {typeof c.tiempoDistraidoMin === "number" && c.tiempoDistraidoMin > 0 && (
                      <span className="text-rose-700">⚠️ {c.tiempoDistraidoMin}m</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Error message toast */}
        {errorMsg && (
          <div className="mb-2 p-2 bg-[#D98E73]/10 border border-[#D98E73]/30 rounded-2xl flex items-center gap-2 text-xs text-[#B06A52]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message history or Empty State */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 flex flex-col">
          {currentMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 my-auto animate-fade-in">
              <div
                className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-2xs ${
                  esCanalCargaDatos
                    ? "bg-sky-900/10 text-sky-800"
                    : "bg-[#8BA888]/15 text-[#6D856B]"
                }`}
              >
                {esCanalCargaDatos ? (
                  <Database className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </div>
              <h3 className="text-xs font-bold text-[#5A534D] mt-2">
                {esCanalCargaDatos ? "Carga Diaria (BD)" : "Consultas"}
              </h3>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isUser = msg.sender === "user";

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className={`${
                        esCanalCargaDatos ? "bg-[#1E5678]" : "bg-[#7D9B7A]"
                      } text-white rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed max-w-[88%] sm:max-w-lg shadow-2xs`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const camposReales = msg.desgloseReporte?.camposExtraidosReales || [];

              return (
                <div key={msg.id} className="flex items-start gap-2 sm:gap-3 max-w-full sm:max-w-2xl">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#E5DFC5] text-[#7A7167] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px] sm:text-xs">
                    {profile.companionName.slice(0, 1)}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    {/* TARJETA DE CONFIRMACIÓN DE RESUMEN DE SESIÓN EN CHAT B (CONSULTAS) */}
                    {msg.desgloseResumenSesion && (
                      <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-3.5 sm:p-4 space-y-2.5 text-xs text-emerald-950 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <span className="font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ✓ Resumen de Sesión Guardado en Base de Datos
                          </span>
                          <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                            Control: {msg.desgloseResumenSesion.controloEmocion.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200/70">
                            <strong className="text-emerald-900 block">Patrones identificados:</strong>
                            <span>{msg.desgloseResumenSesion.patronesIdentificados.join(" · ")}</span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200/70">
                            <strong className="text-emerald-900 block">Emociones y Autoimagen:</strong>
                            <span>
                              {msg.desgloseResumenSesion.emocionesDetectadas.join(", ")} · {msg.desgloseResumenSesion.autoimagenYSensacionesPrimitivas}
                            </span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200/70">
                            <strong className="text-emerald-900 block">Respuesta del usuario:</strong>
                            <span>{msg.desgloseResumenSesion.respuestaUsuario}</span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-xl border border-emerald-200/70">
                            <strong className="text-emerald-900 block">Método regulador:</strong>
                            <span>
                              {msg.desgloseResumenSesion.metodoReguladorDetectado || "Reflexión consciente"}
                              {msg.desgloseResumenSesion.esMetodoNuevo && (
                                <strong className="text-emerald-700 ml-1">
                                  (★ Nuevo Método Guardado en BD)
                                </strong>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BURBUJA ÚNICA, BREVE Y FIEL A LO QUE EL USUARIO INFORMÓ */}
                    <div className="bg-white border border-[#EAE2D6] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm text-[#3A3530] leading-relaxed shadow-2xs space-y-2">
                      <p className="whitespace-pre-wrap">{limpiarFormatoPlano(msg.text)}</p>

                      {/* Desglose compacto SOLO de los datos que el usuario realmente mencionó */}
                      {camposReales.length > 0 && (
                        <div className="pt-1.5 border-t border-[#EAE2D6]/70 space-y-1">
                          {camposReales.map((campo, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-1.5 text-[11px] bg-[#F8F5EE] px-2.5 py-1.5 rounded-xl border border-[#EAE2D6]"
                            >
                              <span className="font-bold text-[#1E5678] shrink-0">
                                {campo.etiqueta}:
                              </span>
                              <span className="text-[#2D332D] font-medium">
                                {campo.valor}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-1.5 border-t border-[#EAE2D6]/60 flex items-center justify-between gap-2 text-[11px] flex-wrap">
                        {msg.desgloseReporte || msg.desgloseResumenSesion ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            ✓ Guardado en BD ({msg.desgloseReporte?.horaRegistrada || "Hoy"})
                          </span>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => handleConsolidarIntercambioEnArbol(msg)}
                          disabled={guardandoEnArbolId === msg.id}
                          className="px-2.5 py-1 rounded-lg bg-[#8BA888]/15 hover:bg-[#8BA888] text-[#6D856B] hover:text-white font-bold transition cursor-pointer"
                        >
                          {guardandoEnArbolId === msg.id ? "Guardando..." : "+ Vivencia BD"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5 max-w-md">
              <div className="h-7 w-7 rounded-full bg-[#E5DFC5] shrink-0" />
              <div className="bg-white border border-[#EAE2D6] rounded-2xl px-3.5 py-2.5 text-xs text-[#7A7167] flex items-center gap-2 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-[#7D9B7A]" />
                <span className="text-[11px] sm:text-xs">
                  {esCanalCargaDatos ? "Procesando carga..." : "Analizando..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box multilínea auto-expansible y editable en ambos chats (Chat A y Chat B) */}
        <div className="mt-1.5 shrink-0 space-y-1.5">
          <form
            onSubmit={handleSendMessage}
            className="bg-[#F5F2EB] border border-[#EAE2D6] rounded-2xl p-2 sm:p-2.5 pl-3 sm:pl-4 flex items-end gap-2 focus-within:border-[#7D9B7A] focus-within:bg-white transition shadow-2xs"
          >
            <textarea
              ref={inputRef}
              rows={isInputExpanded ? 5 : 2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                // En desktop Enter envía y Shift+Enter baja de línea; en mobile Enter permite bajar de línea libremente
                const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
                if (e.key === "Enter" && !e.shiftKey && !isMobileViewport) {
                  e.preventDefault();
                  if (inputText.trim() && !isLoading) {
                    handleSendMessage(e as unknown as React.FormEvent);
                  }
                }
              }}
              placeholder={
                esCanalCargaDatos
                  ? "Escribir carga del día..."
                  : "Escribir consulta..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#2D332D] placeholder-[#A69D91] outline-none min-w-0 py-1 leading-relaxed resize-y overflow-y-auto"
              style={{
                minHeight: isInputExpanded ? "130px" : "52px",
                maxHeight: isInputExpanded ? "300px" : "165px",
              }}
            />
            <div className="flex flex-col items-center gap-1 shrink-0 pb-0.5">
              <button
                type="button"
                onClick={() => setIsInputExpanded((prev) => !prev)}
                className="h-7 w-7 rounded-lg text-[#7A7167] hover:text-[#2D332D] hover:bg-[#EAE2D6]/60 flex items-center justify-center transition cursor-pointer"
                title={isInputExpanded ? "Contraer área de escritura" : "Ampliar área de escritura"}
              >
                {isInputExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`h-9 w-9 rounded-xl ${
                  esCanalCargaDatos
                    ? "bg-[#1E5678] hover:bg-[#16425B]"
                    : "bg-[#7D9B7A] hover:bg-[#6D856B]"
                } disabled:bg-[#EAE2D6] disabled:text-[#A69D91] text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs`}
                title={esCanalCargaDatos ? "Desglosar y enviar a Base de Datos" : "Enviar consulta"}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Bottom Secondary Bar */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleAnalyzeContext}
              disabled={isAnalyzingContext}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Meta-análisis transversal del contexto evolutivo"
            >
              {isAnalyzingContext ? (
                <Loader2 className="h-3 w-3 animate-spin text-amber-700" />
              ) : (
                <Compass className="h-3 w-3 text-amber-700" />
              )}
              <span>Evolución 8D</span>
            </button>

            {!esCanalCargaDatos && (
              <button
                type="button"
                onClick={handleSummarizeAndUpload}
                disabled={isSummarizing || currentMessages.filter((m) => m.sender === "user").length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-[#6D856B] hover:bg-[#576D56] text-white shadow-2xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Desglosa patrones, emociones, respuestas y métodos de esta consulta y los envía a la Base de Datos"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                    <span>Guardar Resumen de Sesión</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </section>

      {/* ========================================================
          DESKTOP RIGHT COLUMN: CONTEXT & PATTERNS (Hidden on < xl)
          ======================================================== */}
      <aside className="hidden xl:flex w-72 xl:w-80 border-l border-[#EAE2D6] flex-col justify-between p-4 xl:p-5 bg-[#FDFBF7] shrink-0 overflow-y-auto">
        {renderContextPanel()}
      </aside>

      {/* ========================================================
          MOBILE/TABLET RIGHT DRAWER (Slide-over)
          ======================================================== */}
      {isRightDrawerOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsRightDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#FDFBF7] h-full shadow-2xl p-4 flex flex-col z-10 border-l border-[#EAE2D6]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE2D6]">
              <span className="text-xs font-bold text-[#2D332D]">Memoria y Patrones</span>
              <button 
                onClick={() => setIsRightDrawerOpen(false)}
                className="p-1 text-[#7A7167] hover:text-[#2D332D] rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderContextPanel()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
