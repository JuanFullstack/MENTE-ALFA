/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Brain, Plus, Trash2, Edit2, Calendar, Check, X, Sparkles, 
  ChevronRight, RefreshCw, BookmarkCheck, Search,
  Database, CheckCircle2, FileText
} from "lucide-react";
import { Memory, Conversation, Message } from "../types";
import { UserProfile, ZenDB } from "../lib/storage";
import { getStoredGroqApiKey, getStoredGroqModel, summarizeMentalNoteWithGroq } from "../services/groqEvaluation";
import { 
  fetchMemoriasPB, 
  createMemoriaPB, 
  updateMemoriaPB, 
  deleteMemoriaPB,
  upsertConversacionSummaryPB 
} from "../services/pocketbaseService";

interface MemoriaViewProps {
  memories: Memory[];
  conversations: Conversation[];
  messages: Message[];
  profile: UserProfile;
  onUpdateMemories: (memories: Memory[]) => void;
  onUpdateConversations: (conversations: Conversation[]) => void;
  onOpenAddMemory?: () => void;
}

export default function MemoriaView({
  memories,
  conversations,
  messages,
  profile,
  onUpdateMemories,
  onUpdateConversations,
  onOpenAddMemory,
}: MemoriaViewProps) {
  // Category Filtering & Search
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit memory state
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingCat, setEditingCat] = useState<string>("general");
  const [editingSummary, setEditingSummary] = useState("");

  // Summarize mental note state
  const [summarizingMemId, setSummarizingMemId] = useState<string | null>(null);

  // Summarize conversation state
  const [summarizingConvId, setSummarizingConvId] = useState<string | null>(null);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);
  const [expandedConvId, setExpandedConvId] = useState<string | null>(null);
  
  // DB Sync state
  const [isSyncingDB, setIsSyncingDB] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Trigger PocketBase Sync
  const handleSyncWithPocketBase = async () => {
    setIsSyncingDB(true);
    try {
      const remoteMems = await fetchMemoriasPB();
      if (remoteMems && remoteMems.length > 0) {
        const merged = [...memories];
        remoteMems.forEach((r) => {
          const exists = merged.some((m) => m.id === r.id || (m.text === r.text && m.category === r.category));
          if (!exists) {
            merged.push(r);
          }
        });
        onUpdateMemories(merged);
        ZenDB.setMemories(merged);
        setSyncToast(`Sincronización exitosa: ${remoteMems.length} notas en base de datos.`);
      } else {
        // Upload local memories to PocketBase
        for (const m of memories) {
          await createMemoriaPB(m);
        }
        setSyncToast(`Sincronizadas ${memories.length} notas con PocketBase DB.`);
      }
    } catch (err) {
      console.error(err);
      setSyncToast("Error al sincronizar con la base de datos.");
    } finally {
      setIsSyncingDB(false);
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  // Delete note (Delete)
  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar esta nota mental de tu memoria y de la base de datos?")) return;
    const updated = memories.filter((m) => m.id !== id);
    onUpdateMemories(updated);
    ZenDB.setMemories(updated);

    // Remove from PocketBase
    await deleteMemoriaPB(id);
    setSyncToast("Nota Mental eliminada.");
    setTimeout(() => setSyncToast(null), 2500);
  };

  // Start editing note
  const handleStartEdit = (m: Memory) => {
    setEditingMemoryId(m.id);
    setEditingText(m.text);
    setEditingCat(m.category || "general");
    setEditingSummary(m.summary || "");
  };

  // Save edited note (Update)
  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    const summaryVal = editingSummary.trim() || undefined;
    const updated = memories.map((m) => {
      if (m.id === id) {
        return { 
          ...m, 
          text: editingText.trim(), 
          category: editingCat as any,
          summary: summaryVal,
        };
      }
      return m;
    });
    onUpdateMemories(updated);
    ZenDB.setMemories(updated);
    setEditingMemoryId(null);

    // Update in PocketBase
    await updateMemoriaPB(id, editingText.trim(), editingCat, summaryVal);
    setSyncToast("Nota Mental actualizada en DB.");
    setTimeout(() => setSyncToast(null), 2500);
  };

  // Summarize an individual mental note with AI (non-repetitive)
  const handleSummarizeNote = async (mem: Memory) => {
    setSummarizingMemId(mem.id);
    try {
      const existingOtherNotes = memories.filter((m) => m.id !== mem.id);
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();
      let summaryText = "";

      // 1. Direct Client Call with Groq
      if (groqKey) {
        try {
          summaryText = await summarizeMentalNoteWithGroq(mem.text, existingOtherNotes, profile.userName);
        } catch (groqErr) {
          console.warn("Direct note summarize with Groq failed, falling back to server...", groqErr);
        }
      }

      // 2. Server endpoint fallback
      if (!summaryText) {
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (groqKey) {
            headers["x-groq-api-key"] = groqKey;
            headers["x-groq-model"] = groqModel;
          }

          const response = await fetch("/api/summarize-note", {
            method: "POST",
            headers,
            body: JSON.stringify({
              noteText: mem.text,
              existingNotes: existingOtherNotes,
              userName: profile.userName,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.summary) {
              summaryText = data.summary;
            }
          }
        } catch {
          // Fallback
        }
      }

      if (!summaryText) {
        summaryText = mem.text.length > 120 ? mem.text.slice(0, 120) + "..." : mem.text;
      }

      const updated = memories.map((m) =>
        m.id === mem.id ? { ...m, summary: summaryText } : m
      );
      onUpdateMemories(updated);
      ZenDB.setMemories(updated);

      await updateMemoriaPB(mem.id, mem.text, mem.category, summaryText);
      setSyncToast("Resumen de nota generado y guardado.");
    } catch (err: any) {
      console.error("Error al resumir nota mental:", err);
      setSyncToast("Error al resumir nota con IA.");
    } finally {
      setSummarizingMemId(null);
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Find unsummarized conversations
  const unsummarizedConvs = conversations.filter((c) => {
    const hasMessages = messages.some((m) => m.conversationId === c.id);
    return hasMessages && !c.isSummarized;
  });

  // Find summarized conversations
  const summarizedConvs = conversations.filter((c) => c.isSummarized && c.summary);

  // Helper para calcular horario, franja e impacto circadiano
  const computeTimeSlotAndRange = (msgs: Message[]) => {
    if (!msgs || msgs.length === 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const hour = now.getHours();
      let slot = "Franja Diurna";
      if (hour >= 7 && hour < 12) slot = "Franja Matutina de Máximo Rendimiento (07:00 a 12:00)";
      else if (hour >= 12 && hour < 15) slot = "Franja Mediodía / Post-Almuerzo (12:00 a 15:00)";
      else if (hour >= 15 && hour < 19) slot = "Franja Vespertina / Tarde (15:00 a 19:00)";
      else if (hour >= 19) slot = "Franja Nocturna (19:00 a 00:00)";
      else slot = "Franja Madrugada (00:00 a 07:00)";
      return {
        timeRange: `${timeStr}`,
        timeSlot: slot,
      };
    }

    const firstDate = new Date(msgs[0].createdAt || Date.now());
    const lastDate = new Date(msgs[msgs.length - 1].createdAt || Date.now());
    const startStr = firstDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endStr = lastDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const hour = firstDate.getHours();

    let slot = "Franja Diurna";
    if (hour >= 7 && hour < 12) slot = "Franja Matutina de Máximo Rendimiento (07:00 a 12:00)";
    else if (hour >= 12 && hour < 15) slot = "Franja Mediodía / Post-Almuerzo (12:00 a 15:00)";
    else if (hour >= 15 && hour < 19) slot = "Franja Vespertina / Tarde (15:00 a 19:00)";
    else if (hour >= 19) slot = "Franja Nocturna (19:00 a 00:00)";
    else slot = "Franja Madrugada (00:00 a 07:00)";

    return {
      timeRange: `${startStr} a ${endStr} (${firstDate.toLocaleDateString()})`,
      timeSlot: slot,
    };
  };

  // Trigger server-side conversation summarization
  const handleSummarizeConversation = async (convId: string) => {
    setSummarizingConvId(convId);
    setSummarizeError(null);

    const convMsgs = messages.filter((m) => m.conversationId === convId);
    const targetConv = conversations.find((c) => c.id === convId);
    const timeData = computeTimeSlotAndRange(convMsgs);

    try {
      const groqKey = getStoredGroqApiKey();
      const groqModel = getStoredGroqModel();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (groqKey) {
        headers["x-groq-api-key"] = groqKey;
        headers["x-groq-model"] = groqModel;
      }

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: convMsgs,
          timeSlot: timeData.timeSlot,
          timeRange: timeData.timeRange,
          userName: profile.userName,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el servicio de resúmenes.");
      }

      const data = await response.json();
      const summaryText = data.summary;

      const updatedConvs = conversations.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            summary: summaryText,
            isSummarized: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      onUpdateConversations(updatedConvs);
      ZenDB.setConversations(updatedConvs);

      if (targetConv) {
        await upsertConversacionSummaryPB(convId, targetConv.title, summaryText);
      }
    } catch (err: any) {
      console.error(err);
      setSummarizeError(err.message || "Error al resumir.");
    } finally {
      setSummarizingConvId(null);
    }
  };

  // Filter & Search Memories
  const filteredMemories = memories.filter((m) => {
    const matchesCategory = activeFilter === "todos" || m.category === activeFilter;
    const matchesSearch = searchQuery === "" || 
      m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoriesList = [
    { id: "todos", label: "Todos" },
    { id: "general", label: "General" },
    { id: "experiencias", label: "Experiencias" },
    { id: "preferencias", label: "Preferencias" },
    { id: "hábitos", label: "Hábitos" },
    { id: "objetivos", label: "Objetivos" },
    { id: "creencias", label: "Creencias" },
    { id: "estrategias", label: "Estrategias" },
    { id: "valores", label: "Valores" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 font-sans pb-24 md:pb-10">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2D332D] text-white px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-[#8BA888]/40">
          <CheckCircle2 className="h-4 w-4 text-[#8BA888]" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#EAE2D6] pb-4 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#8BA888] text-white flex items-center justify-center shadow-md shadow-[#8BA888]/10 shrink-0">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#2D332D]">Notas Mentales & Memoria</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                PocketBase DB
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#7A7167] mt-0.5 leading-snug">
              Vivencias, leyes, preferencias y notas operativas que alimentan el contexto de <strong>{profile.companionName}</strong>.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSyncWithPocketBase}
            disabled={isSyncingDB}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 bg-white border border-[#EAE2D6] hover:bg-[#F5F1E8] text-[#2D332D] font-bold text-[11px] sm:text-xs rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Sincronizar notas con la base de datos PocketBase"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#8BA888] ${isSyncingDB ? "animate-spin" : ""}`} />
            <span>{isSyncingDB ? "Sincronizando..." : "Sincronizar DB"}</span>
          </button>

          {onOpenAddMemory && (
            <button
              onClick={onOpenAddMemory}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3.5 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nota Mental</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 2. Left and Middle Column: Memories CRUD Hub */}
        <div className="lg:col-span-2 space-y-5">

          {/* List Section with Search & Categories */}
          <div className="bg-white border border-[#EAE2D6] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            
            {/* Search and Filters bar */}
            <div className="space-y-3 border-b border-[#EAE2D6]/70 pb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A69D91]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en tus notas mentales y recuerdos..."
                  className="w-full pl-10 pr-4 py-2 bg-[#FBF9F4] border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] placeholder-[#A69D91] outline-none focus:border-[#8BA888]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A69D91] hover:text-[#2D332D]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categoriesList.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] transition capitalize cursor-pointer shrink-0 ${
                        activeFilter === tab.id
                          ? "bg-[#2D332D] text-white shadow-xs"
                          : "bg-[#F9F6F1] text-[#7A7167] border border-[#EAE2D6] hover:bg-[#EAE2D6]/40 hover:text-[#2D332D]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#A69D91] font-bold uppercase shrink-0">
                  {filteredMemories.length} {filteredMemories.length === 1 ? "Nota" : "Notas"}
                </span>
              </div>
            </div>

            {/* Memories List */}
            <div className="space-y-4">
              {filteredMemories.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-[#F9F6F1] text-[#A69D91] flex items-center justify-center mx-auto">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#4A443F]">No se encontraron notas mentales</h4>
                    <p className="text-[11px] text-[#7A7167] max-w-xs mx-auto mt-0.5">
                      {searchQuery ? "Prueba con otro término de búsqueda." : "Añade una nueva nota mental arriba o conversando con Aura."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredMemories.map((mem) => {
                    const isEditing = editingMemoryId === mem.id;

                    return (
                      <div 
                        key={mem.id} 
                        className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4.5 hover:border-[#8BA888]/40 transition space-y-3 group shadow-2xs"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-[#8BA888]/15 text-[#6D856B]">
                              {mem.category || "General"}
                            </span>
                            <span className="text-[10px] text-[#A69D91] flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(mem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Actions: Edit & Delete */}
                          {!isEditing && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleStartEdit(mem)}
                                className="p-1.5 rounded-lg hover:bg-white text-[#7A7167] hover:text-[#2D332D] transition cursor-pointer"
                                title="Editar nota mental"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMemory(mem.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-[#7A7167] hover:text-rose-600 transition cursor-pointer"
                                title="Eliminar nota mental"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Content or Edit Form */}
                        {isEditing ? (
                          <div className="space-y-3 pt-1">
                            <div>
                              <label className="text-[11px] font-semibold text-[#4A443F] block mb-1">
                                Contenido de la Nota / Experiencia:
                              </label>
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full text-xs p-3 border border-[#EAE2D6] rounded-xl bg-white text-[#2D332D] focus:border-[#8BA888] outline-none"
                                rows={3}
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-semibold text-[#4A443F]">
                                  Resumen de Alto Contexto (IA):
                                </label>
                                <button
                                  type="button"
                                  disabled={summarizingMemId === mem.id || !editingText.trim()}
                                  onClick={async () => {
                                    if (!editingText.trim()) return;
                                    setSummarizingMemId(mem.id);
                                    try {
                                      const existingOtherNotes = memories.filter((m) => m.id !== mem.id);
                                      const autoSumm = await summarizeMentalNoteWithGroq(editingText, existingOtherNotes, profile.userName);
                                      if (autoSumm) setEditingSummary(autoSumm);
                                    } catch (e) {
                                      console.error(e);
                                    } finally {
                                      setSummarizingMemId(null);
                                    }
                                  }}
                                  className="text-[10px] text-[#6D856B] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  <span>{summarizingMemId === mem.id ? "Generando..." : "Auto-generar resumen"}</span>
                                </button>
                              </div>
                              <textarea
                                value={editingSummary}
                                onChange={(e) => setEditingSummary(e.target.value)}
                                placeholder="Resumen conciso y sin redundancias que servirá de contexto para la IA..."
                                className="w-full text-xs p-2.5 border border-[#8BA888]/40 rounded-xl bg-white text-[#2D332D] focus:border-[#8BA888] outline-none"
                                rows={2}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between pt-1">
                              <select
                                value={editingCat}
                                onChange={(e) => setEditingCat(e.target.value)}
                                className="text-xs p-1.5 bg-white border border-[#EAE2D6] rounded-lg text-[#2D332D] outline-none"
                              >
                                {categoriesList.filter(c => c.id !== "todos").map((c) => (
                                  <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                              </select>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setEditingMemoryId(null)}
                                  className="px-3 py-1.5 text-xs border border-[#EAE2D6] text-[#7A7167] rounded-xl bg-white font-bold hover:bg-[#F9F6F1] transition cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(mem.id)}
                                  className="px-3.5 py-1.5 text-xs bg-[#8BA888] text-white rounded-xl font-bold hover:bg-[#6D856B] transition cursor-pointer"
                                >
                                  Guardar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-[#2D332D] leading-relaxed font-medium whitespace-pre-wrap">
                              {mem.text}
                            </p>

                            {/* Resumen IA si existe */}
                            {mem.summary ? (
                              <div className="mt-2.5 p-2.5 sm:p-3 bg-[#F4EFE6]/80 border border-[#8BA888]/30 rounded-xl space-y-1 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#6D856B] flex items-center gap-1.5 uppercase tracking-wide">
                                    <Sparkles className="h-3 w-3 text-amber-600" />
                                    Resumen IA (Contexto)
                                  </span>
                                  <button
                                    onClick={() => handleSummarizeNote(mem)}
                                    disabled={summarizingMemId === mem.id}
                                    className="text-[10px] text-[#7A7167] hover:text-[#2D332D] hover:underline transition cursor-pointer flex items-center gap-1 font-medium disabled:opacity-50"
                                    title="Regenerar resumen con IA sin repetir conceptos"
                                  >
                                    <RefreshCw className={`h-2.5 w-2.5 ${summarizingMemId === mem.id ? "animate-spin text-[#8BA888]" : ""}`} />
                                    <span>{summarizingMemId === mem.id ? "Regenerando..." : "Regenerar"}</span>
                                  </button>
                                </div>
                                <p className="text-[11px] text-[#3D3A35] font-medium leading-relaxed">
                                  {mem.summary}
                                </p>
                              </div>
                            ) : (
                              <div className="pt-1.5">
                                <button
                                  onClick={() => handleSummarizeNote(mem)}
                                  disabled={summarizingMemId === mem.id}
                                  className="text-[11px] font-bold text-[#6D856B] hover:text-[#4F684D] bg-[#8BA888]/15 hover:bg-[#8BA888]/25 px-2.5 py-1 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  title="Generar un resumen conciso y no repetitivo de esta nota para alimentar a la IA"
                                >
                                  {summarizingMemId === mem.id ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 animate-spin text-[#8BA888]" />
                                      <span>Resumiendo con IA...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-3 w-3 text-amber-600" />
                                      <span>Resumir con IA</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* 3. Right Column: Summarized Sessions & DB Status */}
        <div className="space-y-6">

          {/* PocketBase Connection Card */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Database className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Estado de Base de Datos</h4>
            </div>
            <p className="text-xs text-[#5A534D] leading-relaxed">
              Tus notas mentales y reflexiones se respaldan automáticamente en el servidor de PocketBase (colección <code>mentealfa_memorias</code>).
            </p>
            <div className="pt-2 border-t border-[#EAE2D6]/60 flex items-center justify-between text-[10px] font-bold text-[#7A7167]">
              <span>Host: 167.234.243.247:8090</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Conectado
              </span>
            </div>
          </div>

          {/* Resúmenes de Sesiones Pasadas */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE2D6]/60 pb-3">
              <BookmarkCheck className="h-4 w-4 text-[#8BA888]" />
              <h3 className="text-xs font-bold text-[#2D332D] uppercase tracking-wider">
                Resúmenes de Charlas Guardadas ({summarizedConvs.length})
              </h3>
            </div>

            {summarizedConvs.length === 0 ? (
              <p className="text-xs text-[#7A7167] py-4 text-center">
                Aún no has generado resúmenes. En la ventana de chat, haz clic en "Resumir y guardar en DB".
              </p>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {summarizedConvs.map((conv) => {
                  const isExpanded = expandedConvId === conv.id;
                  return (
                    <div key={conv.id} className="bg-[#FBF9F4] border border-[#EAE2D6] rounded-2xl p-4 space-y-2.5 transition">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#2D332D] truncate">{conv.title}</h4>
                        <span className="text-[10px] text-[#A69D91] shrink-0">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Mini Dimensional Badges if metadata exists */}
                      {conv.analysisMetadata?.axes && conv.analysisMetadata.axes.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {conv.analysisMetadata.axes.map((ax, i) => (
                            <span 
                              key={i} 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-lg truncate flex items-center justify-between ${
                                ax.intensity >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                              }`}
                            >
                              <span className="truncate">{ax.label.split(' ')[0]}</span>
                              <span className="font-black shrink-0">{ax.intensity >= 0 ? `+${ax.intensity}` : ax.intensity}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={`text-[11px] text-[#3A3530] leading-relaxed font-medium whitespace-pre-wrap ${!isExpanded ? "line-clamp-4" : ""}`}>
                        {conv.summary}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#EAE2D6]/40">
                        <button
                          type="button"
                          onClick={() => setExpandedConvId(isExpanded ? null : conv.id)}
                          className="text-[10px] font-bold text-[#8BA888] hover:text-[#6D856B] cursor-pointer"
                        >
                          {isExpanded ? "▲ Colapsar resumen" : "▼ Ver resumen completo"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (conv.summary) navigator.clipboard.writeText(conv.summary);
                          }}
                          className="text-[10px] text-[#7A7167] hover:text-[#2D332D] font-semibold cursor-pointer"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
