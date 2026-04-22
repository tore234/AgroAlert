import React, { useState, useEffect, useMemo } from "react";
import {
  Sprout, Plus, MapPin, Calendar, TrendingUp, Edit,
  Trash2, Search, CheckCircle2, Leaf, BarChart3, LocateFixed, Loader2,
  User, ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  getCultivosGlobal, saveCultivoGlobal, deleteCultivoGlobal, Cultivo,
} from "../../services/firestoreService";

const ROL_COLOR: Record<string, string> = {
  administrador: "bg-purple-100 text-purple-700",
  operador:      "bg-blue-100 text-blue-700",
  consultor:     "bg-emerald-100 text-emerald-700",
};

export function GestionCultivos() {
  const { uid, nombre, rol } = useCurrentUser();

  const puedeEscribir = rol === "administrador" || rol === "operador";
  const puedeEliminar = rol === "administrador";

  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cultivoEditando, setCultivoEditando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroZona, setFiltroZona] = useState("Todas");

  const [formulario, setFormulario] = useState({
    nombre: "", zona: "", hectareas: 0, fechaSiembra: "",
    estado: "activo" as Cultivo["estado"],
    lat: "", lng: "",
  });
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      setCultivos(await getCultivosGlobal());
    } catch {
      Swal.fire("Error", "No se pudieron sincronizar los datos", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const limpiarFormulario = () => {
    setFormulario({ nombre: "", zona: "", hectareas: 0, fechaSiembra: "", estado: "activo", lat: "", lng: "" });
    setCultivoEditando(null);
    setMostrarFormulario(false);
  };

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      Swal.fire("Sin soporte", "Tu navegador no soporta geolocalización.", "warning");
      return;
    }
    setBuscandoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormulario((f) => ({ ...f, lat: coords.latitude.toFixed(6), lng: coords.longitude.toFixed(6) }));
        setBuscandoUbicacion(false);
      },
      () => {
        Swal.fire("Sin permiso", "Activa el permiso de ubicación en tu navegador.", "error");
        setBuscandoUbicacion(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !formulario.nombre || !formulario.zona || formulario.hectareas <= 0 || !formulario.fechaSiembra) {
      Swal.fire({ title: "¡Formulario Incompleto!", text: "Llena todos los campos", icon: "warning", confirmButtonColor: "#10b981" });
      return;
    }
    const lat = parseFloat(formulario.lat);
    const lng = parseFloat(formulario.lng);
    if (!formulario.lat || !formulario.lng || isNaN(lat) || isNaN(lng)) {
      Swal.fire({ title: "Ubicación requerida", text: "Agrega las coordenadas del cultivo o usa tu ubicación actual.", icon: "warning", confirmButtonColor: "#10b981" });
      return;
    }
    try {
      await saveCultivoGlobal({
        nombre:       formulario.nombre,
        zona:         formulario.zona,
        hectareas:    formulario.hectareas,
        fechaSiembra: formulario.fechaSiembra,
        estado:       formulario.estado,
        coordenadas:  { lat, lng },
        creado_por:   nombre,
      }, cultivoEditando ?? undefined);

      Swal.fire({ icon: "success", title: cultivoEditando ? "Registro Actualizado" : "Cultivo Registrado",
        text: "AgroAlert guardó los cambios.", showConfirmButton: false, timer: 2000 });
      await cargarDatos();
      limpiarFormulario();
    } catch {
      Swal.fire("Error", "Fallo al guardar en la base de datos.", "error");
    }
  };

  const confirmarEliminar = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Deseas eliminar este registro?", text: "Esta acción es irreversible.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteCultivoGlobal(id);
      Swal.fire("¡Eliminado!", "Cultivo removido correctamente.", "success");
      await cargarDatos();
    } catch { Swal.fire("Error", "No se pudo procesar la eliminación.", "error"); }
  };

  const cultivosFiltrados = useMemo(() => cultivos.filter((c) => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchZona = filtroZona === "Todas" || c.zona === filtroZona;
    return matchBusqueda && matchZona;
  }), [cultivos, busqueda, filtroZona]);

  const stats = useMemo(() => ({
    total: cultivos.length,
    hectareas: cultivos.reduce((s, c) => s + c.hectareas, 0),
    enCosecha: cultivos.filter((c) => c.estado === "cosecha").length,
    zonas: new Set(cultivos.map((c) => c.zona)).size,
  }), [cultivos]);

  const cultivosPorZona = useMemo(() => cultivosFiltrados.reduce((acc, c) => {
    if (!acc[c.zona]) acc[c.zona] = [];
    acc[c.zona].push(c);
    return acc;
  }, {} as Record<string, Cultivo[]>), [cultivosFiltrados]);

  if (!uid) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 p-4 md:p-8 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 font-bold">Por favor inicia sesión</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 p-4 md:p-8 space-y-8">

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="bg-green-600 p-3 rounded-xl shadow-lg shadow-green-200">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Gestión de Cultivos</h1>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input type="text" placeholder="Buscar cultivo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-700 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-green-500 rounded-xl outline-none transition-all w-full sm:w-64 text-sm" />
          </div>
          <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)}
            className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-green-500 rounded-xl outline-none transition-all text-sm font-medium">
            <option value="Todas">Todas las Zonas</option>
            {["Norte","Sur","Este","Oeste","Centro"].map((z) => <option key={z} value={z}>Zona {z}</option>)}
          </select>
          {puedeEscribir && (
            <button onClick={() => { limpiarFormulario(); setMostrarFormulario(!mostrarFormulario); }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-100 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> {mostrarFormulario ? "Cerrar" : "Nuevo Registro"}
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Cultivos Totales",    val: stats.total,        icon: Sprout,    color: "from-green-500 to-emerald-600" },
          { label: "Hectáreas Activas",   val: `${stats.hectareas} ha`, icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
          { label: "Zonas Operativas",    val: stats.zonas,        icon: MapPin,    color: "from-orange-500 to-amber-600" },
          { label: "Listos para Cosecha", val: stats.enCosecha,   icon: BarChart3, color: "from-purple-500 to-fuchsia-600" },
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.color} p-1 rounded-2xl shadow-lg`}>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[14px] h-full">
              <item.icon className="w-8 h-8 mb-4 text-gray-800" />
              <p className="text-4xl font-black text-gray-900">{item.val}</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Formulario */}
      {mostrarFormulario && (
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-green-100 dark:border-green-900 overflow-hidden animate-in slide-in-from-top duration-500">
          <div className="bg-green-600 px-8 py-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              {cultivoEditando ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {cultivoEditando ? "Editando Cultivo" : "Alta de Nuevo Cultivo"}
            </h2>
          </div>
          <form onSubmit={manejarGuardar} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Nombre del Cultivo *", type: "text",   key: "nombre",      placeholder: "Ej: Tomate Saladette" },
              { label: "Fecha de Inicio *",    type: "date",   key: "fechaSiembra",placeholder: "" },
            ].map(({ label, type, key, placeholder }) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
                <input type={type} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={(formulario as any)[key]}
                  onChange={(e) => setFormulario({ ...formulario, [key]: e.target.value })}
                  placeholder={placeholder} />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Zona de Siembra *</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={formulario.zona} onChange={(e) => setFormulario({ ...formulario, zona: e.target.value })}>
                <option value="">Seleccione ubicación</option>
                {["Norte","Sur","Este","Oeste","Centro"].map((z) => <option key={z} value={z}>Sector {z}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Superficie (ha) *</label>
              <input type="number" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                value={formulario.hectareas || ""}
                onChange={(e) => setFormulario({ ...formulario, hectareas: Number(e.target.value) })}
                placeholder="0.00" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Estado *</label>
              <div className="flex gap-4">
                {(["activo","en_desarrollo","cosecha"] as const).map((est) => (
                  <button key={est} type="button" onClick={() => setFormulario({ ...formulario, estado: est })}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${formulario.estado === est ? "bg-green-50 border-green-600 text-green-700 shadow-inner" : "bg-white dark:bg-slate-700 border-gray-100 dark:border-slate-600 text-gray-400 hover:border-gray-200"}`}>
                    {est.replace("_"," ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordenadas */}
            <div className="md:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Ubicación GPS *
                </label>
                <button
                  type="button"
                  onClick={usarUbicacionActual}
                  disabled={buscandoUbicacion}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  {buscandoUbicacion
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <LocateFixed className="w-3.5 h-3.5" />}
                  {buscandoUbicacion ? "Obteniendo..." : "Usar ubicación actual"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Latitud</label>
                  <input
                    type="number" step="any"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Ej: 20.456789"
                    value={formulario.lat}
                    onChange={(e) => setFormulario({ ...formulario, lat: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Longitud</label>
                  <input
                    type="number" step="any"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Ej: -100.345678"
                    value={formulario.lng}
                    onChange={(e) => setFormulario({ ...formulario, lng: e.target.value })}
                  />
                </div>
              </div>
              {formulario.lat && formulario.lng && (
                <p className="text-[11px] text-emerald-600 font-bold ml-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {parseFloat(formulario.lat).toFixed(5)}, {parseFloat(formulario.lng).toFixed(5)}
                </p>
              )}
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-50 dark:border-slate-700">
              <button type="button" onClick={limpiarFormulario}
                className="px-8 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button type="submit"
                className="px-10 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
                {cultivoEditando ? "ACTUALIZAR" : "REGISTRAR EN AGROALERT"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Listado */}
      <section className="space-y-8">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-bold animate-pulse">Sincronizando con AgroAlert...</p>
          </div>
        ) : Object.keys(cultivosPorZona).length > 0 ? (
          Object.entries(cultivosPorZona).map(([zona, lista]) => (
            <div key={zona} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-gray-50/80 dark:bg-slate-700 px-6 py-4 border-b border-gray-100 dark:border-slate-600 flex items-center justify-between">
                <h3 className="flex items-center gap-3 font-black text-gray-800 dark:text-white">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  ZONA {zona.toUpperCase()}
                </h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">{lista.length} CULTIVOS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-700">
                      <th className="px-6 py-4">Cultivo</th>
                      <th className="px-6 py-4">Superficie</th>
                      <th className="px-6 py-4">Fecha Inicio</th>
                      <th className="px-6 py-4">Coordenadas</th>
                      <th className="px-6 py-4">Estatus</th>
                      <th className="px-6 py-4 text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                    {lista.map((c) => (
                      <tr key={c.id} className="group hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-black text-gray-900 dark:text-white text-base">{c.nombre}</p>
                          <p className="text-xs text-gray-400 font-bold">ID: #{c.id.slice(-6)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{c.hectareas} ha</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(c.fechaSiembra), "dd MMMM yyyy", { locale: es })}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {c.coordenadas?.lat && c.coordenadas?.lng ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                              <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                              {c.coordenadas.lat.toFixed(4)}, {c.coordenadas.lng.toFixed(4)}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Sin ubicación</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                            c.estado === "cosecha" ? "bg-orange-100 text-orange-700" :
                            c.estado === "activo"  ? "bg-green-100 text-green-700" :
                            "bg-blue-100 text-blue-700"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${c.estado === "cosecha" ? "bg-orange-500" : "bg-green-500"}`} />
                            {c.estado.replace("_"," ")}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {puedeEscribir && (
                              <button onClick={() => {
                                setFormulario({ nombre: c.nombre, zona: c.zona, hectareas: c.hectareas, fechaSiembra: c.fechaSiembra, estado: c.estado, lat: String(c.coordenadas.lat), lng: String(c.coordenadas.lng) });
                                setCultivoEditando(c.id); setMostrarFormulario(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            {puedeEliminar && (
                              <button onClick={() => confirmarEliminar(c.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                            {!puedeEscribir && (
                              <span className="text-xs text-gray-300 italic px-2">Sin permisos</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-20 text-center border-2 border-dashed border-gray-100 dark:border-slate-700">
            <div className="bg-gray-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white">No se encontraron cultivos</h3>
            <p className="text-gray-400 mt-2 max-w-xs mx-auto">Registra tu primer cultivo con el botón "Nuevo Registro".</p>
          </div>
        )}
      </section>
    </div>
  );
}
