import React, { useState, useEffect } from "react";
import { Calendar, TrendingUp, CloudRain, Droplets, Thermometer, Wind, AlertCircle, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const condicionIcons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Thunderstorm: "⛈️",
  Drizzle: "🌦️",
  Snow: "❄️",
};

export function PronosticosExtendidos() {
  const [datosClima, setDatosClima] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = "8178e02a36c1c56e50161fbb479d29af"; 
  const CIUDAD = "Maravatio,MX";

  useEffect(() => {
    const obtenerClimaReal = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${CIUDAD}&appid=${API_KEY}&units=metric&lang=es`
        );
        const data = await response.json();

        const dailyData = data.list.filter((reading: any) => reading.dt_txt.includes("12:00:00")).map((item: any) => ({
          fecha: item.dt_txt,
          temp: item.main.temp,
          humedad: item.main.humidity,
          viento: item.wind.speed * 3.6,
          precipitacion: item.pop * 100,
          condicion: item.weather[0].main,
        }));

        setDatosClima(dailyData);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    obtenerClimaReal();
  }, []);

  // Función para asignar los colores auténticos de AgroAlert por posición
  const getCardStyle = (index: number) => {
    const styles = [
      { border: "border-emerald-500", bg: "bg-emerald-50/30", text: "text-emerald-600", shadow: "shadow-emerald-100" },
      { border: "border-blue-500", bg: "bg-blue-50/30", text: "text-blue-600", shadow: "shadow-blue-100" },
      { border: "border-orange-500", bg: "bg-orange-50/30", text: "text-orange-600", shadow: "shadow-orange-100" },
      { border: "border-purple-600", bg: "bg-purple-50/30", text: "text-purple-600", shadow: "shadow-purple-100" },
      { border: "border-emerald-500", bg: "bg-emerald-50/30", text: "text-emerald-600", shadow: "shadow-emerald-100" },
    ];
    return styles[index % styles.length];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
      <p className="text-emerald-600 font-black text-xs uppercase tracking-widest">Sincronizando AgroAlert...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Estilo Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Pronóstico <span className="text-emerald-500">Agro</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
            Sistemas de monitoreo {CIUDAD}
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <Thermometer className="text-emerald-500 w-4 h-4"/>
          <span className="text-[10px] font-black text-gray-600 uppercase">Temp. Estable</span>
        </div>
      </div>

      {/* Grid de Tarjetas con Colores Auténticos */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {datosClima.map((dia, index) => {
          const style = getCardStyle(index);
          return (
            <div 
              key={index} 
              className={`p-6 rounded-[2.5rem] border-2 transition-all hover:scale-105 hover:shadow-2xl ${style.border} ${style.bg} ${style.shadow}`}
            >
              <div className="text-center">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">
                  {format(new Date(dia.fecha), "EEEE", { locale: es })}
                </p>
                <p className="text-xs font-black text-gray-800 mb-4">{format(new Date(dia.fecha), "d MMM")}</p>
                
                <span className="text-5xl block my-6 filter drop-shadow-md">
                  {condicionIcons[dia.condicion as keyof typeof condicionIcons] || "⛅"}
                </span>

                <div className="bg-white/80 rounded-3xl py-4 mb-6 shadow-sm border border-white/50">
                  <p className={`text-3xl font-black tracking-tighter ${style.text}`}>{Math.round(dia.temp)}°C</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Promedio</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-black/5">
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase">
                    <span className="flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5 text-blue-400"/> Lluvia</span>
                    <span className="text-gray-900">{Math.round(dia.precipitacion)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase">
                    <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-orange-400"/> Viento</span>
                    <span className="text-gray-900">{Math.round(dia.viento)}km/h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfica Profesional Única */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Tendencia de Temperatura Semanal
          </h3>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase">Tiempo Real</span>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <AreaChart data={datosClima}>
              <defs>
                <linearGradient id="agroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="fecha" 
                tickFormatter={(str) => format(new Date(str), "dd")} 
                fontSize={11} 
                fontWeight="900"
                axisLine={false} 
                tickLine={false}
                dy={10}
              />
              <YAxis fontSize={11} fontWeight="900" axisLine={false} tickLine={false} unit="°" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  padding: '16px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#065f46' }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#10b981" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#agroGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}