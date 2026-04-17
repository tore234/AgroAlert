import { Shield, AlertCircle, CheckCircle, Info } from "lucide-react";
import { recomendaciones, alertasActivas } from "../data/mockData";
import { useState } from "react";

const categoriaIcons = {
  riego: "💧",
  proteccion: "🛡️",
  fertilizacion: "🌱",
  cosecha: "🌾",
};

export function RecomendacionesSeguridad() {
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  const recomendacionesFiltradas = recomendaciones.filter((rec) => {
    if (filtroCategoria && rec.categoria !== filtroCategoria) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900 text-2xl">
            Recomendaciones de Seguridad
          </h1>
          <p className="text-gray-600 text-sm">
            Guía para el cuidado óptimo de tus cultivos según condiciones climáticas
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">
            {recomendaciones.length} Recomendaciones Activas
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Categoría</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroCategoria(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filtroCategoria === null
                ? "bg-green-600 text-white shadow-md shadow-green-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          {["riego", "proteccion", "fertilizacion", "cosecha"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtroCategoria === cat
                  ? "bg-green-600 text-white shadow-md shadow-green-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {categoriaIcons[cat as keyof typeof categoriaIcons]}{" "}
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Recomendaciones */}
      <div className="space-y-4">
        {recomendacionesFiltradas.map((recomendacion) => (
          <div
            key={recomendacion.id}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {recomendacion.titulo}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full font-medium capitalize text-gray-600">
                        {categoriaIcons[recomendacion.categoria as keyof typeof categoriaIcons]}{" "}
                        {recomendacion.categoria}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  {recomendacion.descripcion}
                </p>

                <div className="pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Aplicable a:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recomendacion.cultivosAplicables.map((cultivoNombre) => (
                      <span
                        key={cultivoNombre}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold"
                      >
                        {cultivoNombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {recomendacionesFiltradas.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-dashed border-gray-200">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-medium">
              No se encontraron recomendaciones en esta categoría.
            </p>
          </div>
        )}
      </div>

      {/* Protocolos de Emergencia */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="font-semibold text-gray-900">
            Protocolos de Emergencia
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">❄️ Ante Heladas</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Activar sistemas de riego por aspersión</li>
              <li>• Cubrir cultivos sensibles con mantas térmicas</li>
              <li>• Monitorear temperatura cada 2 horas</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">🌧️ Ante Lluvias Intensas</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Verificar sistemas de drenaje</li>
              <li>• Suspender aplicaciones de fertilizantes</li>
              <li>• Asegurar estructuras e invernaderos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contactos de Emergencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-[2px] mb-1">Asesoría Técnica</h3>
          <p className="text-2xl font-black text-green-600 tracking-tighter">800-AGRO-911</p>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-[2px] mb-1">Meteorología</h3>
          <p className="text-2xl font-black text-blue-600 tracking-tighter">800-CLIMA-01</p>
        </div>

        <div className="p-5 bg-red-600 rounded-xl shadow-md text-white">
          <h3 className="font-bold text-white/70 text-[10px] uppercase tracking-[2px] mb-1">Emergencias</h3>
          <p className="text-2xl font-black tracking-tighter">911</p>
        </div>
      </div>
    </div>
  );
}