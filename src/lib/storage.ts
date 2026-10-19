/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Conversation, 
  Message, 
  Memory, 
  DailyLog, 
  Strategy, 
  Pattern,
  CurrentState,
  DailyReport,
  Decision,
  SistemaMentalData
} from "../types";
import { RAW_BASE_CONTEXT } from "./baseContext";

// Keys for local storage
const KEYS = {
  USER_PROFILE: "zen_ai_user_profile",
  CONVERSATIONS: "zen_ai_conversations",
  MESSAGES: "zen_ai_messages",
  MEMORIES: "zen_ai_memories",
  LOGS: "zen_ai_logs",
  STRATEGIES: "zen_ai_strategies",
  PATTERNS: "zen_ai_patterns",
  CURRENT_STATE: "zen_ai_current_state",
  DAILY_REPORTS: "zen_ai_daily_reports",
  DECISIONS: "zen_ai_decisions",
  SISTEMA_MENTAL: "zen_ai_sistema_mental",
  ACTIVE_CONVERSATION_ID: "zen_ai_active_conv_id",
};

export interface UserProfile {
  userName: string;
  companionName: string;
  avatarSeed: string;
  notes: string;
}

export const INITIAL_SISTEMA_MENTAL: SistemaMentalData = {
  id: "sistema-mental-master",
  neurobiologia: {
    deQueDepende: `Del punto de foco resultado de procesos conscientes e inconscientes, donde el inconsciente tiene mayor predominancia.
- El punto de foco determina qué sientes y qué haces en función de la interpretación y el contexto, donde las reacciones predeterminadas tienen prioridad.
- El punto de foco cambia según las variables y condiciones asociadas a procesos simultáneos OFF/ON.
- El punto de foco a largo plazo (días/meses) va creando una tendencia (polarización), lo que ayuda a fijar valores predeterminados favorables.
- Procesos inconscientes: eventos que puedan generar ansiedad a futuro (como un examen) generan ansiedad subterránea, lo que produce mayor evasión y rebeldía. La causa es inconsciente, por lo que muchas veces no entenderás qué está pasando conscientemente ni podrás controlarlo de forma directa.`,
    comoCambio: `Se puede cambiar el estado si se logra cambiar el punto de foco de manera gradual por un tiempo determinado.
- Para ello, es probable que existan fuerzas opuestas inconscientes afectando el intento de cambio (Resistencia).
- Una fuerza opuesta puede ser ansiedad inconsciente (algo que no sabes conscientemente que te afecta).
- Una solución efectiva es bloquear o ignorar cualquier proceso no relacionado a lo que buscas (como dudas y rumiaciones).
- Bloquear o ignorar es un proceso complejo que requiere convicción, energía y sobre todo entender la causa biológica.
- Actuar en modo OFF/ON crea una polarización positiva o negativa.
- Se puede forzar un arranque, pero lo crucial es generar tendencias estables a largo plazo.`,
    formulaEstado: `ESTADO = f(energía, evento, contexto, pensamiento, creencias, repetición, miedo) EN FOCO
* Si una variable no está en foco, afecta poco al estado actual.
* El estado es variable o estable; si es estable, debe ser protegido y mantenido. Las acciones y pensamientos determinan el estado A.`,
    estadoA: `El Estado A es de naturaleza VARIABLE (inestable / divagar) o CONSTANTE (estable).
- Tiene una causa (consciente o inconsciente) y una inercia (positiva o negativa).
- Si estás muy inmerso en A, es más difícil salir.
- Se suele aconsejar meditación para debilitar la inercia, pero no asegura nada por sí sola.
- Cualquier acción diferente a la naturaleza de A debilita la inercia de a poco.
- Lo que SÍ asegura salir de la inercia es entrar en un estado de flujo consciente usando el MÉTODO PREGUNTA-RESPUESTA.`,
    estadoB: `Determinar la forma, concentración del estudio, espontaneidad, etc.
- A partir de ahí poder buscar una herramienta personalizada.
- El Estado B puede ser buscado inconscientemente y generar ansiedad por expectativa.
- Si estás muy inmerso en B, es más difícil salir.
- Cualquier acción diferente a la naturaleza de B debilita la inercia de a poco.`,
    estadoBEstudio: `Dependiendo del tema a estudiar, causa resistencia interna:
- Temas nuevos: generan resistencia interna y dispersión porque no sabes por dónde comenzar.
- Pensar en la cantidad de temas y en lo que falta por estudiar genera ansiedad y ganas de evadirse.`,
    cambioEstable: `Los cambios deben ser procesos graduales, continuos en el tiempo, con tolerancia al fallo.
- Los primeros momentos del cambio son inherentemente inestables.
- La clave principal es el control repetido en el tiempo, con ayuda de un sistema de creencias favorable.
- El problema principal son las tendencias a distracción y dejarse llevar por impulsos (realizar otra actividad que hace perder el enfoque).
- Tener el control implica tener un visor donde se equilibra el estado ON/OFF.
- Escribir ayuda a enfocar la mente y mantener la atención, lo que facilita el cambio de estado.`,
    areasVida: [
      {
        code: "A0",
        name: "Limpieza, Organización y Conductas Básicas",
        description: "Entorno físico, orden diario, horarios y automatismos basales.",
        problems: "Falta de orden inicial, acumulación de fricción visual.",
        solutions: "Micro-hábitos diarios, rutina matutina despejada y despeje de escritorio previo."
      },
      {
        code: "A1",
        name: "Trabajo e Ingreso de Dinero",
        description: "Área laboral, proyectos productivos y estabilidad financiera.",
        problems: "Interrupciones, procrastinación en entregas complejas.",
        solutions: "Franja horaria dedicada, bloques sin distracciones, métricas de entregas."
      },
      {
        code: "A2",
        name: "Estudio y Ámbito Académico (Ingeniería en Informática)",
        description: "Tesis de Grado GitFlow, materias de 5to año, exámenes y código.",
        problems: "Evasión bajo presión, dispersión en temas nuevos, fatiga por volumen de contenido.",
        solutions: "Franja dorada 07:00 a 12:00, Método Pregunta-Respuesta, regla 52/17, despiece de temas."
      },
      {
        code: "A3",
        name: "Crecimiento Personal y Mejora de Uno Mismo",
        description: "Autoimagen, determinación, desinhibición social, carisma y espontaneidad.",
        problems: "Inseguridades primitivas de aceptación, miedo al rechazo, victimización ante fallos.",
        solutions: "Grado de Libertad ('No importa'), linterna del foco, método transición y acción con humor."
      },
      {
        code: "A4",
        name: "Cuidado Estético y Físico",
        description: "Entrenamiento diario, salud corporal, postura, energía física y nutrición.",
        problems: "Interrupción de rutina en días de exámenes, ver el entrenamiento como sufrimiento.",
        solutions: "Hacer del entreno un momento agradable, política del Día No Cero (3 min estiramiento mínimo)."
      }
    ]
  },
  creencias: {
    linternaFoco: "La conciencia es una linterna de foco limitado en un teatro oscuro. Lo que iluminas determina lo que sientes y haces. Controlar el punto de foco es controlar tu conducta.",
    polarizacionOnOff: "Actuar en modo OFF/ON de forma repetida genera una polarización biológica (tendencia a largo plazo) que convierte las conductas favorables en tu valor predeterminado.",
    dudaVsAccion: "LA DUDA SOLO SE PERMITE EN LA REFLEXIÓN, NUNCA EN LA ACCIÓN. Cuando actúas, actúas con determinación absoluta y sin vacilar.",
    autoconvencimiento: "El cerebro cree el discurso interno que le das con convicción y argumentos precisos. Autoconvencimiento positivo basado en evidencia y no en optimismo ciego.",
    distanciamientoTerceraPersona: "Analizar la propia conducta en tercera persona ('Juan está sintiendo resistencia porque su cerebro detecta gasto energético...') reduce la reactividad de la amígdala y activa el control prefrontal.",
    enfoqueNoMoral: "La pereza o apatía no son defectos morales ni culpa, son desbalances mecánicos de dopamina/glutamato o respuestas defensivas primitivas. Se resuelven con protocolos mecánicos.",
    toleranciaAlFallo: "Tolerancia absoluta al fallo: los procesos de cambio son inherentemente inestables al inicio. Caerse no arruina el sistema; lo que importa es la continuidad en el tiempo."
  },
  metodos: {
    preArranquePasos: [
      "1. Reconocimiento de mi estado ACTUAL A en tiempo real (determinar causas de ansiedad inconsciente cuando sea posible, conductas repetitivas negativas y disparadores de malos hábitos).",
      "2. Poder DETENER la inercia actual (pausa consciente de 1 minuto).",
      "3. Herramientas de neutralización y regulación emocional.",
      "4. Procesos de flujo estables pensando en mis metas con el MÉTODO PREGUNTA-RESPUESTA.",
      "5. Determinación y eliminación total de la duda al actuar.",
      "6. Autoconvencimiento positivo y convincente.",
      "7. PREPARACIÓN PREVIA DE LAS TAREAS (fricción cero en el escritorio).",
      "8. ARRANCAR."
    ],
    elArranqueEsClave: "La respuesta corta es SÍ y NO. Si estás preparado mental y físicamente será positivo; de lo contrario, el arranque puede ser inestable.",
    forzarArranqueFunciona: "A veces, dependiendo de si el estado actual A favorece o no. Si hay demasiada resistencia interna inconsciente no funcionará forzar a lo bruto; se debe regular primero la inercia.",
    metodoTransicion: {
      objetivo: "Visor espontáneo durante 15 minutos.",
      fase1Aislacion: "Generar un campo de aislación de 5 min (detener todo). Si no puedes aislarte físicamente, hazlo mentalmente; puedes liberar la mente estés donde estés.",
      fase2ReconocerDepurar: "No luches contra tus sensaciones primitivas, acéptalas e ignóralas poco a poco. Respira tranquilo y quítale importancia. Cuestiona pensamientos negativos con fundamentos precisos: '¿Por qué gastar energía en pensar así cuando da igual?'. La confianza es enemiga de la duda. Siente que nada importa: mientras más sientas que todo da igual, más poderoso te haces.",
      fase3AceptacionHumor: "Aceptación con humor y búsqueda del ideal adaptativo. Sé espontáneo, actúa sin el estrés del control rígido. Deja que tus acciones fluyan de forma natural y sin esfuerzo, sin planificar ni sobrepensar.",
      fase4Convencimiento: "Según el contexto, crea un discurso convincente sobre lo que buscas: el ideal adaptativo que lo acepta todo y disfruta el momento.",
      testCompletado: [
        "¿Qué tan libre te sientes?",
        "¿Te da igual lo que piense la gente?",
        "¿Y si quedas como tonto? (Aceptarlo con humor y soltura)."
      ],
      mantenimiento: "Mantener la idea del cambio por tiempo prolongado; si te distraes pierdes el efecto. Activar visor aplicado sobre las variables de espontaneidad y determinación, controlando los puntos muertos."
    },
    criterioDiaNoCero: {
      reglaInviolable: "Jamás se permite que termine un día sin haber realizado al menos una acción minúscula hacia tu objetivo de vida. El marcador del día nunca puede quedar en cero absoluto.",
      propositoIdentidad: "El Día No Cero no busca un progreso monumental, sino proteger tu identidad neuropsicológica: mantiene encendida la vía neuronal en los ganglios basales y preserva intacta tu autoimagen de persona disciplinada.",
      efectoQueCarajo: "El 'cero' activa el Efecto 'Qué Carajo' (What-The-Hell Effect): un sesgo de todo o nada donde la mente asume que como no pudo hacer la rutina perfecta, el día se arruinó y es mejor procrastinar.",
      triadaDiaDificil: [
        { item: "Acción Física Mínima", action: "3 minutos de estiramientos corporales básicos al lado de la silla de estudio (en vez de 1h de gimnasio)." },
        { item: "Gestión de Estudio", action: "Aplicar estrictamente la regla 52/17 (52 min de foco + 17 min sin pantallas para consolidación hipocampal)." },
        { item: "Acción de Avance Vital", action: "Abrir el archivo del proyecto o notas de inglés, escribir UNA sola línea de texto, guardar y cerrar (30 segundos)." }
      ],
      triadaDelYoTemporal: {
        yoPasado: "Perdón radical al Yo Pasado: si cometiste un error o perdiste tiempo, otórgate perdón absoluto inmediato para eliminar la carga negativa.",
        yoPresente: "Acción del Yo Presente: ejecutas la micro-acción de 30 segundos como un favor personal para tu versión futura.",
        yoFuturo: "Gratitud del Yo Futuro: mañana agradecerás no arrancar de cero absoluto porque tu Yo Pasado te dejó el camino iniciado."
      }
    },
    estrategiaLargoPlazo: [
      "Repetición de un patrón de conducta 'ideal' cada día.",
      "Reconocer qué estás buscando lograr y quién eres.",
      "Reconocer hacia dónde vas y neutralizar tus impulsos primitivos.",
      "Ser determinado al actuar.",
      "Aplicar espontaneidad en tiempo real.",
      "Aceptar lo negativo y dejar el miedo de lado.",
      "Uso de autorreflexión diaria o audios de anclaje.",
      "DETERMINACIÓN TOTAL CONTRA LA DISTRACCIÓN."
    ],
    metodoPreguntaRespuesta: "Subdividir cualquier tema complejo en preguntas y respuestas progresivas (de simple a complejo) para encender la curiosidad biológica y anclar el estado de flujo cognitivo."
  },
  limitaciones: [
    {
      id: "lim-1",
      title: "Ansiedad Inconsciente ante Exámenes y Futuro",
      description: "Eventos futuros de alta presión generan tensión subterránea no percibida.",
      manifestation: "Mayor tendencia a la evasión, rebeldía inconsciente y procrastinación.",
      countermeasure: "Aceptar que la causa es inconsciente, no moral; despiece en micro-metas de 15 min y regla 52/17."
    },
    {
      id: "lim-2",
      title: "Miedo al Rechazo y Expectativas de Aceptación",
      description: "Inseguridades primitivas y condicionamiento del propio valor a la respuesta externa.",
      manifestation: "Timidez, sobre-pensamiento social, rigidez o falta de espontaneidad.",
      countermeasure: "Activar el Grado de Libertad ('No importa', 'Da igual'), asumir atractivo objetivo y usar humor adaptativo."
    },
    {
      id: "lim-3",
      title: "Victimización y Falta de Tolerancia al Fallo",
      description: "Frustración excesiva cuando algo sale mal o cuando se interrumpe la rutina perfecta.",
      manifestation: "Efecto 'Qué Carajo', culpa, abandono de la jornada.",
      countermeasure: "Perdón radical al Yo Pasado, política de Día No Cero y comprensión de que el inicio del cambio es inestable."
    },
    {
      id: "lim-4",
      title: "Resistencia y Dispersión en Temas Nuevos",
      description: "Fricción cognitiva al no saber por dónde comenzar o abrumamiento por volumen de temas.",
      manifestation: "Distracción inmediata, apertura de pestañas secundarias o abandono del estudio.",
      countermeasure: "Método Pregunta-Respuesta para fragmentar lo desconocido en piezas simples de 15 minutos."
    },
    {
      id: "lim-5",
      title: "Baja de Dopamina y Fatiga Vespertina",
      description: "Caída natural de neurotransmisores y glucosa prefrontal pasadas las 13:00.",
      manifestation: "Lentitud mental, pesadez y sensación de culpa por no rendir igual que en la mañana.",
      countermeasure: "Blindar la franja 07:00 a 12:00 para lo difícil; pasar la tarde a tareas mecánicas, caminatas o NSDR."
    }
  ],
  objetivosClaves: [
    {
      id: "obj-1",
      number: 1,
      area: "A2 (Académico)",
      title: "Recibirse de Ingeniero en Informática (Tesis GitFlow)",
      description: "Norte definitivo actual. Convertir el avance de tesis y materias en una acción innegociable y constante.",
      limitations: ["Evasión en épocas de mayor presión", "Distracción", "Baja de dopamina", "Falta de organización inicial"],
      strategy: "Franja dorada 07:00 a 12:00, micro-metas de 15m (Yo Robot) y regla 52/17 sin pantallas."
    },
    {
      id: "obj-2",
      number: 2,
      area: "A4 (Físico)",
      title: "Cuidado Personal y Entrenamiento Físico Diario",
      description: "Cumplir todos los días con el entrenamiento haciéndolo agradable, eliminando la percepción mental de sufrimiento.",
      limitations: ["Falta de continuidad", "Interrupción en días de exámenes"],
      strategy: "Día No Cero: en días de examen o fatiga, realizar al menos 3 minutos de estiramientos corporales."
    },
    {
      id: "obj-3",
      number: 3,
      area: "A3/A4 (Personal / Imagen)",
      title: "Mejorar Autoimagen y Seguridad Interna",
      description: "Destruir inseguridades primitivas de aceptación. Asumir de forma objetiva atractivo, seguridad y claridad.",
      limitations: ["Miedo al rechazo", "Miedo a falta de salud", "Falta de prácticas sociales", "Victimización"],
      strategy: "Dejar de condicionar el valor personal a reacciones externas; actuar con convicción interna."
    },
    {
      id: "obj-4",
      number: 4,
      area: "A3 (Crecimiento Personal)",
      title: "Hombre Determinado, Libre y Espontáneo",
      description: "Dominar desinhibición y carisma social. Gobernar instintos primitivos y operar con 'Grado de Libertad'.",
      limitations: ["Sobre-análisis", "Miedo al qué dirán", "Rigidez de control"],
      strategy: "Método Transición (15 min): Aislación -> Depurar ('nada importa') -> Aceptación con humor -> Fluidez natural."
    },
    {
      id: "obj-5",
      number: 5,
      area: "A0/A1 (Rutina / Productividad)",
      title: "Sistematizar Rutina Diaria Perpetua (6:40 AM)",
      description: "Sustituir la inestable fuerza de voluntad por un sistema biológico impermeable al autosabotaje.",
      limitations: ["Inercia del sueño", "Falta de orden matutino"],
      strategy: "Despertar 6:40 AM, arranque rápido con conteo 5-4-3-2-1, 2 vasos de agua y algoritmo WOOP."
    },
    {
      id: "obj-6",
      number: 6,
      area: "A2/A3 (Habilidades)",
      title: "Rutina de Inglés Diario",
      description: "Adquirir el hábito de práctica activa diaria de inglés por patrones y escucha.",
      limitations: ["Pérdida de prioridad en semanas de exámenes"],
      strategy: "Día No Cero: mínimo 1 frase o 3 minutos de escucha activa diaria pase lo que pase."
    },
    {
      id: "obj-7",
      number: 7,
      area: "A3 (Comunicación)",
      title: "Desarrollo de Habilidad para Hablar y Comunicar en Videos",
      description: "Desarrollar personalidad, mostrarse auténtico, comunicar eficientemente y crear videos explicativos claros.",
      limitations: ["Priorizar otras cosas por falta de tiempo", "Fricción de exposición"],
      strategy: "Micro-grabaciones de 2 minutos sin editar para desensibilizar la cámara y ganar soltura."
    }
  ],
  aiSummary: `SISTEMA Y MARCO MENTAL DE JUAN FRANCISCO CANO:
1. NEUROBIOLOGÍA: El estado actual depende del punto de foco (conciencia/inconsciencia). La ansiedad ante exámenes genera evasión inconsciente. Cambiar de estado requiere cambiar de foco gradualmente y bloquear dudas con convicción (modo OFF/ON). Estado = f(energía, evento, contexto, pensamiento, creencias, repetición, miedo) en foco. Estado A (inercia actual, salir con flujo Pregunta-Respuesta) vs Estado B (estudio, resistencia a temas nuevos). Áreas de vida: A0 (organización), A1 (trabajo), A2 (estudio/tesis GitFlow), A3 (crecimiento/desinhibición), A4 (entrenamiento físico).
2. CREENCIAS CLAVE: La linterna del foco; La duda solo en la reflexión, NUNCA en la acción; Distanciamiento en 3ra persona; Enfoque no moral (dopamina/glutamato); Tolerancia al fallo.
3. MÉTODOS Y PROTOCOLOS: Pre-arranque (reconocer estado A, detener inercia, preguntas-respuestas, arrancar sin duda); Método Transición (15 min visor espontáneo: aislación -> depurar 'nada importa' -> aceptación con humor -> fluir); Criterio DÍA NO CERO (nunca cero; tríada mínima: 3 min estiramiento, 52/17, 1 línea de avance; tríada del Yo: perdón pasado, acción presente, gratitud futura); Método Yo Robot (5-4-3-2-1).
4. LIMITACIONES CONOCIDAS: Ansiedad inconsciente ante exámenes, evasión/rebeldía, miedo al rechazo, victimización por fallos, dispersión en temas nuevos, baja dopamínica de tarde.
5. METAS CLAVES: 1. Recibirse de Ingeniero (Tesis GitFlow), 2. Cuidado y entrenamiento diario, 3. Autoimagen objetiva, 4. Hombre determinado y espontáneo (Grado de Libertad), 5. Rutina 6:40 AM, 6. Inglés diario, 7. Hablar en videos.`,
  updatedAt: new Date().toISOString()
};

