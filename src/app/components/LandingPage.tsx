import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Activity, Sprout, Users, Map,
  ShieldCheck, CloudSun, Bell, ChevronRight, ArrowRight,
  CheckCircle2, Star, Menu, X, Zap, Globe, BarChart3,
  Thermometer, Droplets, Wind, TrendingUp, Play,
} from "lucide-react";

interface Props {
  onLogin: () => void;
  onRegistro: () => void;
}

const SERVICIOS = [
  {
    id: 1,
    icon: LayoutDashboard,
    titulo: "Panel de Control",
    desc: "Visualiza en tiempo real el estado completo de tu operación agrícola desde un solo lugar.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: 2,
    icon: Activity,
    titulo: "Monitoreo en Tiempo Real",
    desc: "Sensores IoT conectados que reportan temperatura, humedad y viento al instante.",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 3,
    icon: Map,
    titulo: "Mapas y Visualización",
    desc: "Mapas interactivos georreferenciados con datos de tus zonas de cultivo.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    id: 4,
    icon: Sprout,
    titulo: "Gestión de Cultivos",
    desc: "Administra hectáreas, variedades y ciclos de siembra con trazabilidad completa.",
    color: "from-lime-500 to-green-600",
    bg: "bg-lime-50 dark:bg-lime-900/20",
    text: "text-lime-600 dark:text-lime-400",
  },
  {
    id: 5,
    icon: CloudSun,
    titulo: "Pronósticos Extendidos",
    desc: "Predicciones meteorológicas de 10 días adaptadas al microclima de tu parcela.",
    color: "from-orange-400 to-amber-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    id: 6,
    icon: ShieldCheck,
    titulo: "Recomendaciones",
    desc: "Sugerencias inteligentes para prevenir plagas, enfermedades y pérdidas de cosecha.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    id: 7,
    icon: Bell,
    titulo: "Alertas Personalizadas",
    desc: "Notificaciones configurables por umbral: heladas, lluvias extremas, déficit hídrico.",
    color: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-500",
  },
  {
    id: 8,
    icon: Users,
    titulo: "Gestión de Usuarios",
    desc: "Control de acceso por roles: administrador, agrónomo, operador de campo.",
    color: "from-slate-500 to-slate-700",
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
  },
];

