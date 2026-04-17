import { Users, Plus, Mail, Phone, MapPin, Shield, Edit, Trash2, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: "administrador" | "operador" | "consultor";
  zona: string;
  estado: string;
  fecha_registro: string;
}

const rolColors = {
  administrador: "bg-purple-100 text-purple-800",
  operador: "bg-blue-100 text-blue-800",
  consultor: "bg-green-100 text-green-800",
};

export function GestionUsuarios() {
  // --- ESTADOS ---
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState(""); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<string | null>(null);
  const [filtroRol, setFiltroRol] = useState<string | null>(null);
  
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    rol: "operador" as "administrador" | "operador" | "consultor",
    zona: "",
    estado: "Activo",
  });

  const API_URL = 'http://localhost/apis/gestion_usuarios.php';

  // --- EFECTOS ---
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al conectar con la base de datos");
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // --- LÓGICA ---
  const limpiarFormulario = () => {
    setFormulario({
      nombre: "", correo: "", telefono: "", rol: "operador", zona: "", estado: "Activo",
    });
    setUsuarioEditando(null);
    setMostrarFormulario(false);
  };

  const guardarUsuario = async () => {
    if (formulario.nombre && formulario.correo && formulario.zona) {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formulario, id: usuarioEditando })
        });
        
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            title: usuarioEditando ? '¡Actualizado!' : '¡Registrado!',
            text: usuarioEditando ? 'Datos actualizados correctamente' : 'Usuario agregado a AgroAlert',
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
          fetchUsuarios();
          limpiarFormulario();
        }
      } catch (error) {
        Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      }
    } else {
      Swal.fire('Faltan datos', 'Por favor completa nombre, correo y zona', 'warning');
    }
  };

  const editarUsuario = (usuario: Usuario) => {
    setFormulario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      zona: usuario.zona,
      estado: usuario.estado,
    });
    setUsuarioEditando(usuario.id);
    setMostrarFormulario(true);
  };

  const eliminarUsuario = (id: string) => {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: "Se perderán los accesos de este personal",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
          Swal.fire('Eliminado', 'El usuario ha sido removido', 'success');
          fetchUsuarios();
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
        }
      }
    });
  };

  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    const user = usuarios.find(u => u.id === id);
    if (user) {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, estado: nuevoEstado, id: id })
      });
      fetchUsuarios();
    }
  };

  // --- FILTRADO ---
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol ? u.rol === filtroRol : true;
    const coincideBusqueda = 
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      u.correo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideRol && coincideBusqueda;
  });

  const usuariosActivos = usuarios.filter((u) => u.estado === "Activo").length;

  return (
    <div className="min-h-screen bg-[#fcfdfd] p-4 lg:p-8 space-y-10">
      
      {/* 1. HEADER SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Gestión de <span className="text-green-600">Personal</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm italic mt-1">Panel administrativo de AgroAlert</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 w-4 h-4 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar colaborador..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-green-400 transition-all text-sm w-full sm:w-72 shadow-sm"
            />
          </div>

          <button
            onClick={() => mostrarFormulario ? limpiarFormulario() : setMostrarFormulario(true)}
            className={`flex items-center justify-center gap-2 px-8 py-2.5 text-white rounded-2xl shadow-lg transition-all font-black uppercase text-xs tracking-widest ${mostrarFormulario ? 'bg-gray-800' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {mostrarFormulario ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {mostrarFormulario ? "Cancelar" : "Nuevo Ingreso"}
          </button>
        </div>
      </div>

      {/* 2. ESTADÍSTICAS (CONTORNO DE COLOR + FONDO DEGRADADO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card: Registrados */}
        <div className="bg-gradient-to-br from-blue-50/50 to-white border-2 border-blue-500 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
          <div className="bg-blue-500 p-3 rounded-2xl mb-4 shadow-md shadow-blue-100">
            <Users className="text-white w-6 h-6" />
          </div>
          <p className="text-4xl font-black text-gray-800">{usuarios.length}</p>
          <p className="text-[10px] uppercase tracking-[2px] font-black text-blue-600 mt-2">Registrados</p>
        </div>

        {/* Card: Activos */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-white border-2 border-emerald-500 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
          <div className="bg-emerald-500 p-3 rounded-2xl mb-4 shadow-md shadow-emerald-100">
            <Shield className="text-white w-6 h-6" />
          </div>
          <p className="text-4xl font-black text-gray-800">{usuariosActivos}</p>
          <p className="text-[10px] uppercase tracking-[2px] font-black text-emerald-600 mt-2">Activos</p>
        </div>

        {/* Card: Admins */}
        <div className="bg-gradient-to-br from-purple-50/50 to-white border-2 border-purple-500 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
          <div className="bg-purple-500 p-3 rounded-2xl mb-4 shadow-md shadow-purple-100">
            <Shield className="text-white w-6 h-6" />
          </div>
          <p className="text-4xl font-black text-gray-800">{usuarios.filter(u => u.rol === 'administrador').length}</p>
          <p className="text-[10px] uppercase tracking-[2px] font-black text-purple-600 mt-2">Admins</p>
        </div>

        {/* Card: Zonas */}
        <div className="bg-gradient-to-br from-orange-50/50 to-white border-2 border-orange-500 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
          <div className="bg-orange-500 p-3 rounded-2xl mb-4 shadow-md shadow-orange-100">
            <MapPin className="text-white w-6 h-6" />
          </div>
          <p className="text-4xl font-black text-gray-800">{new Set(usuarios.map(u => u.zona)).size}</p>
          <p className="text-[10px] uppercase tracking-[2px] font-black text-orange-600 mt-2">Zonas</p>
        </div>
      </div>

      {/* 3. FORMULARIO */}
      {mostrarFormulario && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-gray-100 animate-in zoom-in duration-300">
          <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <Plus size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-800">
              {usuarioEditando ? "Editar Perfil" : "Nuevo Colaborador"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Juan Pérez" 
                  value={formulario.nombre} 
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" 
                />
              </div>
              
              <div className="group">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Correo Institucional</label>
                <input 
                  type="email" 
                  placeholder="juan@agroalert.com" 
                  value={formulario.correo} 
                  onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })} 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" 
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Número de Teléfono</label>
                <input 
                  type="tel" 
                  placeholder="+52 000 000 0000" 
                  value={formulario.telefono} 
                  onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })} 
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Ubicación / Zona</label>
                  <select 
                    value={formulario.zona} 
                    onChange={(e) => setFormulario({ ...formulario, zona: e.target.value })} 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl outline-none font-bold text-gray-700"
                  >
                    <option value="">Zona...</option>
                    <option value="Norte">Zona Norte</option>
                    <option value="Sur">Zona Sur</option>
                    <option value="Este">Zona Este</option>
                    <option value="Oeste">Zona Oeste</option>
                    <option value="Centro">Zona Centro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 mb-2 block">Rango de Usuario</label>
                  <select 
                    value={formulario.rol} 
                    onChange={(e) => setFormulario({ ...formulario, rol: e.target.value as any })} 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-green-400 focus:bg-white rounded-2xl outline-none font-bold text-gray-700"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="operador">Operador</option>
                    <option value="consultor">Consultor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-4 border-t border-gray-50 pt-8">
            <button onClick={limpiarFormulario} className="px-8 py-4 text-gray-400 font-black hover:text-gray-600 transition-colors uppercase text-[10px] tracking-widest">
              Descartar
            </button>
            <button 
              onClick={guardarUsuario} 
              className="px-12 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 shadow-xl shadow-green-100 transition-all uppercase text-[10px] tracking-widest"
            >
              {usuarioEditando ? "Actualizar Registro" : "Confirmar Ingreso"}
            </button>
          </div>
        </div>
      )}

      {/* 4. FILTROS RÁPIDOS */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex items-center gap-2">
        <button onClick={() => setFiltroRol(null)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filtroRol ? "bg-green-600 text-white shadow-md shadow-green-100" : "text-gray-400 hover:bg-gray-50"}`}>
          Todos
        </button>
        {["administrador", "operador", "consultor"].map((r) => (
          <button 
            key={r} 
            onClick={() => setFiltroRol(r)} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroRol === r ? "bg-green-600 text-white shadow-md shadow-green-100" : "text-gray-400 hover:bg-gray-50"}`}
          >
            {r}es
          </button>
        ))}
      </div>

      {/* 5. TABLA DE DATOS */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[2px] font-black border-b border-gray-100">
                <th className="px-8 py-6">Identidad</th>
                <th className="px-8 py-6">Contacto</th>
                <th className="px-8 py-6 text-center">Rol</th>
                <th className="px-8 py-6 text-center">Estatus</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="group hover:bg-green-50/10 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-green-700 font-black text-lg border-2 border-white shadow-sm">
                        {u.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{u.nombre}</p>
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter flex items-center gap-1">
                          <MapPin size={10} /> Zona {u.zona}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500"><Mail size={14} className="text-green-500" /> {u.correo}</p>
                      <p className="flex items-center gap-2 text-xs font-bold text-gray-500"><Phone size={14} className="text-green-500" /> {u.telefono}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${rolColors[u.rol]}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleEstado(u.id, u.estado)} 
                      className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${u.estado === 'Activo' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    >
                      {u.estado}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => editarUsuario(u)} className="w-10 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-gray-100 bg-white">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => eliminarUsuario(u.id)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100 bg-white">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuariosFiltrados.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest italic">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}