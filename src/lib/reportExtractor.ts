/**
 * @file src/lib/reportExtractor.ts
 * Desglose estructurado previo al envío a Base de Datos para las Cargas Diarias.
 * REGLA ESTRICTA: Extrae y registra ÚNICAMENTE la información que el usuario proporcionó
 * en el mensaje actual (sin inventar, adivinar ni autocompletar estados no mencionados,
 * y sin arrastrar reportes anteriores de cansancio si ya no aplica).
 */

import {
  DailyLog,
  ObjetivoEstructurado,
  FichaVivenciaInmutable,
  FranjaOperativa,
  TipoObjetivo,
  CodigoRasgo,
  ActividadTiempoItem,
  FactorContextualPatron,
  Strategy,
  CampoExtraidoReal,
} from "../types";
import { clasificarFranjaHoraria } from "./progressAuditor";
import { chatWithGroq, EXTRACTION_GROQ_MODEL } from "../services/groqEvaluation";
import {
  compilarHistorialCompletoCargas,
  getLocalTucumanIsoDate,
  getLocalTucumanTime,
} from "./dateTimeUtils";

/**
 * Catálogo oficial y separado de emociones y estados internos.
 */
export const CATALOGO_EMOCIONES_ESTRUCTURADO = {
  autoimagen: [
    "Autoconfianza / Seguridad personal",
    "Autoexigencia / Presión autoimpuesta",
    "Duda de capacidad / Inseguridad",
    "Satisfacción / Orgullo por avanzar",
    "Frustración con el propio ritmo",
  ],
  sensacionesPrimitivas: [
    "Búsqueda de aceptación / Validación externa",
    "Sensibilidad al rechazo / Mirada ajena",
    "Reactividad ante respuesta negativa de otros",
    "Indiferencia sana ('Alma Libre' / No importa)",
  ],
  estadosNegativos: [
    "Desgano / Apatía",
    "Enojo / Bronca / Irritación",
    "Ansiedad / Presión por el reloj",
    "Frustración (tema difícil o algo salió mal)",
    "Dispersión / Impulso de distracción",
    "Cansancio / Fatiga física real",
  ],
  estadosPositivos: [
    "Tranquilidad / Calma basal",
    "Enfoque / Concentración fluida",
    "Motivación / Energía renovada",
    "Determinación / Control interno",
  ],
};

export const METODOS_REGULADORES_BASE = [
  "Meditación",
  "Yo Robot",
  "Respiración del León",
  "Método Pregunta-Respuesta",
  "Agua Fría + Audio Horus",
  "Regla 52/17",
  "Día No Cero",
  "Ideal Adaptado",
];

export const ETIQUETAS_FACTORES_CONTEXTO: Record<FactorContextualPatron, string> = {
  algo_nuevo: "Actividad o tema nuevo",
  tema_complicado: "Tema de estudio / tarea compleja",
  rechazo_o_respuesta_negativa: "Rechazo o respuesta negativa de la gente",
  algo_salio_mal: "Imprevisto / algo salió mal",
  fatiga_acumulada: "Desgaste energético / cansancio acumulado del día",
  presion_horario: "Presión contra reloj / compromiso cercano",
};

export interface ReporteOperativoDesglose {
  horaRegistrada: string;
  franjaLabel: string;
  franja: FranjaOperativa;
  energia: number;
  foco: number;
  estresPresion: number;
  animo: number;
  productividad: number;
  huboObstaculo: boolean;
  friccionDetectada: string;
  metodoAplicado: string;
  esMetodoNuevo: boolean;
  resultadoMetodo: "exito" | "parcial" | "fallo";
  tipoReporte: TipoObjetivo | "estado_general";
  objetivoId: string;
  rasgoCodigo: CodigoRasgo;
  metasEspecificas: string[];
  compromisoHorario?: string;
  ventanaDisponibleTexto: string;
  planTimeBoxing: string[];
  resumenNota: string;
  guardadoEnBD: boolean;
  // Qué dimensiones mencionó realmente el usuario en este mensaje (sin adivinar ni rellenar las demás)
  seccionesInformadas: {
    saludEnergia: boolean;
    animoEmociones: boolean;
    accionTiempo: boolean;
    patronObservado: boolean;
    metodoRegulador: boolean;
  };
  camposExtraidosReales: CampoExtraidoReal[];
  // LAS 3 VARIABLES CLAVE
  variableSaludEnergia: {
    score: number;
    enCondiciones: boolean;
    estadoFisicoMental: string;
    desgasteDia: string;
  };
  variableAnimoEmociones: {
    score: number;
    emocionesDetectadas: string[];
    manejoAutoimagen: string;
    sensacionesPrimitivas: string;
    estadosNegativos: string[];
    respuestaAnteNegativo: string;
    controloEmociones: "si" | "parcial" | "no";
    metodoRegulador: string;
    esMetodoNuevo: boolean;
    resultadoRegulacion: "exito" | "parcial" | "fallo";
  };
  variableAccion: {
    score: number;
    actividadesRealizadas: ActividadTiempoItem[];
    tiempoProductivoMin: number;
    tiempoDistraidoMin: number;
    tiempoRegulacionMin: number;
    actividadesNegativasDistraccion: string;
    distribucionResumen: string;
  };
  patronesContexto: {
    horaContexto: string;
    actividadContexto: string;
    factoresContextuales: FactorContextualPatron[];
    etiquetasFactores: string[];
    patronDetectado: string;
  };
  // Retrocompatibilidad
  datosOperativos: {
    momentoDia: string;
    actividadRealizada: string;
    metasActivas: string[];
    compromisoCorte?: string;
    ventanaDisponible: string;
    desvioDetectado?: string;
    productividadScore: number;
  };
  aspectoPsicologico: {
    estadoEtiqueta: string;
    energiaScore: number;
    animoScore: number;
    focoScore: number;
    presionScore: number;
    friccionInterna: string;
    metodoRegulacion: string;
    resultadoRegulacion: "exito" | "parcial" | "fallo";
  };
}

export interface ReporteOperativoResultado {
  esReporte: boolean;
  log: DailyLog;
  desglose: ReporteOperativoDesglose;
  desgloseTexto: string;
  mensajeConfirmacionBD: string;
  fichaVivencia?: FichaVivenciaInmutable;
  nuevoMetodoParaGuardar?: Strategy;
}

/**
 * Detecta si el mensaje del usuario constituye un reporte de situación, avance o check-in.
 */