const PASOS = [
  {
    num: "01",
    titulo: "Regístrate gratis",
    desc: "Crea tu cuenta con correo o Google en menos de 60 segundos. Sin tarjeta requerida.",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
  {
    num: "02",
    titulo: "Conecta tus sensores",
    desc: "Configura los nodos IoT de tu campo. Soportamos protocolos MQTT, HTTP y WebSocket.",
    icon: Zap,
    color: "text-blue-500",
  },
  {
    num: "03",
    titulo: "Monitorea y decide",
    desc: "Accede a datos en tiempo real, pronósticos y alertas para tomar mejores decisiones.",
    icon: TrendingUp,
    color: "text-violet-500",
  },
];

const STATS = [
  { valor: "500+", label: "Productores activos", icon: Users },
  { valor: "12K ha", label: "Hectáreas monitoreadas", icon: Globe },
  { valor: "99.7%", label: "Disponibilidad del sistema", icon: Zap },
  { valor: "24/7", label: "Soporte técnico", icon: BarChart3 },
];

export function LandingPage({ onLogin, onRegistro }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/5 border-b border-slate-100 dark:border-slate-800"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sprout size={16} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">
              Agro<span className="text-emerald-500">Alert</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
            <button onClick={() => scrollTo("servicios")} className="hover:text-emerald-500 transition-colors">Servicios</button>
            <button onClick={() => scrollTo("como-funciona")} className="hover:text-emerald-500 transition-colors">Cómo funciona</button>
            <button onClick={() => scrollTo("caracteristicas")} className="hover:text-emerald-500 transition-colors">Características</button>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={onRegistro}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
            >
              Probar Gratis
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-2 shadow-xl">
            {["servicios", "como-funciona", "caracteristicas"].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors capitalize"
              >
                {id === "como-funciona" ? "Cómo funciona" : id.replace("-", " ")}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={onLogin} className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest hover:border-emerald-500 transition-colors">
                Iniciar Sesión
              </button>
              <button onClick={onRegistro} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-widest shadow-lg">
                Probar Gratis
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
            alt="Campo agrícola al amanecer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-sm">
            <Zap size={12} className="animate-pulse" />
            Sistema de Alertas Agrícolas · Maravatío, Mich.
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-6">
            Agricultura de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              precisión inteligente
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-10">
            Monitorea tus cultivos en tiempo real, anticipa condiciones climáticas adversas
            y toma decisiones basadas en datos con <strong className="text-white">AgroAlert</strong>.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegistro}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:-translate-y-1 transition-all"
            >
              Comenzar gratis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all"
            >
              <Play size={14} fill="currentColor" />
              Ver el demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
            {["Sin tarjeta requerida", "Configuración en 5 min", "Soporte técnico incluido"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                <CheckCircle2 size={14} className="text-emerald-400" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-[10px] font-black uppercase tracking-widest">Descubre más</span>
          <div className="w-px h-10 bg-gradient-to-b from-slate-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-slate-900 dark:bg-slate-950 py-12 sm:py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map(({ valor, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon size={20} className="text-emerald-500" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{valor}</p>
                <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ────────────────────────────────────────── */}
      <section id="servicios" className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-14 sm:mb-20">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              Módulos del sistema
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Todo lo que necesitas
              <span className="block text-emerald-500">en un solo lugar</span>
            </h2>
            <p className="max-w-xl mx-auto text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Ocho módulos especializados que cubren cada aspecto de la gestión agrícola moderna.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SERVICIOS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="group relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={22} className={s.text} />
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-tight mb-2 text-slate-800 dark:text-white">{s.titulo}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-emerald-500 text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver en el dashboard <ChevronRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
              Proceso simplificado
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">
              Empieza en <span className="text-blue-500">3 pasos</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-gradient-to-r from-emerald-200 via-blue-200 to-violet-200 dark:from-emerald-900 dark:via-blue-900 dark:to-violet-900" />

            {PASOS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.num} className="relative text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-inner" />
                    <Icon size={32} className={`relative z-10 ${p.color}`} />
                    <span className="absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">
                      {p.num}
                    </span>
                  </div>
                  <h3 className="font-black text-lg tracking-tight mb-2 text-slate-800 dark:text-white">{p.titulo}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURE SHOWCASE ──────────────────────────────────── */}
      <section id="caracteristicas" className="py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Feature 1 - Monitoreo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-24 sm:mb-32">
            <div>
              <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-5">
                Sensores IoT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-5 text-slate-900 dark:text-white">
                Datos del campo
                <span className="block text-emerald-500">en tiempo real</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                Nuestros sensores IoT instalados en campo envían lecturas cada 30 segundos.
                Temperatura, humedad del suelo, velocidad del viento y precipitación — todo
                visible desde tu celular o computadora.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Thermometer, label: "Temperatura ambiente y de suelo", color: "text-rose-500" },
                  { icon: Droplets,    label: "Humedad relativa y del suelo",    color: "text-blue-500" },
                  { icon: Wind,        label: "Velocidad y dirección del viento", color: "text-slate-500" },
                ].map(({ icon: I, label, color }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <I size={15} className={color} />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 h-64 sm:h-80 lg:h-96">
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=80"
                alt="Cultivos con sensores"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              {/* Floating sensor card */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:right-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Sensor activo · Zona A</p>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black text-slate-900 dark:text-white">24°C</p>
                    <p className="text-[9px] font-bold text-slate-400">Temp.</p>
                  </div>
                  <div className="w-px bg-slate-100 dark:bg-slate-700" />
                  <div className="text-center">
                    <p className="text-xl font-black text-blue-500">68%</p>
                    <p className="text-[9px] font-bold text-slate-400">Hum.</p>
                  </div>
                  <div className="w-px bg-slate-100 dark:bg-slate-700" />
                  <div className="text-center">
                    <p className="text-xl font-black text-slate-500">12 km/h</p>
                    <p className="text-[9px] font-bold text-slate-400">Viento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Pronósticos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 h-64 sm:h-80 lg:h-96">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80"
                alt="Cosecha de campo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              {/* Floating alert card */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-amber-500 text-white rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-widest mb-1">⚠ Alerta Activa</p>
                <p className="text-xs font-bold">Helada prevista en 18h</p>
              </div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pronóstico 7 días</p>
                <div className="flex gap-2">
                  {["L","M","X","J","V","S","D"].map((d, i) => (
                    <div key={d} className="text-center">
                      <p className="text-[8px] font-black text-slate-400">{d}</p>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200">{17 + i}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-5">
                Inteligencia climática
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-5 text-slate-900 dark:text-white">
                Anticípate al clima
                <span className="block text-orange-500">protege tu cosecha</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                Pronósticos de hasta 10 días calibrados para el microclima de tu parcela.
                Recibe alertas automáticas antes de que llegue una helada, granizo o sequía extrema.
              </p>
              {[
                "Alertas de helada con 24h de anticipación",
                "Modelos de evapotranspiración para riego",
                "Historial climático de los últimos 12 meses",
                "Notificaciones push y por correo electrónico",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ───────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3 text-slate-900 dark:text-white">
              Productores que ya
              <span className="text-emerald-500"> confían en AgroAlert</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                nombre: "Carlos Mendoza",
                rol: "Agricultor de maíz · 80 ha",
                img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&q=80",
                texto: "Gracias a las alertas de helada pude cubrir mis cultivos a tiempo. Salvé toda la temporada. No imagino trabajar sin AgroAlert.",
              },
              {
                nombre: "Ana Gutiérrez",
                rol: "Agrónoma · Cooperativa Morelia",
                img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
                texto: "El módulo de mapas es increíble. Puedo ver el estado de cada zona de cultivo sin salir de la oficina. Los datos son exactos.",
              },
              {
                nombre: "Roberto Flores",
                rol: "Productor hortícola · 35 ha",
                img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&q=80",
                texto: "La configuración fue muy sencilla. En una tarde ya tenía los sensores funcionando y las alertas configuradas. Excelente soporte.",
              },
            ].map((t) => (
              <div key={t.nombre} className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{t.texto}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.nombre} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-black text-sm text-slate-800 dark:text-white">{t.nombre}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t.rol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80"
            alt="Campo agrícola"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-slate-900/85 to-teal-900/90" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-5">
            Empieza a proteger
            <span className="block text-emerald-400">tu campo hoy</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10">
            Únete a más de 500 productores que ya usan AgroAlert para tomar mejores decisiones.
            Registro gratuito, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegistro}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-emerald-500/40 hover:-translate-y-1 hover:shadow-emerald-500/60 transition-all"
            >
              Crear cuenta gratis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all"
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Sprout size={16} className="text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter text-white">
                  Agro<span className="text-emerald-500">Alert</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Sistema integral de monitoreo y alertas para agricultura de precisión. Maravatío, Michoacán.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Sistema</h4>
              <ul className="space-y-2">
                {["Dashboard", "Monitoreo", "Pronósticos", "Alertas"].map((l) => (
                  <li key={l}>
                    <button onClick={onLogin} className="text-slate-400 text-sm hover:text-emerald-400 transition-colors">
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Acceso</h4>
              <ul className="space-y-2">
                {[
                  { label: "Iniciar Sesión", action: onLogin },
                  { label: "Registrarse", action: onRegistro },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button onClick={action} className="text-slate-400 text-sm hover:text-emerald-400 transition-colors">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">© 2026 AgroAlert · Maravatío, Michoacán · Todos los derechos reservados</p>
            <p className="text-slate-600 text-xs">Innovación Agrícola · Sistema de Alertas Climáticas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
