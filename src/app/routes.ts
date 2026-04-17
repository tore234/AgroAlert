import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
// Cambiamos 'Dashboard' por 'DashboardPrincipal' para que coincida con tu archivo
import { DashboardPrincipal } from "./components/Dashboard"; 
import { MonitoreoTiempoReal } from "./components/MonitoreoTiempoReal";
import { AlertasPersonalizadas } from "./components/AlertasPersonalizadas";
import { PronosticosExtendidos } from "./components/PronosticosExtendidos";
import { MapasVisualizacion } from "./components/MapasVisualizacion";
import { RecomendacionesSeguridad } from "./components/RecomendacionesSeguridad";
import { GestionCultivos } from "./components/GestionCultivos";
import { GestionUsuarios } from "./components/GestionUsuarios";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // Aquí también usamos DashboardPrincipal
      { index: true, Component: DashboardPrincipal }, 
      { path: "monitoreo", Component: MonitoreoTiempoReal },
      { path: "alertas", Component: AlertasPersonalizadas },
      { path: "pronosticos", Component: PronosticosExtendidos },
      { path: "mapas", Component: MapasVisualizacion },
      { path: "recomendaciones", Component: RecomendacionesSeguridad },
      { path: "cultivos", Component: GestionCultivos },
      { path: "usuarios", Component: GestionUsuarios },
    ],
  },
]);