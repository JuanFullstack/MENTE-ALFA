# ⚠️ CRITERIO Y ADVERTENCIA DE DESPLIEGUE EN VERCEL (MENTE ALFA)

## 🚨 ADVERTENCIA CRÍTICA PERMANENTE:
- **PROHIBIDO** modificar, sobreescribir o enlazar este despliegue con otros proyectos ya existentes en la cuenta de Vercel del usuario.
- **PROHIBIDO** usar nombres genéricos (como los predeterminados por plantillas o `react-example`).
- **NOMBRE DE PROYECTO Y DOMINIO DESIGNADO**: `mente-alfa` (e.g. `https://mente-alfa.vercel.app` o subdominios asociados a este proyecto específico).

## 🚀 Comando de Despliegue Oficial:
Cada vez que se solicite un deploy, debe ejecutarse a través del script `deploy.ps1` o utilizando estrictamente el parámetro `--name mente-alfa`:

```powershell
.\deploy.ps1
```

O por línea de comando:
```powershell
npx vercel --prod --yes --token $env:VERCEL_TOKEN --name mente-alfa
```

## 📋 Variables y Configuración:
- **Vercel Project Name**: `mente-alfa`
- **Output Directory**: `dist`
- **Framework**: `vite`
- **PocketBase Remoto**: `http://167.234.243.247:8090` (Colecciones con prefijo `mentealfa_*`)
