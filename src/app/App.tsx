import React, { useState, useEffect } from "react";
import { DashboardPrincipal } from "./components/Dashboard";
import { MonitoreoTiempoReal } from "./components/MonitoreoTiempoReal";
import { GestionCultivos } from "./components/GestionCultivos";
import { GestionUsuarios } from "./components/GestionUsuarios";
import { MapasVisualizacion } from "./components/MapasVisualizacion";
import { RecomendacionesSeguridad } from "./components/RecomendacionesSeguridad";
import { PronosticosExtendidos } from "./components/PronosticosExtendidos";
import { AlertasPersonalizadas } from "./components/AlertasPersonalizadas";
import { GestionReles } from "./components/GestionReles";
import { PantallaLogin } from "./components/PantallaLogin";
import { PantallaRegistro } from "./components/PantallaRegistro";
import { LandingPage } from "./components/LandingPage";

import {
  LayoutDashboard, Activity, Sprout, Users,
  Map, ShieldCheck, CloudSun, Bell, LogOut,
  Moon, Sun, Menu, X, ChevronLeft, ChevronRight, Zap,
  Lock, Crown, Wrench, BookOpen,
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
import { useUserRole, rolePermissions, ROLE_EMAIL_MAP } from "../hooks/useUserRole";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { initializeUserProfile } from "../services/firestoreService";

// ── Nav definition ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard",       label: "Panel Principal",  icon: LayoutDashboard },
  { id: "monitoreo",       label: "Monitoreo Real",   icon: Activity },
  { id: "mapas",           label: "Mapas y Vis.",     icon: Map },
  { id: "cultivos",        label: "Gestión Cultivos", icon: Sprout },
  { id: "reles",           label: "Control Relés",    icon: Zap },
  { id: "alertas",         label: "Alertas",          icon: Bell },
  { id: "usuarios",        label: "Gestión Usuarios", icon: Users },
  { id: "pronosticos",     label: "Pronósticos",      icon: CloudSun },
  { id: "recomendaciones", label: "Recomendaciones",  icon: ShieldCheck },
] as const;

type Seccion = typeof NAV_ITEMS[number]["id"];

// ── Role metadata ──────────────────────────────────────────────────────────

const ROL_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  administrador: { label: "Administrador", color: "text-purple-300",  bg: "bg-purple-500/20 border-purple-500/40", icon: Crown   },
  operador:      { label: "Operador",      color: "text-blue-300",    bg: "bg-blue-500/20 border-blue-500/40",     icon: Wrench  },
  consultor:     { label: "Consultor",     color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-500/40", icon: BookOpen },
};

