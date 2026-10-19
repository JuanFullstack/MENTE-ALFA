/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Sliders, Check } from "lucide-react";
import { DailyLog } from "../types";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (newLog: DailyLog) => void;
}

export default function QuickLogModal({ isOpen, onClose, onSaveLog }: QuickLogModalProps) {
  const [energy, setEnergy] = useState(6);
  const [motivation, setMotivation] = useState(7);
  const [stress, setStress] = useState(4);
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: DailyLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      energy,
      motivation,
      stress,
      note: note.trim() || "Registro rápido del estado emocional.",
    };

    onSaveLog(log);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-[#FDFBF7] border border-[#EAE2D6] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl p-5 sm:p-8 space-y-5 sm:space-y-6 relative animate-in fade-in zoom-in-95 duration-150"
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#D98E73]/15 text-[#D98E73] flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D332D]">Registro Emocional Rápido</h3>
              <p className="text-xs text-[#7A7167]">Registra tu energía y nivel de estrés de este momento.</p>
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
          <div className="py-10 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-[#7D9B7A]/20 text-[#7D9B7A] mx-auto flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[#2D332D]">¡Registro Guardado con Éxito!</h4>
            <p className="text-xs text-[#7A7167]">Aura ha actualizado tu historial de bienestar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Energy Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#4A443F]">Nivel de Energía</span>
                <span className="font-bold text-[#7D9B7A]">{energy}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full accent-[#7D9B7A] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer"
              />
            </div>

            {/* Motivation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#4A443F]">Motivación / Enfoque</span>
                <span className="font-bold text-[#7A7167]">{motivation}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motivation}
                onChange={(e) => setMotivation(parseInt(e.target.value))}
                className="w-full accent-[#7A7167] h-1.5 bg-[#EAE2D6] rounded-lg cursor-pointer"
              />
            </div>

            {/* Stress Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#4A443F]">Nivel de Estrés</span>
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

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A443F] block">
                Breve nota o reflexión (opcional)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="¿Qué estás sintiendo o qué actividad estabas realizando?"
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE2D6] rounded-2xl text-xs text-[#4A443F] placeholder-[#A69D91] outline-none focus:border-[#7D9B7A] resize-none"
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
                className="px-5 py-2 text-xs font-bold text-white bg-[#D98E73] hover:bg-[#C87E63] rounded-xl shadow-sm transition cursor-pointer"
              >
                Guardar Registro
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
