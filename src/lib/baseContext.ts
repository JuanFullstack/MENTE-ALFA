/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RamaTematica,
  FichaVivenciaInmutable,
  Memory,
  Message,
  Conversation,
  Strategy,
  Decision,
  CurrentState,
  TacticalAnalysisBlock,
} from "../types";

export const RAW_BASE_CONTEXT = `## Perfil General
* **Nombre:** Juan Francisco Cano
* **Edad:** 42 años | **Ubicación:** San Miguel de Tucumán, Argentina.
* **Mascota:** Perra lexa

## Ámbito Académico y Profesional
* **Formación:** Estudiante de 5to año de Ingeniería en Informática.
* **Tesis de Grado:** Impacto de IA generativa en arquitectura, mantenibilidad y seguridad en metodologías clásicas de software (GitFlow). Mentores: Esteban Saborido, Javier Graña, Jorge Habib Namour.
* **Proyectos:** Sistema de Gestión de Socios para Cooperadora FACET (con Sergio Ricardo Gor).
* **Franja de Productividad:** 07:00 a 12:00 (5 horas). Balance de energía manejado de forma manual e independiente de emociones.

## Perfil Técnico y Herramientas
* **Stack:** React, Python, C++, SQL (pgAdmin4), Firebase Firestore, GitHub, Vercel, Espanso, Google Antigravity.

## Hábitos, Intereses y Preferencias IA
* **Inglés:** Práctico, patrones y escucha activa.
* **Interacción IA:** Español estricto, sin citas a fuentes, directo al grano, sin preguntas vacías de cierre, precisión absoluta en variables y algoritmos.

## Protocolos y Métodos del Neuro-Mentor

### 1. Rol y Tono del Neuro-Mentor
* **Tono:** Frío, analítico, persuasivo, desafiante, marcial y empático-pedagógico. Argumentos sólidos basados en biología y lógica, cero positivismo barato.
* **Sintaxis:** Positiva y en presente inmediato.
* **Enfoque No-Moral:** Tratar la apatía, el cansancio y la resistencia como desbalances biológicos (dopamina/glutamato, valle circadiano o alarma de la amígdala), aplicando protocolos mecánicos con sentido común.

### 2. Protocolo de Reseteo Bioenergético y Baja Energía (PRIORIDAD #1)
* **Principio:** Si hay fatiga real, baja energía o dispersión (ej. franja post-almuerzo >13:00), FORZAR LA MÁQUINA CON "DEBO HACERLO" O MICRO-ACCIONES INMEDIATAS ES UN ERROR que genera rechazo biológico.
* **Herramienta Prioritaria #1 (DETENER TODO):** Meditación, silencio mental y desconexión total sin pantallas.
  - **5 minutos:** Pausa consciente y reseteo atencional rápido.
  - **12 minutos:** Meditación de enfoque y recuperación prefrontal.
  - **30 minutos:** Reseteo profundo / NSDR para drenar glutamato y calmar amígdala.
  - **60 minutos:** Desconexión y restauración total de energía basal.
* **Regla de Distracción:** Si la mente está dispersa o sobreestimulada, DETENER TODO de inmediato antes de intentar cualquier tarea.

### 3. Protocolo Post-Meditación (Método Yo Robot)
* **Uso exclusivo POST-MEDITACIÓN:** Solo una vez recuperado el estado basal en calma, se evalúa la acción:
  - **Opción A (Arrancar sin fricción):** Modo Yo Robot (5-4-3-2-1 -> micro-meta de 15 segundos / fricción cero) para romper la inercia sin sobre-pensar.
  - **Opción B (Reprogramación estratégica):** Si el valle circadiano persiste, trasladar la alta demanda cognitiva a la Franja Dorada matutina (07:00 a 12:00) y dejar la tarde para tareas mecánicas, caminata o descanso sin culpa.

### 4. Gestión de Energía y Hábitos
* **Franja Dorada de Productividad:** 07:00 a 12:00 (5 horas protegidas para tesis y tareas complejas).
* **Regla 52/17:** 52 min de enfoque profundo + 17 min de desconexión sin pantallas para consolidación hipocampal.
* **Hidratación:** 2 vasos de agua por cada taza de café.
* **Política de Día No Cero:** En días difíciles, mantener al menos 3 min de estiramiento y una micro-acción para proteger la identidad disciplinada.

### 5. Desinhibición Social y Estado B (Grado de Libertad)
* **Grado de Libertad ("Da igual / No Importa"):** Aceptar que el valor personal no depende de la respuesta ajena y actuar con autenticidad y humor adaptativo.

### 6. Método Pregunta-Respuesta (Transición al Flujo)
* Subdividir temas de simple a complejo para despertar curiosidad biológica y anclar el estado de flujo.`;