export function detectarEsReporteOperativo(texto: string): boolean {
  if (!texto || texto.trim().length < 10) return false;
  const txt = texto.toLowerCase();

  const patronesHorarios = /(son las|a las|tipo \d+|mediod[ií]a|mañana|tarde|noche|\d{1,2}:\d{2}|\d{1,2} y \d{2}|\d+\s*min|\d+\s*h(?:oras?|s)?)/i;
  const patronesEstado = /(mi estado|energ[ií]a|cansad|desganado|desgano|tranquilo|positivo|ánimo|animo|presionado|presi[oó]n|estr[eé]s|foco|productiv|enojo|bronca|distra[ií]d|siento|observando un patr[oó]n)/i;
  const patronesAccion = /(meditaci[oó]n|meditar|yo robot|hice|estudi|avanz|unidad|bloque|compromiso|promet[ií]|fogaje|trabaj|entren|termino de hacer)/i;

  let hits = 0;
  if (patronesHorarios.test(txt)) hits++;
  if (patronesEstado.test(txt)) hits++;
  if (patronesAccion.test(txt)) hits++;

  return hits >= 1;
}

/**
 * Determina si un método mencionado ya existe en los métodos base o en las estrategias guardadas.
 */
export function verificarSiEsMetodoNuevo(
  metodoTexto: string,
  estrategiasGuardadas: Strategy[] = []
): boolean {
  if (
    !metodoTexto ||
    metodoTexto === "Ninguno registrado" ||
    metodoTexto === "Sin método específico" ||
    metodoTexto === "No mencionado"
  ) {
    return false;
  }
  const limpio = metodoTexto.toLowerCase().trim();
  const coincideConBase = METODOS_REGULADORES_BASE.some((m) => {
    const baseLower = m.toLowerCase();
    return limpio.includes(baseLower) || baseLower.includes(limpio);
  });
  if (coincideConBase) return false;

  if (/meditaci[oó]n|meditar|yo robot|le[oó]n|52\/17|horus|agua fr[ií]a|d[ií]a no cero|pregunta[\s-]respuesta|ideal adaptado/i.test(limpio)) {
    return false;
  }

  const coincideConGuardado = (estrategiasGuardadas || []).some((s) => {
    const n = (s.name || "").toLowerCase().trim();
    return n.length > 3 && (limpio.includes(n) || n.includes(limpio));
  });

  return !coincideConGuardado;
}

/**
 * Extractor determinista que respeta estrictamente lo que el usuario dijo en el mensaje,
 * sin autocompletar ni inventar estados no mencionados.
 */
