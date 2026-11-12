/**
 * @file src/lib/dateTimeUtils.ts
 * Utilidades centrales de telemetría temporal y compilación histórica de cargas.
 * Zona horaria fija: America/Argentina/Tucuman (UTC-3).
 * Garantiza que jamás se confunda la fecha de HOY con la de AYER,
 * y que las cargas de ayer siempre estén disponibles en el contexto de consulta.
 */

import { DailyLog, Message } from "../types";

export const TIMEZONE_ARGENTINA = "America/Argentina/Tucuman";
export const CONV_CARGA_DIARIA_ID = "conv-canal-cargas-diarias";

/**
 * Devuelve la fecha ISO local YYYY-MM-DD en la zona horaria de Tucumán.
 */
export function getLocalTucumanIsoDate(dateInput?: Date | string | number): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_ARGENTINA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Devuelve la hora exacta local HH:mm en la zona horaria de Tucumán.
 */
export function getLocalTucumanTime(dateInput?: Date | string | number): {
  hours: number;
  minutes: number;
  horaExacta: string;
} {
  const d = dateInput ? new Date(dateInput) : new Date();
  const timeStr = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE_ARGENTINA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  const [hStr, mStr] = timeStr.split(":");
  const hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;
  return {
    hours,
    minutes,
    horaExacta: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  };
}

/**
 * Devuelve la descripción en español rioplatense (ej. "jueves, 12 de noviembre de 2026").
 */
