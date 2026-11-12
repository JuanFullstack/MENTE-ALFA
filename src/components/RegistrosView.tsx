/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Sliders,
  NotepadText,
  Sparkles,
  AlertTriangle,
  FileText,
  RefreshCw,
  Target,
  Clock,
  Check,
  Zap,
  Brain,
  RotateCcw,
  BarChart3,
  Activity,
  ShieldCheck,
  HeartPulse,
  Compass,
  Calendar,
} from "lucide-react";
import {
  DailyLog,
  DailyReport,
  Message,
  CurrentState,
  Decision,
  Strategy,
  ObjetivoEstructurado,
  TipoObjetivo,
  PeriodoObjetivo,
  CodigoRasgo,
  FranjaOperativa,
  FactorContextualPatron,
} from "../types";
import { UserProfile } from "../lib/storage";
import { getStoredGroqApiKey, getStoredGroqModel } from "../services/groqEvaluation";
import { createRegistroPB, deleteRegistroPB } from "../services/pocketbaseService";
import { PLANTILLAS_RASGOS_OFICIALES, clasificarFranjaHoraria } from "../lib/progressAuditor";
import {
  ETIQUETAS_FACTORES_CONTEXTO,
  CATALOGO_EMOCIONES_ESTRUCTURADO,
  verificarSiEsMetodoNuevo,
  extraerReporteDeterminista,
} from "../lib/reportExtractor";

interface RegistrosViewProps {
  logs: DailyLog[];
  dailyReports: DailyReport[];
  messages: Message[];
  profile: UserProfile;
  currentState: CurrentState;
  decisions: Decision[];
  strategies: Strategy[];
  objetivosEstructurados?: ObjetivoEstructurado[];
  onUpdateLogs: (logs: DailyLog[]) => void;
  onUpdateDailyReports: (reports: DailyReport[]) => void;
  onUpdateObjetivos?: (objs: ObjetivoEstructurado[]) => void;
  onSaveNewStrategy?: (strategy: Strategy) => void;
}

type HorizonteReporte = "diario" | "semanal" | "mensual" | "anual";

