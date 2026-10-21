/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import TopNavbar, { NavTab } from "./components/TopNavbar";
import AuthScreen from "./components/AuthScreen";
import ChatView from "./components/ChatView";
import MemoriaView from "./components/MemoriaView";
import RegistrosView from "./components/RegistrosView";
import AnalisisView from "./components/AnalisisView";
import ConfiguracionView from "./components/ConfiguracionView";
import SistemaMentalView from "./components/SistemaMentalView";
import QuickLogModal from "./components/QuickLogModal";
import AddMemoryModal from "./components/AddMemoryModal";

import { ZenDB, UserProfile } from "./lib/storage";
import { 
  Conversation, 
  Message, 
  Memory, 
  DailyLog, 
  Pattern, 
  Strategy,
  CurrentState,
  Decision,
  DailyReport,
  SistemaMentalData,
  ObjetivoEstructurado
} from "./types";
import { clasificarFranjaHoraria, actualizarProgresoObjetivosConReporte } from "./lib/progressAuditor";
import { 
  fetchConversacionesPB, 
  fetchMemoriasPB, 
  fetchMensajesPB,
  fetchRegistrosPB,
  fetchPatronesPB,
  fetchEstrategiasPB,
  fetchPerfilPB,
  createMemoriaPB,
  createRegistroPB,
  createEstrategiaPB,
  createPatronPB,
  savePerfilPB,
  migrarBaseDeDatosExistenteAArbolPB
} from "./services/pocketbaseService";

