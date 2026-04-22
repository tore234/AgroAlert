import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getGlobalRoleMap } from "../services/firestoreService";

export type UserRole = "administrador" | "operador" | "consultor" | null;

// Emails hardcodeados con máxima prioridad (nunca se pueden degradar)
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
        const email = (user.email ?? "").toLowerCase();

        // 1️⃣ Prioridad máxima: emails hardcodeados
        const rolHardcoded = ROLE_EMAIL_MAP[email];
        if (rolHardcoded) {
          await ensureProfile(uid, email, rolHardcoded);
          setRol(rolHardcoded);
          return;
        }

        // 2️⃣ Mapa global gestionado por admins (/global/role_assignments)
        const globalMap = await getGlobalRoleMap();
        const rolGlobal = globalMap[email] as UserRole | undefined;
        if (rolGlobal) {
          await ensureProfile(uid, email, rolGlobal as "administrador" | "operador" | "consultor");
          setRol(rolGlobal);
          return;
        }

        // 3️⃣ Perfil propio en Firestore (fallback)
        const ref = doc(db, "usuarios", uid, "usuarios_campo", uid);
        const snap = await getDoc(ref);
        setRol(snap.exists() ? ((snap.data().rol as UserRole) || "consultor") : "consultor");
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

async function ensureProfile(
  uid: string,
  email: string,
  rol: "administrador" | "operador" | "consultor"
) {
  const ref = doc(db, "usuarios", uid, "usuarios_campo", uid);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().rol !== rol) {
    await setDoc(ref, {
      nombre:         email.split("@")[0],
      correo:         email,
      telefono:       snap.exists() ? snap.data().telefono  : "",
      zona:           snap.exists() ? snap.data().zona       : "Centro",
      estado:         snap.exists() ? snap.data().estado     : "Activo",
      fecha_registro: snap.exists() ? snap.data().fecha_registro : new Date().toISOString(),
      rol,
    }, { merge: true });
  }
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
