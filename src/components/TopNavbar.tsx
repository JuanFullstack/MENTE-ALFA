/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Leaf,
  Settings,
  MessageSquare,
  Brain,
  CalendarRange,
  BarChart2,
  Plus,
  Compass,
  Database,
  Menu,
  Eraser,
} from "lucide-react";
import { UserProfile } from "../lib/storage";
import { ChatChannel } from "../types";

export type NavTab = "conversar" | "sistema" | "memoria" | "registros" | "patrones" | "configuracion";

interface TopNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeChatChannel?: ChatChannel;
  onSelectChatChannel?: (channel: ChatChannel) => void;
  onOpenQuickLog: () => void;
  onOpenAddMemory: () => void;
  onRequestReport?: () => void;
  profile: UserProfile;
}

export default function TopNavbar({
  activeTab,
  onTabChange,
  activeChatChannel = "carga_datos",
  onSelectChatChannel,
  onOpenQuickLog,
  onOpenAddMemory,
  profile,
}: TopNavbarProps) {
  const navTabs = [
    { id: "conversar" as NavTab, label: "Conversar", icon: MessageSquare },
    { id: "sistema" as NavTab, label: "Marco Mental", icon: Compass },
    { id: "memoria" as NavTab, label: "Notas Mentales", icon: Brain },
    { id: "registros" as NavTab, label: "Reportes Diarios", icon: CalendarRange },
    { id: "patrones" as NavTab, label: "Patrones", icon: BarChart2 },
  ];

  return (
    <>
      {/* Barra Superior Única y Optimizada (Sin texto 'Aura' y con botones clave en íconos) */}
      <header className="h-12 sm:h-14 bg-[#FDFBF7] border-b border-[#EAE2D6] px-2.5 sm:px-5 flex items-center justify-between shrink-0 font-sans select-none z-20 gap-2">
        {/* Izquierda: Menú de conversaciones (en mobile) + Ícono limpio sin palabra Aura */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab === "conversar" && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("mente-alfa:toggle-left-drawer"))}
              className="lg:hidden h-8 w-8 rounded-xl border border-[#EAE2D6] bg-white text-[#5A534D] hover:text-[#2D332D] flex items-center justify-center shadow-2xs cursor-pointer"
              title="Conversaciones"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onTabChange("conversar")}
            className="h-8 w-8 rounded-full bg-[#7D9B7A] flex items-center justify-center text-white shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
            title="Inicio"
          >
            <Leaf className="h-4 w-4" />
          </button>
        </div>

        {/* Centro (Desktop): Pestañas de navegación */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative py-3.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "text-[#2D332D] font-bold"
                    : "text-[#7A7167] hover:text-[#2D332D]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D9B7A] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Derecha: Botones Clave en Íconos (Carga BD, Consultas, Sliders, Memoria, Limpiar, Ajustes) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* BOTÓN 1 (ÍCONO): CHAT A — CARGA DIARIA A BD */}
          <button
            type="button"
            onClick={() => {
              onTabChange("conversar");
              onSelectChatChannel?.("carga_datos");
            }}
            className={`h-9 w-9 sm:h-9 sm:w-9 rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
              activeTab === "conversar" && activeChatChannel === "carga_datos"
                ? "bg-[#1E5678] text-white ring-2 ring-sky-400/50"
                : "bg-sky-700/12 hover:bg-sky-700/20 text-sky-900 border border-sky-700/25"
            }`}
            title="Chat Carga Diaria (envía a Base de Datos)"
            aria-label="Chat Carga Diaria"
          >
            <Database className="h-4 w-4" />
          </button>

          {/* BOTÓN 2 (ÍCONO): CHAT B — CONSULTAS */}
          <button
            type="button"
            onClick={() => {
              onTabChange("conversar");
              onSelectChatChannel?.("consultas");
            }}
            className={`h-9 w-9 sm:h-9 sm:w-9 rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 shadow-2xs ${
              activeTab === "conversar" && activeChatChannel === "consultas"
                ? "bg-[#6D856B] text-white ring-2 ring-[#8BA888]/60"
                : "bg-[#8BA888]/15 hover:bg-[#8BA888]/25 text-[#2D332D] border border-[#8BA888]/35"
            }`}
            title="Chat Consultas"
            aria-label="Chat Consultas"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* BOTÓN 3 (ÍCONO): CARGA CON SLIDERS / NOTA RÁPIDA */}
          <button
            type="button"
            onClick={onOpenQuickLog}
            className="h-9 w-9 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
            title="Carga rápida con sliders"
            aria-label="Carga rápida con sliders"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* BOTÓN 4 (ÍCONO): MEMORIA / CONTEXTO */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "conversar" && window.innerWidth < 1280) {
                window.dispatchEvent(new CustomEvent("mente-alfa:toggle-right-drawer"));
              } else {
                onOpenAddMemory();
              }
            }}
            className="h-9 w-9 rounded-xl bg-white hover:bg-[#F5F1E8] text-[#6D856B] border border-[#EAE2D6] flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
            title="Memoria y Contexto"
            aria-label="Memoria y Contexto"
          >
            <Brain className="h-4 w-4" />
          </button>

          {/* BOTÓN 5 (ÍCONO): LIMPIAR CHAT ACTUAL */}
          {activeTab === "conversar" && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("mente-alfa:clear-chat"))}
              className="h-9 w-9 rounded-xl bg-white hover:bg-rose-50 text-[#7A7167] hover:text-rose-600 border border-[#EAE2D6] flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
              title="Limpiar mensajes de la ventana actual"
              aria-label="Limpiar ventana"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}

          {/* BOTÓN 6 (ÍCONO): CONFIGURACIÓN */}
          <button
            type="button"
            onClick={() => onTabChange("configuracion")}
            className={`h-9 w-9 rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 ${
              activeTab === "configuracion"
                ? "bg-[#EAE2D6] text-[#2D332D]"
                : "text-[#7A7167] hover:bg-[#EAE2D6]/50 hover:text-[#2D332D]"
            }`}
            title={`Ajustes (${profile.userName})`}
            aria-label="Ajustes"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible only on screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#EAE2D6] px-2 flex items-center justify-around z-30 select-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
                isActive
                  ? "text-[#7D9B7A] font-bold"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#7D9B7A] scale-110" : ""}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onTabChange("configuracion")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === "configuracion"
              ? "text-[#7D9B7A] font-bold"
              : "text-[#7A7167] hover:text-[#2D332D]"
          }`}
        >
          <Settings className={`h-4.5 w-4.5 ${activeTab === "configuracion" ? "text-[#7D9B7A] scale-110" : ""}`} />
          <span className="text-[10px] mt-0.5">Ajustes</span>
        </button>
      </nav>
    </>
  );
}
