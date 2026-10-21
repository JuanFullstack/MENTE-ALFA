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
  ArbolMemoriaJerarquico,
  ModuloNarrativoPersuasivo,
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
    keywords: [
      "rechazo", "que diran", "aprobacion", "validacion", "timidez", "vergüenza",
      "quedar mal", "tonto", "mirada", "atractivo", "social", "boliche", "inseguridad",
      "aceptacion", "ansiedad social", "fiesta", "salida", "chica", "mujer", "descaro"
    ],
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
  {
    tag: "#valor_intrinseco",
    keywords: ["valor intrinseco", "autoestima", "inseguridad", "inferior", "comparacion", "estandar", "valgo poco", "sentirme menos"],
  },
  {
    tag: "#alma_libre",
    keywords: ["alma libre", "desinhibicion", "espontaneo", "divertirse", "sin filtro", "soltarse", "encarar", "santos", "artur", "lucho"],
  },
  {
    tag: "#humor_adaptativo",
    keywords: ["humor", "reirse", "plan cancelado", "chiste", "desdramatizar", "ligereza", "no pasa nada"],
  },
  {
    tag: "#rigidez_perfeccionista",
    keywords: ["rigidez", "todo o nada", "no salio como queria", "frustrado porque cambio", "obsesion", "control"],
  },
  {
    tag: "#inmunidad_rechazo",
    keywords: ["rechazo", "inmunidad rechazo", "miedo al no", "me dijeron que no", "ignorado", "desprecio", "miraron mal"],
  },
  {
    tag: "#ideal_adaptado",
    keywords: ["ideal adaptado", "ropa sucia", "imprevisto", "no es perfecto", "adaptar", "hacer lo que se puede", "plan b"],
  },
  {
    tag: "#control_ira_leon",
    keywords: ["ira", "enojo", "renan", "bronca", "león", "leon", "calmar la ira", "explotar", "discutir", "respirar hondo"],
  },
  {
    tag: "#sabiduria_retroceso",
    keywords: ["pedir perdon", "retroceder", "disculpa", "humildad", "bajar un cambio", "ceder"],
  },
  {
    tag: "#gratitud_activa",
    keywords: ["gratitud", "privilegio", "oportunidad", "agradecer", "queja", "agradecido", "salud"],
  },
  {
    tag: "#arranque_645",
    keywords: ["6:45", "alarma", "contar hasta 3", "agua fria", "audio horus", "levantarse", "cama"],
  },
  {
    tag: "#inercia_sueno",
    keywords: ["inercia", "sueño", "pesadez al despertar", "5 minutos mas", "quedarse acostado", "fiaca"],
  },
  {
    tag: "#entreno_poder",
    keywords: ["7:30", "entreno", "gimnasio", "pesas", "musculo", "atleta", "hombros", "espalda", "abdominales"],
  },
  {
    tag: "#autoimagen_fisica",
    keywords: ["espejo", "ropa ajustada", "porte", "definicion", "postura", "cuerpo fuerte"],
  },
  {
    tag: "#estudio_ingenieria",
    keywords: ["ingenieria", "estudio", "17:00", "5:00", "temporizador", "discord", "fisica", "codigo", "titulo"],
  },
  {
    tag: "#tolerancia_confusion",
    keywords: ["confusion", "desorientado", "primeros 15 minutos", "no entiendo nada", "mecanico", "complejo al inicio"],
  },
  {
    tag: "#dia_no_cero",
    keywords: ["dia no cero", "no cero", "al menos algo", "accion minima", "salvar el dia", "apatia"],
  },
  {
    tag: "#demonio_interno",
    keywords: ["demonio interno", "un video mas", "lol", "partida", "memes", "procrastinar", "mañana empiezo"],
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
    "boliche", "boliches", "inseguridad", "aceptacion", "ansiedad social", "fiesta", "salida",
    "descaro", "desinhibicion", "validacion", "atractivo", "encare", "conocer gente", "miedo al rechazo",
    "autoestima social",
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
    if (ultimoTexto.includes(kw)) scoreRamas.vinculos += 4;
    else if (contextoCombinado.includes(kw)) scoreRamas.vinculos += 2;
  }
  for (const kw of kwHabitos) {
    if (ultimoTexto.includes(kw)) scoreRamas.habitos += 3;
    else if (contextoCombinado.includes(kw)) scoreRamas.habitos += 1;
  }

  let rama: RamaTematica = "habitos";
  if (scoreRamas.vinculos >= scoreRamas.proyectos && scoreRamas.vinculos >= scoreRamas.habitos && scoreRamas.vinculos > 0) {
    rama = "vinculos";
  } else if (scoreRamas.proyectos >= scoreRamas.vinculos && scoreRamas.proyectos >= scoreRamas.habitos && scoreRamas.proyectos > 0) {
    rama = "proyectos";
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
 * Consulta O(1) del árbol jerárquico por rama y tags de mecanismo:
 * 1) arbol.ramas[ramaActiva]?.nodos[tag] (acceso O(1) a los nodos de la rama activa)
 * 2) arbol.indiceTransversalTags[tag] (acceso O(1) a vivencias de otras ramas con el mismo mecanismo psicológico para hacer analogía)
 * 3) arbol.ramas[ramaActiva]?.fichas_recientes_ids (últimas vivencias de esa misma rama si faltan completar las maxFichas)
 */
