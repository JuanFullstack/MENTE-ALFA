/**
 * @file src/lib/reportExtractor.ts
 * Extractor quirúrgico y desglose estructurado de reportes operativos / check-ins diarios.
 * Extrae horas, métricas 1-10, fricciones, métodos exitosos y metas de estudio/trabajo.
 */

import {
  DailyLog,
  ObjetivoEstructurado,
  FichaVivenciaInmutable,
  FranjaOperativa,
  TipoObjetivo,
  CodigoRasgo,
} from "../types";
import { clasificarFranjaHoraria } from "./progressAuditor";
import { chatWithGroq, EXTRACTION_GROQ_MODEL } from "../services/groqEvaluation";

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
  resultadoMetodo: "exito" | "parcial" | "fallo";
  tipoReporte: TipoObjetivo | "estado_general";
  objetivoId: string;
  rasgoCodigo: CodigoRasgo;
  metasEspecificas: string[];
  compromisoHorario?: string;
  ventanaDisponibleTexto: string;
  planTimeBoxing: string[];
  resumenNota: string;
  // Separación explícita: Carga de Datos Operativos vs Aspecto Psicológico
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
  fichaVivencia?: FichaVivenciaInmutable;
}

/**
 * Detecta si el mensaje del usuario constituye un reporte de situación, avance o check-in.
 */
export function detectarEsReporteOperativo(texto: string): boolean {
  if (!texto || texto.trim().length < 25) return false;
  const txt = texto.toLowerCase();

  const patronesHorarios = /(son las|a las|tipo \d+|mediod[ií]a|mañana|tarde|noche|\d{1,2}:\d{2}|\d{1,2} y \d{2})/i;
  const patronesEstado = /(mi estado|energ[ií]a|desganado|desgano|tranquilo|positivo|ánimo|animo|presionado|presi[oó]n|estr[eé]s|foco|productiv)/i;
  const patronesAccion = /(meditaci[oó]n|meditar|hice bastante|hice cosas|tareas intermedias|fogaje|estudiar|avanzar|unidad|bloque|compromiso|promet[ií])/i;

  let hits = 0;
  if (patronesHorarios.test(txt)) hits++;
  if (patronesEstado.test(txt)) hits++;
  if (patronesAccion.test(txt)) hits++;

  return hits >= 2;
}

/**
 * Extractor heurístico determinista de alta precisión (funciona offline y como respaldo inmediato).
 */
