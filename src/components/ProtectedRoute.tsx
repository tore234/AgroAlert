import { ReactNode } from "react";
import { useUserRole, hasPermission } from "../hooks/useUserRole";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "administrador" | "operador" | "consultor" | ("administrador" | "operador" | "consultor")[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { rol, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2" />
          <p className="text-gray-500">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!requiredRole) {
    return <>{children}</>;
  }

  if (!hasPermission(rol, requiredRole)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center space-y-4 bg-white p-8 rounded-2xl shadow-lg max-w-md">
            <div className="text-5xl">🔒</div>
            <h2 className="text-2xl font-black text-gray-900">Acceso Denegado</h2>
            <p className="text-gray-600">
              Tu rol (<span className="font-bold">{rol}</span>) no tiene permiso para acceder a esta sección.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-bold mb-1">Rol requerido:</p>
              <p>{Array.isArray(requiredRole) ? requiredRole.join(", ") : requiredRole}</p>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