export function consultarArbolPorRamaYNodo(
  arbol: ArbolMemoriaJerarquico,
  ramaActiva: RamaTematica,
  tagsConsulta: string[],
  maxFichas = 5
): FichaVivenciaInmutable[] {
  if (!arbol || !arbol.ramas) return [];

  const fichasSeleccionadas: FichaVivenciaInmutable[] = [];
  const idsAgregados = new Set<string>();

  const agregarFichaPorId = (id: string) => {
    if (idsAgregados.has(id)) return;
    const ficha = arbol.fichasPorId[id];
    if (ficha) {
      idsAgregados.add(id);
      fichasSeleccionadas.push(ficha);
    }
  };

  const ramaObj = arbol.ramas[ramaActiva];

  // 1. Acceso directo O(1) a nodos de la rama activa que coincidan con los tags
  if (ramaObj && ramaObj.nodos) {
    for (const tag of tagsConsulta) {
      const nodo = ramaObj.nodos[tag];
      if (nodo && nodo.fichas_ids) {
        for (const fId of nodo.fichas_ids) {
          if (fichasSeleccionadas.length >= maxFichas) break;
          agregarFichaPorId(fId);
        }
      }
      if (fichasSeleccionadas.length >= maxFichas) break;
    }
  }

  // 2. Acceso directo O(1) al índice transversal de tags (analogías de otras ramas)
  if (fichasSeleccionadas.length < maxFichas && arbol.indiceTransversalTags) {
    for (const tag of tagsConsulta) {
      const idsTransversales = arbol.indiceTransversalTags[tag] || [];
      for (const fId of idsTransversales) {
        if (fichasSeleccionadas.length >= maxFichas) break;
        agregarFichaPorId(fId);
      }
      if (fichasSeleccionadas.length >= maxFichas) break;
    }
  }

  // 3. Si aún faltan, completar con las fichas recientes de la misma rama
  if (fichasSeleccionadas.length < maxFichas && ramaObj && ramaObj.fichas_recientes_ids) {
    for (const fId of ramaObj.fichas_recientes_ids) {
      if (fichasSeleccionadas.length >= maxFichas) break;
      agregarFichaPorId(fId);
    }
  }

  return fichasSeleccionadas;
}