export function extraerReporteDeterminista(
  texto: string,
  _horaActualFallback: string,
  objetivosExistentes: ObjetivoEstructurado[] = [],
  estrategiasExistentes: Strategy[] = []
): ReporteOperativoDesglose {
  const txtOriginal = texto.trim();
  const txt = txtOriginal.toLowerCase();
  const infoHora = clasificarFranjaHoraria();

  // 1. Extraer hora mencionada si existe
  const matchHora =
    txtOriginal.match(/son\s+las\s+(\d{1,2}(?::\d{2}|\s+y\s+\d{2}))/i) ||
    txtOriginal.match(/(\d{1,2}:\d{2})/);
  let horaRegistrada = infoHora.horaExacta;
  if (matchHora) {
    horaRegistrada = matchHora[1].replace(/\s+y\s+/i, ":").trim();
    if (!horaRegistrada.includes(":")) horaRegistrada = `${horaRegistrada}:00`;
  }

  // ¿El usuario está describiendo un patrón recurrente u observación de conducta?
  const esObservacionDePatron =
    /(observando un patr[oó]n|patr[oó]n muy frecuente|patr[oó]n que|cuando termino de hacer|cada vez que|siempre que|sin darme cuenta|autom[aá]ticamente me)/i.test(
      txt
    );

  // 2. Detectar si realmente habló de SALUD Y ENERGÍA en este mensaje
  // Importante: Distinguir negación ("ya no estoy cansado", "no estoy cansado", "se me pasó el cansancio")
  const niegaCansancio =
    /(ya no estoy cansad|no estoy cansad|se me pas[oó] el cansancio|ya no tengo sueño|ya estoy despierto|recuper[eé] la energ[ií]a)/i.test(
      txt
    );
  const mencionaEnergiaExplicita =
    niegaCansancio ||
    /(mi energ[ií]a|nivel de energ[ií]a|estoy cansad|me siento cansad|muy cansad|agotad|exhausto|dorm[ií] mal|dorm[ií] bien|con sueño|sin energ[ií]a|mucha energ[ií]a|con pilas|fresco|renovar la energ[ií]a|renov[oó] la energ[ií]a)/i.test(
      txt
    );

  let saludEnergiaMencionada = mencionaEnergiaExplicita;
  let energia = 7;
  let enCondiciones = true;
  let estadoFisicoMental = "";
  let desgasteDia = "";

  if (niegaCansancio) {
    energia = 8;
    enCondiciones = true;
    estadoFisicoMental = "Energía recuperada (ya no está cansado)";
    desgasteDia = "Estado actualizado: sin cansancio actual";
  } else if (mencionaEnergiaExplicita) {
    if (/agotad|muy cansad|sin energ[ií]a|dorm[ií] mal|no doy m[aá]s|exhausto/i.test(txt)) {
      energia = 3;
      enCondiciones = false;
      estadoFisicoMental = "Cansancio / fatiga física reportada";
      desgasteDia = "Baja energía indicada en este momento";
    } else if (/estoy cansad|me siento cansad|un poco cansad|con sueño|baja energ[ií]a/i.test(txt)) {
      if (/renov|mejor|tranquilo|funcion[oó]|recuper/i.test(txt)) {
        energia = 7;
        enCondiciones = true;
        estadoFisicoMental = "Energía recuperada tras pausa/regulación";
        desgasteDia = "Se restauró la energía operativa";
      } else {
        energia = 5;
        enCondiciones = true;
        estadoFisicoMental = "Cansancio moderado mencionado";
        desgasteDia = "Desgaste percibido en el momento";
      }
    } else if (/mucha energ[ií]a|excelente|fresco|con pilas|activo/i.test(txt)) {
      energia = 9;
      enCondiciones = true;
      estadoFisicoMental = "Alta energía reportada";
      desgasteDia = "Buena disponibilidad física";
    } else {
      energia = 7;
      enCondiciones = true;
      estadoFisicoMental = "Energía estable";
      desgasteDia = "En condiciones";
    }
  }

  // 3. Detectar si realmente habló de ESTADO DE ÁNIMO / EMOCIONES ESPECÍFICAS en este mensaje
  const emocionesDetectadas: string[] = [];
  const estadosNegativos: string[] = [];
  let animo = 7;
  let estresPresion = 4;

  if (/tranquilo|calma|sereno|en paz/i.test(txt)) {
    emocionesDetectadas.push("Tranquilidad / Calma");
    animo = 8;
  }
  if (/positivo|motivado|entusiasm|con ganas/i.test(txt) && !/sin gana/i.test(txt)) {
    emocionesDetectadas.push("Estado positivo / Motivación");
    animo = 8;
  }
  if (/desganado|sin gana|desgano|apat[ií]a|fiaca/i.test(txt)) {
    estadosNegativos.push("Desgano");
    emocionesDetectadas.push("Desgano");
    if (!/tranquilo|positivo|funcion[oó]/i.test(txt)) animo = 5;
  }
  if (/enojo|enojad|bronca|irritad|caliente|molest/i.test(txt)) {
    estadosNegativos.push("Enojo / Irritación");
    emocionesDetectadas.push("Enojo / Irritación");
    estresPresion = 7;
    animo = 5;
  }
  if (/presionado|presi[oó]n|ansiedad|ansioso|apurado|no llego/i.test(txt)) {
    estadosNegativos.push("Presión / Ansiedad");
    emocionesDetectadas.push("Presión / Ansiedad");
    estresPresion = 6;
  }
  if (/frustrad|no me sale|trabado/i.test(txt)) {
    estadosNegativos.push("Frustración");
    emocionesDetectadas.push("Frustración");
    estresPresion = 6;
  }

  // Autoimagen (solo si la menciona)
  let manejoAutoimagen = "";
  if (/promet[ií]|me exig|mejorar mi productividad|todav[ií]a siento que hay cosas que no hice/i.test(txt)) {
    manejoAutoimagen = "Autoexigencia por cumplir la meta propuesta";
    emocionesDetectadas.push("Autoexigencia");
  } else if (/insegur|no soy capaz|mediocre|inferior/i.test(txt)) {
    manejoAutoimagen = "Duda de capacidad / autocrítica";
    emocionesDetectadas.push("Inseguridad");
  } else if (/orgull|cumpl[ií]|seguro de m[ií]/i.test(txt)) {
    manejoAutoimagen = "Autoconfianza por cumplimiento";
    emocionesDetectadas.push("Autoconfianza");
  }

  // Sensaciones primitivas (solo si las menciona)
  let sensacionesPrimitivas = "";
  if (/aceptaci[oó]n|aprobaci[oó]n|qu[eé] dir[aá]n|quedar bien|validaci[oó]n/i.test(txt)) {
    sensacionesPrimitivas = "Búsqueda de aceptación / validación externa";
    emocionesDetectadas.push("Búsqueda de aceptación");
  } else if (/rechazo|respuesta negativa|me dijeron que no|ignoraron/i.test(txt)) {
    sensacionesPrimitivas = "Sensibilidad ante rechazo o respuesta ajena";
    emocionesDetectadas.push("Reacción ante rechazo");
  }

  const animoEmocionesMencionado =
    emocionesDetectadas.length > 0 ||
    estadosNegativos.length > 0 ||
    Boolean(manejoAutoimagen) ||
    Boolean(sensacionesPrimitivas);

  // 4. Métodos reguladores (solo si menciona haber aplicado uno)
  let metodoAplicado = "Ninguno registrado";
  let huboMetodoExitoso = false;

  const matchMed = txtOriginal.match(/meditaci[oó]n(?:\s+intermedia)?(?:\s+tipo\s+[^\.]+)?(?:\s+de\s+(\d+)\s+minutos?)?/i);
  if (matchMed) {
    const min = matchMed[1] || "";
    metodoAplicado = min ? `Meditación (${min} min)` : "Meditación";
    huboMetodoExitoso = !/no funcion[oó]|fall[oó]/i.test(txt);
  } else if (/yo robot|5-4-3-2-1|como un robot/i.test(txt)) {
    metodoAplicado = "Yo Robot";
    huboMetodoExitoso = true;
  } else if (/respiraci[oó]n(?:\s+del?\s+le[oó]n)?|como un le[oó]n/i.test(txt)) {
    metodoAplicado = "Respiración del León";
    huboMetodoExitoso = true;
  } else if (/agua fr[ií]a|horus/i.test(txt)) {
    metodoAplicado = "Agua Fría + Audio Horus";
    huboMetodoExitoso = true;
  } else if (/52\/17/i.test(txt)) {
    metodoAplicado = "Regla 52/17";
    huboMetodoExitoso = true;
  } else if (/pregunta[\s-]respuesta/i.test(txt)) {
    metodoAplicado = "Método Pregunta-Respuesta";
    huboMetodoExitoso = true;
  } else {
    const matchMetodoNuevo =
      txtOriginal.match(/(?:apliqu[eé]|us[eé]|prob[eé]|implement[eé])\s+(?:el\s+m[eé]todo|la\s+t[eé]cnica|la\s+estrategia)\s+(?:de\s+)?([^\.,;]{4,45})/i) ||
      txtOriginal.match(/m[eé]todo\s+nuevo[:\s]+([^\.,;]{4,45})/i);
    if (matchMetodoNuevo && matchMetodoNuevo[1]) {
      metodoAplicado = matchMetodoNuevo[1].trim();
      huboMetodoExitoso = !/no funcion[oó]|fall[oó]/i.test(txt);
    }
  }

  const metodoReguladorMencionado = metodoAplicado !== "Ninguno registrado";
  const esMetodoNuevo = verificarSiEsMetodoNuevo(metodoAplicado, estrategiasExistentes);

  let controloEmociones: "si" | "parcial" | "no" = "si";
  let respuestaAnteNegativo = "";
  if (estadosNegativos.length > 0) {
    if (metodoReguladorMencionado && huboMetodoExitoso) {
      controloEmociones = "si";
      respuestaAnteNegativo = `Se reguló con ${metodoAplicado}`;
    } else if (/me dej[eé] llevar|explot[eé]|abandon[eé]|no pude controlar/i.test(txt)) {
      controloEmociones = "no";
      respuestaAnteNegativo = "Costó cortar el impulso en el momento";
    } else {
      controloEmociones = "parcial";
      respuestaAnteNegativo = "Observó el estado y continuó";
    }
  }

  // 5. ACCIÓN Y TIEMPO (SOLO si reporta una actividad concreta hecha hoy o minutos explícitos;
  // NO inventar minutos cuando solo describe un patrón general)
  const metasEspecificas: string[] = [];
  const regexUnidades = /unidad\s+(\d+|[a-z]+)/gi;
  let matchU;
  while ((matchU = regexUnidades.exec(txtOriginal)) !== null) {
    metasEspecificas.push(`Unidad ${matchU[1].toUpperCase()}`);
  }

  let compromisoHorario: string | undefined;
  const matchCompromiso =
    txtOriginal.match(/(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)\s*(?:de\s+la\s+tarde|hs|hrs)?\s+tengo\s+un\s+compromiso/i) ||
    txtOriginal.match(/compromiso\s+(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)/i);
  if (matchCompromiso) {
    compromisoHorario = matchCompromiso[1].includes(":") ? `${matchCompromiso[1]} hs` : `${matchCompromiso[1]}:00 hs`;
  }

  const actividadesRealizadas: ActividadTiempoItem[] = [];
  let tiempoProductivoMin = 0;
  let tiempoDistraidoMin = 0;
  let tiempoRegulacionMin = 0;
  let actividadesNegativasDistraccion = "";

  // Extraer minutos explícitamente dichos por el usuario
  const matchMinExplicitos = txtOriginal.match(/(\d+)\s*(?:minutos?|min)\b/i);
  const matchHsExplicitas = txtOriginal.match(/(\d+)\s*(?:horas?|hs|h)\b/i);
  const minutosExplicitos = matchHsExplicitas
    ? parseInt(matchHsExplicitas[1], 10) * 60
    : matchMinExplicitos
    ? parseInt(matchMinExplicitos[1], 10)
    : 0;

  if (matchMed && matchMed[1]) {
    const mMin = parseInt(matchMed[1], 10) || 0;
    if (mMin > 0) {
      tiempoRegulacionMin += mMin;
      actividadesRealizadas.push({
        nombre: `Meditación (${mMin} min)`,
        categoria: "regulacion_descanso",
        minutos: mMin,
      });
    }
  }

  const mencionaActividadConcretaHoy =
    !esObservacionDePatron &&
    /(estudi[eé]|estuve estudiando|avanc[eé]|termin[eé] la unidad|hice bastante|mejorar la aplicaci[oó]n|program[eé]|entren[eé]|fui al gimnasio|trabaj[eé])/i.test(
      txt
    );

  if (mencionaActividadConcretaHoy) {
    if (/estudi|unidad|tesis|pr[aá]ctico|ingenier[ií]a/i.test(txt)) {
      const mins = minutosExplicitos > 0 ? minutosExplicitos : 0;
      tiempoProductivoMin += mins;
      actividadesRealizadas.push({
        nombre: metasEspecificas.length > 0 ? `Estudio (${metasEspecificas.join(", ")})` : "Estudio / Ingeniería",
        categoria: "productiva",
        minutos: mins,
      });
    }
    if (/mejorar la aplicaci[oó]n|program|c[oó]digo|app|proyecto/i.test(txt)) {
      const esDesvio = /no eran el objetivo|fogaje|cosas intermedia/i.test(txt);
      const mins = minutosExplicitos > 0 ? minutosExplicitos : 0;
      if (esDesvio) {
        tiempoDistraidoMin += mins;
        actividadesNegativasDistraccion = "Tareas intermedias ('fogaje') fuera del objetivo principal";
        actividadesRealizadas.push({
          nombre: actividadesNegativasDistraccion,
          categoria: "imprevisto",
          minutos: mins,
        });
      } else {
        tiempoProductivoMin += mins;
        actividadesRealizadas.push({
          nombre: "Desarrollo / Código",
          categoria: "productiva",
          minutos: mins,
        });
      }
    }
    if (/entren[eé]|gimnasio|pesas/i.test(txt)) {
      const mins = minutosExplicitos > 0 ? minutosExplicitos : 0;
      tiempoProductivoMin += mins;
      actividadesRealizadas.push({
        nombre: "Entrenamiento físico",
        categoria: "productiva",
        minutos: mins,
      });
    }
  }

  // Distracción puntual hoy (NO cuando describe un patrón general como "cuando termino algo veo videos")
  if (
    !esObservacionDePatron &&
    /(me distraje|estuve distra[ií]do|perd[ií] tiempo|estuve viendo videos|me puse a ver videos)/i.test(txt)
  ) {
    const mins = minutosExplicitos > 0 ? minutosExplicitos : 0;
    tiempoDistraidoMin += mins;
    actividadesNegativasDistraccion = mins > 0 ? `Distracción (${mins} min)` : "Distracción reportada";
    actividadesRealizadas.push({
      nombre: actividadesNegativasDistraccion,
      categoria: "distraccion",
      minutos: mins,
    });
  }

  const accionTiempoMencionado =
    actividadesRealizadas.length > 0 ||
    metasEspecificas.length > 0 ||
    Boolean(compromisoHorario) ||
    /bastante productivo|muy productivo|nada productivo/i.test(txt);

  let productividad = 7;
  if (/bastante productivo|muy productivo|avanc[eé] mucho/i.test(txt)) {
    productividad = 8;
  } else if (/nada productivo|perd[ií] el tiempo|no hice nada/i.test(txt)) {
    productividad = 3;
  }

  // 6. PATRÓN OBSERVADO / CONTEXTO
  const factoresContextuales: FactorContextualPatron[] = [];
  if (/nuevo|primera vez|desconocido/i.test(txt)) factoresContextuales.push("algo_nuevo");
  if (/complicado|dif[ií]cil|complejo|me genere esfuerzo|esfuerzo/i.test(txt))
    factoresContextuales.push("tema_complicado");
  if (/rechazo|respuesta negativa|me dijeron que no/i.test(txt))
    factoresContextuales.push("rechazo_o_respuesta_negativa");
  if (/sali[oó] mal|imprevisto|fogaje/i.test(txt)) factoresContextuales.push("algo_salio_mal");
  if (!niegaCansancio && /estoy cansad|muy cansad|agotad/i.test(txt))
    factoresContextuales.push("fatiga_acumulada");
  if (/presionado|compromiso|no llego/i.test(txt)) factoresContextuales.push("presion_horario");

  const etiquetasFactores = factoresContextuales.map((f) => ETIQUETAS_FACTORES_CONTEXTO[f]);
  const patronObservadoMencionado = esObservacionDePatron || factoresContextuales.length > 0;

  let patronDetectado = "";
  if (esObservacionDePatron) {
    patronDetectado = txtOriginal;
  } else if (factoresContextuales.length > 0) {
    patronDetectado = `${etiquetasFactores.join(" + ")} → ${txtOriginal.slice(0, 120)}`;
  }

  // 7. Construir lista estricta de CAMPOS REALMENTE EXTRAÍDOS del mensaje del usuario
  const camposExtraidosReales: CampoExtraidoReal[] = [];

  if (esObservacionDePatron) {
    camposExtraidosReales.push({
      categoria: "patron_observado",
      etiqueta: "Patrón observado",
      valor: txtOriginal,
    });
  } else {
    if (saludEnergiaMencionada) {
      camposExtraidosReales.push({
        categoria: "salud_energia",
        etiqueta: "Salud y energía",
        valor: `${estadoFisicoMental} (${energia}/10)`,
      });
    }
    if (animoEmocionesMencionado) {
      const partesAnimo = [
        emocionesDetectadas.join(", "),
        manejoAutoimagen,
        sensacionesPrimitivas,
      ].filter(Boolean);
      camposExtraidosReales.push({
        categoria: "animo_emocion",
        etiqueta: "Estado / lo que sentís",
        valor: partesAnimo.join(" · "),
      });
    }
    if (metodoReguladorMencionado) {
      camposExtraidosReales.push({
        categoria: "metodo_regulador",
        etiqueta: esMetodoNuevo ? "Nuevo método regulador" : "Método aplicado",
        valor: metodoAplicado,
      });
    }
    if (accionTiempoMencionado) {
      const partesAccion = [
        ...actividadesRealizadas.map((a) => (a.minutos > 0 ? `${a.nombre} (${a.minutos} min)` : a.nombre)),
        metasEspecificas.length > 0 ? `Metas: ${metasEspecificas.join(", ")}` : "",
        compromisoHorario ? `Compromiso: ${compromisoHorario}` : "",
      ].filter(Boolean);
      if (partesAccion.length > 0) {
        camposExtraidosReales.push({
          categoria: "accion_tiempo",
          etiqueta: "Acción / avance",
          valor: partesAccion.join(" · "),
        });
      }
    }
    if (patronObservadoMencionado && !esObservacionDePatron && etiquetasFactores.length > 0) {
      camposExtraidosReales.push({
        categoria: "patron_observado",
        etiqueta: "Contexto detectado",
        valor: etiquetasFactores.join(" · "),
      });
    }
  }

  // Si el usuario escribió algo bien específico que no cayó en las etiquetas previas, guardar exactamente lo que dijo
  if (camposExtraidosReales.length === 0) {
    camposExtraidosReales.push({
      categoria: "nota_especifica",
      etiqueta: "Nota registrada",
      valor: txtOriginal,
    });
  }

  const distribucionResumen =
    tiempoProductivoMin > 0 || tiempoDistraidoMin > 0 || tiempoRegulacionMin > 0
      ? [
          tiempoProductivoMin > 0 ? `Productivo: ${tiempoProductivoMin} min` : "",
          tiempoDistraidoMin > 0 ? `Distraído: ${tiempoDistraidoMin} min` : "",
          tiempoRegulacionMin > 0 ? `Regulación: ${tiempoRegulacionMin} min` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      : "";

  const objEstudio =
    objetivosExistentes.find((o) => o.rasgoCodigo === "PROD-3_estudio_ingenieria") ||
    objetivosExistentes.find((o) => o.tipo === "productivo");
  const objetivoId = objEstudio ? objEstudio.id : "obj-prod-estudio";
  const rasgoCodigo: CodigoRasgo = "PROD-3_estudio_ingenieria";

  const resumenNota = `[${horaRegistrada} hs] ${camposExtraidosReales.map((c) => `${c.etiqueta}: ${c.valor}`).join(" | ")}`;

  return {
    horaRegistrada,
    franjaLabel: infoHora.labelFranja,
    franja: infoHora.franja,
    energia,
    foco: productividad,
    estresPresion,
    animo,
    productividad,
    huboObstaculo: estadosNegativos.length > 0 || tiempoDistraidoMin > 0 || esObservacionDePatron,
    friccionDetectada: esObservacionDePatron
      ? txtOriginal.slice(0, 140)
      : estadosNegativos.join(", ") || actividadesNegativasDistraccion || "",
    metodoAplicado,
    esMetodoNuevo,
    resultadoMetodo: huboMetodoExitoso ? "exito" : "parcial",
    tipoReporte: esObservacionDePatron ? "crecimiento_psicologico" : "productivo",
    objetivoId,
    rasgoCodigo,
    metasEspecificas,
    compromisoHorario,
    ventanaDisponibleTexto: compromisoHorario ? `${horaRegistrada} hs a ${compromisoHorario}` : "",
    planTimeBoxing: [],
    resumenNota,
    guardadoEnBD: true,
    seccionesInformadas: {
      saludEnergia: saludEnergiaMencionada,
      animoEmociones: animoEmocionesMencionado,
      accionTiempo: accionTiempoMencionado,
      patronObservado: patronObservadoMencionado,
      metodoRegulador: metodoReguladorMencionado,
    },
    camposExtraidosReales,
    variableSaludEnergia: {
      score: energia,
      enCondiciones,
      estadoFisicoMental: estadoFisicoMental || "No mencionado en esta carga",
      desgasteDia: desgasteDia || "No mencionado en esta carga",
    },
    variableAnimoEmociones: {
      score: animo,
      emocionesDetectadas,
      manejoAutoimagen,
      sensacionesPrimitivas,
      estadosNegativos,
      respuestaAnteNegativo,
      controloEmociones,
      metodoRegulador: metodoAplicado,
      esMetodoNuevo,
      resultadoRegulacion: huboMetodoExitoso ? "exito" : "parcial",
    },
    variableAccion: {
      score: productividad,
      actividadesRealizadas,
      tiempoProductivoMin,
      tiempoDistraidoMin,
      tiempoRegulacionMin,
      actividadesNegativasDistraccion,
      distribucionResumen,
    },
    patronesContexto: {
      horaContexto: `${horaRegistrada} hs`,
      actividadContexto: actividadesRealizadas.map((a) => a.nombre).join(" + "),
      factoresContextuales,
      etiquetasFactores,
      patronDetectado,
    },
    datosOperativos: {
      momentoDia: `${horaRegistrada} hs`,
      actividadRealizada:
        actividadesRealizadas.map((a) => a.nombre).join(", ") ||
        camposExtraidosReales[0]?.valor.slice(0, 60) ||
        "Registro puntual",
      metasActivas: metasEspecificas,
      compromisoCorte: compromisoHorario,
      ventanaDisponible: compromisoHorario ? `Hasta ${compromisoHorario}` : "",
      desvioDetectado: tiempoDistraidoMin > 0 ? actividadesNegativasDistraccion : undefined,
      productividadScore: productividad,
    },
    aspectoPsicologico: {
      estadoEtiqueta: emocionesDetectadas.join(" · "),
      energiaScore: energia,
      animoScore: animo,
      focoScore: productividad,
      presionScore: estresPresion,
      friccionInterna: estadosNegativos.join(", "),
      metodoRegulacion: metodoAplicado,
      resultadoRegulacion: huboMetodoExitoso ? "exito" : "parcial",
    },
  };
}

/**
 * Construye una confirmación BREVE (1-2 líneas) y de estructura variable según lo que
 * realmente cargó el usuario, sin repetir plantillas largas ni rellenar datos no dichos.
 */
export function generarMensajeConfirmacionCargaBD(
  desglose: ReporteOperativoDesglose,
  respuestaBreveIA?: string
): string {
  if (respuestaBreveIA && respuestaBreveIA.trim().length > 0) {
    return respuestaBreveIA.trim();
  }

  const sec = desglose.seccionesInformadas;
  const campos = desglose.camposExtraidosReales || [];

  // Caso 1: Solo observó o destacó un patrón puntual
  if (sec.patronObservado && !sec.saludEnergia && !sec.accionTiempo) {
    const patVal = campos.find((c) => c.categoria === "patron_observado")?.valor || desglose.patronesContexto.patronDetectado;
    return `Patrón guardado en BD (${desglose.horaRegistrada} hs): ${patVal}`;
  }

  // Caso 2: Solo destacó algo que siente / estado anímico o actualización de energía ("ya no estoy cansado")
  if ((sec.saludEnergia || sec.animoEmociones) && !sec.accionTiempo) {
    const resumenEstado = campos.map((c) => `${c.etiqueta}: ${c.valor}`).join(" · ");
    return `Estado actualizado en BD (${desglose.horaRegistrada} hs) — ${resumenEstado}.`;
  }

  // Caso 3: Solo cargó actividad / avance concreto
  if (sec.accionTiempo && !sec.saludEnergia && !sec.animoEmociones) {
    const actVal = campos.find((c) => c.categoria === "accion_tiempo")?.valor || desglose.datosOperativos.actividadRealizada;
    return `Avance registrado (${desglose.horaRegistrada} hs): ${actVal}.`;
  }

  // Caso 4: Carga combinada — mostrar únicamente los ítems informados en 1-2 líneas
  const resumenCompacto = campos.map((c) => `${c.etiqueta}: ${c.valor}`).join(" | ");
  return `Guardado en BD (${desglose.horaRegistrada} hs) → ${resumenCompacto}`;
}

/**
 * Extrae únicamente lo que el usuario informó en el mensaje actual (Groq + respaldo determinista),
 * prohibiendo autocompletar variables no mencionadas.
 */
export async function extraerReporteOperativo(
  texto: string,
  horaActualFallback: string,
  objetivosExistentes: ObjetivoEstructurado[] = [],
  forzarComoReporte = false,
  estrategiasExistentes: Strategy[] = []
): Promise<ReporteOperativoResultado> {
  const esReporte = forzarComoReporte || detectarEsReporteOperativo(texto);
  const fechaHoy = new Date().toISOString().split("T")[0];

  let desglose = extraerReporteDeterminista(
    texto,
    horaActualFallback,
    objetivosExistentes,
    estrategiasExistentes
  );

  let respuestaBreveIA = "";

  try {
    const prompt = `Analizá este mensaje que Juan acaba de cargar en su bitácora y extraé ÚNICAMENTE la información que él dijo explícitamente.

MENSAJE DE JUAN:
"${texto.trim()}"

REGLAS ESTRICTAS (PROHIBIDO VIOLARLAS):
1. NO ADIVINES, NO ASUMAS NI AUTOCOMPLETES INFORMACIÓN QUE JUAN NO DIJO EN ESTE MENSAJE.
2. Si Juan solo está destacando un patrón que observó (ej. "cuando termino de hacer algo me siento en la cama a ver videos sin darme cuenta") o algo específico que siente:
   - Poné "saludEnergia": false en "seccionesInformadas" (PROHIBIDO inventar "Energía 5/10" o "energía baja tras el esfuerzo" si él no habló de cansancio o energía).
   - Poné "accionTiempo": false si está describiendo un hábito/patrón general y NO inventes minutos (como 40 min o 60 min) que él no haya dicho.
3. Si Juan aclara que ya NO está cansado o que cambió su estado respecto a la mañana, registrá su estado actual renovado sin arrastrar el cansancio viejo.
4. En "camposExtraidosReales" incluí SOLO los datos que realmente mencionó Juan en este mensaje (entre 1 y 4 puntos cortos y fieles a lo que dijo). No agregues categorías vacías ni suposiciones.
5. En "respuestaConfirmacionBreve" escribí una confirmación de 1 a 2 oraciones cortas como máximo, variando la estructura según lo que cargó (sin usar plantillas fijas ni textos largos).

Respondé ÚNICAMENTE con un JSON válido con este formato:
{
  "horaRegistrada": "${desglose.horaRegistrada}",
  "seccionesInformadas": {
    "saludEnergia": false,
    "animoEmociones": false,
    "accionTiempo": false,
    "patronObservado": true,
    "metodoRegulador": false
  },
  "camposExtraidosReales": [
    {
      "categoria": "patron_observado",
      "etiqueta": "Nombre corto del dato (ej. Patrón detectado / Detonante / Estado actual / Actividad)",
      "valor": "Resumen fiel y conciso de lo que dijo Juan"
    }
  ],
  "saludEnergia": {
    "score": 7,
    "enCondiciones": true,
    "estadoFisicoMental": "Solo completar si habló de energía/cansancio, sino dejar vacío",
    "desgasteDia": "Solo completar si habló de desgaste, sino dejar vacío"
  },
  "animoEmociones": {
    "score": 7,
    "emocionesDetectadas": [],
    "manejoAutoimagen": "",
    "sensacionesPrimitivas": "",
    "estadosNegativos": [],
    "respuestaAnteNegativo": "",
    "controloEmociones": "si",
    "metodoRegulador": "Ninguno registrado",
    "resultadoRegulacion": "exito"
  },
  "accion": {
    "score": 7,
    "actividadesRealizadas": [],
    "tiempoProductivoMin": 0,
    "tiempoDistraidoMin": 0,
    "tiempoRegulacionMin": 0,
    "actividadesNegativasDistraccion": ""
  },
  "patronesContexto": {
    "factoresContextuales": [],
    "patronDetectado": "Solo si describió un patrón o contexto disparador"
  },
  "respuestaConfirmacionBreve": "Confirmación breve (1 a 2 oraciones máximo), natural y sin plantilla fija de lo que se guardó en BD."
}`;

    const raw = await chatWithGroq(
      [
        {
          role: "system",
          content:
            "Sos un extractor estricto para Base de Datos. Cargás ÚNICAMENTE lo que el usuario dijo en su mensaje actual. Jamás asumís ni autocompletás energía, cansancio, emociones ni minutos que el usuario no haya mencionado. Respondés solo JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      {
        model: EXTRACTION_GROQ_MODEL,
        temperature: 0.1,
        max_tokens: 550,
        jsonMode: true,
      }
    );

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.camposExtraidosReales) && parsed.camposExtraidosReales.length > 0) {
      const sec = {
        saludEnergia: Boolean(parsed.seccionesInformadas?.saludEnergia),
        animoEmociones: Boolean(parsed.seccionesInformadas?.animoEmociones),
        accionTiempo: Boolean(parsed.seccionesInformadas?.accionTiempo),
        patronObservado: Boolean(parsed.seccionesInformadas?.patronObservado),
        metodoRegulador: Boolean(parsed.seccionesInformadas?.metodoRegulador),
      };

      const camposValidos: CampoExtraidoReal[] = parsed.camposExtraidosReales
        .filter((c: any) => c && c.etiqueta && c.valor)
        .map((c: any) => ({
          categoria:
            c.categoria === "salud_energia" ||
            c.categoria === "animo_emocion" ||
            c.categoria === "accion_tiempo" ||
            c.categoria === "patron_observado" ||
            c.categoria === "metodo_regulador"
              ? c.categoria
              : "nota_especifica",
          etiqueta: String(c.etiqueta).trim(),
          valor: String(c.valor).trim(),
        }));

      const metodoDetectado =
        sec.metodoRegulador && parsed.animoEmociones?.metodoRegulador
          ? String(parsed.animoEmociones.metodoRegulador)
          : desglose.metodoAplicado;
      const esNuevo = verificarSiEsMetodoNuevo(metodoDetectado, estrategiasExistentes);

      const sScore = sec.saludEnergia
        ? Number(parsed.saludEnergia?.score) || desglose.energia
        : desglose.energia;
      const aScore = sec.animoEmociones
        ? Number(parsed.animoEmociones?.score) || desglose.animo
        : desglose.animo;
      const pScore = sec.accionTiempo
        ? Number(parsed.accion?.score) || desglose.productividad
        : desglose.productividad;

      const tProd = sec.accionTiempo
        ? Number(parsed.accion?.tiempoProductivoMin) || 0
        : 0;
      const tDist = sec.accionTiempo
        ? Number(parsed.accion?.tiempoDistraidoMin) || 0
        : 0;
      const tReg =
        sec.accionTiempo || sec.metodoRegulador
          ? Number(parsed.accion?.tiempoRegulacionMin) || desglose.variableAccion.tiempoRegulacionMin
          : 0;

      const acts: ActividadTiempoItem[] =
        sec.accionTiempo && Array.isArray(parsed.accion?.actividadesRealizadas)
          ? parsed.accion.actividadesRealizadas.map((a: any) => ({
              nombre: String(a.nombre || "Actividad"),
              categoria:
                a.categoria === "distraccion" ||
                a.categoria === "imprevisto" ||
                a.categoria === "regulacion_descanso"
                  ? a.categoria
                  : "productiva",
              minutos: Number(a.minutos) || 0,
            }))
          : desglose.variableAccion.actividadesRealizadas;

      const emocionesArr =
        sec.animoEmociones && Array.isArray(parsed.animoEmociones?.emocionesDetectadas)
          ? parsed.animoEmociones.emocionesDetectadas
          : desglose.variableAnimoEmociones.emocionesDetectadas;

      const negativosArr =
        sec.animoEmociones && Array.isArray(parsed.animoEmociones?.estadosNegativos)
          ? parsed.animoEmociones.estadosNegativos
          : desglose.variableAnimoEmociones.estadosNegativos;

      const patronTexto =
        parsed.patronesContexto?.patronDetectado ||
        camposValidos.find((c) => c.categoria === "patron_observado")?.valor ||
        desglose.patronesContexto.patronDetectado;

      respuestaBreveIA = String(parsed.respuestaConfirmacionBreve || "").trim();

      const horaFinal = parsed.horaRegistrada || desglose.horaRegistrada;
      const resumenNota = `[${horaFinal} hs] ${camposValidos.map((c) => `${c.etiqueta}: ${c.valor}`).join(" | ")}`;

      desglose = {
        ...desglose,
        horaRegistrada: horaFinal,
        energia: sScore,
        animo: aScore,
        productividad: pScore,
        foco: pScore,
        metodoAplicado: metodoDetectado,
        esMetodoNuevo: esNuevo,
        resumenNota,
        seccionesInformadas: sec,
        camposExtraidosReales: camposValidos,
        variableSaludEnergia: {
          score: sScore,
          enCondiciones:
            sec.saludEnergia && typeof parsed.saludEnergia?.enCondiciones === "boolean"
              ? parsed.saludEnergia.enCondiciones
              : desglose.variableSaludEnergia.enCondiciones,
          estadoFisicoMental: sec.saludEnergia
            ? parsed.saludEnergia?.estadoFisicoMental || desglose.variableSaludEnergia.estadoFisicoMental
            : "No mencionado",
          desgasteDia: sec.saludEnergia
            ? parsed.saludEnergia?.desgasteDia || desglose.variableSaludEnergia.desgasteDia
            : "No mencionado",
        },
        variableAnimoEmociones: {
          score: aScore,
          emocionesDetectadas: emocionesArr,
          manejoAutoimagen: sec.animoEmociones ? parsed.animoEmociones?.manejoAutoimagen || "" : "",
          sensacionesPrimitivas: sec.animoEmociones ? parsed.animoEmociones?.sensacionesPrimitivas || "" : "",
          estadosNegativos: negativosArr,
          respuestaAnteNegativo: sec.animoEmociones ? parsed.animoEmociones?.respuestaAnteNegativo || "" : "",
          controloEmociones:
            parsed.animoEmociones?.controloEmociones === "no" ||
            parsed.animoEmociones?.controloEmociones === "parcial"
              ? parsed.animoEmociones.controloEmociones
              : "si",
          metodoRegulador: metodoDetectado,
          esMetodoNuevo: esNuevo,
          resultadoRegulacion:
            parsed.animoEmociones?.resultadoRegulacion === "fallo" ||
            parsed.animoEmociones?.resultadoRegulacion === "parcial"
              ? parsed.animoEmociones.resultadoRegulacion
              : "exito",
        },
        variableAccion: {
          score: pScore,
          actividadesRealizadas: acts,
          tiempoProductivoMin: tProd,
          tiempoDistraidoMin: tDist,
          tiempoRegulacionMin: tReg,
          actividadesNegativasDistraccion: sec.accionTiempo
            ? parsed.accion?.actividadesNegativasDistraccion || ""
            : "",
          distribucionResumen:
            tProd > 0 || tDist > 0 || tReg > 0
              ? `Productivo: ${tProd} min · Distraído: ${tDist} min · Regulación: ${tReg} min`
              : "",
        },
        patronesContexto: {
          ...desglose.patronesContexto,
          patronDetectado: patronTexto,
        },
        datosOperativos: {
          ...desglose.datosOperativos,
          actividadRealizada: camposValidos[0]?.valor.slice(0, 70) || desglose.datosOperativos.actividadRealizada,
          productividadScore: pScore,
        },
      };
    }
  } catch (_e) {
    // Usar el desglose determinista estricto
  }

  const sec = desglose.seccionesInformadas;
  const logId = `log-auto-${Date.now()}`;
  const log: DailyLog = {
    id: logId,
    createdAt: new Date().toISOString(),
    dateKey: fechaHoy,
    horaExacta: desglose.horaRegistrada,
    franja: desglose.franja,
    energy: desglose.variableSaludEnergia.score,
    motivation: desglose.variableAccion.score,
    stress: desglose.estresPresion,
    moodScore: desglose.variableAnimoEmociones.score,
    productivityScore: desglose.variableAccion.score,
    energiaMencionada: sec.saludEnergia,
    animoMencionado: sec.animoEmociones,
    accionMencionada: sec.accionTiempo,
    patronMencionado: sec.patronObservado,
    camposExtraidosReales: desglose.camposExtraidosReales,
    enCondiciones: desglose.variableSaludEnergia.enCondiciones,
    desgasteAcumulado: sec.saludEnergia ? desglose.variableSaludEnergia.desgasteDia : undefined,
    emocionesDetectadas: sec.animoEmociones ? desglose.variableAnimoEmociones.emocionesDetectadas : [],
    manejoAutoimagen: sec.animoEmociones ? desglose.variableAnimoEmociones.manejoAutoimagen : undefined,
    sensacionesPrimitivas: sec.animoEmociones ? desglose.variableAnimoEmociones.sensacionesPrimitivas : undefined,
    estadosNegativos: sec.animoEmociones ? desglose.variableAnimoEmociones.estadosNegativos : [],
    respuestaEstadoNegativo: sec.animoEmociones ? desglose.variableAnimoEmociones.respuestaAnteNegativo : undefined,
    controloEmociones: desglose.variableAnimoEmociones.controloEmociones,
    esMetodoNuevo: desglose.esMetodoNuevo,
    tiempoProductivoMin: sec.accionTiempo ? desglose.variableAccion.tiempoProductivoMin : 0,
    tiempoDistraidoMin: sec.accionTiempo ? desglose.variableAccion.tiempoDistraidoMin : 0,
    tiempoRegulacionMin: desglose.variableAccion.tiempoRegulacionMin,
    actividadesDetalle: sec.accionTiempo ? desglose.variableAccion.actividadesRealizadas : [],
    actividadesNegativasDistraccion: sec.accionTiempo
      ? desglose.variableAccion.actividadesNegativasDistraccion
      : undefined,
    factoresContextuales: desglose.patronesContexto.factoresContextuales,
    patronContextoResumen: sec.patronObservado ? desglose.patronesContexto.patronDetectado : undefined,
    tipoReporte: desglose.tipoReporte,
    objetivoId: desglose.objetivoId,
    rasgoCodigo: desglose.rasgoCodigo,
    huboObstaculo: desglose.huboObstaculo,
    detonante: desglose.friccionDetectada,
    metodoAplicado: sec.metodoRegulador ? desglose.metodoAplicado : undefined,
    resultadoMetodo: desglose.resultadoMetodo,
    estadoPsicologicoEtiqueta: sec.animoEmociones
      ? desglose.variableAnimoEmociones.emocionesDetectadas.join(" · ")
      : undefined,
    actividadRealizada: desglose.datosOperativos.actividadRealizada,
    metasEspecificas: desglose.metasEspecificas,
    compromisoHorario: desglose.compromisoHorario,
    desvioOperativo: desglose.datosOperativos.desvioDetectado,
    note: desglose.resumenNota,
  };

  let nuevoMetodoParaGuardar: Strategy | undefined;
  if (
    sec.metodoRegulador &&
    desglose.esMetodoNuevo &&
    desglose.metodoAplicado &&
    desglose.metodoAplicado !== "Ninguno registrado"
  ) {
    nuevoMetodoParaGuardar = {
      id: `strat-auto-${Date.now()}`,
      name: desglose.metodoAplicado,
      situation:
        desglose.variableAnimoEmociones.estadosNegativos.join(", ") ||
        desglose.patronesContexto.etiquetasFactores.join(", ") ||
        "Regulación durante la jornada",
      result: desglose.variableAnimoEmociones.respuestaAnteNegativo || "Aplicado en jornada",
      effectiveness: desglose.resultadoMetodo === "exito" ? "alta" : "media",
      status: "recomendada",
      resultType: desglose.resultadoMetodo === "fallo" ? "negativo" : "positivo",
      reason: `Método regulador detectado y guardado desde Carga Diaria (${fechaHoy} ${desglose.horaRegistrada} hs).`,
      createdAt: new Date().toISOString(),
      rama_id: "habitos",
    };
  }

  let fichaVivencia: FichaVivenciaInmutable | undefined;
  if (sec.metodoRegulador && desglose.huboObstaculo && desglose.resultadoMetodo === "exito") {
    fichaVivencia = {
      id: `VIV-${fechaHoy}-${Date.now().toString().slice(-4)}`,
      fecha: fechaHoy,
      rama_id: "proyectos",
      tags_mecanismo: ["#ideal_adaptado", "#estudio_ingenieria"],
      contexto_situacional: {
        momento: `${desglose.horaRegistrada} hs (${desglose.franjaLabel})`,
        nivel_energia: desglose.energia >= 7 ? "alto" : "medio",
        factores_externos: desglose.patronesContexto.etiquetasFactores.join(", ") || "Jornada operativa",
      },
      detonante_exacto: desglose.friccionDetectada,
      reaccion_inicial: desglose.variableAnimoEmociones.estadosNegativos.join(", ") || "Fricción",
      solucion_aplicada: desglose.metodoAplicado,
      resultado: "exito",
      inmutable: true,
    };
  }

  const mensajeConfirmacionBD = generarMensajeConfirmacionCargaBD(desglose, respuestaBreveIA);

  return {
    esReporte,
    log,
    desglose,
    desgloseTexto: mensajeConfirmacionBD,
    mensajeConfirmacionBD,
    fichaVivencia,
    nuevoMetodoParaGuardar,
  };
}

/**
 * Compila el historial completo de cargas (AYER + HOY) usando la telemetría oficial de Tucumán.
 * Muestra las cargas reales de ayer (para responder consultas sobre ayer) y las de hoy
 * destacando que los estados pasados (ej. haberse levantado cansado) no aplican al estado actual.
 */
export function compilarCargasDelDiaSeparadas(logs: DailyLog[], allMessages: any[] = []): string {
  return compilarHistorialCompletoCargas(logs, allMessages);
}
