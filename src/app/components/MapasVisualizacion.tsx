import { MapPin, Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react";
import { cultivos, alertasActivas, datosClimaticosActuales } from "../data/mockData";
import { useState } from "react";

// Simulación de mapa con coordenadas
const zonas = [
  { nombre: "Norte", lat: 20.5, lng: -100.2, color: "bg-red-500" },
  { nombre: "Sur", lat: 20.3, lng: -100.4, color: "bg-yellow-500" },
  { nombre: "Este", lat: 20.4, lng: -100.1, color: "bg-blue-500" },
  { nombre: "Oeste", lat: 20.6, lng: -100.5, color: "bg-orange-500" },
  { nombre: "Centro", lat: 20.5, lng: -100.3, color: "bg-green-500" },
];

export function MapasVisualizacion() {
  const [zonaSeleccionada, setZonaSeleccionada] = useState<string | null>(null);
  const [capaMapa, setCapaMapa] = useState<"temperatura" | "precipitacion" | "viento" | "alertas">("alertas");

  const cultivosPorZona = (zona: string) =>
    cultivos.filter((c) => c.zona === zona);

  const alertasPorZona = (zona: string) =>
    alertasActivas.filter((a) => a.zona === zona && a.activa);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">Mapas y Visualización</h1>
          <p className="text-gray-600">
            Visualización geográfica de datos climáticos y cultivos
          </p>
        </div>
      </div>

      {/* Selector de Capas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Capas del Mapa</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setCapaMapa("alertas")}
            className={`p-4 rounded-lg border-2 transition-all ${
              capaMapa === "alertas"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Alertas</p>
          </button>

          <button
            onClick={() => setCapaMapa("temperatura")}
            className={`p-4 rounded-lg border-2 transition-all ${
              capaMapa === "temperatura"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Thermometer className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Temperatura</p>
          </button>

          <button
            onClick={() => setCapaMapa("precipitacion")}
            className={`p-4 rounded-lg border-2 transition-all ${
              capaMapa === "precipitacion"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Droplets className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Precipitación</p>
          </button>

          <button
            onClick={() => setCapaMapa("viento")}
            className={`p-4 rounded-lg border-2 transition-all ${
              capaMapa === "viento"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Wind className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Viento</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Principal */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Mapa Interactivo - Región Agrícola
          </h2>

          {/* Simulación de Mapa */}
          <div className="relative bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 rounded-lg h-[360px] sm:h-[440px] lg:h-[500px] border-2 border-gray-200 overflow-hidden">
            {/* Grid de fondo */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-gray-200 opacity-20" />
              ))}
            </div>

            {/* Capas según selección */}
            {capaMapa === "temperatura" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {zonas.map((zona) => (
                    <div
                      key={zona.nombre}
                      className="absolute w-32 h-32 rounded-full opacity-40 animate-pulse"
                      style={{
                        background: `radial-gradient(circle, rgba(239, 68, 68, 0.6), transparent)`,
                        left: `${(zona.lng + 101) * 100}%`,
                        top: `${(21 - zona.lat) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {capaMapa === "precipitacion" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {zonas.map((zona, i) => (
                    <div
                      key={zona.nombre}
                      className="absolute w-40 h-40 rounded-full opacity-30"
                      style={{
                        background: `radial-gradient(circle, rgba(59, 130, 246, ${
                          0.3 + i * 0.15
                        }), transparent)`,
                        left: `${(zona.lng + 101) * 100}%`,
                        top: `${(21 - zona.lat) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Marcadores de Cultivos */}
            {cultivos.map((cultivo) => (
              <button
                key={cultivo.id}
                onClick={() =>
                  setZonaSeleccionada(
                    zonaSeleccionada === cultivo.zona ? null : cultivo.zona
                  )
                }
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 ${
                  zonaSeleccionada === cultivo.zona ? "z-20 scale-125" : "z-10"
                }`}
                style={{
                  left: `${(cultivo.coordenadas.lng + 101) * 100}%`,
                  top: `${(21 - cultivo.coordenadas.lat) * 100}%`,
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white font-bold ${
                    zonas.find((z) => z.nombre === cultivo.zona)?.color
                  }`}
                >
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="hidden sm:block absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium">
                  {cultivo.nombre}
                  <br />
                  <span className="text-xs text-gray-600">
                    {cultivo.hectareas} ha
                  </span>
                </div>
              </button>
            ))}

            {/* Marcadores de Alertas */}
            {capaMapa === "alertas" &&
              alertasActivas
                .filter((a) => a.activa)
                .map((alerta) => {
                  const zona = zonas.find((z) => z.nombre === alerta.zona);
                  if (!zona) return null;
                  return (
                    <div
                      key={alerta.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                      style={{
                        left: `${(zona.lng + 101) * 100 + 5}%`,
                        top: `${(21 - zona.lat) * 100 - 5}%`,
                      }}
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  );
                })}

            {/* Leyenda */}
            <div className="hidden sm:block absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Leyenda
              </p>
              <div className="space-y-1">
                {zonas.map((zona) => (
                  <div key={zona.nombre} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${zona.color}`} />
                    <span className="text-xs text-gray-600">{zona.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escala */}
            <div className="hidden sm:block absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">Escala</p>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-300" />
                <span className="text-xs text-gray-600">5 km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Información */}
        <div className="space-y-4">
          {/* Información de Zona Seleccionada */}
          {zonaSeleccionada ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Zona: {zonaSeleccionada}
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Datos Climáticos Actuales
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Temperatura</span>
                      <span className="font-semibold">
                        {datosClimaticosActuales.temperatura}°C
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Humedad</span>
                      <span className="font-semibold">
                        {datosClimaticosActuales.humedad}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Viento</span>
                      <span className="font-semibold">
                        {datosClimaticosActuales.viento} km/h
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Cultivos en esta Zona
                  </h4>
                  <div className="space-y-2">
                    {cultivosPorZona(zonaSeleccionada).map((cultivo) => (
                      <div
                        key={cultivo.id}
                        className="p-2 bg-gray-50 rounded text-sm"
                      >
                        <p className="font-medium">{cultivo.nombre}</p>
                        <p className="text-xs text-gray-600">
                          {cultivo.hectareas} hectáreas
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Alertas Activas
                  </h4>
                  {alertasPorZona(zonaSeleccionada).length > 0 ? (
                    <div className="space-y-2">
                      {alertasPorZona(zonaSeleccionada).map((alerta) => (
                        <div
                          key={alerta.id}
                          className="p-2 bg-red-50 border border-red-200 rounded text-sm"
                        >
                          <p className="font-medium text-red-800 capitalize">
                            {alerta.tipo}
                          </p>
                          <p className="text-xs text-red-600">
                            Severidad: {alerta.severidad}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay alertas activas
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setZonaSeleccionada(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Selecciona una Zona
              </h3>
              <p className="text-sm text-gray-600">
                Haz clic en un marcador del mapa para ver información detallada
                de la zona
              </p>
            </div>
          )}

          {/* Estadísticas Generales */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Estadísticas por Zona
            </h3>
            <div className="space-y-3">
              {zonas.map((zona) => {
                const cultivosZona = cultivosPorZona(zona.nombre);
                const alertasZona = alertasPorZona(zona.nombre);
                const totalHa = cultivosZona.reduce(
                  (acc, c) => acc + c.hectareas,
                  0
                );

                return (
                  <div
                    key={zona.nombre}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setZonaSeleccionada(zona.nombre)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${zona.color}`} />
                        <span className="font-medium text-sm">{zona.nombre}</span>
                      </div>
                      {alertasZona.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          {alertasZona.length}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Cultivos: {cultivosZona.length}</div>
                      <div>Total: {totalHa} ha</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-green-200">
        <h3 className="font-semibold text-gray-900 mb-3">
          Sobre la Visualización de Mapas
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Esta herramienta permite visualizar geográficamente la distribución de
          cultivos, datos climáticos en tiempo real y alertas activas por zona.
        </p>
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> Esta es una simulación visual. En producción,
          se integraría con servicios para un mejor rendimiento y datos en tiempo real.
        </p>
      </div>
    </div>
  );
}