export const MODULOS_NARRATIVOS_REUTILIZABLES: ModuloNarrativoPersuasivo[] = [
  {
    id: "MOD-DESINHIBICION-CONTROL-INTERNO",
    rama_id: "vinculos",
    tags_activacion: ["#busqueda_aprobacion", "#paralisis_perfeccionismo"],
    trampa_detectada: "Darle relevancia a lo que piensen los demas, armarse una pelicula de victima en la cabeza y condicionar el propio valor a una reaccion externa.",
    preguntas_desarme: [
      "¿Por que te importa tanto lo que piensan los demas y te complicas solo por tonterias?",
      "¿No ves que esas paredes son ilusiones que vos mismo armaste en tu cabeza y que cada uno esta en la suya?"
    ],
    frases_control_interno: [
      "Vos tenes el control de lo que sentis y podes cambiar ahora mismo como interpretas las cosas.",
      "Si no cumplis los estandares de alguien, que se pudra; si todo sale mal, al carajo: tomas una decision y seguis adelante.",
      "Esta es tu vida y la vivis como te da la gana; reite de tus errores y disfruta el momento sin esperar ningun resultado."
    ],
    accion_viva_sin_titulo: "Respira hondo, endereza los hombros, solta cualquier expectativa de agradar y entra al lugar sonriendo para divertirte vos, hablando de forma descarada y espontanea sin importar que contesten.",
    guion_actitud_presente: "Tus hombros se enderezan, tu postura se vuelve firme y tu mirada segura. Caminas entre la gente sonriendo porque sabes quien sos y no esperas nada de nadie. Hablas con voz clara, te tomas todo con humor y te dejas llevar por tu instinto sabiendo que pase lo que pase te da igual.",
    anclas_reales_exito: [
      "Acordate en el bar cuando fuiste a la barra con seguridad total, le dijiste al dueno que eras capaz de encarar a cualquiera, te acercaste sin pensar al chico rubio de ojos azules, hablaste suelto, le gustaste y hasta te invito a su departamento y lo rechazaste.",
      "Acordate cuando salias a bailar con Lucho totalmente desinhibido, sonriendo sin que te importara nada, haciendo contacto visual y besando a dos chicas en la misma noche porque dejabas que todo fluyera solo.",
      "Acordate en Artur cuando caminabas seguro, encarabas de forma espontanea sin dar vueltas en la cabeza y te decian que si."
    ]
  },
  {
    id: "MOD-ANTI-PERMISOS-Y-ARRANQUE-MECANICO",
    rama_id: "proyectos",
    tags_activacion: ["#sobreestimulacion_digital", "#paralisis_perfeccionismo", "#ansiedad_examen", "#efecto_que_carajo"],
    trampa_detectada: "Escapar de la presion de un examen o tema nuevo dandose 'permitidos' (un video mas, una partida mas, una serie hasta las 3 AM), postergando para manana hasta que sube la culpa.",
    preguntas_desarme: [
      "¿Cuantas veces mas vas a caer en la trampa de decirte 'despues de esta partida arranco' o 'manana empiezo temprano'?",
      "¿Si sabes que vos tenes el control, por que dejas que un impulso de comodidad decida por vos?"
    ],
    frases_control_interno: [
      "Lo importante es lo que haces ahora, no las ganas que tengas ni lo que sientas.",
      "Es normal sentirse confundido y desorientado cuando agarras un tema nuevo; todo es mecanica y cuestion de tiempo hasta agarrarle el orden.",
      "Usa la bronca y el hartazgo a tu favor: corta las excusas de raiz y empeza sin expectativas."
    ],
    accion_viva_sin_titulo: "Deja el celular lejos ahora mismo, respira y camina hacia la computadora actuando como un robot que no siente desgano ni piensa en todo lo que falta. Prende la pantalla y empeza buscando solo un panorama general (un video o resumen basico del tema) para entender de que va sin presionarte; cuando tengas el mapa en la cabeza, ponete a resolver por tu cuenta.",
    guion_actitud_presente: "Caminas hacia la computadora aunque sientas pesadez, porque ya decidiste que los impulsos no te gobiernan. Prendes el monitor, ignoras la voz que te pide distraerte y te decis: 'Voy a arrancar despacio, sin expectativas, mientras lo voy haciendo se va acomodando'.",
    anclas_reales_exito: [
      "Acordate cuando promocionaste Fisica 3 viviendo en la casa de tu hermana: mientras la mayoria quedaba en el camino, vos te sentabas concentrado, ibas a todas las consultas con la profesora hasta sacarte cada duda, volvias y liquidabas todos los practicos.",
      "Acordate de todas las veces que, una vez que rompiste la inercia de los primeros minutos y entendiste el panorama general, agarraste ritmo y resolviste problemas pesados."
    ]
  },
  {
    id: "MOD-DETERMINACION-Y-IDENTIDAD-GANADORA",
    rama_id: "habitos",
    tags_activacion: ["#fatiga_tarde", "#efecto_que_carajo", "#paralisis_perfeccionismo"],
    trampa_detectada: "Ponerse etiquetas destructivas ('soy mediocre', 'nunca sobresalgo') o creer que por haber perdido unos dias ya se arruino todo.",
    preguntas_desarme: [
      "¿De donde sacas que sos mediocre cuando tenes pruebas de sobra de que cuando te enfocas pasas por encima de lo que la mayoria ni intenta?",
      "¿Por que confundis un momento de desorden o de falta de foco con tu capacidad real?"
    ],
    frases_control_interno: [
      "Una caida o una mala racha son parte de cualquier proceso; no sos una victima, sos el que tiene el volante.",
      "Vos decidiste quien sos y vos tenes el control de lo que sentis: si algo salio mal, al carajo, lo descartas y accionas ahora."
    ],
    accion_viva_sin_titulo: "Corta ya mismo la pelicula de castigarte perdiendo el tiempo en tu cabeza. Respira hondo, parate derecho y hace ahora mismo una sola accion fisica o de avance concreto de dos minutos, como cuando te ponias los auriculares y entrenabas sin importar las ganas.",
    guion_actitud_presente: "Sentis esa mezcla de bronca y determinacion que te despierta. Te pones de pie, dejas atras la queja y empezas a moverte en una sola direccion, sin pedir garantias y sin distraerte.",
    anclas_reales_exito: [
      "Acordate cuando entrenabas todos los dias sin excusas: te calzabas los auriculares y cumplias con espalda, hombros, abdominales y barra sintiendo el calor y la fuerza en el cuerpo sin importar como habia sido el dia.",
      "Acordate de Fisica 3 en lo de tu hermana y de cuando encarabas en el bar o en Artur con total conviccion: ese mismo tipo sos vos cuando dejas de darte vueltas en la cabeza."
    ]
  }
];

