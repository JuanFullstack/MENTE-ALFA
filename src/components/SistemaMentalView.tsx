/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Brain, Sparkles, BookOpen, ShieldCheck, Target, AlertTriangle, 
  Layers, Edit3, Save, Check, RefreshCw, CheckCircle2, Flame, 
  HelpCircle, ArrowRight, Lightbulb, Clock, Compass, Zap
} from "lucide-react";
import { SistemaMentalData, LifeArea, MentalLimitation, MasterGoal } from "../types";
import { UserProfile } from "../lib/storage";

interface SistemaMentalViewProps {
  data: SistemaMentalData;
  profile: UserProfile;
  onUpdateData: (newData: SistemaMentalData) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

type SubTab = "neurobiologia" | "creencias" | "metodos" | "limitaciones" | "objetivos";

export default function SistemaMentalView({
  data,
  profile,
  onUpdateData,
  onUpdateProfile,
}: SistemaMentalViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("neurobiologia");
  const [isEditing, setIsEditing] = useState(false);
  const [syncedToast, setSyncedToast] = useState<string | null>(null);

  // Local editable copy
  const [editableData, setEditableData] = useState<SistemaMentalData>(data);

  // Sync state if external data changes
  React.useEffect(() => {
    setEditableData(data);
  }, [data]);

  const handleSaveData = () => {
    const updated = {
      ...editableData,
      updatedAt: new Date().toISOString(),
    };
    onUpdateData(updated);
    setIsEditing(false);
    showToast("Cambios guardados con éxito.");
  };

  // Compile condensed AI summary from the current mental framework and update profile.notes
  const handleSyncWithAI = () => {
    const compiledSummary = `## SISTEMA Y MARCO MENTAL DE ${profile.userName.toUpperCase()}:

### 1. NEUROBIOLOGÍA DEL ESTADO ACTUAL:
- Depende del punto de foco (procesos conscientes he inconscientes). La ansiedad inconsciente ante exámenes/futuro dispara evasión y rebeldía sin causa consciente aparente.
- Cambiar de estado requiere cambiar el punto de foco gradualmente y bloquear dudas con convicción (modo OFF/ON).
- Fórmula funcional: ESTADO = f(energía, evento, contexto, pensamiento, creencias, repetición, miedo) EN FOCO.
- Estado A (inercia actual variable o constante; salir con acción diferente o flujo con MÉTODO PREGUNTA-RESPUESTA) vs Estado B (estudio; resistencia ante temas nuevos o abrumamiento por cantidad de temas).
- Áreas de vida: A0 (organización/conductas basales), A1 (trabajo/ingreso), A2 (estudio/Ing. Informática - Tesis GitFlow), A3 (crecimiento personal/desinhibición), A4 (entrenamiento físico).

### 2. CREENCIAS Y LEYES FUNDAMENTALES:
- La Linterna: controlar el foco consciente es controlar la conducta.
- La Duda: "La duda solo se permite en la reflexión, NUNCA en la acción".
- Distanciamiento en 3ra persona ("Juan siente resistencia porque...").
- Enfoque no moral: la apatía es desbalance dopamina/glutamato o alarma de la amígdala.
- Tolerancia absoluta al fallo: el inicio de cualquier cambio es inestable.

### 3. PROTOCOLOS Y MÉTODOS OPERATIVOS:
- Pre-Arranque: Reconocer estado A en tiempo real -> Detener inercia -> Neutralizar -> Pregunta-Respuesta -> Eliminar duda -> Preparación de escritorio -> Arrancar.
- Método Transición (15 min visor espontáneo): 1. Aislación (5m) -> 2. Reconocer y Depurar ('nada importa', cuestionar pensamientos) -> 3. Aceptación con humor y fluir -> 4. Convencimiento -> Test de libertad -> Mantenimiento.
- Criterio DÍA NO CERO: Marcador jamás en cero; protege la identidad disciplinada. Evita el Efecto 'Qué Carajo'. Tríada en días difíciles: 1. 3 min estiramiento, 2. Regla 52/17 sin pantallas, 3. 1 línea de avance (30s). Tríada del Yo: Perdón radical pasado -> Acción presente -> Gratitud futura.
- Método Yo Robot: Conteo 5-4-3-2-1 y micro-metas de 15 min.

### 4. LIMITACIONES CONOCIDAS:
- Ansiedad inconsciente en época de exámenes, evasión/rebeldía, miedo al rechazo, victimización por fallos, dispersión en temas nuevos, fatiga vespertina.

### 5. OBJETIVOS CLAVES:
1. Recibirse de Ingeniero (Tesis GitFlow - A2).
2. Cuidado personal y entrenamiento diario sin sufrirlo (A4).
3. Mejorar autoimagen y seguridad interna (A3/A4).
4. Hombre determinado, libre y espontáneo con Grado de Libertad ('No importa') (A3).
5. Sistematizar rutina 6:40 AM impermeable al autosabotaje (A0/A1).
6. Rutina de inglés diario por patrones.
7. Desarrollo de habilidad para hablar y comunicar en videos.`;

    const updatedData = {
      ...editableData,
      aiSummary: compiledSummary,
      updatedAt: new Date().toISOString(),
    };

    onUpdateData(updatedData);

    // Also inject into user profile notes for the AI chat prompt
    onUpdateProfile({
      ...profile,
      notes: compiledSummary,
    });

    showToast("¡Marco Mental sincronizado y actualizado para la IA!");
  };

  const showToast = (msg: string) => {
    setSyncedToast(msg);
    setTimeout(() => setSyncedToast(null), 3500);
  };

  const tabsConfig = [
    { id: "neurobiologia" as SubTab, label: "1. Neurobiología del Estado", icon: Brain },
    { id: "creencias" as SubTab, label: "2. Creencias & Leyes", icon: Lightbulb },
    { id: "metodos" as SubTab, label: "3. Métodos & Protocolos", icon: Zap },
    { id: "limitaciones" as SubTab, label: "4. Limitaciones & Bloqueos", icon: AlertTriangle },
    { id: "objetivos" as SubTab, label: "5. Objetivos Claves (7 Metas)", icon: Target },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 font-sans pb-24 md:pb-10">
      
      {/* Toast Notification */}
      {syncedToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2D332D] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-[#8BA888]/40">
          <CheckCircle2 className="h-4 w-4 text-[#8BA888]" />
          <span>{syncedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#EAE2D6] pb-4 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#8BA888] text-white flex items-center justify-center shadow-md shadow-[#8BA888]/10 shrink-0">
            <Compass className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#2D332D]">Sistema y Marco Mental</h2>
            <p className="text-[11px] sm:text-xs text-[#7A7167] mt-0.5 leading-snug">
              Leyes biológicas, protocolos de transición, creencias y objetivos de vida estructurados.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveData();
              } else {
                setIsEditing(true);
              }
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition cursor-pointer ${
              isEditing 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-white border border-[#EAE2D6] hover:bg-[#F5F1E8] text-[#2D332D]"
            }`}
          >
            {isEditing ? <Save className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5 text-[#7A7167]" />}
            <span>{isEditing ? "Guardar" : "Modo Edición"}</span>
          </button>

          <button
            onClick={handleSyncWithAI}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3.5 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-xs transition cursor-pointer"
            title="Sintetiza este marco mental y lo envía a la IA en cada conversación"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Actualizar Resumen IA</span>
          </button>
        </div>
      </div>

      {/* Sub-Navbar Tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-1 border-b border-[#EAE2D6]/70 scrollbar-none">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-xl text-[11px] sm:text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#2D332D] text-white shadow-xs"
                  : "bg-white border border-[#EAE2D6] text-[#7A7167] hover:bg-[#F5F1E8] hover:text-[#2D332D]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#8BA888]" : "text-[#7A7167]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          PESTAÑA 1: NEUROBIOLOGÍA DEL ESTADO
          ======================================================== */}
      {activeSubTab === "neurobiologia" && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          
          {/* Card 1: ¿De qué depende mi estado actual? */}
          <div className="bg-white border border-[#EAE2D6] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE2D6]/60 pb-2.5">
              <Brain className="h-4 w-4 text-[#8BA888]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                ¿De qué depende mi estado actual?
              </h3>
            </div>

            {isEditing ? (
              <textarea
                rows={5}
                value={editableData.neurobiologia.deQueDepende}
                onChange={(e) => setEditableData({
                  ...editableData,
                  neurobiologia: { ...editableData.neurobiologia, deQueDepende: e.target.value }
                })}
                className="w-full p-3 text-xs bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl outline-none"
              />
            ) : (
              <div className="bg-[#FBF9F4] border border-[#EAE2D6]/70 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-[11px] sm:text-xs text-[#3A3530] leading-relaxed whitespace-pre-wrap font-medium">
                {editableData.neurobiologia.deQueDepende}
              </div>
            )}
          </div>

          {/* Card 2: ¿Cómo cambio mi estado de ánimo? */}
          <div className="bg-white border border-[#EAE2D6] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE2D6]/60 pb-2.5">
              <RefreshCw className="h-4 w-4 text-[#8BA888]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                ¿Cómo cambio mi estado de ánimo?
              </h3>
            </div>

            {isEditing ? (
              <textarea
                rows={5}
                value={editableData.neurobiologia.comoCambio}
                onChange={(e) => setEditableData({
                  ...editableData,
                  neurobiologia: { ...editableData.neurobiologia, comoCambio: e.target.value }
                })}
                className="w-full p-3 text-xs bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl outline-none"
              />
            ) : (
              <div className="bg-[#FBF9F4] border border-[#EAE2D6]/70 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-[11px] sm:text-xs text-[#3A3530] leading-relaxed whitespace-pre-wrap font-medium">
                {editableData.neurobiologia.comoCambio}
              </div>
            )}
          </div>

          {/* Card 3: Fórmula Funcional y Estados A vs B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#6D856B] uppercase tracking-wider">
                Fórmula Funcional del Estado
              </h4>
              <div className="bg-[#8BA888]/10 border border-[#8BA888]/30 rounded-2xl p-4 font-mono text-xs text-[#2D332D] font-bold leading-relaxed">
                {editableData.neurobiologia.formulaEstado}
              </div>
            </div>

            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider">
                ¿Cómo logro un cambio de estado estable?
              </h4>
              <div className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4 text-xs text-[#3A3530] leading-relaxed whitespace-pre-wrap">
                {editableData.neurobiologia.cambioEstable}
              </div>
            </div>
          </div>

          {/* Card 4: Estado A (Inercia actual) vs Estado B (Estudio y Resistencia) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F9F6F1] text-[#7A7167] uppercase">
                El Estado A (Inercia Actual)
              </span>
              <div className="text-xs text-[#3A3530] leading-relaxed whitespace-pre-wrap bg-[#FBF9F4] p-4 rounded-2xl border border-[#EAE2D6]/60">
                {editableData.neurobiologia.estadoA}
              </div>
            </div>

            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 uppercase">
                El Estado B (Estudio y Resistencia)
              </span>
              <div className="text-xs text-[#3A3530] leading-relaxed whitespace-pre-wrap bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60">
                <p className="font-bold mb-1">Definición de B:</p>
                <p className="mb-2">{editableData.neurobiologia.estadoB}</p>
                <p className="font-bold mb-1">Estado B en Estudio:</p>
                <p>{editableData.neurobiologia.estadoBEstudio}</p>
              </div>
            </div>
          </div>

          {/* Card 5: Las 5 Áreas de Vida (A0 - A4) */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-[#EAE2D6]/60 pb-3">
              <h3 className="text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                Evaluación por Áreas de Vida (A0 a A4)
              </h3>
              <p className="text-xs text-[#7A7167] mt-0.5">
                Categorización integral para evaluar aspectos de mejora, problemas y soluciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editableData.neurobiologia.areasVida.map((area) => (
                <div key={area.code} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-[#2D332D] text-white text-[10px] font-extrabold">
                      {area.code}
                    </span>
                    <h4 className="text-xs font-bold text-[#2D332D] truncate flex-1 ml-2">{area.name}</h4>
                  </div>
                  <p className="text-[11px] text-[#7A7167]">{area.description}</p>
                  <div className="pt-2 border-t border-[#EAE2D6]/60 space-y-1 text-[10px]">
                    <p className="text-rose-800"><strong>Problema:</strong> {area.problems}</p>
                    <p className="text-emerald-800"><strong>Solución:</strong> {area.solutions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: CREENCIAS & LEYES MENTALES
          ======================================================== */}
      {activeSubTab === "creencias" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Linterna del Foco */}
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#6D856B]">
                <Lightbulb className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">El Concepto de la Linterna</h4>
              </div>
              <p className="text-xs text-[#3A3530] leading-relaxed bg-[#FBF9F4] p-4 rounded-2xl border border-[#EAE2D6]/70 font-medium">
                {editableData.creencias.linternaFoco}
              </p>
            </div>

            {/* Duda vs Acción */}
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldCheck className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">La Duda vs La Acción</h4>
              </div>
              <p className="text-xs text-[#2D332D] leading-relaxed bg-rose-50/60 p-4 rounded-2xl border border-rose-200/70 font-bold">
                {editableData.creencias.dudaVsAccion}
              </p>
            </div>

            {/* Polarización OFF/ON */}
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#7A7167]">
                <Layers className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Polarización Modo OFF/ON</h4>
              </div>
              <p className="text-xs text-[#3A3530] leading-relaxed bg-[#FBF9F4] p-4 rounded-2xl border border-[#EAE2D6]/70">
                {editableData.creencias.polarizacionOnOff}
              </p>
            </div>

            {/* Distanciamiento en 3ra Persona */}
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#8BA888]">
                <Brain className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Distanciamiento Psicológico (3ra Persona)</h4>
              </div>
              <p className="text-xs text-[#3A3530] leading-relaxed bg-[#FBF9F4] p-4 rounded-2xl border border-[#EAE2D6]/70">
                {editableData.creencias.distanciamientoTerceraPersona}
              </p>
            </div>

            {/* Enfoque No-Moral */}
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Enfoque No-Moral (Neuroquímica Pura)</h4>
              </div>
              <p className="text-xs text-[#3A3530] leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
                {editableData.creencias.enfoqueNoMoral}
              </p>
            </div>

            {/* Tolerancia al Fallo */}
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <ShieldCheck className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Tolerancia Radical al Fallo</h4>
              </div>
              <p className="text-xs text-[#3A3530] leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                {editableData.creencias.toleranciaAlFallo}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          PESTAÑA 3: MÉTODOS & PROTOCOLOS
          ======================================================== */}
      {activeSubTab === "metodos" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Protocolo 1: Estrategia Definitiva de Pre-Arranque y Arranque */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE2D6]/60 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#8BA888]" />
                <h3 className="text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                  Estrategia Definitiva de Pasos (Pre-Arranque y Arranque)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editableData.metodos.preArranquePasos.map((paso, idx) => (
                <div key={idx} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#2D332D] font-medium shadow-2xs">
                  <span className="h-5 w-5 rounded-full bg-[#8BA888] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-snug">{paso}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#F9F6F1] p-3 rounded-xl text-xs text-[#7A7167]">
                <strong>¿El arranque es la clave?</strong> {editableData.metodos.elArranqueEsClave}
              </div>
              <div className="bg-[#F9F6F1] p-3 rounded-xl text-xs text-[#7A7167]">
                <strong>¿Forzar el arranque funciona?</strong> {editableData.metodos.forzarArranqueFunciona}
              </div>
            </div>
          </div>

          {/* Protocolo 2: Método Transición (Visor Espontáneo 15 min) */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="border-b border-[#EAE2D6]/60 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#D98E73]" />
                <h3 className="text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                  Método Transición (Visor Espontáneo 15 min)
                </h3>
              </div>
              <p className="text-xs text-[#7A7167] mt-0.5">
                Protocolo para desinhibirse, disolver la tensión del control rígido y actuar con soltura y humor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#EAE2D6] space-y-1.5">
                <span className="text-[10px] font-bold text-[#7A7167] uppercase block">Fase 1: Aislación (5 min)</span>
                <p className="text-xs text-[#3A3530] leading-relaxed">{editableData.metodos.metodoTransicion.fase1Aislacion}</p>
              </div>

              <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#EAE2D6] space-y-1.5">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Fase 2: Reconocer y Depurar</span>
                <p className="text-xs text-[#3A3530] leading-relaxed">{editableData.metodos.metodoTransicion.fase2ReconocerDepurar}</p>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Fase 3: Aceptación con Humor</span>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">{editableData.metodos.metodoTransicion.fase3AceptacionHumor}</p>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Fase 4: Convencimiento Adaptativo</span>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">{editableData.metodos.metodoTransicion.fase4Convencimiento}</p>
              </div>
            </div>

            {/* Test de Libertad */}
            <div className="bg-[#2D332D] text-white p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-[#8BA888] uppercase tracking-wider">Test de Libertad Completado:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {editableData.metodos.metodoTransicion.testCompletado.map((test, i) => (
                  <div key={i} className="bg-white/10 p-2.5 rounded-xl flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#8BA888] shrink-0" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Protocolo 3: Criterio DÍA NO CERO (No-Zero Days) */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="border-b border-[#EAE2D6]/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8BA888]" />
                <h3 className="text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                  Criterio de Política del "Día No Cero" (No-Zero Days)
                </h3>
              </div>
              <p className="text-xs text-[#7A7167] mt-0.5">
                Protección neuronal de la identidad disciplinada en días de fatiga o exámenes.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2 font-medium">
              <p><strong>Regla Inviolable:</strong> {editableData.metodos.criterioDiaNoCero.reglaInviolable}</p>
              <p><strong>Propósito de Identidad:</strong> {editableData.metodos.criterioDiaNoCero.propositoIdentidad}</p>
              <p><strong>Efecto 'Qué Carajo' a Evitar:</strong> {editableData.metodos.criterioDiaNoCero.efectoQueCarajo}</p>
            </div>

            {/* Tríada en días complicados */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#2D332D] uppercase tracking-wider">
                La Tríada de Acciones Mínimas (Fricción Casi Cero)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {editableData.metodos.criterioDiaNoCero.triadaDiaDificil.map((t, idx) => (
                  <div key={idx} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-3.5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-[#6D856B] uppercase block">{t.item}</span>
                    <p className="text-[#3A3530] font-medium leading-snug">{t.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tríada del Yo Temporal */}
            <div className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#7A7167] uppercase tracking-wider">
                La Tríada del Yo Temporal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">1. Yo Pasado</span>
                  <p className="text-[#4A443F] leading-snug">{editableData.metodos.criterioDiaNoCero.triadaDelYoTemporal.yoPasado}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">2. Yo Presente</span>
                  <p className="text-[#4A443F] leading-snug">{editableData.metodos.criterioDiaNoCero.triadaDelYoTemporal.yoPresente}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">3. Yo Futuro</span>
                  <p className="text-[#4A443F] leading-snug">{editableData.metodos.criterioDiaNoCero.triadaDelYoTemporal.yoFuturo}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          PESTAÑA 4: LIMITACIONES & BLOQUEOS
          ======================================================== */}
      {activeSubTab === "limitaciones" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-[#EAE2D6]/60 pb-3">
              <h3 className="text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                Limitaciones, Bloqueos y Respuestas Mecánicas
              </h3>
              <p className="text-xs text-[#7A7167] mt-0.5">
                Comprender la causa biológica e inconsciente de cada obstáculo para aplicar la contra-medida exacta sin culpa.
              </p>
            </div>

            <div className="space-y-4">
              {editableData.limitaciones.map((lim) => (
                <div key={lim.id} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#2D332D] flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-[#D98E73]" />
                      {lim.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5A534D] leading-relaxed">{lim.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-[#EAE2D6]/60 text-xs">
                    <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200/60 text-rose-950">
                      <span className="text-[9px] font-bold text-rose-800 uppercase block mb-0.5">Manifestación:</span>
                      <p>{lim.manifestation}</p>
                    </div>
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60 text-emerald-950">
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block mb-0.5">Contra-medida Mecánica:</span>
                      <p className="font-medium">{lim.countermeasure}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          PESTAÑA 5: OBJETIVOS CLAVES (7 METAS)
          ======================================================== */}
      {activeSubTab === "objetivos" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-[#EAE2D6]/60 pb-3">
              <h3 className="text-sm font-bold text-[#2D332D] uppercase tracking-wide">
                Los 7 Objetivos Claves de Vida
              </h3>
              <p className="text-xs text-[#7A7167] mt-0.5">
                Las metas fundamentales divididas por área de dominio con sus limitaciones y estrategias asignadas.
              </p>
            </div>

            <div className="space-y-4">
              {editableData.objetivosClaves.map((goal) => (
                <div key={goal.id} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-5 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D6]/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-xl bg-[#2D332D] text-white flex items-center justify-center text-xs font-bold">
                        {goal.number}
                      </span>
                      <h4 className="text-xs font-bold text-[#2D332D]">{goal.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-[#6D856B] bg-[#8BA888]/15 px-2.5 py-0.5 rounded-full w-fit">
                      Área {goal.area}
                    </span>
                  </div>

                  <p className="text-xs text-[#4A443F] leading-relaxed font-medium">
                    {goal.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/60">
                      <span className="text-[9px] font-bold text-rose-800 uppercase block mb-1">Limitaciones & Fricciones:</span>
                      <ul className="space-y-0.5 text-rose-950">
                        {goal.limitations.map((lim, i) => (
                          <li key={i} className="text-[11px] leading-tight">• {lim}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/70">
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block mb-1">Estrategia Asignada:</span>
                      <p className="text-[11px] text-emerald-950 font-medium leading-relaxed">{goal.strategy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
