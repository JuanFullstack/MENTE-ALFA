/**
 * @file src/lib/progressAuditor.ts
 * Motor de Objetivos (Crecimiento Psicológico vs Productivos),
 * Compactación de 0 a 15 Reportes Diarios y Rescate de Métodos Exitosos.
 */

import {
  DailyLog,
  ObjetivoEstructurado,
  CodigoRasgo,
  FranjaOperativa,
  EstadisticaFranjaHoraria,
  CasoExitoRescatado,
  AuditoriaComoVamos,
  Memory,
  Strategy,
  RamaTematica,
  TipoObjetivo,
} from "../types";

export interface PlantillaRasgoOficial {
  codigo: CodigoRasgo;
  titulo: string;
  tipo: TipoObjetivo;
  rama_id: RamaTematica;
  tags_mecanismo: string[];
  franjaCritica: FranjaOperativa;
  metaSugeridaSemanal: number;
  unidad: "dias" | "episodios_exitosos" | "bloques";
  decretoClave: string;
  protocoloPasos: string[];
  anclaRealExito: string;
}

export const PLANTILLAS_RASGOS_OFICIALES: Record<CodigoRasgo, PlantillaRasgoOficial> = {
  "PSI-1_autoconfianza": {
    codigo: "PSI-1_autoconfianza",
    titulo: "Autoconfianza y Valor Intrínseco en Entornos Sociales",
    tipo: "crecimiento_psicologico",
    rama_id: "vinculos",
    tags_mecanismo: ["#valor_intrinseco", "#busqueda_aprobacion"],
    franjaCritica: "23:00_cierre_o_social",
    metaSugeridaSemanal: 4,
    unidad: "episodios_exitosos",
    decretoClave: "Yo controlo cómo sentirme. Yo puedo cambiar ahora cómo siento las cosas. Si no cumplo los estándares de alguien, que se pudra.",
    protocoloPasos: [
      "Corregir de inmediato la postura: hombros erguidos y mirada firme sin esquivar miradas.",
      "Ejecutar respiración lenta y profunda para disipar tensión física.",
      "Repetir decretos de control interno y sonreír sin esperar ningún resultado.",
    ],
    anclaRealExito: "Entrada y pista del boliche: pasar de la incomodidad a postura erguida, observar en calma y afirmar presencia masculina sin buscar aprobación.",
  },
  "PSI-2_alma_libre": {
    codigo: "PSI-2_alma_libre",
    titulo: "Desinhibición y Espontaneidad ('Alma Libre')",
    tipo: "crecimiento_psicologico",
    rama_id: "vinculos",
    tags_mecanismo: ["#alma_libre", "#paralisis_perfeccionismo"],
    franjaCritica: "23:00_cierre_o_social",
    metaSugeridaSemanal: 3,
    unidad: "episodios_exitosos",
    decretoClave: "Actúo por instinto y diversión; el resultado final me da igual.",
    protocoloPasos: [
      "Regla de acción inmediata: avanzar antes de que aparezca la duda mental.",
      "Iniciar con una pregunta simple o comentario despreocupado sin intenciones ocultas.",
      "Sostener tono descarado pero relajado, cuerpo suelto y voz clara.",
    ],
    anclaRealExito: "Salidas en Santos a las 3 AM, noches en el bar Artur y salidas con Lucho besando a dos chicas en la misma noche fluyendo sin filtros.",
  },
  "PSI-3_humor_error": {
    codigo: "PSI-3_humor_error",
    titulo: "Humor y Ligereza ante el Error o Planes Frustrados",
    tipo: "crecimiento_psicologico",
    rama_id: "vinculos",
    tags_mecanismo: ["#humor_adaptativo", "#rigidez_perfeccionista"],
    franjaCritica: "23:00_cierre_o_social",
    metaSugeridaSemanal: 4,
    unidad: "episodios_exitosos",
    decretoClave: "Me río del tropiezo; un contratiempo es insignificante y no arruina mi estado.",
    protocoloPasos: [
      "Soltar la tensión dibujando una sonrisa sincera ante la falla o silencio.",
      "Reinterpretar el error o cambio de planes con sentido de diversión.",
      "Cortar la rumiación en el acto sin engancharse en culpa ni rol de víctima.",
    ],
    anclaRealExito: "Reírse cuando una charla en la barra no fluye o cuando un plan de sábado a la noche cambia a último momento, adaptándose en paz.",
  },
  "PSI-4_inmunidad_rechazo": {
    codigo: "PSI-4_inmunidad_rechazo",
    titulo: "Inmunidad al Rechazo y al Juicio Social",
    tipo: "crecimiento_psicologico",
    rama_id: "vinculos",
    tags_mecanismo: ["#inmunidad_rechazo", "#busqueda_aprobacion"],
    franjaCritica: "23:00_cierre_o_social",
    metaSugeridaSemanal: 4,
    unidad: "episodios_exitosos",
    decretoClave: "Mi valor es intocable; la desaprobación externa es biológicamente irrelevante.",
    protocoloPasos: [
      "Reconocer y descartar la búsqueda de aceptación como un impulso primitivo irrelevante.",
      "Enfocar la atención 100% en la seguridad proyectada y el estado interno.",
      "Mantener porte firme y voz clara sin intentar complacer a nadie.",
    ],
    anclaRealExito: "Barra del bar: hablar con firmeza con el dueño, encarar sin dudar al chico rubio de ojos azules y rechazar su invitación al departamento.",
  },
  "PSI-5_ideal_adaptado_leon": {
    codigo: "PSI-5_ideal_adaptado_leon",
    titulo: "Control Emocional ('León calmando su ira') e Ideal Adaptado",
    tipo: "crecimiento_psicologico",
    rama_id: "habitos",
    tags_mecanismo: ["#ideal_adaptado", "#control_ira_leon", "#sabiduria_retroceso"],
    franjaCritica: "13:00_transicion_siesta",
    metaSugeridaSemanal: 5,
    unidad: "episodios_exitosos",
    decretoClave: "Las cosas solo me afectan si yo les doy importancia; busco lo mejor dentro de la imperfección y sé cuándo retroceder.",
    protocoloPasos: [
      "Congelamiento táctico: frenar la respuesta impulsiva en el segundo exacto del enojo o imprevisto.",
      "Respirar lento 'como un león calmando su ira' para bajar las pulsaciones.",
      "Construir el Ideal Adaptado (elegir la mejor opción real dentro del escenario imperfecto) o aplicar Sabiduría de Retroceso con humildad.",
    ],
    anclaRealExito: "Caso Renán (frenar la ira agotado, respirar como león y pedir perdón con humildad) y Caso Ropa Sucia antes de reunión (elegir mejor prenda limpia con compostura).",
  },
  "PSI-6_gratitud_activa": {
    codigo: "PSI-6_gratitud_activa",
    titulo: "Gratitud Activa y Reencuadre de Convicción",
    tipo: "crecimiento_psicologico",
    rama_id: "habitos",
    tags_mecanismo: ["#gratitud_activa", "#fatiga_tarde"],
    franjaCritica: "09:00_bloque_manana",
    metaSugeridaSemanal: 6,
    unidad: "dias",
    decretoClave: "Tengo la oportunidad, la salud y las herramientas para construir una mejor versión de mí.",
    protocoloPasos: [
      "Detectar la queja o pesadez ante el estudio o entrenamiento.",
      "Reencuadrar el esfuerzo como un privilegio de crecimiento y no como un castigo.",
    ],
    anclaRealExito: "Disfrutar cada repetición física y cada bloque de ingeniería como inversión directa en libertad y poder personal.",
  },
  "PROD-1_arranque_645": {
    codigo: "PROD-1_arranque_645",
    titulo: "Arranque Matutino 6:45 AM + Agua Fría + Audio Horus",
    tipo: "productivo",
    rama_id: "habitos",
    tags_mecanismo: ["#arranque_645", "#inercia_sueno"],
    franjaCritica: "06:45_arranque",
    metaSugeridaSemanal: 6,
    unidad: "dias",
    decretoClave: "La falta de voluntad NO es una opción. Me levanto antes de contar hasta tres.",
    protocoloPasos: [
      "Mirar el celular a las 6:45 AM y ponerse de pie antes de contar hasta 3 (cero cama, cero redes).",
      "Marchar directo al baño sin evaluar cómo se siente el cuerpo.",
      "Bañarse con agua fría/despabilante para encender el flujo sanguíneo.",
      "Escuchar audio de mentalidad (12 min) o audio 'Horus' (10 min) preparando el entreno de las 7:30 AM.",
    ],
    anclaRealExito: "Corte mecánico del letargo matutino con agua fría y audio Horus para estar entrenando a las 7:30 AM.",
  },
  "PROD-2_entreno_730": {
    codigo: "PROD-2_entreno_730",
    titulo: "Entrenamiento Físico 7:30 AM con Mentalidad de Atleta",
    tipo: "productivo",
    rama_id: "habitos",
    tags_mecanismo: ["#entreno_poder", "#autoimagen_fisica"],
    franjaCritica: "07:30_entreno",
    metaSugeridaSemanal: 6,
    unidad: "dias",
    decretoClave: "Me río del cansancio y uso la incomodidad como combustible.",
    protocoloPasos: [
      "Colocarse auriculares con música energizante a las 7:30 AM.",
      "Calentamiento progresivo elevando pulso y temperatura corporal.",
      "Ejecutar series de abdominales, espalda y hombros sintiendo la contracción muscular.",
      "Finalizar frente al espejo registrando definición física y porte con ropa ajustada.",
    ],
    anclaRealExito: "Época entrenando todos los días con auriculares, levantando la barra y sintiendo el calor y la fuerza en espalda, hombros y abdominales.",
  },
  "PROD-3_estudio_ingenieria": {
    codigo: "PROD-3_estudio_ingenieria",
    titulo: "Bloque Estudio Ingeniería (5:00 PM a 11:00 PM) + Tolerancia a la Confusión",
    tipo: "productivo",
    rama_id: "proyectos",
    tags_mecanismo: ["#estudio_ingenieria", "#tolerancia_confusion", "#sobreestimulacion_digital"],
    franjaCritica: "17:00_estudio_ingenieria",
    metaSugeridaSemanal: 6,
    unidad: "bloques",
    decretoClave: "Es normal sentirse desorientado los primeros 15 minutos; esto es puramente mecánico.",
    protocoloPasos: [
      "Apagar TV y poner el celular en modo 'No Molestar' lejos de la vista (cero LOL, cero memes).",
      "Fraccionar el temario en bloques pequeños con temporizador.",
      "Sostener de forma continua los primeros 10 a 15 minutos aceptando la confusión inicial sin juzgar.",
      "Mirar 1 video explicativo en YouTube para entender el panorama general y pasar de inmediato a resolver solo.",
      "Cerrar jornada a las 11:00 PM para dormir habiendo avanzado hacia el título de ingeniero, inglés y portafolio.",
    ],
    anclaRealExito: "Promoción de Física 3 viviendo en lo de tu hermana: ir a todas las consultas con la profesora cuando nadie más iba y liquidar todos los prácticos.",
  },
  "PROD-4_dia_no_cero": {
    codigo: "PROD-4_dia_no_cero",
    titulo: "Combate a la Apatía y Criterio 'Día No Cero'",
    tipo: "productivo",
    rama_id: "proyectos",
    tags_mecanismo: ["#dia_no_cero", "#demonio_interno", "#efecto_que_carajo"],
    franjaCritica: "17:00_estudio_ingenieria",
    metaSugeridaSemanal: 7,
    unidad: "dias",
    decretoClave: "¿Si sabés que tenés el control, qué carajo estás haciendo? Sé que esto me costará, pero dejaré de hacerlo.",
    protocoloPasos: [
      "Detectar al demonio interno ('un video más', 'mañana empiezo') y confrontarlo con autoridad.",
      "Encender el enojo constructivo contra la mediocridad para polarizar la mente.",
      "Evocar las anclas de poder (Física 3, barra del bar, Lucho y Artur).",
      "Ponerse de pie y ejecutar de forma mecánica la acción mínima prioritaria para que el día jamás quede en cero.",
    ],
    anclaRealExito: "Romper la inercia desde la cama usando la bronca constructiva y la memoria de Física 3 para encender la PC sin dudar.",
  },
};