export interface HechoRealAncla {
  id: string;
  situaciones: Array<"capacidad_estudio" | "constancia_fisica" | "desinhibicion_social" | "autocontrol_ira" | "adaptacion_imprevistos">;
  relato_corto: string;
}

// Banco extensible: aca se pueden agregar todos los hechos futuros por situacion
export const BANCO_HECHOS_POR_SITUACION: HechoRealAncla[] = [
  {
    id: "HECHO-FISICA3-HERMANA",
    situaciones: ["capacidad_estudio"],
    relato_corto: "Cuando vivias en lo de tu hermana y promocionaste Fisica 3: mientras la mayoria abandonaba, vos te sentabas concentrado, ibas a todas las consultas con la profesora hasta entender todo y volvias a liquidar los practicos.",
  },
  {
    id: "HECHO-ENTRENO-AURICULARES",
    situaciones: ["constancia_fisica", "capacidad_estudio"],
    relato_corto: "La epoca en que entrenabas todos los dias sin importar como venia el dia: te calzabas los auriculares y cumplias levantando la barra, haciendo espalda, hombros y abdominales sintiendo el calor y la fuerza en el cuerpo.",
  },
  {
    id: "HECHO-BAR-RUBIO",
    situaciones: ["desinhibicion_social"],
    relato_corto: "La noche en el bar cuando fuiste a la barra con total determinacion, dijiste que eras capaz de encarar a cualquiera, te acercaste sin pensarlo al pibe rubio de ojos azules, hablaste suelto y terminaste rechazando su invitacion al departamento.",
  },
  {
    id: "HECHO-BAILE-LUCHO-ARTUR",
    situaciones: ["desinhibicion_social"],
    relato_corto: "Cuando salias a bailar con Lucho o caminabas por Artur totalmente desinhibido, sonriendo sin esperar nada, haciendo contacto visual y hablando espontaneamente porque te daba igual el resultado.",
  },
  {
    id: "HECHO-CASA-RENAN",
    situaciones: ["autocontrol_ira", "adaptacion_imprevistos"],
    relato_corto: "El aprendizaje de lo de Renan despues de un dia agotador: entender la diferencia entre explotar en caliente por una tonteria o congelar todo al primer insulto, respirar como un leon calmando su ira y elegir no darle importancia.",
  },
];

/**
 * Selecciona como maximo 1 hecho real que NO haya sido mencionado en los ultimos
 * mensajes de la conversacion, o devuelve bloqueo si ya se cito uno en el turno anterior
 * para no desgastar las experiencias reales.
 */
