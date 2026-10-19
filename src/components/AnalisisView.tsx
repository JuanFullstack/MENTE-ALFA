/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart2, Sparkles, RefreshCw, AlertCircle, Plus, Trash2, 
  CheckCircle2, Ban, ShieldCheck, Target
} from "lucide-react";
import { DailyLog, Memory, Conversation, Pattern, Strategy, Decision, CurrentState } from "../types";
import { UserProfile } from "../lib/storage";
import { getStoredGroqApiKey, getStoredGroqModel } from "../services/groqEvaluation";
import { 
  createEstrategiaPB, 
  deleteEstrategiaPB, 
  createPatronPB, 
  deletePatronPB 
} from "../services/pocketbaseService";

interface AnalisisViewProps {
  logs: DailyLog[];
  memories: Memory[];
  conversations: Conversation[];
  patterns: Pattern[];
  strategies: Strategy[];
  currentState: CurrentState;
  decisions: Decision[];
  profile: UserProfile;
  onUpdatePatterns: (patterns: Pattern[]) => void;
  onUpdateStrategies: (strategies: Strategy[]) => void;
  onUpdateDecisions: (decisions: Decision[]) => void;
  onUpdateCurrentState: (state: CurrentState) => void;
}

interface AIAnalysisResult {
  mentalClarity: number;
  stressLevel: 'Bajo' | 'Moderado' | 'Alto';
  correlations: { type: 'dato observado' | 'asociación' | 'hipótesis'; description: string }[];
  weeklyHistory: { day: string; motivation: number; stress: number; energy: number }[];
  frequentThemes: string[];
}

