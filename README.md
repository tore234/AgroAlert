<div align="center">

```
   ╔═══════════════════════════════════════════╗
   ║   🌱  A G R O A L E R T  🌱               ║
   ║   Sistema Inteligente de Alertas           ║
   ║   Climáticas para Agricultura              ║
   ╚═══════════════════════════════════════════╝
```

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **Plataforma web para monitoreo climático en tiempo real, gestión de cultivos, control de relés y sistema de alertas inteligentes para el campo.**

</div>

---

## ✨ ¿Qué es AgroAlert?

AgroAlert es una aplicación web agrícola que integra datos meteorológicos en tiempo real, geolocalización y control de hardware (relés) para ayudar a productores a tomar decisiones informadas sobre sus cultivos. Detecta riesgos como heladas, sequías, granizos y viento excesivo de forma automática.

---

## 🚀 Características Principales

| Módulo | Descripción |
|---|---|
| 📊 **Panel de Control** | Vista general con métricas de cultivos, relés, alertas recientes y gráficas semanales de clima |
| 🌡️ **Monitoreo en Tiempo Real** | Telemetría de temperatura, humedad y viento con actualización cada 30 segundos |
| 🗺️ **Mapas y Visualización** | Mapa interactivo con Leaflet mostrando ubicación de cultivos y zonas operativas |
| 🌾 **Gestión de Cultivos** | Alta, edición y seguimiento de cultivos con estado (activo, en desarrollo, listo para cosecha) |
| ⚡ **Control de Relés** | Encendido/apagado de relés asociados a cultivos desde la interfaz |
| 🔔 **Alertas Personalizadas** | Configuración de umbrales de alerta por cultivo y zona |
| 🔒 **Roles de Usuario** | Administrador, Operador y Consultor con permisos diferenciados |
| 🌙 **Modo Oscuro** | Tema claro/oscuro con persistencia |

---

## 🛠️ Stack Tecnológico

### Frontend
```
React 18 + TypeScript + Vite 6
├── Recharts          — gráficas de área interactivas
├── React Leaflet     — mapas interactivos
├── Lucide React      — iconografía
├── Radix UI          — componentes accesibles (modal, select, tabs…)
├── Tailwind CSS 4    — estilos utilitarios
├── Motion            — animaciones
├── React Router 7    — navegación SPA
└── date-fns          — formateo de fechas en español
```

### Backend & Datos
```
Firebase (Firestore)  — base de datos en tiempo real
OpenWeatherMap API    — pronóstico climático 7 días + clima actual por geolocalización
```

---

## 📦 Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Sistema-de-Alertas-
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# OpenWeatherMap
VITE_OWM_API_KEY=tu_api_key_aqui

# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> 💡 Obtén tu clave gratuita en [openweathermap.org](https://openweathermap.org/api) y tu configuración de Firebase en la [consola de Firebase](https://console.firebase.google.com/).

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para producción

```bash
npm run build
```

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── Dashboard.tsx          ← Panel principal con gráficas y métricas
│   │   ├── MonitoreoTiempoReal.tsx ← Telemetría en vivo (temp, humedad, viento)
│   │   ├── MapasVisualizacion.tsx  ← Mapa interactivo de cultivos
│   │   ├── GestionCultivos.tsx     ← CRUD de cultivos
│   │   ├── GestionReles.tsx        ← Control de relés
│   │   ├── AlertasPersonalizadas.tsx ← Configuración de alertas
│   │   ├── GestionUsuarios.tsx     ← Administración de usuarios
│   │   ├── PronosticosExtendidos.tsx ← Pronóstico extendido 7 días
│   │   ├── RecomendacionesSeguridad.tsx ← Buenas prácticas
│   │   ├── Layout.tsx              ← Sidebar + navegación principal
│   │   ├── PantallaLogin.tsx       ← Autenticación
│   │   └── LandingPage.tsx         ← Página de bienvenida
│   ├── data/
│   │   └── mockData.ts             ← Tipos e interfaces compartidas
│   └── routes.ts                   ← Definición de rutas
├── hooks/
│   └── useCurrentUser.ts           ← Hook de usuario autenticado
└── services/
    └── firestoreService.ts         ← Todas las operaciones con Firestore
```

---

## 🌐 Módulos del Sistema

### 📊 Panel de Control
- Tarjetas de resumen: cultivos, hectáreas, zonas, relés activos y listos para cosecha
- **Cada tarjeta es clickeable** para mostrar su detalle en el área de gráfica
- Gráfica semanal de temperatura, humedad y viento (OpenWeatherMap)
- Vista de relés: estado ON/OFF por cultivo asociado
- Vista de cosecha: cultivos listos con zona y fecha de siembra

### 🌡️ Monitoreo en Tiempo Real
- Datos de la API climática o modo simulación si no hay conexión
- Historial visual de los últimos 15 registros
- Auto-actualización cada **30 segundos**
- **Cambio de métrica** haciendo clic en la tarjeta o en los botones Temp / Humedad / Viento
- Sugerencias agronómicas automáticas según condiciones detectadas

### 🗺️ Mapas
- Visualización georreferenciada de cultivos y zonas
- Geolocalización del usuario en tiempo real

---

## 🔐 Roles y Permisos

| Rol | Acceso |
|---|---|
| 🟣 **Administrador** | Acceso total: usuarios, cultivos, relés, alertas, mapas |
| 🔵 **Operador** | Control de relés, monitoreo y cultivos |
| 🟢 **Consultor** | Solo lectura: dashboard, mapas y alertas |

---

## 🔔 Tipos de Alertas Detectadas

```
❄️  Helada    — Temperatura inferior a 10 °C
🌧️  Lluvia    — Precipitación prevista
☀️  Sequía    — Humedad inferior al umbral configurado
💨  Viento    — Velocidad de viento peligrosa
🌨️  Granizo   — Evento de granizo detectado
```

---

## 📡 Integración con OpenWeatherMap

El sistema usa dos endpoints:

- **`/weather`** — Clima actual por coordenadas GPS o ciudad fallback (`Maravatio, MX`)
- **`/forecast`** — Pronóstico de 7 días filtrado a las 12:00 UTC para la gráfica semanal

Si la API no está disponible, el sistema activa **modo simulación** con datos aleatorios realistas para no interrumpir la operación.

---

## 🤝 Créditos

Diseño original en [Figma](https://www.figma.com/design/wgxFBbgUkrWWPOYYOnannO/Sistema-de-alertas-clim%C3%A1ticas) · Desarrollado con ❤️ para el campo mexicano.

---

<div align="center">

**AgroAlert** — *Innovación Agrícola*

</div>
