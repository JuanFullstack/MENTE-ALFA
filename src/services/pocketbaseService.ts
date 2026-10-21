/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Conversation, 
  Memory, 
  Message, 
  DailyLog, 
  Pattern, 
  Strategy,
  AnalysisMetadata,
  FichaVivenciaInmutable 
} from "../types";
import { 
  UserProfile, 
  transformarConversacionAFicha, 
  transformarEstrategiaAFicha, 
  transformarMemoriaViejaAFicha, 
  consolidarNodosPatronesPorPunteros 
} from "../lib/storage";
import { asegurarFichaInmutable } from "../lib/baseContext";

export const POCKETBASE_URL = "http://167.234.243.247:8090";

/**
 * ============================================================================
 * 1. CONVERSACIONES Y RESÚMENES (mentealfa_conversaciones)
 * ============================================================================
 */
export async function fetchConversacionesPB(): Promise<Conversation[]> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_conversaciones/records?sort=-created&perPage=100`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar las conversaciones (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.convId || item.id,
      title: item.title || "Reflexión previa",
      summary: item.summary || null,
      isSummarized: !!item.isSummarized,
      analysisMetadata: item.analysisMetadata ? (typeof item.analysisMetadata === "string" ? JSON.parse(item.analysisMetadata) : item.analysisMetadata) : null,
      createdAt: item.created || new Date().toISOString(),
      updatedAt: item.updated || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("[PocketBase] Error al conectar con conversaciones:", error);
    return [];
  }
}

export async function upsertConversacionSummaryPB(
  convId: string,
  title: string,
  summary: string,
  analysisMetadata?: AnalysisMetadata | null
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_conversaciones/records?filter=(convId='${convId}')`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    let existingRecordId: string | null = null;
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.items && checkData.items.length > 0) {
        existingRecordId = checkData.items[0].id;
      }
    }

    const bodyPayload: any = {
      convId,
      title,
      summary,
      isSummarized: true,
    };

    if (existingRecordId) {
      const patchRes = await fetch(
        `${POCKETBASE_URL}/api/collections/mentealfa_conversaciones/records/${existingRecordId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (!patchRes.ok) {
        throw new Error(`Error en PATCH conversacion (${patchRes.status})`);
      }
      return { success: true, recordId: existingRecordId };
    } else {
      const postRes = await fetch(
        `${POCKETBASE_URL}/api/collections/mentealfa_conversaciones/records`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (!postRes.ok) {
        throw new Error(`Error en POST conversacion (${postRes.status})`);
      }
      const newRecord = await postRes.json();
      return { success: true, recordId: newRecord.id };
    }
  } catch (error: any) {
    console.error("[PocketBase] Error al guardar resumen de conversacion:", error);
    return { success: false, error: error.message || "Error desconocido en PocketBase." };
  }
}

export async function deleteConversacionPB(convId: string): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_conversaciones/records?filter=(convId='${convId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.items && checkData.items.length > 0) {
        const recordId = checkData.items[0].id;
        const delRes = await fetch(
          `${POCKETBASE_URL}/api/collections/mentealfa_conversaciones/records/${recordId}`,
          { method: "DELETE" }
        );
        return delRes.ok;
      }
    }
    return true;
  } catch (error) {
    console.warn("[PocketBase] Error al eliminar conversación:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 2. MENSAJES DE CHAT (mentealfa_mensajes)
 * ============================================================================
 */
export async function fetchMensajesPB(conversationId?: string): Promise<Message[]> {
  try {
    let url = `${POCKETBASE_URL}/api/collections/mentealfa_mensajes/records?sort=created&perPage=500`;
    if (conversationId) {
      url += `&filter=(conversationId='${conversationId}')`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar los mensajes (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.msgId || item.id,
      conversationId: item.conversationId || "",
      sender: (item.sender === "user" ? "user" : "assistant") as "user" | "assistant",
      text: item.text || "",
      detectedState: item.detectedState ? (typeof item.detectedState === "string" ? JSON.parse(item.detectedState) : item.detectedState) : null,
      energyLevel: item.energyLevel || undefined,
      createdAt: item.created || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("[PocketBase] Error al cargar mensajes:", error);
    return [];
  }
}

export async function createMensajePB(msg: Message): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_mensajes/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msgId: msg.id,
        conversationId: msg.conversationId,
        sender: msg.sender,
        text: msg.text,
        detectedState: msg.detectedState ? JSON.stringify(msg.detectedState) : null,
        energyLevel: msg.energyLevel || 0,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error en POST mensaje (${res.status})`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.warn("[PocketBase] Error al guardar mensaje:", error);
    return { success: false };
  }
}