/**
 * FASE 2: ÁRBOL DE RAMAS AISLADAS
 * Cuando el usuario consulta sobre un tema, las ramas no relacionadas se desconectan
 * por completo para evitar saturación de contexto y dilución de atención.
 */
export const GUIAS_BASE_POR_RAMA: Record<RamaTematica, string> = {
  proyectos: `RAMA ACTIVA: PROYECTOS / CÓDIGO / INGENIERÍA (Juan Francisco Cano, Tucumán)
- Focos activos: Tesis de Grado (Impacto de IA generativa en GitFlow; mentores Saborido, Graña, Namour) y Sistema Cooperadora FACET (junto a Sergio Ricardo Gor). Stack: React, TypeScript, Python, C++, SQL/pgAdmin4, PocketBase, Vercel.
- Regla 1 (Franja Dorada): La alta carga cognitiva (arquitectura, redacción de tesis, debugging complejo) se ejecuta estrictamente de 07:00 a 12:00 en bloques 52/17 sin pantallas en el descanso.
- Regla 2 (Fricción por Ambigüedad o Volumen): Ante temas nuevos o requerimientos extensos que disparen parálisis o apertura de pestañas secundarias, aplicar el Método Pregunta-Respuesta: dividir el problema en una única pregunta técnica simple resolvible en 15 minutos.
- Regla 3 (Duda vs Acción): La duda técnica solo se permite en el diseño; una vez definido el micro-paso, se codifica en modo Yo Robot (fricción cero: abrir archivo y escribir la primera función en 30 segundos).`,

  vinculos: `RAMA ACTIVA: VÍNCULOS / INTERACCIÓN SOCIAL / COMUNICACIÓN (Juan Francisco Cano)
- Principio Rector (Grado de Libertad - "Da igual / No importa"): El valor personal es objetivo e independiente de la validación o respuesta externa. Condicionar el estado propio a la reacción ajena activa inseguridad primitiva.
- Protocolo de Transición Social (15 min): 1) Aislación mental de 5 min (cortar rumiación) -> 2) Depuración ("¿por qué gastar energía si da igual?") -> 3) Aceptación con humor adaptativo y descaro -> 4) Acción espontánea sin guion rígido.
- Exposición y Comunicación (Videos/Reuniones): Contra el perfeccionismo escénico, aplicar micro-exposiciones de 2 minutos en crudo sin editar y distanciamiento en 3ra persona ("Juan está experimentando activación normal antes de hablar").`,

  habitos: `RAMA ACTIVA: HÁBITOS / BIOENERGÍA / REGULACIÓN (Juan Francisco Cano)
- Protocolo Bioenergético Prioritario #1 (Baja Energía / Tarde >13:00 / Dispersión): PROHIBIDO forzar con "debo hacerlo" o mandar directo a producir cuando hay agotamiento de glucosa prefrontal o exceso de glutamato.
- Paso 1 Obligatorio ante Dispersión o Fatiga: DETENER TODO (cero pantallas) y aplicar reseteo según nivel: 5 min (reseteo atencional), 12 min (recuperación prefrontal), 30 min (NSDR profundo) o 60 min (restauración basal).
- Paso 2 Post-Meditación: Recién tras recuperar calma basal, elegir Opción A (Modo Yo Robot 5-4-3-2-1: micro-acción de 15–30 segundos) u Opción B (si es valle vespertino >13:00, mover lo analítico a mañana 07:00–12:00 y pasar a caminata o tarea mecánica sin culpa).
- Criterio Día No Cero (Contra el Efecto "Qué Carajo"): En días críticos, proteger la identidad con la Tríada Mínima: 3 min de estiramiento junto a la silla + 1 línea de avance de 30s + perdón radical al Yo Pasado.`,
};

