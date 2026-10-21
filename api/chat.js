// src/lib/baseContext.ts
var GUIAS_BASE_POR_RAMA = {
  proyectos: `RAMA ACTIVA: PROYECTOS / C\xD3DIGO / INGENIER\xCDA (Juan Francisco Cano, Tucum\xE1n)
- Focos activos: Tesis de Grado (Impacto de IA generativa en GitFlow; mentores Saborido, Gra\xF1a, Namour) y Sistema Cooperadora FACET (junto a Sergio Ricardo Gor). Stack: React, TypeScript, Python, C++, SQL/pgAdmin4, PocketBase, Vercel.
- Regla 1 (Franja Dorada): La alta carga cognitiva (arquitectura, redacci\xF3n de tesis, debugging complejo) se ejecuta estrictamente de 07:00 a 12:00 en bloques 52/17 sin pantallas en el descanso.
- Regla 2 (Fricci\xF3n por Ambig\xFCedad o Volumen): Ante temas nuevos o requerimientos extensos que disparen par\xE1lisis o apertura de pesta\xF1as secundarias, aplicar el M\xE9todo Pregunta-Respuesta: dividir el problema en una \xFAnica pregunta t\xE9cnica simple resolvible en 15 minutos.
- Regla 3 (Duda vs Acci\xF3n): La duda t\xE9cnica solo se permite en el dise\xF1o; una vez definido el micro-paso, se codifica en modo Yo Robot (fricci\xF3n cero: abrir archivo y escribir la primera funci\xF3n en 30 segundos).`,
  vinculos: `RAMA ACTIVA: V\xCDNCULOS / INTERACCI\xD3N SOCIAL / COMUNICACI\xD3N (Juan Francisco Cano)
- Principio Rector (Grado de Libertad - "Da igual / No importa"): El valor personal es objetivo e independiente de la validaci\xF3n o respuesta externa. Condicionar el estado propio a la reacci\xF3n ajena activa inseguridad primitiva.
- Protocolo de Transici\xF3n Social (15 min): 1) Aislaci\xF3n mental de 5 min (cortar rumiaci\xF3n) -> 2) Depuraci\xF3n ("\xBFpor qu\xE9 gastar energ\xEDa si da igual?") -> 3) Aceptaci\xF3n con humor adaptativo y descaro -> 4) Acci\xF3n espont\xE1nea sin guion r\xEDgido.
- Exposici\xF3n y Comunicaci\xF3n (Videos/Reuniones): Contra el perfeccionismo esc\xE9nico, aplicar micro-exposiciones de 2 minutos en crudo sin editar y distanciamiento en 3ra persona ("Juan est\xE1 experimentando activaci\xF3n normal antes de hablar").`,
  habitos: `RAMA ACTIVA: H\xC1BITOS / BIOENERG\xCDA / REGULACI\xD3N (Juan Francisco Cano)
- Protocolo Bioenerg\xE9tico Prioritario #1 (Baja Energ\xEDa / Tarde >13:00 / Dispersi\xF3n): PROHIBIDO forzar con "debo hacerlo" o mandar directo a producir cuando hay agotamiento de glucosa prefrontal o exceso de glutamato.
- Paso 1 Obligatorio ante Dispersi\xF3n o Fatiga: DETENER TODO (cero pantallas) y aplicar reseteo seg\xFAn nivel: 5 min (reseteo atencional), 12 min (recuperaci\xF3n prefrontal), 30 min (NSDR profundo) o 60 min (restauraci\xF3n basal).
- Paso 2 Post-Meditaci\xF3n: Reci\xE9n tras recuperar calma basal, elegir Opci\xF3n A (Modo Yo Robot 5-4-3-2-1: micro-acci\xF3n de 15\u201330 segundos) u Opci\xF3n B (si es valle vespertino >13:00, mover lo anal\xEDtico a ma\xF1ana 07:00\u201312:00 y pasar a caminata o tarea mec\xE1nica sin culpa).
- Criterio D\xEDa No Cero (Contra el Efecto "Qu\xE9 Carajo"): En d\xEDas cr\xEDticos, proteger la identidad con la Tr\xEDada M\xEDnima: 3 min de estiramiento junto a la silla + 1 l\xEDnea de avance de 30s + perd\xF3n radical al Yo Pasado.`
};
var CATALOGO_TAGS_MECANISMO = [
  {
    tag: "#paralisis_perfeccionismo",
    keywords: ["perfeccion", "perfeccionismo", "no se por donde", "abrumado", "mucho", "complejo", "grande", "empezar", "arrancar", "bloqueo", "paralisis"]
  },
  {
    tag: "#fatiga_tarde",
    keywords: ["tarde", "almuerzo", "13:", "14:", "15:", "16:", "17:", "cansado", "fatiga", "sue\xF1o", "pesadez", "energia baja", "sin ganas", "agotado"]
  },
  {
    tag: "#ambiguedad_externa",
    keywords: ["ambiguo", "no queda claro", "esperando", "correccion", "mentor", "cliente", "requerimiento", "incertidumbre", "duda"]
  },
  {
    tag: "#busqueda_aprobacion",
    keywords: [
      "rechazo",
      "que diran",
      "aprobacion",
      "validacion",
      "timidez",
      "verg\xFCenza",
      "quedar mal",
      "tonto",
      "mirada",
      "atractivo",
      "social",
      "boliche",
      "inseguridad",
      "aceptacion",
      "ansiedad social",
      "fiesta",
      "salida",
      "chica",
      "mujer",
      "descaro"
    ]
  },
  {
    tag: "#ansiedad_examen",
    keywords: ["examen", "tesis", "entrega", "plazo", "fecha limite", "presion", "rendir", "defensa", "miedo a fallar"]
  },
  {
    tag: "#efecto_que_carajo",
    keywords: ["perdi el dia", "ya fue", "culpa", "arruine", "todo o nada", "abandone", "rompi la racha", "frustracion"]
  },
  {
    tag: "#sobreestimulacion_digital",
    keywords: ["pesta\xF1as", "celular", "redes", "youtube", "disperso", "distraido", "multitarea", "pantallas", "ruido mental"]
  },
  {
    tag: "#valor_intrinseco",
    keywords: ["valor intrinseco", "autoestima", "inseguridad", "inferior", "comparacion", "estandar", "valgo poco", "sentirme menos"]
  },
  {
    tag: "#alma_libre",
    keywords: ["alma libre", "desinhibicion", "espontaneo", "divertirse", "sin filtro", "soltarse", "encarar", "santos", "artur", "lucho"]
  },
  {
    tag: "#humor_adaptativo",
    keywords: ["humor", "reirse", "plan cancelado", "chiste", "desdramatizar", "ligereza", "no pasa nada"]
  },
  {
    tag: "#rigidez_perfeccionista",
    keywords: ["rigidez", "todo o nada", "no salio como queria", "frustrado porque cambio", "obsesion", "control"]
  },
  {
    tag: "#inmunidad_rechazo",
    keywords: ["rechazo", "inmunidad rechazo", "miedo al no", "me dijeron que no", "ignorado", "desprecio", "miraron mal"]
  },
  {
    tag: "#ideal_adaptado",
    keywords: ["ideal adaptado", "ropa sucia", "imprevisto", "no es perfecto", "adaptar", "hacer lo que se puede", "plan b"]
  },
  {
    tag: "#control_ira_leon",
    keywords: ["ira", "enojo", "renan", "bronca", "le\xF3n", "leon", "calmar la ira", "explotar", "discutir", "respirar hondo"]
  },
  {
    tag: "#sabiduria_retroceso",
    keywords: ["pedir perdon", "retroceder", "disculpa", "humildad", "bajar un cambio", "ceder"]
  },
  {
    tag: "#gratitud_activa",
    keywords: ["gratitud", "privilegio", "oportunidad", "agradecer", "queja", "agradecido", "salud"]
  },
  {
    tag: "#arranque_645",
    keywords: ["6:45", "alarma", "contar hasta 3", "agua fria", "audio horus", "levantarse", "cama"]
  },
  {
    tag: "#inercia_sueno",
    keywords: ["inercia", "sue\xF1o", "pesadez al despertar", "5 minutos mas", "quedarse acostado", "fiaca"]
  },
  {
    tag: "#entreno_poder",
    keywords: ["7:30", "entreno", "gimnasio", "pesas", "musculo", "atleta", "hombros", "espalda", "abdominales"]
  },
  {
    tag: "#autoimagen_fisica",
    keywords: ["espejo", "ropa ajustada", "porte", "definicion", "postura", "cuerpo fuerte"]
  },
  {
    tag: "#estudio_ingenieria",
    keywords: ["ingenieria", "estudio", "17:00", "5:00", "temporizador", "discord", "fisica", "codigo", "titulo"]
  },
  {
    tag: "#tolerancia_confusion",
    keywords: ["confusion", "desorientado", "primeros 15 minutos", "no entiendo nada", "mecanico", "complejo al inicio"]
  },
  {
    tag: "#dia_no_cero",
    keywords: ["dia no cero", "no cero", "al menos algo", "accion minima", "salvar el dia", "apatia"]
  },
  {
    tag: "#demonio_interno",
    keywords: ["demonio interno", "un video mas", "lol", "partida", "memes", "procrastinar", "ma\xF1ana empiezo"]
  }
];
function detectarRamaYTags(textoUsuario, historialReciente = []) {
  const ultimoTexto = (textoUsuario || "").toLowerCase();
  const contextoCombinado = [
    ultimoTexto,
    ...historialReciente.slice(-2).map((m) => (m.text || m.content || "").toLowerCase())
  ].join(" ");
  const scoreRamas = {
    proyectos: 0,
    vinculos: 0,
    habitos: 0
  };
  const kwProyectos = [
    "tesis",
    "gitflow",
    "codigo",
    "programar",
    "facet",
    "cooperadora",
    "react",
    "sql",
    "pgadmin",
    "pocketbase",
    "arquitectura",
    "bug",
    "funcion",
    "endpoint",
    "estudio",
    "ingenieria",
    "materia",
    "examen",
    "saborido",
    "gra\xF1a",
    "namour",
    "sergio",
    "proyecto",
    "api",
    "prompt",
    "groq",
    "repositorio",
    "github",
    "vercel"
  ];
  const kwVinculos = [
    "gente",
    "social",
    "hablar",
    "persona",
    "mujer",
    "chica",
    "amigo",
    "pareja",
    "familia",
    "conversacion",
    "rechazo",
    "aprobacion",
    "timidez",
    "carisma",
    "humor",
    "espontaneo",
    "da igual",
    "video",
    "camara",
    "exposicion",
    "reunion",
    "vinculo",
    "relacion",
    "boliche",
    "boliches",
    "inseguridad",
    "aceptacion",
    "ansiedad social",
    "fiesta",
    "salida",
    "descaro",
    "desinhibicion",
    "validacion",
    "atractivo",
    "encare",
    "conocer gente",
    "miedo al rechazo",
    "autoestima social"
  ];
  const kwHabitos = [
    "energia",
    "cansado",
    "fatiga",
    "dormir",
    "sue\xF1o",
    "meditar",
    "meditacion",
    "nsdr",
    "rutina",
    "ma\xF1ana",
    "tarde",
    "entrenar",
    "gimnasio",
    "estiramiento",
    "agua",
    "cafe",
    "dia no cero",
    "procrastinar",
    "disperso",
    "foco",
    "habito",
    "ansiedad",
    "estres",
    "52/17"
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
  let rama = "habitos";
  if (scoreRamas.vinculos >= scoreRamas.proyectos && scoreRamas.vinculos >= scoreRamas.habitos && scoreRamas.vinculos > 0) {
    rama = "vinculos";
  } else if (scoreRamas.proyectos >= scoreRamas.vinculos && scoreRamas.proyectos >= scoreRamas.habitos && scoreRamas.proyectos > 0) {
    rama = "proyectos";
  } else if (scoreRamas.habitos > 0) {
    rama = "habitos";
  } else {
    rama = "proyectos";
  }
  const tagsDetectados = [];
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
function asegurarFichaInmutable(mem, index = 1) {
  if (mem.fichaInmutable && mem.fichaInmutable.detonante_exacto) {
    return {
      ...mem.fichaInmutable,
      inmutable: true
    };
  }
  if (mem.summary && mem.summary.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(mem.summary);
      if (parsed && parsed.detonante_exacto && parsed.rama_id) {
        return { ...parsed, inmutable: true };
      }
    } catch {
    }
  }
  const fechaIso = (mem.createdAt || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0];
  const { rama, tags } = detectarRamaYTags(`${mem.category || ""} ${mem.text || ""}`);
  const ramaFinal = mem.rama_id || (mem.category === "proyectos" || mem.category === "vinculos" || mem.category === "habitos" ? mem.category : rama);
  const tagsFinales = mem.tags_mecanismo && mem.tags_mecanismo.length > 0 ? mem.tags_mecanismo : tags;
  return {
    id: mem.id.startsWith("VIV-") ? mem.id : `VIV-${fechaIso}-${String(index).padStart(2, "0")}`,
    fecha: fechaIso,
    rama_id: ramaFinal,
    tags_mecanismo: tagsFinales,
    contexto_situacional: {
      momento: mem.text.includes("07:00") || mem.text.includes("ma\xF1ana") ? "Franja Matutina (07:00-12:00)" : mem.text.includes("tarde") || mem.text.includes("16:00") ? "Franja Vespertina (>13:00)" : "Entorno habitual de trabajo/estudio",
      nivel_energia: mem.text.toLowerCase().includes("fatiga") || mem.text.toLowerCase().includes("cansad") ? "bajo" : "alto",
      factores_externos: "Registrado en base de conocimiento personal"
    },
    detonante_exacto: (mem.summary || mem.text).slice(0, 140),
    reaccion_inicial: "Tendencia a dispersi\xF3n o fricci\xF3n de inicio si no se acota el foco",
    solucion_aplicada: mem.text.slice(0, 180),
    resultado: "exito",
    inmutable: true
  };
}
function podarFichasParaInferencia(memories, strategies, ramaActiva, tagsConsulta, maxFichas = 5) {
  const fichasMems = (memories || []).map((m, idx) => asegurarFichaInmutable(m, idx + 1));
  const fichasStrats = (strategies || []).map((s, idx) => {
    const { rama, tags } = detectarRamaYTags(`${s.name} ${s.situation} ${s.result}`);
    const fechaIso = (s.createdAt || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0];
    return {
      id: s.id.startsWith("VIV-") ? s.id : `VIV-STRAT-${String(idx + 1).padStart(2, "0")}`,
      fecha: fechaIso,
      rama_id: s.rama_id || rama,
      tags_mecanismo: s.tags_mecanismo && s.tags_mecanismo.length > 0 ? s.tags_mecanismo : tags,
      contexto_situacional: {
        momento: s.situation,
        nivel_energia: s.resultType === "positivo" ? "alto" : "bajo",
        factores_externos: s.reason || "Evaluaci\xF3n emp\xEDrica previa"
      },
      detonante_exacto: s.situation,
      reaccion_inicial: s.resultType === "negativo" ? s.name : "Fricci\xF3n operativa ante la tarea",
      solucion_aplicada: `${s.name} -> ${s.result}`,
      resultado: s.resultType === "positivo" ? "exito" : "fallo",
      inmutable: true
    };
  });
  const todasLasFichas = [...fichasMems, ...fichasStrats];
  const puntuadas = todasLasFichas.map((ficha) => {
    let score = 0;
    const tagsComunes = ficha.tags_mecanismo.filter((t) => tagsConsulta.includes(t));
    score += tagsComunes.length * 4;
    if (ficha.rama_id === ramaActiva) score += 3;
    if (ficha.resultado === "exito") score += 2;
    return { ficha, score, esAnalogiaTransversal: ficha.rama_id !== ramaActiva && tagsComunes.length > 0 };
  });
  puntuadas.sort((a, b) => b.score - a.score);
  return puntuadas.slice(0, maxFichas).map((p) => p.ficha);
}
function formatearFichasInmutablesCompactas(fichas, ramaActiva) {
  if (!fichas || fichas.length === 0) {
    return "Sin fichas previas asociadas.";
  }
  return fichas.map((f) => {
    const tipoCruce = f.rama_id === ramaActiva ? `RAMA:${f.rama_id}` : `ANALOG\xCDA_TRANSVERSAL_DESDE:${f.rama_id}`;
    return `[${f.id} | ${tipoCruce} | Tags: ${f.tags_mecanismo.join(", ")}]
  \u2022 Contexto: ${f.contexto_situacional.momento} (Energ\xEDa: ${f.contexto_situacional.nivel_energia} | Entorno: ${f.contexto_situacional.factores_externos})
  \u2022 Detonante: ${f.detonante_exacto}
  \u2022 Sesgo/Reacci\xF3n: ${f.reaccion_inicial}
  \u2022 Acci\xF3n de Quiebre: ${f.solucion_aplicada} -> Resultado: ${f.resultado.toUpperCase()}`;
  }).join("\n\n");
}
function construirHiloActivoTexto(messages, decisions = [], currentState, ramaActiva) {
  const ultimos = (messages || []).slice(-5);
  const historialLineas = ultimos.map((m) => {
    const rol = m.sender === "user" || m.role === "user" ? "Usuario" : "Asesor";
    const txt = (m.text || m.content || "").replace(/\s+/g, " ").trim();
    return `- [${rol}]: ${txt.slice(0, 280)}`;
  }).join("\n");
  const decisionesActivas = (decisions || []).filter((d) => d.status !== "descartada").slice(0, 3).map((d) => `[Acuerdo ${d.status}]: ${d.decision} (${d.reason})`).join(" | ");
  const bloqueosAbiertos = (currentState?.openProblems || []).slice(0, 2).join(" | ");
  return [
    `Rama activa detectada: ${ramaActiva?.toUpperCase() || "GENERAL"}`,
    decisionesActivas ? `Acuerdos vigentes (no repetir ni contradecir): ${decisionesActivas}` : "",
    bloqueosAbiertos ? `Bloqueos abiertos: ${bloqueosAbiertos}` : "",
    historialLineas ? `\xDAltimas interacciones del hilo:
${historialLineas}` : "Inicio de hilo nuevo."
  ].filter(Boolean).join("\n");
}
function consultarArbolPorRamaYNodo(arbol, ramaActiva, tagsConsulta, maxFichas = 5) {
  if (!arbol || !arbol.ramas) return [];
  const fichasSeleccionadas = [];
  const idsAgregados = /* @__PURE__ */ new Set();
  const agregarFichaPorId = (id) => {
    if (idsAgregados.has(id)) return;
    const ficha = arbol.fichasPorId[id];
    if (ficha) {
      idsAgregados.add(id);
      fichasSeleccionadas.push(ficha);
    }
  };
  const ramaObj = arbol.ramas[ramaActiva];
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
  if (fichasSeleccionadas.length < maxFichas && ramaObj && ramaObj.fichas_recientes_ids) {
    for (const fId of ramaObj.fichas_recientes_ids) {
      if (fichasSeleccionadas.length >= maxFichas) break;
      agregarFichaPorId(fId);
    }
  }
  return fichasSeleccionadas;
}
var BANCO_HECHOS_POR_SITUACION = [
  {
    id: "HECHO-FISICA3-HERMANA",
    situaciones: ["capacidad_estudio"],
    relato_corto: "Cuando vivias en lo de tu hermana y promocionaste Fisica 3: mientras la mayoria abandonaba, vos te sentabas concentrado, ibas a todas las consultas con la profesora hasta entender todo y volvias a liquidar los practicos."
  },
  {
    id: "HECHO-ENTRENO-AURICULARES",
    situaciones: ["constancia_fisica", "capacidad_estudio"],
    relato_corto: "La epoca en que entrenabas todos los dias sin importar como venia el dia: te calzabas los auriculares y cumplias levantando la barra, haciendo espalda, hombros y abdominales sintiendo el calor y la fuerza en el cuerpo."
  },
  {
    id: "HECHO-BAR-RUBIO",
    situaciones: ["desinhibicion_social"],
    relato_corto: "La noche en el bar cuando fuiste a la barra con total determinacion, dijiste que eras capaz de encarar a cualquiera, te acercaste sin pensarlo al pibe rubio de ojos azules, hablaste suelto y terminaste rechazando su invitacion al departamento."
  },
  {
    id: "HECHO-BAILE-LUCHO-ARTUR",
    situaciones: ["desinhibicion_social"],
    relato_corto: "Cuando salias a bailar con Lucho o caminabas por Artur totalmente desinhibido, sonriendo sin esperar nada, haciendo contacto visual y hablando espontaneamente porque te daba igual el resultado."
  },
  {
    id: "HECHO-CASA-RENAN",
    situaciones: ["autocontrol_ira", "adaptacion_imprevistos"],
    relato_corto: "El aprendizaje de lo de Renan despues de un dia agotador: entender la diferencia entre explotar en caliente por una tonteria o congelar todo al primer insulto, respirar como un leon calmando su ira y elegir no darle importancia."
  }
];
function obtenerHechoDosificadoSinRepetir(messages, textoUsuario) {
  const ultimosMensajesAsistente = (messages || []).filter((m) => m.sender === "assistant" || m.role === "assistant").slice(-4).map((m) => (m.text || m.content || "").toLowerCase());
  const ultimoAsistente = ultimosMensajesAsistente[ultimosMensajesAsistente.length - 1] || "";
  const palabrasAncla = ["fisica 3", "f\xEDsica 3", "hermana", "rubio", "lucho", "artur", "renan", "ren\xE1n", "auriculares"];
  if (palabrasAncla.some((p) => ultimoAsistente.includes(p))) {
    return "NINGUNO EN ESTE TURNO (PROHIBIDO citar casos pasados como Fisica 3, el bar, Lucho o Renan en esta respuesta; enfocate 100% en desenmascarar el autoengano actual y guiar la accion en presente).";
  }
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
var MAPA_AUTOENGANO_E_INSTINTOS = `
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
function evaluarModoInteraccion(textoUsuario, historialReciente = []) {
  const txt = (textoUsuario || "").trim().toLowerCase();
  const palabras = txt.split(/\s+/).filter(Boolean);
  const regexComoVamos = /(como vamos|cómo vamos|como venimos|cómo venimos|cumpliendo los objetivos|mis objetivos|en que estoy fallando|en qué estoy fallando|dame un reporte|evaluame|evalúame|balance de la semana|balance del mes)/i;
  if (regexComoVamos.test(txt)) {
    return {
      modo: "auditoria_como_vamos",
      motivo: "El usuario solicit\xF3 auditor\xEDa de cumplimiento de objetivos, horarios de reporte, fallos y valoraci\xF3n de m\xE9todos exitosos."
    };
  }
  const tieneIndiciosHorarios = /(?:son las|a las|tipo \d+|mediod[ií]a|durante la mañana|en la tarde|\d{1,2}:\d{2}|\d{1,2} y \d{2})\b/i.test(txt);
  const tieneIndiciosEstadoOAccion = /(?:mi estado|energ[ií]a|desganado|desgano|tranquilo|positivo|presionado|presi[oó]n|foco|productiv|meditaci[oó]n|avanzar|estudiar|unidad|compromiso|promet[ií]|fogaje|cosas intermedia)/i.test(txt);
  if (tieneIndiciosHorarios && tieneIndiciosEstadoOAccion) {
    return {
      modo: "reporte_operativo_checkin",
      motivo: "El usuario envi\xF3 un reporte operativo / check-in detallado con horas, estado bioemocional, m\xE9todos aplicados o metas de estudio."
    };
  }
  const ultimoMensajeAsistente = [...historialReciente].reverse().find((m) => m.sender === "assistant" || m.role === "assistant");
  const asistentePreguntoRecien = ultimoMensajeAsistente && (ultimoMensajeAsistente.text || ultimoMensajeAsistente.content || "").includes("?");
  const tieneContextoEspecifico = /(tesis|facet|fisica|física|codigo|código|sql|examen|discord|lol|juego|alarma|6:45|7:30|entreno|gimnasio|boliche|santos|artur|bar|chica|mujer|renan|renán|ropa|reunion|reunión|ingles|inglés)/i.test(txt);
  if (palabras.length <= 9 && !tieneContextoEspecifico && !asistentePreguntoRecien) {
    return {
      modo: "sondeo_contexto_vago",
      motivo: "El mensaje es breve/vago y no especifica si el detonante es psicol\xF3gico o productivo, por qu\xE9 importa ahora o el nivel de energ\xEDa."
    };
  }
  return {
    modo: "consejo_tactico_directo",
    motivo: "El mensaje contiene contexto suficiente para desenmascarar el autoenga\xF1o y prescribir el protocolo exacto."
  };
}
function buildRepairedSystemPrompt(params) {
  const modo = params.modoInteraccion || "consejo_tactico_directo";
  const horaInfo = params.horaActualTexto || (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const bloqueInstruccionPorModo = modo === "sondeo_contexto_vago" ? `MODO ACTIVO EN ESTE TURNO: [1. SONDEO CONTEXTUAL QUIR\xDARGICO ANTE MENSAJE VAGO]
Juan acaba de enviar un mensaje corto o vago (como "estoy mal", "me siento trabado" o "no tengo ganas") sin explicar el detonante ni el contexto.
- PROHIBIDO adivinar qu\xE9 le pasa o lanzarle un discurso largo a ciegas.
- Respond\xE9 en UN SOLO P\xC1RRAFO CORTO (m\xE1ximo 3 a 4 l\xEDneas):
  1) Mencion\xE1 con naturalidad la hora actual (${horaInfo}) para anclar el momento del d\xEDa.
  2) Hacele exactamente 2 preguntas directas y cortas para destrabar el contexto y registrar el patr\xF3n horario:
     \u2022 \xBFQu\xE9 hecho puntual pas\xF3 reci\xE9n (viene por el lado de estudio/productividad o por algo social/personal)?
     \u2022 \xBFQu\xE9 objetivo o tarea importante del d\xEDa te est\xE1 frenando esto ahora mismo y c\xF3mo est\xE1s de energ\xEDa f\xEDsica del 1 al 10?` : modo === "auditoria_como_vamos" ? `MODO ACTIVO EN ESTE TURNO: [3. AUDITOR\xCDA INTEGRAL "\xBFC\xD3MO VAMOS?"]
