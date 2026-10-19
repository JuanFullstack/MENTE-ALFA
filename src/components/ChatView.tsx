import React, { useState, useRef, useEffect } from "react";
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
  Scale
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
  ContextEvolutionReport
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
} from "../lib/baseContext";
import { 
  getStoredGroqApiKey, 
  getStoredGroqModel, 
  chatWithGroq, 
  extractDimensionalAxesGroq,
  extractFichaVivenciaGroq
} from "../services/groqEvaluation";
import { 
  upsertConversacionSummaryPB, 
  deleteConversacionPB,
  createMensajePB,
  deleteMensajesByConvPB,
  createEstrategiaPB,
  createMemoriaPB
} from "../services/pocketbaseService";

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
  profile: UserProfile;
  activeConversationId: string;
  onUpdateConversations: (convs: Conversation[]) => void;
  onUpdateMessages: (msgs: Message[]) => void;
  onUpdateMemories: (mems: Memory[]) => void;
  onUpdateCurrentState: (state: CurrentState) => void;
  onUpdateDecisions: (decs: Decision[]) => void;
  onUpdateStrategies: (strats: Strategy[]) => void;
  onSetActiveConvId: (id: string) => void;
  onOpenQuickLog?: () => void;
  onOpenAddMemory?: () => void;
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
  profile,
  activeConversationId,
  onUpdateConversations,
  onUpdateMessages,
  onUpdateMemories,
  onUpdateCurrentState,
  onUpdateDecisions,
  onUpdateStrategies,
  onSetActiveConvId,
  onOpenQuickLog,
  onOpenAddMemory,
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Active conversation object
  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Filter messages belonging to the current conversation
  const currentMessages = messages.filter(
    (m) => m.conversationId === (activeConv?.id || activeConversationId)
  );

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isLoading]);

  // Recopilar resúmenes de conversaciones previas para la memoria continua de la IA
  const getPreviousSummaries = () => {
    return conversations
      .filter((c) => c.id !== activeConversationId && c.isSummarized && c.summary)
      .map((c) => ({
        id: c.id,
        title: c.title,
        summary: c.summary,
        updatedAt: c.updatedAt,
      }));
  };

  // 1. [CREATE] Nueva conversación (Limpia sin mensajes prefabricados)
  const handleCreateNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Nueva reflexión",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: null,
      isSummarized: false,
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

    const remainingMsgs = messages.filter((m) => m.conversationId !== activeConversationId);
    onUpdateMessages(remainingMsgs);
    ZenDB.setMessages(remainingMsgs);
  };

  // 5. [RESUMIR Y SUBIR] Generar resumen estructurado con horarios, franja, estado, métodos y efectividad
  const handleSummarizeAndUpload = async () => {
    const userMsgs = currentMessages.filter((m) => m.sender === "user");
    if (userMsgs.length === 0) {
      setErrorMsg("Escribe algún mensaje antes de generar un resumen de la sesión.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsSummarizing(true);
    setErrorMsg(null);
    setSummaryToast(null);

    const timeData = computeTimeSlotAndRange(currentMessages);
    const recentLog = logs && logs.length > 0 ? logs[0] : null;

    const textToSummarize = currentMessages
      .map((m) => `${m.sender === "user" ? profile.userName : profile.companionName}: ${m.text}`)
      .join("\n");

    const prompt = `Actúa como el motor analítico de memoria evolutiva y síntesis de alto rendimiento para ${profile.userName}.

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
   - INTERPRETACIÓN: Lo que ${profile.userName} pensó/sintió sobre el hecho o hipótesis analítica. ¡PROHIBIDO afirmar una interpretación como si fuera un hecho objetivo!
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
[Reconstrucción narrativa completa, comprimida y cronológica de qué ocurrió, respetando la secuencia temporal de los acontecimientos y vivencias de ${profile.userName}, dejando en claro todas las partes importantes sin etiquetas forzadas.]

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
- INTERPRETACIÓN: [Qué interpretó ${profile.userName}]
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

    let summaryText = "";

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();

      // 1. Priorizar llamada directa con Groq para respuesta inmediata con nuevo prompt
      if (groqKey) {
        try {
          summaryText = await chatWithGroq(
            [
              { role: "system", content: "Eres un sintetizador y analista personal. Escribes resúmenes narrativos claros, profundos y sin categorizaciones forzadas." },
              { role: "user", content: prompt },
            ],
            { apiKey: groqKey, model: groqModel, temperature: 0.2, max_tokens: 1500 }
          );
        } catch (groqErr) {
          console.warn("Fallo directo en Groq, intentando endpoint backend...", groqErr);
        }
      }

      // 2. Fallback a endpoint de servidor si es necesario
      if (!summaryText) {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (groqKey) {
            headers["x-groq-api-key"] = groqKey;
            headers["x-groq-model"] = groqModel;
          }

          const srvRes = await fetch("/api/summarize", {
            method: "POST",
            headers,
            body: JSON.stringify({
              messages: currentMessages,
              timeSlot: timeData.timeSlot,
              timeRange: timeData.timeRange,
              recentLog,
              userName: profile.userName,
              customPrompt: prompt,
            }),
          });

          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData && srvData.summary) {
              summaryText = srvData.summary;
            }
          }
        } catch (_err) {
          // Fallback
        }
      }

      if (!summaryText) {
        summaryText = `RESUMEN GENERAL:\nSesión con ${userMsgs.length} intervenciones de ${profile.userName}.\n\nDESGLOSE DE LO IDENTIFICADO:\n- Temporalidad: ${timeData.timeRange} (${timeData.timeSlot})\n- Rasgos de mentalidad: Procesados durante la interacción\n- Métodos o protocolos: Ninguno / Relato libre\n- Desenlace / Aprendizaje: Registrado para seguimiento.`;
      }

      // 3. Extraer los 4 Ejes Dimensionales y Metadata Evolutiva
      let analysisMetadata: AnalysisMetadata | null = null;
      try {
        const extracted = await extractDimensionalAxesGroq(summaryText, profile.userName);
        if (extracted && extracted.axes) {
          analysisMetadata = {
            axes: extracted.axes,
            dominantPattern: extracted.dominantPattern,
            evolutionVsPrevious: extracted.evolutionVsPrevious,
            contradictions: extracted.contradictions,
            novelInsights: extracted.novelInsights,
            sourceType: "derivado",
            processedAt: new Date().toISOString(),
          };
        }
      } catch (dimErr) {
        console.warn("No se pudieron extraer ejes dimensionales en cliente:", dimErr);
      }

      const currentTitle = activeConv?.title || "Reflexión";
      const updatedConvs = conversations.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            summary: summaryText,
            isSummarized: true,
            analysisMetadata,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      onUpdateConversations(updatedConvs);
      ZenDB.setConversations(updatedConvs);

      const pbResult = await upsertConversacionSummaryPB(activeConversationId, currentTitle, summaryText, analysisMetadata);

      setSummaryToast({
        summary: summaryText,
        uploaded: pbResult.success,
        analysisMetadata,
      });

      if (activeConv?.title === "Nueva reflexión" && userMsgs[0]) {
        const autoTitle = userMsgs[0].text.slice(0, 32) + (userMsgs[0].text.length > 32 ? "..." : "");
        const renamed = updatedConvs.map((c) => (c.id === activeConversationId ? { ...c, title: autoTitle } : c));
        onUpdateConversations(renamed);
        ZenDB.setConversations(renamed);
        ZenDB.sincronizarArbolMemoria(memories, renamed, strategies);
      } else {
        ZenDB.sincronizarArbolMemoria(memories, updatedConvs, strategies);
      }

    } catch (err: any) {
      console.error("Error al resumir:", err);
      setErrorMsg("Error al generar o subir el resumen. Verifica tu conexión o clave en Configuración.");
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

  // 6. Enviar mensaje del usuario
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setErrorMsg(null);
    const userText = inputText.trim();
    setInputText("");

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      conversationId: activeConversationId,
      sender: "user",
      text: userText,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    onUpdateMessages(updatedMessages);

    if (activeConv && (activeConv.title === "Nueva reflexión" || activeConv.title.startsWith("Conversación"))) {
      const summaryTitle = userText.slice(0, 36) + (userText.length > 36 ? "..." : "");
      const updatedConvs = conversations.map((c) =>
        c.id === activeConversationId
          ? { ...c, title: summaryTitle, updatedAt: new Date().toISOString() }
          : c
      );
      onUpdateConversations(updatedConvs);
    }

    setIsLoading(true);

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();
      const previousSummaries = getPreviousSummaries();

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
            messages: updatedMessages.filter((m) => m.conversationId === activeConversationId),
            memories: memories.filter((m) => m.isApproved),
            logs: logs.slice(-5),
            patterns: patterns,
            strategies: strategies,
            currentState: currentState,
            decisions: decisions,
            dailyReports: dailyReports,
            previousSummaries: previousSummaries,
            conversations: conversations.filter((c) => c.isSummarized && c.summary),
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
        // Fallback directo a Groq Cloud con Arbol Jerarquico de Memoria
        const activeThreadMsgs = updatedMessages.filter((m) => m.conversationId === activeConversationId);
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

        const hechoDosificadoTexto = obtenerHechoDosificadoSinRepetir(
          activeThreadMsgs,
          userText
        );

        const systemInstruction = buildRepairedSystemPrompt({
          ramaActiva,
          tagsDetectados,
          hiloRecienteTexto,
          fichasCompactasTexto,
          hechoDosificadoTexto,
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
            temperature: 0.25,
            max_tokens: 900,
            assistantPrefill: ASSISTANT_PREFILL_TAG,
          }
        );

        const { formattedMessage, tacticalAnalysis } = parseRepairedTacticalOutput(
          groqResponse,
          ramaActiva,
          true
        );
        data = {
          message: formattedMessage,
          tacticalAnalysis,
          energyLevel: 7,
        };
      }

      const aiMsg: Message = {
        id: `m-${Date.now() + 1}`,
        conversationId: activeConversationId,
        sender: "assistant",
        text: data?.message || "He procesado tu mensaje con atención.",
        createdAt: new Date().toISOString(),
        energyLevel: data?.energyLevel,
      };

      onUpdateMessages([...updatedMessages, aiMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setErrorMsg("Error al comunicar con Groq AI. Verifica tu conexión o clave en Configuración.");
      
      const fallbackAiMsg: Message = {
        id: `m-${Date.now() + 1}`,
        conversationId: activeConversationId,
        sender: "assistant",
        text: `Te escucho con atención, ${profile.userName}. Comprendo lo que mencionas respecto a '${userText}'. ¿Cómo te hace sentir eso en este momento?`,
        createdAt: new Date().toISOString(),
      };
      onUpdateMessages([...updatedMessages, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

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
    return `HOY, ${d.getDate()} DE ${d.toLocaleString("es", { month: "long" }).toUpperCase()}`;
  };

  const primaryMemory = memories[0] || {
    text: "Prefiere trabajar sin música cuando realiza tareas analíticas. Se siente más productivo por la mañana (07:00 a 12:00).",
    category: "preferencias",
  };

  // Reusable Left Conversations Panel Content
  const renderConversationsList = () => (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D6]/60">
        <h2 className="text-[11px] font-bold text-[#A69D91] uppercase tracking-wider">
          CONVERSACIONES
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
        {conversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
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
                    {conv.isSummarized ? (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <BookmarkCheck className="h-2.5 w-2.5 text-emerald-600" />
                        Resumido
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#A69D91] italic">
                        Local
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
          ESTADO EMOCIONAL HOY
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
        
        {/* Top Header of Chat */}
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#EAE2D6]/60 shrink-0 gap-2">
          
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Drawer Trigger for Conversations */}
            <button
              type="button"
              onClick={() => setIsLeftDrawerOpen(true)}
              className="lg:hidden p-1.5 rounded-xl border border-[#EAE2D6] bg-white text-[#7A7167] hover:text-[#2D332D] shadow-2xs shrink-0"
              title="Ver conversaciones"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-[#2D332D] truncate">
                {activeConv?.title || "Reflexión activa"}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-[#7A7167]">
                <span>{currentMessages.length} mensajes</span>
                {activeConv?.isSummarized && (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium hidden sm:inline-flex items-center gap-1">
                    <CloudUpload className="h-2.5 w-2.5" /> En BD
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Drawer Trigger for Memory & Patterns */}
            <button
              type="button"
              onClick={() => setIsRightDrawerOpen(true)}
              className="xl:hidden flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#7A7167] bg-white border border-[#EAE2D6] rounded-xl shadow-2xs"
              title="Ver memoria de contexto"
            >
              <Brain className="h-3.5 w-3.5 text-[#8BA888]" />
              <span className="hidden sm:inline">Memoria</span>
            </button>

            {/* Analizar Contexto Button */}
            <button
              type="button"
              onClick={handleAnalyzeContext}
              disabled={isAnalyzingContext}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Analiza la trayectoria evolutiva en las 8 dimensiones"
            >
              {isAnalyzingContext ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
              ) : (
                <Compass className="h-3.5 w-3.5 text-amber-700" />
              )}
              <span className="hidden sm:inline">Analizar Contexto</span>
            </button>

            {/* Clear Window Button */}
            <button
              type="button"
              onClick={handleClearCurrentWindow}
              disabled={currentMessages.length === 0}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-[#7A7167] hover:text-[#B06A52] hover:bg-[#D98E73]/10 border border-[#EAE2D6] rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Vaciar mensajes de esta ventana"
            >
              <Eraser className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpiar ventana</span>
            </button>
          </div>
        </div>

        {/* Date separator pill */}
        <div className="flex justify-center my-1.5 shrink-0">
          <span className="bg-[#EAE2D6]/70 text-[#7A7167] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-3 py-0.5 rounded-full">
            {getFormattedDate()}
          </span>
        </div>

        {/* Success toast after summarizing */}
        {summaryToast && (
          <div className="mb-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 shadow-2xs animate-fade-in space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ¡Resumen generado y subido a PocketBase!
              </span>
              <button
                onClick={() => setSummaryToast(null)}
                className="text-emerald-700 hover:text-emerald-900 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 leading-relaxed pl-5">
              {summaryToast.summary}
            </p>
          </div>
        )}

        {/* Error message toast */}
        {errorMsg && (
          <div className="mb-2.5 p-2.5 bg-[#D98E73]/10 border border-[#D98E73]/30 rounded-2xl flex items-center gap-2 text-xs text-[#B06A52]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message history or Empty State */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 flex flex-col">
          {currentMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2.5 my-auto animate-fade-in">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#8BA888]/15 text-[#6D856B] flex items-center justify-center shadow-2xs">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="max-w-xs sm:max-w-sm space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-[#2D332D]">
                  {activeConv?.title || "Nueva conversación"}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#7A7167] leading-relaxed">
                  Escribe tu primer mensaje abajo para comenzar a reflexionar con {profile.companionName}.
                </p>
              </div>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isUser = msg.sender === "user";

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="bg-[#7D9B7A] text-white rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-lg shadow-2xs">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-2.5 sm:gap-3 max-w-full sm:max-w-xl">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#E5DFC5] text-[#7A7167] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px] sm:text-xs">
                    {profile.companionName.slice(0, 1)}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="bg-white border border-[#EAE2D6] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-[#3A3530] leading-relaxed shadow-2xs space-y-2">
                      <p className="whitespace-pre-wrap">{limpiarFormatoPlano(msg.text)}</p>
                      <div className="pt-2 border-t border-[#EAE2D6]/60 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-[#A69D91] italic">Modo consulta (no guardado en BD)</span>
                        <button
                          type="button"
                          onClick={() => handleConsolidarIntercambioEnArbol(msg)}
                          disabled={guardandoEnArbolId === msg.id}
                          className="px-2.5 py-1 rounded-lg bg-[#8BA888]/15 hover:bg-[#8BA888] text-[#6D856B] hover:text-white font-bold transition cursor-pointer"
                        >
                          {guardandoEnArbolId === msg.id ? "Guardando en Arbol..." : "+ Guardar como Vivencia en BD"}
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
                <span className="text-[11px] sm:text-xs">{profile.companionName} está reflexionando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box & Bottom Resumir Bar */}
        <div className="mt-2.5 shrink-0 space-y-1.5">
          
          <form
            onSubmit={handleSendMessage}
            className="bg-[#F5F2EB] border border-[#EAE2D6] rounded-2xl p-1.5 sm:p-2 pl-3 sm:pl-4 flex items-center gap-2 focus-within:border-[#7D9B7A] focus-within:bg-white transition shadow-2xs"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje reflexivo..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#2D332D] placeholder-[#A69D91] outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#7D9B7A] hover:bg-[#6D856B] disabled:bg-[#EAE2D6] disabled:text-[#A69D91] text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
              title="Enviar mensaje"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </form>

          {/* Bottom Bar: Analizar Contexto & Resumir y Subir Buttons */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleAnalyzeContext}
              disabled={isAnalyzingContext}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs transition cursor-pointer disabled:opacity-50 shrink-0"
              title="Meta-análisis transversal del contexto evolutivo"
            >
              {isAnalyzingContext ? (
                <Loader2 className="h-3 w-3 animate-spin text-amber-700" />
              ) : (
                <Compass className="h-3 w-3 text-amber-700" />
              )}
              <span>Analizar Contexto</span>
            </button>

            <button
              type="button"
              onClick={handleSummarizeAndUpload}
              disabled={isSummarizing || currentMessages.filter((m) => m.sender === "user").length === 0}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#8BA888] hover:bg-[#6D856B] text-white shadow-2xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Sintetiza la conversación con Groq y sube el resumen a PocketBase"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Resumiendo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-amber-200" />
                  <span className="hidden sm:inline">Resumir y Guardar en BD</span>
                  <span className="sm:hidden">Resumir</span>
                </>
              )}
            </button>
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