/**
 * Catálogo de etiquetas transversales de mecanismo psicológico/conductual.
 * Permite conectar vivencias entre ramas distintas cuando la raíz dinámica es idéntica.
 */
export const CATALOGO_TAGS_MECANISMO: Array<{ tag: string; keywords: string[] }> = [
  {
    tag: "#paralisis_perfeccionismo",
    keywords: ["perfeccion", "perfeccionismo", "no se por donde", "abrumado", "mucho", "complejo", "grande", "empezar", "arrancar", "bloqueo", "paralisis"],
  },
  {
    tag: "#fatiga_tarde",
    keywords: ["tarde", "almuerzo", "13:", "14:", "15:", "16:", "17:", "cansado", "fatiga", "sueño", "pesadez", "energia baja", "sin ganas", "agotado"],
  },
  {
    tag: "#ambiguedad_externa",
    keywords: ["ambiguo", "no queda claro", "esperando", "correccion", "mentor", "cliente", "requerimiento", "incertidumbre", "duda"],
  },
  {
    tag: "#busqueda_aprobacion",
    keywords: ["rechazo", "que diran", "aprobacion", "validacion", "timidez", "vergüenza", "quedar mal", "tonto", "mirada", "atractivo", "social"],
  },
  {
    tag: "#ansiedad_examen",
    keywords: ["examen", "tesis", "entrega", "plazo", "fecha limite", "presion", "rendir", "defensa", "miedo a fallar"],
  },
  {
    tag: "#efecto_que_carajo",
    keywords: ["perdi el dia", "ya fue", "culpa", "arruine", "todo o nada", "abandone", "rompi la racha", "frustracion"],
  },
  {
    tag: "#sobreestimulacion_digital",
    keywords: ["pestañas", "celular", "redes", "youtube", "disperso", "distraido", "multitarea", "pantallas", "ruido mental"],
  },
];

/**
 * Detecta la rama temática principal y las etiquetas transversales de mecanismo
 * a partir del mensaje actual del usuario y el contexto inmediato.
 */
