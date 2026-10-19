/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RamaTematica = 'proyectos' | 'vinculos' | 'habitos';

export type MemoryCategory =
  | RamaTematica
  | 'experiencias'
  | 'general'
  | 'preferencias'
  | 'hábitos'
  | 'objetivos'
  | 'identidad'
  | 'creencias'
  | 'estrategias'
  | 'valores'
  | string;

// Ficha Episódica Inmutable (Nivel 1 - Solo lectura permanente tras crearse, ~60-90 tokens)
export interface FichaVivenciaInmutable {
  id: string; // ej: "VIV-2026-10-19-01"
  fecha: string;
  rama_id: RamaTematica;
  tags_mecanismo: string[]; // ej: ["#paralisis_perfeccionismo", "#fatiga_tarde"]
  contexto_situacional: {
    momento: string; // Horario y entorno físico
    nivel_energia: 'alto' | 'medio' | 'bajo';
    factores_externos: string; // Interrupciones, presiones de entrega
  };
  detonante_exacto: string; // Hecho puntual objetivo disparador
  reaccion_inicial: string; // Conducta o loop automático (sesgo)
  solucion_aplicada: string; // Micro-acción real de quiebre
  resultado: 'exito' | 'neutro' | 'fallo';
  inmutable?: boolean; // Bloqueo de re-compresión
}

// Nodo de Patrón Consolidado (Nivel 2 - Indexación por punteros sin re-resumir texto)
export interface NodoPatron {
  id: string; // ej: "PAT-01"
  nombre: string;
  rama_id: RamaTematica;
  tags_mecanismo?: string[];
  punteros_vivencias: string[]; // Array de IDs hacia FichaVivenciaInmutable
  frecuencia: number;
  correlacion_situacional: string; // Condiciones comunes detectadas
  soluciones_efectivas: string[];
  tasa_exito?: number; // Porcentaje 0-100 calculado estadísticamente
}

// Estado del Hilo Activo (Continuidad reciente por rama)
export interface HiloActivo {
  id: string; // ej: "HILO-45"
  rama_id: RamaTematica;
  titulo_tema: string;
  resumen_estado_actual: string; // Qué se intentó ayer y qué falta hoy
  ultimas_interacciones: Array<{ rol: 'user' | 'assistant'; texto: string }>;
  activo: boolean;
}

export interface Memory {
  id: string;
  text: string;
  category: MemoryCategory;
  createdAt: string;
  isApproved: boolean;
  summary?: string;
  origin?: string;
  // Fase 1 & 2: Soporte nativo de Ficha Inmutable y Poda por Ramas
  fichaInmutable?: FichaVivenciaInmutable;
  rama_id?: RamaTematica;
  tags_mecanismo?: string[];
  isImmutable?: boolean;
}

// 4 Ejes Dimensionales del Sistema Mental
export interface DimensionalAxis {
  axis: 'seguridad' | 'libertad' | 'regulacion' | 'relaciones';
  label: string;           // Ej: "Seguridad Personal"
  positive: string;        // Ej: "Confianza ↑"
  negative: string;        // Ej: "Inseguridad ↑"
  intensity: number;       // -10 (negativo máx) a +10 (positivo máx)
  evidence: string;        // Evidencia textual observada
}

// Metadata analítica que acompaña al resumen de 14 puntos
export interface AnalysisMetadata {
  axes: DimensionalAxis[];
  dominantPattern?: string | null;
  evolutionVsPrevious?: 'mejora' | 'regresion' | 'estable' | 'nuevo' | null;
  contradictions?: string[];        // Contradicciones detectadas con sesiones previas
  novelInsights?: string[];         // Elementos nuevos nunca antes registrados
  sourceType?: 'sistema' | 'personal' | 'derivado';
  processedAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  summary: string | null;
  isSummarized: boolean;
  analysisMetadata?: AnalysisMetadata | null;
  rama_id?: RamaTematica;
  hiloActivo?: HiloActivo | null;
}

// Marco mental con trazabilidad de origen
export interface MentalFramework {
  id: string;
  content: string;
  origin: 'experiencia_directa' | 'reflexion_propia' | 'consejo_externo' | 'lectura' | 'ia_derivado';
  originDetail: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Reporte del motor de contexto evolutivo
export interface ContextEvolutionReport {
  id: string;
  generatedAt: string;
  overallTrend: string;
  axes: {
    axis: string;
    label: string;
    score: number;      // -10 a +10
    trend: 'mejora' | 'regresion' | 'estable';
    delta: number;
    evidence: string;
  }[];
  contradictions: {
    previousBelief: string;
    newEvidence: string;
    resolution: string;
  }[];
  novelDiscoveries: string[];
  recommendedActions: {
    type: 'consolidar' | 'revisar' | 'investigar';
    title: string;
    detail: string;
  }[];
  activePrinciples: string[];
}

export interface TacticalAnalysisBlock {
  continuidad: string;
  consejoGenericoDescartado: string;
  patronDetectado: string;
  consejoTactico: string;
  ramaDetectada?: RamaTematica;
  fichasCitadas?: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  text: string;
  createdAt: string;
  detectedState?: {
    tags: string[];
    description: string;
  } | null;
  energyLevel?: number | null;
  tacticalAnalysis?: TacticalAnalysisBlock | null;
  suggestions?: {
    decision?: DecisionSuggestion | null;
    strategy?: StrategySuggestion | null;
    stateUpdate?: StateUpdateSuggestion | null;
  } | null;
}

export interface DailyLog {
  id: string;
  createdAt: string;
  energy: number;     // 1 to 10
  motivation: number; // 1 to 10
  stress: number;     // 1 to 10
  note: string;
}

// Capa B: Estado Actual Dinámico
export interface CurrentState {
  activeGoals: string[];
  openProblems: string[];
  pendingTasks: string[];
  activeProjects: { name: string; status: string; progress: number }[];
  updatedAt: string;
}

// Capa C: Reporte Diario Estructurado
export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  goals: string[];
  results: string[];
  problems: string[];
  decisions: string[];
  projectStatus: string;
  observedPatterns: string[];
  generalNote?: string;
  createdAt: string;
}