export function obtenerHechoDosificadoSinRepetir(
  messages: Array<{ sender?: string; role?: string; text?: string; content?: string }>,
  textoUsuario: string
): string {
  const ultimosMensajesAsistente = (messages || [])
    .filter((m) => m.sender === "assistant" || m.role === "assistant")
    .slice(-4)
    .map((m) => (m.text || m.content || "").toLowerCase());

  // Si en el ultimo mensaje de la IA ya se cito un caso real ("acordate", "fisica 3", "lucho", "renan", "rubio", "hermana"),
  // en este turno NO inyectamos ningun hecho pasado para no quemar el recurso.
  const ultimoAsistente = ultimosMensajesAsistente[ultimosMensajesAsistente.length - 1] || "";
  const palabrasAncla = ["fisica 3", "física 3", "hermana", "rubio", "lucho", "artur", "renan", "renán", "auriculares"];
  if (palabrasAncla.some((p) => ultimoAsistente.includes(p))) {
    return "NINGUNO EN ESTE TURNO (PROHIBIDO citar casos pasados como Fisica 3, el bar, Lucho o Renan en esta respuesta; enfocate 100% en desenmascarar el autoengano actual y guiar la accion en presente).";
  }

  // Filtrar hechos que NO hayan aparecido en los ultimos 4 turnos del asistente
  const textoHistorialReciente = ultimosMensajesAsistente.join(" ");
  const hechosDisponibles = BANCO_HECHOS_POR_SITUACION.filter((h) => {
    if (h.id === "HECHO-FISICA3-HERMANA" && (textoHistorialReciente.includes("fisica") || textoHistorialReciente.includes("hermana"))) return false;
    if (h.id === "HECHO-ENTRENO-AURICULARES" && textoHistorialReciente.includes("auriculares")) return false;
    if (h.id === "HECHO-BAR-RUBIO" && textoHistorialReciente.includes("rubio")) return false;
    if (h.id === "HECHO-BAILE-LUCHO-ARTUR" && (textoHistorialReciente.includes("lucho") || textoHistorialReciente.includes("artur"))) return false;
    if (h.id === "HECHO-CASA-RENAN" && textoHistorialReciente.includes("renan")) return false;
    return true;
  });

  if (hechosDisponibles.length === 0) {
    return "NINGUNO EN ESTE TURNO (No repitas ejemplos pasados; usa persuasion directa en tiempo presente).";
  }

  const t = textoUsuario.toLowerCase();
  let elegido = hechosDisponibles[0];

  if (t.includes("enojo") || t.includes("caliente") || t.includes("insult") || t.includes("discusion") || t.includes("pelea")) {
    elegido = hechosDisponibles.find((h) => h.id === "HECHO-CASA-RENAN") || elegido;
  } else if (t.includes("boliche") || t.includes("encarar") || t.includes("chica") || t.includes("social") || t.includes("aceptacion") || t.includes("ropa")) {
    elegido = hechosDisponibles.find((h) => h.situaciones.includes("desinhibicion_social")) || elegido;
  } else if (t.includes("entrenar") || t.includes("gimnasio") || t.includes("fisico") || t.includes("cuerpo")) {
    elegido = hechosDisponibles.find((h) => h.id === "HECHO-ENTRENO-AURICULARES") || elegido;
  } else {
    elegido = hechosDisponibles.find((h) => h.situaciones.includes("capacidad_estudio")) || elegido;
  }

  return `[OPCIONAL - SOLO USAR SI APORTA FUERZA Y CON NATURALIDAD]: ${elegido.relato_corto}`;
}

export const MAPA_AUTOENGANO_E_INSTINTOS = `
COMO DETECTAR CUANDO LA MENTE O LOS INSTINTOS PRIMITIVOS ENGANAN A JUAN SIN QUE SE DE CUENTA:

1. EL ENGANO DEL "PERMITIDO CORTO" Y LA POSTERGACION ("Un video mas", "Despues de esta partida", "Ya es tarde, manana arranco temprano"):
   - Como te engana la mente: Te hace creer que estas eligiendo descansar "5 minutos" o que "manana con la mente fresca vas a rendir mejor", cuando en realidad es ese impulso interno que te adormece para escapar de los primeros 10 minutos incomodos de una tarea o examen.
   - Como destrabarlo (Narracion de Disciplina Real):
     * Desenmascarar la voz permisiva en el acto: "Todo tiene su momento".
     * Recordar que solo los primeros 10 o 15 minutos dan resistencia; una vez que arrancas ("primero esto, despues lo otro"), el ritmo fluye solo.
     * Las pausas y series no se prohiben, se miden con temporizador y se cortan a horario para dormir a las 11 y levantarse al sonar la alarma sin esperar a tener ganas.

2. EL ENGANO DE LA IRRITACION POR EL ESCENARIO IMPERFECTO (Caso "No tengo ropa 15 min antes de salir" o "Se cayo el plan del sabado"):
   - Como te engana la mente: Te hace sentir bronca, ansiedad o ganas de mandar todo al diablo porque la ropa te queda mal, esta sucia o tus amigos cancelaron, haciendote creer que el problema es la ropa o el plan. En realidad, el instinto primitivo buscaba lucirse, recibir aprobacion externa o controlar un escenario ideal.
   - Como destrabarlo (Buscar lo ideal dentro de la imperfeccion):
     * Parar, mirar hacia adentro, respirar lento y quitarle toda importancia a la sensacion primitiva: "Las cosas solo me afectan si yo les doy importancia; yo decido que es relevante y que ignorar".
     * Soltar el plan rigido y buscar la mejor opcion real dentro de lo que hay hoy: ir con la mejor ropa que tengas a mano porque tu tranquilidad vale mas que impresionar, o si estas agotado un sabado y todo salio al reves, elegir descansar en paz para ganar la manana siguiente en vez de forzar la salida con mala energia.

3. EL ENGANO DE LA EXPLOSION REACTIVA EN CALIENTE (Caso "Cansado y te provocan o insultan"):
   - Como te engana la mente: Cuando estas agotado y alguien se enoja por una tonteria, el instinto primitivo te empuja a explotar creyendo que asi te defendes, dejandote contaminado y frustrado.
   - Como destrabarlo (Respiracion del Leon):
     * Apenas sube el calor del enojo, congelar todo: dejar de escuchar la provocacion, no responder en caliente y respirar lento como un leon calmando su ira.
     * Volverte inmune desde adentro filtrando lo irrelevante: vos elegis que te afecta y cuando avanzar o retroceder.

4. EL ENGANO DE ESPERAR CONDICIONES O GANAS IDEALES (En estudio, orden, interaccion social o entrenamiento):
   - Como te engana la mente: Te dice que necesitas "sentir ganas", "estar inspirado" o "tener todo claro" antes de entrenar, ordenar un desastre o hablarle a alguien en un boliche.
   - Como destrabarlo:
     * En el desorden o estudio: empezar a ordenar o ver el panorama general sin hacer juicios de valor ("que desastre todo lo que falta"), simplificando cada paso hasta que aparezca esa energia calida de concentracion.
     * En el entrenamiento: no verlo como un castigo ni esperar a tener que demostrar nada; poner musica, empezar a calentar despacio adaptandolo a lo que hoy es posible y disfrutar de estar cuidando el cuerpo, sabiendo que con cada repeticion suben las ganas y la fuerza.
     * En lo social: no esperar reacciones ni resultados; acercarte con una pregunta simple y casual solo por practicar y divertirte, siendo un alma libre a la que le da igual si sale bien o mal.
`;

