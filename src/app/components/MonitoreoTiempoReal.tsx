import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Thermometer, Droplets, Wind, Activity, TrendingUp,
  RefreshCw, AlertTriangle, Leaf, Info, MapPin
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_KEY = import.meta.env.VITE_OWM_API_KEY;
const FALLBACK_CITY = "Maravatio,MX";

interface WeatherData {
  main?: { temp: number; humidity: number; feels_like: number };
  wind?: { speed: number; gust?: number };
  name?: string;
}
interface ChartData { tiempo: string; temperatura: number }
type GeoPos = { lat: number; lng: number } | null;

function useRealTimeLocation(): { pos: GeoPos; geoError: string | null } {
  const [pos, setPos]         = useState<GeoPos>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalización no disponible");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setPos({ lat: coords.latitude, lng: coords.longitude });
        setGeoError(null);
      },
      () => setGeoError("Ubicación no autorizada"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { pos, geoError };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700">
      <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{payload[0].payload.tiempo}</p>
      <p className="text-sm font-black text-emerald-400">{payload[0].value.toFixed(1)}°C</p>
    </div>
  );
};

export function MonitoreoTiempoReal() {
  const [datosActuales, setDatosActuales] = useState<WeatherData | null>(null);
  const [datosRealTime, setDatosRealTime] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sugerencia, setSugerencia] = useState("Sincronizando sensores...");

  const { pos: miUbicacion, geoError } = useRealTimeLocation();
  const posRef = useRef<GeoPos>(null);
  posRef.current = miUbicacion;

  const procesarDatos = useCallback((data: WeatherData) => {
    const ahora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tempActual = data.main?.temp ?? 0;
    const humActual  = data.main?.humidity ?? 0;
    setDatosRealTime((prev) => [...prev, { tiempo: ahora, temperatura: tempActual }].slice(-15));
    setDatosActuales(data);
    if      (tempActual < 10) setSugerencia("Riesgo de helada detectado. Revisar cubiertas térmicas.");
    else if (humActual > 75)  setSugerencia("Humedad elevada. Monitorear posible aparición de hongos.");
    else                       setSugerencia("Condiciones climáticas estables para el crecimiento.");
  }, []);

  const fetchData = useCallback(async () => {
    const pos = posRef.current;
    const url = pos
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${pos.lat}&lon=${pos.lng}&appid=${API_KEY}&units=metric&lang=es`
      : `https://api.openweathermap.org/data/2.5/weather?q=${FALLBACK_CITY}&appid=${API_KEY}&units=metric&lang=es`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("API Offline");
      procesarDatos(await response.json());
      setError(null);
    } catch {
      setError("Modo Simulación Activo");
      procesarDatos({
        main: { temp: 20 + Math.random() * 5, humidity: 55 + Math.random() * 10, feels_like: 22 },
        wind: { speed: 10 + Math.random() * 5, gust: 18 },
      });
    } finally { setLoading(false); }
  }, [procesarDatos]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Re-fetch immediately when location first becomes available
  useEffect(() => {
    if (miUbicacion) fetchData();
  }, [miUbicacion?.lat, miUbicacion?.lng]);

  if (loading && datosRealTime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-white dark:bg-slate-800">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Iniciando Telemetría...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 xs:space-y-8 animate-in fade-in zoom-in duration-500 px-gutter-sm">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-4 xs:p-5 sm:p-6 rounded-2xl xs:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 gap-3 xs:gap-4">
        <div className="flex items-center gap-3 xs:gap-4 min-w-0">
          <div className="bg-emerald-500 p-2 xs:p-3 rounded-lg xs:rounded-2xl text-white shadow-lg shadow-emerald-200 flex-shrink-0">
            <Leaf className="w-5 h-5 xs:w-6 xs:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tighter truncate">Panel de Monitoreo</h1>
            <p className="text-[8px] xs:text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 inline flex-shrink-0" />
              {datosActuales?.name
                ? datosActuales.name
                : miUbicacion
                  ? `${miUbicacion.lat.toFixed(3)}, ${miUbicacion.lng.toFixed(3)}`
                  : geoError
                    ? FALLBACK_CITY
                    : "Obteniendo ubicación..."}
              {" • Estación Activa"}
            </p>
          </div>
        </div>
        <div className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-[8px] xs:text-[9px] font-black tracking-widest border flex items-center gap-2 flex-shrink-0 ${error ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
          <Activity className="w-3 h-3 animate-pulse flex-shrink-0" />
          <span className="hidden xs:inline">{error ? "DATOS SIMULADOS" : "SISTEMA SINCRONIZADO"}</span>
          <span className="xs:hidden">{error ? "SIM" : "ACTIVO"}</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4">
        <MetricCard title="Temperatura" value={`${datosActuales?.main?.temp.toFixed(1) ?? "--"}°C`} icon={<Thermometer className="text-orange-500" />} color="border-orange-500" />
        <MetricCard title="Humedad"     value={`${datosActuales?.main?.humidity?.toFixed(0) ?? "--"}%`} icon={<Droplets className="text-blue-500" />}   color="border-blue-500" />
        <MetricCard title="Viento"      value={`${datosActuales?.wind?.speed.toFixed(1) ?? "--"} km/h`} icon={<Wind className="text-cyan-500" />}       color="border-cyan-500" />
        <div className="bg-emerald-600 p-4 xs:p-5 sm:p-6 rounded-2xl xs:rounded-3xl text-white shadow-lg shadow-emerald-100 flex flex-col justify-center col-span-1 xs:col-span-2 md:col-span-1">
          <p className="text-[8px] xs:text-[9px] font-black uppercase opacity-60 mb-2">Consejo</p>
          <p className="text-[10px] xs:text-xs font-bold leading-relaxed line-clamp-3">{sugerencia}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Gráfica */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-4 xs:p-6 sm:p-8 rounded-2xl xs:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 xs:mb-6 gap-2">
            <h3 className="text-sm xs:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 min-w-0">
              <TrendingUp className="text-emerald-500 w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" /> <span className="truncate">Variación Térmica</span>
            </h3>
            <span className="text-[8px] xs:text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 xs:px-3 py-1 rounded-full uppercase tracking-tighter flex-shrink-0">
              Últimos 15 registros
            </span>
          </div>
          <div className="h-56 xs:h-64 sm:h-80 md:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosRealTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tiempo" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} interval="preserveStartEnd" />
                <YAxis hide domain={["auto","auto"]} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "5 5" }} />
                <Area type="monotone" dataKey="temperatura" stroke="#10b981" strokeWidth={3} fill="url(#colorTemp)"
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 3, fill: "#10b981" }} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white dark:bg-slate-800 p-4 xs:p-6 sm:p-8 rounded-2xl xs:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-3 xs:space-y-4">
          <h3 className="text-sm xs:text-base font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="text-orange-400 w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" /> Alertas del Día
          </h3>
          <AlertaSimple color="bg-orange-50" border="border-orange-100" text="text-orange-700" title="Helada"  msg="Prevista en Zona Norte" />
          <AlertaSimple color="bg-yellow-50" border="border-yellow-100" text="text-yellow-700" title="Lluvia"  msg="Moderada en 4 horas"   />
          <AlertaSimple color="bg-blue-50"   border="border-blue-100"   text="text-blue-700"   title="Riego"   msg="Sector B completado"   />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-3 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl shadow-sm border-b-4 ${color} transition-all hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-md cursor-pointer`}>
      <div className="flex justify-between items-start mb-3 xs:mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg flex-shrink-0">{icon}</div>
        <span className="text-[7px] xs:text-[8px] font-black text-emerald-500 bg-emerald-50 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded flex-shrink-0">LIVE</span>
      </div>
      <p className="text-[8px] xs:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</p>
      <p className="text-lg xs:text-xl sm:text-2xl font-black text-slate-800 dark:text-white truncate">{value}</p>
    </div>
  );
}

function AlertaSimple({ color, border, text, title, msg }: any) {
  return (
    <div className={`${color} ${border} ${text} p-3 xs:p-4 rounded-lg xs:rounded-2xl border-2 flex items-center gap-2 xs:gap-3 transition-transform hover:scale-[1.02]`}>
      <Info className="w-4 h-4 opacity-40 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[8px] xs:text-[9px] font-black uppercase tracking-tighter opacity-70 truncate">{title}</p>
        <p className="text-[9px] xs:text-xs font-bold leading-tight truncate">{msg}</p>
      </div>
    </div>
  );
}
