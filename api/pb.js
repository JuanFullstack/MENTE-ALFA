// src/api/pb.ts
var POCKETBASE_HOST = "http://167.234.243.247:8090";
async function handler(req, res) {
  try {
    const rawUrl = req.url || "";
    let cleanPath = rawUrl.replace(/^\/api\/pb\/?/, "");
    if (!cleanPath.startsWith("api/")) {
      cleanPath = `api/${cleanPath}`;
    }
    const targetUrl = `${POCKETBASE_HOST}/${cleanPath}`;
    const headers = {};
    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }
    if (req.headers["authorization"]) {
      headers["Authorization"] = req.headers["authorization"];
    }
    const fetchOptions = {
      method: req.method || "GET",
      headers
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
  } catch (err) {
    console.error("[PocketBase Proxy Error]", err);
    return res.status(502).json({
      error: "Error en proxy hacia PocketBase",
      details: err?.message || String(err)
    });
  }
}
export {
  handler as default
};