export type ModoInteraccionIA = 'sondeo_contexto_vago' | 'auditoria_como_vamos' | 'consejo_tactico_directo';

export function evaluarModoInteraccion(
  textoUsuario: string,
  historialReciente: Array<{ sender?: string; role?: string; text?: string; content?: string }> = []
): {
  modo: ModoInteraccionIA;
  motivo: string;
} {
  const txt = (textoUsuario || "").trim().toLowerCase();
  const palabras = txt.split(/\s+/).filter(Boolean);

  const regexComoVamos = /(como vamos|cómo vamos|como venimos|cómo venimos|cumpliendo los objetivos|mis objetivos|en que estoy fallando|en qué estoy fallando|dame un reporte|evaluame|evalúame|balance de la semana|balance del mes)/i;
  if (regexComoVamos.test(txt)) {
    return {
      modo: "auditoria_como_vamos",
      motivo: "El usuario solicitó auditoría de cumplimiento de objetivos, horarios de reporte, fallos y valoración de métodos exitosos.",
    };
  }

  const ultimoMensajeAsistente = [...historialReciente]
    .reverse()
    .find((m) => m.sender === "assistant" || m.role === "assistant");
  const asistentePreguntoRecien =
    ultimoMensajeAsistente && (ultimoMensajeAsistente.text || ultimoMensajeAsistente.content || "").includes("?");

  const tieneContextoEspecifico = /(tesis|facet|fisica|física|codigo|código|sql|examen|discord|lol|juego|alarma|6:45|7:30|entreno|gimnasio|boliche|santos|artur|bar|chica|mujer|renan|renán|ropa|reunion|reunión|ingles|inglés)/i.test(txt);

  if (palabras.length <= 9 && !tieneContextoEspecifico && !asistentePreguntoRecien) {
    return {
      modo: "sondeo_contexto_vago",
      motivo: "El mensaje es breve/vago y no especifica si el detonante es psicológico o productivo, por qué importa ahora o el nivel de energía.",
    };
  }

  return {
    modo: "consejo_tactico_directo",
    motivo: "El mensaje contiene contexto suficiente para desenmascarar el autoengaño y prescribir el protocolo exacto.",
  };
}

/**
 * FASE 3: PROMPT DE INFERENCIA FINAL REPARADO
 * Integra la poda de ramas, la memoria del hilo activo, el detector de autoengaño y los 3 modos operativos.
 */