const DEFAULT_PROFILE: UserProfile = {
  userName: "Juan Francisco Cano",
  companionName: "Aura IA",
  avatarSeed: "juan",
  notes: RAW_BASE_CONTEXT,
};

const INITIAL_CURRENT_STATE: CurrentState = {
  activeGoals: [
    "Redactar marco metodológico de la Tesis de Grado (IA en metodologías GitFlow)",
    "Estabilizar módulo de cuotas y roles en Sistema Cooperadora FACET",
    "Sostener franja matutina estricta de 07:00 a 12:00 sin pantallas recreativas"
  ],
  openProblems: [
    "Dispersión y fatiga cognitiva en horas de la tarde tras almuerzo",
    "Fricción al iniciar tareas con requerimientos ambiguos o demasiado extensos"
  ],
  pendingTasks: [
    "Revisar observaciones de Esteban Saborido y Javier Graña sobre arquitectura",
    "Optimizar consultas en pgAdmin4 para el padrón de socios"
  ],
  activeProjects: [
    { name: "Tesis de Grado (IA & GitFlow)", status: "En redacción", progress: 65 },
    { name: "Cooperadora FACET", status: "Pruebas piloto", progress: 80 }
  ],
  updatedAt: new Date().toISOString()
};

const INITIAL_DECISIONS: Decision[] = [
  {
    id: "dec-1",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    decision: "Concentrar tareas de alta carga cognitiva estrictamente en la franja 07:00 a 12:00",
    reason: "Pico biológico de alerta y concentración; trabajar de tarde genera fricción innecesaria",
    status: "consolidada"
  },
  {
    id: "dec-2",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    decision: "Aplicar micro-metas de 15 minutos (Método Yo Robot) cuando aparezca resistencia",
    reason: "Desactivar la alarma de la amígdala y encender corteza prefrontal izquierda",
    status: "en prueba",
    reviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: "rep-1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    goals: ["Avanzar 2 secciones de Tesis", "Hacer pausas 52/17 sin pantallas"],
    results: ["Completadas 2 secciones de Tesis", "Pausa activa de 17m cumplida"],
    problems: ["Intentar extender trabajo intelectual a las 16:00 generó agotamiento"],
    decisions: ["Cortar estudio profundo a las 12:30 y pasar a tareas mecánicas"],
    projectStatus: "Tesis al 65%",
    observedPatterns: ["Máxima velocidad de redacción entre 08:00 y 11:00"],
    generalNote: "Excelente sesión matutina aplicando hilo único.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rep-2",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    goals: ["Resolver validaciones en Cooperadora FACET"],
    results: ["Validaciones completadas y testeadas"],
    problems: ["Dificultad inicial para arrancar por fatiga previa"],
    decisions: ["Iniciar con caminata breve y 2 vasos de agua antes del código"],
    projectStatus: "FACET al 80%",
    observedPatterns: ["El movimiento previo reduce la resistencia de arranque en un 40%"],
    generalNote: "Se cumplió el objetivo del día sin extender horarios.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Sesión inicial de enfoque",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary: null,
    isSummarized: false,
  }
];

