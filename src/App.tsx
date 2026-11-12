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
  ObjetivoEstructurado,
  ChatChannel
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
import {
  cargarReportesDesdeBD,
  guardarRegistroEnBD,
  obtenerColaPendiente,
  esMensajeDeReporte,
} from "./lib/dbSync";

export interface EstadoBD {
  disponible: boolean | null;
  rescatados: number;
  pendientes: number;
  totalRegistros: number;
}

export default function App() {
  const [estadoBD, setEstadoBD] = useState<EstadoBD>({
    disponible: null,
    rescatados: 0,
    pendientes: 0,
    totalRegistros: 0,
  });
  // Session / Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Navigation active tab & active chat channel (Chat A: carga_datos vs Chat B: consultas)
  const [activeTab, setActiveTab] = useState<NavTab>("conversar");
  const [activeChatChannel, setActiveChatChannel] = useState<ChatChannel>("carga_datos");

  // Modals state
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [autoRequestReportTrigger, setAutoRequestReportTrigger] = useState(0);
  const [autoLoadDataTrigger, setAutoLoadDataTrigger] = useState(0);

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

    // 4 y 5. REPORTES: la Base de Datos es la única fuente de verdad.
    //       Rescata reportes atrapados en el celular, los sube y limpia la copia local.
    cargarReportesDesdeBD().then((res) => {
      setLogs(res.logs);
      setMessages((current) => {
        const consultas = current.filter((m) => !esMensajeDeReporte(m));
        return [...res.mensajesReporte, ...consultas];
      });
      setEstadoBD({
        disponible: res.bdDisponible,
        rescatados: res.rescatadosLogs + res.rescatadosMensajes,
        pendientes: res.pendientes,
        totalRegistros: res.logs.length,
      });
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

  const handleSaveQuickLog = async (newLog: DailyLog, requestReportAfter?: boolean): Promise<boolean> => {
    setLogs((prev) => [newLog, ...prev.filter((l) => l.id !== newLog.id)]);
    const guardadoOk = await guardarRegistroEnBD(newLog);
    setEstadoBD((prev) => ({
      ...prev,
      disponible: guardadoOk ? true : prev.disponible,
      pendientes: obtenerColaPendiente().logs.length + obtenerColaPendiente().mensajes.length,
      totalRegistros: prev.totalRegistros + 1,
    }));

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

    // Si el usuario guardó desde el modal y pidió Reporte + Consejos a continuación
    if (requestReportAfter) {
      setActiveTab("conversar");
      setTimeout(() => {
        setAutoRequestReportTrigger((prev) => prev + 1);
      }, 150);
    }
    return guardadoOk;
  };

  const handleRequestReportFromNavbar = () => {
    setActiveTab("conversar");
    setTimeout(() => {
      setAutoRequestReportTrigger((prev) => prev + 1);
    }, 100);
  };

  const handleSaveQuickMemory = (newMem: Memory) => {
    const updated = [newMem, ...memories];
    handleUpdateMemories(updated);
    createMemoriaPB(newMem);
  };

  const handleSaveNewStrategy = (newStrat: Strategy) => {
    const exists = strategies.some(
      (s) => s.name.trim().toLowerCase() === newStrat.name.trim().toLowerCase()
    );
    if (exists) return;
    const updated = [newStrat, ...strategies];
    handleUpdateStrategies(updated);
    createEstrategiaPB(newStrat);
  };

  const handleSaveNewPattern = (newPat: Pattern) => {
    const updated = [newPat, ...patterns];
    handleUpdatePatterns(updated);
    createPatronPB(newPat);
  };

  // Render Onboarding Screen if profile is not initialized
  if (!profile) {
    return <AuthScreen onLogin={handleUpdateProfile} currentProfile={ZenDB.getUserProfile()} />;
  }

  // Render Dashboard Views
  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-[#FDFBF7] text-[#2D332D]">
      
      {/* Top Main Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeChatChannel={activeChatChannel}
        onSelectChatChannel={setActiveChatChannel}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenAddMemory={() => setIsAddMemoryOpen(true)}
        onRequestReport={handleRequestReportFromNavbar}
        profile={profile}
      />

      {/* Aviso de rescate / estado de Base de Datos real */}
      {estadoBD.rescatados > 0 && (
        <div className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <span>
            ✓ {estadoBD.rescatados} reportes rescatados del celular y guardados en la Base de Datos central (copia local eliminada).
          </span>
          <button
            type="button"
            onClick={() => setEstadoBD((prev) => ({ ...prev, rescatados: 0 }))}
            className="underline text-[11px] opacity-90 hover:opacity-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
      {(estadoBD.disponible === false || estadoBD.pendientes > 0) && (
        <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <span>
            ⚠️ {estadoBD.pendientes > 0 ? `${estadoBD.pendientes} envío(s) en cola esperando conexión a Base de Datos.` : "Sin conexión con el servidor de Base de Datos."}
          </span>
          <button
            type="button"
            onClick={() => {
              cargarReportesDesdeBD().then((res) => {
                setLogs(res.logs);
                setMessages((current) => {
                  const consultas = current.filter((m) => !esMensajeDeReporte(m));
                  return [...res.mensajesReporte, ...consultas];
                });
                setEstadoBD({
                  disponible: res.bdDisponible,
                  rescatados: res.rescatadosLogs + res.rescatadosMensajes,
                  pendientes: res.pendientes,
                  totalRegistros: res.logs.length,
                });
              });
            }}
            className="bg-white text-amber-800 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold cursor-pointer"
          >
            Reintentar ahora
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === "conversar" && (
          <ChatView
            profile={profile}
            activeChatChannel={activeChatChannel}
            onChangeChatChannel={setActiveChatChannel}
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
            onUpdatePatterns={handleUpdatePatterns}
            onSaveNewStrategy={handleSaveNewStrategy}
            onSaveNewPattern={handleSaveNewPattern}
            onSetActiveConvId={handleSetActiveConvId}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onOpenAddMemory={() => setIsAddMemoryOpen(true)}
            onSaveQuickLog={handleSaveQuickLog}
            onUpdateObjetivos={handleUpdateObjetivos}
            autoRequestReportTrigger={autoRequestReportTrigger}
            autoLoadDataTrigger={autoLoadDataTrigger}
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
            onSaveNewStrategy={handleSaveNewStrategy}
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
        reportesHoyCount={logs.filter((l) => clasificarFranjaHoraria(l.createdAt).dateKey === clasificarFranjaHoraria().dateKey).length}
      />

      <AddMemoryModal
        isOpen={isAddMemoryOpen}
        onClose={() => setIsAddMemoryOpen(false)}
        onSaveMemory={handleSaveQuickMemory}
      />

    </div>
  );
}