export function buildRepairedSystemPrompt(params: {
  ramaActiva: RamaTematica;
  tagsDetectados: string[];
  hiloRecienteTexto: string;
  fichasCompactasTexto: string;
  hechoDosificadoTexto?: string;
  horaActualTexto?: string;
  modoInteraccion?: ModoInteraccionIA;
  auditoriaComoVamosTexto?: string;
}): string {
  const modo = params.modoInteraccion || "consejo_tactico_directo";
  const horaInfo = params.horaActualTexto || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const bloqueInstruccionPorModo =
    modo === "sondeo_contexto_vago"
      ? `MODO ACTIVO EN ESTE TURNO: [1. SONDEO CONTEXTUAL QUIRÚRGICO ANTE MENSAJE VAGO]
Juan acaba de enviar un mensaje corto o vago (como "estoy mal", "me siento trabado" o "no tengo ganas") sin explicar el detonante ni el contexto.
- PROHIBIDO adivinar qué le pasa o lanzarle un discurso largo a ciegas.
- Respondé en UN SOLO PÁRRAFO CORTO (máximo 3 a 4 líneas):
  1) Mencioná con naturalidad la hora actual (${horaInfo}) para anclar el momento del día.
  2) Hacele exactamente 2 preguntas directas y cortas para destrabar el contexto y registrar el patrón horario:
     • ¿Qué hecho puntual pasó recién (viene por el lado de estudio/productividad o por algo social/personal)?
     • ¿Qué objetivo o tarea importante del día te está frenando esto ahora mismo y cómo estás de energía física del 1 al 10?`
      : modo === "auditoria_como_vamos"
      ? `MODO ACTIVO EN ESTE TURNO: [3. AUDITORÍA INTEGRAL "¿CÓMO VAMOS?"]
Juan te está preguntando cómo vienen con los objetivos semanales/mensuales, los horarios de sus reportes y sus patrones.
Basate ESTRICTAMENTE en los datos de <auditoria_objetivos_y_horarios> y respondé cubriendo estos 5 puntos con claridad y firmeza:
1) CUMPLIMIENTO DE OBJETIVOS: Decile con números exactos cómo va en sus Objetivos de Crecimiento (Psicológicos) y en sus Objetivos Productivos (semanales y mensuales).
2) EVALUACIÓN DEL HORARIO Y CONSTANCIA DE REPORTES (0 a 15 diarios): Evaluá a qué horas está haciendo los reportes, en qué franja horaria rinde mejor, en qué horario cae su ánimo/productividad y marcale sin filtro si hubo días o franjas con 0 reportes (puntos ciegos donde suele esconderse el "permitido" o la evasión).
3) EN QUÉ ESTÁ FALLANDO Y PATRONES REPETIDOS: Señalá los obstáculos concretos donde tropezó esta semana.
4) RETROALIMENTACIÓN CON EXPERIENCIAS NEGATIVAS DONDE TUVO ÉXITO (VALORACIÓN DEL MÉTODO): Citá las experiencias negativas psicológicas o productivas registradas en <auditoria_objetivos_y_horarios> y <experiencias_del_arbol> donde Juan estuvo en esa misma situación difícil pero TUVO ÉXITO, valorando explícitamente el método que aplicó esa vez (ej. levantarse antes de contar hasta 3 con agua fría y audio Horus, tolerar los primeros 15 min de confusión en estudio, respiración del león en lo de Renán, Ideal Adaptado con la ropa sucia o postura erguida en el boliche).
5) ACCIÓN INMEDIATA PARA HOY (${horaInfo}): Dale una única consigna concreta para ganar la franja horaria actual.`
      : `MODO ACTIVO EN ESTE TURNO: [2. CONSEJO TÁCTICO DIRECTO CON GUÍA PRÁCTICA]
1) DESENMASCARAR EL AUTOENGAÑO: Mostrale cómo su mente o el demonio interno lo quiere engañar (el "permitido corto" de LOL/videos/memes, "mañana empiezo", buscar aprobación externa en el boliche o encapricharse cuando un escenario es imperfecto).
2) APLICAR EL PROTOCOLO EXACTO DE SU GUÍA SEGÚN EL CASO:
   - Si es Autoconfianza/Social: Postura erguida inmediata, mirada firme sin esquivar, respiración lenta y decretos ("Yo controlo cómo sentirme", "Si no cumplo los estándares de alguien, que se pudra") o actitud Alma Libre sin esperar resultado (como en Santos a las 3 AM, Artur o con Lucho).
   - Si es Enojo/Imprevisto/Ropa sucia/Discusión: Congelamiento táctico al primer segundo, respirar "como un león calmando su ira", construir el Ideal Adaptado (buscar la mejor opción real dentro de la imperfección) o Sabiduría de Retroceso con humildad (como en lo de Renán).
   - Si es Rutina Matutina (6:45 AM): Levantarse antes de contar hasta 3 sin negociar, directo al baño, agua fría y audio Horus (10 min) para entrenar a las 7:30 AM con auriculares.
   - Si es Estudio/Ingeniería (5:00 PM / avisos Discord): Apagar TV, celular en No Molestar, temporizador, atravesar los primeros 10-15 min aceptando que "es normal sentirse desorientado la primera vez, es puramente mecánico", ver 1 video de YouTube para el panorama general y resolver solo para cerrar a las 11:00 PM rumbo al título de ingeniero y portafolio.
   - Si es Apatía/Día Complicado: Confrontar al demonio interno ("¿Si sabés que tenés el control, qué carajo estás haciendo?", "Sé que esto me costará, pero dejaré de hacerlo"), encender enojo constructivo y ejecutar la acción mínima para no quedar en Día Cero.
3) VALORAR EL MÉTODO DE ÉXITO PREVIO: Cuando cites una experiencia negativa superada, destacá por qué el método que aplicó Juan esa vez funcionó y pedile que repita exactamente esa mecánica ahora.`;

  return `Sos la voz más lúcida, persuasiva y despierta de Juan Francisco Cano. Hablás de vos a vos (voseo argentino directo, claro y firme).

<telemetria_horaria_real>
Hora y franja actual del sistema: ${horaInfo}
</telemetria_horaria_real>

<instruccion_de_modo_activo>
${bloqueInstruccionPorModo}
</instruccion_de_modo_activo>

<detector_de_autoengano_e_instintos_primitivos>
${MAPA_AUTOENGANO_E_INSTINTOS}
</detector_de_autoengano_e_instintos_primitivos>

<auditoria_objetivos_y_horarios>
${params.auditoriaComoVamosTexto || "Auditoría disponible bajo demanda."}
</auditoria_objetivos_y_horarios>

<experiencias_del_arbol>
${params.fichasCompactasTexto}
</experiencias_del_arbol>

<hecho_real_habilitado_en_este_turno>
${params.hechoDosificadoTexto || "Usar experiencias de la auditoría o persuasión directa en presente."}
</hecho_real_habilitado_en_este_turno>

<hilo_reciente>
${params.hiloRecienteTexto}
</hilo_reciente>

ESTRUCTURA DE SALIDA OBLIGATORIA:
<analisis_contextual>
- Modo y especificidad: [${modo}]
- Autoengano o instinto detectado: [Qué excusa, gatillo o patrón horario está operando a las ${horaInfo}]
- Enfoque elegido y metodo valorado: [Qué protocolo o caso de éxito propio se activa]
</analisis_contextual>

<consejo_tactico>
[Tu respuesta directa en voseo argentino cumpliendo estrictamente el MODO ACTIVO EN ESTE TURNO.]
</consejo_tactico>`;
}