const INITIAL_MESSAGES: Message[] = [];

const INITIAL_MEMORIES: Memory[] = [
  {
    id: "mem-1",
    text: "Prefiere trabajar sin música cuando realiza tareas analíticas. Se siente más productivo por la mañana (07:00 a 12:00).",
    category: "preferencias",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isApproved: true,
  },
  {
    id: "mem-2",
    text: "Meta actual: consolidar sesiones de trabajo en bloques de 52/17 sin distracciones digitales.",
    category: "objetivos",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isApproved: true,
  },
  {
    id: "mem-3",
    text: "Suele tener picos de creatividad y energía mental durante las mañanas de los días miércoles.",
    category: "hábitos",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isApproved: true,
  }
];

const INITIAL_LOGS: DailyLog[] = [
  {
    id: "log-1",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    energy: 7,
    motivation: 8,
    stress: 4,
    note: "Sesión matutina productiva en la Tesis. Realicé caminata breve.",
  },
  {
    id: "log-2",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    energy: 7,
    motivation: 8,
    stress: 3,
    note: "Miércoles de alto rendimiento. Logré 4 bloques de trabajo sin fricción.",
  },
  {
    id: "log-3",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    energy: 5,
    motivation: 6,
    stress: 7,
    note: "Tensión por entregas de tesis. Necesité aplicar NSDR de 20 min.",
  },
  {
    id: "log-4",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    energy: 6,
    motivation: 7,
    stress: 4,
    note: "Día balanceado tras aplicar método Yo Robot para destrabar código.",
  }
];