export default function App() {
  // Session / Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<NavTab>("conversar");

  // Modals state
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);

  // Core application 5-layer database states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [currentState, setCurrentState] = useState<CurrentState>(ZenDB.getCurrentState());
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [sistemaMental, setSistemaMental] = useState<SistemaMentalData>(ZenDB.getSistemaMental());
  const [objetivosEstructurados, setObjetivosEstructurados] = useState<ObjetivoEstructurado[]>(() => ZenDB.getObjetivosEstructurados());
  const [activeConversationId, setActiveConversationId] = useState<string>("");

  // Initial load from localStorage / ZenDB and PocketBase (8 Collections)
  useEffect(() => {
    const userProfile = ZenDB.getUserProfile();
    setProfile(userProfile);

    const localConvs = ZenDB.getConversations();
    setConversations(localConvs);
    setMessages(ZenDB.getMessages());
    setMemories(ZenDB.getMemories());
    setLogs(ZenDB.getLogs());
    setPatterns(ZenDB.getPatterns());
    setStrategies(ZenDB.getStrategies());
    setCurrentState(ZenDB.getCurrentState());
    setDecisions(ZenDB.getDecisions());
    setDailyReports(ZenDB.getDailyReports());
    setActiveConversationId(ZenDB.getActiveConversationId());

    // 1. Consultar perfil en PocketBase
    fetchPerfilPB().then((remoteProfile) => {
      if (remoteProfile && remoteProfile.userName) {
        setProfile((prev) => {
          const updated = { ...prev, ...remoteProfile };
          ZenDB.setUserProfile(updated);
          return updated;
        });
      }
    });

    // 2. Consultar conversaciones y resúmenes guardados en PocketBase
    fetchConversacionesPB().then((remoteConvs) => {
      if (remoteConvs && remoteConvs.length > 0) {
        setConversations((current) => {
          const merged = [...current];
          remoteConvs.forEach((r) => {
            const idx = merged.findIndex((c) => c.id === r.id);
            if (idx >= 0) {
              if (r.summary && (!merged[idx].summary || !merged[idx].isSummarized)) {
                merged[idx] = { ...merged[idx], summary: r.summary, isSummarized: true, analysisMetadata: r.analysisMetadata || merged[idx].analysisMetadata };
              }
            } else {
              merged.push(r);
            }
          });
          ZenDB.setConversations(merged);
          return merged;
        });
      }
    });

    // 3. Consultar notas mentales guardadas en PocketBase
    fetchMemoriasPB().then((remoteMems) => {
      if (remoteMems && remoteMems.length > 0) {
        setMemories((current) => {
          const merged = [...current];
          remoteMems.forEach((r) => {
            const idx = merged.findIndex((m) => m.id === r.id || (m.text === r.text && m.category === r.category));
            if (idx >= 0) {
              if (r.summary && !merged[idx].summary) {
                merged[idx] = { ...merged[idx], summary: r.summary };
              }
            } else {
              merged.push(r);
            }
          });
          ZenDB.setMemories(merged);
          return merged;
        });
      }
    });

    // 4. Consultar mensajes de chat en PocketBase
    fetchMensajesPB().then((remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages((current) => {
          const merged = [...current];
          remoteMsgs.forEach((r) => {
            if (!merged.some((m) => m.id === r.id)) {
              merged.push(r);
            }
          });
          ZenDB.setMessages(merged);
          return merged;
        });
      }
    });

    // 5. Consultar registros diarios en PocketBase
    fetchRegistrosPB().then((remoteLogs) => {
      if (remoteLogs && remoteLogs.length > 0) {
        setLogs((current) => {
          const merged = [...current];
          remoteLogs.forEach((r) => {
            if (!merged.some((l) => l.id === r.id)) {
              merged.push(r);
            }
          });
          ZenDB.setLogs(merged);
          return merged;
        });
      }
    });

    // 6. Consultar patrones en PocketBase
    fetchPatronesPB().then((remotePats) => {
      if (remotePats && remotePats.length > 0) {
        setPatterns((current) => {
          const merged = [...current];
          remotePats.forEach((r) => {
            if (!merged.some((p) => p.id === r.id || p.description === r.description)) {
              merged.push(r);
            }
          });
          ZenDB.setPatterns(merged);
          return merged;
        });
      }
    });

    // 7. Consultar estrategias en PocketBase
    fetchEstrategiasPB().then((remoteStrats) => {
      if (remoteStrats && remoteStrats.length > 0) {
        setStrategies((current) => {
          const merged = [...current];
          remoteStrats.forEach((r) => {
            if (!merged.some((s) => s.id === r.id || s.name === r.name)) {
              merged.push(r);
            }
          });
          ZenDB.setStrategies(merged);
          return merged;
        });
      }
    });
  }, []);

  useEffect(() => {
    const yaMigrado = localStorage.getItem("mentealfa_migracion_arbol_v2_completada");
    if (!yaMigrado && (conversations.length > 0 || memories.length > 0)) {
      migrarBaseDeDatosExistenteAArbolPB(conversations, memories, strategies).then(
        ({ memoriesTransformadas, patternsConsolidados, totalFichas }) => {
          if (totalFichas > 0) {
            handleUpdateMemories(memoriesTransformadas);
            handleUpdatePatterns(patternsConsolidados);
            localStorage.setItem("mentealfa_migracion_arbol_v2_completada", "true");
            console.log(`Migracion automatica completada: ${totalFichas} experiencias historicas adaptadas al Arbol.`);
          }
        }
      );
    }
  }, [conversations.length, memories.length]);

  // Sync state modifications back to localStorage via ZenDB
  const handleUpdateConversations = (newConvs: Conversation[]) => {
    setConversations(newConvs);
    ZenDB.setConversations(newConvs);
  };

  const handleUpdateMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    ZenDB.setMessages(newMsgs);
  };

  const handleUpdateMemories = (newMems: Memory[]) => {
    setMemories(newMems);
    ZenDB.setMemories(newMems);
  };

  const handleUpdateLogs = (newLogs: DailyLog[]) => {
    setLogs(newLogs);
    ZenDB.setLogs(newLogs);
  };

  const handleUpdatePatterns = (newPats: Pattern[]) => {
    setPatterns(newPats);
    ZenDB.setPatterns(newPats);
  };

  const handleUpdateStrategies = (newStrats: Strategy[]) => {
    setStrategies(newStrats);
    ZenDB.setStrategies(newStrats);
  };

  const handleUpdateCurrentState = (newState: CurrentState) => {
    setCurrentState(newState);
    ZenDB.setCurrentState(newState);
  };

  const handleUpdateDecisions = (newDecs: Decision[]) => {
    setDecisions(newDecs);
    ZenDB.setDecisions(newDecs);
  };

  const handleUpdateDailyReports = (newReps: DailyReport[]) => {
    setDailyReports(newReps);
    ZenDB.setDailyReports(newReps);
  };

  const handleSetActiveConvId = (id: string) => {
    setActiveConversationId(id);
    ZenDB.setActiveConversationId(id);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    ZenDB.setUserProfile(newProfile);
    savePerfilPB(newProfile);
  };

  const handleUpdateSistemaMental = (newData: SistemaMentalData) => {
    setSistemaMental(newData);
    ZenDB.setSistemaMental(newData);
  };

  const handleUpdateObjetivos = (newObjs: ObjetivoEstructurado[]) => {
    setObjetivosEstructurados(newObjs);
    ZenDB.setObjetivosEstructurados(newObjs);
  };

  const handleSaveQuickLog = (newLog: DailyLog) => {
    const updated = [newLog, ...logs];
    handleUpdateLogs(updated);
    createRegistroPB(newLog);

    // Actualizar avance de objetivos estructurados
    const objetivosActualizados = actualizarProgresoObjetivosConReporte(objetivosEstructurados, newLog);
    handleUpdateObjetivos(objetivosActualizados);

    // Si hubo obstáculo y el método tuvo éxito, registrar automáticamente como Ficha de Vivencia Inmutable
    if (newLog.huboObstaculo && newLog.resultadoMetodo === "exito") {
      const { horaExacta, dateKey } = clasificarFranjaHoraria(newLog.createdAt);
      const nuevaMemoria: Memory = {
        id: `mem-viv-${Date.now()}`,
        text: `[Éxito ante obstáculo en ${horaExacta} hs] Detonante: ${newLog.detonante || "Fricción"}. Método que funcionó: ${newLog.metodoAplicado || newLog.note}`,
        category: newLog.tipoReporte === "productivo" ? "proyectos" : "vinculos",
        isApproved: true,
        createdAt: new Date().toISOString(),
        tags_mecanismo: newLog.rasgoCodigo ? [newLog.rasgoCodigo] : [],
        fichaInmutable: {
          id: `VIV-LOG-${Date.now()}`,
          fecha: dateKey,
          rama_id: newLog.tipoReporte === "productivo" ? "proyectos" : "vinculos",
          tags_mecanismo: newLog.rasgoCodigo ? [newLog.rasgoCodigo] : ["#ideal_adaptado"],
          contexto_situacional: {
            momento: `${horaExacta} hs (${newLog.franja || "operativa"})`,
            nivel_energia: newLog.energy >= 7 ? "alto" : "medio",
            factores_externos: newLog.note.slice(0, 140),
          },
          detonante_exacto: newLog.detonante || "Fricción operativa",
          reaccion_inicial: "Tentación o bajón detectado a tiempo",
          solucion_aplicada: newLog.metodoAplicado || "Protocolo aplicado con éxito",
          resultado: "exito",
          inmutable: true,
        },
      };
      handleSaveQuickMemory(nuevaMemoria);
    }
  };

  const handleSaveQuickMemory = (newMem: Memory) => {
    const updated = [newMem, ...memories];
    handleUpdateMemories(updated);
    createMemoriaPB(newMem);
  };

  // Render Onboarding Screen if profile is not initialized
  if (!profile) {
    return <AuthScreen onLogin={handleUpdateProfile} currentProfile={ZenDB.getUserProfile()} />;
  }

  // Render Dashboard Views
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FDFBF7] text-[#2D332D]">
      
      {/* Top Main Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenAddMemory={() => setIsAddMemoryOpen(true)}
        profile={profile}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === "conversar" && (
          <ChatView
            profile={profile}
            conversations={conversations}
            messages={messages}
            memories={memories}
            logs={logs}
            patterns={patterns}
            strategies={strategies}
            currentState={currentState}
            decisions={decisions}
            dailyReports={dailyReports}
            objetivosEstructurados={objetivosEstructurados}
            activeConversationId={activeConversationId}
            onUpdateConversations={handleUpdateConversations}
            onUpdateMessages={handleUpdateMessages}
            onUpdateMemories={handleUpdateMemories}
            onUpdateCurrentState={handleUpdateCurrentState}
            onUpdateDecisions={handleUpdateDecisions}
            onUpdateStrategies={handleUpdateStrategies}
            onSetActiveConvId={handleSetActiveConvId}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onOpenAddMemory={() => setIsAddMemoryOpen(true)}
            onSaveQuickLog={handleSaveQuickLog}
            onUpdateObjetivos={handleUpdateObjetivos}
          />
        )}

        {activeTab === "sistema" && (
          <SistemaMentalView
            data={sistemaMental}
            profile={profile}
            onUpdateData={handleUpdateSistemaMental}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === "memoria" && (
          <MemoriaView
            memories={memories}
            conversations={conversations}
            messages={messages}
            profile={profile}
            onUpdateMemories={handleUpdateMemories}
            onUpdateConversations={handleUpdateConversations}
            onOpenAddMemory={() => setIsAddMemoryOpen(true)}
          />
        )}

        {activeTab === "registros" && (
          <RegistrosView
            logs={logs}
            dailyReports={dailyReports}
            messages={messages}
            profile={profile}
            currentState={currentState}
            decisions={decisions}
            strategies={strategies}
            objetivosEstructurados={objetivosEstructurados}
            onUpdateLogs={handleUpdateLogs}
            onUpdateDailyReports={handleUpdateDailyReports}
            onUpdateObjetivos={handleUpdateObjetivos}
          />
        )}

        {activeTab === "patrones" && (
          <AnalisisView
            logs={logs}
            memories={memories}
            conversations={conversations}
            patterns={patterns}
            strategies={strategies}
            currentState={currentState}
            decisions={decisions}
            profile={profile}
            onUpdatePatterns={handleUpdatePatterns}
            onUpdateStrategies={handleUpdateStrategies}
            onUpdateDecisions={handleUpdateDecisions}
            onUpdateCurrentState={handleUpdateCurrentState}
          />
        )}

        {activeTab === "configuracion" && (
          <ConfiguracionView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Modals */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSaveLog={handleSaveQuickLog}
        objetivosActivos={objetivosEstructurados}
        reportesHoyCount={logs.filter((l) => clasificarFranjaHoraria(l.createdAt).dateKey === new Date().toISOString().split("T")[0]).length}
      />

      <AddMemoryModal
        isOpen={isAddMemoryOpen}
        onClose={() => setIsAddMemoryOpen(false)}
        onSaveMemory={handleSaveQuickMemory}
      />

    </div>
  );
}