/**
 * Prefill obligatorio del asistente para forzar la apertura con <analisis_contextual>
 * eliminando saludos complacientes y activando el bloqueo contrastivo antes del consejo.
 */
export const ASSISTANT_PREFILL_TAG = "<analisis_contextual>\n- Autoengano o instinto detectado:";

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
    // Si el modelo cerró </analisis_contextual> pero no puso tag de cierre en <consejo_tactico>
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

  const autoenganoOContinuidad = extractLine(
    /-\s*(?:Autoengano\s*o\s*instinto\s*detectado|Continuidad(?:\s*y\s*cambio\s*de\s*enfoque)?|Modo\s*y\s*especificidad):\s*([^\n]+)/i,
    "Evaluación directa sobre consulta activa."
  );
  const enfoqueElegido = extractLine(
    /-\s*(?:Enfoque\s*elegido\s*y\s*(?:control\s*de\s*repeticion|metodo\s*valorado)|Consejo\s*gen[eé]rico\s*descartado):\s*([^\n]+)/i,
    "Enfoque persuasivo en tiempo presente."
  );
  const patronDetectado = extractLine(
    /-\s*(?:Patr[oó]n detectado|Ancla o modulo activado):\s*([^\n]+)/i,
    `Cruce de mecanismo en rama ${ramaDetectada}.`
  );

  const fichasCitadas = Array.from(new Set((fullText.match(/VIV-[A-Z0-9-]+/g) || [])));

  // Formato 100% natural para el usuario: solo el consejo táctico sin asteriscos ni encabezados
  const formattedMessage = consejoTactico
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^[0-9]+\.\s*/gm, "")
    .replace(/^[-•]\s*/gm, "")
    .trim();

  return {
    formattedMessage,
    tacticalAnalysis: {
      continuidad: autoenganoOContinuidad,
      consejoGenericoDescartado: enfoqueElegido,
      patronDetectado,
      consejoTactico,
      ramaDetectada,
      fichasCitadas,
    },
  };
}