const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: "strat-1",
    name: "Franja Matutina Fija (07:00 - 12:00)",
    situation: "Tareas cognitivas complejas (arquitectura de tesis, modelado)",
    result: "Rendimiento y concentración máxima sostenida",
    effectiveness: "alta",
    status: "recomendada",
    resultType: "positivo",
    reason: "Alineado con ritmo circadiano y sin interrupciones",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "strat-2",
    name: "Estudio Intelectual Nocturno (21:00 - 00:00)",
    situation: "Intentar compensar horas no avanzadas durante el día",
    result: "Frustración, lentitud cognitiva e insomnio reactivo",
    effectiveness: "baja",
    status: "descartada",
    resultType: "negativo",
    reason: "Agotamiento de glucosa prefrontal y alteración del sueño reparador",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "strat-3",
    name: "Micro-acción de 15 minutos (Método Yo Robot)",
    situation: "Apatía, parálisis por sobre-análisis o resistencia al empezar",
    result: "Desbloquea la inercia y permite entrar en flujo natural",
    effectiveness: "alta",
    status: "recomendada",
    resultType: "positivo",
    reason: "Reduce la fricción a cero y activa la corteza prefrontal izquierda",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "strat-4",
    name: "Listas masivas de más de 8 tareas diarias",
    situation: "Planificación de pendientes académicos y personales",
    result: "Acumulación de ítems pendientes y sensación de culpa",
    effectiveness: "baja",
    status: "descartada",
    resultType: "negativo",
    reason: "Genera fatiga decisional y dispersión del foco de la linterna",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_PATTERNS: Pattern[] = [
  {
    id: "pat-1",
    type: "dato observado",
    description: "Mayor claridad mental y avance de tesis entre 07:00 y 11:30.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pat-2",
    type: "asociación",
    description: "Intentar forzar estudio analítico de tarde eleva el estrés un 40% y no produce avance.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pat-3",
    type: "hipótesis",
    description: "Las micro-metas de fricción cero reducen la parálisis inicial de código.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export function getLocalStorage<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return initialValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing localStorage key", key, error);
  }
}

