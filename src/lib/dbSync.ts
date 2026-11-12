/**
 * @file src/lib/dbSync.ts
 * La BASE DE DATOS (PocketBase) es la ÚNICA fuente de verdad de los reportes.
 *
 * - Los reportes (registros diarios) y los mensajes del Chat de Carga se leen SIEMPRE desde la BD.
 * - El navegador NO guarda copia de los reportes. Solo existe una "cola de reintento" temporal
 *   para un envío que falló por falta de señal; se vacía apenas la BD confirma la escritura.
 * - Rescate único: los reportes que quedaron atrapados en el celular por el bug anterior
 *   (bloqueo HTTPS→HTTP) se suben a la BD y luego se borran del celular.
 */

import { DailyLog, Message } from "../types";
import {
  createRegistroPB,
  createMensajePB,
  fetchRegistrosPBEstricto,
  fetchMensajesPBEstricto,
} from "../services/pocketbaseService";

export const CONV_CARGA_DIARIA_ID = "conv-canal-cargas-diarias";

const KEY_LEGACY_LOGS = "zen_ai_logs";
const KEY_LEGACY_MSGS = "zen_ai_messages";
const KEY_COLA_LOGS = "mentealfa_cola_reintento_registros";
const KEY_COLA_MSGS = "mentealfa_cola_reintento_mensajes";

const IDS_DEMO = new Set(["log-1", "log-2", "log-3", "log-4"]);

function leerJSON<T>(key: string, def: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : def;
  } catch {
    return def;
  }
}

function escribirJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Un mensaje forma parte de los REPORTES (va a la BD) si es del Chat de Carga o trae desglose. */
export function esMensajeDeReporte(m: Message): boolean {
  return m.conversationId === CONV_CARGA_DIARIA_ID || Boolean((m as any).desgloseReporte);
}

// ---------------------------------------------------------------------------
// Cola de reintento (solo para envíos que fallaron por red)
// ---------------------------------------------------------------------------
function encolar<T extends { id: string }>(key: string, item: T) {
  const cola = leerJSON<T[]>(key, []);
  if (!cola.some((c) => c.id === item.id)) {
    cola.push(item);
    escribirJSON(key, cola);
  }
}

function desencolar(key: string, id: string) {
  const cola = leerJSON<Array<{ id: string }>>(key, []);
  escribirJSON(key, cola.filter((c) => c.id !== id));
}

export function obtenerColaPendiente(): { logs: DailyLog[]; mensajes: Message[] } {
  return {
    logs: leerJSON<DailyLog[]>(KEY_COLA_LOGS, []),
    mensajes: leerJSON<Message[]>(KEY_COLA_MSGS, []),
  };
}

/** Guarda un reporte en la BD. Si falla tras 3 intentos queda en cola y se reintenta luego. */
export async function guardarRegistroEnBD(log: DailyLog): Promise<boolean> {
  const r = await createRegistroPB(log);
  if (r.success) {
    desencolar(KEY_COLA_LOGS, log.id);
    return true;
  }
  encolar(KEY_COLA_LOGS, log);
  return false;
}

/** Guarda un mensaje del Chat de Carga en la BD (con su desglose completo). */
export async function guardarMensajeEnBD(msg: Message): Promise<boolean> {
  const r = await createMensajePB(msg);
  if (r.success) {
    desencolar(KEY_COLA_MSGS, msg.id);
    return true;
  }
  encolar(KEY_COLA_MSGS, msg);
  return false;
}

// ---------------------------------------------------------------------------
// Carga inicial: BD como fuente de verdad + rescate de datos atrapados
// ---------------------------------------------------------------------------
export interface ResultadoSyncBD {
  bdDisponible: boolean;
  logs: DailyLog[];
  mensajesReporte: Message[];
  rescatadosLogs: number;
  rescatadosMensajes: number;
  pendientes: number;
}