export function clasificarFranjaHoraria(isoDateStr?: string): {
  horaExacta: string;
  dateKey: string;
  franja: FranjaOperativa;
  labelFranja: string;
} {
  const d = isoDateStr ? new Date(isoDateStr) : new Date();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const horaExacta = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const dateKey = d.toISOString().split("T")[0];

  if (totalMinutes >= 6 * 60 + 30 && totalMinutes < 7 * 60 + 30) {
    return { horaExacta, dateKey, franja: "06:45_arranque", labelFranja: "06:45 AM · Arranque Matutino & Audio Horus" };
  }
  if (totalMinutes >= 7 * 60 + 30 && totalMinutes < 9 * 60) {
    return { horaExacta, dateKey, franja: "07:30_entreno", labelFranja: "07:30 AM · Entrenamiento Físico" };
  }
  if (totalMinutes >= 9 * 60 && totalMinutes < 13 * 60) {
    return { horaExacta, dateKey, franja: "09:00_bloque_manana", labelFranja: "09:00-13:00 · Bloque Cognitivo Matutino" };
  }
  if (totalMinutes >= 13 * 60 && totalMinutes < 17 * 60) {
    return { horaExacta, dateKey, franja: "13:00_transicion_siesta", labelFranja: "13:00-17:00 · Transición / Valle Vespertino" };
  }
  if (totalMinutes >= 17 * 60 && totalMinutes < 23 * 60) {
    return { horaExacta, dateKey, franja: "17:00_estudio_ingenieria", labelFranja: "17:00-23:00 · Bloque Estudio Ingeniería & Portafolio" };
  }
  return { horaExacta, dateKey, franja: "23:00_cierre_o_social", labelFranja: "23:00-06:30 · Cierre Nocturno (23h) / Social Fin de Semana" };
}

