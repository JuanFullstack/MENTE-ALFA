/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CalendarRange, Plus, Trash2, Sliders, NotepadText, Sparkles, 
  CheckCircle2, AlertTriangle, ShieldCheck, FileText, ChevronRight, BookmarkCheck, RefreshCw
} from "lucide-react";
import { DailyLog, DailyReport, Message, CurrentState, Decision, Strategy } from "../types";
import { UserProfile } from "../lib/storage";
import { getStoredGroqApiKey, getStoredGroqModel } from "../services/groqEvaluation";
import { createRegistroPB, deleteRegistroPB } from "../services/pocketbaseService";

interface RegistrosViewProps {
  logs: DailyLog[];
  dailyReports: DailyReport[];
  messages: Message[];
  profile: UserProfile;
  currentState: CurrentState;
  decisions: Decision[];
  strategies: Strategy[];
  onUpdateLogs: (logs: DailyLog[]) => void;
  onUpdateDailyReports: (reports: DailyReport[]) => void;
}

export default function RegistrosView({ 
  logs, 
  dailyReports, 
  messages, 
  profile, 
  currentState, 
  decisions, 
  strategies, 
  onUpdateLogs, 
  onUpdateDailyReports 
}: RegistrosViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"reportes" | "rapidos">("reportes");

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

  // Save quick numeric log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      energy,
      motivation,
      stress,
      note: note.trim() || "Sin notas escritas.",
    };

    onUpdateLogs([newLog, ...logs]);
    createRegistroPB(newLog).catch(console.warn);
    setNote("");
    setEnergy(6);
    setMotivation(7);
    setStress(4);
  };

  const handleDeleteLog = (id: string) => {
    onUpdateLogs(logs.filter((l) => l.id !== id));
    deleteRegistroPB(id).catch(console.warn);
  };

  const handleDeleteReport = (id: string) => {
    onUpdateDailyReports(dailyReports.filter((r) => r.id !== id));
  };

  // Generate Structured Daily Report using AI (Llama 3.3 / Gemini)
  const handleGenerateAIDailyReport = async () => {
    setIsGeneratingReport(true);
    setReportError(null);

    const todayDateStr = new Date().toISOString().split("T")[0];
    const todaysMessages = messages.filter((m) => m.createdAt.startsWith(todayDateStr) || true).slice(-15);
    const todaysLogs = logs.filter((l) => l.createdAt.startsWith(todayDateStr) || true).slice(-4);

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (groqKey) {
        headers["x-groq-api-key"] = groqKey;
        headers["x-groq-model"] = groqModel;
      }

      const response = await fetch("/api/daily-report", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: todaysMessages,
          logs: todaysLogs,
          date: todayDateStr,
          profile,
          currentState,
          decisions,
          strategies,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo generar el reporte diario estructurado.");
      }

      const data: DailyReport = await response.json();
      onUpdateDailyReports([data, ...dailyReports]);
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
            <CalendarRange className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D332D]">Reportes Diarios y Bitácora</h2>
            <p className="text-xs text-[#7A7167] mt-0.5">
              Capa C: Qué ocurrió realmente en cada jornada (Objetivos vs Resultados, Problemas y Decisiones).
            </p>
          </div>
        </div>

        {/* Action buttons & Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F5F1E8] p-1 rounded-xl border border-[#EAE2D6]">
            <button
              onClick={() => setActiveSubTab("reportes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "reportes"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              Reportes Estructurados ({dailyReports.length})
            </button>
            <button
              onClick={() => setActiveSubTab("rapidos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === "rapidos"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              Registros Rápidos ({logs.length})
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
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg font-semibold">
                        {report.projectStatus}
                      </span>
                    )}
                  </div>

                  {/* Section 1: Goals vs Results */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#EAE2D6]/70 space-y-1">
                        <span className="text-[9px] font-bold text-[#7A7167] uppercase block">🎯 Objetivos</span>
                        <ul className="space-y-1 text-[#2D332D]">
                          {report.goals?.map((g, i) => (
                            <li key={i} className="text-[11px] leading-tight">• {g}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/70 space-y-1">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">✓ Resultado Real</span>
                        <ul className="space-y-1 text-emerald-950">
                          {report.results?.map((r, i) => (
                            <li key={i} className="text-[11px] leading-tight font-medium">• {r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Problems & Decisions */}
                  <div className="space-y-2 text-xs">
                    {report.problems && report.problems.length > 0 && (
                      <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200/60 text-rose-950 space-y-0.5">
                        <span className="text-[9px] font-bold text-rose-700 uppercase block">⚠️ Problemas / Bloqueos:</span>
                        <p className="text-[11px] leading-relaxed">{report.problems.join("; ")}</p>
                      </div>
                    )}

                    {report.decisions && report.decisions.length > 0 && (
                      <div className="bg-[#8BA888]/10 p-2.5 rounded-xl border border-[#8BA888]/30 text-[#2D332D] space-y-0.5">
                        <span className="text-[9px] font-bold text-[#6D856B] uppercase block">💡 Decisiones del día:</span>
                        <p className="text-[11px] leading-relaxed font-medium">{report.decisions.join("; ")}</p>
                      </div>
                    )}

                    {report.observedPatterns && report.observedPatterns.length > 0 && (
                      <div className="pt-1 text-[10px] text-[#7A7167]">
                        <strong>Patrón observado:</strong> {report.observedPatterns.join("; ")}
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

