import React, { useState, useEffect } from "react";
import { TrendingUp, CloudRain, Thermometer, Wind } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const condicionIcons: Record<string, string> = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Thunderstorm: "⛈️", Drizzle: "🌦️", Snow: "❄️",
};

const CARD_STYLES = [
  { border: "border-emerald-500", bg: "bg-emerald-50/30", text: "text-emerald-600", shadow: "shadow-emerald-100" },
  { border: "border-blue-500",    bg: "bg-blue-50/30",    text: "text-blue-600",    shadow: "shadow-blue-100"    },
  { border: "border-orange-500",  bg: "bg-orange-50/30",  text: "text-orange-600",  shadow: "shadow-orange-100"  },
  { border: "border-purple-600",  bg: "bg-purple-50/30",  text: "text-purple-600",  shadow: "shadow-purple-100"  },
  { border: "border-emerald-500", bg: "bg-emerald-50/30", text: "text-emerald-600", shadow: "shadow-emerald-100" },
];

export function PronosticosExtendidos() {
  const [datosClima, setDatosClima] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = import.meta.env.VITE_OWM_API_KEY;
  const CIUDAD  = "Maravatio,MX";

  useEffect(() => {
    const obtenerClima = async () => {
      try {
        const res  = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${CIUDAD}&appid=${API_KEY}&units=metric&lang=es`
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const daily = data.list
          .filter((r: any) => r.dt_txt.includes("12:00:00"))
          .map((item: any) => ({
            fecha:        item.dt_txt,
            temp:         item.main.temp,
            humedad:      item.main.humidity,
            viento:       item.wind.speed * 3.6,
            precipitacion:item.pop * 100,
            condicion:    item.weather[0].main,
          }));
        setDatosClima(daily);
      } catch {
        // Fallback con datos simulados
        const hoy = new Date();
        setDatosClima(
          Array.from({ length: 5 }, (_, i) => {
            const d = new Date(hoy); d.setDate(hoy.getDate() + i);
            d.setHours(12, 0, 0, 0);
            return {
              fecha:        d.toISOString().replace("T", " ").slice(0, 19),
              temp:         18 + Math.random() * 8,
              humedad:      50 + Math.random() * 20,
              viento:       10 + Math.random() * 15,
              precipitacion:Math.random() * 60,
              condicion:    ["Clear","Clouds","Rain"][Math.floor(Math.random() * 3)],
            };
          })
        );
      } finally { setLoading(false); }
    };
    obtenerClima();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4" />
      <p className="text-emerald-600 font-black text-xs uppercase tracking-widest">Sincronizando AgroAlert...</p>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-in fade-in duration-700 px-gutter-sm">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
            Pronóstico <span className="text-emerald-500">Agro</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-[8px] xs:text-[9px] sm:text-xs font-bold uppercase tracking-widest mt-1 truncate">
            Sistemas de monitoreo · {CIUDAD}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 xs:px-5 py-1.5 xs:py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg xs:rounded-2xl shadow-sm flex-shrink-0">
          <Thermometer className="text-emerald-500 w-3 h-3 xs:w-4 xs:h-4"/>
          <span className="text-[8px] xs:text-[9px] font-black text-gray-600 dark:text-gray-300 uppercase">Temp. Estable</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 xs:gap-4 sm:gap-5">
        {datosClima.map((dia, index) => {
          const style = CARD_STYLES[index % CARD_STYLES.length];
          return (
            <div key={index} className={`p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-2xl ${style.border} ${style.bg} ${style.shadow}`}>
              <div className="text-center">
                <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase opacity-60 mb-0.5 xs:mb-1 line-clamp-1">
                  {format(new Date(dia.fecha), "EEEE", { locale: es })}
                </p>
                <p className="text-[8px] xs:text-[9px] sm:text-xs font-black text-gray-800 dark:text-white mb-2 xs:mb-3 sm:mb-4">
                  {format(new Date(dia.fecha), "d MMM")}
                </p>
                <span className="text-4xl xs:text-5xl sm:text-6xl block my-2 xs:my-3 sm:my-6 filter drop-shadow-md">
                  {condicionIcons[dia.condicion] || "⛅"}
                </span>
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl xs:rounded-3xl py-2 xs:py-3 sm:py-4 mb-2 xs:mb-3 sm:mb-6 shadow-sm border border-white/50">
                  <p className={`text-xl xs:text-2xl sm:text-3xl font-black tracking-tighter ${style.text}`}>{Math.round(dia.temp)}°C</p>
                  <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-widest">Promedio</p>
                </div>
                <div className="space-y-1 xs:space-y-2 sm:space-y-3 pt-2 xs:pt-3 border-t border-black/5">
                  <div className="flex items-center justify-between text-[7px] xs:text-[8px] sm:text-[9px] font-black text-gray-500 uppercase gap-1">
                    <span className="flex items-center gap-0.5 xs:gap-1 min-w-0">
                      <CloudRain className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-blue-400 flex-shrink-0"/>
                      <span className="hidden xs:inline">Lluvia</span><span className="xs:hidden">Ll.</span>
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">{Math.round(dia.precipitacion)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[7px] xs:text-[8px] sm:text-[9px] font-black text-gray-500 uppercase gap-1">
                    <span className="flex items-center gap-0.5 xs:gap-1 min-w-0">
                      <Wind className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-orange-400 flex-shrink-0"/>
                      <span className="hidden xs:inline">Viento</span><span className="xs:hidden">Vto.</span>
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">{Math.round(dia.viento)}km/h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfica */}
      <div className="bg-white dark:bg-slate-800 p-4 xs:p-6 sm:p-10 rounded-2xl xs:rounded-3xl sm:rounded-[3rem] shadow-xl border border-gray-50 dark:border-slate-700">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 xs:mb-6 sm:mb-10 gap-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 min-w-0">
            <TrendingUp className="w-3 h-3 xs:w-4 xs:h-4 text-emerald-500 flex-shrink-0" />
            <span className="truncate">Tendencia de Temperatura Semanal</span>
          </h3>
          <span className="text-[7px] xs:text-[8px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 xs:px-3 py-1 rounded-full border border-emerald-100 uppercase flex-shrink-0">Tiempo Real</span>
        </div>
        <div className="h-56 xs:h-64 sm:h-80 md:h-96 w-full">
          <ResponsiveContainer>
            <AreaChart data={datosClima}>
              <defs>
                <linearGradient id="agroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tickFormatter={(s) => format(new Date(s), "dd")}
                fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={10} />
              <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} unit="°" />
              <Tooltip contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", padding: "16px" }}
                itemStyle={{ fontSize: "12px", fontWeight: "900", color: "#065f46" }} />
              <Area type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#agroGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