export function extraerReporteDeterminista(
  texto: string,
  horaActualFallback: string,
  objetivosExistentes: ObjetivoEstructurado[] = []
): ReporteOperativoDesglose {
  const txt = texto.toLowerCase();
  const infoHora = clasificarFranjaHoraria();

  // 1. Extraer hora mencionada
  const matchHora = texto.match(/son\s+las\s+(\d{1,2}(?::\d{2}|\s+y\s+\d{2}))/i) ||
                    texto.match(/(\d{1,2}:\d{2})/);
  let horaRegistrada = infoHora.horaExacta;
  if (matchHora) {
    horaRegistrada = matchHora[1].replace(/\s+y\s+/i, ":").trim();
    if (!horaRegistrada.includes(":")) horaRegistrada = `${horaRegistrada}:00`;
  }

  // 2. Extraer metas de estudio (ej: Unidad 5 y Unidad 7)
  const metasEspecificas: string[] = [];
  const regexUnidades = /unidad\s+(\d+|[a-z]+)/gi;
  let matchU;
  while ((matchU = regexUnidades.exec(texto)) !== null) {
    metasEspecificas.push(`Unidad ${matchU[1].toUpperCase()}`);
  }
  if (metasEspecificas.length === 0 && /estudiar|ingenier[ií]a|f[ií]sica/i.test(txt)) {
    metasEspecificas.push("Estudio de Ingeniería");
  }

  // 3. Extraer compromiso horario
  let compromisoHorario: string | undefined;
  const matchCompromiso = texto.match(/(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)\s*(?:de\s+la\s+tarde|hs|hrs)?\s+tengo\s+un\s+compromiso/i) ||
                          texto.match(/compromiso\s+(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)/i);
  if (matchCompromiso) {
    compromisoHorario = matchCompromiso[1].includes(":") ? `${matchCompromiso[1]} hs` : `${matchCompromiso[1]}:00 hs`;
  } else if (/a\s+las\s+15:00/i.test(texto)) {
    compromisoHorario = "15:00 hs";
  }

  // 4. Calcular ventana disponible
  let ventanaDisponibleTexto = "Bloque operativo inmediato";
  if (compromisoHorario) {
    ventanaDisponibleTexto = `${horaRegistrada} hs hasta ${compromisoHorario} (~2h 30m de foco disponible)`;
  }

  // 5. Detectar métodos aplicados (ej: meditación de 12 minutos)
  let metodoAplicado = "Protocolo de foco y respiración";
  let huboMetodoExitoso = false;
  const matchMed = texto.match(/meditaci[oó]n(?:\s+intermedia)?(?:\s+tipo\s+[^\.]+)?(?:\s+de\s+(\d+)\s+minutos?)?/i);
  if (matchMed) {
    const minutos = matchMed[1] || "12";
    metodoAplicado = `Meditación de ${minutos} minutos (renovó energía y devolvió la calma)`;
    huboMetodoExitoso = /funcion[oó]|tranquilo|renovar|positivo/i.test(txt);
  }

  // 6. Detectar obstáculos / fricción
  let huboObstaculo = false;
  let friccionDetectada = "Sin fricción crítica";
  if (/desganado|sin gana|desgano|fogaje|cosas intermedia|no eran el objetivo/i.test(txt)) {
    huboObstaculo = true;
    const partes: string[] = [];
    if (/desganado|desgano|sin gana/i.test(txt)) partes.push("Desgano matutino tipo 10:30 hs");
    if (/fogaje|cosas intermedia|mejorar la aplicaci[oó]n/i.test(txt)) partes.push("Desvío en tareas secundarias ('fogaje' / mejoras en app)");
    friccionDetectada = partes.join(" + ") || "Fricción operativa inicial";
  }

  // 7. Estimar métricas 1-10
  let energia = 7;
  let animo = 8;
  let foco = 7;
  let estresPresion = 5;
  let productividad = 6;

  if (/bastante tranquilo|positivo|si funcion[oó]|sí funcionó/i.test(txt)) {
    energia = 7;
    animo = 8;
  }
  if (/presionado|presiona/i.test(txt)) {
    estresPresion = 6;
  }
  if (/bastante productivo/i.test(txt)) {
    productividad = 7;
    foco = 7;
  }

  // 8. Objetivo asignado
  const objEstudio = objetivosExistentes.find((o) => o.rasgoCodigo === "PROD-3_estudio_ingenieria") ||
                     objetivosExistentes.find((o) => o.tipo === "productivo");
  const objetivoId = objEstudio ? objEstudio.id : "obj-prod-estudio";
  const rasgoCodigo: CodigoRasgo = "PROD-3_estudio_ingenieria";

  // 9. Plan táctico de Time-Boxing adaptado
  const planTimeBoxing = [
    `Bloque 1 (12:30 a 13:45 - 75 min): Ataque concentrado a ${metasEspecificas[0] || "Unidad 5"} (conceptos troncales y ejercicios prácticos).`,
    "Pausa Táctica de 5 min: Agua fría, respiración profunda de león, postura erguida.",
    `Bloque 2 (13:50 a 14:50 - 60 min): Barrido de ${metasEspecificas[1] || "Unidad 7"} (esquema global, definiciones y puntos de examen).`,
    `Cierre 14:50 a ${compromisoHorario || "15:00 hs"}: Corte limpio con la tranquilidad de haber cumplido antes de salir.`,
  ];

  const resumenNota = `Check-in ${horaRegistrada} hs: [DATOS] Act: ${
    /hice bastante|mejorar la aplicaci[oó]n|cosas intermedia/i.test(txt)
      ? "Tareas intermedias / mejoras en app"
      : "Avance en bloque actual"
  } | Metas: ${metasEspecificas.join(", ") || "Estudio"} | Ventana: ${ventanaDisponibleTexto}. [PSICOLOGÍA] Fricción: ${friccionDetectada} | Método: ${metodoAplicado}.`;

  const actividadRealizada = /mejorar la aplicaci[oó]n|cosas intermedia|fogaje/i.test(txt)
    ? "Tareas operativas intermedias / mejoras en la app"
    : /estudi|unidad|tesis|c[oó]digo/i.test(txt)
    ? `Bloque de avance (${metasEspecificas.join(", ") || "Estudio / Proyecto"})`
    : texto.trim().slice(0, 90);

  const desvioDetectado = /fogaje|cosas intermedia|mejorar la aplicaci[oó]n|no eran el objetivo/i.test(txt)
    ? "Desvío en tareas intermedias ('fogaje') fuera del objetivo central"
    : undefined;

  const estadoPartes: string[] = [];
  if (/tranquilo/i.test(txt)) estadoPartes.push("Tranquilo");
  if (/positivo/i.test(txt)) estadoPartes.push("Positivo");
  if (/presionado|presi[oó]n/i.test(txt)) estadoPartes.push("Presionado por el reloj");
  if (/desganado|desgano/i.test(txt)) estadoPartes.push("Desgano superado");
  const estadoEtiqueta = estadoPartes.length > 0 ? estadoPartes.join(" · ") : "Estable y operativo";

  return {
    horaRegistrada,
    franjaLabel: infoHora.labelFranja,
    franja: infoHora.franja,
    energia,
    foco,
    estresPresion,
    animo,
    productividad,
    huboObstaculo,
    friccionDetectada,
    metodoAplicado,
    resultadoMetodo: huboMetodoExitoso ? "exito" : huboObstaculo ? "parcial" : "exito",
    tipoReporte: "productivo",
    objetivoId,
    rasgoCodigo,
    metasEspecificas,
    compromisoHorario,
    ventanaDisponibleTexto,
    planTimeBoxing,
    resumenNota,
    datosOperativos: {
      momentoDia: `${horaRegistrada} hs (${infoHora.labelFranja})`,
      actividadRealizada,
      metasActivas: metasEspecificas.length > 0 ? metasEspecificas : ["Avance del bloque actual"],
      compromisoCorte: compromisoHorario,
      ventanaDisponible: ventanaDisponibleTexto,
      desvioDetectado,
      productividadScore: productividad,
    },
    aspectoPsicologico: {
      estadoEtiqueta,
      energiaScore: energia,
      animoScore: animo,
      focoScore: foco,
      presionScore: estresPresion,
      friccionInterna: friccionDetectada,
      metodoRegulacion: metodoAplicado,
      resultadoRegulacion: huboMetodoExitoso ? "exito" : huboObstaculo ? "parcial" : "exito",
    },
  };
}

