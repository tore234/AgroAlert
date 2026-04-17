import { Link, Outlet, useLocation } from "react-router";
import { 
  Cloud, 
  Bell, 
  Calendar, 
  Map, 
  Shield, 
  Sprout, 
  Users, 
  LayoutDashboard,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Monitoreo en Tiempo Real", href: "/monitoreo", icon: Cloud },
  { name: "Alertas Personalizadas", href: "/alertas", icon: Bell },
  { name: "Pronósticos Extendidos", href: "/pronosticos", icon: Calendar },
  { name: "Mapas y Visualización", href: "/mapas", icon: Map },
  { name: "Recomendaciones", href: "/recomendaciones", icon: Shield },
  { name: "Gestión de Cultivos", href: "/cultivos", icon: Sprout },
  { name: "Gestión de Usuarios", href: "/usuarios", icon: Users },
];

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-svh bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-green-800">AgroClima Alert</h1>
                <p className="hidden sm:block text-sm text-gray-600">Sistema de Alertas Climáticas</p>
              </div>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden lg:block bg-white/90 border-r border-gray-200 transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="p-3 border-b border-gray-200 flex items-center justify-end">
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
              aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Comprimir barra lateral"}
              title={sidebarCollapsed ? "Expandir" : "Comprimir"}
            >
              {sidebarCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = isRouteActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${sidebarCollapsed ? "justify-center" : "gap-3"}
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium leading-snug">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40"
              aria-label="Cerrar menú móvil"
            />
            <div className="absolute top-0 right-0 h-full w-[85%] max-w-xs bg-white shadow-xl overflow-y-auto pt-20 px-4 pb-6">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = isRouteActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium leading-snug">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
