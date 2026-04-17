export interface Cultivo {
  id: string;
  nombre: string;
  zona: string;
  hectareas: number;
  fechaSiembra: string;
  estado: "activo" | "en_desarrollo" | "cosecha";
  coordenadas: { lat: number; lng: number };
}

export interface Alerta {
  id: string;
  tipo: "helada" | "lluvia" | "sequia" | "viento" | "granizo";
  severidad: "baja" | "media" | "alta" | "critica";
  zona: string;
  mensaje: string;
  fecha: string;
  activa: boolean;
  cultivosAfectados: string[];
}

export interface DatosClimaticos {
  temperatura: number;
  humedad: number;
  precipitacion: number;
  viento: number;
  presion: number;
  sensacionTermica: number;
}

export interface Pronostico {
  fecha: string;
  tempMax: number;
  tempMin: number;
  precipitacion: number;
  humedad: number;
  viento: number;
  condicion: string;
}

export interface Recomendacion {
  id: string;
  titulo: string;
  descripcion: string;
  cultivosAplicables: string[];
  prioridad: "alta" | "media" | "baja";
  categoria: "riego" | "proteccion" | "fertilizacion" | "cosecha";
}

export const cultivos: Cultivo[] = [
  {
    id: "1",
    nombre: "Maíz",
    zona: "Norte",
    hectareas: 150,
    fechaSiembra: "2026-01-15",
    estado: "en_desarrollo",
    coordenadas: { lat: 20.5, lng: -100.2 },
  },
  {
    id: "2",
    nombre: "Trigo",
    zona: "Sur",
    hectareas: 200,
    fechaSiembra: "2025-12-01",
    estado: "activo",
    coordenadas: { lat: 20.3, lng: -100.4 },
  },
  {
    id: "3",
    nombre: "Frijol",
    zona: "Este",
    hectareas: 80,
    fechaSiembra: "2026-02-01",
    estado: "en_desarrollo",
    coordenadas: { lat: 20.4, lng: -100.1 },
  },
  {
    id: "4",
    nombre: "Tomate",
    zona: "Oeste",
    hectareas: 50,
    fechaSiembra: "2025-11-15",
    estado: "cosecha",
    coordenadas: { lat: 20.6, lng: -100.5 },
  },
  {
    id: "5",
    nombre: "Aguacate",
    zona: "Centro",
    hectareas: 120,
    fechaSiembra: "2025-10-01",
    estado: "activo",
    coordenadas: { lat: 20.5, lng: -100.3 },
  },
];

export const alertasActivas: Alerta[] = [
  {
    id: "a1",
    tipo: "helada",
    severidad: "alta",
    zona: "Norte",
    mensaje: "Alerta de helada para las próximas 24 horas. Temperatura mínima esperada: -2°C",
    fecha: "2026-03-09T22:00:00",
    activa: true,
    cultivosAfectados: ["1"],
  },
  {
    id: "a2",
    tipo: "lluvia",
    severidad: "media",
    zona: "Sur",
    mensaje: "Se esperan lluvias moderadas con acumulación de 30-50mm en 12 horas",
    fecha: "2026-03-10T06:00:00",
    activa: true,
    cultivosAfectados: ["2"],
  },
  {
    id: "a3",
    tipo: "viento",
    severidad: "baja",
    zona: "Este",
    mensaje: "Vientos fuertes de hasta 40 km/h previstos para mañana",
    fecha: "2026-03-10T14:00:00",
    activa: true,
    cultivosAfectados: ["3"],
  },
];

export const datosClimaticosActuales: DatosClimaticos = {
  temperatura: 18.5,
  humedad: 65,
  precipitacion: 0,
  viento: 12,
  presion: 1013,
  sensacionTermica: 17.2,
};

