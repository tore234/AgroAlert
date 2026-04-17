import React, { useState } from "react";
import { 
  Sprout, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  LayoutDashboard,
  Thermometer,
  Wind,
  Droplets,
  X
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

const dataHistorial = [
  { name: "Lun", temp: 22, hum: 45, viento: 12 },
  { name: "Mar", temp: 25, hum: 40, viento: 15 },
  { name: "Mié", temp: 19, hum: 65, viento: 22 },
  { name: "Jue", temp: 24, hum: 50, viento: 10 },
  { name: "Vie", temp: 28, hum: 35, viento: 8 },
  { name: "Sáb", temp: 26, hum: 42, viento: 14 },
  { name: "Dom", temp: 23, hum: 48, viento: 11 },
];

export function DashboardPrincipal() {
  const [metricaActiva, setMetricaActiva] = useState("temp");
  
  // --- ESTADO PARA LA NOTIFICACIÓN PROPIA ---
  const [aviso, setAviso] = useState({ visible: false, mensaje: "", tipo: "" });

  const manejarGuardado = async () => {
    const datosNodos = {
      sensores: [
        { nombre: 'Temperatura', estado: 'ACTIVO' },
        { nombre: 'Humedad', estado: 'ACTIVO' },
        { nombre: 'Viento', estado: 'STANDBY' }
      ]
    };

    try {
      const response = await fetch('http://localhost/apis/guardar_nodos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosNodos)
      });

      const resultado = await response.json();

      if (resultado.status === "success") {
        // Lanzar notificación de éxito
        lanzarAviso("¡Datos guardados correctamente!", "exito");
      } else {
        lanzarAviso("Error: " + resultado.message, "error");
      }
    } catch (error) {
      lanzarAviso("Error: Verifica que XAMPP esté activo", "error");
    }
  };

  // Función para mostrar el aviso y quitarlo en 3 segundos
  const lanzarAviso = (msg: string, tipo: string) => {
    setAviso({ visible: true, mensaje: msg, tipo: tipo });
    setTimeout(() => setAviso({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  const cards = [
    { id: "temp", label: "CULTIVOS TOTALES", value: "3", icon: Sprout, border: "border-emerald-500", bg: "bg-emerald-50/50", text: "text-emerald-600" },
    { id: "hum", label: "HECTÁREAS ACTIVAS", value: "124 ha", icon: Layers, border: "border-blue-500", bg: "bg-blue-50/50", text: "text-blue-600" },
    { id: "viento", label: "ZONAS OPERATIVAS", value: "2", icon: MapPin, border: "border-orange-500", bg: "bg-orange-50/50", text: "text-orange-600" },
    { id: "cosecha", label: "LISTOS PARA COSECHA", value: "1", icon: CheckCircle2, border: "border-purple-600", bg: "bg-purple-50/50", text: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 relative">
      
      {/* NOTIFICACIÓN FLOTANTE PERSONALIZADA */}
      {aviso.visible && (
        <div className={`fixed top-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl border-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${
          aviso.tipo === "exito" 
            ? "bg-emerald-500 border-emerald-400 text-white" 
            : "bg-red-500 border-red-400 text-white"
        }`}>
          <div className="bg-white/20 p-1 rounded-full">
            <CheckCircle2 size={18} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">{aviso.mensaje}</span>
          <button onClick={() => setAviso({ ...aviso, visible: false })} className="ml-2 hover:opacity-50">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-200">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                Panel de <span className="text-emerald-500">Control</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black tracking-[0.2em] uppercase">AgroAlert • Maravatío</p>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setMetricaActiva(card.id === "cosecha" ? "temp" : card.id)}
              className={`flex flex-col p-6 rounded-[2.5rem] border-2 transition-all duration-300 text-left hover:shadow-xl ${
                metricaActiva === card.id ? `${card.border} ${card.bg}` : "bg-white border-transparent shadow-sm"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${card.bg} ${card.text}`}>
                <IconComponent size={24} />
              </div>
              <span className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{card.value}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Área de Gráfica */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Histórico de {metricaActiva}
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataHistorial}>
                <defs>
                  <linearGradient id="colorMetrica" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey={metricaActiva} stroke="#10b981" strokeWidth={4} fill="url(#colorMetrica)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel Lateral de Sensores */}
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-8">Sensores en tiempo real</h3>
          <div className="space-y-4">
            <SensorRow icon={Thermometer} label="Temperatura" status="Activo" color="text-emerald-400" />
            <SensorRow icon={Droplets} label="Humedad" status="Activo" color="text-blue-400" />
            <SensorRow icon={Wind} label="Viento" status="Standby" color="text-orange-400" />
          </div>
          
          <button 
            onClick={manejarGuardado}
            className="w-full mt-8 py-4 bg-emerald-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-900/20"
          >
            Configurar Nodos
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