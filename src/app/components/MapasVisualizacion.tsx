import { useState, useEffect, useCallback } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Circle, useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin, Thermometer, Droplets, Wind, AlertTriangle,
  Layers, TreePine, RefreshCw, Navigation, Satellite, Map, LocateFixed,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getCultivos, getAlertasHistorial, Cultivo, AlertaHistorial,
} from "../../services/firestoreService";

// ── Constants ────────────────────────────────────────────────────────────────

const OWM_KEY  = import.meta.env.VITE_OWM_API_KEY ?? "";
const CENTRO: [number, number] = [20.45, -100.3];

const ZONA_COLORES: Record<string, string> = {
  Norte:  "#ef4444",
  Sur:    "#eab308",
  Este:   "#3b82f6",
  Oeste:  "#f97316",
  Centro: "#22c55e",
};

const ESTADO_COLORES: Record<string, string> = {
  activo:         "#22c55e",
  en_desarrollo:  "#3b82f6",
  cosecha:        "#f97316",
};

const TIPO_EVENTO_ICONO: Record<string, string> = {
  helada:  "❄️",
  lluvia:  "🌧️",
  sequia:  "☀️",
  viento:  "💨",
  granizo: "🌨️",
};

// Tile layers disponibles
const TILE_LAYERS = {
  calles: {
    label: "Calles",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    Icon: Map,
  },
  oscuro: {
    label: "Oscuro",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://carto.com">CARTO</a>',
    Icon: Layers,
  },
  satelite: {
    label: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    Icon: Satellite,
  },
  terreno: {
    label: "Terreno",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
    Icon: TreePine,
  },
} as const;

type TileKey = keyof typeof TILE_LAYERS;

// OWM overlay tiles
const OWM_CAPAS = {
  ninguna:       { label: "Sin capa",  url: "",                                                                      Icon: Map },
  temperatura:   { label: "Temp",      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, Icon: Thermometer },
  precipitacion: { label: "Lluvia",    url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, Icon: Droplets },
  viento:        { label: "Viento",    url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`, Icon: Wind },
} as const;

type CapaKey = keyof typeof OWM_CAPAS;

// ── Custom marker icons ───────────────────────────────────────────────────────

function cultivoIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function ubicacionIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#3b82f6;border:3px solid white;
      box-shadow:0 0 0 4px rgba(59,130,246,0.3);
      animation:pulse-blue 2s infinite;
    "></div>
    <style>
      @keyframes pulse-blue{0%,100%{box-shadow:0 0 0 4px rgba(59,130,246,0.3)}50%{box-shadow:0 0 0 10px rgba(59,130,246,0.1)}}
    </style>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

function alertaIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:0;height:0;
      border-left:12px solid transparent;
      border-right:12px solid transparent;
      border-bottom:22px solid #ef4444;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    "></div>`,
    iconSize: [24, 22],
    iconAnchor: [12, 22],
    popupAnchor: [0, -24],
  });
}

// ── Map fly-to controller ─────────────────────────────────────────────────────

function FlyTo({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
  }, [target]);
  return null;
}

// ── Real-time location hook ───────────────────────────────────────────────────

type GeoPos = { lat: number; lng: number; accuracy: number } | null;