export async function cargarReportesDesdeBD(): Promise<ResultadoSyncBD> {
  // Snapshot sincrónico de lo que quedó atrapado en el celular ANTES de cualquier otra escritura
  const legacyLogs = leerJSON<DailyLog[]>(KEY_LEGACY_LOGS, []).filter((l) => !IDS_DEMO.has(l.id));
  const legacyMsgs = leerJSON<Message[]>(KEY_LEGACY_MSGS, []).filter(esMensajeDeReporte);
  if (legacyLogs.length || legacyMsgs.length) {
    // Respaldo de seguridad hasta que la BD confirme (nunca se pierde un reporte)
    legacyLogs.forEach((l) => encolar(KEY_COLA_LOGS, l));
    legacyMsgs.forEach((m) => encolar(KEY_COLA_MSGS, m));
    localStorage.removeItem(KEY_LEGACY_LOGS);
  }

  const [remotosLogs, remotosMsgs] = await Promise.all([
    fetchRegistrosPBEstricto(),
    fetchMensajesPBEstricto(),
  ]);

  const cola = obtenerColaPendiente();

  // Si la BD no responde, NO se pierde nada: se muestra lo pendiente y se reintenta luego.
  if (remotosLogs === null || remotosMsgs === null) {
    return {
      bdDisponible: false,
      logs: cola.logs,
      mensajesReporte: cola.mensajes,
      rescatadosLogs: 0,
      rescatadosMensajes: 0,
      pendientes: cola.logs.length + cola.mensajes.length,
    };
  }

  const idsLogsBD = new Set(remotosLogs.map((l) => l.id));
  const idsMsgsBD = new Set(remotosMsgs.map((m) => m.id));

  // 1) Rescate: reportes atrapados en el celular (bug anterior) + cola de reintento
  const logsASubir = cola.logs.filter((l) => !idsLogsBD.has(l.id));
  const msgsASubir = cola.mensajes.filter((m) => !idsMsgsBD.has(m.id));
  // Los que ya estaban en la BD salen de la cola
  cola.logs.filter((l) => idsLogsBD.has(l.id)).forEach((l) => desencolar(KEY_COLA_LOGS, l.id));
  cola.mensajes.filter((m) => idsMsgsBD.has(m.id)).forEach((m) => desencolar(KEY_COLA_MSGS, m.id));

  const subidosLogs: DailyLog[] = [];
  const fallidosLogs: DailyLog[] = [];
  for (const l of logsASubir) {
    const ok = await guardarRegistroEnBD(l);
    (ok ? subidosLogs : fallidosLogs).push(l);
  }

  const subidosMsgs: Message[] = [];
  const fallidosMsgs: Message[] = [];
  for (const m of msgsASubir) {
    const ok = await guardarMensajeEnBD(m);
    (ok ? subidosMsgs : fallidosMsgs).push(m);
  }

  // 2) Limpieza del celular: los reportes ya NO se guardan localmente.
  //    Solo quedan en la cola los que no se pudieron subir (se reintentan en la próxima apertura).
  try {
    const legacyTodos = leerJSON<Message[]>(KEY_LEGACY_MSGS, []);
    escribirJSON(KEY_LEGACY_MSGS, legacyTodos.filter((m) => !esMensajeDeReporte(m)));
  } catch {
    /* ignore */
  }

  return {
    bdDisponible: true,
    logs: unirPorId(remotosLogs, [...subidosLogs, ...fallidosLogs]).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    mensajesReporte: unirPorId(remotosMsgs.filter(esMensajeDeReporte), [...subidosMsgs, ...fallidosMsgs]).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
    rescatadosLogs: subidosLogs.length,
    rescatadosMensajes: subidosMsgs.length,
    pendientes: fallidosLogs.length + fallidosMsgs.length,
  };
}

function unirPorId<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const out = [...base];
  const ids = new Set(base.map((b) => b.id));
  for (const e of extra) {
    if (!ids.has(e.id)) {
      out.push(e);
      ids.add(e.id);
    }
  }
  return out;
}
