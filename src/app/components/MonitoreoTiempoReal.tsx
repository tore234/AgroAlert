import React, { useState, useEffect, useCallback } from "react";
import { 
  Thermometer, Droplets, Wind, Activity, TrendingUp, 
  RefreshCw, AlertTriangle, Leaf, Info 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

// --- CONFIGURACIÓN DE LA API ---
const API_KEY = "sk-b1d3afcbcad44b3ba757be5f0e0e43e0"; 
const CITY = "Mexico"; 
const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;

// --- INTERFACES ---
interface WeatherData {
  main?: { temp: number; humidity: number; feels_like: number; };
  wind?: { speed: number; gust?: number; };
}

interface ChartData {
  tiempo: string;
  temperatura: number;
}

// --- COMPONENTE DE TOOLTIP INTERACTIVO ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700">
        <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{payload[0].payload.tiempo}</p>
        <p className="text-sm font-black text-emerald-400">
          {payload[0].value.toFixed(1)}°C
        </p>
      </div>
    );
  }
  return null;
};

export function MonitoreoTiempoReal() {
  const [datosActuales, setDatosActuales] = useState<WeatherData | null>(null);
  const [datosRealTime, setDatosRealTime] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sugerencia, setSugerencia] = useState("Sincronizando sensores...");

  const procesarDatos = useCallback((data: WeatherData) => {
    const ahora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tempActual = data.main?.temp ?? 0;
    const humActual = data.main?.humidity ?? 0;

    setDatosRealTime((prev) => [...prev, { tiempo: ahora, temperatura: tempActual }].slice(-15));
    setDatosActuales(data);

    if (tempActual < 10) setSugerencia("Riesgo de helada detectado. Revisar cubiertas térmicas.");
    else if (humActual > 75) setSugerencia("Humedad elevada. Monitorear posible aparición de hongos.");
    else setSugerencia("Condiciones climáticas estables para el crecimiento.");
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API Offline");
      const data = await response.json();
      procesarDatos(data);
      setError(null);
    } catch (err) {
      setError("Modo Simulación Activo");
      const mockData: WeatherData = {
        main: { temp: 20 + Math.random() * 5, humidity: 55 + Math.random() * 10, feels_like: 22 },
        wind: { speed: 10 + Math.random() * 5, gust: 18 }
      };
      procesarDatos(mockData);
    } finally {
      setLoading(false);
    }
  }, [procesarDatos]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && datosRealTime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-[40px] bg-white">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Iniciando Telemetría...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header con Estado de Conexión */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Panel de Monitoreo</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{CITY} • Estación Activa</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest border flex items-center gap-2 ${error ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
          <Activity className="w-3 h-3 animate-pulse" />
          {error ? "DATOS SIMULADOS" : "SISTEMA SINCRONIZADO"}
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Temperatura" value={`${datosActuales?.main?.temp.toFixed(1)}°C`} icon={<Thermometer className="text-orange-500" />} color="border-orange-500" />
        <MetricCard title="Humedad" value={`${datosActuales?.main?.humidity.toFixed(1)}%`} icon={<Droplets className="text-blue-500" />} color="border-blue-500" />
        <MetricCard title="Viento" value={`${datosActuales?.wind?.speed.toFixed(1)} km/h`} icon={<Wind className="text-cyan-500" />} color="border-cyan-500" />
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase opacity-60 mb-2">Consejo de IA</p>
          <p className="text-xs font-bold leading-relaxed">{sugerencia}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- GRÁFICA DINÁMICA MEJORADA --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-emerald-500 w-5 h-5" /> Variación Térmica
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">
              Últimos 15 registros
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosRealTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="tiempo" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} 
                  interval="preserveStartEnd"
                />
                <YAxis hide domain={['auto', 'auto']} />
                
                {/* Tooltip personalizado más interactivo */}
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="temperatura" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fill="url(#colorTemp)" 
                  // Punto interactivo al pasar el mouse
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#10b981' }}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas del Día */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="text-orange-400 w-5 h-5" /> Alertas del Día
          </h3>
          <AlertaSimple color="bg-orange-50" border="border-orange-100" text="text-orange-700" title="Helada" msg="Prevista en Zona Norte" />
          <AlertaSimple color="bg-yellow-50" border="border-yellow-100" text="text-yellow-700" title="Lluvia" msg="Moderada en 4 horas" />
          <AlertaSimple color="bg-blue-50" border="border-blue-100" text="text-blue-700" title="Riego" msg="Sector B completado" />
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---
function MetricCard({ title, value, icon, color }: any) {
  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border-b-4 ${color} transition-all hover:-translate-y-2 hover:shadow-md cursor-pointer`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded">LIVE</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}

function AlertaSimple({ color, border, text, title, msg }: any) {
  return (
    <div className={`${color} ${border} ${text} p-4 rounded-2xl border-2 flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-default`}>
      <Info className="w-4 h-4 opacity-40" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">{title}</p>
        <p className="text-xs font-bold leading-tight">{msg}</p>
      </div>
    </div>
  );
}