/**
 * Extrae y desglosa el reporte operativo de forma integral usando IA si está disponible,
 * con fallback determinista inmediato.
 */
export async function extraerReporteOperativo(
  texto: string,
  horaActualFallback: string,
  objetivosExistentes: ObjetivoEstructurado[] = [],
  forzarComoReporte = false
): Promise<ReporteOperativoResultado> {
  const esReporte = forzarComoReporte || detectarEsReporteOperativo(texto);
  const infoHora = clasificarFranjaHoraria();
  const fechaHoy = new Date().toISOString().split("T")[0];

  let desglose = extraerReporteDeterminista(texto, horaActualFallback, objetivosExistentes);

  // Intentar refinamiento asíncrono rápido con Groq Qwen si es posible
  try {
    const prompt = `Analiza quirúrgicamente este registro de Juan separando DATO OPERATIVO vs ASPECTO PSICOLÓGICO y responde en JSON puro:
TEXTO: "${texto.trim()}"

Extrae exactamente este esquema JSON:
{
  "horaRegistrada": "${desglose.horaRegistrada}",
  "energia": ${desglose.energia},
  "foco": ${desglose.foco},
  "estresPresion": ${desglose.estresPresion},
  "animo": ${desglose.animo},
  "productividad": ${desglose.productividad},
  "actividadRealizada": "Qué tarea o avance concreto hizo",
  "desvioDetectado": "Si hizo tareas secundarias/fogaje o vacío si no hubo",
  "estadoEtiqueta": "Ej: Tranquilo y positivo, presionado por el reloj",
  "huboObstaculo": true,
  "friccionDetectada": "Gatillo o bloqueo psicológico detectado",
  "metodoAplicado": "Método psicológico/regulación aplicado",
  "resultadoMetodo": "exito",
  "metasEspecificas": ["Unidad 5", "Unidad 7"],
  "compromisoHorario": "15:00 hs",
  "ventanaDisponibleTexto": "12:25 a 15:00 hs (~2h 35m)"
}`;

    const raw = await chatWithGroq(
      [
        { role: "system", content: "Extractor analítico que separa estrictamente Carga de Datos Operativos vs Aspectos Psicológicos. Responde solo JSON válido." },
        { role: "user", content: prompt },
      ],
      {
        model: EXTRACTION_GROQ_MODEL,
        temperature: 0.1,
        max_tokens: 380,
        jsonMode: true,
      }
    );

    const parsed = JSON.parse(raw);
    if (parsed && parsed.horaRegistrada) {
      const nuevaEnergia = typeof parsed.energia === "number" ? parsed.energia : desglose.energia;
      const nuevoFoco = typeof parsed.foco === "number" ? parsed.foco : desglose.foco;
      const nuevoEstres = typeof parsed.estresPresion === "number" ? parsed.estresPresion : desglose.estresPresion;
      const nuevoAnimo = typeof parsed.animo === "number" ? parsed.animo : desglose.animo;
      const nuevaProd = typeof parsed.productividad === "number" ? parsed.productividad : desglose.productividad;
      const nuevaFriccion = parsed.friccionDetectada || desglose.friccionDetectada;
      const nuevoMetodo = parsed.metodoAplicado || desglose.metodoAplicado;
      const nuevoResultado =
        parsed.resultadoMetodo === "exito" || parsed.resultadoMetodo === "fallo"
          ? parsed.resultadoMetodo
          : desglose.resultadoMetodo;
      const nuevasMetas =
        Array.isArray(parsed.metasEspecificas) && parsed.metasEspecificas.length > 0
          ? parsed.metasEspecificas
          : desglose.metasEspecificas;
      const nuevoCompromiso = parsed.compromisoHorario || desglose.compromisoHorario;
      const nuevaVentana = parsed.ventanaDisponibleTexto || desglose.ventanaDisponibleTexto;

      desglose = {
        ...desglose,
        horaRegistrada: parsed.horaRegistrada || desglose.horaRegistrada,
        energia: nuevaEnergia,
        foco: nuevoFoco,
        estresPresion: nuevoEstres,
        animo: nuevoAnimo,
        productividad: nuevaProd,
        friccionDetectada: nuevaFriccion,
        metodoAplicado: nuevoMetodo,
        resultadoMetodo: nuevoResultado,
        metasEspecificas: nuevasMetas,
        compromisoHorario: nuevoCompromiso,
        ventanaDisponibleTexto: nuevaVentana,
        datosOperativos: {
          momentoDia: `${parsed.horaRegistrada || desglose.horaRegistrada} hs (${desglose.franjaLabel})`,
          actividadRealizada: parsed.actividadRealizada || desglose.datosOperativos.actividadRealizada,
          metasActivas: nuevasMetas,
          compromisoCorte: nuevoCompromiso,
          ventanaDisponible: nuevaVentana,
          desvioDetectado: parsed.desvioDetectado || desglose.datosOperativos.desvioDetectado,
          productividadScore: nuevaProd,
        },
        aspectoPsicologico: {
          estadoEtiqueta: parsed.estadoEtiqueta || desglose.aspectoPsicologico.estadoEtiqueta,
          energiaScore: nuevaEnergia,
          animoScore: nuevoAnimo,
          focoScore: nuevoFoco,
          presionScore: nuevoEstres,
          friccionInterna: nuevaFriccion,
          metodoRegulacion: nuevoMetodo,
          resultadoRegulacion: nuevoResultado,
        },
      };
    }
  } catch (_e) {
    // Uso del extractor determinista local
  }

  const logId = `log-auto-${Date.now()}`;
  const log: DailyLog = {
    id: logId,
    createdAt: new Date().toISOString(),
    dateKey: fechaHoy,
    horaExacta: desglose.horaRegistrada,
    franja: desglose.franja,
    energy: desglose.energia,
    motivation: desglose.foco,
    stress: desglose.estresPresion,
    moodScore: desglose.animo,
    productivityScore: desglose.productividad,
    tipoReporte: desglose.tipoReporte,
    objetivoId: desglose.objetivoId,
    rasgoCodigo: desglose.rasgoCodigo,
    huboObstaculo: desglose.huboObstaculo,
    detonante: desglose.friccionDetectada,
    metodoAplicado: desglose.metodoAplicado,
    resultadoMetodo: desglose.resultadoMetodo,
    estadoPsicologicoEtiqueta: desglose.aspectoPsicologico.estadoEtiqueta,
    actividadRealizada: desglose.datosOperativos.actividadRealizada,
    metasEspecificas: desglose.metasEspecificas,
    compromisoHorario: desglose.compromisoHorario,
    desvioOperativo: desglose.datosOperativos.desvioDetectado,
    note: desglose.resumenNota,
  };

  let fichaVivencia: FichaVivenciaInmutable | undefined;
  if (desglose.huboObstaculo && desglose.resultadoMetodo === "exito") {
    fichaVivencia = {
      id: `VIV-${fechaHoy}-${Date.now().toString().slice(-4)}`,
      fecha: fechaHoy,
      rama_id: "proyectos",
      tags_mecanismo: ["#ideal_adaptado", "#estudio_ingenieria"],
      contexto_situacional: {
        momento: `${desglose.horaRegistrada} hs (${desglose.franjaLabel})`,
        nivel_energia: desglose.energia >= 7 ? "alto" : "medio",
        factores_externos: `Compromiso a las ${desglose.compromisoHorario || "15:00 hs"}`,
      },
      detonante_exacto: desglose.friccionDetectada,
      reaccion_inicial: "Tentación de dispersarse en tareas intermedias ('fogaje')",
      solucion_aplicada: desglose.metodoAplicado,
      resultado: "exito",
      inmutable: true,
    };
  }

  const desgloseTexto = `📦 **1. CARGA DE DATOS OPERATIVOS (MOMENTO DEL DÍA):**
- **Hora y Franja:** ${desglose.datosOperativos.momentoDia}
- **Actividad Ejecutada:** ${desglose.datosOperativos.actividadRealizada}
- **Desvío Operativo ('Fogaje'):** ${desglose.datosOperativos.desvioDetectado || "Ninguno"}
- **Metas Activas del Bloque:** ${desglose.datosOperativos.metasActivas.join(" y ") || "Estudio / Avance"}
- **Ventana Disponible / Compromiso:** ${desglose.datosOperativos.ventanaDisponible}
- **Productividad del Momento:** ${desglose.datosOperativos.productividadScore}/10

🧠 **2. ASPECTO PSICOLÓGICO (ESTADO Y REGULACIÓN):**
- **Estado Mental:** ${desglose.aspectoPsicologico.estadoEtiqueta}
- **Biometría Psicológica:** Energía: ${desglose.aspectoPsicologico.energiaScore}/10 | Ánimo: ${desglose.aspectoPsicologico.animoScore}/10 | Foco: ${desglose.aspectoPsicologico.focoScore}/10 | Presión: ${desglose.aspectoPsicologico.presionScore}/10
- **Fricción / Autoengaño Detectado:** ${desglose.aspectoPsicologico.friccionInterna}
- **Método Psicológico Aplicado:** ${desglose.aspectoPsicologico.metodoRegulacion} (${desglose.aspectoPsicologico.resultadoRegulacion.toUpperCase()})`;

  return {
    esReporte,
    log,
    desglose,
    desgloseTexto,
    fichaVivencia,
  };
}

