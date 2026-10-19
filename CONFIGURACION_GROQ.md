# Protocolo Maestro de Configuración de Groq AI (Guía Definitiva para IAs y Proyectos)

> [!IMPORTANT]
> **DIRECTRICES FUNDAMENTALES PARA CUALQUIER IA O AGENTE QUE CONFIGURE UN PROYECTO:**
> 1. **LA CLAVE DE GROQ YA ESTÁ CONFIGURADA EN VERCEL:** En producción, las variables `GROQ_API_KEY` y `VITE_GROQ_API_KEY` ya residen en el panel de Vercel. **NUNCA le pidas la clave al usuario**.
> 2. **LÍMITE ESTRICTO DE TOKENS (12.000 TPM):** En la capa gratuita/on-demand de Groq, una petición nunca debe superar los 12.000 tokens por minuto. Es **OBLIGATORIO** usar contextos compactos (<1.500 tokens) y ventana deslizante de historial (`messages.slice(-8)`).
> 3. **ARQUITECTURA HÍBRIDA RESILIENTE:** El frontend debe intentar primero el backend (`/api/chat`), y si este no responde (ej. en desarrollo local de puro Vite), debe hacer fallback transparente a la API directa de Groq desde el navegador.

---

## 1. Dónde Reside la Clave API (Entornos)

| Entorno | Variable de Entorno | Dónde se Configura |
| :--- | :--- | :--- |
| **Vercel (Producción)** | `GROQ_API_KEY` / `VITE_GROQ_API_KEY` | En el Dashboard de Vercel (`Project Settings -> Environment Variables`). Inyectada automáticamente. |
| **Local (Desarrollo)** | `GROQ_API_KEY` / `VITE_GROQ_API_KEY` | En el archivo `.env.local` en la raíz del proyecto. |
| **Navegador (Frontend)** | `localStorage.getItem('groq_api_key')` | Opcional, solo si el usuario decide sobrescribirla manualmente desde la UI. |

### Clave de Fallback Integrada:
Para evitar que la app arranque en estado de "Configuración Pendiente" en local, el servicio de Groq debe tener una clave de respaldo por defecto si las variables del sistema no están presentes.

---

## 2. Regla de Oro: Control de TPM y Ventana de Contexto (Evitar Error 413)

Groq impone un límite de **12.000 Tokens Por Minuto (TPM)** para el modelo `llama-3.3-70b-versatile`.

### Reglas obligatorias de diseño de prompts:
1. **Contexto Base Compacto:**
   - El System Prompt o contexto del usuario debe estar resumido a alta densidad semántica (máximo **1.000 a 1.500 tokens**).
   - Prohibido concatenar notas crudas, volcados de texto de 40KB o historiales infinitos.
2. **Ventana Deslizante del Historial (Sliding Window):**
   - Siempre filtrar y recortar los mensajes antes de enviarlos a Groq:
     ```typescript
     const recentMessages = messages.slice(-8); // Solo los últimos 8 mensajes
     ```
3. **Límite de Salida (`max_tokens`):**
   - Establecer `max_tokens` entre **1000 y 1500** para respuestas conversacionales normales.

---

## 3. Arquitectura de Conexión Híbrida Resiliente

Para que la app funcione tanto en producción (Vercel Serverless) como en desarrollo local (Vite en puerto 5173 o Node en puerto 3000), se implementa un flujo de dos niveles:

```
[Usuario envía mensaje]
         │
         ▼
[1. Intentar POST /api/chat] ─── (¿Respondió OK?) ───► [Renderizar respuesta]
         │ (Fallo / 404 / Offline)
         ▼
[2. Llamada directa a Groq Cloud API desde el navegador]
    (https://api.groq.com/openai/v1/chat/completions)
         │
         ▼
[Renderizar respuesta con Llama 3.3 70B]
```

---

## 4. Guía Paso a Paso para Configurar un Nuevo Proyecto

Cualquier IA que configure un nuevo proyecto debe seguir estos 5 pasos exactos:

### Paso 1: Crear `.env.local` en la raíz
```env
# Groq Cloud API Key
GROQ_API_KEY=gsk_tu_clave_aqui
VITE_GROQ_API_KEY=gsk_tu_clave_aqui
```

---

### Paso 2: Crear el Servicio Cliente `src/services/groqEvaluation.ts` (o `groqService.ts`)

```typescript
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GROQ_API_KEY = "";

export function getStoredGroqApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("groq_api_key");
    if (local && local.trim()) return local.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();
  return DEFAULT_GROQ_API_KEY;
}

export function getStoredGroqModel(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("groq_model");
    if (local && local.trim()) return local.trim();
  }
  return DEFAULT_GROQ_MODEL;
}

export async function chatWithGroq(
  messages: Array<{ role: string; content: string }>,
  options: { apiKey?: string; model?: string; temperature?: number; max_tokens?: number; jsonMode?: boolean } = {}
): Promise<string> {
  const apiKey = options.apiKey || getStoredGroqApiKey();
  const model = options.model || getStoredGroqModel();
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.max_tokens ?? 1500;

  const payload: any = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (options.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Error de Groq API (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
```

---

### Paso 3: Configurar Backend Express / Serverless (`server.ts` o `api/server.js`)

```typescript
import express from 'express';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_API_KEY = "";

function getGroqKey(req?: express.Request): string {
  const headerKey = req?.headers["x-groq-api-key"];
  if (typeof headerKey === "string" && headerKey.trim()) return headerKey.trim();
  const envKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes("gsk_tu_clave")) return envKey.trim();
  return DEFAULT_GROQ_API_KEY;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, baseContext } = req.body;
    const groqKey = getGroqKey(req);

    // Ventana deslizante para no exceder los 12.000 TPM
    const recentMessages = (messages || []).slice(-8);

    const groqMessages = [
      { role: "system", content: baseContext || "Eres un asistente de alta precisión." },
      ...recentMessages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    return res.json(JSON.parse(content));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### Paso 4: Configurar Proxy en `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 5. Modelos Disponibles y Cuándo Usar Cada Uno

| Modelo | Identificador (`model`) | Velocidad | Caso de Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **Llama 3.3 70B Versatile** | `llama-3.3-70b-versatile` | ~280 t/s | **Principal**. Razonamiento complejo, psicología conductual, matemática, corrección y generación profunda. |
| **Llama 3.1 8B Instant** | `llama-3.1-8b-instant` | ~750 t/s | Pings de conectividad, respuestas de 1 línea, resúmenes relámpago. |
| **Mixtral 8x7B** | `mixtral-8x7b-32768` | ~500 t/s | Contextos de hasta 32k tokens cuando se procesan documentos extensos. |

---

## 6. Lista de Verificación (Checklist) para la IA antes de Finalizar

- [x] ¿Existe `.env.local` con `GROQ_API_KEY` y `VITE_GROQ_API_KEY`?
- [x] ¿El prompt del sistema está compactado a <1.500 tokens?
- [x] ¿Se implementó `.slice(-8)` en el historial de mensajes?
- [x] ¿El frontend tiene fallback directo a Groq Cloud API si el backend no responde?
- [x] ¿`max_tokens` está acotado a 1.500?
- [x] ¿Se probó una petición real devolviendo **Status 200 OK**?