const ROL_BADGE_MOBILE: Record<string, string> = {
  administrador: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  operador:      "bg-blue-500/20 text-blue-300 border-blue-500/40",
  consultor:     "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

// ── Access Denied screen ───────────────────────────────────────────────────

function AccesoRestringido({ rol }: { rol: string | null }) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Acceso Restringido</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Tu rol de <span className="font-bold capitalize">{rol ?? "invitado"}</span> no tiene
          permisos para ver esta sección.
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-widest">
          Contacta al administrador para solicitar acceso.
        </p>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("dashboard");
  const [vistaAuth, setVistaAuth] = useState<"landing" | "login" | "registro">("landing");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { rol, loading: rolLoading } = useUserRole();
  const { nombre: nombreUsuario } = useCurrentUser();

  // Permitted nav items for the current user role
  const permisosRol = rol ? (rolePermissions[rol] ?? []) : [];
  const navVisible = NAV_ITEMS.filter((item) => permisosRol.includes(item.id));

  // When role loads, if current section is not allowed → redirect to first allowed
  useEffect(() => {
    if (rol && !rolLoading && permisosRol.length > 0) {
      if (!permisosRol.includes(seccionActiva)) {
        setSeccionActiva(permisosRol[0] as Seccion);
      }
    }
  }, [rol, rolLoading]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Solo bloquear scroll cuando hay sesión activa Y el sidebar está abierto
  useEffect(() => {
    document.body.style.overflow = (usuario && mobileOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, usuario]);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUsuario(user);
      setAuthLoading(false);
      if (!user) {
        // Limpiar estado de UI al cerrar sesión (incluso por expiración externa)
        setMobileOpen(false);
        document.body.style.overflow = "";
      }
      // Inicializar perfil en Firestore para usuarios nuevos
      if (user?.email && !ROLE_EMAIL_MAP[user.email.toLowerCase()]) {
        initializeUserProfile(user.uid, user.email, "consultor");
      }
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
    try {
      // Cerrar sidebar y liberar scroll ANTES de logout para evitar el bloqueo
      setMobileOpen(false);
      document.body.style.overflow = "";
      await logout();
      setVistaAuth("landing");
    }
    catch (err: any) { setError("Error al cerrar sesión: " + err.message); }
  };

  const navegar = (id: Seccion) => {
    setSeccionActiva(id);
    setMobileOpen(false);
  };

  // ── Loading screens ──────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <h2 className="text-2xl font-black">Agro<span className="text-emerald-500">Alert</span></h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Auth screens ─────────────────────────────────────────────────────────

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

  // ── Role loading ─────────────────────────────────────────────────────────

  if (rolLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <h2 className="text-2xl font-black">Agro<span className="text-emerald-500">Alert</span></h2>
          <p className="text-slate-400 text-sm font-medium">Verificando permisos...</p>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Sidebar dimensions ───────────────────────────────────────────────────

  const sidebarWidth = collapsed ? "lg:w-20" : "lg:w-72";
  const mainMargin   = collapsed ? "lg:ml-20" : "lg:ml-72";
  const rolMeta      = rol ? ROL_META[rol] : null;
  const RolIcon      = rolMeta?.icon ?? BookOpen;

  const seccionPermitida = permisosRol.includes(seccionActiva);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── MOBILE BACKDROP ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ───────────────────────────────────────────── */}
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

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Role badge */}
        {rolMeta && (
          <div className={`mx-3 mt-3 mb-1 px-3 py-2 rounded-xl border ${rolMeta.bg} flex items-center gap-2 ${collapsed ? "justify-center px-0" : ""}`}>
            <RolIcon size={14} className={`flex-shrink-0 ${rolMeta.color}`} />
            {!collapsed && (
              <span className={`text-[10px] font-black uppercase tracking-widest ${rolMeta.color}`}>
                {rolMeta.label}
              </span>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navVisible.map((item) => {
            const Icon = item.icon;
            const activo = seccionActiva === item.id;
            const divider = item.id === "reles" || item.id === "usuarios" || item.id === "pronosticos";
            return (
              <React.Fragment key={item.id}>
                {divider && <div className="h-px bg-slate-800 my-2 mx-1" />}
                <button
                  onClick={() => navegar(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-xl
                    font-black text-[10px] uppercase tracking-widest
                    transition-all duration-200
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
          {/* User name + email */}
          {!collapsed && (
            <div className="px-3 py-1 min-w-0">
              {nombreUsuario && (
                <p className="text-[10px] text-slate-300 font-black truncate">{nombreUsuario}</p>
              )}
              {usuario?.email && (
                <p className="text-[9px] text-slate-600 font-bold truncate">{usuario.email}</p>
              )}
            </div>
          )}

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

      {/* ── MAIN AREA ─────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${mainMargin} ${mobileOpen ? "lg:z-auto lg:pointer-events-auto z-10 pointer-events-none" : "z-auto pointer-events-auto"}`}>

        {/* Mobile top header */}
        <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg font-black text-white uppercase tracking-tighter">
              Agro<span className="text-emerald-500">Alert</span>
            </span>
          </div>

          {/* Role chip on mobile header */}
          {rolMeta && rol && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${ROL_BADGE_MOBILE[rol]}`}>
              {rolMeta.label}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {!seccionPermitida ? (
            <AccesoRestringido rol={rol} />
          ) : (
            <>
              {seccionActiva === "dashboard"       && <DashboardPrincipal />}
              {seccionActiva === "monitoreo"       && <MonitoreoTiempoReal />}
              {seccionActiva === "mapas"           && <MapasVisualizacion />}
              {seccionActiva === "cultivos"        && <GestionCultivos />}
              {seccionActiva === "usuarios"        && <GestionUsuarios />}
              {seccionActiva === "pronosticos"     && <PronosticosExtendidos />}
              {seccionActiva === "recomendaciones" && <RecomendacionesSeguridad />}
              {seccionActiva === "alertas"         && <AlertasPersonalizadas />}
              {seccionActiva === "reles"           && <GestionReles />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