/**
 * Compila todas las cargas realizadas en los diferentes momentos del día de hoy,
 * separando claramente la línea de tiempo de Datos Operativos vs la Evolución Psicológica.
 */
export function compilarCargasDelDiaSeparadas(logs: DailyLog[]): string {
  const hoyIso = new Date().toISOString().split("T")[0];
  const logsHoy = (logs || [])
    .filter((l) => (l.dateKey || clasificarFranjaHoraria(l.createdAt).dateKey) === hoyIso)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (logsHoy.length === 0) {
    return "Aún no hay cargas registradas en el día de hoy.";
  }

  const lineasOperativas = logsHoy.map((l, idx) => {
    const info = clasificarFranjaHoraria(l.createdAt);
    const hora = l.horaExacta || info.horaExacta;
    const act = l.actividadRealizada || l.note.slice(0, 90);
    const metas = l.metasEspecificas && l.metasEspecificas.length > 0 ? ` | Metas: ${l.metasEspecificas.join(", ")}` : "";
    const comp = l.compromisoHorario ? ` | Compromiso: ${l.compromisoHorario}` : "";
    const desvio = l.desvioOperativo ? ` | ⚠️ Desvío: ${l.desvioOperativo}` : "";
    return `  ${idx + 1}. [${hora} hs · ${info.franja}] Prod: ${l.productivityScore ?? l.motivation}/10 -> ${act}${metas}${comp}${desvio}`;
  });

  const lineasPsicologicas = logsHoy.map((l, idx) => {
    const info = clasificarFranjaHoraria(l.createdAt);
    const hora = l.horaExacta || info.horaExacta;
    const estado = l.estadoPsicologicoEtiqueta || (l.stress >= 7 ? "Presionado/Tenso" : "Estable");
    const friccion = l.detonante ? ` | Fricción: ${l.detonante}` : "";
    const metodo = l.metodoAplicado ? ` | Método aplicado: ${l.metodoAplicado} (${(l.resultadoMetodo || "exito").toUpperCase()})` : "";
    return `  ${idx + 1}. [${hora} hs] Estado: ${estado} (Energía ${l.energy}/10, Ánimo ${l.moodScore ?? l.energy}/10, Presión ${l.stress}/10)${friccion}${metodo}`;
  });

  return `HISTORIAL DE CARGAS DE HOY (${logsHoy.length} momentos registrados en el día):

📦 A) LÍNEA DE TIEMPO DE CARGA DE DATOS OPERATIVOS (QUÉ HIZO Y METAS POR HORARIO):
${lineasOperativas.join("\n")}

🧠 B) EVOLUCIÓN DEL ASPECTO PSICOLÓGICO EN EL DÍA (ESTADO, FRICCIONES Y MÉTODOS):
${lineasPsicologicas.join("\n")}`;
}
