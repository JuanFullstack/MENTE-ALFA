/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Sliders, Check, Clock, Target, ShieldAlert, Award } from "lucide-react";
import { DailyLog, ObjetivoEstructurado, CodigoRasgo } from "../types";
import { clasificarFranjaHoraria, PLANTILLAS_RASGOS_OFICIALES } from "../lib/progressAuditor";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (newLog: DailyLog) => void;
  objetivosActivos?: ObjetivoEstructurado[];
  reportesHoyCount?: number;
}

export default function QuickLogModal({
  isOpen,
  onClose,
  onSaveLog,
  objetivosActivos = [],
  reportesHoyCount = 0,
}: QuickLogModalProps) {
  const infoHora = clasificarFranjaHoraria();
  const [moodScore, setMoodScore] = useState(7);
  const [productivityScore, setProductivityScore] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(3);
  const [objetivoId, setObjetivoId] = useState<string>("");
  const [rasgoCodigo, setRasgoCodigo] = useState<CodigoRasgo | "">("");
  const [huboObstaculo, setHuboObstaculo] = useState(false);
  const [detonante, setDetonante] = useState("");
  const [metodoAplicado, setMetodoAplicado] = useState("");
  const [resultadoMetodo, setResultadoMetodo] = useState<"exito" | "parcial" | "fallo">("exito");
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ahora = clasificarFranjaHoraria();
    const objSeleccionado = objetivosActivos.find((o) => o.id === objetivoId);

    const log: DailyLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: ahora.dateKey,
      horaExacta: ahora.horaExacta,
      franja: ahora.franja,
      energy,
      motivation: productivityScore,
      stress,
      moodScore,
      productivityScore,
      tipoReporte: objSeleccionado?.tipo || "estado_general",
      objetivoId: objetivoId || undefined,
      rasgoCodigo: (rasgoCodigo as CodigoRasgo) || objSeleccionado?.rasgoCodigo || undefined,
      huboObstaculo,
      detonante: huboObstaculo ? detonante.trim() : undefined,
      metodoAplicado: huboObstaculo || metodoAplicado ? metodoAplicado.trim() : undefined,
      resultadoMetodo: huboObstaculo ? resultadoMetodo : "exito",
      note:
        note.trim() ||
        `[${ahora.horaExacta} · ${ahora.labelFranja}] Ánimo ${moodScore}/10 | Prod ${productivityScore}/10`,
    };

    onSaveLog(log);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setNote("");
      setDetonante("");
      setMetodoAplicado("");
      setHuboObstaculo(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FDFBF7] border border-[#EAE2D6] w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#8BA888]/20 text-[#6D856B] flex items-center justify-center">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2D332D]">Check-in Operativo y Emocional</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8BA888]/15 text-[#5A7358]">
                  {reportesHoyCount}/15 hoy
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7A7167] mt-0.5">
                <Clock className="h-3 w-3 text-[#8BA888]" />
                <span className="font-semibold text-[#4A443F]">{infoHora.horaExacta} hs</span>
                <span>·</span>
                <span className="truncate max-w-[240px] sm:max-w-none">{infoHora.labelFranja}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EAE2D6] text-[#7A7167] hover:text-[#2D332D] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSaved ? (
          <div className="py-12 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-[#8BA888]/20 text-[#6D856B] mx-auto flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#2D332D]">¡Check-in Registrado con Éxito!</h4>
            <p className="text-xs text-[#7A7167]">Tu avance de objetivos y telemetría horaria se han sincronizado.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sliders Grid: Ánimo y Productividad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white p-3.5 rounded-2xl border border-[#EAE2D6]">
              {/* Ánimo */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#4A443F]">Estado de Ánimo</span>
                  <span className="font-bold text-[#6D856B]">{moodScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full accent-[#8BA888] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer"
                />
              </div>

              {/* Productividad */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#4A443F]">Productividad / Enfoque</span>
                  <span className="font-bold text-[#8BA888]">{productivityScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={productivityScore}
                  onChange={(e) => setProductivityScore(parseInt(e.target.value))}
                  className="w-full accent-[#8BA888] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer"
                />
              </div>

              {/* Energía */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#4A443F]">Nivel de Energía</span>
                  <span className="font-bold text-[#6D856B]">{energy}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full accent-[#8BA888] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer"
                />
              </div>

              {/* Estrés */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#4A443F]">Nivel de Estrés / Fricción</span>
                  <span className="font-bold text-[#D98E73]">{stress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                  className="w-full accent-[#D98E73] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Vínculo con Objetivo Activo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A443F] flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[#6D856B]" />
                Vincular a Objetivo Semanal / Mensual (Opcional)
              </label>
              <select
                value={objetivoId}
                onChange={(e) => {
                  setObjetivoId(e.target.value);
                  const sel = objetivosActivos.find((o) => o.id === e.target.value);
                  if (sel) setRasgoCodigo(sel.rasgoCodigo);
                }}
                className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-[#8BA888]"
              >
                <option value="">-- Sin vincular a objetivo específico (Registro general) --</option>
                {objetivosActivos.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    [{obj.tipo === "crecimiento_psicologico" ? "🧠 Crecimiento" : "⚡ Productivo"}] {obj.titulo} ({obj.meta.progresoActual}/{obj.meta.objetivoNumerico} {obj.meta.unidad})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Rasgo Directo si no hay objetivoId */}
            {!objetivoId && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A443F] flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-[#8BA888]" />
                  Rasgo o Protocolo de la Guía activado en este momento
                </label>
                <select
                  value={rasgoCodigo}
                  onChange={(e) => setRasgoCodigo(e.target.value as CodigoRasgo | "")}
                  className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-[#8BA888]"
                >
                  <option value="">-- Seleccionar rasgo (Opcional) --</option>
                  {Object.values(PLANTILLAS_RASGOS_OFICIALES).map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      [{p.tipo === "crecimiento_psicologico" ? "Psicológico" : "Productivo"}] {p.titulo}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Toggle de Obstáculo / Fricción */}
            <div className="bg-white p-3 rounded-2xl border border-[#EAE2D6] space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={huboObstaculo}
                  onChange={(e) => setHuboObstaculo(e.target.checked)}
                  className="rounded text-[#D98E73] focus:ring-0 w-4 h-4 cursor-pointer accent-[#D98E73]"
                />
                <span className="text-xs font-bold text-[#2D332D] flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-[#D98E73]" />
                  ¿Tuviste un obstáculo, bajón, tentación o imprevisto?
                </span>
              </label>

              {huboObstaculo && (
                <div className="space-y-2.5 pt-1 pl-6 border-l-2 border-[#D98E73]/30">
                  <div>
                    <label className="text-[11px] font-semibold text-[#7A7167] block mb-1">
                      ¿Qué disparó la fricción o tentación? (Detonante exacto)
                    </label>
                    <input
                      type="text"
                      value={detonante}
                      onChange={(e) => setDetonante(e.target.value)}
                      placeholder="Ej: Pereza al sonar la alarma / Aviso examen en Discord / Enojo por imprevisto"
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-[#D98E73]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#7A7167] block mb-1">
                      ¿Qué método de tu Guía aplicaste para enfrentarlo?
                    </label>
                    <input
                      type="text"
                      value={metodoAplicado}
                      onChange={(e) => setMetodoAplicado(e.target.value)}
                      placeholder="Ej: Contar hasta 3 + Agua fría / Respirar como león / Ideal Adaptado / 15m tolerancia"
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] outline-none focus:border-[#8BA888]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#7A7167] block mb-1">
                      Resultado del método aplicado
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setResultadoMetodo("exito")}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          resultadoMetodo === "exito"
                            ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                            : "bg-white border-[#EAE2D6] text-[#7A7167]"
                        }`}
                      >
                        ✓ Éxito (Superado)
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultadoMetodo("parcial")}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
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
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          resultadoMetodo === "fallo"
                            ? "bg-[#D98E73]/20 border-[#D98E73] text-[#B86E53]"
                            : "bg-white border-[#EAE2D6] text-[#7A7167]"
                        }`}
                      >
                        ✕ Caída / Fallo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A443F] block">
                Nota o reflexión rápida (opcional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="¿Qué estás haciendo en esta franja o qué querés registrar?"
                className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] placeholder-[#A69D91] outline-none focus:border-[#8BA888] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#7A7167] hover:bg-[#EAE2D6]/50 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#8BA888] hover:bg-[#7D9B7A] rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Guardar Check-in</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