Juan te est\xE1 preguntando c\xF3mo vienen con los objetivos semanales/mensuales, los horarios de sus reportes y sus patrones.
Basate ESTRICTAMENTE en los datos de <auditoria_objetivos_y_horarios> y respond\xE9 cubriendo estos 5 puntos con claridad y firmeza:
1) CUMPLIMIENTO DE OBJETIVOS: Decile con n\xFAmeros exactos c\xF3mo va en sus Objetivos de Crecimiento (Psicol\xF3gicos) y en sus Objetivos Productivos (semanales y mensuales).
2) EVALUACI\xD3N DEL HORARIO Y CONSTANCIA DE REPORTES (0 a 15 diarios): Evalu\xE1 a qu\xE9 horas est\xE1 haciendo los reportes, en qu\xE9 franja horaria rinde mejor, en qu\xE9 horario cae su \xE1nimo/productividad y marcale sin filtro si hubo d\xEDas o franjas con 0 reportes (puntos ciegos donde suele esconderse el "permitido" o la evasi\xF3n).
3) EN QU\xC9 EST\xC1 FALLANDO Y PATRONES REPETIDOS: Se\xF1al\xE1 los obst\xE1culos concretos donde tropez\xF3 esta semana.
4) RETROALIMENTACI\xD3N CON EXPERIENCIAS NEGATIVAS DONDE TUVO \xC9XITO (VALORACI\xD3N DEL M\xC9TODO): Cit\xE1 las experiencias negativas psicol\xF3gicas o productivas registradas en <auditoria_objetivos_y_horarios> y <experiencias_del_arbol> donde Juan estuvo en esa misma situaci\xF3n dif\xEDcil pero TUVO \xC9XITO, valorando expl\xEDcitamente el m\xE9todo que aplic\xF3 esa vez (ej. levantarse antes de contar hasta 3 con agua fr\xEDa y audio Horus, tolerar los primeros 15 min de confusi\xF3n en estudio, respiraci\xF3n del le\xF3n en lo de Ren\xE1n, Ideal Adaptado con la ropa sucia o postura erguida en el boliche).
5) ACCI\xD3N INMEDIATA PARA HOY (${horaInfo}): Dale una \xFAnica consigna concreta para ganar la franja horaria actual.` : modo === "reporte_operativo_checkin" ? `MODO ACTIVO EN ESTE TURNO: [4. RECEPCI\xD3N Y DESGLOSE DE REPORTE OPERATIVO / CHECK-IN]
Juan acaba de enviar un reporte de avance y estado de su jornada (${horaInfo}).
DATOS YA REGISTRADOS EN EL SISTEMA:
${params.desgloseReporteTexto || "M\xE9tricas, m\xE9todo exitoso y metas de estudio asentadas en ZenDB y PocketBase."}

