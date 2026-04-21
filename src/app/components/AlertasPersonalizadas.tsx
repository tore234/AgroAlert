import { Bell, Plus, Settings, AlertTriangle } from "lucide-react";
import { cultivos } from "../data/mockData";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth";
import {
  getAlertasConfig, saveAlertaConfig, deleteAlertaConfig,
  getAlertasHistorial, addAlertaHistorial, deleteAlertasHistorialByCultivo,
  ConfigAlerta, AlertaHistorial,
} from "../../services/firestoreService";

const tipoIcons: Record<string, string> = {
  helada: "❄️", lluvia: "🌧️", sequia: "☀️", viento: "💨", granizo: "🌨️",
};
const coloresPastel: Record<string, string> = {
  helada:  "bg-blue-50/50 border-blue-100",
  lluvia:  "bg-cyan-50/50 border-cyan-100",
  sequia:  "bg-orange-50/50 border-orange-100",
  viento:  "bg-slate-50/50 border-slate-100",
  granizo: "bg-indigo-50/50 border-indigo-100",
};
const BLANK = { cultivo: "", zona: "", tipoAlerta: [] as string[], umbralTemp: 5, umbralLluvia: 50 };

export function AlertasPersonalizadas() {
  const { uid } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [historial, setHistorial] = useState<AlertaHistorial[]>([]);
  const [configuraciones, setConfiguraciones] = useState<ConfigAlerta[]>([]);
  const [nueva, setNueva] = useState({ ...BLANK });

  const cargar = async () => {
    if (!uid) return;
    const [configs, hist] = await Promise.all([
      getAlertasConfig(uid), getAlertasHistorial(uid),
    ]);
    setConfiguraciones(configs);
    setHistorial(hist);
  };

  useEffect(() => { cargar(); }, [uid]);
  useEffect(() => {
    if (!uid) return;
    const t = setInterval(() => getAlertasHistorial(uid).then(setHistorial), 30_000);
    return () => clearInterval(t);
  }, [uid]);

  const cancelar = () => { setMostrarFormulario(false); setEditandoId(null); setNueva({ ...BLANK }); };

  const prepararEdicion = (c: ConfigAlerta) => {
    setEditandoId(c.id);
    setNueva({ cultivo: c.cultivo, zona: c.zona, tipoAlerta: c.tipoAlerta, umbralTemp: c.umbralTemp, umbralLluvia: c.umbralLluvia });
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = async () => {
    if (!uid || !nueva.cultivo || !nueva.zona || nueva.tipoAlerta.length === 0) {
      Swal.fire("Campos incompletos", "Llena todos los datos", "warning"); return;
    }
    try {
      await saveAlertaConfig(uid, nueva, editandoId ?? undefined);
      if (!editandoId) {
        await addAlertaHistorial(uid, {
          nombre_cultivo: nueva.cultivo,
          tipo_evento: nueva.tipoAlerta[0],
          zona: nueva.zona,
          valor_clima: nueva.tipoAlerta[0] === "lluvia" ? nueva.umbralLluvia : nueva.umbralTemp,
          fecha_deteccion: new Date().toISOString(),
        });
      }
      Swal.fire({ title: editandoId ? "¡Actualizado!" : "¡Guardado!", text: "Cambios guardados en AgroAlert", icon: "success", confirmButtonColor: "#77dd77", timer: 2000 });
      await cargar();
      cancelar();
    } catch {
      Swal.fire("Error", "No se pudo guardar. Verifica tu conexión.", "error");
    }
  };

  const eliminar = async (id: string, cultivo: string) => {
    const confirm = await Swal.fire({
      title: "¿Estás segura?", text: `Se eliminará la configuración de ${cultivo}`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed || !uid) return;
    try {
      await Promise.all([deleteAlertaConfig(uid, id), deleteAlertasHistorialByCultivo(uid, cultivo)]);
      Swal.fire("Eliminado", "Configuración borrada.", "success");
      await cargar();
    } catch { Swal.fire("Error", "No se pudo eliminar.", "error"); }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-gutter-sm">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
        <div className="min-w-0">
          <h1 className="font-bold text-lg xs:text-xl sm:text-2xl text-gray-900 dark:text-white uppercase tracking-tight truncate">Alertas Personalizadas</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm truncate">Monitoreo en tiempo real · AgroAlert</p>
        </div>
        {!mostrarFormulario && (
          <button onClick={() => setMostrarFormulario(true)}
            className="w-full xs:w-auto flex items-center justify-center gap-2 px-4 xs:px-6 py-2 xs:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg xs:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md font-bold uppercase text-xs xs:text-sm flex-shrink-0">
            <Plus className="w-4 h-4 xs:w-5 xs:h-5" />
            <span className="hidden xs:inline">Nueva Alerta</span><span className="xs:hidden">Alerta</span>
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <div className="bg-white dark:bg-slate-800 rounded-lg xs:rounded-xl shadow-lg p-4 xs:p-5 sm:p-6 border-2 border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3 xs:mb-4 text-base xs:text-lg sm:text-xl">{editandoId ? "📝 Editar Alerta" : "➕ Nueva Alerta"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Cultivo</label>
              <select value={nueva.cultivo} onChange={(e) => setNueva({ ...nueva, cultivo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium">
                <option value="">Seleccionar cultivo</option>
                {cultivos.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Zona</label>
              <select value={nueva.zona} onChange={(e) => setNueva({ ...nueva, zona: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium">
                <option value="">Seleccionar zona</option>
                {["Norte","Sur","Este","Oeste","Centro"].map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Tipo de Alerta</label>
              <div className="flex flex-wrap gap-2">
                {["helada","lluvia","sequia","viento","granizo"].map((tipo) => (
                  <button key={tipo} onClick={() => setNueva({ ...nueva, tipoAlerta: [tipo] })}
                    className={`px-4 py-2 rounded-lg font-bold transition-all uppercase text-xs ${nueva.tipoAlerta.includes(tipo) ? "bg-green-500 text-white shadow-sm" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200"}`}>
                    {tipoIcons[tipo]} {tipo}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Umbral Temp (°C)</label>
              <input type="number" value={nueva.umbralTemp} onChange={(e) => setNueva({ ...nueva, umbralTemp: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Umbral Lluvia (mm)</label>
              <input type="number" value={nueva.umbralLluvia} onChange={(e) => setNueva({ ...nueva, umbralLluvia: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button onClick={guardar} className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold uppercase text-sm transition-colors shadow-sm">
              {editandoId ? "Actualizar Cambios" : "Guardar Configuración"}
            </button>
            <button onClick={cancelar} className="px-8 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 font-bold uppercase text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="font-bold text-gray-900 dark:text-white text-lg uppercase">Historial ({historial.length})</h2>
        </div>
        <div className="space-y-3">
          {historial.length > 0 ? historial.map((a) => {
            const tk = a.tipo_evento.toLowerCase();
            return (
              <div key={a.id} className={`p-4 rounded-lg border-2 shadow-inner hover:scale-[1.01] transition-transform ${coloresPastel[tk] || "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl mt-1">{tipoIcons[tk] || "⚠️"}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 capitalize text-base">{a.tipo_evento} - {a.nombre_cultivo}</h3>
                      <span className="text-xs font-black text-gray-500">{a.valor_clima} {a.tipo_evento === "lluvia" ? "mm" : "°C"}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">Zona {a.zona}.</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                      <span>{format(new Date(a.fecha_deteccion), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
                      <span className="text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded bg-white shadow-sm">REGISTRADO</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400 font-medium">No hay alertas registradas aún.</p>
            </div>
          )}
        </div>
      </div>

      {/* Configuraciones */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-6 h-6 text-green-600" />
          <h2 className="font-bold text-gray-900 dark:text-white text-lg uppercase">Mis Configuraciones ({configuraciones.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configuraciones.map((c) => (
            <div key={c.id} className="p-5 border-2 border-gray-100 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:border-green-200 transition-all relative">
              <div className="absolute top-4 right-4 flex gap-4">
                <button onClick={() => prepararEdicion(c)} className="text-emerald-500 hover:text-emerald-700 text-[11px] font-black uppercase tracking-wider">Editar</button>
                <button onClick={() => eliminar(c.id, c.cultivo)} className="text-red-400 hover:text-red-600 text-[11px] font-black uppercase tracking-wider">Eliminar</button>
              </div>
              <h3 className="font-black text-gray-900 dark:text-white text-xl leading-tight">{c.cultivo}</h3>
              <p className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase">Zona {c.zona}</p>
              <div className="flex flex-wrap gap-1 my-3">
                {c.tipoAlerta.map((t) => (
                  <span key={t} className="px-3 py-1 bg-green-50 text-green-700 text-[9px] font-black rounded-full uppercase border border-green-100 flex items-center gap-1">
                    {tipoIcons[t.toLowerCase()] || "⚠️"} {t}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Temp:</span>
                  <span className="font-black text-blue-700 text-sm">&lt; {c.umbralTemp}°C</span>
                </div>
                <div className="bg-cyan-50/50 p-2.5 rounded-lg border border-cyan-100">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Lluvia:</span>
                  <span className="font-black text-cyan-700 text-sm">&gt; {c.umbralLluvia}mm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
