/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CalendarRange, Plus, Trash2, Sliders, NotepadText, Sparkles, 
  CheckCircle2, AlertTriangle, ShieldCheck, FileText, ChevronRight, BookmarkCheck, RefreshCw,
  Target, Award, Clock, ArrowUpRight, Check, Zap, Brain, ShieldAlert, RotateCcw
} from "lucide-react";
import { 
  DailyLog, DailyReport, Message, CurrentState, Decision, Strategy,
  ObjetivoEstructurado, TipoObjetivo, PeriodoObjetivo, CodigoRasgo, FranjaOperativa
} from "../types";
import { UserProfile } from "../lib/storage";
import { getStoredGroqApiKey, getStoredGroqModel } from "../services/groqEvaluation";
import { createRegistroPB, deleteRegistroPB } from "../services/pocketbaseService";
import { PLANTILLAS_RASGOS_OFICIALES, clasificarFranjaHoraria } from "../lib/progressAuditor";

interface RegistrosViewProps {
  logs: DailyLog[];
  dailyReports: DailyReport[];
  messages: Message[];
  profile: UserProfile;
  currentState: CurrentState;
  decisions: Decision[];
  strategies: Strategy[];
  objetivosEstructurados?: ObjetivoEstructurado[];
  onUpdateLogs: (logs: DailyLog[]) => void;
  onUpdateDailyReports: (reports: DailyReport[]) => void;
  onUpdateObjetivos?: (objs: ObjetivoEstructurado[]) => void;
}

