/**
 * @file src/api/pb.ts
 * Proxy seguro para PocketBase en Vercel.
 * Resuelve el bloqueo de Mixed Content (HTTPS -> HTTP) en navegadores móviles y desktop.
 */

const POCKETBASE_HOST = "http://167.234.243.247:8090";

export default async function handler(req: any, res: any) {
  try {
    const rawUrl: string = req.url || "";
    // Eliminar el prefijo /api/pb
    const cleanPath = rawUrl.replace(/^\/api\/pb/, "");
    const targetUrl = `${POCKETBASE_HOST}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;

    const headers: Record<string, string> = {};
    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }
    if (req.headers["authorization"]) {
      headers["Authorization"] = req.headers["authorization"];
    }

    const fetchOptions: any = {
      method: req.method || "GET",
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body) {
        fetchOptions.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
    }

    const pbRes = await fetch(targetUrl, fetchOptions);
    const contentType = pbRes.headers.get("content-type") || "application/json";
    const data = await pbRes.text();

    res.status(pbRes.status);
    res.setHeader("Content-Type", contentType);
    return res.send(data);
  } catch (err: any) {
    console.error("[PocketBase Proxy Error]", err);
    return res.status(502).json({
      error: "Error en proxy hacia PocketBase",
      details: err?.message || String(err),
    });
  }
}