export function getLocalTucumanFullDescription(dateInput?: Date | string | number): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  return d.toLocaleDateString("es-AR", {
    timeZone: TIMEZONE_ARGENTINA,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Construye la telemetría temporal oficial para los prompts del sistema.
 */
export function getTelemetriaTemporalCompleta(dateInput?: Date | string | number): {
  fechaHoyIso: string;
  fechaAyerIso: string;
  fechaHoyDesc: string;
  fechaAyerDesc: string;
  horaActualTexto: string;
  telemetriaPromptTexto: string;
} {
  const d = dateInput ? new Date(dateInput) : new Date();
  const fechaHoyIso = getLocalTucumanIsoDate(d);
  const ayerDate = new Date(d.getTime() - 24 * 60 * 60 * 1000);
  const fechaAyerIso = getLocalTucumanIsoDate(ayerDate);

  const fechaHoyDesc = getLocalTucumanFullDescription(d);
  const fechaAyerDesc = getLocalTucumanFullDescription(ayerDate);
  const { horaExacta } = getLocalTucumanTime(d);
  const horaActualTexto = `${horaExacta} hs`;

  const telemetriaPromptTexto = `• FECHA DE HOY: ${fechaHoyDesc} (ISO: ${fechaHoyIso})
• FECHA DE AYER: ${fechaAyerDesc} (ISO: ${fechaAyerIso})
• HORA ACTUAL: ${horaActualTexto} (San Miguel de Tucumán, Argentina)
⚠️ REGLAS TEMPORALES ESTRICTAS:
1. HOY es ${fechaHoyDesc} (${fechaHoyIso}).
2. AYER fue ${fechaAyerDesc} (${fechaAyerIso}). PROHIBIDO decir que ayer fue otra fecha ni confundir hoy con ayer.
3. Si el usuario te pide "resumen de ayer", "qué hice ayer", "cómo me fue ayer" o "reporte de ayer", referite EXCLUSIVAMENTE a las cargas de AYER (${fechaAyerDesc}, ${fechaAyerIso}).
4. Si el usuario te pide "resumen de hoy" o "cómo vengo hoy", referite a las cargas de HOY (${fechaHoyDesc}, ${fechaHoyIso}).`;

  return {
    fechaHoyIso,
    fechaAyerIso,
    fechaHoyDesc,
    fechaAyerDesc,
    horaActualTexto,
    telemetriaPromptTexto,
  };
}

/**
 * Sincroniza y rescata cargas que puedan estar en los mensajes de Chat A (Bitácora de Cargas)
 * asegurando que no se pierda ningún reporte aunque se haya reabierto la sesión o limpiado el chat de consultas.
 */
export function sincronizarLogsConMensajesChatA(logs: DailyLog[], allMessages: Message[] = []): DailyLog[] {
  const merged: DailyLog[] = [...(logs || [])];
  const idsExistentes = new Set(merged.map((l) => l.id));

  // Buscar mensajes que sean reportes (del canal de cargas diarias o con desglose)
  const msgsConReporte = (allMessages || []).filter(
    (m) => m.conversationId === CONV_CARGA_DIARIA_ID || Boolean(m.desgloseReporte)
  );

  for (const m of msgsConReporte) {
    if (!m.desgloseReporte) continue;
    const rep = m.desgloseReporte;
    const fechaLog = getLocalTucumanIsoDate(m.createdAt);
    const horaLog = rep.horaRegistrada || getLocalTucumanTime(m.createdAt).horaExacta;

    // Verificar si ya existe un log en la misma fecha y hora
    const yaExiste = merged.some(
      (l) =>
        (l.dateKey === fechaLog && l.horaExacta === horaLog) ||
        l.id === `log-msg-${m.id}`
    );

    if (!yaExiste) {
      const nuevoLog: DailyLog = {
        id: `log-msg-${m.id}`,
        createdAt: m.createdAt,
        dateKey: fechaLog,
        horaExacta: horaLog,
        energy: rep.variableSaludEnergia?.score ?? rep.energia ?? 7,
        motivation: rep.variableAccion?.score ?? rep.productividad ?? 7,
        stress: rep.estresPresion ?? 4,
        moodScore: rep.variableAnimoEmociones?.score ?? rep.animo ?? 7,
        productivityScore: rep.variableAccion?.score ?? rep.productividad ?? 7,
        energiaMencionada: rep.seccionesInformadas?.saludEnergia ?? true,
        animoMencionado: rep.seccionesInformadas?.animoEmociones ?? true,
        accionMencionada: rep.seccionesInformadas?.accionTiempo ?? true,
        patronMencionado: rep.seccionesInformadas?.patronObservado ?? false,
        camposExtraidosReales: rep.camposExtraidosReales,
        enCondiciones: rep.variableSaludEnergia?.enCondiciones ?? true,
        desgasteAcumulado: rep.variableSaludEnergia?.desgasteDia,
        emocionesDetectadas: rep.variableAnimoEmociones?.emocionesDetectadas,
        manejoAutoimagen: rep.variableAnimoEmociones?.manejoAutoimagen,
        sensacionesPrimitivas: rep.variableAnimoEmociones?.sensacionesPrimitivas,
        estadosNegativos: rep.variableAnimoEmociones?.estadosNegativos,
        respuestaEstadoNegativo: rep.variableAnimoEmociones?.respuestaAnteNegativo,
        controloEmociones: rep.variableAnimoEmociones?.controloEmociones ?? "si",
        tiempoProductivoMin: rep.variableAccion?.tiempoProductivoMin ?? 0,
        tiempoDistraidoMin: rep.variableAccion?.tiempoDistraidoMin ?? 0,
        tiempoRegulacionMin: rep.variableAccion?.tiempoRegulacionMin ?? 0,
        actividadesDetalle: rep.variableAccion?.actividadesRealizadas,
        actividadesNegativasDistraccion: rep.variableAccion?.actividadesNegativasDistraccion,
        factoresContextuales: rep.patronesContexto?.factoresContextuales,
        patronContextoResumen: rep.patronesContexto?.patronDetectado,
        detonante: rep.friccionDetectada,
        metodoAplicado: rep.metodoAplicado,
        resultadoMetodo: rep.resultadoMetodo as any,
        actividadRealizada: rep.datosOperativos?.actividadRealizada,
        metasEspecificas: rep.metasEspecificas,
        compromisoHorario: rep.compromisoHorario,
        note: rep.resumenNota || m.text,
      };
      merged.push(nuevoLog);
      idsExistentes.add(nuevoLog.id);
    }
  }

  // Ordenar cronológicamente (más antiguo a más reciente)
  return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Compila el historial completo de cargas para el prompt:
 * 1. Cargas de AYER (con desglose completo de actividades, tiempos, energía, ánimo y métodos).
 * 2. Cargas de HOY (con desglose completo o indicando que la jornada recién empieza).
 * 3. Resumen de días previos.
 */
export function compilarHistorialCompletoCargas(
  logs: DailyLog[],
  allMessages: Message[] = []
): string {
  const todosLosLogs = sincronizarLogsConMensajesChatA(logs, allMessages);

  const hoyIso = getLocalTucumanIsoDate();
  const ayerDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const ayerIso = getLocalTucumanIsoDate(ayerDate);

  const hoyDesc = getLocalTucumanFullDescription();
  const ayerDesc = getLocalTucumanFullDescription(ayerDate);
  const { horaExacta } = getLocalTucumanTime();

  const logsHoy = todosLosLogs.filter((l) => (l.createdAt ? getLocalTucumanIsoDate(l.createdAt) : l.dateKey) === hoyIso);
  const logsAyer = todosLosLogs.filter((l) => (l.createdAt ? getLocalTucumanIsoDate(l.createdAt) : l.dateKey) === ayerIso);

  // Helper para formatear una lista de logs
  const formatearListaLogs = (items: DailyLog[]): string => {
    return items
      .map((l, idx) => {
        const hora = l.horaExacta || getLocalTucumanTime(l.createdAt).horaExacta;
        const partes: string[] = [];

        if (l.camposExtraidosReales && l.camposExtraidosReales.length > 0) {
          partes.push(l.camposExtraidosReales.map((c) => `${c.etiqueta}: ${c.valor}`).join(" | "));
        } else {
          if (l.actividadRealizada) partes.push(`Actividad: ${l.actividadRealizada}`);
          if (l.note && !l.actividadRealizada) partes.push(`Dato: ${l.note.slice(0, 100)}`);
          if (l.energiaMencionada !== false) partes.push(`Salud/Energía: ${l.energy}/10`);
          if (l.animoMencionado !== false && (l.moodScore || l.estadoPsicologicoEtiqueta)) {
            partes.push(`Ánimo: ${l.moodScore ?? l.energy}/10 (${l.estadoPsicologicoEtiqueta || "Estable"})`);
          }
          if (l.metodoAplicado && l.metodoAplicado !== "Ninguno registrado") {
            partes.push(`Método aplicado: ${l.metodoAplicado} (${l.resultadoMetodo || "exito"})`);
          }
        }

        if (typeof l.tiempoProductivoMin === "number" && l.tiempoProductivoMin > 0) {
          partes.push(`Tiempo productivo: ${l.tiempoProductivoMin} min`);
        }
        if (typeof l.tiempoDistraidoMin === "number" && l.tiempoDistraidoMin > 0) {
          partes.push(`Tiempo distraído: ${l.tiempoDistraidoMin} min`);
        }
        if (typeof l.tiempoRegulacionMin === "number" && l.tiempoRegulacionMin > 0) {
          partes.push(`Regulación: ${l.tiempoRegulacionMin} min`);
        }

        return `  ${idx + 1}. [${hora} hs] ${partes.join(" | ") || l.note}`;
      })
      .join("\n");
  };

  // Bloque AYER
  let bloqueAyer = "";
  if (logsAyer.length > 0) {
    const totalProdAyer = logsAyer.reduce((acc, l) => acc + (l.tiempoProductivoMin ?? 0), 0);
    const totalDistAyer = logsAyer.reduce((acc, l) => acc + (l.tiempoDistraidoMin ?? 0), 0);
    const totalRegAyer = logsAyer.reduce((acc, l) => acc + (l.tiempoRegulacionMin ?? 0), 0);
    bloqueAyer = `CARGAS REGISTRADAS DE AYER (${ayerDesc} · ISO: ${ayerIso}):
• Total de reportes cargados ayer: ${logsAyer.length}
• Tiempo productivo total acumulado ayer: ${totalProdAyer} min | Distraído: ${totalDistAyer} min | Regulación: ${totalRegAyer} min
DETALLE DE CARGAS DE AYER:
${formatearListaLogs(logsAyer)}
ESTADO: Juan SI reportó ayer durante el día (${logsAyer.length} cargas registradas). Si te pide "resumen de ayer", usá estos datos reales.`;
  } else {
    bloqueAyer = `CARGAS REGISTRADAS DE AYER (${ayerDesc} · ISO: ${ayerIso}):
• No se encontraron registros de cargas para el día de ayer (${ayerIso}).`;
  }

  // Bloque HOY
  let bloqueHoy = "";
  if (logsHoy.length > 0) {
    const totalProdHoy = logsHoy.reduce((acc, l) => acc + (l.tiempoProductivoMin ?? 0), 0);
    const totalDistHoy = logsHoy.reduce((acc, l) => acc + (l.tiempoDistraidoMin ?? 0), 0);
    const totalRegHoy = logsHoy.reduce((acc, l) => acc + (l.tiempoRegulacionMin ?? 0), 0);
    bloqueHoy = `CARGAS REGISTRADAS DE HOY (${hoyDesc} · Hora actual: ${horaExacta} hs · ISO: ${hoyIso}):
• Total de reportes cargados hoy: ${logsHoy.length}
• Tiempo productivo hoy: ${totalProdHoy} min | Distraído: ${totalDistHoy} min | Regulación: ${totalRegHoy} min
DETALLE DE CARGAS DE HOY:
${formatearListaLogs(logsHoy)}`;
  } else {
    bloqueHoy = `CARGAS REGISTRADAS DE HOY (${hoyDesc} · Hora actual: ${horaExacta} hs · ISO: ${hoyIso}):
• La jornada de hoy recién comienza (${horaExacta} hs); todavía no se han cargado reportes en el día de hoy. (NO considerar esto como silencio operativo ni como fallo).`;
  }

  return `${bloqueAyer}\n\n${bloqueHoy}`;
}

