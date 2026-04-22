import { Users, Plus, Mail, Phone, MapPin, Shield, Edit, Trash2, Search, X, User, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  getPersonalGlobal, savePersonaGlobal, deletePersonaGlobal,
  PerfilUsuario,
  setGlobalEmailRole, removeGlobalEmailRole,
} from "../../services/firestoreService";

const ROL_COLOR = {
  administrador: "bg-purple-100 text-purple-800",
  operador:      "bg-blue-100 text-blue-800",
  consultor:     "bg-green-100 text-green-800",
} as const;

const BLANK: Omit<PerfilUsuario, "uid"> = {
  nombre: "", correo: "", rol: "operador", zona: "", estado: "Activo", fecha_registro: "",
};

export function GestionUsuarios() {
  const { uid, nombre: miNombre, rol: miRol } = useCurrentUser();

  const [personal,   setPersonal]   = useState<PerfilUsuario[]>([]);
  const [busqueda,   setBusqueda]   = useState("");
  const [mostrarForm,setMostrarForm]= useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [filtroRol,  setFiltroRol]  = useState<string | null>(null);
  const [formulario, setFormulario] = useState({ ...BLANK });

  const cargar = async () => {
    try { setPersonal(await getPersonalGlobal()); }
    catch { console.error("Error al obtener personal"); }
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = () => {
    setFormulario({ ...BLANK });
    setEditandoId(null);
    setMostrarForm(false);
  };

  const guardar = async () => {
    if (!formulario.nombre || !formulario.correo || !formulario.zona) {
      Swal.fire("Faltan datos", "Completa nombre, correo y zona", "warning");
      return;
    }
    try {
      const id = editandoId ?? formulario.correo.replace(/[^a-zA-Z0-9]/g, "_");
      const existente = personal.find((p) => p.uid === editandoId);

      await savePersonaGlobal({
        uid:             id,
        nombre:          formulario.nombre,
        correo:          formulario.correo,
        rol:             formulario.rol,
        zona:            formulario.zona,
        estado:          formulario.estado,
        fecha_registro:  existente?.fecha_registro ?? new Date().toISOString(),
      });

      // Sincronizar rol en mapa global para que tome efecto al hacer login
      if (formulario.rol === "administrador" || formulario.rol === "operador") {
        await setGlobalEmailRole(formulario.correo, formulario.rol);
      } else {
        await removeGlobalEmailRole(formulario.correo);
      }

      Swal.fire({ title: editandoId ? "¡Actualizado!" : "¡Registrado!", icon: "success",
        confirmButtonColor: "#10b981" });
      await cargar();
      limpiar();
    } catch { Swal.fire("Error", "Hubo un problema al guardar", "error"); }
  };

  const editar = (p: PerfilUsuario) => {
    setFormulario({ nombre: p.nombre, correo: p.correo, rol: p.rol, zona: p.zona, estado: p.estado, fecha_registro: p.fecha_registro });
    setEditandoId(p.uid);
    setMostrarForm(true);
  };

  const eliminar = (p: PerfilUsuario) => {
    Swal.fire({
      title: "¿Eliminar registro?", text: `Se removerá a ${p.nombre}`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        await deletePersonaGlobal(p.uid);
        if (p.correo) await removeGlobalEmailRole(p.correo);
        Swal.fire("Eliminado", "Registro removido", "success");
        await cargar();
      } catch { Swal.fire("Error", "No se pudo eliminar", "error"); }
    });
  };

  const toggleEstado = async (p: PerfilUsuario) => {
    const nuevoEstado = p.estado === "Activo" ? "Inactivo" : "Activo";
    await savePersonaGlobal({ ...p, estado: nuevoEstado });
    await cargar();
  };

  const filtrado = personal.filter((p) => {
    const matchRol = filtroRol ? p.rol === filtroRol : true;
    return matchRol && (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.correo.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const activos = personal.filter((p) => p.estado === "Activo").length;

  return (
    <div className="min-h-screen bg-[#fcfdfd] dark:bg-slate-900 p-4 lg:p-8 space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Gestión de <span className="text-green-600">Personal</span>
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
              <User className="w-3.5 h-3.5" /> {miNombre}
            </span>
            {miRol && (
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${ROL_COLOR[miRol as keyof typeof ROL_COLOR] ?? ""}`}>
                {miRol}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-4 h-4 transition-colors" />
            <input type="text" placeholder="Buscar colaborador..." value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all text-sm w-full sm:w-72 shadow-sm" />
          </div>
          <button onClick={() => mostrarForm ? limpiar() : setMostrarForm(true)}
            className={`flex items-center justify-center gap-2 px-8 py-2.5 text-white rounded-2xl shadow-lg transition-all font-black uppercase text-xs tracking-widest ${mostrarForm ? "bg-gray-800" : "bg-green-600 hover:bg-green-700"}`}>
            {mostrarForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {mostrarForm ? "Cancelar" : "Nuevo Ingreso"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { val: personal.length, label: "Registrados", icon: Users, color: "border-blue-500", iconBg: "bg-blue-500", text: "text-blue-600" },
          { val: activos, label: "Activos", icon: Shield, color: "border-emerald-500", iconBg: "bg-emerald-500", text: "text-emerald-600" },
          { val: personal.filter((p) => p.rol === "administrador").length, label: "Admins", icon: Crown, color: "border-purple-500", iconBg: "bg-purple-500", text: "text-purple-600" },
          { val: new Set(personal.map((p) => p.zona)).size, label: "Zonas", icon: MapPin, color: "border-orange-500", iconBg: "bg-orange-500", text: "text-orange-600" },
        ].map(({ val, label, icon: Icon, color, iconBg, text }) => (
          <div key={label} className={`bg-gradient-to-br from-white dark:from-slate-800 to-white dark:to-slate-800 border-2 ${color} rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center hover:scale-[1.02] transition-transform`}>
            <div className={`${iconBg} p-3 rounded-2xl mb-4 shadow-md`}><Icon className="text-white w-6 h-6" /></div>
            <p className="text-4xl font-black text-gray-800 dark:text-white">{val}</p>
            <p className={`text-[10px] uppercase tracking-[2px] font-black mt-2 ${text}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-gray-100 dark:border-slate-700 animate-in zoom-in duration-300">
          <div className="flex items-center gap-4 mb-10 border-b border-gray-50 dark:border-slate-700 pb-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center text-green-600">
              <Plus size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">{editandoId ? "Editar Perfil" : "Nuevo Colaborador"}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { label: "Nombre Completo",      key: "nombre", type: "text",  placeholder: "Juan Pérez" },
                { label: "Correo Institucional",  key: "correo", type: "email", placeholder: "juan@agroalert.com" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={(formulario as any)[key]}
                    onChange={(e) => setFormulario({ ...formulario, [key]: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 dark:text-white border-2 border-transparent focus:border-green-400 rounded-2xl outline-none transition-all font-bold text-gray-700" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Zona</label>
                  <select value={formulario.zona} onChange={(e) => setFormulario({ ...formulario, zona: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 dark:text-white border-2 border-transparent focus:border-green-400 rounded-2xl outline-none font-bold text-gray-700">
                    <option value="">Zona...</option>
                    {["Norte","Sur","Este","Oeste","Centro"].map((z) => <option key={z} value={z}>Zona {z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Rango</label>
                  <select value={formulario.rol} onChange={(e) => setFormulario({ ...formulario, rol: e.target.value as PerfilUsuario["rol"] })}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-700 dark:text-white border-2 border-transparent focus:border-green-400 rounded-2xl outline-none font-bold text-gray-700">
                    <option value="administrador">Administrador</option>
                    <option value="operador">Operador</option>
                    <option value="consultor">Consultor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Estado</label>
                <div className="flex gap-3">
                  {["Activo","Inactivo"].map((e) => (
                    <button key={e} type="button" onClick={() => setFormulario({ ...formulario, estado: e })}
                      className={`flex-1 py-3 rounded-2xl font-black text-xs border-2 transition-all ${formulario.estado === e ? "bg-green-50 border-green-500 text-green-700" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 flex justify-end gap-4 border-t border-gray-50 dark:border-slate-700 pt-8">
            <button onClick={limpiar} className="px-8 py-4 text-gray-400 font-black hover:text-gray-600 transition-colors uppercase text-[10px] tracking-widest">
              Descartar
            </button>
            <button onClick={guardar}
              className="px-12 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 shadow-xl shadow-green-100 transition-all uppercase text-[10px] tracking-widest">
              {editandoId ? "Actualizar Registro" : "Confirmar Ingreso"}
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 inline-flex items-center gap-2 flex-wrap">
        <button onClick={() => setFiltroRol(null)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filtroRol ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
          Todos
        </button>
        {["administrador","operador","consultor"].map((r) => (
          <button key={r} onClick={() => setFiltroRol(r)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroRol === r ? "bg-green-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
            {r === "administrador" ? "Admins" : r === "operador" ? "Operadores" : "Consultores"}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-50 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700 text-gray-400 text-[10px] uppercase tracking-[2px] font-black border-b border-gray-100 dark:border-slate-600">
                <th className="px-8 py-6">Identidad</th>
                <th className="px-8 py-6">Contacto</th>
                <th className="px-8 py-6 text-center">Rol</th>
                <th className="px-8 py-6 text-center">Estatus</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {filtrado.map((p) => (
                <tr key={p.uid} className="group hover:bg-green-50/10 dark:hover:bg-green-900/5 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-black text-lg border-2 border-white dark:border-slate-700 shadow-sm">
                        {p.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{p.nombre}</p>
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter flex items-center gap-1">
                          <MapPin size={10} /> Zona {p.zona}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-300">
                      <Mail size={14} className="text-green-500" /> {p.correo}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${ROL_COLOR[p.rol] ?? "bg-gray-100 text-gray-600"}`}>{p.rol}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button onClick={() => toggleEstado(p)}
                      className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${p.estado === "Activo" ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                      {p.estado}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => editar(p)} className="w-10 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-gray-100 bg-white dark:bg-slate-700">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => eliminar(p)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100 bg-white dark:bg-slate-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrado.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