export async function deleteMensajesByConvPB(conversationId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_mensajes/records?filter=(conversationId='${conversationId}')&perPage=500`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (res.ok) {
      const data = await res.json();
      const items = data.items || [];
      for (const item of items) {
        await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_mensajes/records/${item.id}`, {
          method: "DELETE",
        }).catch(() => {});
      }
    }
    return true;
  } catch (error) {
    console.warn("[PocketBase] Error al eliminar mensajes de conversacion:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 3. FICHAS DE VIVENCIAS INMUTABLES (mentealfa_memorias)
 * Fase 1: Cada ficha guardada es de solo lectura permanente, conservando
 * intactos el detonante, contexto situacional, sesgo, acción y resultado.
 * ============================================================================
 */
export async function fetchMemoriasPB(ramaId?: string): Promise<Memory[]> {
  try {
    let url = `${POCKETBASE_URL}/api/collections/mentealfa_memorias/records?sort=-created&perPage=200`;
    if (ramaId && ramaId !== "todos") {
      url += `&filter=(category='${encodeURIComponent(ramaId)}')`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar las memorias (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any, idx: number) => {
      const baseMem: Memory = {
        id: item.memId || item.id,
        text: item.text || "",
        category: item.category || "proyectos",
        createdAt: item.created || new Date().toISOString(),
        isApproved: item.isApproved !== false,
        summary: item.summary || undefined,
      };
      const ficha = asegurarFichaInmutable(baseMem, idx + 1);
      return {
        ...baseMem,
        fichaInmutable: ficha,
        rama_id: ficha.rama_id,
        tags_mecanismo: ficha.tags_mecanismo,
        isImmutable: true,
      };
    });
  } catch (error) {
    console.warn("[PocketBase] Error al conectar con memorias:", error);
    return [];
  }
}

export async function createMemoriaPB(memory: Memory): Promise<{ success: boolean; id?: string }> {
  try {
    const ficha = asegurarFichaInmutable(memory, 1);
    const serializedFicha = JSON.stringify(ficha);

    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_memorias/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memId: ficha.id,
        text: memory.text,
        category: ficha.rama_id,
        isApproved: memory.isApproved !== false,
        summary: serializedFicha,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error en POST memoria (${res.status})`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.warn("[PocketBase] Error al guardar memoria:", error);
    return { success: false };
  }
}

/**
 * Fase 1: Bloqueo de re-compresión sobre Fichas Inmutables.
 * Si una ficha ya es inmutable (VIV-*), se rechaza cualquier sobrescritura destructiva
 * sobre su texto o resumen original.
 */
export async function updateMemoriaPB(memId: string, text: string, category?: string, summary?: string): Promise<boolean> {
  if (memId.startsWith("VIV-")) {
    console.warn(`[Fase 1 - Protección Inmutable] La ficha ${memId} es de solo lectura permanente. Se bloqueó la re-compresión.`);
    return false;
  }
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_memorias/records?filter=(memId='${memId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = memId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const patchRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_memorias/records/${recordId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          ...(category ? { category } : {}),
          ...(summary !== undefined ? { summary } : {}),
        }),
      }
    );

    return patchRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al actualizar memoria:", error);
    return false;
  }
}

export async function deleteMemoriaPB(memId: string): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_memorias/records?filter=(memId='${memId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = memId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const delRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_memorias/records/${recordId}`,
      { method: "DELETE" }
    );

    return delRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al eliminar memoria:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 4. REGISTROS DIARIOS DE BIENESTAR (mentealfa_registros)
 * ============================================================================
 */
const META_PREFIX = "[[META_V3:";
const META_SUFFIX = "]]\n";

function serializarLogParaPB(log: DailyLog): string {
  const meta = {
    horaExacta: log.horaExacta,
    franja: log.franja,
    moodScore: log.moodScore,
    productivityScore: log.productivityScore,
    tipoReporte: log.tipoReporte,
    objetivoId: log.objetivoId,
    rasgoCodigo: log.rasgoCodigo,
    huboObstaculo: log.huboObstaculo,
    detonante: log.detonante,
    metodoAplicado: log.metodoAplicado,
    resultadoMetodo: log.resultadoMetodo,
  };
  return `${META_PREFIX}${JSON.stringify(meta)}${META_SUFFIX}${log.note || ""}`;
}

function deserializarLogDesdePB(item: any): DailyLog {
  const rawNote: string = item.note || "";
  let cleanNote = rawNote;
  let parsedMeta: Partial<DailyLog> = {};

  if (rawNote.startsWith(META_PREFIX)) {
    const endIdx = rawNote.indexOf(META_SUFFIX);
    if (endIdx !== -1) {
      const jsonStr = rawNote.substring(META_PREFIX.length, endIdx);
      cleanNote = rawNote.substring(endIdx + META_SUFFIX.length);
      try {
        parsedMeta = JSON.parse(jsonStr);
      } catch {
        // Fallback silencioso si el JSON fue editado manualmente
      }
    }
  }

  return {
    id: item.logId || item.id,
    energy: Number(item.energy) || 5,
    motivation: Number(item.motivation) || 5,
    stress: Number(item.stress) || 5,
    note: cleanNote,
    createdAt: item.created || new Date().toISOString(),
    ...parsedMeta,
  };
}

export async function fetchRegistrosPB(limitDays = 14): Promise<DailyLog[]> {
  try {
    const fechaDesde = new Date(Date.now() - limitDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ");
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_registros/records?sort=-created&perPage=200&filter=(created>='${encodeURIComponent(fechaDesde)}')`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(deserializarLogDesdePB);
  } catch (error) {
    console.warn("[PocketBase] Error al cargar registros diarios:", error);
    return [];
  }
}

export async function createRegistroPB(log: DailyLog): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_registros/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logId: log.id,
        energy: log.energy,
        motivation: log.productivityScore ?? log.motivation,
        stress: log.stress,
        note: serializarLogParaPB(log),
      }),
    });

    if (!res.ok) throw new Error(`Error en POST registro (${res.status})`);
    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.warn("[PocketBase] Error al guardar registro diario:", error);
    return { success: false };
  }
}

export async function deleteRegistroPB(logId: string): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_registros/records?filter=(logId='${logId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = logId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const delRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_registros/records/${recordId}`,
      { method: "DELETE" }
    );

    return delRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al eliminar registro diario:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 5. NODOS DE PATRONES POR PUNTEROS (mentealfa_patrones)
 * ============================================================================
 */
export async function fetchPatronesPB(): Promise<Pattern[]> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_patrones/records?sort=-created&perPage=100`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar los patrones (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.patId || item.id,
      type: (item.type || "dato observado") as "dato observado" | "asociación" | "hipótesis",
      description: item.description || "",
      createdAt: item.created || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("[PocketBase] Error al cargar patrones:", error);
    return [];
  }
}

export async function createPatronPB(pattern: Pattern): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_patrones/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patId: pattern.id,
        type: pattern.type,
        description: pattern.description,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error en POST patron (${res.status})`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.warn("[PocketBase] Error al guardar patrón:", error);
    return { success: false };
  }
}

export async function updatePatronPB(patId: string, description: string, type?: string): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_patrones/records?filter=(patId='${patId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = patId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const patchRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_patrones/records/${recordId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          ...(type ? { type } : {}),
        }),
      }
    );

    return patchRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al actualizar patrón:", error);
    return false;
  }
}

