/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Brain, Check, Plus, Sparkles, Loader2 } from "lucide-react";
import { Memory, RamaTematica, FichaVivenciaInmutable } from "../types";
import { extractFichaVivenciaGroq, getStoredGroqApiKey } from "../services/groqEvaluation";
import { asegurarFichaInmutable } from "../lib/baseContext";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMemory: (newMemory: Memory) => void;
}

export default function AddMemoryModal({
  isOpen,
  onClose,
  onSaveMemory,
}: AddMemoryModalProps) {
  const [text, setText] = useState("");
  const [ramaId, setRamaId] = useState<RamaTematica>("proyectos");
  const [nivelEnergia, setNivelEnergia] = useState<"alto" | "medio" | "bajo">("medio");
  const [resultado, setResultado] = useState<"exito" | "neutro" | "fallo">("exito");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isExtracting) return;

    setIsExtracting(true);
    const rawText = text.trim();
    let ficha: FichaVivenciaInmutable | null = null;

    try {
      const groqKey = getStoredGroqApiKey();
      if (groqKey) {
        ficha = await extractFichaVivenciaGroq(rawText, ramaId, Math.floor(Math.random() * 90) + 10);
      } else {
        const res = await fetch("/api/extract-ficha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText, ramaSugerida: ramaId }),
        });
        if (res.ok) {
          ficha = await res.json();
        }
      }
    } catch (err) {
      console.warn("Usando estructuración determinista local para Ficha Inmutable:", err);
    }

    const baseMem: Memory = {
      id: ficha?.id || `VIV-${new Date().toISOString().split("T")[0]}-${Math.floor(Math.random() * 90) + 10}`,
      text: rawText,
      category: ramaId,
      createdAt: new Date().toISOString(),
      isApproved: true,
      rama_id: ramaId,
      isImmutable: true,
    };

    const finalFicha: FichaVivenciaInmutable = ficha
      ? {
          ...ficha,
          rama_id: ramaId,
          contexto_situacional: {
            ...ficha.contexto_situacional,
            nivel_energia: nivelEnergia,
          },
          resultado,
          inmutable: true,
        }
      : {
          ...asegurarFichaInmutable(baseMem, 1),
          rama_id: ramaId,
          contexto_situacional: {
            momento: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            nivel_energia: nivelEnergia,
            factores_externos: "Registro directo de vivencia",
          },
          resultado,
          inmutable: true,
        };

    const structuredDisplayText = `[${finalFicha.id} · ${finalFicha.rama_id.toUpperCase()} · ${finalFicha.tags_mecanismo.join(" ")}]
• Detonante: ${finalFicha.detonante_exacto}
• Contexto: ${finalFicha.contexto_situacional.momento} (Energía: ${finalFicha.contexto_situacional.nivel_energia})
• Sesgo: ${finalFicha.reaccion_inicial}
• Quiebre: ${finalFicha.solucion_aplicada} -> Resultado: ${finalFicha.resultado.toUpperCase()}`;

    const newMem: Memory = {
      id: finalFicha.id,
      text: structuredDisplayText,
      category: finalFicha.rama_id,
      createdAt: new Date().toISOString(),
      isApproved: true,
      summary: JSON.stringify(finalFicha),
      fichaInmutable: finalFicha,
      rama_id: finalFicha.rama_id,
      tags_mecanismo: finalFicha.tags_mecanismo,
      isImmutable: true,
    };

    setIsExtracting(false);
    onSaveMemory(newMem);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setText("");
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FDFBF7] border border-[#EAE2D6] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl p-5 sm:p-8 space-y-5 sm:space-y-6 relative animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#8BA888]/20 text-[#6D856B] flex items-center justify-center">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D332D]">Registrar Ficha de Vivencia Inmutable</h3>
              <p className="text-xs text-[#7A7167]">El extractor asíncrono destila las 5 variables y descarta el ruido narrativo (~60-90 tokens).</p>
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
          <div className="py-8 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-[#8BA888]/20 text-[#6D856B] mx-auto flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#2D332D]">¡Ficha Inmutable Creada!</h4>
            <p className="text-xs text-[#7A7167]">Almacenada en modo de solo lectura permanente (LocalStorage + PocketBase).</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A443F] block">
                Relata la Vivencia (Detonante, qué reacción tuviste y qué micro-acción aplicaste)
              </label>
              <textarea
                rows={4}
                required
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej: A las 15:30 post-almuerzo quise seguir con consultas SQL complejas, me dispersé abriendo pestañas; corté 20 min con NSDR y pasé la tarea a mañana 07:30 AM..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE2D6] rounded-2xl text-xs text-[#3A3530] placeholder-[#A69D91] outline-none focus:border-[#8BA888] resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#7A7167] block mb-1">Rama Temática:</label>
                <select
                  value={ramaId}
                  onChange={(e) => setRamaId(e.target.value as RamaTematica)}
                  className="w-full text-xs py-1.5 px-2.5 bg-white border border-[#EAE2D6] rounded-xl text-[#4A443F] outline-none"
                >
                  <option value="proyectos">Proyectos / Código</option>
                  <option value="vinculos">Vínculos / Personas</option>
                  <option value="habitos">Hábitos / Energía</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#7A7167] block mb-1">Nivel Energía:</label>
                <select
                  value={nivelEnergia}
                  onChange={(e) => setNivelEnergia(e.target.value as "alto" | "medio" | "bajo")}
                  className="w-full text-xs py-1.5 px-2.5 bg-white border border-[#EAE2D6] rounded-xl text-[#4A443F] outline-none"
                >
                  <option value="alto">Alto (Franja Dorada)</option>
                  <option value="medio">Medio (Estable)</option>
                  <option value="bajo">Bajo (Fatiga / Valle)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#7A7167] block mb-1">Resultado:</label>
                <select
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value as "exito" | "neutro" | "fallo")}
                  className="w-full text-xs py-1.5 px-2.5 bg-white border border-[#EAE2D6] rounded-xl text-[#4A443F] outline-none"
                >
                  <option value="exito">Éxito (Destrabó)</option>
                  <option value="neutro">Neutro (En prueba)</option>
                  <option value="fallo">Fallo (Descartar)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-[#8BA888] font-bold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Extracción 5 Variables · Solo Lectura
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#7A7167] hover:bg-[#EAE2D6]/50 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isExtracting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#8BA888] hover:bg-[#6D856B] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Extrayendo Ficha...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Guardar Ficha Inmutable
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