// Capa D: Memoria de Decisiones Tomadas
export interface Decision {
  id: string;
  date: string; // ISO date
  decision: string;
  reason: string;
  status: 'en prueba' | 'consolidada' | 'descartada';
  reviewDate?: string;
  rama_id?: RamaTematica;
}

// Capa E: Opciones y Estrategias (Qué funcionó vs Qué NO funcionó)
export interface Strategy {
  id: string;
  name: string;
  situation: string;
  result: string;
  effectiveness: 'baja' | 'media' | 'alta';
  status: 'recomendada' | 'en prueba' | 'descartada';
  resultType: 'positivo' | 'negativo';
  reason: string;
  createdAt: string;
  rama_id?: RamaTematica;
  tags_mecanismo?: string[];
}

export interface Pattern {
  id: string;
  type: 'dato observado' | 'asociación' | 'hipótesis';
  description: string;
  createdAt: string;
  // Fase 1 & 2: Nodo de Patrón por punteros a Fichas Inmutables
  nodoPatron?: NodoPatron;
}

export interface QuickLogState {
  energy: number;
  motivation: number;
  stress: number;
  note: string;
}

export interface ZenInsights {
  mentalClarity: number; // 0-100%
  stressLevel: 'Bajo' | 'Moderado' | 'Alto';
  correlations: {
    type: 'dato observado' | 'asociación' | 'hipótesis';
    description: string;
  }[];
  weeklyHistory: {
    day: string;
    motivation: number;
    stress: number;
    energy: number;
  }[];
  frequentThemes: string[];
}

export interface LifeArea {
  code: string; // A0, A1, A2, A3, A4
  name: string;
  description: string;
  problems: string;
  solutions: string;
}

export interface MentalLimitation {
  id: string;
  title: string;
  description: string;
  manifestation: string;
  countermeasure: string;
}

export interface MasterGoal {
  id: string;
  number: number;
  area: string;
  title: string;
  description: string;
  limitations: string[];
  strategy: string;
}

export interface SistemaMentalData {
  id: string;
  // 1. Neurobiología del Estado
  neurobiologia: {
    deQueDepende: string;
    comoCambio: string;
    formulaEstado: string;
    estadoA: string;
    estadoB: string;
    estadoBEstudio: string;
    cambioEstable: string;
    areasVida: LifeArea[];
  };
  // 2. Creencias y Leyes Mentales
  creencias: {
    linternaFoco: string;
    polarizacionOnOff: string;
    dudaVsAccion: string;
    autoconvencimiento: string;
    distanciamientoTerceraPersona: string;
    enfoqueNoMoral: string;
    toleranciaAlFallo: string;
  };
  // 3. Métodos y Protocolos
  metodos: {
    preArranquePasos: string[];
    elArranqueEsClave: string;
    forzarArranqueFunciona: string;
    metodoTransicion: {
      objetivo: string;
      fase1Aislacion: string;
      fase2ReconocerDepurar: string;
      fase3AceptacionHumor: string;
      fase4Convencimiento: string;
      testCompletado: string[];
      mantenimiento: string;
    };
    criterioDiaNoCero: {
      reglaInviolable: string;
      propositoIdentidad: string;
      efectoQueCarajo: string;
      triadaDiaDificil: { item: string; action: string }[];
      triadaDelYoTemporal: { yoPasado: string; yoPresente: string; yoFuturo: string };
    };
    estrategiaLargoPlazo: string[];
    metodoPreguntaRespuesta: string;
  };
  // 4. Limitaciones y Bloqueos
  limitaciones: MentalLimitation[];
  // 5. Objetivos Claves de Vida (7 metas)
  objetivosClaves: MasterGoal[];
  // Resumen conciso para la IA
  aiSummary: string;
  updatedAt: string;
}

export interface DecisionSuggestion {
  decision: string;
  reason: string;
  status: 'en prueba' | 'consolidada' | 'descartada';
  reviewDate?: string;
}

export interface StrategySuggestion {
  name: string;
  situation: string;
  result: string;
  effectiveness: 'alta' | 'media' | 'baja';
  status: 'recomendada' | 'en prueba' | 'descartada';
  resultType: 'positivo' | 'negativo';
  reason: string;
}

export interface StateUpdateSuggestion {
  newGoal?: string;
  newProblem?: string;
  resolvedProblem?: string;
  newPendingTask?: string;
}

export interface AIChatResponse {
  message: string;
  detectedState: {
    tags: string[];
    description: string;
  };
  tacticalAnalysis?: TacticalAnalysisBlock | null;
  suggestedMemory?: string;
  suggestedDecision?: DecisionSuggestion | null;
  suggestedStrategy?: StrategySuggestion | null;
  suggestedStateUpdate?: StateUpdateSuggestion | null;
  energyLevel?: number;
}