export function actualizarProgresoObjetivosConReporte(
  objetivos: ObjetivoEstructurado[],
  nuevoLog: DailyLog
): ObjetivoEstructurado[] {
  const { horaExacta, dateKey, franja } = clasificarFranjaHoraria(nuevoLog.createdAt);
  const prodScore = nuevoLog.productivityScore ?? nuevoLog.motivation ?? 5;
  const moodScore = nuevoLog.moodScore ?? nuevoLog.energy ?? 5;
  const fueExito =
    nuevoLog.resultadoMetodo === "exito" ||
    (!nuevoLog.huboObstaculo && (prodScore >= 7 || moodScore >= 7));

  return objetivos.map((obj) => {
    const coincidePorId = nuevoLog.objetivoId && nuevoLog.objetivoId === obj.id;
    const coincidePorRasgo = nuevoLog.rasgoCodigo && nuevoLog.rasgoCodigo === obj.rasgoCodigo;
    const coincidePorFranjaYTipo =
      !nuevoLog.objetivoId &&
      !nuevoLog.rasgoCodigo &&
      obj.franjaCritica === franja &&
      (!nuevoLog.tipoReporte || nuevoLog.tipoReporte === obj.tipo);

    if (!coincidePorId && !coincidePorRasgo && !coincidePorFranjaYTipo) {
      return obj;
    }

    const yaContabilizoHoy =
      obj.meta.unidad === "dias" &&
      obj.exitosRegistrados.some((e) => e.fecha === dateKey);

    const nuevoProgreso =
      fueExito && !yaContabilizoHoy
        ? Math.min(obj.meta.objetivoNumerico, obj.meta.progresoActual + 1)
        : obj.meta.progresoActual;

    const nuevosExitos =
      fueExito && (nuevoLog.metodoAplicado || nuevoLog.note)
        ? [
            {
              fecha: dateKey,
              hora: horaExacta,
              detonanteNegativo: nuevoLog.detonante || "Fricción o resistencia del bloque",
              metodoAplicado: nuevoLog.metodoAplicado || obj.protocoloPasos[0] || nuevoLog.note.slice(0, 80),
            },
            ...obj.exitosRegistrados,
          ].slice(0, 15)
        : obj.exitosRegistrados;

    const nuevosObstaculos =
      nuevoLog.huboObstaculo && nuevoLog.resultadoMetodo === "fallo"
        ? [
            {
              fecha: dateKey,
              hora: horaExacta,
              detonante: nuevoLog.detonante || nuevoLog.note.slice(0, 100),
            },
            ...obj.obstaculosRegistrados,
          ].slice(0, 15)
        : obj.obstaculosRegistrados;

    const ratio = nuevoProgreso / Math.max(1, obj.meta.objetivoNumerico);
    const estado: ObjetivoEstructurado["estado"] =
      ratio >= 1
        ? "completado"
        : nuevosObstaculos.length >= 3 && ratio < 0.5
        ? "en_riesgo"
        : "cumpliendo";

    return {
      ...obj,
      meta: {
        ...obj.meta,
        progresoActual: nuevoProgreso,
      },
      exitosRegistrados: nuevosExitos,
      obstaculosRegistrados: nuevosObstaculos,
      estado,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generarAuditoriaComoVamos(
  logs: DailyLog[],
  objetivos: ObjetivoEstructurado[],
  memories: Memory[] = [],
  strategies: Strategy[] = []
): AuditoriaComoVamos {
  const hoyIso = new Date().toISOString().split("T")[0];
  const hace7DiasMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const ultimos7DiasKeys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    ultimos7DiasKeys.push(d.toISOString().split("T")[0]);
  }

  const conteoPorDia = new Map<string, number>();
  ultimos7DiasKeys.forEach((k) => conteoPorDia.set(k, 0));

  const logsRecientes = (logs || []).filter((l) => new Date(l.createdAt).getTime() >= hace7DiasMs);
  for (const log of logsRecientes) {
    const { dateKey } = clasificarFranjaHoraria(log.createdAt);
    conteoPorDia.set(dateKey, (conteoPorDia.get(dateKey) || 0) + 1);
  }

  const reportesHoyCount = conteoPorDia.get(hoyIso) || 0;
  const diasSinReportesUltimos7d = ultimos7DiasKeys.filter((k) => (conteoPorDia.get(k) || 0) === 0);
  const promedioReportesPorDiaUltimos7d = Number((logsRecientes.length / 7).toFixed(1));

  const ordenFranjas: Array<{ franja: FranjaOperativa; label: string }> = [
    { franja: "06:45_arranque", label: "06:45 AM · Arranque & Audio Horus" },
    { franja: "07:30_entreno", label: "07:30 AM · Entrenamiento Físico" },
    { franja: "09:00_bloque_manana", label: "09:00-13:00 · Bloque Mañana" },
    { franja: "13:00_transicion_siesta", label: "13:00-17:00 · Siesta / Transición" },
    { franja: "17:00_estudio_ingenieria", label: "17:00-23:00 · Estudio Ingeniería" },
    { franja: "23:00_cierre_o_social", label: "23:00+ · Cierre 11 PM / Social" },
  ];

  const logsHoy = logsRecientes.filter((l) => clasificarFranjaHoraria(l.createdAt).dateKey === hoyIso);
  const franjasReportadasHoy = new Set(logsHoy.map((l) => l.franja || clasificarFranjaHoraria(l.createdAt).franja));
  const horaActual = new Date().getHours();
  const franjasCiegasHoy: string[] = [];
  if (horaActual >= 8 && !franjasReportadasHoy.has("06:45_arranque")) {
    franjasCiegasHoy.push("Sin reporte de Arranque 6:45 AM hoy");
  }
  if (horaActual >= 10 && !franjasReportadasHoy.has("07:30_entreno")) {
    franjasCiegasHoy.push("Sin reporte de Entrenamiento 7:30 AM hoy");
  }
  if (horaActual >= 19 && !franjasReportadasHoy.has("17:00_estudio_ingenieria")) {
    franjasCiegasHoy.push("Sin reporte del Bloque de Estudio 5:00 PM hoy");
  }

  const estadisticasPorFranja: EstadisticaFranjaHoraria[] = ordenFranjas.map(({ franja, label }) => {
    const grupo = logsRecientes.filter((l) => (l.franja || clasificarFranjaHoraria(l.createdAt).franja) === franja);
    if (grupo.length === 0) {
      return {
        franja,
        label,
        cantidadReportes: 0,
        promedioAnimo: 0,
        promedioProductividad: 0,
        promedioEnergia: 0,
        tasaExitoMetodos: 0,
        obstaculoFrecuente: "Sin reportes en esta franja (Punto ciego)",
      };
    }

    const avgAnimo = Math.round(
      (grupo.reduce((acc, g) => acc + (g.moodScore ?? g.motivation ?? 6), 0) / grupo.length) * 10
    ) / 10;
    const avgProd = Math.round(
      (grupo.reduce((acc, g) => acc + (g.productivityScore ?? g.motivation ?? 6), 0) / grupo.length) * 10
    ) / 10;
    const avgEnergy = Math.round(
      (grupo.reduce((acc, g) => acc + (g.energy ?? 6), 0) / grupo.length) * 10
    ) / 10;

    const conMetodo = grupo.filter((g) => g.resultadoMetodo);
    const exitosos = conMetodo.filter((g) => g.resultadoMetodo === "exito").length;
    const tasaExito = conMetodo.length > 0 ? Math.round((exitosos / conMetodo.length) * 100) : 80;

    const fallos = grupo.filter((g) => g.huboObstaculo || g.stress >= 7 || avgProd <= 4);
    const obstaculoFrecuente =
      fallos[0]?.detonante ||
      fallos[0]?.note?.slice(0, 70) ||
      "Estable sin bloqueos críticos";

    return {
      franja,
      label,
      cantidadReportes: grupo.length,
      promedioAnimo: avgAnimo,
      promedioProductividad: avgProd,
      promedioEnergia: avgEnergy,
      tasaExitoMetodos: tasaExito,
      obstaculoFrecuente,
    };
  });

  const psicologicos = objetivos.filter((o) => o.tipo === "crecimiento_psicologico");
  const productivos = objetivos.filter((o) => o.tipo === "productivo");
  const porcentajeGlobalCumplimiento =
    objetivos.length > 0
      ? Math.round(
          (objetivos.reduce(
            (acc, o) => acc + Math.min(1, o.meta.progresoActual / Math.max(1, o.meta.objetivoNumerico)),
            0
          ) /
            objetivos.length) *
            100
        )
      : 0;

  const principalesFallosSemana: string[] = [];
  objetivos.forEach((o) => {
    if (o.obstaculosRegistrados.length > 0) {
      const ult = o.obstaculosRegistrados[0];
      principalesFallosSemana.push(`[${o.titulo}] (${ult.hora} hs): ${ult.detonante}`);
    }
  });
  if (diasSinReportesUltimos7d.length > 0) {
    principalesFallosSemana.push(
      `Días con 0 reportes (${diasSinReportesUltimos7d.length} de 7 días): silencio operativo que suele encubrir permitidos o desconexión.`
    );
  }

  const casosExitoParaValorar: CasoExitoRescatado[] = [];

  logsRecientes
    .filter((l) => l.resultadoMetodo === "exito" && (l.metodoAplicado || l.detonante))
    .slice(0, 4)
    .forEach((l) => {
      const infoHora = clasificarFranjaHoraria(l.createdAt);
      casosExitoParaValorar.push({
        idOrigen: l.id,
        fecha: infoHora.dateKey,
        hora: infoHora.horaExacta,
        rasgoOEtiqueta: l.rasgoCodigo || infoHora.franja,
        experienciaNegativa: l.detonante || `Estado difícil reportado (${l.note.slice(0, 60)})`,
        metodoAplicado: l.metodoAplicado || "Ejecución mecánica de protocolo",
        tasaExitoHistorica: 90,
      });
    });

  (memories || [])
    .filter((m) => m.fichaInmutable && m.fichaInmutable.resultado === "exito")
    .slice(0, 4)
    .forEach((m) => {
      const f = m.fichaInmutable!;
      casosExitoParaValorar.push({
        idOrigen: f.id,
        fecha: f.fecha,
        hora: f.contexto_situacional.momento,
        rasgoOEtiqueta: f.tags_mecanismo.join(", "),
        experienciaNegativa: `${f.detonante_exacto} (Reacción inicial: ${f.reaccion_inicial})`,
        metodoAplicado: f.solucion_aplicada,
        tasaExitoHistorica: 95,
      });
    });

  (strategies || [])
    .filter((s) => s.resultType === "positivo")
    .slice(0, 2)
    .forEach((s) => {
      casosExitoParaValorar.push({
        idOrigen: s.id,
        fecha: s.createdAt.split("T")[0],
        hora: "Histórico consolidado",
        rasgoOEtiqueta: (s.tags_mecanismo || []).join(", ") || s.rama_id || "general",
        experienciaNegativa: s.situation,
        metodoAplicado: `${s.name} -> ${s.result}`,
        tasaExitoHistorica: s.effectiveness === "alta" ? 95 : 75,
      });
    });

  return {
    fechaGeneracion: new Date().toISOString(),
    reportesHoyCount,
    promedioReportesPorDiaUltimos7d,
    diasSinReportesUltimos7d,
    franjasCiegasHoy,
    estadisticasPorFranja,
    resumenObjetivos: {
      psicologicos,
      productivos,
      porcentajeGlobalCumplimiento,
    },
    principalesFallosSemana,
    casosExitoParaValorar: casosExitoParaValorar.slice(0, 6),
  };
}

export function formatearAuditoriaParaPrompt(aud: AuditoriaComoVamos): string {
  const lineasObjPsi = aud.resumenObjetivos.psicologicos
    .map((o) => `  • [PSICOLÓGICO · ${o.periodo.toUpperCase()}] ${o.titulo}: ${o.meta.progresoActual}/${o.meta.objetivoNumerico} ${o.meta.unidad} (${o.estado.toUpperCase()})`)
    .join("\n");

  const lineasObjProd = aud.resumenObjetivos.productivos
    .map((o) => `  • [PRODUCTIVO · ${o.periodo.toUpperCase()}] ${o.titulo}: ${o.meta.progresoActual}/${o.meta.objetivoNumerico} ${o.meta.unidad} (${o.estado.toUpperCase()})`)
    .join("\n");

  const lineasFranjas = aud.estadisticasPorFranja
    .map((f) =>
      f.cantidadReportes > 0
        ? `  • ${f.label}: ${f.cantidadReportes} rep. | Ánimo: ${f.promedioAnimo}/10 | Prod: ${f.promedioProductividad}/10 | Éxito métodos: ${f.tasaExitoMetodos}% | Fricción: ${f.obstaculoFrecuente}`
        : `  • ${f.label}: 0 reportes (PUNTO CIEGO HORARIO)`
    )
    .join("\n");

  const lineasExitos = aud.casosExitoParaValorar
    .slice(0, 4)
    .map(
      (c) =>
        `  • [${c.idOrigen} | ${c.hora}] Ante situación negativa: "${c.experienciaNegativa}" -> MÉTODO QUE DIO ÉXITO (${c.tasaExitoHistorica}% efectividad): "${c.metodoAplicado}"`
    )
    .join("\n");

  return `AUDITORÍA EN VIVO DE OBJETIVOS, HORARIOS Y REPORTES (ESCALA 0-15 DIARIOS):
- Reportes emitidos hoy: ${aud.reportesHoyCount}/15 | Promedio últimos 7 días: ${aud.promedioReportesPorDiaUltimos7d} rep/día.
- Días con 0 reportes (últimos 7 días): ${aud.diasSinReportesUltimos7d.length > 0 ? aud.diasSinReportesUltimos7d.join(", ") : "Ninguno (constancia perfecta)"}.
- Alertas de horario hoy: ${aud.franjasCiegasHoy.length > 0 ? aud.franjasCiegasHoy.join(" | ") : "Todas las franjas hasta la hora actual cubiertas"}.
- Cumplimiento Global de Objetivos: ${aud.resumenObjetivos.porcentajeGlobalCumplimiento}%

OBJETIVOS DE CRECIMIENTO (PSICOLÓGICOS):
${lineasObjPsi || "  • Sin objetivos psicológicos cargados."}

OBJETIVOS PRODUCTIVOS (DISCIPLINA OPERATIVA):
${lineasObjProd || "  • Sin objetivos productivos cargados."}

EVALUACIÓN POR FRANJA HORARIA DE LOS REPORTES:
${lineasFranjas}

PRINCIPALES OBSTÁCULOS Y FALLOS REPETIDOS:
${aud.principalesFallosSemana.length > 0 ? aud.principalesFallosSemana.map((f) => `  • ${f}`).join("\n") : "  • Sin fallos críticos registrados esta semana."}

EXPERIENCIAS NEGATIVAS SUPERADAS CON ÉXITO Y MÉTODO VALORADO:
${lineasExitos || "  • Sin casos registrados aún."}`;
}
