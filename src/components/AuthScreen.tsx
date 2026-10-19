/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Brain, Leaf, ArrowRight, User } from "lucide-react";
import { UserProfile } from "../lib/storage";

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void;
  currentProfile: UserProfile;
}

export default function AuthScreen({ onLogin, currentProfile }: AuthScreenProps) {
  const [userName, setUserName] = useState(currentProfile.userName);
  const [companionName, setCompanionName] = useState(currentProfile.companionName);
  const [notes, setNotes] = useState(currentProfile.notes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !companionName.trim()) return;
    onLogin({
      userName: userName.trim(),
      companionName: companionName.trim(),
      avatarSeed: userName.toLowerCase().slice(0, 5),
      notes: notes.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#8BA888] text-white shadow-lg shadow-[#8BA888]/20 mb-6">
          <Leaf className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#2D332D] tracking-tight">
          Bienvenido a Zen AI
        </h2>
        <p className="mt-2 text-sm text-[#7A7167]">
          Tu acompañante reflexivo personal con memoria a largo plazo.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#EAE2D6] rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#4A443F] mb-1.5">
                  Tu Nombre
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A69D91]">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-[#EAE2D6] rounded-xl focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] text-[#4A443F] placeholder-[#A69D91] text-sm transition outline-none"
                    placeholder="Sofía"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A443F] mb-1.5">
                  Nombre de tu Acompañante IA
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A69D91]">
                    <Brain className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-[#EAE2D6] rounded-xl focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] text-[#4A443F] placeholder-[#A69D91] text-sm transition outline-none"
                    placeholder="Zen AI"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A443F] mb-1.5">
                Notas Base de Contexto (Tu Perfil y Metas)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full px-3 py-2 border border-[#EAE2D6] rounded-xl focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] text-[#4A443F] placeholder-[#A69D91] text-sm transition resize-none outline-none"
                placeholder="Ej. Estudiante de psicología, propenso a procrastinar en las noches. Me interesa llevar registro de mis hábitos de estudio y emociones asociadas."
              />
              <p className="mt-1.5 text-xs text-[#7A7167] leading-normal">
                Esta información servirá como base fija para que tu acompañante recuerde quién eres, tus focos de atención y tus preferencias.
              </p>
            </div>

            <div className="bg-[#8BA888]/10 rounded-2xl p-4 border border-[#8BA888]/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#8BA888] mt-0.5 shrink-0" />
              <div className="text-xs text-[#6D856B] leading-relaxed">
                <strong>Enfoque de Privacidad Local-First</strong>: Toda tu información de perfil, registros emocionales y recuerdos persistirán de forma local y segura en el almacenamiento de tu navegador. El backend se utiliza exclusivamente para procesar tus consultas de IA de forma protegida.
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-[#8BA888] hover:bg-[#6D856B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BA888] transition cursor-pointer"
              >
                Comenzar Sesión de Introspección
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