export function detectarRamaYTags(
  textoUsuario: string,
  historialReciente: Array<{ sender?: string; role?: string; text?: string; content?: string }> = []
): { rama: RamaTematica; tags: string[] } {
  const ultimoTexto = (textoUsuario || "").toLowerCase();
  const contextoCombinado = [
    ultimoTexto,
    ...historialReciente.slice(-2).map((m) => (m.text || m.content || "").toLowerCase()),
  ].join(" ");

  const scoreRamas: Record<RamaTematica, number> = {
    proyectos: 0,
    vinculos: 0,
    habitos: 0,
  };

  const kwProyectos = [
    "tesis", "gitflow", "codigo", "programar", "facet", "cooperadora", "react", "sql",
    "pgadmin", "pocketbase", "arquitectura", "bug", "funcion", "endpoint", "estudio",
    "ingenieria", "materia", "examen", "saborido", "graña", "namour", "sergio", "proyecto",
    "api", "prompt", "groq", "repositorio", "github", "vercel",
  ];
  const kwVinculos = [
    "gente", "social", "hablar", "persona", "mujer", "chica", "amigo", "pareja",
    "familia", "conversacion", "rechazo", "aprobacion", "timidez", "carisma", "humor",
    "espontaneo", "da igual", "video", "camara", "exposicion", "reunion", "vinculo", "relacion",
  ];
  const kwHabitos = [
    "energia", "cansado", "fatiga", "dormir", "sueño", "meditar", "meditacion", "nsdr",
    "rutina", "mañana", "tarde", "entrenar", "gimnasio", "estiramiento", "agua", "cafe",
    "dia no cero", "procrastinar", "disperso", "foco", "habito", "ansiedad", "estres", "52/17",
  ];

  for (const kw of kwProyectos) {
    if (ultimoTexto.includes(kw)) scoreRamas.proyectos += 3;
    else if (contextoCombinado.includes(kw)) scoreRamas.proyectos += 1;
  }
  for (const kw of kwVinculos) {
    if (ultimoTexto.includes(kw)) scoreRamas.vinculos += 3;
    else if (contextoCombinado.includes(kw)) scoreRamas.vinculos += 1;
  }
  for (const kw of kwHabitos) {
    if (ultimoTexto.includes(kw)) scoreRamas.habitos += 3;
    else if (contextoCombinado.includes(kw)) scoreRamas.habitos += 1;
  }

  let rama: RamaTematica = "habitos";
  if (scoreRamas.proyectos >= scoreRamas.vinculos && scoreRamas.proyectos >= scoreRamas.habitos && scoreRamas.proyectos > 0) {
    rama = "proyectos";
  } else if (scoreRamas.vinculos >= scoreRamas.proyectos && scoreRamas.vinculos >= scoreRamas.habitos && scoreRamas.vinculos > 0) {
    rama = "vinculos";
  } else if (scoreRamas.habitos > 0) {
    rama = "habitos";
  } else {
    rama = "proyectos";
  }

  const tagsDetectados: string[] = [];
  for (const item of CATALOGO_TAGS_MECANISMO) {
    if (item.keywords.some((kw) => contextoCombinado.includes(kw))) {
      tagsDetectados.push(item.tag);
    }
  }

  if (tagsDetectados.length === 0) {
    if (rama === "proyectos") tagsDetectados.push("#paralisis_perfeccionismo");
    else if (rama === "vinculos") tagsDetectados.push("#busqueda_aprobacion");
    else tagsDetectados.push("#fatiga_tarde");
  }

  return { rama, tags: tagsDetectados };
}

/**
 * Convierte cualquier registro `Memory` legado en una `FichaVivenciaInmutable`
 * estructurada sin destruir sus datos originales.
 */
export function asegurarFichaInmutable(mem: Memory, index = 1): FichaVivenciaInmutable {
  if (mem.fichaInmutable && mem.fichaInmutable.detonante_exacto) {
    return {
      ...mem.fichaInmutable,
      inmutable: true,
    };
  }

  // Intentar parsear si summary contiene JSON de FichaVivenciaInmutable
  if (mem.summary && mem.summary.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(mem.summary);
      if (parsed && parsed.detonante_exacto && parsed.rama_id) {
        return { ...parsed, inmutable: true };
      }
    } catch {
      // Continuar con conversión determinista
    }
  }

  const fechaIso = (mem.createdAt || new Date().toISOString()).split("T")[0];
  const { rama, tags } = detectarRamaYTags(`${mem.category || ""} ${mem.text || ""}`);
  const ramaFinal: RamaTematica =
    mem.rama_id ||
    (mem.category === "proyectos" || mem.category === "vinculos" || mem.category === "habitos"
      ? (mem.category as RamaTematica)
      : rama);

  const tagsFinales = mem.tags_mecanismo && mem.tags_mecanismo.length > 0 ? mem.tags_mecanismo : tags;

  return {
    id: mem.id.startsWith("VIV-") ? mem.id : `VIV-${fechaIso}-${String(index).padStart(2, "0")}`,
    fecha: fechaIso,
    rama_id: ramaFinal,
    tags_mecanismo: tagsFinales,
    contexto_situacional: {
      momento: mem.text.includes("07:00") || mem.text.includes("mañana")
        ? "Franja Matutina (07:00-12:00)"
        : mem.text.includes("tarde") || mem.text.includes("16:00")
        ? "Franja Vespertina (>13:00)"
        : "Entorno habitual de trabajo/estudio",
      nivel_energia: mem.text.toLowerCase().includes("fatiga") || mem.text.toLowerCase().includes("cansad") ? "bajo" : "alto",
      factores_externos: "Registrado en base de conocimiento personal",
    },
    detonante_exacto: (mem.summary || mem.text).slice(0, 140),
    reaccion_inicial: "Tendencia a dispersión o fricción de inicio si no se acota el foco",
    solucion_aplicada: mem.text.slice(0, 180),
    resultado: "exito",
    inmutable: true,
  };
}

