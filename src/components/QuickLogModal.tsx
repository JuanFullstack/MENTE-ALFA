/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  X,
  Check,
  Clock,
  Target,
  ShieldAlert,
  Brain,
  Database,
  Sparkles,
  Zap,
  CalendarClock,
  Layers,
} from "lucide-react";
import { DailyLog, ObjetivoEstructurado, CodigoRasgo } from "../types";
import { clasificarFranjaHoraria, PLANTILLAS_RASGOS_OFICIALES } from "../lib/progressAuditor";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (newLog: DailyLog, requestReportAfter?: boolean) => void;
  objetivosActivos?: ObjetivoEstructurado[];
  reportesHoyCount?: number;
}

const CHIPS_ACTIVIDADES = [
  "Estudio Ingeniería",
  "Tesis / GitFlow",
  "Arranque 6:45 + Horus",
  "Entreno Físico 7:30",
  "Sistema FACET",
  "Tareas intermedias (Fogaje)",
];

const CHIPS_METAS = [
  "Unidad 5",
  "Unidad 7",
  "Avance Tesis",
  "Prácticos / Código",
  "Día No Cero",
];

const CHIPS_COMPROMISOS = ["Sin corte fijo", "13:00 hs", "15:00 hs", "17:00 hs", "21:00 hs", "23:00 hs"];

const CHIPS_ESTADO_PSI = [
  "Tranquilo",
  "Positivo",
  "Enfocado",
  "Presionado por el reloj",
  "Desganado al inicio",
  "Disperso / Ruido mental",
  "Determinado",
];

const CHIPS_METODOS_PSI = [
  "Meditación 12 min",
  "Meditación 5 min",
  "NSDR 30 min",
  "Contar a 3 + Agua fría",
  "Respiración del León",
  "Tolerar 15m confusión",
  "Ideal Adaptado",
  "Modo Yo Robot (5-4-3-2-1)",
  "Postura erguida / Alma Libre",
];

