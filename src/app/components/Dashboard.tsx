import React, { useState, useEffect, useCallback } from "react";
import {
  Sprout, Layers, MapPin, CheckCircle2, TrendingUp,
  LayoutDashboard, Thermometer, Wind, Droplets, X,
  AlertTriangle, RefreshCw, ToggleLeft, ToggleRight, User,
} from "lucide-react";

const ROL_COLOR: Record<string, string> = {
  administrador: "bg-purple-100 text-purple-700",
  operador:      "bg-blue-100 text-blue-700",
  consultor:     "bg-emerald-100 text-emerald-700",
};
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  getCultivosGlobal, getAlertasHistorialGlobal, getNodosGlobal, saveNodosGlobal,
  Cultivo, AlertaHistorial, NodoSensor,
} from "../../services/firestoreService";

const API_KEY  = import.meta.env.VITE_OWM_API_KEY;
const CIUDAD   = "Maravatio,MX";

const TIPO_ICONO: Record<string, string> = {
  helada: "❄️", lluvia: "🌧️", sequia: "☀️", viento: "💨", granizo: "🌨️",
};

// ── Sensor toggle row ─────────────────────────────────────────────────────────

function SensorRow({
  sensor, onChange,
}: {
  sensor: NodoSensor;
  onChange: (nombre: string, estado: string) => void;
}) {
  const activo = sensor.estado === "ACTIVO";
  const Icon = sensor.nombre === "Temperatura"
    ? Thermometer
    : sensor.nombre === "Humedad"
    ? Droplets
    : Wind;
  const color = activo ? "text-emerald-400" : "text-gray-400";

  return (
    <div className="flex items-center justify-between p-3 xs:p-4 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`${color} w-5 h-5 flex-shrink-0`} />
        <span className="text-xs font-bold truncate">{sensor.nombre}</span>
      </div>
      <button
        onClick={() => onChange(sensor.nombre, activo ? "STANDBY" : "ACTIVO")}
        className="flex items-center gap-1 flex-shrink-0"
        title={activo ? "Desactivar" : "Activar"}
      >
        {activo
          ? <ToggleRight className="w-6 h-6 text-emerald-400" />
          : <ToggleLeft  className="w-6 h-6 text-gray-500" />}
        <span className="text-[9px] font-black uppercase opacity-60 w-12 text-left">
          {activo ? "Activo" : "Standby"}
        </span>
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DashboardPrincipal() {
  const { uid, nombre, rol } = useCurrentUser();

  const [cultivos,  setCultivos]  = useState<Cultivo[]>([]);
  const [alertas,   setAlertas]   = useState<AlertaHistorial[]>([]);
  const [sensores,  setSensores]  = useState<NodoSensor[]>([
    { nombre: "Temperatura", estado: "ACTIVO"  },
    { nombre: "Humedad",     estado: "ACTIVO"  },
    { nombre: "Viento",      estado: "STANDBY" },
  ]);
  const [clima,     setClima]     = useState<any[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [metricaActiva, setMetricaActiva] = useState<"temp" | "humedad" | "viento">("temp");
  const [aviso, setAviso] = useState({ visible: false, mensaje: "", tipo: "" });
  const [guardando, setGuardando] = useState(false);

  // ── Load Firestore data ───────────────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [c, a, n] = await Promise.all([
        getCultivosGlobal(),
        getAlertasHistorialGlobal(),
        getNodosGlobal(),
      ]);
      setCultivos(c);
      setAlertas(a);
      if (n.length > 0) setSensores(n);
    } finally {
      setCargando(false);
    }
  }, []);

  // ── Load OWM forecast ─────────────────────────────────────────────────────

  const cargarClima = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CIUDAD}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const daily = data.list
        .filter((r: any) => r.dt_txt.includes("12:00:00"))
        .slice(0, 7)
        .map((item: any) => ({
          name:    format(new Date(item.dt_txt), "EEE", { locale: es }),
          temp:    Math.round(item.main.temp),
          humedad: item.main.humidity,
          viento:  Math.round(item.wind.speed * 3.6),
        }));
      setClima(daily);
    } catch {
      const hoy = new Date();
      setClima(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date(hoy);
          d.setDate(hoy.getDate() + i);
          return {
            name:    format(d, "EEE", { locale: es }),
            temp:    Math.round(18 + Math.random() * 8),
            humedad: Math.round(50 + Math.random() * 20),
            viento:  Math.round(8  + Math.random() * 14),
          };
        })
      );
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    cargarClima();
  }, [cargarDatos, cargarClima]);

  // ── Computed stats ────────────────────────────────────────────────────────

  const totalHa         = cultivos.reduce((s, c) => s + c.hectareas, 0);
  const totalZonas      = new Set(cultivos.map((c) => c.zona)).size;
  const listosParaCosecha = cultivos.filter((c) => c.estado === "cosecha").length;
  const alertasRecientes  = alertas.slice(0, 5);

  // ── Sensor toggle + save ──────────────────────────────────────────────────

  const toggleSensor = (nombre: string, nuevoEstado: string) => {
    setSensores((prev) =>
      prev.map((s) => s.nombre === nombre ? { ...s, estado: nuevoEstado } : s)
    );
  };

  const guardarSensores = async () => {
    if (!uid) return;
    setGuardando(true);
    try {
      await saveNodosGlobal(sensores);
      lanzarAviso("¡Configuración guardada!", "exito");
    } catch {
      lanzarAviso("Error al guardar. Verifica tu conexión.", "error");
    } finally {
      setGuardando(false);
    }
  };

  const lanzarAviso = (mensaje: string, tipo: string) => {
    setAviso({ visible: true, mensaje, tipo });
    setTimeout(() => setAviso({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  // ── Cards config ──────────────────────────────────────────────────────────

  const cards = [
    {
      id: "temp",
      label: "CULTIVOS TOTALES",
      value: cargando ? "—" : String(cultivos.length),
      icon: Sprout,
      border: "border-emerald-500",
      bg: "bg-emerald-50/50",
      text: "text-emerald-600",
    },
    {
      id: "humedad",
      label: "HECTÁREAS ACTIVAS",
      value: cargando ? "—" : `${totalHa} ha`,
      icon: Layers,
      border: "border-blue-500",
      bg: "bg-blue-50/50",
      text: "text-blue-600",
    },
    {
      id: "viento",
      label: "ZONAS OPERATIVAS",
      value: cargando ? "—" : String(totalZonas),
      icon: MapPin,
      border: "border-orange-500",
      bg: "bg-orange-50/50",
      text: "text-orange-600",
    },
    {
      id: "cosecha",
      label: "LISTOS PARA COSECHA",
      value: cargando ? "—" : String(listosParaCosecha),
      icon: CheckCircle2,
      border: "border-purple-600",
      bg: "bg-purple-50/50",
      text: "text-purple-600",
    },
  ];

  const metricaLabel: Record<string, string> = {
    temp: "Temperatura (°C)", humedad: "Humedad (%)", viento: "Viento (km/h)",
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-gutter-sm sm:px-gutter md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 lg:space-y-10 relative">

      {/* Toast */}
      {aviso.visible && (
        <div className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-[100] flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 animate-in fade-in slide-in-from-top-4 max-w-xs ${
          aviso.tipo === "exito"
            ? "bg-emerald-500 border-emerald-400 text-white"
            : "bg-red-500 border-red-400 text-white"
        }`}>
          <CheckCircle2 size={16} />
          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest">{aviso.mensaje}</span>
          <button onClick={() => setAviso({ ...aviso, visible: false })} className="ml-2 hover:opacity-50">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="bg-emerald-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex-shrink-0">
            <LayoutDashboard className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">
              Panel de <span className="text-emerald-500">Control</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-gray-400 text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
                <User className="w-3 h-3" /> {nombre}
              </span>
              {rol && (
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${ROL_COLOR[rol] ?? ""}`}>
                  {rol}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => { cargarDatos(); cargarClima(); }}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-400 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
        {cards.map((card) => {
          const IconComponent = card.icon;
          const isActive = metricaActiva === card.id;
          return (
            <button
              key={card.id}
              onClick={() => card.id !== "cosecha" && setMetricaActiva(card.id as any)}
              className={`flex flex-col p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1 ${
                isActive ? `${card.border} ${card.bg}` : "bg-white dark:bg-slate-800 border-transparent shadow-sm"
              }`}
            >
              <div className={`w-10 xs:w-12 h-10 xs:h-12 rounded-lg xs:rounded-2xl flex items-center justify-center mb-3 xs:mb-4 ${card.bg} ${card.text}`}>
                <IconComponent size={20} className="xs:w-6 xs:h-6" />
              </div>
              <span className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{card.value}</span>
              <span className="text-[8px] xs:text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-tight">{card.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">

        {/* Gráfica semanal OWM */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-4 xs:p-6 sm:p-8 md:p-10 rounded-2xl xs:rounded-3xl sm:rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4 xs:mb-6 sm:mb-8 gap-2 flex-wrap">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{metricaLabel[metricaActiva]} — Esta semana</span>
            </h3>
            <div className="flex gap-1">
              {(["temp", "humedad", "viento"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetricaActiva(m)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                    metricaActiva === m
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {m === "temp" ? "Temp" : m === "humedad" ? "Hum" : "Vto"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-60 xs:h-72 sm:h-80 md:h-96 w-full">
            {clima.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clima}>
                  <defs>
                    <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} fontWeight="900" axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} fontWeight="900" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  />
                  <Area type="monotone" dataKey={metricaActiva} stroke="#10b981" strokeWidth={3} fill="url(#dashGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Panel derecho: sensores + alertas */}
        <div className="space-y-4">

          {/* Sensores */}
          <div className="bg-slate-900 rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 text-white shadow-2xl">
            <h3 className="text-[9px] xs:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 xs:mb-6">Sensores</h3>
            <div className="space-y-2 xs:space-y-3">
              {sensores.map((s) => (
                <SensorRow key={s.nombre} sensor={s} onChange={toggleSensor} />
              ))}
            </div>
            <button
              onClick={guardarSensores}
              disabled={guardando}
              className="w-full mt-4 xs:mt-6 py-3 xs:py-4 bg-emerald-500 rounded-xl xs:rounded-2xl font-black uppercase text-[9px] xs:text-[10px] tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {guardando && <RefreshCw className="w-3 h-3 animate-spin" />}
              {guardando ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>

          {/* Alertas recientes */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl xs:rounded-3xl p-4 xs:p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              Alertas Recientes
            </h3>
            {cargando ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : alertasRecientes.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-3">Sin alertas registradas</p>
            ) : (
              <div className="space-y-2">
                {alertasRecientes.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <span className="text-base flex-shrink-0">{TIPO_ICONO[a.tipo_evento] ?? "⚠️"}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gray-800 dark:text-white capitalize truncate">{a.tipo_evento}</p>
                      <p className="text-[9px] text-gray-400 truncate">{a.nombre_cultivo} · {a.zona}</p>
                      <p className="text-[8px] text-gray-300 dark:text-gray-500">{a.fecha_deteccion?.slice(0, 10)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
