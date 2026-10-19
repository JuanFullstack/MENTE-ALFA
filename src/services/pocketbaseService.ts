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
  AnalysisMetadata 
} from "../types";
import { UserProfile } from "../lib/storage";

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
 * 3. NOTAS MENTALES / MEMORIAS (mentealfa_memorias)
 * ============================================================================
 */
export async function fetchMemoriasPB(): Promise<Memory[]> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_memorias/records?sort=-created&perPage=200`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar las memorias (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.memId || item.id,
      text: item.text || "",
      category: item.category || "general",
      createdAt: item.created || new Date().toISOString(),
      isApproved: item.isApproved !== false,
      summary: item.summary || undefined,
    }));
  } catch (error) {
    console.warn("[PocketBase] Error al conectar con memorias:", error);
    return [];
  }
}

export async function createMemoriaPB(memory: Memory): Promise<{ success: boolean; id?: string }> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_memorias/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memId: memory.id,
        text: memory.text,
        category: memory.category,
        isApproved: memory.isApproved !== false,
        summary: memory.summary || "",
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

export async function updateMemoriaPB(memId: string, text: string, category?: string, summary?: string): Promise<boolean> {
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
export async function fetchRegistrosPB(): Promise<DailyLog[]> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/mentealfa_registros/records?sort=-created&perPage=200`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn(`[PocketBase] No se pudieron listar los registros (${res.status})`);
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => ({
      id: item.logId || item.id,
      energy: Number(item.energy) || 5,
      motivation: Number(item.motivation) || 5,
      stress: Number(item.stress) || 5,
      note: item.note || "",
      createdAt: item.created || new Date().toISOString(),
    }));
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
        motivation: log.motivation,
        stress: log.stress,
        note: log.note,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error en POST registro (${res.status})`);
    }

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
 * 5. PATRONES CONDUCTUALES (mentealfa_patrones)
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