INSTRUCCIONES CLAVE DE RESPUESTA:
1) CONFIRMAR EL DESGLOSE DE LO GUARDADO:
   Inici\xE1 confirmando claramente qu\xE9 datos quedaron asentados en su registro: horario exacto, m\xE9tricas de energ\xEDa/\xE1nimo, el m\xE9todo aplicado registrado como \xC9XITO ante la fricci\xF3n, y las metas declaradas para hoy.
2) VALORAR EL M\xC9TODO QUE FUNCION\xD3:
   Valor\xE1 con frialdad de ingeniero que a las 10:30 hs haya ejecutado la meditaci\xF3n de 12 min para revertir el desgano y recuperar la calma. Destac\xE1 que ese es exactamente el protocolo a consolidar: ante el baj\xF3n, corte mec\xE1nico con meditaci\xF3n/NSDR en vez de evadirse.
3) FRENAR EL DESV\xCDO EN TAREAS SECUNDARIAS ("FOGAJE"):
   Marcale sin anestesia que ponerse a 'mejorar la app' o hacer tareas intermedias cuando el objetivo principal era estudiar es la trampa cl\xE1sica de la procrastinaci\xF3n productiva ("fogaje").
4) PLAN T\xC1CTICO POR BLOQUES (TIME-BOXING) PARA SUS METAS REALES:
   NO le digas que no busque terminar la Unidad 5 y 7 ni desprecies sus objetivos. Al contrario: armale un plan t\xE1ctico con el reloj en mano para los minutos exactos que le quedan antes de su compromiso de las 15:00 hs para que liquide o avance masivamente en la Unidad 5 y barra la Unidad 7:
   \u2022 Bloque 1 (primeros 75 min): Ataque a Unidad 5 (conceptos clave y ejercicios pr\xE1cticos troncales).
   \u2022 Pausa T\xE1ctica de 5 min: Agua fr\xEDa, respiraci\xF3n de le\xF3n, postura erguida.
   \u2022 Bloque 2 (siguientes 60 min): Barrido de Unidad 7 (estructura general, definiciones y preguntas de examen).
   \u2022 Cierre 14:50 a 15:00 hs: Corte limpio para salir al compromiso con la conciencia impecable.` : `MODO ACTIVO EN ESTE TURNO: [2. CONSEJO T\xC1CTICO DIRECTO CON GU\xCDA PR\xC1CTICA]
1) DESENMASCARAR EL AUTOENGA\xD1O: Mostrale c\xF3mo su mente o el demonio interno lo quiere enga\xF1ar (el "permitido corto" de LOL/videos/memes, "ma\xF1ana empiezo", buscar aprobaci\xF3n externa en el boliche o encapricharse cuando un escenario es imperfecto).
2) APLICAR EL PROTOCOLO EXACTO DE SU GU\xCDA SEG\xDAN EL CASO:
   - Si es Autoconfianza/Social: Postura erguida inmediata, mirada firme sin esquivar, respiraci\xF3n lenta y decretos ("Yo controlo c\xF3mo sentirme", "Si no cumplo los est\xE1ndares de alguien, que se pudra") o actitud Alma Libre sin esperar resultado (como en Santos a las 3 AM, Artur o con Lucho).
   - Si es Enojo/Imprevisto/Ropa sucia/Discusi\xF3n: Congelamiento t\xE1ctico al primer segundo, respirar "como un le\xF3n calmando su ira", construir el Ideal Adaptado (buscar la mejor opci\xF3n real dentro de la imperfecci\xF3n) o Sabidur\xEDa de Retroceso con humildad (como en lo de Ren\xE1n).
   - Si es Rutina Matutina (6:45 AM): Levantarse antes de contar hasta 3 sin negociar, directo al ba\xF1o, agua fr\xEDa y audio Horus (10 min) para entrenar a las 7:30 AM con auriculares.
   - Si es Estudio/Ingenier\xEDa (5:00 PM / avisos Discord): Apagar TV, celular en No Molestar, temporizador, atravesar los primeros 10-15 min aceptando que "es normal sentirse desorientado la primera vez, es puramente mec\xE1nico", ver 1 video de YouTube para el panorama general y resolver solo para cerrar a las 11:00 PM rumbo al t\xEDtulo de ingeniero y portafolio.
   - Si es Apat\xEDa/D\xEDa Complicado: Confrontar al demonio interno ("\xBFSi sab\xE9s que ten\xE9s el control, qu\xE9 carajo est\xE1s haciendo?", "S\xE9 que esto me costar\xE1, pero dejar\xE9 de hacerlo"), encender enojo constructivo y ejecutar la acci\xF3n m\xEDnima para no quedar en D\xEDa Cero.
3) VALORAR EL M\xC9TODO DE \xC9XITO PREVIO: Cuando cites una experiencia negativa superada, destac\xE1 por qu\xE9 el m\xE9todo que aplic\xF3 Juan esa vez funcion\xF3 y pedile que repita exactamente esa mec\xE1nica ahora.`;
  return `Sos la voz m\xE1s l\xFAcida, persuasiva y despierta de Juan Francisco Cano. Habl\xE1s de vos a vos (voseo argentino directo, claro y firme).

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
${params.auditoriaComoVamosTexto || "Auditor\xEDa disponible bajo demanda."}
</auditoria_objetivos_y_horarios>

<experiencias_del_arbol>
${params.fichasCompactasTexto}
</experiencias_del_arbol>

<hecho_real_habilitado_en_este_turno>
${params.hechoDosificadoTexto || "Usar experiencias de la auditor\xEDa o persuasi\xF3n directa en presente."}
</hecho_real_habilitado_en_este_turno>

<hilo_reciente>
${params.hiloRecienteTexto}
</hilo_reciente>

ESTRUCTURA DE SALIDA OBLIGATORIA:
<analisis_contextual>
- Modo y especificidad: [${modo}]
- Autoengano o instinto detectado: [Qu\xE9 excusa, gatillo o patr\xF3n horario est\xE1 operando a las ${horaInfo}]
- Enfoque elegido y metodo valorado: [Qu\xE9 protocolo o caso de \xE9xito propio se activa]
</analisis_contextual>