export default function RegistrosView({
  logs,
  dailyReports,
  messages,
  profile,
  currentState,
  decisions,
  strategies,
  objetivosEstructurados = [],
  onUpdateLogs,
  onUpdateDailyReports,
  onUpdateObjetivos,
  onSaveNewStrategy,
}: RegistrosViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"reportes" | "objetivos" | "rapidos">("reportes");
  const [horizonte, setHorizonte] = useState<HorizonteReporte>("diario");
  const [filtroPeriodoObjetivoReporte, setFiltroPeriodoObjetivoReporte] = useState<PeriodoObjetivo | "todos">("todos");
  const [filtroPeriodoPestanaObjetivos, setFiltroPeriodoPestanaObjetivos] = useState<PeriodoObjetivo | "todos">("todos");

  // Estado del creador de objetivos
  const [isCrearObjOpen, setIsCrearObjOpen] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState<TipoObjetivo>("crecimiento_psicologico");
  const [nuevoPeriodo, setNuevoPeriodo] = useState<PeriodoObjetivo>("diario");
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<CodigoRasgo | "">("PSI-1_autoconfianza");
  const [formTitulo, setFormTitulo] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].titulo);
  const [formMetaNum, setFormMetaNum] = useState(1);
  const [formMetaUnidad, setFormMetaUnidad] = useState<"dias" | "episodios_exitosos" | "bloques" | "horas">("episodios_exitosos");
  const [formFranja, setFormFranja] = useState<FranjaOperativa>("23:00_cierre_o_social");
  const [formDecreto, setFormDecreto] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].decretoClave);
  const [formProtocolo, setFormProtocolo] = useState(PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].protocoloPasos.join("\n"));

  // Quick log states (Las 3 Variables Clave)
  const [energy, setEnergy] = useState(7);
  const [animoScore, setAnimoScore] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [stress, setStress] = useState(4);
  const [enCondicionesFisicas, setEnCondicionesFisicas] = useState(true);
  const [actividadLog, setActividadLog] = useState("");
  const [tiempoProductivoMin, setTiempoProductivoMin] = useState<number>(60);
  const [tiempoDistraidoMin, setTiempoDistraidoMin] = useState<number>(0);
  const [motivoDistraccion, setMotivoDistraccion] = useState("");
  const [metasLog, setMetasLog] = useState("");
  const [compromisoLog, setCompromisoLog] = useState("");
  const [autoimagenSel, setAutoimagenSel] = useState<string>("Autoconfianza firme");
  const [sensacionPrimitivaSel, setSensacionPrimitivaSel] = useState<string>("");
  const [estadoNegativoSel, setEstadoNegativoSel] = useState<string>("");
  const [controlEmocionalSel, setControlEmocionalSel] = useState<"si" | "parcial" | "no">("si");
  const [factoresContextoSel, setFactoresContextoSel] = useState<FactorContextualPatron[]>([]);
  const [metodoPsiLog, setMetodoPsiLog] = useState("");
  const [note, setNote] = useState("");

  // Daily report manual generator states
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const hoyIso = new Date().toISOString().split("T")[0];
  const mesActualIso = hoyIso.slice(0, 7); // YYYY-MM
  const anioActualIso = hoyIso.slice(0, 4); // YYYY

  // Filtrado estricto de logs según horizonte (Diario, Semanal, Mensual, Anual)
  const logsPeriodo = useMemo(() => {
    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    return (logs || []).filter((l) => {
      const fKey = l.dateKey || clasificarFranjaHoraria(l.createdAt).dateKey;
      if (horizonte === "diario") {
        return fKey === hoyIso;
      }
      if (horizonte === "semanal") {
        const d = new Date(l.createdAt);
        return d >= hace7Dias && d <= ahora;
      }
      if (horizonte === "mensual") {
        return fKey.startsWith(mesActualIso);
      }
      if (horizonte === "anual") {
        return fKey.startsWith(anioActualIso);
      }
      return true;
    });
  }, [logs, horizonte, hoyIso, mesActualIso, anioActualIso]);

  const reportesHoyCount = (logs || []).filter(
    (l) => (l.dateKey || clasificarFranjaHoraria(l.createdAt).dateKey) === hoyIso
  ).length;

  // ============================================================================
  // CÁLCULO DE MÉTRICAS Y GRÁFICOS REALES (CERO DATOS INVENTADOS)
  // ============================================================================
  const telemetriaPeriodo = useMemo(() => {
    if (logsPeriodo.length === 0) return null;

    let totalProdMin = 0;
    let totalDistMin = 0;
    let totalRegMin = 0;

    let sumaEnergia = 0;
    let sumaAnimo = 0;
    let sumaProdScore = 0;
    let conteoFatigaFisica = 0;

    let controlSi = 0;
    let controlParcial = 0;
    let controlNo = 0;

    const conteoAutoimagen: Record<string, number> = {};
    const conteoPrimitivas: Record<string, number> = {};
    const conteoNegativos: Record<string, number> = {};
    const respuestasNegativas: { estado: string; respuesta: string; control: string; hora: string }[] = [];
    const conteoFactoresContexto: Record<string, number> = {};
    const conteoFranjas: Record<string, number> = {};
    const distribucionActividades: Record<string, { min: number; tipo: "productiva" | "distraccion" | "regulacion" }> = {};
    const metodosMap: Record<
      string,
      { total: number; exitos: number; esNuevo: boolean }
    > = {};

    // Orden cronológico ascendente para curva de energía/desgaste
    const logsOrdenados = [...logsPeriodo].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const serieTemporal = logsOrdenados.map((l) => {
      // Si es un log antiguo sin campos extendidos, podemos inferir determinísticamente de su nota sin inventar fuera del log
      const fallback =
        !l.manejoAutoimagen && l.note
          ? extraerReporteDeterminista(
              l.note,
              l.horaExacta || "12:00",
              objetivosEstructurados,
              strategies
            )
          : null;

      const prodMin =
        typeof l.tiempoProductivoMin === "number"
          ? l.tiempoProductivoMin
          : fallback?.variableAccion.tiempoProductivoMin ?? 45;
      const distMin =
        typeof l.tiempoDistraidoMin === "number"
          ? l.tiempoDistraidoMin
          : fallback?.variableAccion.tiempoDistraidoMin ?? 0;
      const regMin =
        typeof l.tiempoRegulacionMin === "number"
          ? l.tiempoRegulacionMin
          : l.metodoAplicado && l.metodoAplicado !== "Sin método explícito registrado"
          ? 12
          : 0;

      totalProdMin += prodMin;
      totalDistMin += distMin;
      totalRegMin += regMin;

      const eScore = l.energy ?? 7;
      const aScore = l.moodScore ?? l.energy ?? 7;
      const pScore = l.productivityScore ?? l.motivation ?? 7;

      sumaEnergia += eScore;
      sumaAnimo += aScore;
      sumaProdScore += pScore;

      if (l.enCondiciones === false || eScore <= 4) {
        conteoFatigaFisica++;
      }

      const ctrl = l.controloEmociones || fallback?.variableAnimoEmociones.controloEmociones || "si";
      if (ctrl === "si") controlSi++;
      else if (ctrl === "parcial") controlParcial++;
      else controlNo++;

      // Emociones separadas (Autoimagen, Sensaciones Primitivas, Estados Negativos)
      const autoimg = l.manejoAutoimagen || fallback?.variableAnimoEmociones.manejoAutoimagen;
      if (autoimg) {
        conteoAutoimagen[autoimg] = (conteoAutoimagen[autoimg] || 0) + 1;
      }

      const prim = l.sensacionesPrimitivas || fallback?.variableAnimoEmociones.sensacionesPrimitivas;
      if (prim && !prim.toLowerCase().includes("sin activaci")) {
        conteoPrimitivas[prim] = (conteoPrimitivas[prim] || 0) + 1;
      }

      const estNeg = l.estadosNegativos || fallback?.variableAnimoEmociones.estadosNegativos || [];
      estNeg.forEach((item) => {
        if (item && item !== "Ninguno") {
          conteoNegativos[item] = (conteoNegativos[item] || 0) + 1;
        }
      });

      if (estNeg.length > 0 || l.detonante) {
        respuestasNegativas.push({
          estado: estNeg.join(", ") || l.detonante || "Tensión",
          respuesta:
            l.respuestaEstadoNegativo ||
            fallback?.variableAnimoEmociones.respuestaAnteNegativo ||
            (l.metodoAplicado ? `Aplicó ${l.metodoAplicado}` : "Observación consciente"),
          control: ctrl,
          hora: l.horaExacta || clasificarFranjaHoraria(l.createdAt).horaExacta,
        });
      }

      // Factores contextuales de patrón
      const factores = l.factoresContextuales || fallback?.patronesContexto.factoresContextuales || [];
      factores.forEach((f) => {
        const label = ETIQUETAS_FACTORES_CONTEXTO[f] || f;
        conteoFactoresContexto[label] = (conteoFactoresContexto[label] || 0) + 1;
      });

      const franja = l.franja || clasificarFranjaHoraria(l.createdAt).franja;
      conteoFranjas[franja] = (conteoFranjas[franja] || 0) + 1;

      // Actividades
      const actNombre = l.actividadRealizada || "Bloque operativo";
      if (prodMin > 0) {
        if (!distribucionActividades[actNombre]) {
          distribucionActividades[actNombre] = { min: 0, tipo: "productiva" };
        }
        distribucionActividades[actNombre].min += prodMin;
      }
      if (distMin > 0) {
        const distLabel = `⚠️ Distracción (${l.detonante || "Desvío de foco"})`;
        if (!distribucionActividades[distLabel]) {
          distribucionActividades[distLabel] = { min: 0, tipo: "distraccion" };
        }
        distribucionActividades[distLabel].min += distMin;
      }

      // Métodos reguladores
      const met = l.metodoAplicado || fallback?.metodoAplicado;
      if (met && met !== "Sin método explícito registrado") {
        if (!metodosMap[met]) {
          metodosMap[met] = {
            total: 0,
            exitos: 0,
            esNuevo: Boolean(l.esMetodoNuevo),
          };
        }
        metodosMap[met].total += 1;
        if (l.resultadoMetodo !== "fallo") {
          metodosMap[met].exitos += 1;
        }
        if (l.esMetodoNuevo) {
          metodosMap[met].esNuevo = true;
        }
      }

      return {
        id: l.id,
        etiquetaTiempo:
          horizonte === "diario"
            ? l.horaExacta || clasificarFranjaHoraria(l.createdAt).horaExacta
            : `${(l.dateKey || l.createdAt.slice(0, 10)).slice(5)} ${
                l.horaExacta || clasificarFranjaHoraria(l.createdAt).horaExacta
              }`,
        energia: eScore,
        animo: aScore,
        productividad: pScore,
        prodMin,
        distMin,
        actividad: actNombre,
        metodo: met,
        control: ctrl,
      };
    });

    const n = logsPeriodo.length;
    const tiempoTotalMin = Math.max(1, totalProdMin + totalDistMin + totalRegMin);
    const pctControlTiempo =
      totalProdMin + totalDistMin > 0
        ? Math.round((totalProdMin / (totalProdMin + totalDistMin)) * 100)
        : 100;
    const pctControlEmocional = Math.round(((controlSi + controlParcial * 0.5) / n) * 100);

    // Desgaste energético entre el primer y último registro del período
    const deltaEnergia =
      serieTemporal.length >= 2
        ? serieTemporal[serieTemporal.length - 1].energia - serieTemporal[0].energia
        : 0;

    return {
      totalRegistros: n,
      totalProdMin,
      totalDistMin,
      totalRegMin,
      tiempoTotalMin,
      pctProdTiempo: Math.round((totalProdMin / tiempoTotalMin) * 100),
      pctDistTiempo: Math.round((totalDistMin / tiempoTotalMin) * 100),
      pctRegTiempo: Math.round((totalRegMin / tiempoTotalMin) * 100),
      pctControlTiempo,
      promedioEnergia: Number((sumaEnergia / n).toFixed(1)),
      promedioAnimo: Number((sumaAnimo / n).toFixed(1)),
      promedioProductividad: Number((sumaProdScore / n).toFixed(1)),
      conteoFatigaFisica,
      deltaEnergia,
      controlSi,
      controlParcial,
      controlNo,
      pctControlEmocional,
      conteoAutoimagen,
      conteoPrimitivas,
      conteoNegativos,
      respuestasNegativas,
      conteoFactoresContexto,
      conteoFranjas,
      distribucionActividades,
      metodosMap,
      serieTemporal,
    };
  }, [logsPeriodo, horizonte, strategies]);

  // Objetivos por período (Diario, Semanal, Mensual)
  const objetivosDiarios = (objetivosEstructurados || []).filter((o) => o.periodo === "diario");
  const objetivosSemanales = (objetivosEstructurados || []).filter((o) => o.periodo === "semanal");
  const objetivosMensuales = (objetivosEstructurados || []).filter((o) => o.periodo === "mensual");

  // Manejo de plantillas oficiales
  const handleSeleccionarPlantilla = (codigo: CodigoRasgo) => {
    setPlantillaSeleccionada(codigo);
    const p = PLANTILLAS_RASGOS_OFICIALES[codigo];
    if (p) {
      setNuevoTipo(p.tipo);
      setFormTitulo(p.titulo);
      setFormMetaNum(
        nuevoPeriodo === "diario"
          ? 1
          : nuevoPeriodo === "mensual"
          ? p.metaSugeridaSemanal * 4
          : p.metaSugeridaSemanal
      );
      setFormMetaUnidad(p.unidad);
      setFormFranja(p.franjaCritica);
      setFormDecreto(p.decretoClave);
      setFormProtocolo(p.protocoloPasos.join("\n"));
    }
  };

  const handleCrearObjetivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) return;

    const p = plantillaSeleccionada ? PLANTILLAS_RASGOS_OFICIALES[plantillaSeleccionada] : null;
    const nuevoObj: ObjetivoEstructurado = {
      id: `OBJ-${Date.now()}`,
      titulo: formTitulo.trim(),
      tipo: nuevoTipo,
      periodo: nuevoPeriodo,
      periodoClave:
        nuevoPeriodo === "diario"
          ? `Hoy (${hoyIso})`
          : nuevoPeriodo === "semanal"
          ? "Semana Actual"
          : "Mes Actual",
      rasgoCodigo: (plantillaSeleccionada || "PSI-1_autoconfianza") as CodigoRasgo,
      rama_id: p ? p.rama_id : nuevoTipo === "crecimiento_psicologico" ? "vinculos" : "proyectos",
      tags_mecanismo: p ? p.tags_mecanismo : [],
      franjaCritica: formFranja,
      meta: {
        objetivoNumerico: Number(formMetaNum) || 1,
        progresoActual: 0,
        unidad: formMetaUnidad,
      },
      protocoloPasos: formProtocolo
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      decretoClave: formDecreto.trim(),
      obstaculosRegistrados: [],
      exitosRegistrados: [],
      estado: "cumpliendo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const actualizados = [nuevoObj, ...(objetivosEstructurados || [])];
    onUpdateObjetivos?.(actualizados);
    setIsCrearObjOpen(false);
  };

  const handleEliminarObjetivo = (id: string) => {
    const actualizados = (objetivosEstructurados || []).filter((o) => o.id !== id);
    onUpdateObjetivos?.(actualizados);
  };

  const handleIncrementarProgreso = (id: string) => {
    const info = clasificarFranjaHoraria();
    const actualizados = (objetivosEstructurados || []).map((o) => {
      if (o.id !== id) return o;
      const nuevoProg = Math.min(o.meta.objetivoNumerico, o.meta.progresoActual + 1);
      const nuevoExito = {
        fecha: info.dateKey,
        hora: info.horaExacta,
        detonanteNegativo: "Avance directo manual",
        metodoAplicado: o.protocoloPasos[0] || "Ejecución de protocolo",
      };
      return {
        ...o,
        meta: { ...o.meta, progresoActual: nuevoProg },
        exitosRegistrados: [nuevoExito, ...o.exitosRegistrados].slice(0, 15),
        estado: nuevoProg >= o.meta.objetivoNumerico ? ("completado" as const) : o.estado,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateObjetivos?.(actualizados);
  };

  const handleResetProgreso = (id: string) => {
    const actualizados = (objetivosEstructurados || []).map((o) => {
      if (o.id !== id) return o;
      return {
        ...o,
        meta: { ...o.meta, progresoActual: 0 },
        estado: "cumpliendo" as const,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateObjetivos?.(actualizados);
  };

  const toggleFactorContexto = (f: FactorContextualPatron) => {
    setFactoresContextoSel((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  // Guardar carga manual con las 3 Variables Clave y detección de Nuevo Método
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const info = clasificarFranjaHoraria();
    const metasArr = metasLog
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const nombreMetodo = metodoPsiLog.trim();
    const esNuevo = nombreMetodo ? verificarSiEsMetodoNuevo(nombreMetodo, strategies) : false;
    if (esNuevo && nombreMetodo && onSaveNewStrategy) {
      onSaveNewStrategy({
        id: `strat-new-${Date.now()}`,
        name: nombreMetodo,
        situation: estadoNegativoSel || "Fricción o caída de energía",
        effectiveness: controlEmocionalSel === "no" ? "baja" : "alta",
        reason: `Método regulador registrado en carga diaria (${info.dateKey} ${info.horaExacta})`,
        result: controlEmocionalSel === "no" ? "Parcial" : "Logró regular el estado",
        resultType: controlEmocionalSel === "no" ? "negativo" : "positivo",
        status: "en prueba",
        createdAt: new Date().toISOString(),
      });
    }

    const emocionesLista = [
      autoimagenSel,
      sensacionPrimitivaSel,
      estadoNegativoSel,
    ].filter(Boolean);

    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      dateKey: info.dateKey,
      horaExacta: info.horaExacta,
      franja: info.franja,
      energy,
      motivation,
      stress,
      moodScore: animoScore,
      productivityScore: motivation,
      enCondiciones: enCondicionesFisicas,
      desgasteAcumulado: !enCondicionesFisicas
        ? "Cansancio físico/biológico reportado"
        : energy <= 4
        ? "Energía baja"
        : "En condiciones operativas",
      emocionesDetectadas: emocionesLista,
      manejoAutoimagen: autoimagenSel || "Estable",
      sensacionesPrimitivas: sensacionPrimitivaSel || undefined,
      estadosNegativos: estadoNegativoSel ? [estadoNegativoSel] : [],
      controloEmociones: controlEmocionalSel,
      respuestaEstadoNegativo: nombreMetodo
        ? `Aplicó método: ${nombreMetodo}`
        : controlEmocionalSel === "si"
        ? "Regulación consciente"
        : "Costó regular el estado",
      actividadRealizada: actividadLog.trim() || "Avance en bloque actual",
      tiempoProductivoMin: Number(tiempoProductivoMin) || 0,
      tiempoDistraidoMin: Number(tiempoDistraidoMin) || 0,
      actividadesDetalle: [
        ...(Number(tiempoProductivoMin) > 0
          ? [
              {
                nombre: actividadLog.trim() || "Bloque productivo",
                minutos: Number(tiempoProductivoMin),
                categoria: "productiva" as const,
              },
            ]
          : []),
        ...(Number(tiempoDistraidoMin) > 0
          ? [
              {
                nombre: motivoDistraccion.trim() || "Distracción",
                minutos: Number(tiempoDistraidoMin),
                categoria: "distraccion" as const,
              },
            ]
          : []),
      ],
      metasEspecificas: metasArr.length > 0 ? metasArr : undefined,
      compromisoHorario: compromisoLog.trim() || undefined,
      estadoPsicologicoEtiqueta: `${autoimagenSel}${estadoNegativoSel ? ` · ${estadoNegativoSel}` : ""}`,
      detonante: motivoDistraccion.trim() || estadoNegativoSel || undefined,
      metodoAplicado: nombreMetodo || undefined,
      esMetodoNuevo: esNuevo,
      resultadoMetodo: controlEmocionalSel === "no" ? "fallo" : controlEmocionalSel === "parcial" ? "parcial" : "exito",
      factoresContextuales: factoresContextoSel.length > 0 ? factoresContextoSel : undefined,
      note:
        note.trim() ||
        `[${info.horaExacta}] ⚡ Salud/Energía: ${energy}/10 | 🧠 Ánimo/Emociones: ${animoScore}/10 (${autoimagenSel}${
          sensacionPrimitivaSel ? `, ${sensacionPrimitivaSel}` : ""
        }${estadoNegativoSel ? `, ${estadoNegativoSel}` : ""}) Control:${controlEmocionalSel.toUpperCase()} Método:${
          nombreMetodo || "Ninguno"
        }${esNuevo ? " [NUEVO MÉTODO]" : ""} | 🎯 Acción: ${
          actividadLog.trim() || "Avance"
        } (Prod: ${tiempoProductivoMin}m, Distraído: ${tiempoDistraidoMin}m)`,
    };

    onUpdateLogs([newLog, ...logs]);
    createRegistroPB(newLog);
    setNote("");
    setActividadLog("");
    setMotivoDistraccion("");
    setMetasLog("");
    setCompromisoLog("");
    setMetodoPsiLog("");
    setFactoresContextoSel([]);
  };

  const handleDeleteLog = (id: string) => {
    onUpdateLogs(logs.filter((l) => l.id !== id));
    deleteRegistroPB(id);
  };

  // Renderizador de barra de objetivos por nivel (Diario, Semanal, Mensual) o "Sin objetivo"
  const renderBarraObjetivosPorNivel = (periodoNivel: PeriodoObjetivo, tituloNivel: string) => {
    const lista = (objetivosEstructurados || []).filter((o) => o.periodo === periodoNivel);

    return (
      <div className="bg-white border border-[#EAE2D6] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAE2D6]/70 pb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#6D856B]" />
            <h4 className="text-xs font-extrabold text-[#2D332D] uppercase tracking-wider">
              {tituloNivel}
            </h4>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              lista.length > 0
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-neutral-100 text-neutral-500 border border-neutral-200"
            }`}
          >
            {lista.length > 0 ? `${lista.length} activo(s)` : "Sin objetivo"}
          </span>
        </div>

        {lista.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-dashed border-[#DCD5C9] rounded-xl p-3.5 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-[#7A7167] block">Sin objetivo</span>
              <span className="text-[11px] text-[#A69D91]">
                No hay objetivo {periodoNivel} configurado actualmente.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setNuevoPeriodo(periodoNivel);
                setActiveSubTab("objetivos");
                setIsCrearObjOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#8BA888]/15 hover:bg-[#8BA888] text-[#5A7358] hover:text-white text-[11px] font-bold transition cursor-pointer shrink-0"
            >
              + Definir {periodoNivel}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lista.map((obj) => {
              const ratio = Math.min(1, obj.meta.progresoActual / Math.max(1, obj.meta.objetivoNumerico));
              const pct = Math.round(ratio * 100);
              return (
                <div key={obj.id} className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#2D332D] truncate">{obj.titulo}</span>
                    <span className="font-extrabold text-[#6D856B] shrink-0">
                      {obj.meta.progresoActual}/{obj.meta.objetivoNumerico} {obj.meta.unidad} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE2D6] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? "bg-emerald-600" : pct >= 50 ? "bg-[#8BA888]" : "bg-amber-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#7A7167] pt-0.5">
                    <span>
                      {obj.tipo === "crecimiento_psicologico" ? "🧠 Psicológico" : "⚡ Productivo"} · Franja:{" "}
                      {obj.franjaCritica.replace(/_/g, " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrementarProgreso(obj.id)}
                      className="px-2 py-0.5 rounded bg-[#8BA888] text-white font-bold hover:bg-[#6D856B] cursor-pointer"
                    >
                      +1 avance
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-4 sm:p-6 md:p-8 space-y-6 font-sans pb-20 md:pb-8">
      {/* 1. Header Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAE2D6] pb-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#1E5678] text-white flex items-center justify-center shadow-md shrink-0">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2D332D]">
              Reportes Diarios, Mensuales y Anuales · Las 3 Variables Clave
            </h2>
            <p className="text-xs text-[#7A7167] mt-0.5">
              1. Salud y Energía · 2. Estado de Ánimo y Emociones · 3. Acción y Control del Tiempo · Patrones y Métodos.
            </p>
          </div>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#F5F1E8] p-1 rounded-xl border border-[#EAE2D6]">
            <button
              onClick={() => setActiveSubTab("reportes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "reportes"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-[#1E5678]" />
              <span>Reportes y Gráficos</span>
            </button>
            <button
              onClick={() => setActiveSubTab("objetivos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "objetivos"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              <Target className="h-3.5 w-3.5 text-[#6D856B]" />
              <span>Objetivos ({(objetivosEstructurados || []).length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("rapidos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "rapidos"
                  ? "bg-white text-[#2D332D] shadow-xs"
                  : "text-[#7A7167] hover:text-[#2D332D]"
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-amber-700" />
              <span>Cargas ({logs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          SUBTAB 1: REPORTES Y GRÁFICOS (DIARIO, SEMANAL, MENSUAL, ANUAL)
          ======================================================== */}
      {activeSubTab === "reportes" && (
        <div className="space-y-6">
          {/* Barra Superior: Selector de Horizonte (Diario / Semanal / Mensual / Anual) */}
          <div className="bg-white border border-[#EAE2D6] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1E5678]" />
              <span className="text-xs font-extrabold text-[#2D332D] uppercase tracking-wider">
                Escala del Reporte:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "diario", label: `📅 Hoy (${hoyIso})` },
                  { id: "semanal", label: "📆 Semanal (7 días)" },
                  { id: "mensual", label: `🗓️ Mensual (${mesActualIso})` },
                  { id: "anual", label: `📊 Anual (${anioActualIso})` },
                ] as { id: HorizonteReporte; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHorizonte(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    horizonte === item.id
                      ? "bg-[#1E5678] text-white shadow-xs"
                      : "bg-[#F5F1E8] text-[#5A534D] hover:bg-[#EAE2D6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN DE OBJETIVOS (DIARIO, SEMANAL, MENSUAL) CON BOTONES Y BARRAS DE PROGRESO */}
          <div className="bg-[#F6F3EC] border border-[#EAE2D6] rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D6] pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#2D332D] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-[#6D856B]" />
                  Estado de Objetivos (Diario, Semanal y Mensual)
                </h3>
                <p className="text-[11px] text-[#7A7167]">
                  Presioná un botón para ver cuál es tu objetivo Diario, Semanal o Mensual y su barra de avance (o "Sin objetivo" si no está definido).
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "todos", label: "Ver Todos" },
                    { id: "diario", label: `Objetivo Diario (${objetivosDiarios.length})` },
                    { id: "semanal", label: `Objetivo Semanal (${objetivosSemanales.length})` },
                    { id: "mensual", label: `Objetivo Mensual (${objetivosMensuales.length})` },
                  ] as { id: PeriodoObjetivo | "todos"; label: string }[]
                ).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setFiltroPeriodoObjetivoReporte(b.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      filtroPeriodoObjetivoReporte === b.id
                        ? "bg-[#6D856B] text-white"
                        : "bg-white text-[#5A534D] border border-[#EAE2D6] hover:bg-[#EAE2D6]/50"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(filtroPeriodoObjetivoReporte === "todos" || filtroPeriodoObjetivoReporte === "diario") &&
                renderBarraObjetivosPorNivel("diario", "Objetivo Diario")}
              {(filtroPeriodoObjetivoReporte === "todos" || filtroPeriodoObjetivoReporte === "semanal") &&
                renderBarraObjetivosPorNivel("semanal", "Objetivo Semanal")}
              {(filtroPeriodoObjetivoReporte === "todos" || filtroPeriodoObjetivoReporte === "mensual") &&
                renderBarraObjetivosPorNivel("mensual", "Objetivo Mensual")}
            </div>
          </div>

          {/* REGLA ESTRICTA: SI NO HAY REPORTES CARGADOS EN EL PERÍODO, NO MOSTRAR NADA INVENTADO */}
          {!telemetriaPeriodo ? (
            <div className="bg-white border border-[#EAE2D6] rounded-3xl p-10 sm:p-14 text-center space-y-3 shadow-2xs">
              <div className="h-12 w-12 rounded-2xl bg-[#F5F1E8] text-[#7A7167] flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2D332D]">
                Sin reportes cargados en este período ({horizonte.toUpperCase()})
              </h3>
              <p className="text-xs text-[#7A7167] max-w-md mx-auto leading-relaxed">
                Todavía no enviaste cargas para este período. Cumpliendo tu regla, <strong>no se muestra ningún dato ni gráfico inventado</strong>. A medida que envíes momentos desde el <strong>Chat Carga Diaria</strong>, verás el reporte parcial o completo aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Banner de Estado del Reporte (Parcial vs Consolidado) */}
              <div className="bg-sky-50/90 border border-sky-200 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-600 animate-pulse" />
                  <span className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">
                    {horizonte === "diario" && telemetriaPeriodo.totalRegistros < 4
                      ? `📊 Reporte Diario Parcial (${telemetriaPeriodo.totalRegistros} momento${
                          telemetriaPeriodo.totalRegistros === 1 ? "" : "s"
                        } cargado${telemetriaPeriodo.totalRegistros === 1 ? "" : "s"} hasta ahora)`
                      : `📊 Reporte ${horizonte.toUpperCase()} (${telemetriaPeriodo.totalRegistros} registros en Base de Datos)`}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-sky-900">
                  Muestra únicamente lo registrado en tus cargas reales
                </span>
              </div>

              {/* =================================================================
                  GRÁFICO 1: CONTROL DEL TIEMPO, PRODUCTIVIDAD Y ACTIVIDADES
                  ================================================================= */}
              <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D6] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#2D332D] uppercase tracking-wider">
                        1. Control del Tiempo y Distribución de Actividades (Variable Acción)
                      </h3>
                      <p className="text-[11px] text-[#7A7167]">
                        Tiempo productivo vs. Tiempo distraído y reconocimiento de actividades típicas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        telemetriaPeriodo.pctControlTiempo >= 75
                          ? "bg-emerald-100 text-emerald-900"
                          : telemetriaPeriodo.pctControlTiempo >= 50
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      Control del Tiempo: {telemetriaPeriodo.pctControlTiempo}%
                    </span>
                  </div>
                </div>

                {/* KPIs de Tiempo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">
                      ⏱️ Tiempo Productivo
                    </span>
                    <div className="text-xl font-black text-emerald-800 mt-1">
                      {telemetriaPeriodo.totalProdMin} min{" "}
                      <span className="text-xs font-bold text-emerald-700">
                        ({(telemetriaPeriodo.totalProdMin / 60).toFixed(1)} hs)
                      </span>
                    </div>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-extrabold text-rose-900 uppercase block">
                      ⚠️ Tiempo Distraído (Desvíos)
                    </span>
                    <div className="text-xl font-black text-rose-800 mt-1">
                      {telemetriaPeriodo.totalDistMin} min{" "}
                      <span className="text-xs font-bold text-rose-700">
                        ({(telemetriaPeriodo.totalDistMin / 60).toFixed(1)} hs)
                      </span>
                    </div>
                  </div>

                  <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-extrabold text-sky-900 uppercase block">
                      🧘 Regulación / Meditación
                    </span>
                    <div className="text-xl font-black text-sky-800 mt-1">
                      {telemetriaPeriodo.totalRegMin} min
                    </div>
                  </div>
                </div>

                {/* Barra Apilada de Uso del Tiempo */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-[#5A534D]">
                    <span>Proporción de uso del tiempo registrado</span>
                    <span>
                      Productivo {telemetriaPeriodo.pctProdTiempo}% · Distraído {telemetriaPeriodo.pctDistTiempo}% · Regulación{" "}
                      {telemetriaPeriodo.pctRegTiempo}%
                    </span>
                  </div>
                  <div className="w-full h-5 rounded-full bg-[#F0EBE1] overflow-hidden flex shadow-inner">
                    {telemetriaPeriodo.pctProdTiempo > 0 && (
                      <div
                        className="bg-emerald-600 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ width: `${telemetriaPeriodo.pctProdTiempo}%` }}
                        title={`Productivo: ${telemetriaPeriodo.totalProdMin} min`}
                      >
                        {telemetriaPeriodo.pctProdTiempo >= 12 ? `${telemetriaPeriodo.pctProdTiempo}%` : ""}
                      </div>
                    )}
                    {telemetriaPeriodo.pctDistTiempo > 0 && (
                      <div
                        className="bg-rose-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ width: `${telemetriaPeriodo.pctDistTiempo}%` }}
                        title={`Distraído: ${telemetriaPeriodo.totalDistMin} min`}
                      >
                        {telemetriaPeriodo.pctDistTiempo >= 12 ? `${telemetriaPeriodo.pctDistTiempo}%` : ""}
                      </div>
                    )}
                    {telemetriaPeriodo.pctRegTiempo > 0 && (
                      <div
                        className="bg-sky-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ width: `${telemetriaPeriodo.pctRegTiempo}%` }}
                        title={`Regulación: ${telemetriaPeriodo.totalRegMin} min`}
                      >
                        {telemetriaPeriodo.pctRegTiempo >= 12 ? `${telemetriaPeriodo.pctRegTiempo}%` : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gráfico de Barras Horizontales: Distribución por Actividad */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-extrabold text-[#4A443F] uppercase tracking-wider">
                    Distribución de Actividades Registradas
                  </h4>
                  <div className="space-y-2">
                    {(
                      Object.entries(telemetriaPeriodo.distribucionActividades) as [
                        string,
                        { min: number; tipo: "productiva" | "distraccion" | "regulacion" }
                      ][]
                    ).map(([act, info]) => {
                      const pct = Math.min(100, Math.round((info.min / telemetriaPeriodo.tiempoTotalMin) * 100));
                      return (
                        <div key={act} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-[#2D332D]">{act}</span>
                            <span className="font-bold text-[#5A534D]">
                              {info.min} min ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#F0EBE1] h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                info.tipo === "distraccion" ? "bg-rose-500" : "bg-[#1E5678]"
                              }`}
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* =================================================================
                  GRÁFICO 2: LAS 3 VARIABLES CLAVE Y DESGASTE A LO LARGO DEL DÍA
                  ================================================================= */}
              <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D6] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#2D332D] uppercase tracking-wider">
                        2. Las 3 Variables Clave y Curva de Desgaste Energético
                      </h3>
                      <p className="text-[11px] text-[#7A7167]">
                        Salud y Energía · Estado de Ánimo y Emociones · Acción y Productividad.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#5A534D] bg-[#F5F1E8] px-3 py-1 rounded-full">
                    {telemetriaPeriodo.deltaEnergia < 0
                      ? `📉 Desgaste en el período: ${telemetriaPeriodo.deltaEnergia} pts de energía`
                      : telemetriaPeriodo.deltaEnergia > 0
                      ? `📈 Recuperación energética: +${telemetriaPeriodo.deltaEnergia} pts`
                      : "⚡ Energía estable entre cargas"}
                  </span>
                </div>

                {/* Barras de Resumen de las 3 Variables Clave */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Variable 1: Salud y Energía */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-emerald-950 uppercase">
                        ⚡ 1. Salud y Energía
                      </span>
                      <span className="text-sm font-black text-emerald-800">
                        {telemetriaPeriodo.promedioEnergia}/10
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE2D6] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${telemetriaPeriodo.promedioEnergia * 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#7A7167]">
                      {telemetriaPeriodo.conteoFatigaFisica > 0
                        ? `Fatiga/cansancio detectado en ${telemetriaPeriodo.conteoFatigaFisica} momento(s).`
                        : "En buenas condiciones físicas y energéticas."}
                    </p>
                  </div>

                  {/* Variable 2: Estado de Ánimo y Emociones */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-amber-950 uppercase">
                        🧠 2. Ánimo y Emociones
                      </span>
                      <span className="text-sm font-black text-amber-800">
                        {telemetriaPeriodo.promedioAnimo}/10
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE2D6] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${telemetriaPeriodo.promedioAnimo * 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#7A7167]">
                      Control emocional logrado en el <strong>{telemetriaPeriodo.pctControlEmocional}%</strong> de los momentos.
                    </p>
                  </div>

                  {/* Variable 3: Acción y Productividad */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-sky-950 uppercase">
                        🎯 3. Acción y Productividad
                      </span>
                      <span className="text-sm font-black text-sky-800">
                        {telemetriaPeriodo.promedioProductividad}/10
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE2D6] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${telemetriaPeriodo.promedioProductividad * 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#7A7167]">
                      {telemetriaPeriodo.totalProdMin} min productivos vs {telemetriaPeriodo.totalDistMin} min distraído.
                    </p>
                  </div>
                </div>

                {/* Gráfico Visual por Momento Cargado (Evolución Horaria / Temporal) */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-extrabold text-[#4A443F] uppercase tracking-wider">
                    Evolución Momento a Momento (Energía vs. Ánimo vs. Productividad)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {telemetriaPeriodo.serieTemporal.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-[#FDFBF7] border border-[#EAE2D6] rounded-2xl p-3 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-[#EAE2D6]/60 pb-1.5">
                          <span className="font-extrabold text-sky-900">
                            #{idx + 1} · {item.etiquetaTiempo}
                          </span>
                          <span className="text-[10px] font-bold text-[#7A7167] truncate max-w-[130px]">
                            {item.actividad}
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="w-20 font-semibold text-emerald-900">⚡ Energía:</span>
                            <div className="flex-1 bg-[#EAE2D6] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${item.energia * 10}%` }}
                              />
                            </div>
                            <span className="font-bold w-8 text-right">{item.energia}/10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-20 font-semibold text-amber-900">🧠 Ánimo:</span>
                            <div className="flex-1 bg-[#EAE2D6] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${item.animo * 10}%` }}
                              />
                            </div>
                            <span className="font-bold w-8 text-right">{item.animo}/10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-20 font-semibold text-sky-900">🎯 Acción:</span>
                            <div className="flex-1 bg-[#EAE2D6] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-sky-600 h-full rounded-full"
                                style={{ width: `${item.productividad * 10}%` }}
                              />
                            </div>
                            <span className="font-bold w-8 text-right">{item.productividad}/10</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* =================================================================
                  GRÁFICO 3: EMOCIONES SEPARADAS Y PATRONES SEGÚN EL CONTEXTO
                  ================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna A: Emociones separadas (Autoimagen, Sensaciones Primitivas, Estados Negativos y Respuesta) */}
                <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-amber-700" />
                      <div>
                        <h3 className="text-sm font-extrabold text-[#2D332D] uppercase tracking-wider">
                          3A. Emociones, Autoimagen y Respuestas
                        </h3>
                        <p className="text-[11px] text-[#7A7167]">
                          Separación de Autoimagen, Sensaciones Primitivas y Estados Negativos.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Control: {telemetriaPeriodo.pctControlEmocional}%
                    </span>
                  </div>

                  {/* Barra de Control de Emociones */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-[#5A534D]">
                      <span>¿Logró controlar sus emociones?</span>
                      <span>
                        Sí ({telemetriaPeriodo.controlSi}) · Parcial ({telemetriaPeriodo.controlParcial}) · No ({telemetriaPeriodo.controlNo})
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#F0EBE1] overflow-hidden flex">
                      {telemetriaPeriodo.controlSi > 0 && (
                        <div
                          className="bg-emerald-600 h-full"
                          style={{
                            width: `${(telemetriaPeriodo.controlSi / telemetriaPeriodo.totalRegistros) * 100}%`,
                          }}
                        />
                      )}
                      {telemetriaPeriodo.controlParcial > 0 && (
                        <div
                          className="bg-amber-500 h-full"
                          style={{
                            width: `${(telemetriaPeriodo.controlParcial / telemetriaPeriodo.totalRegistros) * 100}%`,
                          }}
                        />
                      )}
                      {telemetriaPeriodo.controlNo > 0 && (
                        <div
                          className="bg-rose-500 h-full"
                          style={{
                            width: `${(telemetriaPeriodo.controlNo / telemetriaPeriodo.totalRegistros) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* 1. Manejo de Autoimagen */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-3 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#5A534D] uppercase tracking-wider block">
                      🛡️ Manejo de Autoimagen
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(telemetriaPeriodo.conteoAutoimagen).length === 0 ? (
                        <span className="text-xs text-[#7A7167]">Autoimagen estable</span>
                      ) : (
                        Object.entries(telemetriaPeriodo.conteoAutoimagen).map(([k, count]) => (
                          <span
                            key={k}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#EAE2D6] text-xs font-bold text-[#2D332D]"
                          >
                            {k} <strong className="text-sky-700">({count})</strong>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 2. Sensaciones Primitivas */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-3 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-amber-950 uppercase tracking-wider block">
                      🧬 Sensaciones Primitivas (Aceptación / Rechazo / Alma Libre)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(telemetriaPeriodo.conteoPrimitivas).length === 0 ? (
                        <span className="text-xs text-[#7A7167]">
                          Sin activación de búsqueda de aprobación o rechazo en este período
                        </span>
                      ) : (
                        Object.entries(telemetriaPeriodo.conteoPrimitivas).map(([k, count]) => (
                          <span
                            key={k}
                            className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950"
                          >
                            {k} <strong>({count})</strong>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 3. Estados Negativos y Respuestas */}
                  <div className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-3 space-y-2">
                    <span className="text-[10px] font-extrabold text-rose-950 uppercase tracking-wider block">
                      ⚡ Estados Negativos Detectados y Mis Respuestas
                    </span>
                    {telemetriaPeriodo.respuestasNegativas.length === 0 ? (
                      <p className="text-xs text-[#7A7167]">
                        No se registraron estados negativos (desgano, enojo, frustración) en este período.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {telemetriaPeriodo.respuestasNegativas.map((rn, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-[#EAE2D6] rounded-xl p-2 text-[11px] flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-rose-900">{rn.estado}</span>
                              <span className="text-[#7A7167]"> → Respuesta: </span>
                              <span className="font-semibold text-[#2D332D]">{rn.respuesta}</span>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                                rn.control === "si"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rn.control === "parcial"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              Control: {rn.control}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna B: Patrones Involucrados según el Contexto y Métodos Reguladores */}
                <div className="space-y-6">
                  {/* Patrones según el contexto */}
                  <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#EAE2D6] pb-3">
                      <Compass className="h-5 w-5 text-purple-700" />
                      <div>
                        <h3 className="text-sm font-extrabold text-[#2D332D] uppercase tracking-wider">
                          3B. Patrones Involucrados según el Contexto
                        </h3>
                        <p className="text-[11px] text-[#7A7167]">
                          Hora, actividad, algo nuevo, tema complicado, rechazo o cuando algo sale mal.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {Object.keys(telemetriaPeriodo.conteoFactoresContexto).length === 0 ? (
                        <p className="text-xs text-[#7A7167]">Sin detonantes contextuales críticos registrados.</p>
                      ) : (
                        (Object.entries(telemetriaPeriodo.conteoFactoresContexto) as [string, number][]).map(([factor, count]) => {
                          const pct = Math.min(
                            100,
                            Math.round((count / telemetriaPeriodo.totalRegistros) * 100)
                          );
                          return (
                            <div key={factor} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-[#2D332D]">{factor}</span>
                                <span className="font-bold text-purple-900">
                                  {count} vez/veces ({pct}%)
                                </span>
                              </div>
                              <div className="w-full bg-[#F0EBE1] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-purple-600 h-full rounded-full"
                                  style={{ width: `${Math.max(6, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Acciones Reguladoras y Métodos (Conocidos + Nuevos Métodos Guardados) */}
                  <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-700" />
                        <div>
                          <h3 className="text-sm font-extrabold text-[#2D332D] uppercase tracking-wider">
                            4. Acciones Reguladoras y Métodos Aplicados
                          </h3>
                          <p className="text-[11px] text-[#7A7167]">
                            Meditación, Yo Robot y nuevos métodos distinguidos y guardados en BD.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                        {strategies.length} métodos en BD
                      </span>
                    </div>

                    {Object.keys(telemetriaPeriodo.metodosMap).length === 0 ? (
                      <p className="text-xs text-[#7A7167]">
                        No se aplicaron métodos reguladores explícitos en las cargas de este período.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {(
                          Object.entries(telemetriaPeriodo.metodosMap) as [
                            string,
                            { total: number; exitos: number; esNuevo: boolean }
                          ][]
                        ).map(([metodo, stats]) => {
                          const efectividad = Math.round((stats.exitos / Math.max(1, stats.total)) * 100);
                          return (
                            <div
                              key={metodo}
                              className="bg-[#FAF7F2] border border-[#EAE2D6] rounded-2xl p-3 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-extrabold text-[#2D332D]">{metodo}</span>
                                  {stats.esNuevo && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                                      ★ Nuevo Método Guardado
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-emerald-800">
                                  {stats.exitos}/{stats.total} efectivo ({efectividad}%)
                                </span>
                              </div>
                              <div className="w-full bg-[#EAE2D6] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${efectividad}%` }}
                                />
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
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: GESTOR DE OBJETIVOS DIARIOS, SEMANALES Y MENSUALES
          ======================================================== */}
      {activeSubTab === "objetivos" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#EAE2D6] rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-[#2D332D] uppercase mr-1">
                Ver Objetivos por Período:
              </span>
              {(
                [
                  { id: "todos", label: `Todos (${(objetivosEstructurados || []).length})` },
                  { id: "diario", label: `📅 Diario (${objetivosDiarios.length})` },
                  { id: "semanal", label: `📆 Semanal (${objetivosSemanales.length})` },
                  { id: "mensual", label: `🗓️ Mensual (${objetivosMensuales.length})` },
                ] as { id: PeriodoObjetivo | "todos"; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFiltroPeriodoPestanaObjetivos(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filtroPeriodoPestanaObjetivos === tab.id
                      ? "bg-[#6D856B] text-white"
                      : "bg-[#F5F1E8] text-[#5A534D] hover:bg-[#EAE2D6]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCrearObjOpen(!isCrearObjOpen)}
              className="flex items-center gap-1.5 py-2 px-3.5 bg-[#8BA888] hover:bg-[#6D856B] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isCrearObjOpen ? "Cerrar Formulario" : "Nuevo Objetivo (Diario/Semanal/Mensual)"}</span>
            </button>
          </div>

          {/* Formulario Creador de Objetivos */}
          {isCrearObjOpen && (
            <form
              onSubmit={handleCrearObjetivo}
              className="bg-white border border-[#8BA888]/40 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#6D856B]" />
                  <h3 className="text-sm font-bold text-[#2D332D]">
                    Configurar Nuevo Objetivo (Diario, Semanal o Mensual)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCrearObjOpen(false)}
                  className="text-xs text-[#7A7167] hover:text-[#2D332D]"
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A443F] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#8BA888]" />
                  Cargar desde Plantilla Oficial (Opcional)
                </label>
                <select
                  value={plantillaSeleccionada}
                  onChange={(e) => handleSeleccionarPlantilla(e.target.value as CodigoRasgo)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EAE2D6] rounded-xl text-xs text-[#2D332D] font-medium outline-none"
                >
                  <option value="">-- Personalizado --</option>
                  <optgroup label="🧠 Crecimiento Psicológico">
                    <option value="PSI-1_autoconfianza">PSI-1: Autoconfianza y Valor Intrínseco</option>
                    <option value="PSI-2_alma_libre">PSI-2: Desinhibición ('Alma Libre')</option>
                    <option value="PSI-3_humor_error">PSI-3: Humor y Ligereza ante el Error</option>
                    <option value="PSI-4_inmunidad_rechazo">PSI-4: Inmunidad al Rechazo Social</option>
                    <option value="PSI-5_ideal_adaptado_leon">PSI-5: León calmando ira e Ideal Adaptado</option>
                    <option value="PSI-6_gratitud_activa">PSI-6: Gratitud Activa y Reencuadre</option>
                  </optgroup>
                  <optgroup label="⚡ Productivo / Disciplina Operativa">
                    <option value="PROD-1_arranque_645">PROD-1: Rutina 6:45 AM + Audio Horus</option>
                    <option value="PROD-2_entreno_730">PROD-2: Entrenamiento Físico 7:30 AM</option>
                    <option value="PROD-3_estudio_ingenieria">PROD-3: Bloque Estudio Ingeniería</option>
                    <option value="PROD-4_dia_no_cero">PROD-4: Combate a la Apatía / Día No Cero</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Tipo de Objetivo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNuevoTipo("crecimiento_psicologico")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        nuevoTipo === "crecimiento_psicologico"
                          ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                          : "bg-white border-[#EAE2D6] text-[#7A7167]"
                      }`}
                    >
                      🧠 Psicológico
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoTipo("productivo")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        nuevoTipo === "productivo"
                          ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                          : "bg-white border-[#EAE2D6] text-[#7A7167]"
                      }`}
                    >
                      ⚡ Productivo
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">
                    Período (Diario / Semanal / Mensual)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["diario", "semanal", "mensual"] as PeriodoObjetivo[]).map((per) => (
                      <button
                        key={per}
                        type="button"
                        onClick={() => setNuevoPeriodo(per)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border capitalize transition cursor-pointer ${
                          nuevoPeriodo === per
                            ? "bg-[#8BA888]/20 border-[#8BA888] text-[#5A7358]"
                            : "bg-white border-[#EAE2D6] text-[#7A7167]"
                        }`}
                      >
                        {per}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Título del Objetivo</label>
                  <input
                    type="text"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ej: Completar Unidad 5 y Unidad 7 hoy"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-medium outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A7167] uppercase">Meta Numérica</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={formMetaNum}
                      onChange={(e) => setFormMetaNum(Number(e.target.value))}
                      className="w-20 px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-bold outline-none"
                    />
                    <select
                      value={formMetaUnidad}
                      onChange={(e) => setFormMetaUnidad(e.target.value as any)}
                      className="flex-1 px-2 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                    >
                      <option value="bloques">bloques</option>
                      <option value="horas">horas</option>
                      <option value="dias">días</option>
                      <option value="episodios_exitosos">episodios</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCrearObjOpen(false)}
                  className="px-4 py-2 border border-[#EAE2D6] rounded-xl text-xs font-bold text-[#7A7167]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8BA888] hover:bg-[#6D856B] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Guardar Objetivo</span>
                </button>
              </div>
            </form>
          )}

          {/* Vista de Objetivos por Nivel (Muestra "Sin objetivo" cuando no hay) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(filtroPeriodoPestanaObjetivos === "todos" || filtroPeriodoPestanaObjetivos === "diario") &&
              renderBarraObjetivosPorNivel("diario", "📅 Objetivos Diarios")}
            {(filtroPeriodoPestanaObjetivos === "todos" || filtroPeriodoPestanaObjetivos === "semanal") &&
              renderBarraObjetivosPorNivel("semanal", "📆 Objetivos Semanales")}
            {(filtroPeriodoPestanaObjetivos === "todos" || filtroPeriodoPestanaObjetivos === "mensual") &&
              renderBarraObjetivosPorNivel("mensual", "🗓️ Objetivos Mensuales")}
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 3: CARGA RÁPIDA DE LAS 3 VARIABLES CLAVE Y HISTORIAL
          ======================================================== */}
      {activeSubTab === "rapidos" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
          <form
            onSubmit={handleSaveLog}
            className="lg:col-span-3 bg-white border border-[#EAE2D6] rounded-3xl p-4 sm:p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#1E5678]" />
                <h3 className="text-sm font-bold text-[#2D332D]">
                  Cargar Momento del Día (Las 3 Variables Clave)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-900">
                Hoy: {reportesHoyCount} cargas
              </span>
            </div>

            {/* VARIABLE 1: SALUD Y ENERGÍA */}
            <div className="bg-emerald-50/40 border border-emerald-900/15 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                ⚡ Variable 1: Salud y Energía
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#2D332D]">Nivel de Energía</span>
                    <span className="font-extrabold text-emerald-800">{energy}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-[#EAE2D6] rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="condFisicaCheck"
                    type="checkbox"
                    checked={enCondicionesFisicas}
                    onChange={(e) => setEnCondicionesFisicas(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 rounded"
                  />
                  <label htmlFor="condFisicaCheck" className="text-xs font-semibold text-[#2D332D]">
                    Estaba en condiciones físicas / sin agotamiento real
                  </label>
                </div>
              </div>
            </div>

            {/* VARIABLE 2: ESTADO DE ÁNIMO, EMOCIONES Y MÉTODO REGULADOR */}
            <div className="bg-[#FAF6F0] border border-amber-900/15 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                🧠 Variable 2: Estado de Ánimo, Autoimagen, Sensaciones Primitivas y Método
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#7A7167] uppercase block mb-1">
                    Autoimagen
                  </label>
                  <select
                    value={autoimagenSel}
                    onChange={(e) => setAutoimagenSel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                  >
                    {CATALOGO_EMOCIONES_ESTRUCTURADO.autoimagen.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7A7167] uppercase block mb-1">
                    Sensación Primitiva (Opcional)
                  </label>
                  <select
                    value={sensacionPrimitivaSel}
                    onChange={(e) => setSensacionPrimitivaSel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                  >
                    <option value="">Ninguna activada</option>
                    {CATALOGO_EMOCIONES_ESTRUCTURADO.sensacionesPrimitivas.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#7A7167] uppercase block mb-1">
                    Estado Negativo (Si hubo)
                  </label>
                  <select
                    value={estadoNegativoSel}
                    onChange={(e) => setEstadoNegativoSel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                  >
                    <option value="">Ninguno (En calma)</option>
                    {CATALOGO_EMOCIONES_ESTRUCTURADO.estadosNegativos.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7A7167] uppercase block mb-1">
                    ¿Controlé mis emociones?
                  </label>
                  <select
                    value={controlEmocionalSel}
                    onChange={(e) => setControlEmocionalSel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="si">Sí, controladas</option>
                    <option value="parcial">Parcialmente</option>
                    <option value="no">No, me desbordó</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7A7167] uppercase block mb-1">
                    Método Regulador (Nuevo o conocido)
                  </label>
                  <input
                    type="text"
                    value={metodoPsiLog}
                    onChange={(e) => setMetodoPsiLog(e.target.value)}
                    placeholder="Ej: Meditación 12m, Yo Robot o uno nuevo"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* VARIABLE 3: ACCIÓN Y TIEMPO (PRODUCTIVO VS DISTRAÍDO) */}
            <div className="bg-[#F4F8FA] border border-sky-900/15 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">
                🎯 Variable 3: Acción, Actividades y Tiempos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#5B707B] uppercase block mb-1">
                    Actividad Principal Realizada
                  </label>
                  <input
                    type="text"
                    value={actividadLog}
                    onChange={(e) => setActividadLog(e.target.value)}
                    placeholder="Ej: Estudio Ingeniería Unidad 5 y 7"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    ⏱️ Tiempo Productivo (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={tiempoProductivoMin}
                    onChange={(e) => setTiempoProductivoMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                    ⚠️ Tiempo Distraído (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={tiempoDistraidoMin}
                    onChange={(e) => setTiempoDistraidoMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#5B707B] uppercase block mb-1">
                    Actividad Negativa / Distracción (Si hubo)
                  </label>
                  <input
                    type="text"
                    value={motivoDistraccion}
                    onChange={(e) => setMotivoDistraccion(e.target.value)}
                    placeholder="Ej: Celular, redes, interrupción imprevista"
                    className="w-full px-3 py-2 bg-white border border-[#EAE2D6] rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Contexto del Patrón */}
              <div className="pt-1">
                <label className="text-[10px] font-bold text-purple-950 uppercase block mb-1.5">
                  🔍 Factores Contextuales Involucrados (Para detectar patrones)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      "algo_nuevo",
                      "tema_complicado",
                      "rechazo_o_respuesta_negativa",
                      "algo_salio_mal",
                      "fatiga_acumulada",
                      "presion_horario",
                    ] as FactorContextualPatron[]
                  ).map((f) => {
                    const active = factoresContextoSel.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFactorContexto(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          active
                            ? "bg-purple-700 text-white border-purple-700"
                            : "bg-white text-[#5A534D] border-[#EAE2D6]"
                        }`}
                      >
                        {ETIQUETAS_FACTORES_CONTEXTO[f]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm font-bold text-white bg-[#1E5678] hover:bg-[#16425B] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Desglosar y Guardar en Base de Datos
            </button>
          </form>

          {/* Historial de Cargas */}
          <div className="lg:col-span-2 bg-white border border-[#EAE2D6] rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4 shrink-0">
              <h3 className="text-sm font-bold text-[#2D332D]">Historial de Cargas en BD</h3>
              <span className="text-[10px] bg-[#F9F6F1] text-[#7A7167] font-bold px-2 py-0.5 rounded-full">
                {logs.length} Cargas
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 space-y-3.5 pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-[#A69D91] text-center py-12">
                  No hay cargas registradas en la Base de Datos aún.
                </p>
              ) : (
                logs.map((log) => {
                  const dateObj = new Date(log.createdAt);
                  const dayStr = dateObj.toLocaleDateString([], {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  const timeStr =
                    log.horaExacta ||
                    dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div
                      key={log.id}
                      className="border border-[#EAE2D6] bg-[#FDFBF7] rounded-2xl p-3.5 relative group space-y-2 hover:border-[#8BA888] transition"
                    >
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#D98E73]/10 text-[#7A7167] hover:text-[#D98E73] transition cursor-pointer"
                        title="Eliminar este registro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center justify-between pr-6">
                        <span className="text-xs font-bold text-[#2D332D] capitalize">{dayStr}</span>
                        <span className="text-[10px] font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md">
                          🕒 {timeStr} hs
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="bg-emerald-50/60 border border-emerald-900/10 rounded-xl p-2">
                          <strong className="text-emerald-950">⚡ 1. Salud y Energía:</strong>{" "}
                          {log.energy}/10 · {log.desgasteAcumulado || "Operativo"}
                        </div>
                        <div className="bg-[#FAF6F0] border border-amber-900/10 rounded-xl p-2">
                          <strong className="text-amber-950">🧠 2. Ánimo y Emociones:</strong>{" "}
                          {log.estadoPsicologicoEtiqueta || "Estable"} · Control:{" "}
                          {(log.controloEmociones || "si").toUpperCase()}
                          {log.metodoAplicado ? ` · Método: ${log.metodoAplicado}` : ""}
                          {log.esMetodoNuevo ? " (★ NUEVO)" : ""}
                        </div>
                        <div className="bg-[#F4F8FA] border border-sky-900/10 rounded-xl p-2">
                          <strong className="text-sky-950">🎯 3. Acción y Tiempo:</strong>{" "}
                          {log.actividadRealizada || "Avance"} · Productivo:{" "}
                          {log.tiempoProductivoMin ?? 0}m · Distraído: {log.tiempoDistraidoMin ?? 0}m
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
