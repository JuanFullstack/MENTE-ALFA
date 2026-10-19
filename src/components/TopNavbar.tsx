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
  Compass
} from "lucide-react";
import { UserProfile } from "../lib/storage";

export type NavTab = "conversar" | "sistema" | "memoria" | "registros" | "patrones" | "configuracion";

interface TopNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickLog: () => void;
  onOpenAddMemory: () => void;
  profile: UserProfile;
}

export default function TopNavbar({
  activeTab,
  onTabChange,
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
      {/* Top Header Navbar */}
      <header className="h-14 sm:h-16 bg-[#FDFBF7] border-b border-[#EAE2D6] px-3 sm:px-6 flex items-center justify-between shrink-0 font-sans select-none z-20">
        
        {/* Brand logo */}
        <div 
          onClick={() => onTabChange("conversar")}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#7D9B7A] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
            <Leaf className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-[#2D332D] tracking-tight">Aura</span>
            <span className="text-[10px] sm:text-xs font-semibold text-[#8BA888]">/IA</span>
          </div>
        </div>

        {/* Desktop Navigation Center Tabs */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative py-4 text-xs sm:text-sm font-medium transition cursor-pointer ${
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

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenAddMemory}
            className="border-2 border-dashed border-[#8BA888] hover:border-[#6D856B] bg-[#8BA888]/10 hover:bg-[#8BA888]/20 text-[#2D332D] text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xs hover:shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Agregar nueva nota mental a la memoria"
          >
            <Plus className="h-3.5 w-3.5 text-[#6D856B]" />
            <span className="hidden sm:inline">Nota Mental</span>
            <span className="sm:hidden text-[11px]">Nota</span>
          </button>

          <button
            onClick={onOpenQuickLog}
            className="bg-[#D98E73] hover:bg-[#C87E63] text-white text-[11px] sm:text-xs font-semibold px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-xs hover:shadow transition flex items-center gap-1 cursor-pointer shrink-0"
            title="Registrar estado emocional"
          >
            <Plus className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Registrar ahora</span>
            <span className="sm:hidden text-[11px]">Registrar</span>
          </button>

          <button
            onClick={() => onTabChange("configuracion")}
            className={`p-1.5 sm:p-2 rounded-full transition cursor-pointer ${
              activeTab === "configuracion"
                ? "bg-[#EAE2D6] text-[#2D332D]"
                : "text-[#7A7167] hover:bg-[#EAE2D6]/50 hover:text-[#2D332D]"
            }`}
            title={`Configuración de ${profile.userName}`}
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
