import React, { useState, useEffect, useMemo } from "react";
import {
  Zap, Plus, MapPin, Edit, Trash2, Search, Power,
  Activity, Settings, Clock, Cpu, User, ShieldCheck, X, Check,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  getRelesGlobal, saveReleGlobal, deleteReleGlobal, toggleReleGlobal,
  getCultivosGlobal, Rele, Cultivo,
} from "../../services/firestoreService";

const ZONAS = ["Norte", "Sur", "Este", "Oeste", "Centro"];

const ROL_COLOR: Record<string, string> = {
  administrador: "bg-purple-100 text-purple-700",
  operador:      "bg-blue-100 text-blue-700",
  consultor:     "bg-emerald-100 text-emerald-700",
};

// ── Mini Map for selecting relay location ─────────────────────────────────

interface MapaSelectorProps {
  coordenadas: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
}

function MapaSelectorUbicacion({ coordenadas, onChange }: MapaSelectorProps) {
  const MapController = () => {
    const map = useMapEvents({
      click(e) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });

    useEffect(() => {
      map.flyTo([coordenadas.lat, coordenadas.lng], 13, { duration: 1 });
    }, [coordenadas, map]);

    return null;
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 h-64 shadow-md">
      <MapContainer
        key={`${coordenadas.lat}-${coordenadas.lng}`}
        center={[coordenadas.lat, coordenadas.lng]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <Marker position={[coordenadas.lat, coordenadas.lng]} />
        <MapController />
      </MapContainer>
    </div>
  );
}

export function GestionReles() {
  const { uid, nombre, rol } = useCurrentUser();

  const puedeEscribir = rol === "administrador" || rol === "operador";
  const puedeEliminar = rol === "administrador";

  const [reles, setReles] = useState<Rele[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [releEditando, setReleEditando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroZona, setFiltroZona] = useState("Todas");

  const [formulario, setFormulario] = useState({
    nombre: "",
    zona: "",
    estado: "apagado" as Rele["estado"],
    modo: "manual" as Rele["modo"],
    cultivo_asociado: "Ninguno",
    descripcion: "",
    coordenadas: { lat: 19.8103, lng: -100.6142 }, // Maravatio, Michoacán
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [r, c] = await Promise.all([getRelesGlobal(), getCultivosGlobal()]);
      setReles(r);
      setCultivos(c);
    } catch {
      Swal.fire("Error", "No se pudieron sincronizar los relés", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // ── Sync cultivo coordinates with map ─────────────────────────────────
  useEffect(() => {
    if (formulario.cultivo_asociado !== "Ninguno") {
      const cultivo = cultivos.find((c) => c.nombre === formulario.cultivo_asociado);
      if (cultivo) {
        setFormulario((prev) => ({
          ...prev,
          coordenadas: cultivo.coordenadas,
        }));
      }
    }
  }, [formulario.cultivo_asociado, cultivos]);

  const limpiarFormulario = () => {
    setFormulario({ nombre: "", zona: "", estado: "apagado", modo: "manual", cultivo_asociado: "Ninguno", descripcion: "", coordenadas: { lat: 19.8103, lng: -100.6142 } });
    setReleEditando(null);
    setMostrarFormulario(false);
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !formulario.nombre || !formulario.zona) {
      Swal.fire({ title: "Formulario Incompleto", text: "Nombre y zona son obligatorios", icon: "warning", confirmButtonColor: "#10b981" });
      return;
    }
    try {
      await saveReleGlobal({
        ...formulario,
        ultima_activacion: new Date().toISOString(),
        creado_por: nombre,
      }, releEditando ?? undefined);

      Swal.fire({ icon: "success", title: releEditando ? "Relé Actualizado" : "Relé Registrado",
        showConfirmButton: false, timer: 1800 });
      await cargarDatos();
      limpiarFormulario();
    } catch {
      Swal.fire("Error", "Fallo al guardar en la base de datos.", "error");
    }
  };

  const confirmarEliminar = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar este relé?", text: "Esta acción es irreversible.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteReleGlobal(id);
      Swal.fire({ icon: "success", title: "Eliminado", showConfirmButton: false, timer: 1500 });
      await cargarDatos();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el relé.", "error");
    }
  };

  const manejarToggle = async (rele: Rele) => {
    if (!puedeEscribir) return;
    const nuevoEstado = rele.estado === "encendido" ? "apagado" : "encendido";
    try {
      await toggleReleGlobal(rele.id, nuevoEstado);
      setReles((prev) => prev.map((r) =>
        r.id === rele.id ? { ...r, estado: nuevoEstado, ultima_activacion: new Date().toISOString() } : r
      ));
    } catch {
      Swal.fire("Error", "No se pudo cambiar el estado del relé.", "error");
    }
  };

  const manejarModo = async (rele: Rele) => {
    if (!puedeEscribir) return;
    const nuevoModo: Rele["modo"] = rele.modo === "manual" ? "automatico" : "manual";
    try {
      await saveReleGlobal({ ...rele, modo: nuevoModo }, rele.id);
      setReles((prev) => prev.map((r) =>
        r.id === rele.id ? { ...r, modo: nuevoModo } : r
      ));
    } catch {
      Swal.fire("Error", "No se pudo cambiar el modo del relé.", "error");
    }
  };

  const relesFiltrados = useMemo(() => reles.filter((r) => {
    const matchBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchZona = filtroZona === "Todas" || r.zona === filtroZona;
    return matchBusqueda && matchZona;
  }), [reles, busqueda, filtroZona]);

  const stats = useMemo(() => ({
    total: reles.length,
    encendidos: reles.filter((r) => r.estado === "encendido").length,
    automaticos: reles.filter((r) => r.modo === "automatico").length,
    zonas: new Set(reles.map((r) => r.zona)).size,
  }), [reles]);

  const relesPorZona = useMemo(() => relesFiltrados.reduce((acc, r) => {
    if (!acc[r.zona]) acc[r.zona] = [];
    acc[r.zona].push(r);
    return acc;
  }, {} as Record<string, Rele[]>), [relesFiltrados]);

  if (!uid) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 p-8 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 font-bold">Por favor inicia sesión</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 p-4 md:p-8 space-y-8">

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-xl shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Control de Relés</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <User className="w-3.5 h-3.5" /> {nombre}
              </span>
              {rol && (
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${ROL_COLOR[rol] ?? ""}`}>
                  {rol}
                </span>
              )}
              {!puedeEscribir && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Solo lectura
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar relé..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-700 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-amber-500 rounded-xl outline-none transition-all w-full sm:w-64 text-sm"
            />
          </div>
          <select
            value={filtroZona}
            onChange={(e) => setFiltroZona(e.target.value)}
            className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-amber-500 rounded-xl outline-none transition-all text-sm font-medium"
          >
            <option value="Todas">Todas las Zonas</option>
            {ZONAS.map((z) => <option key={z} value={z}>Zona {z}</option>)}
          </select>
          {puedeEscribir && (
            <button
              onClick={() => { limpiarFormulario(); setMostrarFormulario(!mostrarFormulario); }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-100 dark:shadow-amber-900/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> {mostrarFormulario ? "Cerrar" : "Nuevo Relé"}
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Relés Totales",   val: stats.total,       icon: Cpu,      color: "from-amber-500 to-orange-600" },
          { label: "Encendidos",      val: stats.encendidos,  icon: Power,    color: "from-emerald-500 to-green-600" },
          { label: "Modo Automático", val: stats.automaticos, icon: Settings, color: "from-blue-500 to-indigo-600" },
          { label: "Zonas Activas",   val: stats.zonas,       icon: MapPin,   color: "from-purple-500 to-fuchsia-600" },
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.color} p-1 rounded-2xl shadow-lg`}>
            <div className="bg-white/95 backdrop-blur-sm dark:bg-slate-800/95 p-6 rounded-[14px] h-full">
              <item.icon className="w-8 h-8 mb-4 text-gray-800 dark:text-gray-200" />
              <p className="text-4xl font-black text-gray-900 dark:text-white">{item.val}</p>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Formulario */}
      {mostrarFormulario && (
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-amber-100 dark:border-amber-900/40 overflow-hidden animate-in slide-in-from-top duration-500">
          <div className="bg-amber-500 px-8 py-4 flex items-center text-white gap-2">
            {releEditando ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <h2 className="text-lg font-bold">
              {releEditando ? "Editar Relé" : "Registrar Nuevo Relé"}
            </h2>
          </div>
          <form onSubmit={manejarGuardar} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Relé *</label>
              <input
                type="text"
                placeholder="Ej: Relé Riego Norte"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Zona *</label>
              <select
                value={formulario.zona}
                onChange={(e) => setFormulario({ ...formulario, zona: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">Seleccione zona</option>
                {ZONAS.map((z) => <option key={z} value={z}>Zona {z}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cultivo Asociado</label>
              <select
                value={formulario.cultivo_asociado}
                onChange={(e) => setFormulario({ ...formulario, cultivo_asociado: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Ninguno">Sin cultivo</option>
                {cultivos.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
              <input
                type="text"
                placeholder="Ej: Controla el sistema de riego por goteo"
                value={formulario.descripcion}
                onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación del Relé (Lat: {formulario.coordenadas.lat.toFixed(4)}, Lng: {formulario.coordenadas.lng.toFixed(4)})
              </label>
              <p className="text-xs text-gray-500 italic">Haz click en el mapa para seleccionar la ubicación</p>
              <MapaSelectorUbicacion 
                coordenadas={formulario.coordenadas}
                onChange={(coords) => setFormulario({ ...formulario, coordenadas: coords })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Estado Inicial</label>
              <div className="flex gap-3">
                {(["encendido", "apagado"] as const).map((est) => (
                  <button key={est} type="button"
                    onClick={() => setFormulario({ ...formulario, estado: est })}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                      formulario.estado === est
                        ? est === "encendido"
                          ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                          : "bg-red-50 border-red-500 text-red-600"
                        : "bg-white dark:bg-slate-700 border-gray-100 dark:border-slate-600 text-gray-400"
                    }`}>
                    {est.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Modo de Operación</label>
              <div className="flex gap-3">
                {(["manual", "automatico"] as const).map((m) => (
                  <button key={m} type="button"
                    onClick={() => setFormulario({ ...formulario, modo: m })}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                      formulario.modo === m
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "bg-white dark:bg-slate-700 border-gray-100 dark:border-slate-600 text-gray-400"
                    }`}>
                    {m === "automatico" ? "AUTOMÁTICO" : "MANUAL"}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-50 dark:border-slate-700">
              <button type="button" onClick={limpiarFormulario}
                className="px-8 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button type="submit"
                className="px-10 py-3 bg-amber-500 text-white rounded-xl font-black shadow-lg shadow-amber-100 dark:shadow-amber-900/20 hover:bg-amber-600 transition-all">
                {releEditando ? "ACTUALIZAR" : "REGISTRAR RELÉ"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Listado */}
      <section className="space-y-8">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-bold animate-pulse">Sincronizando relés...</p>
          </div>
        ) : Object.keys(relesPorZona).length > 0 ? (
          Object.entries(relesPorZona).map(([zona, lista]) => (
            <div key={zona} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-gray-50/80 dark:bg-slate-700 px-6 py-4 border-b border-gray-100 dark:border-slate-600 flex items-center justify-between">
                <h3 className="flex items-center gap-3 font-black text-gray-800 dark:text-white">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  ZONA {zona.toUpperCase()}
                </h3>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">
                  {lista.length} {lista.length === 1 ? "RELÉ" : "RELÉS"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                {lista.map((rele) => (
                  <div key={rele.id}
                    className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                      rele.estado === "encendido"
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}>

                    {/* Active glow strip */}
                    {rele.estado === "encendido" && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
                    )}

                    <div className="p-5 space-y-4">
                      {/* Top row: name + toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 dark:text-white text-base leading-tight truncate">{rele.nombre}</p>
                          <p className="text-xs text-gray-400 font-bold mt-0.5">ID: #{rele.id.slice(-6)}</p>
                        </div>

                        {/* Power toggle switch */}
                        <button
                          onClick={() => manejarToggle(rele)}
                          disabled={!puedeEscribir}
                          title={!puedeEscribir ? "Sin permisos" : rele.estado === "encendido" ? "Apagar" : "Encender"}
                          className={`flex-shrink-0 relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            rele.estado === "encendido"
                              ? "bg-emerald-500 focus:ring-emerald-400"
                              : "bg-gray-300 dark:bg-slate-600 focus:ring-gray-400"
                          }`}
                        >
                          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                            rele.estado === "encendido" ? "left-7" : "left-0.5"
                          }`} />
                          <Power className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-all duration-300 ${
                            rele.estado === "encendido" ? "left-2 text-white" : "right-2 text-gray-400"
                          }`} />
                        </button>
                      </div>

                      {/* Description */}
                      {rele.descripcion && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{rele.descripcion}</p>
                      )}

                      {/* Cultivo asociado */}
                      {rele.cultivo_asociado && rele.cultivo_asociado !== "Ninguno" && (
                        <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg w-fit">
                          <Zap className="w-3 h-3" />
                          {rele.cultivo_asociado}
                        </div>
                      )}

                      {/* Status row */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                            rele.estado === "encendido"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              rele.estado === "encendido" ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                            }`} />
                            {rele.estado}
                          </span>

                          {/* Mode badge + toggle */}
                          <button
                            onClick={() => manejarModo(rele)}
                            title="Cambiar modo"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all hover:scale-105 ${
                              rele.modo === "automatico"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                            }`}>
                            <Settings className="w-3 h-3" />
                            {rele.modo === "automatico" ? "AUTO" : "MANUAL"}
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {puedeEscribir && (
                            <button
                              onClick={() => {
                                setFormulario({
                                  nombre: rele.nombre, zona: rele.zona,
                                  estado: rele.estado, modo: rele.modo,
                                  cultivo_asociado: rele.cultivo_asociado,
                                  descripcion: rele.descripcion,
                                  coordenadas: rele.coordenadas || { lat: 19.8103, lng: -100.6142 },
                                });
                                setReleEditando(rele.id);
                                setMostrarFormulario(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button
                              onClick={() => confirmarEliminar(rele.id)}
                              className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Last activation */}
                      {rele.ultima_activacion && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Clock className="w-3 h-3" />
                          Última activación: {format(new Date(rele.ultima_activacion), "dd/MM/yyyy HH:mm", { locale: es })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-20 text-center border-2 border-dashed border-gray-100 dark:border-slate-700">
            <div className="bg-gray-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white">No se encontraron relés</h3>
            <p className="text-gray-400 mt-2 max-w-xs mx-auto">Registra tu primer relé con el botón "Nuevo Relé".</p>
          </div>
        )}
      </section>
    </div>
  );
}
