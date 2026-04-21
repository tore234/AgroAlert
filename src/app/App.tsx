import React, { useState, useEffect } from "react";
import { DashboardPrincipal } from "./components/Dashboard";
import { MonitoreoTiempoReal } from "./components/MonitoreoTiempoReal";
import { GestionCultivos } from "./components/GestionCultivos";
import { GestionUsuarios } from "./components/GestionUsuarios";
import { MapasVisualizacion } from "./components/MapasVisualizacion";
import { RecomendacionesSeguridad } from "./components/RecomendacionesSeguridad";
import { PronosticosExtendidos } from "./components/PronosticosExtendidos";
import { AlertasPersonalizadas } from "./components/AlertasPersonalizadas";
import { PantallaLogin } from "./components/PantallaLogin";
import { PantallaRegistro } from "./components/PantallaRegistro";
import { LandingPage } from "./components/LandingPage";

import {
  LayoutDashboard, Activity, Sprout, Users,
  Map, ShieldCheck, CloudSun, Bell, LogOut,
  Moon, Sun, Menu, X, ChevronLeft, ChevronRight
} from "lucide-react";

import {
  loginWithEmail,
  signUpWithEmail,
  loginWithGoogle,
  logout,
  onAuthChange,
} from "../authService";
import { User } from "firebase/auth";
import { useTheme } from "../ThemeContext";

const NAV_ITEMS = [
  { id: "dashboard",      label: "Panel Principal",  icon: LayoutDashboard },
  { id: "monitoreo",      label: "Monitoreo Real",   icon: Activity },
  { id: "mapas",          label: "Mapas y Vis.",     icon: Map },
  { id: "cultivos",       label: "Gestión Cultivos", icon: Sprout },
  { id: "usuarios",       label: "Gestión Usuarios", icon: Users },
  { id: "pronosticos",    label: "Pronósticos",      icon: CloudSun },
  { id: "recomendaciones",label: "Recomendaciones",  icon: ShieldCheck },
  { id: "alertas",        label: "Alertas",          icon: Bell },
] as const;

type Seccion = typeof NAV_ITEMS[number]["id"];