<consejo_tactico>
[Tu respuesta directa en voseo argentino cumpliendo estrictamente el MODO ACTIVO EN ESTE TURNO.]
</consejo_tactico>`;
}
var ASSISTANT_PREFILL_TAG = "<analisis_contextual>\n- Autoengano o instinto detectado:";
function parseRepairedTacticalOutput(rawOutput, ramaDetectada, prefillUsado = false) {
  const fullText = prefillUsado && !rawOutput.trim().startsWith("<analisis_contextual>") ? `${ASSISTANT_PREFILL_TAG} ${rawOutput.trim()}` : rawOutput.trim();
  const analisisMatch = fullText.match(/<analisis_contextual>([\s\S]*?)<\/analisis_contextual>/i);
  const consejoMatch = fullText.match(/<consejo_tactico>([\s\S]*?)<\/consejo_tactico>/i);
  const analisisRaw = analisisMatch ? analisisMatch[1].trim() : "";
  let consejoTactico = consejoMatch ? consejoMatch[1].trim() : "";
  if (!consejoTactico) {
    const splitAfterAnalisis = fullText.split(/<\/analisis_contextual>/i);
    if (splitAfterAnalisis.length > 1) {
      consejoTactico = splitAfterAnalisis[1].replace(/<\/?consejo_tactico>/gi, "").trim();
    } else {
      consejoTactico = fullText.replace(/<\/?analisis_contextual>/gi, "").replace(/<\/?consejo_tactico>/gi, "").trim();
    }
  }
  const extractLine = (labelRegex, fallback) => {
    const m = analisisRaw.match(labelRegex);
    return m && m[1] ? m[1].trim() : fallback;
  };
  const autoenganoOContinuidad = extractLine(
    /-\s*(?:Autoengano\s*o\s*instinto\s*detectado|Continuidad(?:\s*y\s*cambio\s*de\s*enfoque)?|Modo\s*y\s*especificidad):\s*([^\n]+)/i,
    "Evaluaci\xF3n directa sobre consulta activa."
  );
  const enfoqueElegido = extractLine(
    /-\s*(?:Enfoque\s*elegido\s*y\s*(?:control\s*de\s*repeticion|metodo\s*valorado)|Consejo\s*gen[eé]rico\s*descartado):\s*([^\n]+)/i,
    "Enfoque persuasivo en tiempo presente."
  );
  const patronDetectado = extractLine(
    /-\s*(?:Patr[oó]n detectado|Ancla o modulo activado):\s*([^\n]+)/i,
    `Cruce de mecanismo en rama ${ramaDetectada}.`
  );
  const fichasCitadas = Array.from(new Set(fullText.match(/VIV-[A-Z0-9-]+/g) || []));
  const formattedMessage = consejoTactico.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^[0-9]+\.\s*/gm, "").replace(/^[-•]\s*/gm, "").trim();
  return {
    formattedMessage,
    tacticalAnalysis: {
      continuidad: autoenganoOContinuidad,
      consejoGenericoDescartado: enfoqueElegido,
      patronDetectado,
      consejoTactico,
      ramaDetectada,
      fichasCitadas
    }
  };
}

// src/lib/progressAuditor.ts
var PLANTILLAS_RASGOS_OFICIALES = {
  "PSI-1_autoconfianza": {
    codigo: "PSI-1_autoconfianza",
    titulo: "Autoconfianza y Valor Intr\xEDnseco en Entornos Sociales",
    tipo: "crecimiento_psicologico",
    rama_id: "vinculos",
    tags_mecanismo: ["#valor_intrinseco", "#busqueda_aprobacion"],
    franjaCritica: "23:00_cierre_o_social",
    metaSugeridaSemanal: 4,
    unidad: "episodios_exitosos",
    decretoClave: "Yo controlo c\xF3mo sentirme. Yo puedo cambiar ahora c\xF3mo siento las cosas. Si no cumplo los est\xE1ndares de alguien, que se pudra.",
    protocoloPasos: [
      "Corregir de inmediato la postura: hombros erguidos y mirada firme sin esquivar miradas.",
      "Ejecutar respiraci\xF3n lenta y profunda para disipar tensi\xF3n f\xEDsica.",
      "Repetir decretos de control interno y sonre\xEDr sin esperar ning\xFAn resultado."
    ],
    anclaRealExito: "Entrada y pista del boliche: pasar de la incomodidad a postura erguida, observar en calma y afirmar presencia masculina sin buscar aprobaci\xF3n."
  },
  "PSI-2_alma_libre": {
    codigo: "PSI-2_alma_libre",
    titulo: "Desinhibici\xF3n y Espontaneidad ('Alma Libre')",
    tipo: "crecimiento_psicologico",
    rama_id: "vinculos",
    tags_mecanismo: ["#alma_libre", "#paralisis_perfeccionismo"],
    franjaCritica: "23:00_cierre_o_social",
    metaSugeridaSemanal: 3,
    unidad: "episodios_exitosos",
    decretoClave: "Act\xFAo por instinto y diversi\xF3n; el resultado final me da igual.",
    protocoloPasos: [
      "Regla de acci\xF3n inmediata: avanzar antes de que aparezca la duda mental.",
      "Iniciar con una pregunta simple o comentario despreocupado sin intenciones ocultas.",
      "Sostener tono descarado pero relajado, cuerpo suelto y voz clara."
    ],
    anclaRealExito: "Salidas en Santos a las 3 AM, noches en el bar Artur y salidas con Lucho besando a dos chicas en la misma noche fluyendo sin filtros."
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
    decretoClave: "Me r\xEDo del tropiezo; un contratiempo es insignificante y no arruina mi estado.",
    protocoloPasos: [
      "Soltar la tensi\xF3n dibujando una sonrisa sincera ante la falla o silencio.",
      "Reinterpretar el error o cambio de planes con sentido de diversi\xF3n.",
      "Cortar la rumiaci\xF3n en el acto sin engancharse en culpa ni rol de v\xEDctima."
    ],
    anclaRealExito: "Re\xEDrse cuando una charla en la barra no fluye o cuando un plan de s\xE1bado a la noche cambia a \xFAltimo momento, adapt\xE1ndose en paz."
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
    decretoClave: "Mi valor es intocable; la desaprobaci\xF3n externa es biol\xF3gicamente irrelevante.",
    protocoloPasos: [
      "Reconocer y descartar la b\xFAsqueda de aceptaci\xF3n como un impulso primitivo irrelevante.",
      "Enfocar la atenci\xF3n 100% en la seguridad proyectada y el estado interno.",
      "Mantener porte firme y voz clara sin intentar complacer a nadie."
    ],
    anclaRealExito: "Barra del bar: hablar con firmeza con el due\xF1o, encarar sin dudar al chico rubio de ojos azules y rechazar su invitaci\xF3n al departamento."
  },
  "PSI-5_ideal_adaptado_leon": {
    codigo: "PSI-5_ideal_adaptado_leon",
    titulo: "Control Emocional ('Le\xF3n calmando su ira') e Ideal Adaptado",
    tipo: "crecimiento_psicologico",
    rama_id: "habitos",
    tags_mecanismo: ["#ideal_adaptado", "#control_ira_leon", "#sabiduria_retroceso"],
    franjaCritica: "13:00_transicion_siesta",
    metaSugeridaSemanal: 5,
    unidad: "episodios_exitosos",
    decretoClave: "Las cosas solo me afectan si yo les doy importancia; busco lo mejor dentro de la imperfecci\xF3n y s\xE9 cu\xE1ndo retroceder.",
    protocoloPasos: [
      "Congelamiento t\xE1ctico: frenar la respuesta impulsiva en el segundo exacto del enojo o imprevisto.",
      "Respirar lento 'como un le\xF3n calmando su ira' para bajar las pulsaciones.",
      "Construir el Ideal Adaptado (elegir la mejor opci\xF3n real dentro del escenario imperfecto) o aplicar Sabidur\xEDa de Retroceso con humildad."
    ],
    anclaRealExito: "Caso Ren\xE1n (frenar la ira agotado, respirar como le\xF3n y pedir perd\xF3n con humildad) y Caso Ropa Sucia antes de reuni\xF3n (elegir mejor prenda limpia con compostura)."
  },
  "PSI-6_gratitud_activa": {
    codigo: "PSI-6_gratitud_activa",
    titulo: "Gratitud Activa y Reencuadre de Convicci\xF3n",
    tipo: "crecimiento_psicologico",
    rama_id: "habitos",
    tags_mecanismo: ["#gratitud_activa", "#fatiga_tarde"],
    franjaCritica: "09:00_bloque_manana",
    metaSugeridaSemanal: 6,
    unidad: "dias",
    decretoClave: "Tengo la oportunidad, la salud y las herramientas para construir una mejor versi\xF3n de m\xED.",
    protocoloPasos: [
      "Detectar la queja o pesadez ante el estudio o entrenamiento.",
      "Reencuadrar el esfuerzo como un privilegio de crecimiento y no como un castigo."
    ],
    anclaRealExito: "Disfrutar cada repetici\xF3n f\xEDsica y cada bloque de ingenier\xEDa como inversi\xF3n directa en libertad y poder personal."
  },
  "PROD-1_arranque_645": {
    codigo: "PROD-1_arranque_645",
    titulo: "Arranque Matutino 6:45 AM + Agua Fr\xEDa + Audio Horus",
    tipo: "productivo",
    rama_id: "habitos",
    tags_mecanismo: ["#arranque_645", "#inercia_sueno"],
    franjaCritica: "06:45_arranque",
    metaSugeridaSemanal: 6,
    unidad: "dias",
    decretoClave: "La falta de voluntad NO es una opci\xF3n. Me levanto antes de contar hasta tres.",
    protocoloPasos: [
      "Mirar el celular a las 6:45 AM y ponerse de pie antes de contar hasta 3 (cero cama, cero redes).",
      "Marchar directo al ba\xF1o sin evaluar c\xF3mo se siente el cuerpo.",
      "Ba\xF1arse con agua fr\xEDa/despabilante para encender el flujo sangu\xEDneo.",
      "Escuchar audio de mentalidad (12 min) o audio 'Horus' (10 min) preparando el entreno de las 7:30 AM."
    ],
    anclaRealExito: "Corte mec\xE1nico del letargo matutino con agua fr\xEDa y audio Horus para estar entrenando a las 7:30 AM."
  },
  "PROD-2_entreno_730": {
    codigo: "PROD-2_entreno_730",
    titulo: "Entrenamiento F\xEDsico 7:30 AM con Mentalidad de Atleta",
    tipo: "productivo",
    rama_id: "habitos",
    tags_mecanismo: ["#entreno_poder", "#autoimagen_fisica"],
    franjaCritica: "07:30_entreno",
    metaSugeridaSemanal: 6,
    unidad: "dias",
    decretoClave: "Me r\xEDo del cansancio y uso la incomodidad como combustible.",
    protocoloPasos: [
      "Colocarse auriculares con m\xFAsica energizante a las 7:30 AM.",
      "Calentamiento progresivo elevando pulso y temperatura corporal.",
      "Ejecutar series de abdominales, espalda y hombros sintiendo la contracci\xF3n muscular.",
      "Finalizar frente al espejo registrando definici\xF3n f\xEDsica y porte con ropa ajustada."
    ],
    anclaRealExito: "\xC9poca entrenando todos los d\xEDas con auriculares, levantando la barra y sintiendo el calor y la fuerza en espalda, hombros y abdominales."
  },
  "PROD-3_estudio_ingenieria": {
    codigo: "PROD-3_estudio_ingenieria",
    titulo: "Bloque Estudio Ingenier\xEDa (5:00 PM a 11:00 PM) + Tolerancia a la Confusi\xF3n",
    tipo: "productivo",
    rama_id: "proyectos",
    tags_mecanismo: ["#estudio_ingenieria", "#tolerancia_confusion", "#sobreestimulacion_digital"],
    franjaCritica: "17:00_estudio_ingenieria",
    metaSugeridaSemanal: 6,
    unidad: "bloques",
    decretoClave: "Es normal sentirse desorientado los primeros 15 minutos; esto es puramente mec\xE1nico.",
    protocoloPasos: [
      "Apagar TV y poner el celular en modo 'No Molestar' lejos de la vista (cero LOL, cero memes).",
      "Fraccionar el temario en bloques peque\xF1os con temporizador.",
      "Sostener de forma continua los primeros 10 a 15 minutos aceptando la confusi\xF3n inicial sin juzgar.",
      "Mirar 1 video explicativo en YouTube para entender el panorama general y pasar de inmediato a resolver solo.",
      "Cerrar jornada a las 11:00 PM para dormir habiendo avanzado hacia el t\xEDtulo de ingeniero, ingl\xE9s y portafolio."
    ],
    anclaRealExito: "Promoci\xF3n de F\xEDsica 3 viviendo en lo de tu hermana: ir a todas las consultas con la profesora cuando nadie m\xE1s iba y liquidar todos los pr\xE1cticos."
  },
  "PROD-4_dia_no_cero": {
    codigo: "PROD-4_dia_no_cero",
    titulo: "Combate a la Apat\xEDa y Criterio 'D\xEDa No Cero'",
    tipo: "productivo",
    rama_id: "proyectos",
    tags_mecanismo: ["#dia_no_cero", "#demonio_interno", "#efecto_que_carajo"],
    franjaCritica: "17:00_estudio_ingenieria",
    metaSugeridaSemanal: 7,
    unidad: "dias",
    decretoClave: "\xBFSi sab\xE9s que ten\xE9s el control, qu\xE9 carajo est\xE1s haciendo? S\xE9 que esto me costar\xE1, pero dejar\xE9 de hacerlo.",
    protocoloPasos: [
      "Detectar al demonio interno ('un video m\xE1s', 'ma\xF1ana empiezo') y confrontarlo con autoridad.",
      "Encender el enojo constructivo contra la mediocridad para polarizar la mente.",
      "Evocar las anclas de poder (F\xEDsica 3, barra del bar, Lucho y Artur).",
      "Ponerse de pie y ejecutar de forma mec\xE1nica la acci\xF3n m\xEDnima prioritaria para que el d\xEDa jam\xE1s quede en cero."
    ],
    anclaRealExito: "Romper la inercia desde la cama usando la bronca constructiva y la memoria de F\xEDsica 3 para encender la PC sin dudar."
  }
};
function clasificarFranjaHoraria(isoDateStr) {
  const d = isoDateStr ? new Date(isoDateStr) : /* @__PURE__ */ new Date();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const horaExacta = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const dateKey = d.toISOString().split("T")[0];
  if (totalMinutes >= 6 * 60 + 30 && totalMinutes < 7 * 60 + 30) {
    return { horaExacta, dateKey, franja: "06:45_arranque", labelFranja: "06:45 AM \xB7 Arranque Matutino & Audio Horus" };
  }
  if (totalMinutes >= 7 * 60 + 30 && totalMinutes < 9 * 60) {
    return { horaExacta, dateKey, franja: "07:30_entreno", labelFranja: "07:30 AM \xB7 Entrenamiento F\xEDsico" };
  }
  if (totalMinutes >= 9 * 60 && totalMinutes < 13 * 60) {
    return { horaExacta, dateKey, franja: "09:00_bloque_manana", labelFranja: "09:00-13:00 \xB7 Bloque Cognitivo Matutino" };
  }
  if (totalMinutes >= 13 * 60 && totalMinutes < 17 * 60) {
    return { horaExacta, dateKey, franja: "13:00_transicion_siesta", labelFranja: "13:00-17:00 \xB7 Transici\xF3n / Valle Vespertino" };
  }
  if (totalMinutes >= 17 * 60 && totalMinutes < 23 * 60) {
    return { horaExacta, dateKey, franja: "17:00_estudio_ingenieria", labelFranja: "17:00-23:00 \xB7 Bloque Estudio Ingenier\xEDa & Portafolio" };
  }
  return { horaExacta, dateKey, franja: "23:00_cierre_o_social", labelFranja: "23:00-06:30 \xB7 Cierre Nocturno (23h) / Social Fin de Semana" };
}
function generarAuditoriaComoVamos(logs, objetivos, memories = [], strategies = []) {
  const hoyIso = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const hace7DiasMs = Date.now() - 7 * 24 * 60 * 60 * 1e3;
  const ultimos7DiasKeys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1e3);
    ultimos7DiasKeys.push(d.toISOString().split("T")[0]);
  }
  const conteoPorDia = /* @__PURE__ */ new Map();
  ultimos7DiasKeys.forEach((k) => conteoPorDia.set(k, 0));
  const logsRecientes = (logs || []).filter((l) => new Date(l.createdAt).getTime() >= hace7DiasMs);
  for (const log of logsRecientes) {
    const { dateKey } = clasificarFranjaHoraria(log.createdAt);
    conteoPorDia.set(dateKey, (conteoPorDia.get(dateKey) || 0) + 1);
  }
  const reportesHoyCount = conteoPorDia.get(hoyIso) || 0;
  const diasSinReportesUltimos7d = ultimos7DiasKeys.filter((k) => (conteoPorDia.get(k) || 0) === 0);
  const promedioReportesPorDiaUltimos7d = Number((logsRecientes.length / 7).toFixed(1));
  const ordenFranjas = [
    { franja: "06:45_arranque", label: "06:45 AM \xB7 Arranque & Audio Horus" },
    { franja: "07:30_entreno", label: "07:30 AM \xB7 Entrenamiento F\xEDsico" },
    { franja: "09:00_bloque_manana", label: "09:00-13:00 \xB7 Bloque Ma\xF1ana" },
    { franja: "13:00_transicion_siesta", label: "13:00-17:00 \xB7 Siesta / Transici\xF3n" },
    { franja: "17:00_estudio_ingenieria", label: "17:00-23:00 \xB7 Estudio Ingenier\xEDa" },
    { franja: "23:00_cierre_o_social", label: "23:00+ \xB7 Cierre 11 PM / Social" }
  ];
  const logsHoy = logsRecientes.filter((l) => clasificarFranjaHoraria(l.createdAt).dateKey === hoyIso);
  const franjasReportadasHoy = new Set(logsHoy.map((l) => l.franja || clasificarFranjaHoraria(l.createdAt).franja));
  const horaActual = (/* @__PURE__ */ new Date()).getHours();
  const franjasCiegasHoy = [];
  if (horaActual >= 8 && !franjasReportadasHoy.has("06:45_arranque")) {
    franjasCiegasHoy.push("Sin reporte de Arranque 6:45 AM hoy");
  }
  if (horaActual >= 10 && !franjasReportadasHoy.has("07:30_entreno")) {
    franjasCiegasHoy.push("Sin reporte de Entrenamiento 7:30 AM hoy");
  }
  if (horaActual >= 19 && !franjasReportadasHoy.has("17:00_estudio_ingenieria")) {
    franjasCiegasHoy.push("Sin reporte del Bloque de Estudio 5:00 PM hoy");
  }
  const estadisticasPorFranja = ordenFranjas.map(({ franja, label }) => {
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
        obstaculoFrecuente: "Sin reportes en esta franja (Punto ciego)"
      };
    }
    const avgAnimo = Math.round(
      grupo.reduce((acc, g) => acc + (g.moodScore ?? g.motivation ?? 6), 0) / grupo.length * 10
    ) / 10;
    const avgProd = Math.round(
      grupo.reduce((acc, g) => acc + (g.productivityScore ?? g.motivation ?? 6), 0) / grupo.length * 10
    ) / 10;
    const avgEnergy = Math.round(
      grupo.reduce((acc, g) => acc + (g.energy ?? 6), 0) / grupo.length * 10
    ) / 10;
    const conMetodo = grupo.filter((g) => g.resultadoMetodo);
    const exitosos = conMetodo.filter((g) => g.resultadoMetodo === "exito").length;
    const tasaExito = conMetodo.length > 0 ? Math.round(exitosos / conMetodo.length * 100) : 80;
    const fallos = grupo.filter((g) => g.huboObstaculo || g.stress >= 7 || avgProd <= 4);
    const obstaculoFrecuente = fallos[0]?.detonante || fallos[0]?.note?.slice(0, 70) || "Estable sin bloqueos cr\xEDticos";
    return {
      franja,
      label,
      cantidadReportes: grupo.length,
      promedioAnimo: avgAnimo,
      promedioProductividad: avgProd,
      promedioEnergia: avgEnergy,
      tasaExitoMetodos: tasaExito,
      obstaculoFrecuente
    };
  });
  const psicologicos = objetivos.filter((o) => o.tipo === "crecimiento_psicologico");
  const productivos = objetivos.filter((o) => o.tipo === "productivo");
  const porcentajeGlobalCumplimiento = objetivos.length > 0 ? Math.round(
    objetivos.reduce(
      (acc, o) => acc + Math.min(1, o.meta.progresoActual / Math.max(1, o.meta.objetivoNumerico)),
      0
    ) / objetivos.length * 100
  ) : 0;
  const principalesFallosSemana = [];
  objetivos.forEach((o) => {
    if (o.obstaculosRegistrados.length > 0) {
      const ult = o.obstaculosRegistrados[0];
      principalesFallosSemana.push(`[${o.titulo}] (${ult.hora} hs): ${ult.detonante}`);
    }
  });
  if (diasSinReportesUltimos7d.length > 0) {
    principalesFallosSemana.push(
      `D\xEDas con 0 reportes (${diasSinReportesUltimos7d.length} de 7 d\xEDas): silencio operativo que suele encubrir permitidos o desconexi\xF3n.`
    );
  }
  const casosExitoParaValorar = [];
  logsRecientes.filter((l) => l.resultadoMetodo === "exito" && (l.metodoAplicado || l.detonante)).slice(0, 4).forEach((l) => {
    const infoHora = clasificarFranjaHoraria(l.createdAt);
    casosExitoParaValorar.push({
      idOrigen: l.id,
      fecha: infoHora.dateKey,
      hora: infoHora.horaExacta,
      rasgoOEtiqueta: l.rasgoCodigo || infoHora.franja,
      experienciaNegativa: l.detonante || `Estado dif\xEDcil reportado (${l.note.slice(0, 60)})`,
      metodoAplicado: l.metodoAplicado || "Ejecuci\xF3n mec\xE1nica de protocolo",
      tasaExitoHistorica: 90
    });
  });
  (memories || []).filter((m) => m.fichaInmutable && m.fichaInmutable.resultado === "exito").slice(0, 4).forEach((m) => {
    const f = m.fichaInmutable;
    casosExitoParaValorar.push({
      idOrigen: f.id,
      fecha: f.fecha,
      hora: f.contexto_situacional.momento,
      rasgoOEtiqueta: f.tags_mecanismo.join(", "),
      experienciaNegativa: `${f.detonante_exacto} (Reacci\xF3n inicial: ${f.reaccion_inicial})`,
      metodoAplicado: f.solucion_aplicada,
      tasaExitoHistorica: 95
    });
  });
  (strategies || []).filter((s) => s.resultType === "positivo").slice(0, 2).forEach((s) => {
    casosExitoParaValorar.push({
      idOrigen: s.id,
      fecha: s.createdAt.split("T")[0],
      hora: "Hist\xF3rico consolidado",
      rasgoOEtiqueta: (s.tags_mecanismo || []).join(", ") || s.rama_id || "general",
      experienciaNegativa: s.situation,
      metodoAplicado: `${s.name} -> ${s.result}`,
      tasaExitoHistorica: s.effectiveness === "alta" ? 95 : 75
    });
  });
  return {
    fechaGeneracion: (/* @__PURE__ */ new Date()).toISOString(),
    reportesHoyCount,
    promedioReportesPorDiaUltimos7d,
    diasSinReportesUltimos7d,
    franjasCiegasHoy,
    estadisticasPorFranja,
    resumenObjetivos: {
      psicologicos,
      productivos,
      porcentajeGlobalCumplimiento
    },
    principalesFallosSemana,
    casosExitoParaValorar: casosExitoParaValorar.slice(0, 6)
  };
}
function formatearAuditoriaParaPrompt(aud) {
  const lineasObjPsi = aud.resumenObjetivos.psicologicos.map((o) => `  \u2022 [PSICOL\xD3GICO \xB7 ${o.periodo.toUpperCase()}] ${o.titulo}: ${o.meta.progresoActual}/${o.meta.objetivoNumerico} ${o.meta.unidad} (${o.estado.toUpperCase()})`).join("\n");
  const lineasObjProd = aud.resumenObjetivos.productivos.map((o) => `  \u2022 [PRODUCTIVO \xB7 ${o.periodo.toUpperCase()}] ${o.titulo}: ${o.meta.progresoActual}/${o.meta.objetivoNumerico} ${o.meta.unidad} (${o.estado.toUpperCase()})`).join("\n");
  const lineasFranjas = aud.estadisticasPorFranja.map(
    (f) => f.cantidadReportes > 0 ? `  \u2022 ${f.label}: ${f.cantidadReportes} rep. | \xC1nimo: ${f.promedioAnimo}/10 | Prod: ${f.promedioProductividad}/10 | \xC9xito m\xE9todos: ${f.tasaExitoMetodos}% | Fricci\xF3n: ${f.obstaculoFrecuente}` : `  \u2022 ${f.label}: 0 reportes (PUNTO CIEGO HORARIO)`
  ).join("\n");
  const lineasExitos = aud.casosExitoParaValorar.slice(0, 4).map(
    (c) => `  \u2022 [${c.idOrigen} | ${c.hora}] Ante situaci\xF3n negativa: "${c.experienciaNegativa}" -> M\xC9TODO QUE DIO \xC9XITO (${c.tasaExitoHistorica}% efectividad): "${c.metodoAplicado}"`
  ).join("\n");
  return `AUDITOR\xCDA EN VIVO DE OBJETIVOS, HORARIOS Y REPORTES (ESCALA 0-15 DIARIOS):
