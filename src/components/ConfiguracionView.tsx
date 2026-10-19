import React, { useState, useEffect } from "react";
import { 
  User, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  RotateCcw, 
  Zap, 
  Key, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";
import { UserProfile, ZenDB } from "../lib/storage";
import { 
  getStoredGroqApiKey, 
  setStoredGroqApiKey, 
  getStoredGroqModel, 
  setStoredGroqModel, 
  testGroqKey, 
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  testGeminiKey,
  GROQ_MODELS 
} from "../services/groqEvaluation";

interface ConfiguracionViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function ConfiguracionView({ profile, onUpdateProfile }: ConfiguracionViewProps) {
  const [userName, setUserName] = useState(profile.userName);
  const [companionName, setCompanionName] = useState(profile.companionName);
  const [notes, setNotes] = useState(profile.notes);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Google AI Studio (Gemini) State - OPCIÓN PRINCIPAL
  const [geminiKey, setGeminiKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [testGeminiResult, setTestGeminiResult] = useState<{ success: boolean; message: string } | null>(null);

  // Groq AI State - OPCIÓN SECUNDARIA
  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setGeminiKey(getStoredGeminiApiKey());
    setGroqKey(getStoredGroqApiKey());
    setGroqModel(getStoredGroqModel());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !companionName.trim()) return;

    onUpdateProfile({
      userName: userName.trim(),
      companionName: companionName.trim(),
      avatarSeed: userName.toLowerCase().slice(0, 5),
      notes: notes.trim(),
    });

    // Save AI engine configurations
    setStoredGeminiApiKey(geminiKey);
    setStoredGroqApiKey(groqKey);
    setStoredGroqModel(groqModel);

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setTestGeminiResult({ success: false, message: "Por favor ingresa una clave API de Google AI Studio antes de probar." });
      return;
    }

    setIsTestingGemini(true);
    setTestGeminiResult(null);

    const result = await testGeminiKey(geminiKey);
    setTestGeminiResult(result);
    setIsTestingGemini(false);
  };

  const handleTestGroq = async () => {
    if (!groqKey.trim()) {
      setTestResult({ success: false, message: "Por favor ingresa una clave API de Groq antes de probar." });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    const result = await testGroqKey(groqKey);
    setTestResult(result);
    setIsTestingKey(false);
  };

  const handleResetDatabase = () => {
    if (window.confirm("¿Estás seguro de que deseas restablecer los datos? Se borrarán todas tus conversaciones, recuerdos y registros de bienestar guardados en el navegador.")) {
      ZenDB.clearAll();
      localStorage.removeItem("gemini_api_key");
      localStorage.removeItem("groq_api_key");
      localStorage.removeItem("groq_model");
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 font-sans pb-20 md:pb-8">
      

      {/* 1. Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-[#8BA888] text-white flex items-center justify-center shadow-lg shadow-[#8BA888]/10 shrink-0">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#2D332D]">Configuración del Sistema y Perfil</h2>
          <p className="text-xs text-[#7A7167] mt-0.5">
            Ajusta los parámetros de Groq AI, modelos de inferencia y las notas base de tu perfil personal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Settings Form */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-2 space-y-6">
          
          {showSavedToast && (
            <div className="p-3 bg-[#8BA888]/10 border border-[#8BA888]/20 rounded-2xl flex items-center gap-2.5 text-xs text-[#6D856B] animate-fade-in">
              <CheckCircle className="h-4 w-4 text-[#8BA888] shrink-0" />
              <span>¡Configuración guardada de forma segura! Los cambios ya están activos.</span>
            </div>
          )}

          {/* Google AI Studio (Gemini) - OPCIÓN PRINCIPAL */}
          <div className="bg-white border-2 border-[#8BA888]/40 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#8BA888] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3" />
              Opción Principal
            </div>

            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4 pr-24">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#8BA888]/15 text-[#6D856B] flex items-center justify-center font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D332D]">Google AI Studio (Gemini API)</h3>
                  <p className="text-[11px] text-[#7A7167]">Motor principal de razonamiento rápido y memoria evolutiva.</p>
                </div>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#6D856B] hover:underline"
              >
                <span>Obtener API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Google AI Studio API Key Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#7A7167] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-[#8BA888]" />
                  Google AI Studio API Key
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="sm:hidden inline-flex items-center gap-1 text-[10px] font-semibold text-[#6D856B] hover:underline"
                >
                  <span>Obtener clave</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setTestGeminiResult(null);
                  }}
                  placeholder="AQ.Ab8RN6K... o AIzaSy..."
                  className="block w-full pl-4 pr-24 py-2.5 border border-[#EAE2D6] rounded-xl text-[#4A443F] text-xs focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition outline-none font-mono"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="p-1.5 text-[#7A7167] hover:text-[#2D332D] rounded-lg transition"
                    title={showGeminiKey ? "Ocultar clave" : "Mostrar clave"}
                  >
                    {showGeminiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={isTestingGemini}
                    className="text-[10px] font-bold px-2.5 py-1 bg-[#8BA888]/15 hover:bg-[#8BA888]/25 text-[#6D856B] rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                  >
                    {isTestingGemini ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Probar
                  </button>
                </div>
              </div>

              {testGeminiResult && (
                <div
                  className={`mt-2 p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
                    testGeminiResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {testGeminiResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testGeminiResult.message}</span>
                </div>
              )}

              <p className="text-[10px] text-[#7A7167]">
                Se prioriza en todas las consultas de Chat, Resúmenes y Análisis. Si la cuota se agota temporalmente, se usa Groq automáticamente.
              </p>
            </div>
          </div>

          {/* Groq AI Engine Section - OPCIÓN SECUNDARIA */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#A69D91]/20 text-[#7A7167] text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
              Respaldo Secundario
            </div>

            <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-4 pr-32">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#F55036]/10 text-[#F55036] flex items-center justify-center font-bold">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D332D]">Motor Groq AI (Llama 3.3 / Qwen)</h3>
                  <p className="text-[11px] text-[#7A7167]">Opción de respaldo automático ultra-rápida (LPU™).</p>
                </div>
              </div>

              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#F55036] hover:underline"
              >
                <span>Obtener API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Groq API Key Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#7A7167] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-[#8BA888]" />
                Groq API Key
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKey ? "text" : "password"}
                  value={groqKey}
                  onChange={(e) => {
                    setGroqKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="gsk_..."
                  className="block w-full pl-4 pr-24 py-2.5 border border-[#EAE2D6] rounded-xl text-[#4A443F] text-xs focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition outline-none font-mono"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-[#7A7167] hover:text-[#2D332D] rounded-lg transition"
                    title={showKey ? "Ocultar clave" : "Mostrar clave"}
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestGroq}
                    disabled={isTestingKey}
                    className="text-[10px] font-bold px-2.5 py-1 bg-[#F55036]/10 hover:bg-[#F55036]/20 text-[#F55036] rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                  >
                    {isTestingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Probar
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`mt-2 p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <p className="text-[10px] text-[#7A7167]">
                Se guarda en tu navegador de forma segura en <code className="text-[#4A443F]">localStorage</code> y se utiliza automáticamente para todas las consultas.
              </p>
            </div>

            {/* Groq Model Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#7A7167] uppercase tracking-wider">
                Modelo de Lenguaje Groq
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GROQ_MODELS.map((m) => {
                  const isSelected = groqModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setGroqModel(m.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? "border-[#8BA888] bg-[#8BA888]/5 shadow-sm ring-1 ring-[#8BA888]"
                          : "border-[#EAE2D6] hover:border-[#8BA888]/40 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2D332D]">{m.name}</span>
                          {m.recommended && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#8BA888]/20 text-[#6D856B] rounded-md">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#7A7167] mt-1 leading-snug">
                          {m.description}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono text-[#A69D91] mt-2 block">
                        {m.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#7A7167] uppercase tracking-wider mb-1.5">Tu Nombre</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-[#EAE2D6] rounded-xl text-[#4A443F] text-xs focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A7167] uppercase tracking-wider mb-1.5">Nombre de la IA (Guía)</label>
                <input
                  type="text"
                  required
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-[#EAE2D6] rounded-xl text-[#4A443F] text-xs focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888] transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A7167] uppercase tracking-wider mb-1.5">Notas Base de Contexto (Tu Perfil y Metas)</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full px-4 py-3 border border-[#EAE2D6] rounded-2xl text-[#4A443F] placeholder-[#A69D91] text-xs outline-none resize-none transition focus:ring-2 focus:ring-[#8BA888]/20 focus:border-[#8BA888]"
                placeholder="Ej. Estudiante de psicología, propenso a procrastinar en las noches. Me interesa llevar registro de mis hábitos de estudio y emociones asociadas."
              />
              <p className="mt-2 text-[10px] text-[#7A7167] leading-normal">
                Estas notas actúan como instrucciones del sistema fijadas en el backend de {companionName}. Úsalas para describir tus intereses, metas, preferencias de comunicación o antecedentes.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-md text-xs font-bold text-white bg-[#8BA888] hover:bg-[#6D856B] transition cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Guardar Toda la Configuración
            </button>
          </div>

        </form>

        {/* Side Panel: Information & Danger Zone */}
        <div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#2D332D] flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#8BA888]" />
              Sincronización Inteligente
            </h3>
            <p className="text-xs text-[#7A7167] leading-relaxed">
              Tus conversaciones, emociones guardadas y aprendizajes residen de forma segura en este navegador. El motor Groq LPU procesa las solicitudes a velocidades de hasta 300 tokens/segundo con total soberanía y control.
            </p>
          </div>

          <div className="border-t border-[#EAE2D6] pt-6 space-y-4">
            <div className="flex items-start gap-2.5 text-xs text-[#B06A52] bg-[#D98E73]/10 border border-[#D98E73]/20 p-4 rounded-2xl">
              <AlertTriangle className="h-4 w-4 text-[#D98E73] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Zona de Peligro</p>
                <p className="mt-0.5 leading-normal">Si experimentas anomalías de datos, puedes reiniciar la base de datos y claves guardadas.</p>
              </div>
            </div>

            <button
              onClick={handleResetDatabase}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#D98E73]/10 hover:bg-[#D98E73]/20 text-[#B06A52] font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer Todo
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