export default function RegistrosView({ 
  logs, 
  dailyReports, 
  messages, 
  profile, 
  currentState, 
  decisions, 
  strategies, 
  objetivosEstructurados = [],
  onUpdateLogs, 
  onUpdateDailyReports,
  onUpdateObjetivos,
}: RegistrosViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"objetivos" | "reportes" | "rapidos">("objetivos");

  // Estado del creador de objetivos
  const [isCrearObjOpen, setIsCrearObjOpen] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState<TipoObjetivo>("crecimiento_psicologico");
  const [nuevoPeriodo, setNuevoPeriodo] = useState<PeriodoObjetivo>("semanal");
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<CodigoRasgo | "">("PSI-1_autoconfianza");
  const [formTitulo, setFormTitulo] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].titulo);
  const [formMetaNum, setFormMetaNum] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].metaSugeridaSemanal);
  const [formMetaUnidad, setFormMetaUnidad] = useState<"dias" | "episodios_exitosos" | "bloques">("episodios_exitosos");
  const [formFranja, setFormFranja] = useState<FranjaOperativa>("23:00_cierre_o_social");
  const [formDecreto, setFormDecreto] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].decretoClave);
  const [formProtocolo, setFormProtocolo] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].protocoloPasos.join("\n"));

  // Quick log slider states
  const [energy, setEnergy] = useState(6);
  const [motivation, setMotivation] = useState(7);
  const [stress, setStress] = useState(4);
  const [note, setNote] = useState("");

  // Daily report manual generator states
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Manual structured report state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualGoals, setManualGoals] = useState("");
  const [manualResults, setManualResults] = useState("");
  const [manualProblems, setManualProblems] = useState("");
  const [manualDecisions, setManualDecisions] = useState("");
  const [manualPatterns, setManualPatterns] = useState("");
  const [manualGeneralNote, setManualGeneralNote] = useState("");

  const hoyIso = new Date().toISOString().split("T")[0];
  const reportesHoyCount = (logs || []).filter((l) => clasificarFranjaHoraria(l.createdAt).dateKey === hoyIso).length;

  const objetivosPsicologicos = (objetivosEstructurados || []).filter((o) => o.tipo === "crecimiento_psicologico");
  const objetivosProductivos = (objetivosEstructurados || []).filter((o) => o.tipo === "productivo");
  
  const porcentajeCumplimientoGlobal =
    (objetivosEstructurados || []).length > 0
      ? Math.round(
          (objetivosEstructurados.reduce(
            (acc, o) => acc + Math.min(1, o.meta.progresoActual / Math.max(1, o.meta.objetivoNumerico)),
            0
          ) /
            objetivosEstructurados.length) *
            100
        )
      : 0;

  // Manejo de plantillas oficiales
  const handleSeleccionarPlantilla = (codigo: CodigoRasgo) => {
    setPlantillaSeleccionada(codigo);
    const p = PLANTILLAS_RASGOS_OFICIALES[codigo];
    if (p) {
      setNuevoTipo(p.tipo);
      setFormTitulo(p.titulo);
      setFormMetaNum(nuevoPeriodo === "mensual" ? p.metaSugeridaSemanal * 3 : p.metaSugeridaSemanal);
      setFormMetaUnidad(p.unidad);
      setFormFranja(p.franjaCritica);
      setFormDecreto(p.decretoClave);
      setFormProtocolo(p.protocoloPasos.join("\n"));
    }
  };

  const handleCrearObjetivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;

    const p = plantillaSeleccionada ? PLANTILLAS_RASGOS_OFICIALES[plantillaSeleccionada] : null;
    const nuevoObj: ObjetivoEstructurado = {
      id: `OBJ-${Date.now()}`,
      titulo: formTitulo.trim(),
      tipo: nuevoTipo,
      periodo: nuevoPeriodo,
      periodoClave: nuevoPeriodo === "semanal" ? "Semana Actual" : "Mes Actual",
      rasgoCodigo: (plantillaSeleccionada || "PSI-1_autoconfianza") as CodigoRasgo,
      rama_id: p ? p.rama_id : nuevoTipo === "crecimiento_psicologico" ? "vinculos" : "proyectos",
      tags_mecanismo: p ? p.tags_mecanismo : [],
      franjaCritica: formFranja,
      meta: {
        objetivoNumerico: Number(formMetaNum) || 5,
        progresoActual: 0,
        unidad: formMetaUnidad,
      },
      protocoloPasos: formProtocolo.split("\n").map((s) => s.trim()).filter(Boolean),
      decretoClave: formDecreto.trim(),
      obstaculosRegistrados: [],
      exitosRegistrados: [],
      estado: "cumpliendo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const actualizados = [nuevoObj, ...(objetivosEstructurados || [])];
    onUpdateObjetivos?.(actualizados);
    setIsCrearObjOpen(false);
  };

  const handleEliminarObjetivo = (id: string) => {
    const actualizados = (objetivosEstructurados || []).filter((o) => o.id !== id);
    onUpdateObjetivos?.(actualizados);
  };

  const handleIncrementarProgreso = (id: string) => {
    const info = clasificarFranjaHoraria();
    const actualizados = (objetivosEstructurados || []).map((o) => {
      if (o.id !== id) return o;
      const nuevoProg = Math.min(o.meta.objetivoNumerico, o.meta.progresoActual + 1);
      const nuevoExito = {
        fecha: info.dateKey,
        hora: info.horaExacta,
        detonanteNegativo: "Avance directo manual",
        metodoAplicado: o.protocoloPasos[0] || "Ejecución de protocolo",
      };
      return {
        ...o,
        meta: { ...o.meta, progresoActual: nuevoProg },
        exitosRegistrados: [nuevoExito, ...o.exitosRegistrados].slice(0, 15),
        estado: nuevoProg >= o.meta.objetivoNumerico ? ("completado" as const) : o.estado,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateObjetivos?.(actualizados);
  };

  const handleResetProgreso = (id: string) => {
    const actualizados = (objetivosEstructurados || []).map((o) => {
      if (o.id !== id) return o;
      return {
        ...o,
        meta: { ...o.meta, progresoActual: 0 },
        estado: "cumpliendo" as const,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateObjetivos?.(actualizados);
  };

  // Save quick numeric log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const info = clasificarFranjaHoraria();

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: info.dateKey,
      horaExacta: info.horaExacta,
      franja: info.franja,
      energy,
      motivation,
      stress,
      moodScore: energy,
      productivityScore: motivation,
      note: note.trim() || `[${info.horaExacta}] Registro rápido del estado emocional.`,
    };

    onUpdateLogs([newLog, ...logs]);
    createRegistroPB(newLog);
    setNote("");
  };

  const handleDeleteLog = (id: string) => {
    onUpdateLogs(logs.filter((l) => l.id !== id));
    deleteRegistroPB(id);
  };

  const handleDeleteReport = (id: string) => {
    onUpdateDailyReports(dailyReports.filter((r) => r.id !== id));
  };

  // Generador de reporte diario con IA
  const handleGenerateAIDailyReport = async () => {
    setIsGeneratingReport(true);
    setReportError(null);

    const todayIso = new Date().toISOString().split("T")[0];
    const todayMsgs = messages.filter((m) => (m.createdAt || (m as any).timestamp || "").startsWith(todayIso));
    const todayLogs = logs.filter((l) => l.createdAt.startsWith(todayIso));

    if (todayMsgs.length === 0 && todayLogs.length === 0) {
      setReportError("No hay conversaciones ni registros de hoy para compilar el reporte.");
      setIsGeneratingReport(false);
      return;
    }

    const apiKey = getStoredGroqApiKey();
    if (!apiKey) {
      setReportError("Falta la API Key de Groq en Configuración.");
      setIsGeneratingReport(false);
      return;
    }

    const promptText = `Sos el asistente de Juan Francisco Cano. Compila un balance estructurado del día de hoy (${todayIso}) en formato JSON estricto.
DATOS DE HOY:
Mensajes: ${todayMsgs.map((m) => `${m.sender}: ${m.text}`).join("\n")}
Registros: ${todayLogs.map((l) => `E:${l.energy} M:${l.motivation} S:${l.stress} - ${l.note}`).join("\n")}

Responde UNICAMENTE con un JSON con esta estructura exacta:
{
  "goals": ["meta 1", "meta 2"],
  "results": ["resultado 1", "resultado 2"],
  "problems": ["problema o bloqueo"],
  "decisions": ["decision tomada"],
  "projectStatus": "Resumen breve del avance",
  "observedPatterns": ["patron observado"],
  "generalNote": "Reflexion de cierre directa y honesta"
}`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: getStoredGroqModel(),
          messages: [{ role: "user", content: promptText }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) throw new Error(`Error en API Groq (${res.status})`);
      const data = await res.json();
      const rawJson = data.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(rawJson);

      const newReport: DailyReport = {
        id: `rep-${Date.now()}`,
        date: todayIso,
        goals: parsed.goals || [],
        results: parsed.results || [],
        problems: parsed.problems || [],
        decisions: parsed.decisions || [],
        projectStatus: parsed.projectStatus || "En progreso",
        observedPatterns: parsed.observedPatterns || [],
        generalNote: parsed.generalNote || "Reporte generado automáticamente.",
        createdAt: new Date().toISOString(),
      };

      onUpdateDailyReports([newReport, ...dailyReports]);
    } catch (err: any) {
      console.error(err);
      setReportError(err.message || "Error al generar reporte diario.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Save manual structured report
  const handleSaveManualReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: DailyReport = {
      id: `rep-${Date.now()}`,
      date: manualDate,
      goals: manualGoals.split("\n").map((s) => s.trim()).filter(Boolean),
      results: manualResults.split("\n").map((s) => s.trim()).filter(Boolean),
      problems: manualProblems.split("\n").map((s) => s.trim()).filter(Boolean),
      decisions: manualDecisions.split("\n").map((s) => s.trim()).filter(Boolean),
      projectStatus: "En progreso",
      observedPatterns: manualPatterns.split("\n").map((s) => s.trim()).filter(Boolean),
      generalNote: manualGeneralNote.trim(),
      createdAt: new Date().toISOString(),
    };

    onUpdateDailyReports([newRep, ...dailyReports]);
    setIsManualModalOpen(false);
    setManualGoals("");
    setManualResults("");
    setManualProblems("");
    setManualDecisions("");
    setManualPatterns("");
    setManualGeneralNote("");
  };

  const getEnergyLabel = (val: number) => {
    if (val <= 3) return { label: "Agotado / Bajo", color: "text-[#D98E73] bg-[#D98E73]/10" };
    if (val <= 7) return { label: "Suficiente / Moderado", color: "text-[#7A7167] bg-[#F9F6F1]" };
    return { label: "Pleno / Elevado", color: "text-[#6D856B] bg-[#8BA888]/10" };
  };

  const getMotivationLabel = (val: number) => {
    if (val <= 3) return { label: "Apático / Desmotivado", color: "text-[#D98E73] bg-[#D98E73]/10" };
    if (val <= 7) return { label: "Estable / Interesado", color: "text-[#7A7167] bg-[#F9F6F1]" };
    return { label: "Inspirado / Enfocado", color: "text-[#6D856B] bg-[#8BA888]/10" };
  };

  const getStressLabel = (val: number) => {
    if (val <= 3) return { label: "Tranquilo / Relajado", color: "text-[#6D856B] bg-[#8BA888]/10" };
    if (val <= 7) return { label: "Alerta / Moderado", color: "text-[#7A7167] bg-[#F9F6F1]" };
    return { label: "Abrumado / Tenso", color: "text-[#D98E73] bg-[#D98E73]/10" };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 font-sans pb-20 md:pb-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAE2D6] pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#8BA888] text-white flex items-center justify-center shadow-lg shadow-[#8BA888]/10 shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D332D]">Objetivos y Bitácora Operativa</h2>
            <p className="text-xs text-[#7A7167] mt-0.5">
              Crecimiento Psicológico vs. Disciplina Productiva · Telemetría horaria de 0 a 15 reportes diarios.
            </p>
          </div>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#F5F1E8] p-1 rounded-xl border border-[#EAE2D6]">
            <button
              onClick={() => setActiveSubTab("objetivos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "objetivos"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              <Target className="h-3.5 w-3.5 text-[#6D856B]" />
              <span>Objetivos ({(objetivosEstructurados || []).length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("reportes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "reportes"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              Balances ({dailyReports.length})
            </button>
            <button
              onClick={() => setActiveSubTab("rapidos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "rapidos"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              Check-ins ({logs.length})
            </button>
          </div>

          {activeSubTab === "reportes" && (
            <button
              onClick={handleGenerateAIDailyReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-[#8BA888] hover:bg-[#6D856B] disabled:bg-[#EAE2D6] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              {isGeneratingReport ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isGeneratingReport ? "Generando..." : "Generar con IA"}</span>
            </button>
          )}

          {activeSubTab === "objetivos" && (
            <button
              onClick={() => setIsCrearObjOpen(!isCrearObjOpen)}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isCrearObjOpen ? "Cerrar Formulario" : "Nuevo Objetivo"}</span>
            </button>
          )}
        </div>
      </div>

      {reportError && (
        <div className="p-4 rounded-2xl bg-[#D98E73]/10 border border-[#D98E73]/20 flex items-start gap-3 text-xs text-[#B06A52]">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[#D98E73] mt-0.5" />
          <div>
            <p className="font-bold">Error al generar reporte</p>
            <p className="mt-0.5">{reportError}</p>
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 0: GESTOR DE OBJETIVOS SEMANALES Y MENSUALES
          ======================================================== */}
      {activeSubTab === "objetivos" && (
        <div className="space-y-6">

          {/* Tarjetas de Resumen KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-[#EAE2D6] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#7A7167] uppercase tracking-wider block">Cumplimiento Global</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-[#6D856B]">{porcentajeCumplimientoGlobal}%</span>
                <span className="text-xs text-[#7A7167]">promedio</span>
              </div>
            </div>
            <div className="bg-white border border-[#EAE2D6] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#7A7167] uppercase tracking-wider block">Psicológicos (Actitud)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-[#2D332D]">{objetivosPsicologicos.length}</span>
                <span className="text-xs text-[#7A7167]">activos</span>
              </div>
            </div>
            <div className="bg-white border border-[#EAE2D6] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#7A7167] uppercase tracking-wider block">Productivos (Disciplina)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-[#2D332D]">{objetivosProductivos.length}</span>
                <span className="text-xs text-[#7A7167]">activos</span>
              </div>
            </div>
            <div className="bg-white border border-[#EAE2D6] rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#7A7167] uppercase tracking-wider block">Reportes de Hoy</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-[#8BA888]">{reportesHoyCount}</span>
                <span className="text-xs text-[#7A7167]">/ 15 máx</span>
              </div>
            </div>
          </div>

          {/* Formulario Creador de Objetivos (colapsable) */}
          {isCrearObjOpen && (
            <form onSubmit={handleCrearObjetivo} className="bg-white border border-[#8BA888]/40 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#8BA888]/20 text-[#6D856B] flex items-center justify-center">
                    <Target className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#2D332D]">Configurar Nuevo Objetivo Semanal / Mensual</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCrearObjOpen(false)}
                  className="text-xs text-[#7A7167] hover:text-[#2D332D]"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Selector de Plantilla Oficial de 1 clic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A443F] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#8BA888]" />
                  Cargar desde Plantilla Oficial de la Guía Práctica (1 Clic)
                </label>
                <select
                  value={plantillaSeleccionada}
                  onChange={(e) => handleSeleccionarPlantilla(e.target.value as CodigoRasgo)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] font-medium outline-none focus:border-[#8BA888]"
                >
                  <option value="">-- Personalizado / Sin plantilla --</option>
                  <optgroup label="🧠 Crecimiento Psicológico (Rasgos 1.1 a 1.6)">
                    <option value="PSI-1_autoconfianza">PSI-1: Autoconfianza y Valor Intrínseco</option>
                    <option value="PSI-2_alma_libre">PSI-2: Desinhibición ('Alma Libre')</option>
                    <option value="PSI-3_humor_error">PSI-3: Humor y Ligereza ante el Error</option>
                    <option value="PSI-4_inmunidad_rechazo">PSI-4: Inmunidad al Rechazo Social</option>
                    <option value="PSI-5_ideal_adaptado_leon">PSI-5: León calmando ira e Ideal Adaptado</option>
                    <option value="PSI-6_gratitud_activa">PSI-6: Gratitud Activa y Reencuadre</option>
                  </optgroup>
                  <optgroup label="⚡ Productivo / Disciplina Operativa (Rasgos 2.1 a 2.4)">
                    <option value="PROD-1_arranque_645">PROD-1: Rutina 6:45 AM + Audio Horus</option>
                    <option value="PROD-2_entreno_730">PROD-2: Entrenamiento Físico 7:30 AM</option>
                    <option value="PROD-3_estudio_ingenieria">PROD-3: Bloque Estudio Ingeniería 5:00 PM</option>
                    <option value="PROD-4_dia_no_cero">PROD-4: Combate a la Apatía / Día No Cero</option>
                  </optgroup>
                </select>
              </div>

              {/* Selectores de Tipo y Periodo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Tipo de Objetivo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNuevoTipo("crecimiento_psicologico")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        nuevoTipo === "crecimiento_psicologico"
                          ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                          : "bg-white border-[#EAE2D6] text-[#7A7167]"
                      }`}
                    >
                      🧠 Psicológico
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoTipo("productivo")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        nuevoTipo === "productivo"
                          ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                          : "bg-white border-[#EAE2D6] text-[#7A7167]"
                      }`}
                    >
                      ⚡ Productivo
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Periodo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNuevoPeriodo("semanal")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        nuevoPeriodo === "semanal"
                          ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                          : "bg-white border-[#EAE2D6] text-[#7A7167]"
                      }`}
                    >
                      📅 Semanal
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoPeriodo("mensual")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        nuevoPeriodo === "mensual"
                          ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                          : "bg-white border-[#EAE2D6] text-[#7A7167]"
                      }`}
                    >
                      🗓️ Mensual
                    </button>
                  </div>
                </div>
              </div>

              {/* Título y Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Título del Objetivo</label>
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ej: Sostener postura y mirada firme en el bar"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-medium outline-none focus:border-[#8BA888]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Meta Numérica</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formMetaNum}
                      onChange={(e) => setFormMetaNum(Number(e.target.value))}
                      className="w-20 px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-bold outline-none focus:border-[#8BA888]"
                    />
                    <select
                      value={formMetaUnidad}
                      onChange={(e) => setFormMetaUnidad(e.target.value as any)}
                      className="flex-1 px-2 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none focus:border-[#8BA888]"
                    >
                      <option value="dias">días</option>
                      <option value="episodios_exitosos">episodios</option>
                      <option value="bloques">bloques</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Franja Crítica y Decreto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Franja Horaria Crítica</label>
                  <select
                    value={formFranja}
                    onChange={(e) => setFormFranja(e.target.value as FranjaOperativa)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none focus:border-[#8BA888]"
                  >
                    <option value="06:45_arranque">06:45 AM (Alarma & Horus)</option>
                    <option value="07:30_entreno">07:30 AM (Entrenamiento)</option>
                    <option value="09:00_bloque_manana">09:00 AM (Bloque Mañana)</option>
                    <option value="13:00_transicion_siesta">13:00 PM (Valle / Siesta)</option>
                    <option value="17:00_estudio_ingenieria">17:00 PM (Estudio Ingeniería)</option>
                    <option value="23:00_cierre_o_social">23:00 PM (Cierre / Social)</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Decreto Clave de Reencuadre</label>
                  <input
                    type="text"
                    value={formDecreto}
                    onChange={(e) => setFormDecreto(e.target.value)}
                    placeholder="Frase o decreto inquebrantable de control interno"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs italic outline-none focus:border-[#8BA888]"
                  />
                </div>
              </div>

              {/* Protocolo Paso a Paso */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7A7167] uppercase">Protocolo Paso a Paso (1 por línea)</label>
                <textarea
                  rows={3}
                  value={formProtocolo}
                  onChange={(e) => setFormProtocolo(e.target.value)}
                  placeholder="Pasos mecánicos exactos sin cavilar..."
                  className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none focus:border-[#8BA888] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCrearObjOpen(false)}
                  className="px-4 py-2 border border-[#EAE2D6] rounded-xl text-xs font-bold text-[#7A7167]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8BA888] hover:bg-[#6D856B] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Guardar Objetivo</span>
                </button>
              </div>
            </form>
          )}

          {/* Paneles Paralelos: Psicológico vs Productivo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* PANEL 1: CRECIMIENTO PSICOLÓGICO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#8BA888]/20 text-[#6D856B] flex items-center justify-center">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2D332D]">Crecimiento Psicológico & Actitud</h3>
                    <p className="text-[11px] text-[#7A7167]">Autoconfianza, desinhibición, humor e inmunidad al juicio.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8BA888]/15 text-[#5A7358]">
                  {objetivosPsicologicos.length} activos
                </span>
              </div>

              {objetivosPsicologicos.length === 0 ? (
                <div className="bg-white border border-[#EAE2D6] rounded-3xl p-8 text-center space-y-2">
                  <Brain className="h-8 w-8 text-[#A69D91] mx-auto" />
                  <p className="text-xs text-[#7A7167]">No tienes objetivos de crecimiento psicológico activos.</p>
                </div>
              ) : (
                objetivosPsicologicos.map((obj) => {
                  const ratio = Math.min(1, obj.meta.progresoActual / Math.max(1, obj.meta.objetivoNumerico));
                  const pct = Math.round(ratio * 100);

                  return (
                    <div
                      key={obj.id}
                      className="bg-white border border-[#EAE2D6] rounded-3xl p-5 shadow-xs space-y-3 relative group hover:border-[#8BA888]/50 transition"
                    >
                      {/* Header de la tarjeta */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A7167] border border-[#EAE2D6] uppercase">
                              {obj.periodo}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              obj.estado === "completado"
                                ? "bg-[#8BA888]/20 text-[#5A7358]"
                                : obj.estado === "en_riesgo"
                                ? "bg-[#D98E73]/20 text-[#B86E53]"
                                : "bg-[#8BA888]/10 text-[#6D856B]"
                            }`}>
                              {obj.estado.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#2D332D] mt-1.5">{obj.titulo}</h4>
                        </div>
                        <button
                          onClick={() => handleEliminarObjetivo(obj.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#A69D91] hover:text-[#D98E73] rounded transition cursor-pointer"
                          title="Eliminar objetivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Barra de Progreso y Botón +1 */}
                      <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE2D6]/70">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#7A7167]">
                            Progreso: <strong className="text-[#2D332D]">{obj.meta.progresoActual}</strong> / {obj.meta.objetivoNumerico} {obj.meta.unidad}
                          </span>
                          <span className="font-bold text-[#6D856B]">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#EAE2D6] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#8BA888] h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-[#A69D91] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Crítico: {obj.franjaCritica.replace("_", " ")}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResetProgreso(obj.id)}
                              className="px-2 py-0.5 rounded-lg text-[10px] text-[#7A7167] hover:bg-[#EAE2D6] transition cursor-pointer"
                              title="Reiniciar progreso"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIncrementarProgreso(obj.id)}
                              className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#8BA888] text-white hover:bg-[#6D856B] transition cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>+1 Éxito</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Decreto Clave */}
                      {obj.decretoClave && (
                        <blockquote className="text-[11px] italic text-[#4A443F] bg-[#8BA888]/5 border-l-2 border-[#8BA888] pl-2.5 py-1">
                          "{obj.decretoClave}"
                        </blockquote>
                      )}

                      {/* Protocolo */}
                      {obj.protocoloPasos.length > 0 && (
                        <div className="space-y-1 text-[11px] text-[#7A7167]">
                          <span className="font-bold text-[#4A443F] block">Protocolo de Acción:</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {obj.protocoloPasos.slice(0, 3).map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Éxitos y Obstáculos Recientes */}
                      {obj.exitosRegistrados.length > 0 && (
                        <div className="pt-2 border-t border-[#EAE2D6]/60">
                          <span className="text-[10px] font-bold text-[#5A7358] uppercase block mb-1">
                            ✓ Último éxito ({obj.exitosRegistrados[0].fecha} {obj.exitosRegistrados[0].hora} hs):
                          </span>
                          <p className="text-[11px] text-[#4A443F] bg-[#8BA888]/10 p-2 rounded-xl">
                            <strong>Método valorado:</strong> {obj.exitosRegistrados[0].metodoAplicado}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* PANEL 2: DISCIPLINA PRODUCTIVA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#8BA888]/20 text-[#6D856B] flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2D332D]">Disciplina Productiva & Hábitos</h3>
                    <p className="text-[11px] text-[#7A7167]">Rutina 6:45 AM, entreno 7:30, ingeniería 5:00 PM y día no cero.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8BA888]/15 text-[#5A7358]">
                  {objetivosProductivos.length} activos
                </span>
              </div>

              {objetivosProductivos.length === 0 ? (
                <div className="bg-white border border-[#EAE2D6] rounded-3xl p-8 text-center space-y-2">
                  <Zap className="h-8 w-8 text-[#A69D91] mx-auto" />
                  <p className="text-xs text-[#7A7167]">No tienes objetivos productivos cargados.</p>
                </div>
              ) : (
                objetivosProductivos.map((obj) => {
                  const ratio = Math.min(1, obj.meta.progresoActual / Math.max(1, obj.meta.objetivoNumerico));
                  const pct = Math.round(ratio * 100);

                  return (
                    <div
                      key={obj.id}
                      className="bg-white border border-[#EAE2D6] rounded-3xl p-5 shadow-xs space-y-3 relative group hover:border-[#8BA888]/50 transition"
                    >
                      {/* Header de la tarjeta */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A7167] border border-[#EAE2D6] uppercase">
                              {obj.periodo}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              obj.estado === "completado"
                                ? "bg-[#8BA888]/20 text-[#5A7358]"
                                : obj.estado === "en_riesgo"
                                ? "bg-[#D98E73]/20 text-[#B86E53]"
                                : "bg-[#8BA888]/10 text-[#6D856B]"
                            }`}>
                              {obj.estado.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#2D332D] mt-1.5">{obj.titulo}</h4>
                        </div>
                        <button
                          onClick={() => handleEliminarObjetivo(obj.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#A69D91] hover:text-[#D98E73] rounded transition cursor-pointer"
                          title="Eliminar objetivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Barra de Progreso y Botón +1 */}
                      <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE2D6]/70">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#7A7167]">
                            Cumplimiento: <strong className="text-[#2D332D]">{obj.meta.progresoActual}</strong> / {obj.meta.objetivoNumerico} {obj.meta.unidad}
                          </span>
                          <span className="font-bold text-[#6D856B]">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#EAE2D6] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#8BA888] h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-[#A69D91] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Franja: {obj.franjaCritica.replace("_", " ")}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResetProgreso(obj.id)}
                              className="px-2 py-0.5 rounded-lg text-[10px] text-[#7A7167] hover:bg-[#EAE2D6] transition cursor-pointer"
                              title="Reiniciar progreso"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIncrementarProgreso(obj.id)}
                              className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#8BA888] text-white hover:bg-[#6D856B] transition cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>+1 Día/Bloque</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Decreto Clave */}
                      {obj.decretoClave && (
                        <blockquote className="text-[11px] italic text-[#4A443F] bg-[#8BA888]/5 border-l-2 border-[#8BA888] pl-2.5 py-1">
                          "{obj.decretoClave}"
                        </blockquote>
                      )}

                      {/* Protocolo */}
                      {obj.protocoloPasos.length > 0 && (
                        <div className="space-y-1 text-[11px] text-[#7A7167]">
                          <span className="font-bold text-[#4A443F] block">Pasos Operativos:</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {obj.protocoloPasos.slice(0, 3).map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Obstáculos y Éxitos Recientes */}
                      {obj.obstaculosRegistrados.length > 0 && (
                        <div className="pt-2 border-t border-[#EAE2D6]/60">
                          <span className="text-[10px] font-bold text-[#D98E73] uppercase block mb-1">
                            ⚠️ Fricción registrada ({obj.obstaculosRegistrados[0].hora} hs):
                          </span>
                          <p className="text-[11px] text-[#7A7167] bg-[#D98E73]/10 p-2 rounded-xl">
                            {obj.obstaculosRegistrados[0].detonante}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUBTAB 1: REPORTES DIARIOS ESTRUCTURADOS (CAPA C)
          ======================================================== */}
      {activeSubTab === "reportes" && (
        <div className="space-y-6">
          
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider">
              Historial de Reportes Estructurados
            </h3>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="text-xs text-[#6D856B] hover:text-[#2D332D] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Redactar reporte manual</span>
            </button>
          </div>

          {dailyReports.length === 0 ? (
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-[#8BA888]/15 text-[#6D856B] flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-[#2D332D]">No hay reportes diarios estructurados todavía</h4>
              <p className="text-xs text-[#7A7167] max-w-sm mx-auto">
                Haz clic en <strong>"Generar con IA"</strong> para compilar tus conversaciones y registros de hoy en un balance estructurado, o redacta uno manualmente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dailyReports.map((report) => (
                <div 
                  key={report.id} 
                  className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4 relative group hover:border-[#8BA888]/50 transition"
                >
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-[#7A7167] hover:text-rose-600 rounded transition cursor-pointer"
                    title="Eliminar reporte"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-[#EAE2D6]/60 pb-3 pr-6">
                    <span className="text-xs font-bold text-[#2D332D] bg-[#F5F1E8] px-2.5 py-1 rounded-xl">
                      📅 {report.date}
                    </span>
                    {report.projectStatus && (
                      <span className="text-[10px] font-bold text-[#6D856B] bg-[#8BA888]/15 px-2 py-0.5 rounded-full">
                        {report.projectStatus}
                      </span>
                    )}
                  </div>

                  {/* Body grid */}
                  <div className="space-y-3 text-xs">
                    {report.goals && report.goals.length > 0 && (
                      <div>
                        <p className="font-bold text-[#7A7167] text-[10px] uppercase tracking-wider mb-1">
                          🎯 Objetivos
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[#4A443F]">
                          {report.goals.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.results && report.results.length > 0 && (
                      <div>
                        <p className="font-bold text-[#6D856B] text-[10px] uppercase tracking-wider mb-1">
                          ✓ Resultados
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[#4A443F]">
                          {report.results.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.problems && report.problems.length > 0 && (
                      <div>
                        <p className="font-bold text-[#D98E73] text-[10px] uppercase tracking-wider mb-1">
                          ⚠️ Fricciones / Bloqueos
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[#4A443F]">
                          {report.problems.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.decisions && report.decisions.length > 0 && (
                      <div>
                        <p className="font-bold text-[#7A7167] text-[10px] uppercase tracking-wider mb-1">
                          ⚡ Decisiones Tomadas
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-[#4A443F]">
                          {report.decisions.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.generalNote && (
                      <p className="text-[11px] text-[#4A443F] italic pt-1 border-t border-[#EAE2D6]/40 leading-relaxed">
                        "{report.generalNote}"
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Modal for manual report */}
          {isManualModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-[#EAE2D6] pb-3">
                  <h3 className="text-sm font-bold text-[#2D332D]">Redactar Reporte Diario Estructurado</h3>
                  <button onClick={() => setIsManualModalOpen(false)} className="text-[#7A7167] p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveManualReport} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Fecha</label>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Objetivos del Día (1 por línea)</label>
                    <textarea
                      rows={2}
                      value={manualGoals}
                      onChange={(e) => setManualGoals(e.target.value)}
                      placeholder="Ej: Avanzar 2 secciones de Tesis&#10;Hacer 52/17 sin pantallas"
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Resultados Obtenidos (1 por línea)</label>
                    <textarea
                      rows={2}
                      value={manualResults}
                      onChange={(e) => setManualResults(e.target.value)}
                      placeholder="Ej: Completadas las 2 secciones con éxito"
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Problemas o Bloqueos Surgidos</label>
                    <textarea
                      rows={2}
                      value={manualProblems}
                      onChange={(e) => setManualProblems(e.target.value)}
                      placeholder="Ej: Pérdida de inercia pasadas las 14:00"
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Decisiones Tomadas</label>
                    <input
                      type="text"
                      value={manualDecisions}
                      onChange={(e) => setManualDecisions(e.target.value)}
                      placeholder="Ej: Cortar estudio a las 12:30"
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Patrón Observado</label>
                    <input
                      type="text"
                      value={manualPatterns}
                      onChange={(e) => setManualPatterns(e.target.value)}
                      placeholder="Ej: Mayor foco entre 08:00 y 11:00"
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A7167] uppercase mb-1">Nota General</label>
                    <textarea
                      rows={2}
                      value={manualGeneralNote}
                      onChange={(e) => setManualGeneralNote(e.target.value)}
                      placeholder="Reflexión de cierre del día"
                      className="w-full px-3 py-1.5 border border-[#EAE2D6] rounded-xl outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className="px-4 py-2 border border-[#EAE2D6] rounded-xl font-bold text-xs text-[#7A7167]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#8BA888] hover:bg-[#6D856B] text-white rounded-xl font-bold text-xs"
                    >
                      Guardar Reporte
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          SUBTAB 2: REGISTROS RÁPIDOS (SLIDERS & LOGS)
          ======================================================== */}
      {activeSubTab === "rapidos" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <form onSubmit={handleSaveLog} className="lg:col-span-3 bg-white border border-[#EAE2D6] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-[#EAE2D6] pb-4">
              <Sliders className="h-4 w-4 text-[#8BA888]" />
              <h3 className="text-sm font-bold text-[#2D332D]">Registrar Estado Rápido de Hoy</h3>
            </div>

            <div className="space-y-6">
              {/* Slider 1: Energía */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#4A443F] uppercase tracking-wider">Nivel de Energía</label>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getEnergyLabel(energy).color}`}>
                    {getEnergyLabel(energy).label} ({energy}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full accent-[#8BA888] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer transition"
                />
              </div>

              {/* Slider 2: Motivación */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#4A443F] uppercase tracking-wider">Nivel de Motivación</label>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getMotivationLabel(motivation).color}`}>
                    {getMotivationLabel(motivation).label} ({motivation}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={motivation}
                  onChange={(e) => setMotivation(parseInt(e.target.value))}
                  className="w-full accent-[#8BA888] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer transition"
                />
              </div>

              {/* Slider 3: Estrés */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#4A443F] uppercase tracking-wider">Nivel de Estrés</label>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${getStressLabel(stress).color}`}>
                    {getStressLabel(stress).label} ({stress}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                  className="w-full accent-[#8BA888] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer transition"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5">
                  <NotepadText className="h-4 w-4 text-[#7A7167]" />
                  <label className="text-xs font-bold text-[#4A443F] uppercase tracking-wider">Notas de Contexto (Introspección)</label>
                </div>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="block w-full px-4 py-3 border border-[#EAE2D6] rounded-2xl text-[#4A443F] placeholder-[#A69D91] text-xs outline-none resize-none transition focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888]"
                  placeholder="¿Qué ocurrió en tu jornada? ¿Qué pensabas? ¿Qué hiciste al respecto? ¿Utilizaste alguna técnica?"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl shadow-md text-xs font-bold text-white bg-[#8BA888] hover:bg-[#6D856B] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Guardar Registro Rápido
            </button>
          </form>

          {/* Historical Logs List */}
          <div className="lg:col-span-2 bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4 shrink-0">
              <h3 className="text-sm font-bold text-[#2D332D]">Historial de Registros Rápidos</h3>
              <span className="text-[10px] bg-[#F9F6F1] text-[#7A7167] font-bold px-2 py-0.5 rounded-full">
                {logs.length} Días
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-[#A69D91] text-center py-12">
                  No has guardado registros diarios aún.
                </p>
              ) : (
                logs.map((log) => {
                  const dateObj = new Date(log.createdAt);
                  const dayStr = dateObj.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={log.id} className="border border-[#EAE2D6]/80 bg-[#F9F6F1]/50 rounded-2xl p-4 relative group space-y-3 hover:bg-[#F9F6F1] transition">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#D98E73]/10 text-[#7A7167] hover:text-[#D98E73] transition cursor-pointer shrink-0"
                        title="Eliminar este registro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div>
                        <h4 className="text-xs font-bold text-[#4A443F] capitalize leading-tight">{dayStr}</h4>
                        <p className="text-[9px] text-[#A69D91] mt-0.5">{timeStr}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <div className="bg-white border border-[#EAE2D6] rounded-lg p-1.5 text-center">
                          <p className="text-[8px] text-[#A69D91] uppercase tracking-wider font-bold">Energía</p>
                          <p className="text-xs font-extrabold text-[#8BA888] mt-0.5">{log.energy}</p>
                        </div>
                        <div className="bg-white border border-[#EAE2D6] rounded-lg p-1.5 text-center">
                          <p className="text-[8px] text-[#A69D91] uppercase tracking-wider font-bold">Motivación</p>
                          <p className="text-xs font-extrabold text-[#7A7167] mt-0.5">{log.motivation}</p>
                        </div>
                        <div className="bg-white border border-[#EAE2D6] rounded-lg p-1.5 text-center">
                          <p className="text-[8px] text-[#A69D91] uppercase tracking-wider font-bold">Estrés</p>
                          <p className="text-xs font-extrabold text-[#D98E73] mt-0.5">{log.stress}</p>
                        </div>
                      </div>

                      <p className="text-xs text-[#4A443F] leading-relaxed font-medium whitespace-pre-wrap">
                        {log.note}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
