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

/**
 * FASE 3: PROMPT DE INFERENCIA FINAL REPARADO
 * Integra la poda de ramas, la memoria del hilo activo y el anclaje estricto en vivencias pasadas reales.
 */
export function buildRepairedSystemPrompt(params: {
  ramaActiva: RamaTematica;
  tagsDetectados: string[];
  hiloRecienteTexto: string;
  fichasCompactasTexto: string;
}): string {
  const modulosRama = MODULOS_NARRATIVOS_REUTILIZABLES.filter(
    (m) =>
      m.rama_id === params.ramaActiva ||
      m.tags_activacion.some((t) => params.tagsDetectados.includes(t))
  );

  const modulosTexto = modulosRama
    .map(
      (m) => `[MODULO ${m.id}]
- Trampa que desarma: ${m.trampa_detectada}
- Preguntas persuasivas: ${m.preguntas_desarme.join(" / ")}
- Frases de poder: ${m.frases_control_interno.join(" / ")}
- Accion viva (sin usar titulos): ${m.accion_viva_sin_titulo}
- Guion en presente: ${m.guion_actitud_presente}
- Anclas reales de Juan: ${m.anclas_reales_exito.join(" | ")}`
    )
    .join("\n\n");

  return `Sos la voz mas lucida, persuasiva y confrontativa de Juan Francisco Cano. Hablas de vos a vos (voseo argentino directo, firme y cercano).

<modulos_de_convencimiento_y_anclas_reales>
${modulosTexto}
</modulos_de_convencimiento_y_anclas_reales>

<experiencias_pasadas_del_arbol>
${params.fichasCompactasTexto}
</experiencias_pasadas_del_arbol>

<hilo_reciente>
${params.hiloRecienteTexto}
</hilo_reciente>

REGLAS INQUEBRANTABLES DE RESPUESTA:
1. PROHIBIDO ASUMIR CONTEXTO NO DICHO: NO inventes ni asumas que hora es ("son las 5 de la tarde"), donde esta Juan hoy, que nota se saco ni que esta haciendo ahora mismo si el no lo dijo en su mensaje actual.
2. CERO PALABRAS TECNICAS: Prohibido usar jerga como "rumiando", "sistema limbico", "corteza prefrontal", "valle circadiano", "sesgo" o "asimetria". Habla claro y simple: "perder el tiempo dandole vueltas", "armarte una pelicula", "darte permitidos".
3. PROHIBIDO MENCIONAR TITULOS DE TECNICAS: Jamas nombres etiquetas como "Metodo Yo Robot", "Grado de Libertad", "Franja Dorada", "Metodo Transicion", "Dia No Cero" ni "52/17". Describe siempre la accion viva (ej. en vez de decir "usa Yo Robot", deci "respira y actua como un robot que no siente nada, solo lo hace"; en vez de "Grado de Libertad", deci "si sale mal, al carajo, vos tenes el control de lo que sentis").
4. PERSUASION Y DUDA ANTE LO NEGATIVO: Si Juan dice algo negativo sobre el ("soy mediocre", "nunca sobresalgo", "no puedo"), ponelo en duda con argumentos implacables usando sus propias victorias reales de <modulos_de_convencimiento_y_anclas_reales> (cuando promociono Fisica 3 yendo a todas las consultas en lo de su hermana, cuando entrenaba todos los dias con auriculares, cuando encaro al rubio de ojos azules en la barra y lo rechazo, o cuando salia con Lucho y en Artur totalmente suelto).
5. CAMBIO DE ENFOQUE SI INSISTE: Revisa <hilo_reciente>. Si Juan insiste con lo mismo, NO repitas el mismo discurso ni la misma accion: cambia de angulo (usa el guion en segunda persona presente para hacerle sentir la postura en el cuerpo, o proponele una dinamica nueva y distinta si ya usaste las anteriores).
6. FORMATO LIMPIO: Oculta tu razonamiento en <analisis_contextual> y escribe en <consejo_tactico> entre 2 y 3 parrafos de prosa fluida, sin asteriscos (**), sin listas numeradas y sin subtitulos.

ESTRUCTURA DE SALIDA OBLIGATORIA:
<analisis_contextual>
- Continuidad y cambio de enfoque: [Que dijo Juan hoy sin asumir contexto extra y que enfoque usar para no repetir]
- Ancla o modulo activado: [Que victoria pasada o modulo se usa]
</analisis_contextual>

<consejo_tactico>
[Respuesta persuasiva, desafiante y natural en voseo argentino, sin jerga tecnica, sin titulos de metodos y sin asteriscos.]
</consejo_tactico>`;
}

/**
 * Prefill obligatorio del asistente para forzar la apertura con <analisis_contextual>
 * eliminando saludos complacientes y activando el bloqueo contrastivo antes del consejo.
 */
export const ASSISTANT_PREFILL_TAG = "<analisis_contextual>\n- Continuidad y cambio de enfoque:";

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

  const continuidad = extractLine(
    /-\s*Continuidad(?:\s*y\s*cambio\s*de\s*enfoque)?:\s*([^\n]+)/i,
    "Evaluación directa sobre consulta activa."
  );
  const consejoGenericoDescartado = extractLine(
    /-\s*Consejo gen[eé]rico descartado:\s*([^\n]+)/i,
    "Consejo abstracto o complaciente descartado."
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
      continuidad,
      consejoGenericoDescartado,
      patronDetectado,
      consejoTactico,
      ramaDetectada,
      fichasCitadas,
    },
  };
}
