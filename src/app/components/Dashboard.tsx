import React, { useState } from "react";
import {
  Sprout, Layers, MapPin, CheckCircle2,
  TrendingUp, LayoutDashboard, Thermometer, Wind, Droplets, X
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { saveNodos } from "../../services/firestoreService";

const dataHistorial = [
  { name: "Lun", temp: 22, hum: 45, viento: 12 },
  { name: "Mar", temp: 25, hum: 40, viento: 15 },
  { name: "Mié", temp: 19, hum: 65, viento: 22 },
  { name: "Jue", temp: 24, hum: 50, viento: 10 },
  { name: "Vie", temp: 28, hum: 35, viento: 8  },
  { name: "Sáb", temp: 26, hum: 42, viento: 14 },
  { name: "Dom", temp: 23, hum: 48, viento: 11 },
];

export function DashboardPrincipal() {
  const [metricaActiva, setMetricaActiva] = useState("temp");
  const [aviso, setAviso] = useState({ visible: false, mensaje: "", tipo: "" });
  const { uid } = useAuth();

  const manejarGuardado = async () => {
    if (!uid) return;
    try {
      await saveNodos(uid, [
        { nombre: "Temperatura", estado: "ACTIVO"  },
        { nombre: "Humedad",     estado: "ACTIVO"  },
        { nombre: "Viento",      estado: "STANDBY" },
      ]);
      lanzarAviso("¡Nodos guardados en la nube!", "exito");
    } catch {
      lanzarAviso("Error al guardar. Verifica tu conexión.", "error");
    }
  };

  const lanzarAviso = (msg: string, tipo: string) => {
    setAviso({ visible: true, mensaje: msg, tipo });
    setTimeout(() => setAviso({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  const cards = [
    { id: "temp",    label: "CULTIVOS TOTALES",   value: "3",      icon: Sprout,      border: "border-emerald-500", bg: "bg-emerald-50/50", text: "text-emerald-600" },
    { id: "hum",     label: "HECTÁREAS ACTIVAS",  value: "124 ha", icon: Layers,      border: "border-blue-500",   bg: "bg-blue-50/50",    text: "text-blue-600"   },
    { id: "viento",  label: "ZONAS OPERATIVAS",   value: "2",      icon: MapPin,      border: "border-orange-500", bg: "bg-orange-50/50",  text: "text-orange-600" },
    { id: "cosecha", label: "LISTOS PARA COSECHA",value: "1",      icon: CheckCircle2,border: "border-purple-600", bg: "bg-purple-50/50",  text: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-gutter-sm sm:px-gutter md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 lg:space-y-10 relative">

      {aviso.visible && (
        <div className={`fixed top-4 sm:top-6 lg:top-10 right-4 sm:right-6 lg:right-10 z-[100] flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-2xl border-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4 max-w-xs ${
          aviso.tipo === "exito"
            ? "bg-emerald-500 dark:bg-emerald-600 border-emerald-400 text-white"
            : "bg-red-500 dark:bg-red-600 border-red-400 text-white"
        }`}>
          <div className="bg-white/20 p-1 rounded-full flex-shrink-0">
            <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
          </div>
          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest line-clamp-2">{aviso.mensaje}</span>
          <button onClick={() => setAviso({ ...aviso, visible: false })} className="ml-2 hover:opacity-50 flex-shrink-0">
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="bg-emerald-500 dark:bg-emerald-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex-shrink-0">
            <LayoutDashboard className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">
              Panel de <span className="text-emerald-500">Control</span>
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-[8px] xs:text-[9px] sm:text-[10px] font-black tracking-[0.2em] uppercase truncate">AgroAlert • Maravatío</p>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setMetricaActiva(card.id === "cosecha" ? "temp" : card.id)}
              className={`flex flex-col p-3 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1 ${
                metricaActiva === card.id ? `${card.border} ${card.bg}` : "bg-white dark:bg-slate-800 border-transparent shadow-sm"
              }`}
            >
              <div className={`w-10 xs:w-12 h-10 xs:h-12 rounded-lg xs:rounded-2xl flex items-center justify-center mb-3 xs:mb-4 sm:mb-6 ${card.bg} ${card.text}`}>
                <IconComponent size={20} className="xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-2xl xs:text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{card.value}</span>
              <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-tight">{card.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {/* Gráfica */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-4 xs:p-6 sm:p-8 md:p-10 rounded-2xl xs:rounded-3xl sm:rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4 xs:mb-6 sm:mb-8 gap-2">
            <h3 className="text-xs xs:text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 min-w-0">
              <TrendingUp className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0 text-emerald-500" />
              <span className="truncate">Histórico de {metricaActiva}</span>
            </h3>
          </div>
          <div className="h-60 xs:h-72 sm:h-80 md:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataHistorial}>
                <defs>
                  <linearGradient id="colorMetrica" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight="900" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} fontWeight="900" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey={metricaActiva} stroke="#10b981" strokeWidth={3} fill="url(#colorMetrica)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sensores */}
        <div className="bg-slate-900 rounded-2xl xs:rounded-3xl sm:rounded-[3rem] p-4 xs:p-6 sm:p-8 md:p-10 text-white shadow-2xl">
          <h3 className="text-[9px] xs:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 xs:mb-6 sm:mb-8">Sensores en tiempo real</h3>
          <div className="space-y-3 xs:space-y-4">
            <SensorRow icon={Thermometer} label="Temperatura" status="Activo"  color="text-emerald-400" />
            <SensorRow icon={Droplets}    label="Humedad"     status="Activo"  color="text-blue-400"   />
            <SensorRow icon={Wind}        label="Viento"      status="Standby" color="text-orange-400" />
          </div>
          <button
            onClick={manejarGuardado}
            className="w-full mt-6 xs:mt-8 py-3 xs:py-4 sm:py-5 bg-emerald-500 rounded-xl xs:rounded-2xl font-black uppercase text-[9px] xs:text-[10px] tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-900/20"
          >
            Guardar en la nube
          </button>
        </div>
      </div>
    </div>
  );
}

function SensorRow({ icon: Icon, label, status, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3">
        <Icon className={`${color} w-5 h-5`} />
        <span className="text-xs font-bold">{label}</span>
      </div>
      <span className="text-[9px] font-black uppercase opacity-60">{status}</span>
    </div>
  );
}