export default function AnalisisView({
  logs,
  memories,
  conversations,
  patterns,
  strategies,
  currentState,
  decisions,
  profile,
  onUpdatePatterns,
  onUpdateStrategies,
  onUpdateDecisions,
  onUpdateCurrentState,
}: AnalisisViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Core metrics
  const [mentalClarity, setMentalClarity] = useState(78);
  const [stressLevel, setStressLevel] = useState<'Bajo' | 'Moderado' | 'Alto'>('Moderado');
  const [frequentThemes, setFrequentThemes] = useState<string[]>([
    "Franja matutina 07:00 a 12:00", 
    "Avance de Tesis GitFlow", 
    "Método Yo Robot"
  ]);

  // Historical week data
  const [weeklyHistory, setWeeklyHistory] = useState<AIAnalysisResult["weeklyHistory"]>([
    { day: "Lun", motivation: 7, stress: 4, energy: 6 },
    { day: "Mar", motivation: 6, stress: 5, energy: 5 },
    { day: "Mie", motivation: 8, stress: 3, energy: 7 },
    { day: "Jue", motivation: 5, stress: 6, energy: 4 },
    { day: "Vie", motivation: 6, stress: 4, energy: 6 },
  ]);

  // Strategy creator state
  const [stratName, setStratName] = useState("");
  const [stratSit, setStratSit] = useState("");
  const [stratRes, setStratRes] = useState("");
  const [stratReason, setStratReason] = useState("");
  const [stratResultType, setStratResultType] = useState<'positivo' | 'negativo'>('positivo');
  const [stratStatus, setStratStatus] = useState<'recomendada' | 'en prueba' | 'descartada'>('recomendada');
  const [stratEff, setStratEff] = useState<'baja' | 'media' | 'alta'>('alta');

  // Decision creator state
  const [decText, setDecText] = useState("");
  const [decReason, setDecReason] = useState("");
  const [decStatus, setDecStatus] = useState<'en prueba' | 'consolidada' | 'descartada'>('en prueba');

  // New goal & problem state
  const [newGoalInput, setNewGoalInput] = useState("");
  const [newProblemInput, setNewProblemInput] = useState("");

  // Trigger real AI analysis over logs, memories, decisions, and strategies
  const handleTriggerAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const summariesList = conversations
      .filter((c) => c.isSummarized && c.summary)
      .map((c) => c.summary);

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (groqKey) {
        headers["x-groq-api-key"] = groqKey;
        headers["x-groq-model"] = groqModel;
      }

      const response = await fetch("/api/analyze-patterns", {
        method: "POST",
        headers,
        body: JSON.stringify({
          logs,
          memories: memories.filter((m) => m.isApproved),
          summaries: summariesList,
          currentState,
          decisions,
          strategies,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el motor analítico.");
      }

      const data: AIAnalysisResult = await response.json();

      setMentalClarity(data.mentalClarity);
      setStressLevel(data.stressLevel);
      setFrequentThemes(data.frequentThemes);
      setWeeklyHistory(data.weeklyHistory);

      const newPatterns: Pattern[] = data.correlations.map((c, index) => ({
        id: `pat-ai-${Date.now()}-${index}`,
        type: c.type,
        description: c.description,
        createdAt: new Date().toISOString(),
      }));

      onUpdatePatterns(newPatterns);
      newPatterns.forEach((p) => createPatronPB(p).catch(console.warn));
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Error al solicitar análisis de patrones.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add new strategy
  const handleAddStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stratName.trim() || !stratSit.trim() || !stratRes.trim()) return;

    const newStrat: Strategy = {
      id: `strat-${Date.now()}`,
      name: stratName.trim(),
      situation: stratSit.trim(),
      result: stratRes.trim(),
      effectiveness: stratEff,
      status: stratStatus,
      resultType: stratResultType,
      reason: stratReason.trim() || (stratResultType === 'positivo' ? "Alta eficacia observada" : "Frustración o fricción detectada"),
      createdAt: new Date().toISOString(),
    };

    onUpdateStrategies([newStrat, ...strategies]);
    createEstrategiaPB(newStrat).catch(console.warn);

    setStratName("");
    setStratSit("");
    setStratRes("");
    setStratReason("");
    setStratResultType("positivo");
    setStratStatus("recomendada");
    setStratEff("alta");
  };

  // Add new decision
  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decText.trim() || !decReason.trim()) return;

    const newDec: Decision = {
      id: `dec-${Date.now()}`,
      date: new Date().toISOString(),
      decision: decText.trim(),
      reason: decReason.trim(),
      status: decStatus,
    };

    onUpdateDecisions([newDec, ...decisions]);
    setDecText("");
    setDecReason("");
    setDecStatus("en prueba");
  };

  const handleUpdateDecisionStatus = (id: string, newStatus: 'en prueba' | 'consolidada' | 'descartada') => {
    onUpdateDecisions(
      decisions.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const handleDeleteDecision = (id: string) => {
    onUpdateDecisions(decisions.filter((d) => d.id !== id));
  };

  const handleDeleteStrategy = (id: string) => {
    onUpdateStrategies(strategies.filter((s) => s.id !== id));
    deleteEstrategiaPB(id).catch(console.warn);
  };

  const handleDeletePattern = (id: string) => {
    onUpdatePatterns(patterns.filter((p) => p.id !== id));
    deletePatronPB(id).catch(console.warn);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    onUpdateCurrentState({
      ...currentState,
      activeGoals: [...(currentState.activeGoals || []), newGoalInput.trim()],
      updatedAt: new Date().toISOString(),
    });
    setNewGoalInput("");
  };

  const handleDeleteGoal = (index: number) => {
    const updated = currentState.activeGoals.filter((_, i) => i !== index);
    onUpdateCurrentState({ ...currentState, activeGoals: updated, updatedAt: new Date().toISOString() });
  };

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemInput.trim()) return;
    onUpdateCurrentState({
      ...currentState,
      openProblems: [...(currentState.openProblems || []), newProblemInput.trim()],
      updatedAt: new Date().toISOString(),
    });
    setNewProblemInput("");
  };

  const handleDeleteProblem = (index: number) => {
    const updated = currentState.openProblems.filter((_, i) => i !== index);
    onUpdateCurrentState({ ...currentState, openProblems: updated, updatedAt: new Date().toISOString() });
  };

  const getSVGPath = (key: 'motivation' | 'stress' | 'energy', strokeColor: string) => {
    if (weeklyHistory.length === 0) return "";
    const paddingX = 50;
    const paddingY = 20;
    const width = 400;
    const height = 140;

    const points = weeklyHistory.map((h, index) => {
      const x = paddingX + (index / (weeklyHistory.length - 1)) * (width - paddingX);
      const metricVal = h[key];
      const y = paddingY + height - ((metricVal - 1) / 9) * height;
      return `${x},${y}`;
    });

    return points.join(" ");
  };

  const positiveStrategies = strategies.filter((s) => s.resultType === 'positivo' || s.status === 'recomendada');
  const negativeStrategies = strategies.filter((s) => s.resultType === 'negativo' || s.status === 'descartada');

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 font-sans pb-20 md:pb-8">
      
      {/* 1. Header with trigger button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAE2D6] pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#8BA888] text-white flex items-center justify-center shadow-lg shadow-[#8BA888]/10 shrink-0">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D332D]">Patrones, Decisiones y Opciones Aprendidas</h2>
            <p className="text-xs text-[#7A7167] mt-0.5">
              Jerarquía de conocimiento: qué funcionó vs qué no, acuerdos previos y estado dinámico de {profile.userName}.
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerAIAnalysis}
          disabled={isAnalyzing || logs.length === 0}
          className="flex items-center gap-2 py-2.5 px-4 bg-[#8BA888] hover:bg-[#6D856B] disabled:bg-[#EAE2D6] disabled:text-[#A69D91] text-white font-bold text-xs rounded-xl shadow-md transition shrink-0 cursor-pointer"
        >
          {isAnalyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isAnalyzing ? "Analizando registros..." : "Ejecutar Análisis con IA"}
        </button>
      </div>

      {analysisError && (
        <div className="p-4 rounded-2xl bg-[#D98E73]/10 border border-[#D98E73]/20 flex items-start gap-3 text-xs text-[#B06A52]">
          <AlertCircle className="h-5 w-5 shrink-0 text-[#D98E73] mt-0.5" />
          <div>
            <p className="font-bold">Ocurrió un error en el análisis</p>
            <p className="mt-0.5">{analysisError}</p>
          </div>
        </div>
      )}

      {/* 2. Top Grid: Claridad Mental & Tendencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider self-start">Claridad Mental Estimada</h3>
          
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#EAE2D6"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#8BA888"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * mentalClarity) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-[#4A443F] tracking-tight">{mentalClarity}%</span>
              <p className="text-[9px] text-[#7A7167] uppercase tracking-widest font-bold mt-0.5">Estable</p>
            </div>
          </div>

          <p className="text-xs text-[#7A7167] leading-normal max-w-xs">
            Refleja la consistencia en el cumplimiento de la franja matutina y la regulación del estrés.
          </p>
        </div>

        <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-[#EAE2D6] pb-3 shrink-0">
            <div>
              <h3 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider">Historial de Tendencia de Bienestar</h3>
              <p className="text-[10px] text-[#A69D91] mt-0.5">Fluctuación en los últimos 5 días</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-[#6D856B]"><span className="h-2 w-2 rounded-full bg-[#8BA888]" /> Energía</span>
              <span className="flex items-center gap-1.5 text-[#7A7167]"><span className="h-2 w-2 rounded-full bg-[#A69D91]" /> Motivación</span>
              <span className="flex items-center gap-1.5 text-[#D98E73]"><span className="h-2 w-2 rounded-full bg-[#D98E73]" /> Estrés</span>
            </div>
          </div>

          <div className="flex-1 min-h-[140px] relative pt-4">
            <svg className="w-full h-full min-h-[140px]">
              <line x1="50" y1="20" x2="400" y2="20" stroke="#EAE2D6" strokeWidth="1" />
              <line x1="50" y1="90" x2="400" y2="90" stroke="#EAE2D6" strokeWidth="1" />
              <line x1="50" y1="160" x2="400" y2="160" stroke="#EAE2D6" strokeWidth="1" />

              <polyline fill="none" stroke="#8BA888" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={getSVGPath("energy", "#8BA888")} />
              <polyline fill="none" stroke="#A69D91" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={getSVGPath("motivation", "#A69D91")} />
              <polyline fill="none" stroke="#D98E73" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={getSVGPath("stress", "#D98E73")} />

              {weeklyHistory.map((h, idx) => {
                const x = 50 + (idx / (weeklyHistory.length - 1)) * 350;
                return (
                  <text key={idx} x={x} y="178" fill="#7A7167" fontSize="10" textAnchor="middle" fontWeight="bold">
                    {h.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Capa E: Qué Funcionó vs Qué NO Funcionó (Comparativa de Aprendizaje) */}
      <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-[#EAE2D6] pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-[#2D332D] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#8BA888]" />
              Capa E: Opciones y Estrategias ("Qué Funcionó" vs "Qué NO Funcionó")
            </h3>
            <p className="text-[11px] text-[#7A7167] mt-0.5">
              La IA consulta esta base antes de sugerir cualquier solución para evitar repetir errores conocidos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna 1: Qué Funcionó (Recomendadas) */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Qué FUNCIONÓ (Estrategias Recomendadas)</span>
            </div>

            <div className="space-y-3">
              {positiveStrategies.length === 0 ? (
                <p className="text-[11px] text-emerald-700/70 italic">No hay estrategias positivas registradas aún.</p>
              ) : (
                positiveStrategies.map((strat) => (
                  <div key={strat.id} className="bg-white border border-emerald-200 rounded-xl p-3 space-y-1.5 shadow-2xs relative group">
                    <button
                      onClick={() => handleDeleteStrategy(strat.id)}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 text-emerald-700 hover:text-rose-600 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="flex items-center justify-between pr-5">
                      <h4 className="text-xs font-bold text-[#2D332D]">{strat.name}</h4>
                      <span className="text-[9px] font-extrabold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                        {strat.effectiveness}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7A7167]"><strong>Situación:</strong> {strat.situation}</p>
                    <p className="text-[10px] text-emerald-900 font-medium"><strong>Resultado:</strong> {strat.result}</p>
                    {strat.reason && <p className="text-[9px] text-[#A69D91]"><strong>Razón de éxito:</strong> {strat.reason}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 2: Qué NO Funcionó (Descartadas) */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase">
              <Ban className="h-4 w-4 text-rose-600" />
              <span>Qué NO FUNCIONÓ (Descartadas / Prohibidas)</span>
            </div>

            <div className="space-y-3">
              {negativeStrategies.length === 0 ? (
                <p className="text-[11px] text-rose-700/70 italic">No hay estrategias descartadas registradas.</p>
              ) : (
                negativeStrategies.map((strat) => (
                  <div key={strat.id} className="bg-white border border-rose-200 rounded-xl p-3 space-y-1.5 shadow-2xs relative group">
                    <button
                      onClick={() => handleDeleteStrategy(strat.id)}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 text-rose-700 hover:text-rose-900 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="flex items-center justify-between pr-5">
                      <h4 className="text-xs font-bold text-[#2D332D]">{strat.name}</h4>
                      <span className="text-[9px] font-extrabold text-rose-700 uppercase bg-rose-50 px-1.5 py-0.5 rounded">
                        DESCARTADA
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7A7167]"><strong>Situación:</strong> {strat.situation}</p>
                    <p className="text-[10px] text-rose-950 font-medium"><strong>Fracasó:</strong> {strat.result}</p>
                    {strat.reason && <p className="text-[9px] text-rose-800/80"><strong>Motivo de descarte:</strong> {strat.reason}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Formulario para agregar Estrategia / Aprendizaje */}
        <div className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-[#2D332D]">Añadir Estrategia o Aprendizaje Manual</h4>
          <form onSubmit={handleAddStrategy} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Nombre de la estrategia"
              value={stratName}
              onChange={(e) => setStratName(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            />
            <input
              type="text"
              required
              placeholder="Situación (ej. Bloqueo al programar)"
              value={stratSit}
              onChange={(e) => setStratSit(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            />
            <input
              type="text"
              required
              placeholder="Resultado obtenido"
              value={stratRes}
              onChange={(e) => setStratRes(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            />
            <input
              type="text"
              placeholder="Razón / Motivo biológico"
              value={stratReason}
              onChange={(e) => setStratReason(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            />
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
              <select
                value={stratResultType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setStratResultType(val);
                  setStratStatus(val === 'positivo' ? 'recomendada' : 'descartada');
                }}
                className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none flex-1"
              >
                <option value="positivo">✓ Funcionó (Recomendada)</option>
                <option value="negativo">✕ NO Funcionó (Descartada)</option>
              </select>
              <select
                value={stratEff}
                onChange={(e) => setStratEff(e.target.value as any)}
                className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none flex-1"
              >
                <option value="alta">Eficacia Alta</option>
                <option value="media">Eficacia Media</option>
                <option value="baja">Eficacia Baja</option>
              </select>
            </div>
            <button
              type="submit"
              className="sm:col-span-2 lg:col-span-2 py-2 px-4 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Guardar en Capa E (Estrategias)
            </button>
          </form>
        </div>
      </div>

      {/* 4. Capa D: Memoria de Decisiones Tomadas */}
      <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-[#EAE2D6] pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-[#2D332D] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#8BA888]" />
              Capa D: Memoria de Decisiones Tomadas (Continuidad y Acuerdos)
            </h3>
            <p className="text-[11px] text-[#7A7167] mt-0.5">
              Permite a la IA evaluar contigo si los compromisos previos se cumplieron antes de cambiar de rumbo.
            </p>
          </div>
          <span className="text-[10px] bg-[#F9F6F1] font-bold px-2 py-0.5 rounded-full text-[#7A7167]">
            {decisions.length} Acuerdos
          </span>
        </div>

        <div className="space-y-3">
          {decisions.length === 0 ? (
            <p className="text-xs text-[#A69D91] italic py-3">No hay decisiones previas registradas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decisions.map((dec) => {
                const statusColor =
                  dec.status === "consolidada"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : dec.status === "en prueba"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-rose-50 text-rose-800 border-rose-200";

                return (
                  <div key={dec.id} className="border border-[#EAE2D6] bg-[#FBF9F4] rounded-2xl p-4 space-y-2 relative group shadow-2xs">
                    <button
                      onClick={() => handleDeleteDecision(dec.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-[#7A7167] hover:text-rose-600 rounded transition"
                      title="Eliminar decisión"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center justify-between pr-6">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {dec.status}
                      </span>
                      <span className="text-[10px] text-[#A69D91]">
                        {new Date(dec.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#2D332D] leading-snug">
                      "{dec.decision}"
                    </h4>
                    <p className="text-[10px] text-[#7A7167]">
                      <strong>Motivo:</strong> {dec.reason}
                    </p>

                    <div className="pt-2 border-t border-[#EAE2D6]/60 flex items-center justify-between text-[10px]">
                      <span className="text-[#A69D91]">Cambiar estado:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateDecisionStatus(dec.id, "en prueba")}
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold ${dec.status === "en prueba" ? "bg-amber-600 text-white" : "bg-white border border-[#EAE2D6]"}`}
                        >
                          En prueba
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateDecisionStatus(dec.id, "consolidada")}
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold ${dec.status === "consolidada" ? "bg-emerald-600 text-white" : "bg-white border border-[#EAE2D6]"}`}
                        >
                          Consolidada
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateDecisionStatus(dec.id, "descartada")}
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold ${dec.status === "descartada" ? "bg-rose-600 text-white" : "bg-white border border-[#EAE2D6]"}`}
                        >
                          Descartada
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario nueva decisión */}
        <form onSubmit={handleAddDecision} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-[#2D332D]">Registrar Nueva Decisión / Compromiso</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Decisión (ej. Estudiar de 09:00 a 12:00)"
              value={decText}
              onChange={(e) => setDecText(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            />
            <select
              value={decStatus}
              onChange={(e) => setDecStatus(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            >
              <option value="en prueba">En prueba</option>
              <option value="consolidada">Consolidada</option>
              <option value="descartada">Descartada</option>
            </select>
            <input
              type="text"
              required
              placeholder="Motivo / Fundamento (ej. Mayor claridad mental biológica)"
              value={decReason}
              onChange={(e) => setDecReason(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
            />
            <button
              type="submit"
              className="py-1.5 px-4 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Guardar Decisión
            </button>
          </div>
        </form>
      </div>

      {/* 5. Capa B: Estado Actual Dinámico */}
      <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-[#EAE2D6] pb-3">
          <h3 className="text-sm font-bold text-[#2D332D] flex items-center gap-2">
            <Target className="h-4 w-4 text-[#8BA888]" />
            Capa B: Estado Actual Dinámico
          </h3>
          <p className="text-[11px] text-[#7A7167] mt-0.5">
            Metas activas y problemas abiertos que la IA tiene presentes en cada respuesta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Metas Activas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#6D856B] uppercase tracking-wider">Objetivos Activos</h4>
            <div className="space-y-2">
              {(currentState.activeGoals || []).map((goal, idx) => (
                <div key={idx} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-xl p-2.5 flex items-center justify-between text-xs text-[#2D332D] shadow-2xs">
                  <span>{goal}</span>
                  <button onClick={() => handleDeleteGoal(idx)} className="text-[#A69D91] hover:text-rose-600 p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir nuevo objetivo activo..."
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#FBF9F4] border border-[#EAE2D6] rounded-xl text-xs outline-none"
              />
              <button type="submit" className="px-3 py-1.5 bg-[#8BA888] text-white text-xs font-bold rounded-xl">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Problemas / Bloqueos Abiertos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D98E73] uppercase tracking-wider">Problemas / Bloqueos Abiertos</h4>
            <div className="space-y-2">
              {(currentState.openProblems || []).map((prob, idx) => (
                <div key={idx} className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-rose-950 shadow-2xs">
                  <span>{prob}</span>
                  <button onClick={() => handleDeleteProblem(idx)} className="text-rose-400 hover:text-rose-700 p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddProblem} className="flex gap-2">
              <input
                type="text"
                placeholder="Registrar nuevo problema abierto..."
                value={newProblemInput}
                onChange={(e) => setNewProblemInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#FBF9F4] border border-[#EAE2D6] rounded-xl text-xs outline-none"
              />
              <button type="submit" className="px-3 py-1.5 bg-[#B06A52] text-white text-xs font-bold rounded-xl">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* 6. Insights y Patrones Detectados */}
      <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-[#EAE2D6] pb-3 flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider">Insights y Patrones de Comportamiento</h3>
          <span className="text-[10px] text-[#A69D91] font-semibold">{patterns.length} Observaciones</span>
        </div>

        <div className="space-y-3">
          {patterns.length === 0 ? (
            <p className="text-xs text-[#A69D91] italic py-2">No hay patrones detectados aún.</p>
          ) : (
            patterns.map((pat) => (
              <div key={pat.id} className="border border-[#EAE2D6] bg-[#F9F6F1]/40 p-3 rounded-2xl flex items-start justify-between gap-3 group">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-[#8BA888]/10 text-[#6D856B] rounded-full text-[9px] font-bold uppercase">
                    {pat.type}
                  </span>
                  <p className="text-xs text-[#4A443F] font-medium leading-relaxed mt-1">
                    {pat.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePattern(pat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#7A7167] hover:text-rose-600 transition"
                  title="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
