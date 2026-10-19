/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MessageSquare, Brain, CalendarRange, BarChart2, User, LogOut, Leaf } from "lucide-react";
import { UserProfile } from "../lib/storage";

export type SidebarTab = "chat" | "memoria" | "registros" | "analisis" | "configuracion";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  profile: UserProfile;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, profile, onLogout }: SidebarProps) {
  const navItems = [
    { id: "chat", name: "Conversación", icon: MessageSquare },
    { id: "memoria", name: "Memoria de IA", icon: Brain },
    { id: "registros", name: "Registro Diario", icon: CalendarRange },
    { id: "analisis", name: "Análisis y Patrones", icon: BarChart2 },
  ] as const;

  return (
    <div className="w-64 bg-[#F9F6F1] text-[#4A443F] flex flex-col h-full border-r border-[#EAE2D6] font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#EAE2D6] flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#8BA888] flex items-center justify-center text-white shadow-md shadow-[#8BA888]/20 shrink-0">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#2D332D] tracking-tight leading-none">
            Zen AI
          </h1>
          <span className="text-xs text-[#7A7167] font-medium">Acompañamiento Personal</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                isActive
                  ? "bg-[#8BA888] text-white font-semibold shadow-sm"
                  : "text-[#7A7167] hover:bg-[#EAE2D6]/50 hover:text-[#2D332D]"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#7A7167] group-hover:text-[#2D332D]"}`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Card & Settings / Logout Section */}
      <div className="p-4 border-t border-[#EAE2D6] space-y-2 bg-[#FDFBF7]">
        <button
          onClick={() => onTabChange("configuracion")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
            activeTab === "configuracion"
              ? "bg-[#EAE2D6] text-[#2D332D] font-semibold"
              : "text-[#7A7167] hover:bg-[#EAE2D6]/40 hover:text-[#2D332D]"
          }`}
        >
          <div className="h-9 w-9 rounded-xl bg-[#8BA888]/10 border border-[#8BA888]/20 text-[#6D856B] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
            {profile.userName.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#4A443F] truncate leading-tight">
              {profile.userName}
            </p>
            <p className="text-xs text-[#7A7167] truncate mt-0.5">
              Guía: {profile.companionName}
            </p>
          </div>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#7A7167] hover:bg-[#D98E73]/10 hover:text-[#D98E73] transition cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-[#7A7167] group-hover:text-[#D98E73]" />
          Finalizar Sesión
        </button>
      </div>
    </div>
  );
}