export async function deletePatronPB(patId: string): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_patrones/records?filter=(patId='${patId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = patId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const delRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_patrones/records/${recordId}`,
      { method: "DELETE" }
    );

    return delRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al eliminar patrón:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 6. ESTRATEGIAS (mentealfa_estrategias)
 * ============================================================================
 */
export async function fetchEstrategiasPB(): Promise<Strategy[]> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_estrategias/records?sort=-created&perPage=100`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar las estrategias (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.stratId || item.id,
      name: item.name || "Estrategia",
      situation: item.situation || "",
      result: item.result || "",
      effectiveness: (item.effectiveness || "alta") as "alta" | "media" | "baja",
      status: (item.status || (item.effectiveness === "alta" ? "recomendada" : "en prueba")) as "recomendada" | "en prueba" | "descartada",
      resultType: (item.resultType || (item.effectiveness === "baja" ? "negativo" : "positivo")) as "positivo" | "negativo",
      reason: item.reason || "",
      createdAt: item.created || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn("[PocketBase] Error al cargar estrategias:", error);
    return [];
  }
}

export async function createEstrategiaPB(strat: Strategy): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_estrategias/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stratId: strat.id,
        name: strat.name,
        situation: strat.situation,
        result: strat.result,
        effectiveness: strat.effectiveness,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error en POST estrategia (${res.status})`);
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.warn("[PocketBase] Error al guardar estrategia:", error);
    return { success: false };
  }
}

