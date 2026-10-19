/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Brain, Check, Plus } from "lucide-react";
import { Memory } from "../types";

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
  const [category, setCategory] = useState<Memory["category"]>("general");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMem: Memory = {
      id: `mem-${Date.now()}`,
      text: text.trim(),
      category: category || "general",
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

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
              <h3 className="text-base font-bold text-[#2D332D]">Agregar Nota Mental / Experiencia</h3>
              <p className="text-xs text-[#7A7167]">Registra vivencias, reflexiones o leyes que alimentan el contexto de la IA.</p>
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
            <h4 className="text-sm font-bold text-[#2D332D]">¡Nota Mental Guardada!</h4>
            <p className="text-xs text-[#7A7167]">Sincronizada en LocalStorage y en la base de datos PocketBase.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A443F] block">
                Escribe tu Nota, Vivencia o Experiencia
              </label>
              <textarea
                rows={5}
                required
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe lo que ocurrió, lo que aprendiste o una directriz mental. No es necesario clasificarla."
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE2D6] rounded-2xl text-xs text-[#3A3530] placeholder-[#A69D91] outline-none focus:border-[#8BA888] resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-[#7A7167]">Etiqueta (opcional):</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="text-xs py-1 px-2.5 bg-white border border-[#EAE2D6] rounded-xl text-[#4A443F] outline-none"
                >
                  <option value="general">Sin categoría / General</option>
                  <option value="experiencias">Experiencia</option>
                  <option value="preferencias">Preferencia</option>
                  <option value="hábitos">Hábito</option>
                  <option value="objetivos">Objetivo</option>
                  <option value="creencias">Creencia</option>
                  <option value="estrategias">Estrategia</option>
                  <option value="valores">Valor</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-[#8BA888] font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Conectado con PocketBase DB
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
                  className="px-5 py-2 text-xs font-bold text-white bg-[#8BA888] hover:bg-[#6D856B] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Guardar Nota
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