export default function App() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("dashboard");
  // "landing" | "login" | "registro"
  const [vistaAuth, setVistaAuth] = useState<"landing" | "login" | "registro">("landing");

  // Sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUsuario(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ejecutarLogin = async (email: string, password: string) => {
    try {
      setError("");
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") setError("Usuario no encontrado. ¿Deseas crear una cuenta?");
      else if (err.code === "auth/wrong-password") setError("Contraseña incorrecta");
      else if (err.code === "auth/invalid-email") setError("Email inválido");
      else setError("Error al iniciar sesión: " + err.message);
    }
  };

  const ejecutarRegistro = async (email: string, password: string) => {
    try {
      setError("");
      await signUpWithEmail(email, password);
      setVistaAuth("landing");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("Este email ya está registrado. Intenta iniciar sesión");
      else if (err.code === "auth/weak-password") setError("La contraseña es muy débil. Usa al menos 6 caracteres");
      else if (err.code === "auth/invalid-email") setError("Email inválido");
      else setError("Error al crear cuenta: " + err.message);
    }
  };

  const ejecutarGoogleLogin = async () => {
    try {
      setError("");
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") setError("La ventana emergente fue bloqueada. Habilita los popups");
      else if (err.code !== "auth/cancelled-popup-request") setError("Error al conectar con Google: " + err.message);
    }
  };

  const ejecutarLogout = async () => {
    try { await logout(); setVistaAuth("landing"); }
    catch (err: any) { setError("Error al cerrar sesión: " + err.message); }
  };

  const navegar = (id: Seccion) => {
    setSeccionActiva(id);
    setMobileOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl font-bold mb-4">Cargando...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
        </div>
      </div>
    );
  }

  if (!usuario) {
    if (vistaAuth === "registro") {
      return (
        <PantallaRegistro
          onSignUp={ejecutarRegistro}
          onGoogleSignUp={ejecutarGoogleLogin}
          onBackToLogin={() => { setVistaAuth("login"); setError(""); }}
          error={error}
        />
      );
    }
    if (vistaAuth === "login") {
      return (
        <PantallaLogin
          onLogin={ejecutarLogin}
          onGoogleLogin={ejecutarGoogleLogin}
          onSignUp={() => { setVistaAuth("registro"); setError(""); }}
          onHome={() => { setError(""); setVistaAuth("landing"); }}
          error={error}
        />
      );
    }
    return (
      <LandingPage
        onLogin={() => { setError(""); setVistaAuth("login"); }}
        onRegistro={() => { setError(""); setVistaAuth("registro"); }}
      />
    );
  }

  const sidebarWidth = collapsed ? "lg:w-20" : "lg:w-72";
  const mainMargin  = collapsed ? "lg:ml-20" : "lg:ml-72";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── MOBILE BACKDROP ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full
          bg-slate-900 dark:bg-slate-950 text-white
          flex flex-col shadow-2xl border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-800 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                Agro<span className="text-emerald-500">Alert</span>
              </h2>
              <p className="text-[8px] text-slate-500 font-black tracking-[0.2em] uppercase">Innovación Agrícola</p>
            </div>
          )}
          {collapsed && (
            <span className="text-emerald-500 font-black text-lg">AA</span>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const activo = seccionActiva === item.id;
            // Dividers before "cultivos" and "pronosticos"
            const divider = item.id === "cultivos" || item.id === "pronosticos";
            return (
              <React.Fragment key={item.id}>
                {divider && <div className="h-px bg-slate-800 my-2 mx-1" />}
                <button
                  onClick={() => navegar(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-xl
                    font-black text-[10px] uppercase tracking-widest
                    transition-all duration-200 group
                    ${collapsed ? "justify-center px-0 py-3" : "px-3 py-3"}
                    ${activo
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className={`border-t border-slate-800 py-3 px-2 space-y-1 flex-shrink-0 ${collapsed ? "flex flex-col items-center" : ""}`}>
          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === "light" ? "Modo Oscuro" : "Modo Claro") : undefined}
            className={`flex items-center gap-3 rounded-xl text-slate-500 hover:text-emerald-400 transition-all font-black text-[10px] uppercase tracking-widest
              ${collapsed ? "justify-center px-0 py-3 w-full" : "px-3 py-3 w-full"}`}
          >
            {theme === "light" ? <Moon size={16} className="flex-shrink-0" /> : <Sun size={16} className="flex-shrink-0" />}
            {!collapsed && (theme === "light" ? "Modo Oscuro" : "Modo Claro")}
          </button>

          <button
            onClick={ejecutarLogout}
            title={collapsed ? "Cerrar Sesión" : undefined}
            className={`flex items-center gap-3 rounded-xl text-slate-500 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest
              ${collapsed ? "justify-center px-0 py-3 w-full" : "px-3 py-3 w-full"}`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${mainMargin}`}>

        {/* Mobile top header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center h-14 px-4 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 shadow-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 text-lg font-black text-white uppercase tracking-tighter">
            Agro<span className="text-emerald-500">Alert</span>
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {seccionActiva === "dashboard"       && <DashboardPrincipal />}
          {seccionActiva === "monitoreo"       && <MonitoreoTiempoReal />}
          {seccionActiva === "mapas"           && <MapasVisualizacion />}
          {seccionActiva === "cultivos"        && <GestionCultivos />}
          {seccionActiva === "usuarios"        && <GestionUsuarios />}
          {seccionActiva === "pronosticos"     && <PronosticosExtendidos />}
          {seccionActiva === "recomendaciones" && <RecomendacionesSeguridad />}
          {seccionActiva === "alertas"         && <AlertasPersonalizadas />}
        </main>
      </div>
    </div>
  );
}
