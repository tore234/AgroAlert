import React, { useState } from "react";
// 1. IMPORTACIÓN DE TODOS TUS COMPONENTES
import { DashboardPrincipal } from "./components/Dashboard";
import { MonitoreoTiempoReal } from "./components/MonitoreoTiempoReal";
import { GestionCultivos } from "./components/GestionCultivos";
import { GestionUsuarios } from "./components/GestionUsuarios";
import { MapasVisualizacion } from "./components/MapasVisualizacion";
import { RecomendacionesSeguridad } from "./components/RecomendacionesSeguridad";
import { PronosticosExtendidos } from "./components/PronosticosExtendidos";
import { AlertasPersonalizadas } from "./components/AlertasPersonalizadas";

// Iconos para que se vea profesional
import { 
  LayoutDashboard, Activity, Sprout, Users, 
  Map, ShieldCheck, CloudSun, Bell, LogOut 
} from "lucide-react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [seccionActiva, setSeccionActiva] = useState("dashboard");

  const ejecutarLogin = async (datosFormulario: any) => {
    try {
      const response = await fetch('http://localhost/apis/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFormulario)
      });
      const data = await response.json();
      if (data.status === "success") {
        setIsLoggedIn(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error: Revisa XAMPP y la BD 'proyecto_final'");
    }
  };

  if (!isLoggedIn) {
    return <PantallaLogin alEnviar={ejecutarLogin} mensajeError={error} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* --- MENÚ LATERAL (SIDEBAR) --- */}
      <div className="w-72 bg-slate-900 text-white p-6 flex flex-col shadow-2xl overflow-y-auto">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
            Agro<span className="text-emerald-500">Alert</span>
          </h2>
          <p className="text-[9px] text-slate-500 font-black tracking-[0.2em] uppercase">Innovación Agrícola</p>
        </div>

        <nav className="flex-1 space-y-1">
          <MenuButton 
            activo={seccionActiva === "dashboard"} 
            onClick={() => setSeccionActiva("dashboard")}
            icon={LayoutDashboard} label="Panel Principal" 
          />
          <MenuButton 
            activo={seccionActiva === "monitoreo"} 
            onClick={() => setSeccionActiva("monitoreo")}
            icon={Activity} label="Monitoreo Real" 
          />
          <MenuButton 
            activo={seccionActiva === "mapas"} 
            onClick={() => setSeccionActiva("mapas")}
            icon={Map} label="Mapas y Vis." 
          />
          <div className="h-px bg-slate-800 my-4 mx-2" /> {/* Separador */}
          <MenuButton 
            activo={seccionActiva === "cultivos"} 
            onClick={() => setSeccionActiva("cultivos")}
            icon={Sprout} label="Gestión Cultivos" 
          />
          <MenuButton 
            activo={seccionActiva === "usuarios"} 
            onClick={() => setSeccionActiva("usuarios")}
            icon={Users} label="Gestión Usuarios" 
          />
          <div className="h-px bg-slate-800 my-4 mx-2" /> {/* Separador */}
          <MenuButton 
            activo={seccionActiva === "pronosticos"} 
            onClick={() => setSeccionActiva("pronosticos")}
            icon={CloudSun} label="Pronósticos" 
          />
          <MenuButton 
            activo={seccionActiva === "recomendaciones"} 
            onClick={() => setSeccionActiva("recomendaciones")}
            icon={ShieldCheck} label="Recomendaciones" 
          />
          <MenuButton 
            activo={seccionActiva === "alertas"} 
            onClick={() => setSeccionActiva("alertas")}
            icon={Bell} label="Alertas" 
          />
        </nav>

        <button 
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest mt-8"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>

      {/* --- CONTENIDO DINÁMICO --- */}
      <main className="flex-1 overflow-y-auto">
        {seccionActiva === "dashboard" && <DashboardPrincipal />}
        {seccionActiva === "monitoreo" && <MonitoreoTiempoReal />}
        {seccionActiva === "mapas" && <MapasVisualizacion />}
        {seccionActiva === "cultivos" && <GestionCultivos />}
        {seccionActiva === "usuarios" && <GestionUsuarios />}
        {seccionActiva === "pronosticos" && <PronosticosExtendidos />}
        {seccionActiva === "recomendaciones" && <RecomendacionesSeguridad />}
        {seccionActiva === "alertas" && <AlertasPersonalizadas />}
      </main>
    </div>
  );
}

// Sub-componente para botones
function MenuButton({ activo, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
        activo 
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// Pantalla de Login
function PantallaLogin({ alEnviar, mensajeError }: any) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-b-[10px] border-emerald-500 text-center">
        <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">Agro<span className="text-emerald-500">Alert</span></h2>
        <form onSubmit={(e) => { e.preventDefault(); alEnviar({ usuario, password }); }} className="space-y-4">
          <input type="text" placeholder="USUARIO" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-emerald-500 uppercase font-bold text-xs" onChange={(e) => setUsuario(e.target.value)} />
          <input type="password" placeholder="CONTRASEÑA" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-emerald-500 font-bold text-xs" onChange={(e) => setPassword(e.target.value)} />
          {mensajeError && <p className="text-red-500 text-[9px] font-black uppercase">{mensajeError}</p>}
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all">Entrar</button>
        </form>
      </div>
    </div>
  );
}