export async function updateEstrategiaPB(stratId: string, updates: Partial<Strategy>): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_estrategias/records?filter=(stratId='${stratId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = stratId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const patchRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_estrategias/records/${recordId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.situation ? { situation: updates.situation } : {}),
          ...(updates.result ? { result: updates.result } : {}),
          ...(updates.effectiveness ? { effectiveness: updates.effectiveness } : {}),
        }),
      }
    );

    return patchRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al actualizar estrategia:", error);
    return false;
  }
}

export async function deleteEstrategiaPB(stratId: string): Promise<boolean> {
  try {
    const checkRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_estrategias/records?filter=(stratId='${stratId}')`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    let recordId = stratId;
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.items && data.items.length > 0) {
        recordId = data.items[0].id;
      }
    }

    const delRes = await fetch(
      `${POCKETBASE_URL}/api/collections/mentealfa_estrategias/records/${recordId}`,
      { method: "DELETE" }
    );

    return delRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al eliminar estrategia:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 7. PERFIL DEL USUARIO (mentealfa_perfil)
 * ============================================================================
 */
export async function fetchPerfilPB(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_perfil/records?perPage=1&sort=-updated`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    return {
      userName: item.userName || "Juan Francisco Cano",
      companionName: item.companionName || "Aura IA",
      avatarSeed: item.avatarSeed || "juan",
      notes: item.notes || "",
    };
  } catch (error) {
    console.warn("[PocketBase] Error al obtener perfil:", error);
    return null;
  }
}