/**
 * FASE 2 & FASE 4: PODA PREVIA A LA INFERENCIA
 * Filtra y devuelve únicamente entre 3 y 5 Fichas Inmutables relevantes:
 * - Prioriza coincidencias por `tags_mecanismo` (incluso de OTRAS ramas, habilitando analogías transversales).
 * - Prioriza coincidencias de la misma `rama_id` y aquellas con `resultado === "exito"`.
 */
export function podarFichasParaInferencia(
  memories: Memory[],
  strategies: Strategy[],
  ramaActiva: RamaTematica,
  tagsConsulta: string[],
  maxFichas = 5
): FichaVivenciaInmutable[] {
  const fichasMems = (memories || []).map((m, idx) => asegurarFichaInmutable(m, idx + 1));

  // Incorporar estrategias probadas/descartadas como fichas operativas si hacen falta
  const fichasStrats: FichaVivenciaInmutable[] = (strategies || []).map((s, idx) => {
    const { rama, tags } = detectarRamaYTags(`${s.name} ${s.situation} ${s.result}`);
    const fechaIso = (s.createdAt || new Date().toISOString()).split("T")[0];
    return {
      id: s.id.startsWith("VIV-") ? s.id : `VIV-STRAT-${String(idx + 1).padStart(2, "0")}`,
      fecha: fechaIso,
      rama_id: s.rama_id || rama,
      tags_mecanismo: s.tags_mecanismo && s.tags_mecanismo.length > 0 ? s.tags_mecanismo : tags,
      contexto_situacional: {
        momento: s.situation,
        nivel_energia: s.resultType === "positivo" ? "alto" : "bajo",
        factores_externos: s.reason || "Evaluación empírica previa",
      },
      detonante_exacto: s.situation,
      reaccion_inicial: s.resultType === "negativo" ? s.name : "Fricción operativa ante la tarea",
      solucion_aplicada: `${s.name} -> ${s.result}`,
      resultado: s.resultType === "positivo" ? "exito" : "fallo",
      inmutable: true,
    };
  });

  const todasLasFichas = [...fichasMems, ...fichasStrats];

  const puntuadas = todasLasFichas.map((ficha) => {
    let score = 0;
    const tagsComunes = ficha.tags_mecanismo.filter((t) => tagsConsulta.includes(t));
    // Analogía transversal por mecanismo compartido (resuelve Falla #2 de literalidad)
    score += tagsComunes.length * 4;
    // Coincidencia de rama temática
    if (ficha.rama_id === ramaActiva) score += 3;
    // Priorizar soluciones probadas con éxito o fallos claros documentados
    if (ficha.resultado === "exito") score += 2;
    return { ficha, score, esAnalogiaTransversal: ficha.rama_id !== ramaActiva && tagsComunes.length > 0 };
  });

  puntuadas.sort((a, b) => b.score - a.score);

  return puntuadas.slice(0, maxFichas).map((p) => p.ficha);
}

/**
 * Formatea las 3 a 5 fichas inmutables seleccionadas en formato ultracompacto (~60-90 tokens por ficha).
 */
export function formatearFichasInmutablesCompactas(
  fichas: FichaVivenciaInmutable[],
  ramaActiva: RamaTematica
): string {
  if (!fichas || fichas.length === 0) {
    return "Sin fichas previas asociadas.";
  }

  return fichas
    .map((f) => {
      const tipoCruce = f.rama_id === ramaActiva ? `RAMA:${f.rama_id}` : `ANALOGÍA_TRANSVERSAL_DESDE:${f.rama_id}`;
      return `[${f.id} | ${tipoCruce} | Tags: ${f.tags_mecanismo.join(", ")}]
  • Contexto: ${f.contexto_situacional.momento} (Energía: ${f.contexto_situacional.nivel_energia} | Entorno: ${f.contexto_situacional.factores_externos})
  • Detonante: ${f.detonante_exacto}
  • Sesgo/Reacción: ${f.reaccion_inicial}
  • Acción de Quiebre: ${f.solucion_aplicada} -> Resultado: ${f.resultado.toUpperCase()}`;
    })
    .join("\n\n");
}

