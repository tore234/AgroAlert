import React, { useState, useEffect, useMemo } from "react";
import { 
  Sprout, Plus, MapPin, Calendar, TrendingUp, Edit, 
  Trash2, Filter, Search, Download, ChevronRight, 
  AlertCircle, CheckCircle2, Leaf, BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface Cultivo {
  id: string;
  nombre: string;
  zona: string;
  hectareas: number;
  fechaSiembra: string;
  estado: "activo" | "en_desarrollo" | "cosecha";
  coordenadas: { lat: number; lng: number };
}

export function GestionCultivos() {
  // --- ESTADOS ---
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cultivoEditando, setCultivoEditando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroZona, setFiltroZona] = useState("Todas");

  const [formulario, setFormulario] = useState({
    nombre: "",
    zona: "",
    hectareas: 0,
    fechaSiembra: "",
    estado: "activo" as "activo" | "en_desarrollo" | "cosecha",
  });

  const API_URL = 'http://localhost/apis/gestion_cultivos.php';

  // --- 1. CARGA DE DATOS (READ) ---
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error en la red");
      const data = await response.json();
      
      const datosFormateados = data.map((c: any) => ({
        id: c.id.toString(),
        nombre: c.nombre_cultivo,
        zona: c.zona,
        hectareas: Number(c.hectareas),
        fechaSiembra: c.fecha_siembra,
        estado: c.estado,
        coordenadas: c.coordenadas ? JSON.parse(c.coordenadas) : { lat: 20.4, lng: -100.3 }
      }));
      
      setCultivos(datosFormateados);
    } catch (error) {
      console.error("Error al conectar con AgroAlert:", error);
      Swal.fire("Error", "No se pudieron sincronizar los datos del servidor", "error");
    } finally {
      setTimeout(() => setCargando(false), 500);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- 2. LÓGICA DE FORMULARIO (CREATE & UPDATE) ---
  const limpiarFormulario = () => {
    setFormulario({ nombre: "", zona: "", hectareas: 0, fechaSiembra: "", estado: "activo" });
    setCultivoEditando(null);
    setMostrarFormulario(false);
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.nombre || !formulario.zona || formulario.hectareas <= 0 || !formulario.fechaSiembra) {
      Swal.fire({
        title: "¡Formulario Incompleto!",
        text: "Asegúrate de llenar todos los campos",
        icon: "warning",
        confirmButtonColor: "#10b981"
      });
      return;
    }

    try {
      const payload = {
        id: cultivoEditando,
        nombre_cultivo: formulario.nombre,
        zona: formulario.zona,
        hectareas: formulario.hectareas,
        fecha_siembra: formulario.fechaSiembra,
        estado: formulario.estado,
        coordenadas: JSON.stringify({ lat: 20.4, lng: -100.3 })
      };

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: cultivoEditando ? 'Registro Actualizado' : 'Cultivo Registrado',
          text: `El sistema AgroAlert ha guardado los cambios con éxito.`,
          showConfirmButton: false,
          timer: 2000
        });
        cargarDatos();
        limpiarFormulario();
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un fallo al intentar guardar en la base de datos.", "error");
    }
  };

  // --- 3. ELIMINACIÓN (DELETE) ---
  const confirmarEliminar = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Deseas eliminar este registro?",
      text: "Esta acción es irreversible en la base de datos de AgroAlert.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar ahora",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          Swal.fire("¡Eliminado!", "El cultivo ha sido removido correctamente.", "success");
          cargarDatos();
        }
      } catch (error) {
        Swal.fire("Error", "No se pudo procesar la eliminación.", "error");
      }
    }
  };

  // --- 4. CÁLCULOS Y FILTROS ---
  const cultivosFiltrados = useMemo(() => {
    return cultivos.filter(c => {
      const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchZona = filtroZona === "Todas" || c.zona === filtroZona;
      return matchBusqueda && matchZona;
    });
  }, [cultivos, busqueda, filtroZona]);

  const stats = useMemo(() => ({
    total: cultivos.length,
    hectareas: cultivos.reduce((s, c) => s + c.hectareas, 0),
    enCosecha: cultivos.filter(c => c.estado === "cosecha").length,
    zonas: new Set(cultivos.map(c => c.zona)).size
  }), [cultivos]);

  const cultivosPorZona = useMemo(() => {
    return cultivosFiltrados.reduce((acc, c) => {
      if (!acc[c.zona]) acc[c.zona] = [];
      acc[c.zona].push(c);
      return acc;
    }, {} as Record<string, Cultivo[]>);
  }, [cultivosFiltrados]);

  // --- RENDIZADO ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      
      {/* SECCIÓN 1: HEADER & ACCIONES PRINCIPALES */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-green-600 p-3 rounded-xl shadow-lg shadow-green-200">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">AgroAlert</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Sistema de Gestión de Cultivos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar cultivo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-green-500 rounded-xl outline-none transition-all w-full sm:w-64 text-sm"
            />
          </div>
          <button
            onClick={() => { limpiarFormulario(); setMostrarFormulario(!mostrarFormulario); }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> {mostrarFormulario ? "Cerrar" : "Nuevo Registro"}
          </button>
        </div>
      </header>

      {/* SECCIÓN 2: DASHBOARD DE ESTADÍSTICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Cultivos Totales", val: stats.total, icon: Sprout, color: "from-green-500 to-emerald-600" },
          { label: "Hectáreas Activas", val: `${stats.hectareas} ha`, icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
          { label: "Zonas Operativas", val: stats.zonas, icon: MapPin, color: "from-orange-500 to-amber-600" },
          { label: "Listos para Cosecha", val: stats.enCosecha, icon: BarChart3, color: "from-purple-500 to-fuchsia-600" },
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.color} p-1 rounded-2xl shadow-lg`}>
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[14px] h-full">
              <item.icon className={`w-8 h-8 mb-4 text-gray-800`} />
              <p className="text-4xl font-black text-gray-900">{item.val}</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* SECCIÓN 3: FORMULARIO DE REGISTRO */}
      {mostrarFormulario && (
        <section className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden animate-in slide-in-from-top duration-500">
          <div className="bg-green-600 px-8 py-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              {cultivoEditando ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {cultivoEditando ? "Editando Información de Cultivo" : "Alta de Nuevo Cultivo AgroAlert"}
            </h2>
          </div>
          
          <form onSubmit={manejarGuardar} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Cultivo *</label>
              <input 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formulario.nombre}
                onChange={e => setFormulario({...formulario, nombre: e.target.value})}
                placeholder="Ej: Tomate Saladette"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Zona de Siembra *</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formulario.zona}
                onChange={e => setFormulario({...formulario, zona: e.target.value})}
              >
                <option value="">Seleccione ubicación</option>
                <option value="Norte">Sector Norte</option>
                <option value="Sur">Sector Sur</option>
                <option value="Este">Sector Este</option>
                <option value="Oeste">Sector Oeste</option>
                <option value="Centro">Sector Centro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Superficie Total (ha) *</label>
              <input 
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formulario.hectareas || ""}
                onChange={e => setFormulario({...formulario, hectareas: Number(e.target.value)})}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Inicio *</label>
              <input 
                type="date"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formulario.fechaSiembra}
                onChange={e => setFormulario({...formulario, fechaSiembra: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Estado de Desarrollo *</label>
              <div className="flex gap-4">
                {(['activo', 'en_desarrollo', 'cosecha'] as const).map((est) => (
                  <button
                    key={est}
                    type="button"
                    onClick={() => setFormulario({...formulario, estado: est})}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                      formulario.estado === est 
                      ? "bg-green-50 border-green-600 text-green-700 shadow-inner" 
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    {est.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button 
                type="button" 
                onClick={limpiarFormulario}
                className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar Operación
              </button>
              <button 
                type="submit"
                className="px-10 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
              >
                {cultivoEditando ? "ACTUALIZAR DATOS" : "REGISTRAR EN AGROALERT"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* SECCIÓN 4: LISTADO DE CULTIVOS POR ZONA */}
      <section className="space-y-8">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold animate-pulse">Sincronizando con AgroAlert...</p>
          </div>
        ) : Object.keys(cultivosPorZona).length > 0 ? (
          Object.entries(cultivosPorZona).map(([zona, lista]) => (
            <div key={zona} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="flex items-center gap-3 font-black text-gray-800">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  ZONA {zona.toUpperCase()}
                </h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                  {lista.length} CULTIVOS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="px-6 py-4">Información del Cultivo</th>
                      <th className="px-6 py-4">Superficie</th>
                      <th className="px-6 py-4">Fecha de Inicio</th>
                      <th className="px-6 py-4">Estatus Actual</th>
                      <th className="px-6 py-4 text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lista.map((c) => (
                      <tr key={c.id} className="group hover:bg-green-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-black text-gray-900 text-base">{c.nombre}</p>
                          <p className="text-xs text-gray-400 font-bold">ID: #{c.id.slice(-4)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-gray-700">{c.hectareas} ha</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(c.fechaSiembra), "dd MMMM yyyy", { locale: es })}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                            c.estado === 'cosecha' ? 'bg-orange-100 text-orange-700' :
                            c.estado === 'activo' ? 'bg-green-100 text-green-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              c.estado === 'cosecha' ? 'bg-orange-500' : 'bg-green-500'
                            }`} />
                            {c.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setFormulario({
                                  nombre: c.nombre,
                                  zona: c.zona,
                                  hectareas: c.hectareas,
                                  fechaSiembra: c.fechaSiembra,
                                  estado: c.estado
                                });
                                setCultivoEditando(c.id);
                                setMostrarFormulario(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => confirmarEliminar(c.id)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
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
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800">No se encontraron cultivos</h3>
            <p className="text-gray-400 mt-2 max-w-xs mx-auto">
              No hay registros que coincidan con tu búsqueda en AgroAlert. Intenta con otros términos.
            </p>
          </div>
        )}
      </section>

      {/* FOOTER INFORMATIVO */}
      <footer className="text-center py-10">
        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">
         
        </p>
      </footer>
    </div>
  );
}