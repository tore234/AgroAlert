import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useUserRole, UserRole } from "./useUserRole";
import { getPerfilUsuario, upsertPerfilUsuario } from "../services/firestoreService";

export interface CurrentUser {
  uid:        string | null;
  email:      string | null;
  nombre:     string;
  rol:        UserRole;
  rolLoading: boolean;
}

/**
 * Fuente única de verdad para identidad + rol + nombre del usuario.
 * Combina auth, rol de Firestore/hardcoded y perfil global.
 */
export function useCurrentUser(): CurrentUser {
  const { uid, user }         = useAuth();
  const { rol, loading: rolLoading } = useUserRole();
  const [nombre, setNombre]   = useState<string>("");

  useEffect(() => {
    if (!uid || !user) { setNombre(""); return; }

    const email = user.email ?? "";

    const cargar = async () => {
      // Intenta leer perfil global
      const perfil = await getPerfilUsuario(uid).catch(() => null);

      if (perfil?.nombre) {
        setNombre(perfil.nombre);
      } else {
        // Deriva nombre del email mientras no haya perfil
        const derived = email.split("@")[0].replace(/[._]/g, " ");
        setNombre(derived);
      }

      // Garantiza que el perfil global exista (sin sobreescribir datos editados)
      if (!perfil && rol && !rolLoading) {
        await upsertPerfilUsuario({
          uid,
          nombre:         email.split("@")[0].replace(/[._]/g, " "),
          correo:         email,
          rol:            rol as "administrador" | "operador" | "consultor",
          zona:           "Centro",
          estado:         "Activo",
          fecha_registro: new Date().toISOString(),
        }).catch(() => {});
      }
    };

    cargar();
  }, [uid, rol, rolLoading]);

  return {
    uid,
    email:  user?.email ?? null,
    nombre: nombre || (user?.email?.split("@")[0] ?? "Usuario"),
    rol,
    rolLoading,
  };
}
