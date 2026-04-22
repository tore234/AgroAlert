import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../firebase";

interface DebugInfo {
  isAuthenticated: boolean;
  userId: string | null;
  firestoreConnected: boolean;
  error: string | null;
  collectionsAccessible: {
    cultivos: boolean;
    alertas_config: boolean;
    usuarios_campo: boolean;
  };
}

export function useFirebaseDebug(): DebugInfo {
  const { user, uid } = useAuth();
  const [info, setInfo] = useState<DebugInfo>({
    isAuthenticated: false,
    userId: null,
    firestoreConnected: false,
    error: null,
    collectionsAccessible: {
      cultivos: false,
      alertas_config: false,
      usuarios_campo: false,
    },
  });

  useEffect(() => {
    const debugCheck = async () => {
      if (!uid) {
        setInfo((prev) => ({
          ...prev,
          isAuthenticated: false,
          userId: null,
          error: "No hay usuario autenticado",
        }));
        return;
      }

      try {
        // Verificar acceso a colecciones
        const collections = ["cultivos", "alertas_config", "usuarios_campo"];
        const accessible: Record<string, boolean> = {};

        for (const col of collections) {
          try {
            const snap = await getDocs(
              query(
                collection(db, "usuarios", uid, col),
                limit(1)
              )
            );
            accessible[col] = true;
          } catch (err) {
            console.warn(`No se puede acceder a ${col}:`, err);
            accessible[col] = false;
          }
        }

        setInfo({
          isAuthenticated: true,
          userId: uid,
          firestoreConnected: true,
          error: null,
          collectionsAccessible: accessible as any,
        });
      } catch (error) {
        console.error("Error en debug check:", error);
        setInfo((prev) => ({
          ...prev,
          isAuthenticated: true,
          userId: uid,
          firestoreConnected: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        }));
      }
    };

    const timer = setTimeout(debugCheck, 500);
    return () => clearTimeout(timer);
  }, [uid]);

  return info;
}