- Reportes emitidos hoy: ${aud.reportesHoyCount}/15 | Promedio \xFAltimos 7 d\xEDas: ${aud.promedioReportesPorDiaUltimos7d} rep/d\xEDa.
- D\xEDas con 0 reportes (\xFAltimos 7 d\xEDas): ${aud.diasSinReportesUltimos7d.length > 0 ? aud.diasSinReportesUltimos7d.join(", ") : "Ninguno (constancia perfecta)"}.
- Alertas de horario hoy: ${aud.franjasCiegasHoy.length > 0 ? aud.franjasCiegasHoy.join(" | ") : "Todas las franjas hasta la hora actual cubiertas"}.
- Cumplimiento Global de Objetivos: ${aud.resumenObjetivos.porcentajeGlobalCumplimiento}%

OBJETIVOS DE CRECIMIENTO (PSICOL\xD3GICOS):
${lineasObjPsi || "  \u2022 Sin objetivos psicol\xF3gicos cargados."}

OBJETIVOS PRODUCTIVOS (DISCIPLINA OPERATIVA):
${lineasObjProd || "  \u2022 Sin objetivos productivos cargados."}

EVALUACI\xD3N POR FRANJA HORARIA DE LOS REPORTES:
${lineasFranjas}

PRINCIPALES OBST\xC1CULOS Y FALLOS REPETIDOS:
${aud.principalesFallosSemana.length > 0 ? aud.principalesFallosSemana.map((f) => `  \u2022 ${f}`).join("\n") : "  \u2022 Sin fallos cr\xEDticos registrados esta semana."}

EXPERIENCIAS NEGATIVAS SUPERADAS CON \xC9XITO Y M\xC9TODO VALORADO:
${lineasExitos || "  \u2022 Sin casos registrados a\xFAn."}`;
}

// src/lib/storage.ts
var INITIAL_SISTEMA_MENTAL = {
  id: "sistema-mental-master",
  neurobiologia: {
    deQueDepende: `Del punto de foco resultado de procesos conscientes e inconscientes, donde el inconsciente tiene mayor predominancia.
- El punto de foco determina qu\xE9 sientes y qu\xE9 haces en funci\xF3n de la interpretaci\xF3n y el contexto, donde las reacciones predeterminadas tienen prioridad.
- El punto de foco cambia seg\xFAn las variables y condiciones asociadas a procesos simult\xE1neos OFF/ON.
- El punto de foco a largo plazo (d\xEDas/meses) va creando una tendencia (polarizaci\xF3n), lo que ayuda a fijar valores predeterminados favorables.
- Procesos inconscientes: eventos que puedan generar ansiedad a futuro (como un examen) generan ansiedad subterr\xE1nea, lo que produce mayor evasi\xF3n y rebeld\xEDa. La causa es inconsciente, por lo que muchas veces no entender\xE1s qu\xE9 est\xE1 pasando conscientemente ni podr\xE1s controlarlo de forma directa.`,
    comoCambio: `Se puede cambiar el estado si se logra cambiar el punto de foco de manera gradual por un tiempo determinado.
- Para ello, es probable que existan fuerzas opuestas inconscientes afectando el intento de cambio (Resistencia).
- Una fuerza opuesta puede ser ansiedad inconsciente (algo que no sabes conscientemente que te afecta).
- Una soluci\xF3n efectiva es bloquear o ignorar cualquier proceso no relacionado a lo que buscas (como dudas y rumiaciones).
- Bloquear o ignorar es un proceso complejo que requiere convicci\xF3n, energ\xEDa y sobre todo entender la causa biol\xF3gica.
- Actuar en modo OFF/ON crea una polarizaci\xF3n positiva o negativa.
- Se puede forzar un arranque, pero lo crucial es generar tendencias estables a largo plazo.`,
    formulaEstado: `ESTADO = f(energ\xEDa, evento, contexto, pensamiento, creencias, repetici\xF3n, miedo) EN FOCO
* Si una variable no est\xE1 en foco, afecta poco al estado actual.
* El estado es variable o estable; si es estable, debe ser protegido y mantenido. Las acciones y pensamientos determinan el estado A.`,
    estadoA: `El Estado A es de naturaleza VARIABLE (inestable / divagar) o CONSTANTE (estable).
- Tiene una causa (consciente o inconsciente) y una inercia (positiva o negativa).
- Si est\xE1s muy inmerso en A, es m\xE1s dif\xEDcil salir.
- Se suele aconsejar meditaci\xF3n para debilitar la inercia, pero no asegura nada por s\xED sola.
- Cualquier acci\xF3n diferente a la naturaleza de A debilita la inercia de a poco.
- Lo que S\xCD asegura salir de la inercia es entrar en un estado de flujo consciente usando el M\xC9TODO PREGUNTA-RESPUESTA.`,
    estadoB: `Determinar la forma, concentraci\xF3n del estudio, espontaneidad, etc.
- A partir de ah\xED poder buscar una herramienta personalizada.
- El Estado B puede ser buscado inconscientemente y generar ansiedad por expectativa.
- Si est\xE1s muy inmerso en B, es m\xE1s dif\xEDcil salir.
- Cualquier acci\xF3n diferente a la naturaleza de B debilita la inercia de a poco.`,
    estadoBEstudio: `Dependiendo del tema a estudiar, causa resistencia interna:
- Temas nuevos: generan resistencia interna y dispersi\xF3n porque no sabes por d\xF3nde comenzar.
- Pensar en la cantidad de temas y en lo que falta por estudiar genera ansiedad y ganas de evadirse.`,
    cambioEstable: `Los cambios deben ser procesos graduales, continuos en el tiempo, con tolerancia al fallo.