export const pronosticos: Pronostico[] = [
  {
    fecha: "2026-03-09",
    tempMax: 22,
    tempMin: 8,
    precipitacion: 0,
    humedad: 60,
    viento: 15,
    condicion: "Soleado",
  },
  {
    fecha: "2026-03-10",
    tempMax: 20,
    tempMin: 6,
    precipitacion: 40,
    humedad: 75,
    viento: 20,
    condicion: "Lluvioso",
  },
  {
    fecha: "2026-03-11",
    tempMax: 19,
    tempMin: 5,
    precipitacion: 10,
    humedad: 70,
    viento: 18,
    condicion: "Nublado",
  },
  {
    fecha: "2026-03-12",
    tempMax: 23,
    tempMin: 9,
    precipitacion: 0,
    humedad: 55,
    viento: 12,
    condicion: "Parcialmente nublado",
  },
  {
    fecha: "2026-03-13",
    tempMax: 25,
    tempMin: 11,
    precipitacion: 0,
    humedad: 50,
    viento: 10,
    condicion: "Soleado",
  },
  {
    fecha: "2026-03-14",
    tempMax: 24,
    tempMin: 10,
    precipitacion: 5,
    humedad: 58,
    viento: 14,
    condicion: "Parcialmente nublado",
  },
  {
    fecha: "2026-03-15",
    tempMax: 21,
    tempMin: 7,
    precipitacion: 20,
    humedad: 68,
    viento: 16,
    condicion: "Lluvioso",
  },
];

export const recomendaciones: Recomendacion[] = [
  {
    id: "r1",
    titulo: "Protección contra heladas",
    descripcion: "Se recomienda cubrir los cultivos sensibles con mantas térmicas y activar sistemas de riego por aspersión antes del amanecer para proteger contra heladas.",
    cultivosAplicables: ["Maíz", "Tomate", "Frijol"],
    prioridad: "alta",
    categoria: "proteccion",
  },
  {
    id: "r2",
    titulo: "Optimización del riego",
    descripcion: "Con las lluvias pronosticadas, se sugiere reducir el riego en un 50% durante los próximos 3 días para evitar encharcamiento.",
    cultivosAplicables: ["Trigo", "Maíz", "Frijol"],
    prioridad: "media",
    categoria: "riego",
  },
  {
    id: "r3",
    titulo: "Aplicación de fertilizante",
    descripcion: "Condiciones óptimas para aplicación de fertilizante nitrogenado. Temperatura y humedad adecuadas para máxima absorción.",
    cultivosAplicables: ["Trigo", "Maíz"],
    prioridad: "media",
    categoria: "fertilizacion",
  },
  {
    id: "r4",
    titulo: "Preparación para cosecha",
    descripcion: "Los cultivos de tomate están en punto óptimo. Se recomienda iniciar cosecha antes de las lluvias previstas.",
    cultivosAplicables: ["Tomate"],
    prioridad: "alta",
    categoria: "cosecha",
  },
  {
    id: "r5",
    titulo: "Monitoreo de plagas",
    descripcion: "Las condiciones de humedad favorecen la proliferación de plagas. Incrementar monitoreo y considerar aplicación preventiva.",
    cultivosAplicables: ["Aguacate", "Tomate"],
    prioridad: "baja",
    categoria: "proteccion",
  },
];

// Datos históricos para gráficas (últimos 7 días)
export const historicoTemperatura = [
  { dia: "Mar 3", min: 10, max: 24 },
  { dia: "Mar 4", min: 12, max: 26 },
  { dia: "Mar 5", min: 11, max: 25 },
  { dia: "Mar 6", min: 9, max: 22 },
  { dia: "Mar 7", min: 8, max: 20 },
  { dia: "Mar 8", min: 7, max: 21 },
  { dia: "Mar 9", min: 8, max: 22 },
];

export const historicoPrecipitacion = [
  { dia: "Mar 3", mm: 0 },
  { dia: "Mar 4", mm: 5 },
  { dia: "Mar 5", mm: 15 },
  { dia: "Mar 6", mm: 0 },
  { dia: "Mar 7", mm: 2 },
  { dia: "Mar 8", mm: 0 },
  { dia: "Mar 9", mm: 0 },
];

export const distribucionCultivos = [
  { nombre: "Maíz", hectareas: 150, porcentaje: 25 },
  { nombre: "Trigo", hectareas: 200, porcentaje: 33.3 },
  { nombre: "Frijol", hectareas: 80, porcentaje: 13.3 },
  { nombre: "Tomate", hectareas: 50, porcentaje: 8.3 },
  { nombre: "Aguacate", hectareas: 120, porcentaje: 20 },
];

export const totalHectareas = cultivos.reduce((sum, c) => sum + c.hectareas, 0);