export const ZenDB = {
  getUserProfile(): UserProfile {
    const profile = getLocalStorage<UserProfile>(KEYS.USER_PROFILE, DEFAULT_PROFILE);
    if (!profile.notes || profile.notes.length > 6000) {
      profile.notes = RAW_BASE_CONTEXT;
      setLocalStorage(KEYS.USER_PROFILE, profile);
    }
    return profile;
  },
  setUserProfile(profile: UserProfile): void {
    setLocalStorage(KEYS.USER_PROFILE, profile);
  },

  getSistemaMental(): SistemaMentalData {
    return getLocalStorage<SistemaMentalData>(KEYS.SISTEMA_MENTAL, INITIAL_SISTEMA_MENTAL);
  },
  setSistemaMental(data: SistemaMentalData): void {
    setLocalStorage(KEYS.SISTEMA_MENTAL, data);
  },

  getCurrentState(): CurrentState {
    return getLocalStorage<CurrentState>(KEYS.CURRENT_STATE, INITIAL_CURRENT_STATE);
  },
  setCurrentState(state: CurrentState): void {
    setLocalStorage(KEYS.CURRENT_STATE, state);
  },

  getDecisions(): Decision[] {
    return getLocalStorage<Decision[]>(KEYS.DECISIONS, INITIAL_DECISIONS);
  },
  setDecisions(decisions: Decision[]): void {
    setLocalStorage(KEYS.DECISIONS, decisions);
  },

  getDailyReports(): DailyReport[] {
    return getLocalStorage<DailyReport[]>(KEYS.DAILY_REPORTS, INITIAL_DAILY_REPORTS);
  },
  setDailyReports(reports: DailyReport[]): void {
    setLocalStorage(KEYS.DAILY_REPORTS, reports);
  },

  getConversations(): Conversation[] {
    return getLocalStorage<Conversation[]>(KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  },
  setConversations(conversations: Conversation[]): void {
    setLocalStorage(KEYS.CONVERSATIONS, conversations);
  },

  getMessages(): Message[] {
    return getLocalStorage<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
  },
  setMessages(messages: Message[]): void {
    setLocalStorage(KEYS.MESSAGES, messages);
  },

  getMemories(): Memory[] {
    return getLocalStorage<Memory[]>(KEYS.MEMORIES, INITIAL_MEMORIES);
  },
  setMemories(memories: Memory[]): void {
    setLocalStorage(KEYS.MEMORIES, memories);
  },

  getLogs(): DailyLog[] {
    return getLocalStorage<DailyLog[]>(KEYS.LOGS, INITIAL_LOGS);
  },
  setLogs(logs: DailyLog[]): void {
    setLocalStorage(KEYS.LOGS, logs);
  },

  getStrategies(): Strategy[] {
    return getLocalStorage<Strategy[]>(KEYS.STRATEGIES, INITIAL_STRATEGIES);
  },
  setStrategies(strategies: Strategy[]): void {
    setLocalStorage(KEYS.STRATEGIES, strategies);
  },

  getPatterns(): Pattern[] {
    return getLocalStorage<Pattern[]>(KEYS.PATTERNS, INITIAL_PATTERNS);
  },
  setPatterns(patterns: Pattern[]): void {
    setLocalStorage(KEYS.PATTERNS, patterns);
  },

  getActiveConversationId(): string {
    const defaultId = INITIAL_CONVERSATIONS[0]?.id || "";
    return getLocalStorage<string>(KEYS.ACTIVE_CONVERSATION_ID, defaultId);
  },
  setActiveConversationId(id: string): void {
    setLocalStorage(KEYS.ACTIVE_CONVERSATION_ID, id);
  },

  clearAll(): void {
    localStorage.removeItem(KEYS.USER_PROFILE);
    localStorage.removeItem(KEYS.CONVERSATIONS);
    localStorage.removeItem(KEYS.MESSAGES);
    localStorage.removeItem(KEYS.MEMORIES);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.STRATEGIES);
    localStorage.removeItem(KEYS.PATTERNS);
    localStorage.removeItem(KEYS.CURRENT_STATE);
    localStorage.removeItem(KEYS.DECISIONS);
    localStorage.removeItem(KEYS.DAILY_REPORTS);
    localStorage.removeItem(KEYS.SISTEMA_MENTAL);
    localStorage.removeItem(KEYS.ACTIVE_CONVERSATION_ID);
  }
};
