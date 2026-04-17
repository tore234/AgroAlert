import { Bell, Plus, Settings, AlertTriangle } from "lucide-react";
import { cultivos } from "../data/mockData";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from 'sweetalert2';

const tipoIcons: Record<string, string> = {
  helada: "❄️",
  lluvia: "🌧️",
  sequia: "☀️",
  viento: "💨",
  granizo: "🌨️",
};

const coloresPastel: Record<string, string> = {
  helada: "bg-blue-50/50 border-blue-100", 
  lluvia: "bg-cyan-50/50 border-cyan-100", 
  sequia: "bg-orange-50/50 border-orange-100", 
  viento: "bg-slate-50/50 border-slate-100", 
  granizo: "bg-indigo-50/50 border-indigo-100", 
};

interface ConfigAlerta {
  id: number;
  cultivo: string;
  zona: string;
  tipoAlerta: string[];
  umbralTemp: number;
  umbralLluvia: number;
}

interface AlertaHistorial {
  id: number;
  nombre_cultivo: string;
  tipo_evento: string;
  zona: string;
  valor_clima: number;
  fecha_deteccion: string;
}

export function AlertasPersonalizadas() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [historialReal, setHistorialReal] = useState<AlertaHistorial[]>([]);
  const [configuraciones, setConfiguraciones] = useState<ConfigAlerta[]>([]);

  const [nuevaConfig, setNuevaConfig] = useState({
    cultivo: "",
    zona: "",
    tipoAlerta: [] as string[],
    umbralTemp: 5,
    umbralLluvia: 50,
    notificaciones: true,
  });

  const cargarConfiguraciones = async () => {
    try {
      const res = await fetch("http://localhost/apis/obtener_configuraciones.php");
      const datos = await res.json();
      const formateados = datos.map((c: any) => ({
        id: Number(c.id),
        cultivo: c.cultivo,
        zona: c.zona,
        tipoAlerta: [c.tipo_alerta],
        umbralTemp: Number(c.temp_min),
        umbralLluvia: Number(c.lluvia_max)
      }));
      setConfiguraciones(formateados);
    } catch (error) {
      console.error("Error al cargar configuraciones:", error);
    }
  };

  const obtenerHistorial = async () => {
    try {
      const respuesta = await fetch("http://localhost/apis/obtener_historial.php");
      if (!respuesta.ok) throw new Error("Error de red");
      const datos = await respuesta.json();
      if (Array.isArray(datos)) {
        setHistorialReal(datos);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  useEffect(() => {
    obtenerHistorial();
    cargarConfiguraciones();
    const intervalo = setInterval(obtenerHistorial, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cancelarAccion = () => {
    setMostrarFormulario(false);
    setEditandoId(null);
    setNuevaConfig({
      cultivo: "",
      zona: "",
      tipoAlerta: [],
      umbralTemp: 5,
      umbralLluvia: 50,
      notificaciones: true,
    });
  };

  const prepararEdicion = (config: ConfigAlerta) => {
    setEditandoId(config.id);
    setNuevaConfig({
      cultivo: config.cultivo,
      zona: config.zona,
      tipoAlerta: config.tipoAlerta,
      umbralTemp: config.umbralTemp,
      umbralLluvia: config.umbralLluvia,
      notificaciones: true,
    });
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardarConfiguracion = async () => {
    if (nuevaConfig.cultivo && nuevaConfig.zona && nuevaConfig.tipoAlerta.length > 0) {
      const url = editandoId 
        ? "http://localhost/apis/actualizar_configuracion.php" 
        : "http://localhost/apis/guardar_configuracion.php";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editandoId, 
            cultivo: nuevaConfig.cultivo,
            zona: nuevaConfig.zona,
            tipo_alerta: nuevaConfig.tipoAlerta[0],
            temp_min: nuevaConfig.umbralTemp,
            lluvia_max: nuevaConfig.umbralLluvia
          }),
        });

        const resultado = await response.json();
        if (resultado.success) {
          Swal.fire({
            title: editandoId ? '¡Actualizado!' : '¡Guardado!',
            text: 'Los cambios se han guardado correctamente en AgroAlert',
            icon: 'success',
            confirmButtonColor: '#77dd77',
            timer: 2000
          });
          
          await cargarConfiguraciones();
          await obtenerHistorial();
          cancelarAccion(); 
        }
      } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
      }
    } else {
      Swal.fire('Campos incompletos', 'Por favor llena todos los datos', 'warning');
    }
  };

  const eliminarConfiguracion = async (id: number, nombreCultivo: string) => {
    const confirm = await Swal.fire({
      title: '¿Estás segura?',
      text: `Se eliminará la configuración y el historial de ${nombreCultivo}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar todo',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost/apis/eliminar_configuracion.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, cultivo: nombreCultivo })
        });
        const resultado = await res.json();
        if (resultado.success) {
          Swal.fire('Eliminado', 'La configuración y sus alertas han sido borradas.', 'success');
          cargarConfiguraciones();
          obtenerHistorial();
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const toggleTipoAlerta = (tipo: string) => {
    setNuevaConfig((prev) => ({
      ...prev,
      tipoAlerta: [tipo],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl uppercase tracking-tight">Alertas Personalizadas</h1>
          <p className="text-gray-600">Gestione el monitoreo en tiempo real de AgroAlert</p>
        </div>
        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md font-bold uppercase text-xs"
          >
            <Plus className="w-5 h-5" />
            Nueva Alerta
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="font-bold text-gray-900 mb-4 text-xl">
            {editandoId ? "📝 Editar Alerta" : "➕ Configurar Nueva Alerta"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Cultivo</label>
              <select
                value={nuevaConfig.cultivo}
                onChange={(e) => setNuevaConfig({ ...nuevaConfig, cultivo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium"
              >
                <option value="">Seleccionar cultivo</option>
                {cultivos.map((c) => (
                  <option key={c.id} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Zona</label>
              <select
                value={nuevaConfig.zona}
                onChange={(e) => setNuevaConfig({ ...nuevaConfig, zona: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium"
              >
                <option value="">Seleccionar zona</option>
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
                <option value="Este">Este</option>
                <option value="Oeste">Oeste</option>
                <option value="Centro">Centro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Tipos de Alerta</label>
              <div className="flex flex-wrap gap-2">
                {["helada", "lluvia", "sequia", "viento", "granizo"].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => toggleTipoAlerta(tipo)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all uppercase text-xs ${
                      nuevaConfig.tipoAlerta.includes(tipo)
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {tipoIcons[tipo]} {tipo}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Umbral Temp (°C)</label>
              <input
                type="number"
                value={nuevaConfig.umbralTemp}
                onChange={(e) => setNuevaConfig({ ...nuevaConfig, umbralTemp: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Umbral Lluvia (mm)</label>
              <input
                type="number"
                value={nuevaConfig.umbralLluvia}
                onChange={(e) => setNuevaConfig({ ...nuevaConfig, umbralLluvia: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={guardarConfiguracion}
              className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold uppercase text-sm transition-colors shadow-sm"
            >
              {editandoId ? "Actualizar Cambios" : "Guardar Configuración"}
            </button>
            <button
              onClick={cancelarAccion}
              className="px-8 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold uppercase text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="font-bold text-gray-900 text-lg uppercase">Historial de Alertas ({historialReal.length})</h2>
        </div>
        <div className="space-y-3">
          {historialReal.length > 0 ? (
            historialReal.map((alerta) => {
              const tipoKey = alerta.tipo_evento.toLowerCase();
              const estiloColor = coloresPastel[tipoKey] || "bg-gray-50 border-gray-100";
              const icono = tipoIcons[tipoKey] || "⚠️";

              return (
                <div 
                  key={alerta.id} 
                  className={`p-4 rounded-lg border-2 shadow-inner transition-all duration-500 ease-in-out transform hover:scale-[1.01] ${estiloColor}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-1">{icono}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 capitalize text-base">{alerta.tipo_evento} - {alerta.nombre_cultivo}</h3>
                        <span className="text-xs font-black text-gray-500">{alerta.valor_clima} {alerta.tipo_evento === "lluvia" ? "mm" : "°C"}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 font-medium">Anomalía detectada en Zona {alerta.zona}.</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <span>{format(new Date(alerta.fecha_deteccion), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
                        <span className="text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded bg-white shadow-sm">REGISTRADO</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400 font-medium">No hay alertas registradas aún.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-6 h-6 text-green-600" />
          <h2 className="font-bold text-gray-900 text-lg uppercase">Mis Configuraciones ({configuraciones.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configuraciones.map((config) => (
            <div key={config.id} className="p-5 border-2 border-gray-100 rounded-xl bg-white shadow-sm hover:border-green-200 transition-all relative group">
              <div className="absolute top-4 right-4 flex gap-4">
                <button 
                  onClick={() => prepararEdicion(config)}
                  className="text-emerald-500 hover:text-emerald-700 text-[11px] font-black uppercase tracking-wider"
                >
                  Editar
                </button>
                <button 
                  onClick={() => eliminarConfiguracion(config.id, config.cultivo)} 
                  className="text-red-400 hover:text-red-600 text-[11px] font-black uppercase tracking-wider"
                >
                  Eliminar
                </button>
              </div>
              <div className="mb-4">
                <h3 className="font-black text-gray-900 text-xl leading-tight">{config.cultivo}</h3>
                <p className="text-xs font-bold text-blue-800 uppercase">Zona {config.zona}</p>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {config.tipoAlerta.map((tipo) => (
                  <span key={tipo} className="px-3 py-1 bg-green-50 text-green-700 text-[9px] font-black rounded-full uppercase border border-green-100 flex items-center gap-1">
                    {tipoIcons[tipo.toLowerCase()] || "⚠️"} {tipo}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Temp:</span>
                  <span className="font-black text-blue-700 text-sm">&lt; {config.umbralTemp}°C</span>
                </div>
                <div className="bg-cyan-50/50 p-2.5 rounded-lg border border-cyan-100">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Lluvia:</span>
                  <span className="font-black text-cyan-700 text-sm">&gt; {config.umbralLluvia}mm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}