/**
 * Construye el estado del Hilo Activo (últimas 3 a 5 interacciones y decisiones en prueba)
 * sin truncar destructivamente ni mezclar ramas ajenas.
 */
export function construirHiloActivoTexto(
  messages: Array<{ sender?: string; role?: string; text?: string; content?: string }>,
  decisions: Decision[] = [],
  currentState?: CurrentState | null,
  ramaActiva?: RamaTematica
): string {
  const ultimos = (messages || []).slice(-5);
  const historialLineas = ultimos
    .map((m) => {
      const rol = m.sender === "user" || m.role === "user" ? "Usuario" : "Asesor";
      const txt = (m.text || m.content || "").replace(/\s+/g, " ").trim();
      return `- [${rol}]: ${txt.slice(0, 280)}`;
    })
    .join("\n");

  const decisionesActivas = (decisions || [])
    .filter((d) => d.status !== "descartada")
    .slice(0, 3)
    .map((d) => `[Acuerdo ${d.status}]: ${d.decision} (${d.reason})`)
    .join(" | ");

  const bloqueosAbiertos = (currentState?.openProblems || []).slice(0, 2).join(" | ");

  return [
    `Rama activa detectada: ${ramaActiva?.toUpperCase() || "GENERAL"}`,
    decisionesActivas ? `Acuerdos vigentes (no repetir ni contradecir): ${decisionesActivas}` : "",
    bloqueosAbiertos ? `Bloqueos abiertos: ${bloqueosAbiertos}` : "",
    historialLineas ? `Últimas interacciones del hilo:\n${historialLineas}` : "Inicio de hilo nuevo.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * FASE 3: PROMPT DE INFERENCIA FINAL REPARADO
 * Integra la poda de ramas, la memoria del hilo activo y el bloqueo contrastivo anti-genérico.
 */
export function buildRepairedSystemPrompt(params: {
  ramaActiva: RamaTematica;
  tagsDetectados: string[];
  hiloRecienteTexto: string;
  fichasCompactasTexto: string;
}): string {
  const guiaRama = GUIAS_BASE_POR_RAMA[params.ramaActiva] || GUIAS_BASE_POR_RAMA.proyectos;

  return `Eres un motor de análisis conductual y asesor táctico personal de Juan Francisco Cano. Tienes prohibido dar respuestas genéricas o de manual.

<guia_base_rama>
${guiaRama}
Etiquetas de mecanismo activadas en esta consulta: ${params.tagsDetectados.join(", ")}
</guia_base_rama>

<hilo_reciente>
${params.hiloRecienteTexto}
</hilo_reciente>

<fichas_vivencias_asociadas>
${params.fichasCompactasTexto}
</fichas_vivencias_asociadas>

DIRECTIVAS OPERATIVAS:
1. CONTINUIDAD: Evalúa el <hilo_reciente>. No propongas acciones que ya fueron intentadas o descartadas en los últimos intercambios.
2. FILTRO DE DESCARTE (ANTI-GENÉRICO): Identifica el cliché típico de autoayuda o gestión que cualquier IA daría a esta consulta ("organiza tu tiempo", "prioriza tareas", "respira hondo", "comunícate asertivamente") y descártalo explícitamente en el análisis.
3. TRAZABILIDAD Y ANALOGÍA: Tu recomendación debe sustentarse exclusivamente en la solución probada de las <fichas_vivencias_asociadas> (citando su ID, ej. [VIV-...], incluso si proviene de otra rama por analogía de mecanismo) o en la <guia_base_rama>.
4. TONO Y SINTAXIS: Español directo (voseo rioplatense conciso), frío, quirúrgico y basado en neurobiología/mecánica conductual. Cero saludos cordiales, cero relleno y cero preguntas vacías de cierre.

ESTRUCTURA DE RESPUESTA OBLIGATORIA:
<analisis_contextual>
- Continuidad: [Qué punto exacto retoma del hilo y qué se evita repetir]
- Consejo genérico descartado: [El cliché de manual que tienes PROHIBIDO dar y por qué fallaría biológicamente aquí]
- Patrón detectado: [Relación exacta entre la situación actual y la ficha pasada [VIV-...] o regla de la rama]
</analisis_contextual>

<consejo_tactico>
[Instrucción directa, concreta y ejecutable en menos de 2 horas. Sin introducciones amables ni cierres motivacionales.]
</consejo_tactico>`;
}

/**
 * Prefill obligatorio del asistente para forzar la apertura con <analisis_contextual>
 * eliminando saludos complacientes y activando el bloqueo contrastivo antes del consejo.
 */
export const ASSISTANT_PREFILL_TAG = "<analisis_contextual>\n- Continuidad:";

/**
 * Parsea la salida estructurada (<analisis_contextual> + <consejo_tactico>)
 * y reconstruye tanto el bloque analítico como el mensaje limpio para la interfaz.
 */
export function parseRepairedTacticalOutput(
  rawOutput: string,
  ramaDetectada: RamaTematica,
  prefillUsado = false
): {
  formattedMessage: string;
  tacticalAnalysis: TacticalAnalysisBlock;
} {
  const fullText = prefillUsado && !rawOutput.trim().startsWith("<analisis_contextual>")
    ? `${ASSISTANT_PREFILL_TAG} ${rawOutput.trim()}`
    : rawOutput.trim();

  const analisisMatch = fullText.match(/<analisis_contextual>([\s\S]*?)<\/analisis_contextual>/i);
  const consejoMatch = fullText.match(/<consejo_tactico>([\s\S]*?)<\/consejo_tactico>/i);

  const analisisRaw = analisisMatch ? analisisMatch[1].trim() : "";
  let consejoTactico = consejoMatch ? consejoMatch[1].trim() : "";

  if (!consejoTactico) {
    // Si el modelo cerró</analisis_contextual> pero no puso tag de cierre en <consejo_tactico>
    const splitAfterAnalisis = fullText.split(/<\/analisis_contextual>/i);
    if (splitAfterAnalisis.length > 1) {
      consejoTactico = splitAfterAnalisis[1].replace(/<\/?consejo_tactico>/gi, "").trim();
    } else {
      consejoTactico = fullText.replace(/<\/?analisis_contextual>/gi, "").replace(/<\/?consejo_tactico>/gi, "").trim();
    }
  }

  const extractLine = (labelRegex: RegExp, fallback: string): string => {
    const m = analisisRaw.match(labelRegex);
    return m && m[1] ? m[1].trim() : fallback;
  };

  const continuidad = extractLine(/-\s*Continuidad:\s*([^\n]+)/i, "Evaluación directa sobre consulta activa.");
  const consejoGenericoDescartado = extractLine(
    /-\s*Consejo gen[eé]rico descartado:\s*([^\n]+)/i,
    "Consejo abstracto de gestión o motivación superficial."
  );
  const patronDetectado = extractLine(
    /-\s*Patr[oó]n detectado:\s*([^\n]+)/i,
    `Cruce de mecanismo en rama ${ramaDetectada}.`
  );

  const fichasCitadas = Array.from(new Set((fullText.match(/VIV-[A-Z0-9-]+/g) || [])));

  const formattedMessage = `**[ANÁLISIS CONTEXTUAL · RAMA ${ramaDetectada.toUpperCase()}]**
• **Continuidad:** ${continuidad}
• **Cliché descartado:** ${consejoGenericoDescartado}
• **Patrón y trazabilidad:** ${patronDetectado}

**DIRECTRIZ TÁCTICA (< 2h):**
${consejoTactico}`;

  return {
    formattedMessage,
    tacticalAnalysis: {
      continuidad,
      consejoGenericoDescartado,
      patronDetectado,
      consejoTactico,
      ramaDetectada,
      fichasCitadas,
    },
  };
}