function useRealTimeLocation(): GeoPos {
  const [pos, setPos] = useState<GeoPos>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => setPos({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return pos;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function MapasVisualizacion() {
  const { uid } = useAuth();

  const [cultivos,  setCultivos]  = useState<Cultivo[]>([]);
  const [alertas,   setAlertas]   = useState<AlertaHistorial[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [tileKey,   setTileKey]   = useState<TileKey>("calles");
  const [capaClima, setCapaClima] = useState<CapaKey>("ninguna");
  const [zonaFiltro, setZonaFiltro] = useState("Todas");
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  const miUbicacion = useRealTimeLocation();

  const cargarDatos = useCallback(async () => {
    if (!uid) return;
    setCargando(true);
    try {
      const [c, a] = await Promise.all([getCultivos(uid), getAlertasHistorial(uid)]);
      setCultivos(c);
      setAlertas(a);
    } finally {
      setCargando(false);
    }
  }, [uid]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const zonas = [...new Set(cultivos.map((c) => c.zona))];

  const cultivosFiltrados = zonaFiltro === "Todas"
    ? cultivos
    : cultivos.filter((c) => c.zona === zonaFiltro);

  const alertasFiltradas = zonaFiltro === "Todas"
    ? alertas
    : alertas.filter((a) => cultivos.find((c) => c.nombre === a.nombre_cultivo && c.zona === zonaFiltro));

  const statsZona = (zona: string) => {
    const cs = cultivos.filter((c) => c.zona === zona);
    const as = alertas.filter((a) => cs.some((c) => c.nombre === a.nombre_cultivo));
    return { cultivos: cs.length, alertas: as.length, ha: cs.reduce((s, c) => s + c.hectareas, 0) };
  };

  const irAZona = (zona: string) => {
    const c = cultivos.find((cu) => cu.zona === zona);
    if (c) setFlyTarget({ lat: c.coordenadas.lat, lng: c.coordenadas.lng, zoom: 13 });
    setZonaFiltro(zona);
  };

  const irACultivo = (c: Cultivo) => {
    setFlyTarget({ lat: c.coordenadas.lat, lng: c.coordenadas.lng, zoom: 15 });
  };

  const tile = TILE_LAYERS[tileKey];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 p-4 md:p-8 space-y-6">

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4
                         bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm
                         border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">AgroAlert</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Mapas y Visualización en Tiempo Real</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={zonaFiltro}
            onChange={(e) => setZonaFiltro(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 dark:text-white rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Todas">Todas las zonas</option>
            {zonas.map((z) => <option key={z} value={z}>Zona {z}</option>)}
          </select>
          {miUbicacion && (
            <button
              onClick={() => setFlyTarget({ lat: miUbicacion.lat, lng: miUbicacion.lng, zoom: 15 })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              <LocateFixed className="w-4 h-4" />
              Mi ubicación
            </button>
          )}
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Cultivos",  val: cultivos.length,  color: "bg-emerald-500", Icon: TreePine },
          { label: "Alertas",   val: alertas.length,   color: "bg-red-500",     Icon: AlertTriangle },
          { label: "Zonas",     val: zonas.length,     color: "bg-blue-500",    Icon: MapPin },
          { label: "Hectáreas", val: `${cultivos.reduce((s, c) => s + c.hectareas, 0)} ha`, color: "bg-amber-500", Icon: Layers },
        ].map(({ label, val, color, Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 flex items-center gap-3">
            <div className={`${color} p-2 rounded-xl`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ── MAP AREA ────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-3">

          {/* Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 flex flex-wrap gap-3 items-center">

            {/* Tile type */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-xl">
              {(Object.entries(TILE_LAYERS) as [TileKey, typeof TILE_LAYERS[TileKey]][]).map(([key, t]) => {
                const TIcon = t.Icon;
                return (
                  <button
                    key={key}
                    onClick={() => setTileKey(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                      tileKey === key
                        ? "bg-white dark:bg-slate-600 shadow text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    <TIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* OWM climate layers */}
            {OWM_KEY && (
              <div className="flex gap-1 flex-wrap">
                {(Object.entries(OWM_CAPAS) as [CapaKey, typeof OWM_CAPAS[CapaKey]][]).map(([key, c]) => {
                  const CIcon = c.Icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setCapaClima(key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        capaClima === key
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-emerald-300"
                      }`}
                    >
                      <CIcon className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leaflet Map */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-lg"
               style={{ height: "520px" }}>
            {cargando ? (
              <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-gray-500 animate-pulse">Cargando mapa...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={CENTRO}
                zoom={12}
                style={{ width: "100%", height: "100%" }}
                zoomControl={true}
                scrollWheelZoom={true}
              >
                {/* Base tile */}
                <TileLayer url={tile.url} attribution={tile.attribution} />

                {/* OWM overlay */}
                {capaClima !== "ninguna" && OWM_KEY && (
                  <TileLayer
                    url={OWM_CAPAS[capaClima].url}
                    attribution="© OpenWeatherMap"
                    opacity={0.55}
                  />
                )}

                {/* Fly controller */}
                <FlyTo target={flyTarget} />

                {/* Zone circles */}
                {zonas.map((zona) => {
                  const centro = cultivos.find((c) => c.zona === zona);
                  if (!centro) return null;
                  return (
                    <Circle
                      key={`circle-${zona}`}
                      center={[centro.coordenadas.lat, centro.coordenadas.lng]}
                      radius={3000}
                      pathOptions={{
                        color:       ZONA_COLORES[zona] ?? "#94a3b8",
                        fillColor:   ZONA_COLORES[zona] ?? "#94a3b8",
                        fillOpacity: 0.07,
                        weight:      1.5,
                        opacity:     0.4,
                      }}
                    />
                  );
                })}

                {/* Cultivo markers */}
                {cultivosFiltrados.map((c) => (
                  <Marker
                    key={c.id}
                    position={[c.coordenadas.lat, c.coordenadas.lng]}
                    icon={cultivoIcon(ESTADO_COLORES[c.estado] ?? "#94a3b8")}
                  >
                    <Popup maxWidth={200}>
                      <div className="p-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: ESTADO_COLORES[c.estado], flexShrink: 0 }} />
                          <p className="font-black text-gray-900 text-sm">{c.nombre}</p>
                        </div>
                        <p className="text-xs text-gray-600">📍 Zona {c.zona}</p>
                        <p className="text-xs text-gray-600">🌾 {c.hectareas} hectáreas</p>
                        <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          c.estado === "activo"        ? "bg-green-100 text-green-700"  :
                          c.estado === "en_desarrollo" ? "bg-blue-100 text-blue-700"    :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {c.estado.replace("_", " ")}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* User real-time location */}
                {miUbicacion && (
                  <>
                    <Circle
                      center={[miUbicacion.lat, miUbicacion.lng]}
                      radius={miUbicacion.accuracy}
                      pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 1.5 }}
                    />
                    <Marker position={[miUbicacion.lat, miUbicacion.lng]} icon={ubicacionIcon()}>
                      <Popup maxWidth={180}>
                        <div className="p-1 space-y-1">
                          <p className="font-black text-blue-700 text-sm">Tu ubicación actual</p>
                          <p className="text-xs text-gray-600">Lat: {miUbicacion.lat.toFixed(5)}</p>
                          <p className="text-xs text-gray-600">Lng: {miUbicacion.lng.toFixed(5)}</p>
                          <p className="text-xs text-gray-400">Precisión: ±{Math.round(miUbicacion.accuracy)} m</p>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}

                {/* Alert markers */}
                {alertasFiltradas.slice(0, 20).map((a) => {
                  const cultivo = cultivos.find((cu) => cu.nombre === a.nombre_cultivo);
                  if (!cultivo) return null;
                  return (
                    <Marker
                      key={a.id}
                      position={[cultivo.coordenadas.lat + 0.003, cultivo.coordenadas.lng + 0.003]}
                      icon={alertaIcon()}
                    >
                      <Popup maxWidth={190}>
                        <div className="p-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span>{TIPO_EVENTO_ICONO[a.tipo_evento] ?? "⚠️"}</span>
                            <p className="font-black text-red-700 text-sm capitalize">{a.tipo_evento}</p>
                          </div>
                          <p className="text-xs text-gray-700">🌱 {a.nombre_cultivo}</p>
                          <p className="text-xs text-gray-600">📍 Zona {a.zona}</p>
                          <p className="text-xs text-gray-500">📊 Valor: {a.valor_clima}</p>
                          <p className="text-[10px] text-gray-400">{a.fecha_deteccion?.slice(0, 10)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 flex flex-wrap gap-4 items-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Leyenda:</p>
            {Object.entries(ESTADO_COLORES).map(([estado, color]) => (
              <div key={estado} className="flex items-center gap-1.5">
                <div style={{ background: color, width: 10, height: 10, borderRadius: "50%", border: "2px solid white", boxShadow: "0 0 0 1px #cbd5e1" }} />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 capitalize">{estado.replace("_", " ")}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "12px solid #ef4444" }} />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Alerta</span>
            </div>
          </div>
        </div>

        {/* ── SIDE PANEL ──────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Zone navigator */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Zonas</h3>
            {zonas.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-3">Sin zonas registradas</p>
            ) : (
              <div className="space-y-1">
                {zonas.map((zona) => {
                  const s = statsZona(zona);
                  return (
                    <button
                      key={zona}
                      onClick={() => irAZona(zona)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div style={{ background: ZONA_COLORES[zona] ?? "#94a3b8" }} className="w-3 h-3 rounded-full flex-shrink-0" />
                        <div>
                          <p className="text-sm font-black text-gray-800 dark:text-white">{zona}</p>
                          <p className="text-[10px] text-gray-400">{s.cultivos} cultivos · {s.ha} ha</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {s.alertas > 0 && (
                          <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{s.alertas}⚠️</span>
                        )}
                        <Navigation className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>
                  );
                })}
                {zonaFiltro !== "Todas" && (
                  <button onClick={() => setZonaFiltro("Todas")} className="w-full text-xs font-bold text-emerald-600 hover:underline pt-1">
                    Ver todas las zonas
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cultivos list */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Cultivos{zonaFiltro !== "Todas" ? ` · ${zonaFiltro}` : ""}
            </h3>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {cargando ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cultivosFiltrados.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Sin cultivos</p>
              ) : (
                cultivosFiltrados.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => irACultivo(c)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left group"
                  >
                    <div style={{ background: ESTADO_COLORES[c.estado] ?? "#94a3b8" }} className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{c.nombre}</p>
                      <p className="text-[10px] text-gray-400">{c.zona} · {c.hectareas} ha</p>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Alertas Recientes</h3>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {alertasFiltradas.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Sin alertas</p>
              ) : (
                alertasFiltradas.slice(0, 10).map((a) => {
                  const cultivo = cultivos.find((c) => c.nombre === a.nombre_cultivo);
                  return (
                    <button
                      key={a.id}
                      onClick={() => cultivo && irACultivo(cultivo)}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors text-left"
                    >
                      <span className="text-base flex-shrink-0">{TIPO_EVENTO_ICONO[a.tipo_evento] ?? "⚠️"}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-white capitalize truncate">{a.tipo_evento}</p>
                        <p className="text-[10px] text-gray-400 truncate">{a.nombre_cultivo} · {a.zona}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
