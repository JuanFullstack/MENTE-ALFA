// src/api/health.ts
function handler(_req, res) {
  const hasGroq = !!(process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY);
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.status(200).json({
    status: "ok",
    hasGroqApiKey: hasGroq,
    hasGeminiApiKey: hasGemini,
    hasApiKey: hasGroq || hasGemini,
    primaryProvider: "groq",
    defaultModel: "qwen/qwen3.8-27b"
  });
}
export {
  handler as default
};