export default function QuickLogModal({
  isOpen,
  onClose,
  onSaveLog,
  objetivosActivos = [],
  reportesHoyCount = 0,
}: QuickLogModalProps) {
  const infoHora = clasificarFranjaHoraria();

  // Tab para mobile: "datos" | "psicologico" | "ambos"
  const [seccionActiva, setSeccionActiva] = useState<"ambos" | "datos" | "psicologico">("ambos");

  // 1. CARGA DE DATOS OPERATIVOS (Diferentes momentos del día)
  const [horaManual, setHoraManual] = useState(infoHora.horaExacta);
  const [actividadRealizada, setActividadRealizada] = useState("");
  const [metasSeleccionadas, setMetasSeleccionadas] = useState<string[]>([]);
  const [metaCustom, setMetaCustom] = useState("");
  const [compromisoHorario, setCompromisoHorario] = useState("");
  const [huboDesvioFogaje, setHuboDesvioFogaje] = useState(false);
  const [productivityScore, setProductivityScore] = useState(7);
  const [objetivoId, setObjetivoId] = useState<string>("");

  // 2. ASPECTO PSICOLÓGICO (Estado, Fricción y Método)
  const [estadosPsi, setEstadosPsi] = useState<string[]>(["Tranquilo"]);
  const [moodScore, setMoodScore] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(4);
  const [rasgoCodigo, setRasgoCodigo] = useState<CodigoRasgo | "">("");
  const [huboObstaculo, setHuboObstaculo] = useState(false);
  const [detonante, setDetonante] = useState("");
  const [metodoAplicado, setMetodoAplicado] = useState("");
  const [resultadoMetodo, setResultadoMetodo] = useState<"exito" | "parcial" | "fallo">("exito");
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const toggleMeta = (meta: string) => {
    setMetasSeleccionadas((prev) =>
      prev.includes(meta) ? prev.filter((m) => m !== meta) : [...prev, meta]
    );
  };

  const toggleEstadoPsi = (est: string) => {
    setEstadosPsi((prev) =>
      prev.includes(est) ? prev.filter((e) => e !== est) : [...prev, est]
    );
  };

  const construirYGuardar = (pedirReporteDespues: boolean) => {
    const ahora = clasificarFranjaHoraria();
    const horaFinal = horaManual.trim() || ahora.horaExacta;
    const objSeleccionado = objetivosActivos.find((o) => o.id === objetivoId);

    const todasLasMetas = [
      ...metasSeleccionadas,
      ...(metaCustom.trim() ? [metaCustom.trim()] : []),
    ];

    const estadoPsiTexto = estadosPsi.length > 0 ? estadosPsi.join(" · ") : "Estable";
    const desvioTexto = huboDesvioFogaje
      ? "Desvío en tareas intermedias ('fogaje')"
      : undefined;

    const resumenEstructurado = [
      `[${horaFinal} hs · ${ahora.labelFranja}]`,
      `📦 DATOS: Act: ${actividadRealizada.trim() || "Registro de avance"}${
        todasLasMetas.length > 0 ? ` | Metas: ${todasLasMetas.join(", ")}` : ""
      }${compromisoHorario && compromisoHorario !== "Sin corte fijo" ? ` | Compromiso: ${compromisoHorario}` : ""}${
        desvioTexto ? ` | ⚠️ ${desvioTexto}` : ""
      } | Prod: ${productivityScore}/10.`,
      `🧠 PSICOLOGÍA: Estado: ${estadoPsiTexto} (Energía ${energy}/10, Ánimo ${moodScore}/10, Presión ${stress}/10)${
        huboObstaculo && detonante ? ` | Fricción: ${detonante.trim()}` : ""
      }${metodoAplicado ? ` | Método: ${metodoAplicado.trim()} (${resultadoMetodo.toUpperCase()})` : ""}.`,
      note.trim() ? `Nota: ${note.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const log: DailyLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: ahora.dateKey,
      horaExacta: horaFinal,
      franja: ahora.franja,
      energy,
      motivation: productivityScore,
      stress,
      moodScore,
      productivityScore,
      tipoReporte: objSeleccionado?.tipo || "estado_general",
      objetivoId: objetivoId || undefined,
      rasgoCodigo: (rasgoCodigo as CodigoRasgo) || objSeleccionado?.rasgoCodigo || undefined,
      // Aspecto Psicológico separado
      estadoPsicologicoEtiqueta: estadoPsiTexto,
      huboObstaculo: huboObstaculo || huboDesvioFogaje,
      detonante: huboObstaculo
        ? detonante.trim()
        : huboDesvioFogaje
        ? "Dispersión en tareas secundarias ('fogaje')"
        : undefined,
      metodoAplicado: metodoAplicado.trim() || undefined,
      resultadoMetodo: huboObstaculo || metodoAplicado ? resultadoMetodo : "exito",
      // Carga de Datos Operativos separada
      actividadRealizada: actividadRealizada.trim() || "Avance en bloque actual",
      metasEspecificas: todasLasMetas.length > 0 ? todasLasMetas : undefined,
      compromisoHorario:
        compromisoHorario && compromisoHorario !== "Sin corte fijo"
          ? compromisoHorario
          : undefined,
      desvioOperativo: desvioTexto,
      note: resumenEstructurado,
    };

    onSaveLog(log, pedirReporteDespues);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setNote("");
      setDetonante("");
      setMetodoAplicado("");
      setActividadRealizada("");
      setMetaCustom("");
      setMetasSeleccionadas([]);
      setHuboObstaculo(false);
      setHuboDesvioFogaje(false);
      onClose();
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FDFBF7] border-t sm:border border-[#EAE2D6] w-full sm:max-w-2xl max-h-[94dvh] sm:max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 relative animate-in fade-in slide-in-from-bottom-4 duration-150">
        
        {/* Mobile Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-[#DCD5C9] rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#8BA888]/20 text-[#6D856B] flex items-center justify-center shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#2D332D]">
                  Cargar Momento del Día
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8BA888]/15 text-[#5A7358]">
                  Carga #{reportesHoyCount + 1} hoy
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A7167] mt-0.5">
                <Clock className="h-3 w-3 text-[#8BA888]" />
                <span className="font-semibold text-[#4A443F]">{infoHora.horaExacta} hs</span>
                <span>·</span>
                <span className="truncate max-w-[200px] sm:max-w-none">{infoHora.labelFranja}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#EAE2D6] text-[#7A7167] hover:text-[#2D332D] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selector Rápido de Vista en Mobile: Separación Datos vs Psicológico */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F2EDE4] p-1 rounded-2xl border border-[#EAE2D6]">
          <button
            type="button"
            onClick={() => setSeccionActiva("datos")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              seccionActiva === "datos"
                ? "bg-white text-[#2D332D] shadow-xs"
                : "text-[#7A7167] hover:text-[#2D332D]"
            }`}
          >
            <Database className="h-3.5 w-3.5 text-sky-700" />
            <span>1. Datos Día</span>
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva("psicologico")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              seccionActiva === "psicologico"
                ? "bg-white text-[#2D332D] shadow-xs"
                : "text-[#7A7167] hover:text-[#2D332D]"
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-amber-700" />
            <span>2. Psicológico</span>
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva("ambos")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              seccionActiva === "ambos"
                ? "bg-white text-[#2D332D] shadow-xs"
                : "text-[#7A7167] hover:text-[#2D332D]"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-[#6D856B]" />
            <span>Ver Ambos</span>
          </button>
        </div>

        {isSaved ? (
          <div className="py-10 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-[#8BA888]/20 text-[#6D856B] mx-auto flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#2D332D]">¡Momento del Día Cargado!</h4>
            <p className="text-xs text-[#7A7167]">
              Datos operativos y aspecto psicológico guardados por separado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* ========================================================
                BLOQUE 1: CARGA DE DATOS OPERATIVOS (MOMENTO DEL DÍA)
               ======================================================== */}
            {(seccionActiva === "ambos" || seccionActiva === "datos") && (
              <div className="bg-[#F6F9F8] border border-sky-900/15 rounded-2xl p-3.5 sm:p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-sky-900/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1E3A4C] uppercase tracking-wide">
                        📦 Carga de Datos Operativos (El Día)
                      </h4>
                      <p className="text-[10px] text-[#5B707B]">
                        Qué hiciste recién, qué unidades/metas seguís y a qué hora cortás.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-[#EAE2D6]">
                    <Clock className="h-3.5 w-3.5 text-sky-700" />
                    <input
                      type="time"
                      value={horaManual}
                      onChange={(e) => setHoraManual(e.target.value)}
                      className="text-xs font-bold text-[#2D332D] bg-transparent outline-none w-16"
                    />
                  </div>
                </div>

                {/* Qué actividad se hizo en este momento */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2D332D] block">
                    ¿Qué hiciste o estás haciendo en este momento del día?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS_ACTIVIDADES.map((chip) => {
                      const active = actividadRealizada === chip;
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setActividadRealizada(chip);
                            if (chip.includes("Fogaje")) setHuboDesvioFogaje(true);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                            active
                              ? "bg-sky-700 text-white border-sky-700 shadow-2xs"
                              : "bg-white text-[#4A443F] border-[#EAE2D6] hover:bg-[#F2EDE4]"
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={actividadRealizada}
                    onChange={(e) => setActividadRealizada(e.target.value)}
                    placeholder="O escribí qué hiciste (ej: Repasé 40 min de Unidad 5, avancé código...)"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-sky-700"
                  />
                </div>

                {/* Metas o Unidades Activas */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2D332D] block">
                    Metas / Unidades de hoy para los próximos bloques:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS_METAS.map((meta) => {
                      const active = metasSeleccionadas.includes(meta);
                      return (
                        <button
                          key={meta}
                          type="button"
                          onClick={() => toggleMeta(meta)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                            active
                              ? "bg-[#6D856B] text-white border-[#6D856B]"
                              : "bg-white text-[#4A443F] border-[#EAE2D6]"
                          }`}
                        >
                          {active ? `✓ ${meta}` : `+ ${meta}`}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={metaCustom}
                    onChange={(e) => setMetaCustom(e.target.value)}
                    placeholder="Agregar otra meta puntual (ej: Terminar práctico 3, llamar a Sergio...)"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-sky-700"
                  />
                </div>

                {/* Compromiso Horario y Productividad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2D332D] flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5 text-sky-700" />
                      Próximo Compromiso / Corte Horario:
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {CHIPS_COMPROMISOS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCompromisoHorario(c)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                            compromisoHorario === c
                              ? "bg-sky-700 text-white border-sky-700"
                              : "bg-white text-[#7A7167] border-[#EAE2D6]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE2D6] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#2D332D]">Avance / Productividad Real</span>
                      <span className="font-extrabold text-sky-700">{productivityScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={productivityScore}
                      onChange={(e) => setProductivityScore(parseInt(e.target.value))}
                      className="w-full accent-sky-700 h-2 bg-[#EAE2D6] rounded-lg cursor-pointer"
                    />
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={huboDesvioFogaje}
                        onChange={(e) => setHuboDesvioFogaje(e.target.checked)}
                        className="rounded accent-amber-600 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] font-semibold text-amber-800">
                        Me desvié en tareas intermedias ("fogaje")
                      </span>
                    </label>
                  </div>
                </div>

                {/* Vincular con Objetivo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4A443F] flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-[#6D856B]" />
                    Vincular a Objetivo Activo (Opcional):
                  </label>
                  <select
                    value={objetivoId}
                    onChange={(e) => {
                      setObjetivoId(e.target.value);
                      const sel = objetivosActivos.find((o) => o.id === e.target.value);
                      if (sel) setRasgoCodigo(sel.rasgoCodigo);
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
                  >
                    <option value="">-- Detectar automáticamente según horario/meta --</option>
                    {objetivosActivos.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        [{obj.tipo === "crecimiento_psicologico" ? "🧠 Psic." : "⚡ Prod."}] {obj.titulo} ({obj.meta.progresoActual}/{obj.meta.objetivoNumerico})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ========================================================
                BLOQUE 2: ASPECTO PSICOLÓGICO (ESTADO Y REGULACIÓN)
               ======================================================== */}
            {(seccionActiva === "ambos" || seccionActiva === "psicologico") && (
              <div className="bg-[#FAF6F0] border border-amber-900/15 rounded-2xl p-3.5 sm:p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                        🧠 Aspecto Psicológico (Estado & Regulación)
                      </h4>
                      <p className="text-[10px] text-[#7A7167]">
                        Cómo te sentís por dentro, qué fricción apareció y qué método aplicaste.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chips de Estado Psicológico */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2D332D] block">
                    ¿Cómo está tu estado mental ahora? (Tocá uno o varios)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS_ESTADO_PSI.map((est) => {
                      const active = estadosPsi.includes(est);
                      return (
                        <button
                          key={est}
                          type="button"
                          onClick={() => toggleEstadoPsi(est)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                            active
                              ? "bg-amber-700 text-white border-amber-700 shadow-2xs"
                              : "bg-white text-[#4A443F] border-[#EAE2D6]"
                          }`}
                        >
                          {active ? `✓ ${est}` : est}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sliders Psicológicos Táctiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-2xl border border-[#EAE2D6]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#4A443F]">Energía Física</span>
                      <span className="font-bold text-[#6D856B]">{energy}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="w-full accent-[#8BA888] h-2 bg-[#EAE2D6] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#4A443F]">Ánimo / Calma</span>
                      <span className="font-bold text-[#6D856B]">{moodScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodScore}
                      onChange={(e) => setMoodScore(parseInt(e.target.value))}
                      className="w-full accent-[#8BA888] h-2 bg-[#EAE2D6] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#4A443F]">Presión / Estrés</span>
                      <span className="font-bold text-[#D98E73]">{stress}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stress}
                      onChange={(e) => setStress(parseInt(e.target.value))}
                      className="w-full accent-[#D98E73] h-2 bg-[#EAE2D6] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Método Psicológico / Regulación Aplicada */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2D332D] block">
                    ¿Aplicaste algún método de regulación o protocolo psicológico?
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS_METODOS_PSI.map((met) => {
                      const active = metodoAplicado === met;
                      return (
                        <button
                          key={met}
                          type="button"
                          onClick={() => setMetodoAplicado(active ? "" : met)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                            active
                              ? "bg-[#6D856B] text-white border-[#6D856B]"
                              : "bg-white text-[#4A443F] border-[#EAE2D6]"
                          }`}
                        >
                          {met}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={metodoAplicado}
                    onChange={(e) => setMetodoAplicado(e.target.value)}
                    placeholder="O escribí qué herramienta psicológica usaste..."
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-amber-700"
                  />
                </div>

                {/* Fricción / Obstáculo Psicológico */}
                <div className="bg-white p-3 rounded-2xl border border-[#EAE2D6] space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={huboObstaculo}
                      onChange={(e) => setHuboObstaculo(e.target.checked)}
                      className="rounded text-[#D98E73] w-4 h-4 cursor-pointer accent-[#D98E73]"
                    />
                    <span className="text-xs font-bold text-[#2D332D] flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-[#D98E73]" />
                      ¿Tuviste un bajón, resistencia, autoengaño o tentación?
                    </span>
                  </label>

                  {huboObstaculo && (
                    <div className="space-y-2 pt-1 pl-4 border-l-2 border-[#D98E73]/30">
                      <input
                        type="text"
                        value={detonante}
                        onChange={(e) => setDetonante(e.target.value)}
                        placeholder="¿Qué disparó el bajón? (Ej: Desgano 10:30 hs / Aviso examen / Tentación video)"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none"
                      />
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResultadoMetodo("exito")}
                          className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                            resultadoMetodo === "exito"
                              ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                              : "bg-white border-[#EAE2D6] text-[#7A7167]"
                          }`}
                        >
                          ✓ Superado
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultadoMetodo("parcial")}
                          className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                            resultadoMetodo === "parcial"
                              ? "bg-[#EAE2D6] border-[#A69D91] text-[#4A443F]"
                              : "bg-white border-[#EAE2D6] text-[#7A7167]"
                          }`}
                        >
                          ~ Parcial
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultadoMetodo("fallo")}
                          className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                            resultadoMetodo === "fallo"
                              ? "bg-[#D98E73]/20 border-[#D98E73] text-[#B86E53]"
                              : "bg-white border-[#EAE2D6] text-[#7A7167]"
                          }`}
                        >
                          ✕ Caída
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nota Libre Adicional */}
            <div className="space-y-1">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Detalle extra opcional sobre este momento..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] placeholder-[#A69D91] outline-none focus:border-[#8BA888]"
              />
            </div>

            {/* Botonera Dual Optimizada para Mobile */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => construirYGuardar(false)}
                className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 shadow-sm transition cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Database className="h-4 w-4 shrink-0" />
                <span>Guardar Carga del Momento</span>
              </button>

              <button
                type="button"
                onClick={() => construirYGuardar(true)}
                className="flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#6D856B] hover:bg-[#5A7358] shadow-sm transition cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Sparkles className="h-4 w-4 text-amber-200 shrink-0" />
                <span>Guardar y Pedir Reporte + Consejos</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