export async function savePerfilPB(profile: UserProfile): Promise<boolean> {
  try {
    const listRes = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_perfil/records?perPage=1`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let existingId: string | null = null;
    if (listRes.ok) {
      const data = await listRes.json();
      if (data.items && data.items.length > 0) {
        existingId = data.items[0].id;
      }
    }

    const payload = {
      userName: profile.userName,
      companionName: profile.companionName,
      avatarSeed: profile.avatarSeed,
      notes: profile.notes,
    };

    if (existingId) {
      const patchRes = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_perfil/records/${existingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return patchRes.ok;
    } else {
      const postRes = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_perfil/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return postRes.ok;
    }
  } catch (error) {
    console.warn("[PocketBase] Error al guardar perfil:", error);
    return false;
  }
}

/**
 * ============================================================================
 * 8. ARCHIVOS Y COPIAS DE BASE DE DATOS (mentealfa_archivos)
 * ============================================================================
 */
export async function backupDatabasePB(fullData: any): Promise<boolean> {
  try {
    const payload = {
      BaseDatos: typeof fullData === "string" ? fullData : JSON.stringify(fullData),
    };
    const postRes = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_archivos/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return postRes.ok;
  } catch (error) {
    console.warn("[PocketBase] Error al guardar copia de base de datos en archivos:", error);
    return false;
  }
}

export async function migrarBaseDeDatosExistenteAArbolPB(
  localConversations: Conversation[],
  localMemories: Memory[],
  localStrategies: Strategy[]
): Promise<{
  memoriesTransformadas: Memory[];
  patternsConsolidados: Pattern[];
  totalFichas: number;
}> {
  // 1. Recuperar todo lo que ya existe en PocketBase
  const [remConvs, remMems, remStrats] = await Promise.all([
    fetchConversacionesPB().catch(() => []),
    fetchMemoriasPB().catch(() => []),
    fetchEstrategiasPB().catch(() => []),
  ]);

  // 2. Unificar registros remotos y locales sin duplicar
  const todasConvs = [...remConvs];
  for (const lc of localConversations) {
    if (!todasConvs.some((c) => c.id === lc.id)) todasConvs.push(lc);
  }

  const todasMems = [...remMems];
  for (const lm of localMemories) {
    if (!todasMems.some((m) => m.id === lm.id || m.text === lm.text)) todasMems.push(lm);
  }

  const todasStrats = [...remStrats];
  for (const ls of localStrategies) {
    if (!todasStrats.some((s) => s.id === ls.id || s.name === ls.name)) todasStrats.push(ls);
  }

  // 3. Transformar cada fuente a FichaVivenciaInmutable
  const mapaFichas = new Map<string, FichaVivenciaInmutable>();

  todasMems.forEach((m, i) => {
    const f = transformarMemoriaViejaAFicha(m, i);
    mapaFichas.set(f.id, f);
  });

  todasConvs.forEach((c, i) => {
    const f = transformarConversacionAFicha(c, i);
    if (f) mapaFichas.set(f.id, f);
  });

  todasStrats.forEach((s, i) => {
    const f = transformarEstrategiaAFicha(s, i);
    mapaFichas.set(f.id, f);
  });

  // 4. Convertir todas las fichas al formato Memory enriquecido para el Arbol
  const memoriesTransformadas: Memory[] = Array.from(mapaFichas.values()).map((ficha) => ({
    id: ficha.id,
    text: `[${ficha.id} · ${ficha.rama_id.toUpperCase()} · ${ficha.tags_mecanismo.join(" ")}] Detonante: ${ficha.detonante_exacto} | Contexto: ${ficha.contexto_situacional.momento} (Energia: ${ficha.contexto_situacional.nivel_energia}) | Sesgo: ${ficha.reaccion_inicial} | Quiebre: ${ficha.solucion_aplicada} -> Resultado: ${ficha.resultado.toUpperCase()}`,
    category: ficha.rama_id,
    createdAt: new Date(ficha.fecha).toISOString(),
    isApproved: true,
    summary: JSON.stringify(ficha),
    fichaInmutable: ficha,
    rama_id: ficha.rama_id,
    tags_mecanismo: ficha.tags_mecanismo,
    isImmutable: true,
  }));

  // 5. Subir a PocketBase las fichas transformadas que aun no estaban en mentealfa_memorias
  const idsExistentesEnPB = new Set(remMems.map((m) => m.id));
  for (const mem of memoriesTransformadas) {
    if (!idsExistentesEnPB.has(mem.id)) {
      await createMemoriaPB(mem).catch(() => {});
    }
  }

  // 6. Consolidar Nodos de Patrones por punteros (Fase 1 Capa 2)
  const patternsConsolidados = consolidarNodosPatronesPorPunteros(memoriesTransformadas);

  return {
    memoriesTransformadas,
    patternsConsolidados,
    totalFichas: memoriesTransformadas.length,
  };
}

