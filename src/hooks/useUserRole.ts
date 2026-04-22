import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export type UserRole = "administrador" | "operador" | "consultor" | null;

// Emails con rol fijo — tienen prioridad sobre cualquier dato en Firestore
export const ROLE_EMAIL_MAP: Record<string, "administrador" | "operador" | "consultor"> = {
  "adm.agroalert@gmail.com":  "administrador",
  "oper.agroalert@gmail.com": "operador",
};

export function useUserRole() {
  const { uid, user } = useAuth();
  const [rol, setRol] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !user) {
      setRol(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const email = user.email ?? "";
        const rolFijo = ROLE_EMAIL_MAP[email.toLowerCase()];

        if (rolFijo) {
          // Email conocido: garantizar que Firestore tenga el rol correcto
          const ref = doc(db, "usuarios", uid, "usuarios_campo", uid);
          const snap = await getDoc(ref);
          if (!snap.exists() || snap.data().rol !== rolFijo) {
            await setDoc(ref, {
              nombre:          email.split("@")[0],
              correo:          email,
              telefono:        "",
              rol:             rolFijo,
              zona:            "Centro",
              estado:          "Activo",
              fecha_registro:  snap.exists() ? snap.data().fecha_registro : new Date().toISOString(),
            }, { merge: true });
          }
          setRol(rolFijo);
          return;
        }

        // Usuario normal: leer rol desde Firestore
        const ref = doc(db, "usuarios", uid, "usuarios_campo", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRol((snap.data().rol as UserRole) || "consultor");
        } else {
          setRol("consultor");
        }
      } catch (error) {
        console.error("Error obteniendo rol:", error);
        setRol("consultor");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [uid]);

  return { rol, loading };
}

// Función auxiliar para verificar permisos
export function hasPermission(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRole) return false;
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(userRole);
}

// Permisos por rol
export const rolePermissions: Record<string, string[]> = {
  administrador: [
    "dashboard",
    "monitoreo",
    "mapas",
    "cultivos",
    "usuarios",
    "pronosticos",
    "recomendaciones",
    "alertas",
    "reles",
  ],
  operador: [
    "dashboard",
    "monitoreo",
    "mapas",
    "cultivos",
    "alertas",
    "reles",
  ],
  consultor: [
    "dashboard",
    "monitoreo",
    "mapas",
    "pronosticos",
    "recomendaciones",
  ],
};