- Los primeros momentos del cambio son inherentemente inestables.
- La clave principal es el control repetido en el tiempo, con ayuda de un sistema de creencias favorable.
- El problema principal son las tendencias a distracci\xF3n y dejarse llevar por impulsos (realizar otra actividad que hace perder el enfoque).
- Tener el control implica tener un visor donde se equilibra el estado ON/OFF.
- Escribir ayuda a enfocar la mente y mantener la atenci\xF3n, lo que facilita el cambio de estado.`,
    areasVida: [
      {
        code: "A0",
        name: "Limpieza, Organizaci\xF3n y Conductas B\xE1sicas",
        description: "Entorno f\xEDsico, orden diario, horarios y automatismos basales.",
        problems: "Falta de orden inicial, acumulaci\xF3n de fricci\xF3n visual.",
        solutions: "Micro-h\xE1bitos diarios, rutina matutina despejada y despeje de escritorio previo."
      },
      {
        code: "A1",
        name: "Trabajo e Ingreso de Dinero",
        description: "\xC1rea laboral, proyectos productivos y estabilidad financiera.",
        problems: "Interrupciones, procrastinaci\xF3n en entregas complejas.",
        solutions: "Franja horaria dedicada, bloques sin distracciones, m\xE9tricas de entregas."
      },
      {
        code: "A2",
        name: "Estudio y \xC1mbito Acad\xE9mico (Ingenier\xEDa en Inform\xE1tica)",
        description: "Tesis de Grado GitFlow, materias de 5to a\xF1o, ex\xE1menes y c\xF3digo.",
        problems: "Evasi\xF3n bajo presi\xF3n, dispersi\xF3n en temas nuevos, fatiga por volumen de contenido.",
        solutions: "Franja dorada 07:00 a 12:00, M\xE9todo Pregunta-Respuesta, regla 52/17, despiece de temas."
      },
      {
        code: "A3",
        name: "Crecimiento Personal y Mejora de Uno Mismo",
        description: "Autoimagen, determinaci\xF3n, desinhibici\xF3n social, carisma y espontaneidad.",
        problems: "Inseguridades primitivas de aceptaci\xF3n, miedo al rechazo, victimizaci\xF3n ante fallos.",
        solutions: "Grado de Libertad ('No importa'), linterna del foco, m\xE9todo transici\xF3n y acci\xF3n con humor."
      },
      {
        code: "A4",
        name: "Cuidado Est\xE9tico y F\xEDsico",
        description: "Entrenamiento diario, salud corporal, postura, energ\xEDa f\xEDsica y nutrici\xF3n.",
        problems: "Interrupci\xF3n de rutina en d\xEDas de ex\xE1menes, ver el entrenamiento como sufrimiento.",
        solutions: "Hacer del entreno un momento agradable, pol\xEDtica del D\xEDa No Cero (3 min estiramiento m\xEDnimo)."
      }
    ]
  },
  creencias: {
    linternaFoco: "La conciencia es una linterna de foco limitado en un teatro oscuro. Lo que iluminas determina lo que sientes y haces. Controlar el punto de foco es controlar tu conducta.",
    polarizacionOnOff: "Actuar en modo OFF/ON de forma repetida genera una polarizaci\xF3n biol\xF3gica (tendencia a largo plazo) que convierte las conductas favorables en tu valor predeterminado.",
    dudaVsAccion: "LA DUDA SOLO SE PERMITE EN LA REFLEXI\xD3N, NUNCA EN LA ACCI\xD3N. Cuando act\xFAas, act\xFAas con determinaci\xF3n absoluta y sin vacilar.",
    autoconvencimiento: "El cerebro cree el discurso interno que le das con convicci\xF3n y argumentos precisos. Autoconvencimiento positivo basado en evidencia y no en optimismo ciego.",
    distanciamientoTerceraPersona: "Analizar la propia conducta en tercera persona ('Juan est\xE1 sintiendo resistencia porque su cerebro detecta gasto energ\xE9tico...') reduce la reactividad de la am\xEDgdala y activa el control prefrontal.",
    enfoqueNoMoral: "La pereza o apat\xEDa no son defectos morales ni culpa, son desbalances mec\xE1nicos de dopamina/glutamato o respuestas defensivas primitivas. Se resuelven con protocolos mec\xE1nicos.",
    toleranciaAlFallo: "Tolerancia absoluta al fallo: los procesos de cambio son inherentemente inestables al inicio. Caerse no arruina el sistema; lo que importa es la continuidad en el tiempo."
  },
  metodos: {
    preArranquePasos: [
      "1. Reconocimiento de mi estado ACTUAL A en tiempo real (determinar causas de ansiedad inconsciente cuando sea posible, conductas repetitivas negativas y disparadores de malos h\xE1bitos).",
      "2. Poder DETENER la inercia actual (pausa consciente de 1 minuto).",
      "3. Herramientas de neutralizaci\xF3n y regulaci\xF3n emocional.",
      "4. Procesos de flujo estables pensando en mis metas con el M\xC9TODO PREGUNTA-RESPUESTA.",
      "5. Determinaci\xF3n y eliminaci\xF3n total de la duda al actuar.",
      "6. Autoconvencimiento positivo y convincente.",
      "7. PREPARACI\xD3N PREVIA DE LAS TAREAS (fricci\xF3n cero en el escritorio).",
      "8. ARRANCAR."
    ],
    elArranqueEsClave: "La respuesta corta es S\xCD y NO. Si est\xE1s preparado mental y f\xEDsicamente ser\xE1 positivo; de lo contrario, el arranque puede ser inestable.",
    forzarArranqueFunciona: "A veces, dependiendo de si el estado actual A favorece o no. Si hay demasiada resistencia interna inconsciente no funcionar\xE1 forzar a lo bruto; se debe regular primero la inercia.",
    metodoTransicion: {
      objetivo: "Visor espont\xE1neo durante 15 minutos.",
      fase1Aislacion: "Generar un campo de aislaci\xF3n de 5 min (detener todo). Si no puedes aislarte f\xEDsicamente, hazlo mentalmente; puedes liberar la mente est\xE9s donde est\xE9s.",
      fase2ReconocerDepurar: "No luches contra tus sensaciones primitivas, ac\xE9ptalas e ign\xF3ralas poco a poco. Respira tranquilo y qu\xEDtale importancia. Cuestiona pensamientos negativos con fundamentos precisos: '\xBFPor qu\xE9 gastar energ\xEDa en pensar as\xED cuando da igual?'. La confianza es enemiga de la duda. Siente que nada importa: mientras m\xE1s sientas que todo da igual, m\xE1s poderoso te haces.",
      fase3AceptacionHumor: "Aceptaci\xF3n con humor y b\xFAsqueda del ideal adaptativo. S\xE9 espont\xE1neo, act\xFAa sin el estr\xE9s del control r\xEDgido. Deja que tus acciones fluyan de forma natural y sin esfuerzo, sin planificar ni sobrepensar.",
      fase4Convencimiento: "Seg\xFAn el contexto, crea un discurso convincente sobre lo que buscas: el ideal adaptativo que lo acepta todo y disfruta el momento.",
      testCompletado: [
        "\xBFQu\xE9 tan libre te sientes?",
        "\xBFTe da igual lo que piense la gente?",
        "\xBFY si quedas como tonto? (Aceptarlo con humor y soltura)."
      ],
      mantenimiento: "Mantener la idea del cambio por tiempo prolongado; si te distraes pierdes el efecto. Activar visor aplicado sobre las variables de espontaneidad y determinaci\xF3n, controlando los puntos muertos."
    },
    criterioDiaNoCero: {
      reglaInviolable: "Jam\xE1s se permite que termine un d\xEDa sin haber realizado al menos una acci\xF3n min\xFAscula hacia tu objetivo de vida. El marcador del d\xEDa nunca puede quedar en cero absoluto.",
      propositoIdentidad: "El D\xEDa No Cero no busca un progreso monumental, sino proteger tu identidad neuropsicol\xF3gica: mantiene encendida la v\xEDa neuronal en los ganglios basales y preserva intacta tu autoimagen de persona disciplinada.",
      efectoQueCarajo: "El 'cero' activa el Efecto 'Qu\xE9 Carajo' (What-The-Hell Effect): un sesgo de todo o nada donde la mente asume que como no pudo hacer la rutina perfecta, el d\xEDa se arruin\xF3 y es mejor procrastinar.",
      triadaDiaDificil: [
        { item: "Acci\xF3n F\xEDsica M\xEDnima", action: "3 minutos de estiramientos corporales b\xE1sicos al lado de la silla de estudio (en vez de 1h de gimnasio)." },
        { item: "Gesti\xF3n de Estudio", action: "Aplicar estrictamente la regla 52/17 (52 min de foco + 17 min sin pantallas para consolidaci\xF3n hipocampal)." },
        { item: "Acci\xF3n de Avance Vital", action: "Abrir el archivo del proyecto o notas de ingl\xE9s, escribir UNA sola l\xEDnea de texto, guardar y cerrar (30 segundos)." }
      ],
      triadaDelYoTemporal: {
        yoPasado: "Perd\xF3n radical al Yo Pasado: si cometiste un error o perdiste tiempo, ot\xF3rgate perd\xF3n absoluto inmediato para eliminar la carga negativa.",
        yoPresente: "Acci\xF3n del Yo Presente: ejecutas la micro-acci\xF3n de 30 segundos como un favor personal para tu versi\xF3n futura.",
        yoFuturo: "Gratitud del Yo Futuro: ma\xF1ana agradecer\xE1s no arrancar de cero absoluto porque tu Yo Pasado te dej\xF3 el camino iniciado."
      }
    },
    estrategiaLargoPlazo: [
      "Repetici\xF3n de un patr\xF3n de conducta 'ideal' cada d\xEDa.",
      "Reconocer qu\xE9 est\xE1s buscando lograr y qui\xE9n eres.",
      "Reconocer hacia d\xF3nde vas y neutralizar tus impulsos primitivos.",
      "Ser determinado al actuar.",
      "Aplicar espontaneidad en tiempo real.",
      "Aceptar lo negativo y dejar el miedo de lado.",
      "Uso de autorreflexi\xF3n diaria o audios de anclaje.",
      "DETERMINACI\xD3N TOTAL CONTRA LA DISTRACCI\xD3N."
    ],
    metodoPreguntaRespuesta: "Subdividir cualquier tema complejo en preguntas y respuestas progresivas (de simple a complejo) para encender la curiosidad biol\xF3gica y anclar el estado de flujo cognitivo."
  },
  limitaciones: [
    {
      id: "lim-1",
      title: "Ansiedad Inconsciente ante Ex\xE1menes y Futuro",
      description: "Eventos futuros de alta presi\xF3n generan tensi\xF3n subterr\xE1nea no percibida.",
      manifestation: "Mayor tendencia a la evasi\xF3n, rebeld\xEDa inconsciente y procrastinaci\xF3n.",
      countermeasure: "Aceptar que la causa es inconsciente, no moral; despiece en micro-metas de 15 min y regla 52/17."
    },
    {
      id: "lim-2",
      title: "Miedo al Rechazo y Expectativas de Aceptaci\xF3n",
      description: "Inseguridades primitivas y condicionamiento del propio valor a la respuesta externa.",
      manifestation: "Timidez, sobre-pensamiento social, rigidez o falta de espontaneidad.",
      countermeasure: "Activar el Grado de Libertad ('No importa', 'Da igual'), asumir atractivo objetivo y usar humor adaptativo."
    },
    {
      id: "lim-3",
      title: "Victimizaci\xF3n y Falta de Tolerancia al Fallo",
      description: "Frustraci\xF3n excesiva cuando algo sale mal o cuando se interrumpe la rutina perfecta.",
      manifestation: "Efecto 'Qu\xE9 Carajo', culpa, abandono de la jornada.",
      countermeasure: "Perd\xF3n radical al Yo Pasado, pol\xEDtica de D\xEDa No Cero y comprensi\xF3n de que el inicio del cambio es inestable."
    },
    {
      id: "lim-4",
      title: "Resistencia y Dispersi\xF3n en Temas Nuevos",
      description: "Fricci\xF3n cognitiva al no saber por d\xF3nde comenzar o abrumamiento por volumen de temas.",
      manifestation: "Distracci\xF3n inmediata, apertura de pesta\xF1as secundarias o abandono del estudio.",
      countermeasure: "M\xE9todo Pregunta-Respuesta para fragmentar lo desconocido en piezas simples de 15 minutos."
    },
    {
      id: "lim-5",
      title: "Baja de Dopamina y Fatiga Vespertina",
      description: "Ca\xEDda natural de neurotransmisores y glucosa prefrontal pasadas las 13:00.",
      manifestation: "Lentitud mental, pesadez y sensaci\xF3n de culpa por no rendir igual que en la ma\xF1ana.",
      countermeasure: "Blindar la franja 07:00 a 12:00 para lo dif\xEDcil; pasar la tarde a tareas mec\xE1nicas, caminatas o NSDR."
    }
  ],
  objetivosClaves: [
    {
      id: "obj-1",
      number: 1,
      area: "A2 (Acad\xE9mico)",
      title: "Recibirse de Ingeniero en Inform\xE1tica (Tesis GitFlow)",
      description: "Norte definitivo actual. Convertir el avance de tesis y materias en una acci\xF3n innegociable y constante.",
      limitations: ["Evasi\xF3n en \xE9pocas de mayor presi\xF3n", "Distracci\xF3n", "Baja de dopamina", "Falta de organizaci\xF3n inicial"],
      strategy: "Franja dorada 07:00 a 12:00, micro-metas de 15m (Yo Robot) y regla 52/17 sin pantallas."
    },
    {
      id: "obj-2",
      number: 2,
      area: "A4 (F\xEDsico)",
      title: "Cuidado Personal y Entrenamiento F\xEDsico Diario",
      description: "Cumplir todos los d\xEDas con el entrenamiento haci\xE9ndolo agradable, eliminando la percepci\xF3n mental de sufrimiento.",
      limitations: ["Falta de continuidad", "Interrupci\xF3n en d\xEDas de ex\xE1menes"],
      strategy: "D\xEDa No Cero: en d\xEDas de examen o fatiga, realizar al menos 3 minutos de estiramientos corporales."
    },
    {
      id: "obj-3",
      number: 3,
      area: "A3/A4 (Personal / Imagen)",
      title: "Mejorar Autoimagen y Seguridad Interna",
      description: "Destruir inseguridades primitivas de aceptaci\xF3n. Asumir de forma objetiva atractivo, seguridad y claridad.",
      limitations: ["Miedo al rechazo", "Miedo a falta de salud", "Falta de pr\xE1cticas sociales", "Victimizaci\xF3n"],
      strategy: "Dejar de condicionar el valor personal a reacciones externas; actuar con convicci\xF3n interna."
    },
    {
      id: "obj-4",
      number: 4,
      area: "A3 (Crecimiento Personal)",
      title: "Hombre Determinado, Libre y Espont\xE1neo",
      description: "Dominar desinhibici\xF3n y carisma social. Gobernar instintos primitivos y operar con 'Grado de Libertad'.",
      limitations: ["Sobre-an\xE1lisis", "Miedo al qu\xE9 dir\xE1n", "Rigidez de control"],
      strategy: "M\xE9todo Transici\xF3n (15 min): Aislaci\xF3n -> Depurar ('nada importa') -> Aceptaci\xF3n con humor -> Fluidez natural."
    },
    {
      id: "obj-5",
      number: 5,
      area: "A0/A1 (Rutina / Productividad)",
      title: "Sistematizar Rutina Diaria Perpetua (6:40 AM)",
      description: "Sustituir la inestable fuerza de voluntad por un sistema biol\xF3gico impermeable al autosabotaje.",
      limitations: ["Inercia del sue\xF1o", "Falta de orden matutino"],
      strategy: "Despertar 6:40 AM, arranque r\xE1pido con conteo 5-4-3-2-1, 2 vasos de agua y algoritmo WOOP."
    },
    {
      id: "obj-6",
      number: 6,
      area: "A2/A3 (Habilidades)",
      title: "Rutina de Ingl\xE9s Diario",
      description: "Adquirir el h\xE1bito de pr\xE1ctica activa diaria de ingl\xE9s por patrones y escucha.",
      limitations: ["P\xE9rdida de prioridad en semanas de ex\xE1menes"],
      strategy: "D\xEDa No Cero: m\xEDnimo 1 frase o 3 minutos de escucha activa diaria pase lo que pase."
    },
    {
      id: "obj-7",
      number: 7,
      area: "A3 (Comunicaci\xF3n)",
      title: "Desarrollo de Habilidad para Hablar y Comunicar en Videos",
      description: "Desarrollar personalidad, mostrarse aut\xE9ntico, comunicar eficientemente y crear videos explicativos claros.",
      limitations: ["Priorizar otras cosas por falta de tiempo", "Fricci\xF3n de exposici\xF3n"],
      strategy: "Micro-grabaciones de 2 minutos sin editar para desensibilizar la c\xE1mara y ganar soltura."
    }
  ],
  aiSummary: `SISTEMA Y MARCO MENTAL DE JUAN FRANCISCO CANO:
1. NEUROBIOLOG\xCDA: El estado actual depende del punto de foco (conciencia/inconsciencia). La ansiedad ante ex\xE1menes genera evasi\xF3n inconsciente. Cambiar de estado requiere cambiar de foco gradualmente y bloquear dudas con convicci\xF3n (modo OFF/ON). Estado = f(energ\xEDa, evento, contexto, pensamiento, creencias, repetici\xF3n, miedo) en foco. Estado A (inercia actual, salir con flujo Pregunta-Respuesta) vs Estado B (estudio, resistencia a temas nuevos). \xC1reas de vida: A0 (organizaci\xF3n), A1 (trabajo), A2 (estudio/tesis GitFlow), A3 (crecimiento/desinhibici\xF3n), A4 (entrenamiento f\xEDsico).
2. CREENCIAS CLAVE: La linterna del foco; La duda solo en la reflexi\xF3n, NUNCA en la acci\xF3n; Distanciamiento en 3ra persona; Enfoque no moral (dopamina/glutamato); Tolerancia al fallo.
3. M\xC9TODOS Y PROTOCOLOS: Pre-arranque (reconocer estado A, detener inercia, preguntas-respuestas, arrancar sin duda); M\xE9todo Transici\xF3n (15 min visor espont\xE1neo: aislaci\xF3n -> depurar 'nada importa' -> aceptaci\xF3n con humor -> fluir); Criterio D\xCDA NO CERO (nunca cero; tr\xEDada m\xEDnima: 3 min estiramiento, 52/17, 1 l\xEDnea de avance; tr\xEDada del Yo: perd\xF3n pasado, acci\xF3n presente, gratitud futura); M\xE9todo Yo Robot (5-4-3-2-1).
4. LIMITACIONES CONOCIDAS: Ansiedad inconsciente ante ex\xE1menes, evasi\xF3n/rebeld\xEDa, miedo al rechazo, victimizaci\xF3n por fallos, dispersi\xF3n en temas nuevos, baja dopam\xEDnica de tarde.
5. METAS CLAVES: 1. Recibirse de Ingeniero (Tesis GitFlow), 2. Cuidado y entrenamiento diario, 3. Autoimagen objetiva, 4. Hombre determinado y espont\xE1neo (Grado de Libertad), 5. Rutina 6:40 AM, 6. Ingl\xE9s diario, 7. Hablar en videos.`,
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
var INITIAL_CURRENT_STATE = {
  activeGoals: [
    "Redactar marco metodol\xF3gico de la Tesis de Grado (IA en metodolog\xEDas GitFlow)",
    "Estabilizar m\xF3dulo de cuotas y roles en Sistema Cooperadora FACET",
    "Sostener franja matutina estricta de 07:00 a 12:00 sin pantallas recreativas"
  ],
  openProblems: [
    "Dispersi\xF3n y fatiga cognitiva en horas de la tarde tras almuerzo",
    "Fricci\xF3n al iniciar tareas con requerimientos ambiguos o demasiado extensos"
  ],
  pendingTasks: [
    "Revisar observaciones de Esteban Saborido y Javier Gra\xF1a sobre arquitectura",
    "Optimizar consultas en pgAdmin4 para el padr\xF3n de socios"
  ],
  activeProjects: [
    { name: "Tesis de Grado (IA & GitFlow)", status: "En redacci\xF3n", progress: 65 },
    { name: "Cooperadora FACET", status: "Pruebas piloto", progress: 80 }
  ],
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
var INITIAL_DECISIONS = [
  {
    id: "dec-1",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3).toISOString(),
    decision: "Concentrar tareas de alta carga cognitiva estrictamente en la franja 07:00 a 12:00",
    reason: "Pico biol\xF3gico de alerta y concentraci\xF3n; trabajar de tarde genera fricci\xF3n innecesaria",
    status: "consolidada",
    rama_id: "proyectos"
  },
  {
    id: "dec-2",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
    decision: "Aplicar micro-metas de 15 minutos (M\xE9todo Yo Robot) post-meditaci\xF3n cuando aparezca resistencia",
    reason: "Desactivar la alarma de la am\xEDgdala y encender corteza prefrontal izquierda",
    status: "en prueba",
    reviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
    rama_id: "habitos"
  }
];
var INITIAL_DAILY_REPORTS = [
  {
    id: "rep-1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    goals: ["Avanzar 2 secciones de Tesis", "Hacer pausas 52/17 sin pantallas"],
    results: ["Completadas 2 secciones de Tesis", "Pausa activa de 17m cumplida"],
    problems: ["Intentar extender trabajo intelectual a las 16:00 gener\xF3 agotamiento"],
    decisions: ["Cortar estudio profundo a las 12:30 y pasar a tareas mec\xE1nicas"],
    projectStatus: "Tesis al 65%",
    observedPatterns: ["M\xE1xima velocidad de redacci\xF3n entre 08:00 y 11:00"],
    generalNote: "Excelente sesi\xF3n matutina aplicando hilo \xFAnico.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
  },
  {
    id: "rep-2",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    goals: ["Resolver validaciones en Cooperadora FACET"],
    results: ["Validaciones completadas y testeadas"],
    problems: ["Dificultad inicial para arrancar por fatiga previa"],
    decisions: ["Iniciar con caminata breve y 2 vasos de agua antes del c\xF3digo"],
    projectStatus: "FACET al 80%",
    observedPatterns: ["El movimiento previo reduce la resistencia de arranque en un 40%"],
    generalNote: "Se cumpli\xF3 el objetivo del d\xEDa sin extender horarios.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
  }
];
var INITIAL_CONVERSATIONS = [
  {
    id: "conv-1",
    title: "Sesi\xF3n inicial de enfoque",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    summary: null,
    isSummarized: false,
    rama_id: "proyectos"
  }
];
var INITIAL_FICHAS_INMUTABLES = [
  {
    id: "VIV-2026-10-15-01",
    fecha: "2026-10-15",
    rama_id: "proyectos",
    tags_mecanismo: ["#paralisis_perfeccionismo", "#ambiguedad_externa"],
    contexto_situacional: {
      momento: "08:15 AM, escritorio de estudio (Franja Dorada)",
      nivel_energia: "alto",
      factores_externos: "Observaciones amplias de mentores de Tesis GitFlow sin acotar alcance"
    },
    detonante_exacto: "Requerimiento extenso del marco metodol\xF3gico sin saber por qu\xE9 secci\xF3n empezar",
    reaccion_inicial: "Sobre-an\xE1lisis de toda la arquitectura y apertura de pesta\xF1as secundarias (evitaci\xF3n)",
    solucion_aplicada: "M\xE9todo Pregunta-Respuesta: escribir 1 \xFAnica pregunta concreta en un archivo vac\xEDo durante 15 min (52/17)",
    resultado: "exito",
    inmutable: true
  },
  {
    id: "VIV-2026-10-16-02",
    fecha: "2026-10-16",
    rama_id: "habitos",
    tags_mecanismo: ["#fatiga_tarde", "#sobreestimulacion_digital"],
    contexto_situacional: {
      momento: "15:30 PM, post-almuerzo frente a la PC",
      nivel_energia: "bajo",
      factores_externos: "Ca\xEDda circadiana vespertina y agotamiento tras 4 horas de c\xF3digo por la ma\xF1ana"
    },
    detonante_exacto: "Intento de forzar debugging complejo de SQL/pgAdmin4 a las 15:30 con pesadez mental",
    reaccion_inicial: "Autocr\xEDtica con 'debo hacerlo' y consumo de pantallas que agrav\xF3 la fatiga",
    solucion_aplicada: "Detener todo de inmediato -> NSDR/silencio de 20 min sin pantallas -> reprogramar SQL a las 07:30 AM del d\xEDa siguiente",
    resultado: "exito",
    inmutable: true
  },
  {
    id: "VIV-2026-10-17-03",
    fecha: "2026-10-17",
    rama_id: "vinculos",
    tags_mecanismo: ["#busqueda_aprobacion", "#paralisis_perfeccionismo"],
    contexto_situacional: {
      momento: "19:00 PM, grabaci\xF3n de video explicativo / interacci\xF3n social",
      nivel_energia: "medio",
      factores_externos: "Auto-observaci\xF3n r\xEDgida y expectativa de causar impresi\xF3n perfecta"
    },
    detonante_exacto: "Fricci\xF3n al iniciar grabaci\xF3n/charla por evaluar c\xF3mo va a reaccionar el otro",
    reaccion_inicial: "Rigidez expresiva, ensayo mental de frases y postergaci\xF3n del arranque",
    solucion_aplicada: "M\xE9todo Transici\xF3n (5 min aislaci\xF3n + principio 'Da igual / No importa' + toma cruda de 2 min sin editar con humor)",
    resultado: "exito",
    inmutable: true
  }
];
var INITIAL_MEMORIES = INITIAL_FICHAS_INMUTABLES.map((f) => ({
  id: f.id,
  text: `[${f.id}] Detonante: ${f.detonante_exacto} | Contexto: ${f.contexto_situacional.momento} (Energ\xEDa ${f.contexto_situacional.nivel_energia}) | Sesgo: ${f.reaccion_inicial} | Quiebre: ${f.solucion_aplicada} -> Resultado: ${f.resultado.toUpperCase()}`,
  category: f.rama_id,
  createdAt: new Date(f.fecha).toISOString(),
  isApproved: true,
  summary: JSON.stringify(f),
  fichaInmutable: f,
  rama_id: f.rama_id,
  tags_mecanismo: f.tags_mecanismo,
  isImmutable: true
}));
var INITIAL_LOGS = [
  {
    id: "log-1",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3).toISOString(),
    energy: 7,
    motivation: 8,
    stress: 4,
    note: "Sesi\xF3n matutina productiva en la Tesis. Realic\xE9 caminata breve."
  },
  {
    id: "log-2",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
    energy: 7,
    motivation: 8,
    stress: 3,
    note: "Mi\xE9rcoles de alto rendimiento. Logr\xE9 4 bloques de trabajo sin fricci\xF3n."
  },
  {
    id: "log-3",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
    energy: 5,
    motivation: 6,
    stress: 7,
    note: "Tensi\xF3n por entregas de tesis. Necesit\xE9 aplicar NSDR de 20 min."
  },
  {
    id: "log-4",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
    energy: 6,
    motivation: 7,
    stress: 4,
    note: "D\xEDa balanceado tras aplicar m\xE9todo Yo Robot para destrabar c\xF3digo."
  }
];
var INITIAL_STRATEGIES = [
  {
    id: "strat-1",
    name: "Franja Matutina Fija (07:00 - 12:00)",
    situation: "Tareas cognitivas complejas (arquitectura de tesis, modelado)",
    result: "Rendimiento y concentraci\xF3n m\xE1xima sostenida",
    effectiveness: "alta",
    status: "recomendada",
    resultType: "positivo",
    reason: "Alineado con ritmo circadiano y sin interrupciones",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
    rama_id: "proyectos",
    tags_mecanismo: ["#paralisis_perfeccionismo", "#ansiedad_examen"]
  },
  {
    id: "strat-2",
    name: "Estudio Intelectual Vespertino/Nocturno (>15:00 o 21:00)",
    situation: "Intentar compensar horas no avanzadas durante el d\xEDa con baja energ\xEDa",
    result: "Frustraci\xF3n, lentitud cognitiva e insomnio reactivo",
    effectiveness: "baja",
    status: "descartada",
    resultType: "negativo",
    reason: "Agotamiento de glucosa prefrontal y alteraci\xF3n del sue\xF1o reparador",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1e3).toISOString(),
    rama_id: "habitos",
    tags_mecanismo: ["#fatiga_tarde"]
  },
  {
    id: "strat-3",
    name: "Micro-acci\xF3n de 15 minutos (M\xE9todo Yo Robot Post-Meditaci\xF3n)",
    situation: "Apat\xEDa, par\xE1lisis por sobre-an\xE1lisis o resistencia al empezar tras haber reseteado",
    result: "Desbloquea la inercia y permite entrar en flujo natural",
    effectiveness: "alta",
    status: "recomendada",
    resultType: "positivo",
    reason: "Reduce la fricci\xF3n a cero y activa la corteza prefrontal izquierda",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
    rama_id: "proyectos",
    tags_mecanismo: ["#paralisis_perfeccionismo", "#ambiguedad_externa"]
  },
  {
    id: "strat-4",
    name: "Listas masivas de m\xE1s de 8 tareas diarias",
    situation: "Planificaci\xF3n de pendientes acad\xE9micos y personales",
    result: "Acumulaci\xF3n de \xEDtems pendientes y sensaci\xF3n de culpa",
    effectiveness: "baja",
    status: "descartada",
    resultType: "negativo",
    reason: "Genera fatiga decisional y dispersi\xF3n del foco de la linterna",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
    rama_id: "proyectos",
    tags_mecanismo: ["#paralisis_perfeccionismo", "#efecto_que_carajo"]
  }
];
function consolidarNodosPatronesPorPunteros(memories) {
  const fichas = (memories || []).map((m, i) => asegurarFichaInmutable(m, i + 1));
  const mapaPorTag = /* @__PURE__ */ new Map();
  for (const ficha of fichas) {
    const tags = ficha.tags_mecanismo && ficha.tags_mecanismo.length > 0 ? ficha.tags_mecanismo : [`#rama_${ficha.rama_id}`];
    for (const tag of tags) {
      const lista = mapaPorTag.get(tag) || [];
      lista.push(ficha);
      mapaPorTag.set(tag, lista);
    }
  }
  const patronesConsolidados = [];
  let idx = 1;
  for (const [tag, grupo] of mapaPorTag.entries()) {
    const punteros = grupo.map((g) => g.id);
    const exitosas = grupo.filter((g) => g.resultado === "exito");
    const tasaExito = Math.round(exitosas.length / Math.max(1, grupo.length) * 100);
    const solucionesEfectivas = Array.from(new Set(exitosas.map((e) => e.solucion_aplicada)));
    const momentosComunes = Array.from(new Set(grupo.map((g) => `${g.contexto_situacional.momento} (Energ\xEDa ${g.contexto_situacional.nivel_energia})`))).join(" | ");
    const ramaDominante = grupo[0]?.rama_id || "proyectos";
    const nodo = {
      id: `PAT-${String(idx).padStart(2, "0")}`,
      nombre: `Nodo ${tag} (${ramaDominante.toUpperCase()})`,
      rama_id: ramaDominante,
      tags_mecanismo: [tag],
      punteros_vivencias: punteros,
      frecuencia: grupo.length,
      correlacion_situacional: momentosComunes,
      soluciones_efectivas: solucionesEfectivas.length > 0 ? solucionesEfectivas : ["En observaci\xF3n"],
      tasa_exito: tasaExito
    };
    patronesConsolidados.push({
      id: nodo.id,
      type: "asociaci\xF3n",
      description: `[${nodo.id} \xB7 ${tag}] Punteros: [${punteros.join(", ")}] (Frecuencia: ${nodo.frecuencia} | \xC9xito: ${tasaExito}%). Condici\xF3n: ${nodo.correlacion_situacional}. Quiebre probado: ${nodo.soluciones_efectivas.join(" / ")}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      nodoPatron: nodo
    });
    idx++;
  }
  return patronesConsolidados;
}
function construirArbolDesdeDatos(memories, conversations = [], strategies = []) {
  const arbol = {
    version: 2,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    ramas: {
      proyectos: {
        rama_id: "proyectos",
        nombre: "Proyectos, Codigo y Tesis",
        reglas_base: GUIAS_BASE_POR_RAMA.proyectos,
        nodos: {},
        fichas_recientes_ids: []
      },
      vinculos: {
        rama_id: "vinculos",
        nombre: "Vinculos, Interaccion Social y Exposicion",
        reglas_base: GUIAS_BASE_POR_RAMA.vinculos,
        nodos: {},
        fichas_recientes_ids: []
      },
      habitos: {
        rama_id: "habitos",
        nombre: "Habitos, Bioenergia y Regulacion",
        reglas_base: GUIAS_BASE_POR_RAMA.habitos,
        nodos: {},
        fichas_recientes_ids: []
      }
    },
    fichasPorId: {},
    indiceTransversalTags: {}
  };
  const insertarFichaEnArbol = (ficha) => {
    arbol.fichasPorId[ficha.id] = ficha;
    const ramaObj = arbol.ramas[ficha.rama_id] || arbol.ramas.proyectos;
    if (!ramaObj.fichas_recientes_ids.includes(ficha.id)) {
      ramaObj.fichas_recientes_ids.unshift(ficha.id);
    }
    const tags = ficha.tags_mecanismo && ficha.tags_mecanismo.length > 0 ? ficha.tags_mecanismo : [`#general_${ficha.rama_id}`];
    for (const tag of tags) {
      if (!ramaObj.nodos[tag]) {
        ramaObj.nodos[tag] = {
          tag,
          rama_id: ficha.rama_id,
          frecuencia: 0,
          tasa_exito: 0,
          que_funciono: [],
          que_fallo: [],
          fichas_ids: []
        };
      }
      const nodo = ramaObj.nodos[tag];
      if (!nodo.fichas_ids.includes(ficha.id)) {
        nodo.fichas_ids.push(ficha.id);
        nodo.frecuencia = nodo.fichas_ids.length;
        if (ficha.resultado === "exito" && ficha.solucion_aplicada) {
          if (!nodo.que_funciono.includes(ficha.solucion_aplicada)) {
            nodo.que_funciono.push(ficha.solucion_aplicada);
          }
        } else if (ficha.resultado === "fallo") {
          const falloDesc = `${ficha.reaccion_inicial} -> ${ficha.solucion_aplicada}`;
          if (!nodo.que_fallo.includes(falloDesc)) {
            nodo.que_fallo.push(falloDesc);
          }
        }
        const exitosCount = nodo.fichas_ids.filter(
          (id) => arbol.fichasPorId[id]?.resultado === "exito"
        ).length;
        nodo.tasa_exito = Math.round(exitosCount / Math.max(1, nodo.frecuencia) * 100);
      }
      if (!arbol.indiceTransversalTags[tag]) {
        arbol.indiceTransversalTags[tag] = [];
      }
      if (!arbol.indiceTransversalTags[tag].includes(ficha.id)) {
        arbol.indiceTransversalTags[tag].push(ficha.id);
      }
    }
  };
  (memories || []).forEach((m, idx) => {
    insertarFichaEnArbol(asegurarFichaInmutable(m, idx + 1));
  });
  (conversations || []).filter((c) => c.isSummarized && c.summary).forEach((c, idx) => {
    const textoResumen = c.summary || "";
    const { rama, tags } = detectarRamaYTags(`${c.title} ${textoResumen}`);
    const fechaIso = (c.updatedAt || c.createdAt || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0];
    const extraerSeccion = (titulo) => {
      const regex = new RegExp(`##\\s*${titulo}[\\s\\S]*?(?=\\n##|$)`, "i");
      const match = textoResumen.match(regex);
      return match ? match[0].replace(/##\s*[^\n]+\n?/, "").trim().slice(0, 220) : "";
    };
    const contextoSec = extraerSeccion("CONTEXTO") || extraerSeccion("HISTORIA") || c.title;
    const patronesSec = extraerSeccion("PATRONES") || extraerSeccion("CAMBIOS DE ESTADO") || "Patron registrado en sesion";
    const principiosSec = extraerSeccion("DECISIONES / PROTOCOLOS") || extraerSeccion("PRINCIPIOS / REGLAS DESCUBIERTAS") || extraerSeccion("CONCLUSI\xD3N DE ESTADO") || textoResumen.slice(-220);
    insertarFichaEnArbol({
      id: `VIV-SES-${fechaIso}-${String(idx + 1).padStart(2, "0")}`,
      fecha: fechaIso,
      rama_id: c.rama_id || rama,
      tags_mecanismo: tags,
      contexto_situacional: {
        momento: c.title,
        nivel_energia: "medio",
        factores_externos: contextoSec.replace(/\s+/g, " ").slice(0, 120)
      },
      detonante_exacto: c.title,
      reaccion_inicial: patronesSec.replace(/\s+/g, " ").slice(0, 140),
      solucion_aplicada: principiosSec.replace(/\s+/g, " ").slice(0, 180),
      resultado: "exito",
      inmutable: true
    });
  });
  (strategies || []).forEach((s, idx) => {
    const { rama, tags } = detectarRamaYTags(`${s.name} ${s.situation} ${s.result}`);
    const fechaIso = (s.createdAt || (/* @__PURE__ */ new Date()).toISOString()).split("T")[0];
    insertarFichaEnArbol({
      id: `VIV-EST-${String(idx + 1).padStart(2, "0")}`,
      fecha: fechaIso,
      rama_id: s.rama_id || rama,
      tags_mecanismo: s.tags_mecanismo && s.tags_mecanismo.length > 0 ? s.tags_mecanismo : tags,
      contexto_situacional: {
        momento: s.situation,
        nivel_energia: s.resultType === "positivo" ? "alto" : "bajo",
        factores_externos: s.reason || "Estrategia evaluada"
      },
      detonante_exacto: s.situation,
      reaccion_inicial: s.resultType === "negativo" ? `Intento fallido: ${s.name}` : "Friccion ante la situacion",
      solucion_aplicada: `${s.name}: ${s.result}`,
      resultado: s.resultType === "positivo" ? "exito" : "fallo",
      inmutable: true
    });
  });
  return arbol;
}
var INITIAL_PATTERNS = consolidarNodosPatronesPorPunteros(INITIAL_MEMORIES);
var INITIAL_OBJETIVOS_ESTRUCTURADOS = [
  {
    id: "OBJ-PROD-645",
    titulo: PLANTILLAS_RASGOS_OFICIALES["PROD-1_arranque_645"].titulo,
    tipo: "productivo",
    periodo: "semanal",
    periodoClave: "Semana Actual",
    rasgoCodigo: "PROD-1_arranque_645",
    rama_id: "habitos",
    tags_mecanismo: ["#arranque_645", "#inercia_sueno"],
    franjaCritica: "06:45_arranque",
    meta: { objetivoNumerico: 6, progresoActual: 4, unidad: "dias" },
    protocoloPasos: PLANTILLAS_RASGOS_OFICIALES["PROD-1_arranque_645"].protocoloPasos,
    decretoClave: PLANTILLAS_RASGOS_OFICIALES["PROD-1_arranque_645"].decretoClave,
    obstaculosRegistrados: [],
    exitosRegistrados: [
      {
        fecha: new Date(Date.now() - 864e5).toISOString().split("T")[0],
        hora: "06:46",
        detonanteNegativo: "Pesadez al sonar la alarma",
        metodoAplicado: "Levantarse antes de contar hasta 3 + Agua fr\xEDa + Audio Horus 10m"
      }
    ],
    estado: "cumpliendo",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "OBJ-PROD-730",
    titulo: PLANTILLAS_RASGOS_OFICIALES["PROD-2_entreno_730"].titulo,
    tipo: "productivo",
    periodo: "semanal",
    periodoClave: "Semana Actual",
    rasgoCodigo: "PROD-2_entreno_730",
    rama_id: "habitos",
    tags_mecanismo: ["#entreno_poder", "#autoimagen_fisica"],
    franjaCritica: "07:30_entreno",
    meta: { objetivoNumerico: 6, progresoActual: 4, unidad: "dias" },
    protocoloPasos: PLANTILLAS_RASGOS_OFICIALES["PROD-2_entreno_730"].protocoloPasos,
    decretoClave: PLANTILLAS_RASGOS_OFICIALES["PROD-2_entreno_730"].decretoClave,
    obstaculosRegistrados: [],
    exitosRegistrados: [],
    estado: "cumpliendo",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "OBJ-PROD-1700",
    titulo: PLANTILLAS_RASGOS_OFICIALES["PROD-3_estudio_ingenieria"].titulo,
    tipo: "productivo",
    periodo: "semanal",
    periodoClave: "Semana Actual",
    rasgoCodigo: "PROD-3_estudio_ingenieria",
    rama_id: "proyectos",
    tags_mecanismo: ["#estudio_ingenieria", "#tolerancia_confusion", "#sobreestimulacion_digital"],
    franjaCritica: "17:00_estudio_ingenieria",
    meta: { objetivoNumerico: 6, progresoActual: 3, unidad: "bloques" },
    protocoloPasos: PLANTILLAS_RASGOS_OFICIALES["PROD-3_estudio_ingenieria"].protocoloPasos,
    decretoClave: PLANTILLAS_RASGOS_OFICIALES["PROD-3_estudio_ingenieria"].decretoClave,
    obstaculosRegistrados: [
      {
        fecha: new Date(Date.now() - 2 * 864e5).toISOString().split("T")[0],
        hora: "17:20",
        detonante: "Tentaci\xF3n de abrir partida de LOL tras ver aviso de examen en Discord"
      }
    ],
    exitosRegistrados: [
      {
        fecha: new Date(Date.now() - 864e5).toISOString().split("T")[0],
        hora: "17:05",
        detonanteNegativo: "Confusi\xF3n inicial ante tema nuevo de ingenier\xEDa",
        metodoAplicado: "Celular en No Molestar + Temporizador 15m aceptando confusi\xF3n + Video YouTube panorama general"
      }
    ],
    estado: "cumpliendo",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "OBJ-PSI-CONFIANZA",
    titulo: PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].titulo,
    tipo: "crecimiento_psicologico",
    periodo: "mensual",
    periodoClave: "Mes Actual",
    rasgoCodigo: "PSI-1_autoconfianza",
    rama_id: "vinculos",
    tags_mecanismo: ["#valor_intrinseco", "#busqueda_aprobacion", "#alma_libre"],
    franjaCritica: "23:00_cierre_o_social",
    meta: { objetivoNumerico: 12, progresoActual: 8, unidad: "episodios_exitosos" },
    protocoloPasos: PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].protocoloPasos,
    decretoClave: PLANTILLAS_RASGOS_OFICIALES["PSI-1_autoconfianza"].decretoClave,
    obstaculosRegistrados: [],
    exitosRegistrados: [],
    estado: "cumpliendo",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "OBJ-PSI-LEON",
    titulo: PLANTILLAS_RASGOS_OFICIALES["PSI-5_ideal_adaptado_leon"].titulo,
    tipo: "crecimiento_psicologico",
    periodo: "semanal",
    periodoClave: "Semana Actual",
    rasgoCodigo: "PSI-5_ideal_adaptado_leon",
    rama_id: "habitos",
    tags_mecanismo: ["#ideal_adaptado", "#control_ira_leon"],
    franjaCritica: "13:00_transicion_siesta",
    meta: { objetivoNumerico: 5, progresoActual: 4, unidad: "episodios_exitosos" },
    protocoloPasos: PLANTILLAS_RASGOS_OFICIALES["PSI-5_ideal_adaptado_leon"].protocoloPasos,
    decretoClave: PLANTILLAS_RASGOS_OFICIALES["PSI-5_ideal_adaptado_leon"].decretoClave,
    obstaculosRegistrados: [],
    exitosRegistrados: [
      {
        fecha: new Date(Date.now() - 3 * 864e5).toISOString().split("T")[0],
        hora: "20:15",
        detonanteNegativo: "Ropa planificada sucia minutos antes de salir a reuni\xF3n",
        metodoAplicado: "Pausar frustraci\xF3n + Ideal Adaptado eligiendo mejor combinaci\xF3n limpia disponible con total compostura"
      }
    ],
    estado: "cumpliendo",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];

// src/api/chat.ts
var GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
var PRIMARY_MODEL = "qwen/qwen3.8-27b";
function cleanThinkTags(text) {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (cleaned.includes("<think>")) {
    cleaned = cleaned.replace(/<think>[\s\S]*/gi, "").trim();
  }
  return cleaned.replace(/<\/think>/gi, "").trim();
}
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M\xE9todo no permitido" });
  }
  try {
    const {
      messages = [],
      memories = [],
      logs = [],
      strategies = [],
      conversations = [],
      previousSummaries = [],
      currentState,
      decisions = [],
      objetivosEstructurados = [],
      horaActualTexto,
      modoInteraccion,
      auditoriaComoVamosTexto,
      desgloseReporteTexto
    } = req.body || {};
    const ultimoMensajeUsuario = (messages || []).filter((m) => m.sender === "user" || m.role === "user").slice(-1)[0]?.text || "";
    const { rama: ramaActiva, tags: tagsDetectados } = detectarRamaYTags(
      ultimoMensajeUsuario,
      messages || []
    );
    const arbol = construirArbolDesdeDatos(memories || [], conversations || [], strategies || []);
    let fichasPodadas = consultarArbolPorRamaYNodo(arbol, ramaActiva, tagsDetectados, 5);
    if (!fichasPodadas || fichasPodadas.length === 0) {
      fichasPodadas = podarFichasParaInferencia(
        memories || [],
        strategies || [],
        ramaActiva,
        tagsDetectados,
        5
      );
    }
    const fichasCompactasTexto = formatearFichasInmutablesCompactas(fichasPodadas, ramaActiva);
    const hiloRecienteTexto = construirHiloActivoTexto(
      messages || [],
      decisions || [],
      currentState,
      ramaActiva
    );
    const hechoDosificadoTexto = obtenerHechoDosificadoSinRepetir(
      messages || [],
      ultimoMensajeUsuario
    );
    const infoHora = clasificarFranjaHoraria();
    const horaActualTextoFinal = horaActualTexto || `${infoHora.horaExacta} hs (${infoHora.labelFranja})`;
    const modoInteraccionFinal = modoInteraccion || evaluarModoInteraccion(ultimoMensajeUsuario, messages || []).modo;
    let auditoriaTextoFinal = auditoriaComoVamosTexto;
    if (!auditoriaTextoFinal && (objetivosEstructurados.length > 0 || logs.length > 0)) {
      const audObj = generarAuditoriaComoVamos(
        logs || [],
        objetivosEstructurados || [],
        memories || [],
        strategies || []
      );
      auditoriaTextoFinal = formatearAuditoriaParaPrompt(audObj);
    }
    const systemInstruction = buildRepairedSystemPrompt({
      ramaActiva,
      tagsDetectados,
      hiloRecienteTexto,
      fichasCompactasTexto,
      hechoDosificadoTexto,
      horaActualTexto: horaActualTextoFinal,
      modoInteraccion: modoInteraccionFinal,
      auditoriaComoVamosTexto: auditoriaTextoFinal,
      desgloseReporteTexto
    });
    const headerKey = req.headers?.["x-groq-api-key"];
    const groqKey = typeof headerKey === "string" && headerKey.trim() || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!groqKey) {
      return res.status(400).json({
        error: "No se encontr\xF3 clave API de Groq configurada en el servidor ni en las cabeceras."
      });
    }
    const recentMessages = (messages || []).slice(-5);
    const groqMessages = [
      { role: "system", content: systemInstruction },
      ...recentMessages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      })),
      { role: "assistant", content: ASSISTANT_PREFILL_TAG }
    ];
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: groqMessages,
        temperature: 0.25,
        max_tokens: 900
      })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || `Error en Groq API (${response.status})`
      });
    }
    const data = await response.json();
    const rawContent = cleanThinkTags(data.choices?.[0]?.message?.content || "");
    const fullContent = rawContent.startsWith("<analisis_contextual>") ? rawContent : `${ASSISTANT_PREFILL_TAG} ${rawContent}`;
    const { formattedMessage, tacticalAnalysis } = parseRepairedTacticalOutput(
      fullContent,
      ramaActiva,
      true
    );
    return res.status(200).json({
      message: formattedMessage,
      tacticalAnalysis,
      energyLevel: 7
    });
  } catch (error) {
    console.error("Error en api/chat serverless:", error);
    return res.status(500).json({ error: error.message || "Error procesando chat" });
  }
}
export {
  handler as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
