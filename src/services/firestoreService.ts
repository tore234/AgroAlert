import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, setDoc, serverTimestamp, query, orderBy,
  Timestamp, where,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Role map global ────────────────────────────────────────────────────────
// /global/role_assignments  →  { "email@x.com": "administrador" | "operador" }
// Solo se almacenan roles elevados; consultor es el default implícito.

const ROLE_MAP_REF = () => doc(db, "global", "role_assignments");

export async function getGlobalRoleMap(): Promise<Record<string, string>> {
  try {
    const snap = await getDoc(ROLE_MAP_REF());
    return snap.exists() ? (snap.data() as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function setGlobalEmailRole(
  email: string,
  rol: "administrador" | "operador"
): Promise<void> {
  await setDoc(ROLE_MAP_REF(), { [email.toLowerCase()]: rol }, { merge: true });
}

export async function removeGlobalEmailRole(email: string): Promise<void> {
  const { deleteField } = await import("firebase/firestore");
  await setDoc(ROLE_MAP_REF(), { [email.toLowerCase()]: deleteField() }, { merge: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Subcollection path: /usuarios/{uid}/{name} */
const col = (uid: string, name: string) =>
  collection(db, "usuarios", uid, name);

const docRef = (uid: string, name: string, id: string) =>
  doc(db, "usuarios", uid, name, id);

// ── Inicializar Perfil de Usuario ─────────────────────────────────────────

export async function initializeUserProfile(
  uid: string,
  email: string,
  rol: "administrador" | "operador" | "consultor" = "consultor"
): Promise<void> {
  try {
    const ref = doc(db, "usuarios", uid, "usuarios_campo", uid);
    const snap = await getDoc(ref);
    // Solo crear si no existe para no sobreescribir datos editados manualmente
    if (!snap.exists()) {
      await setDoc(ref, {
        nombre: email.split("@")[0],
        correo: email,
        telefono: "",
        rol,
        zona: "Centro",
        estado: "Activo",
        fecha_registro: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error inicializando perfil de usuario:", error);
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Cultivo {
  id: string;
  nombre: string;
  zona: string;
  hectareas: number;
  fechaSiembra: string;
  estado: "activo" | "en_desarrollo" | "cosecha";
  coordenadas: { lat: number; lng: number };
}

export interface ConfigAlerta {
  id: string;
  cultivo: string;
  zona: string;
  tipoAlerta: string[];
  umbralTemp: number;
  umbralLluvia: number;
}

export interface AlertaHistorial {
  id: string;
  nombre_cultivo: string;
  tipo_evento: string;
  zona: string;
  valor_clima: number;
  fecha_deteccion: string;
}

export interface UsuarioCampo {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: "administrador" | "operador" | "consultor";
  zona: string;
  estado: string;
  fecha_registro: string;
}

export interface NodoSensor {
  nombre: string;
  estado: string;
}

export interface Rele {
  id: string;
  nombre: string;
  zona: string;
  estado: "encendido" | "apagado";
  modo: "manual" | "automatico";
  cultivo_asociado: string;
  descripcion: string;
  ultima_activacion: string;
}

// ── Cultivos ───────────────────────────────────────────────────────────────

export async function getCultivos(uid: string): Promise<Cultivo[]> {
  const snap = await getDocs(query(col(uid, "cultivos"), orderBy("fechaSiembra", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cultivo));
}

export async function saveCultivo(uid: string, data: Omit<Cultivo, "id">, id?: string): Promise<void> {
  if (id) {
    await updateDoc(docRef(uid, "cultivos", id), { ...data });
  } else {
    await addDoc(col(uid, "cultivos"), { ...data });
  }
}

export async function deleteCultivo(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, "cultivos", id));
}

// ── Alertas — Configuraciones ──────────────────────────────────────────────

export async function getAlertasConfig(uid: string): Promise<ConfigAlerta[]> {
  const snap = await getDocs(col(uid, "alertas_config"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConfigAlerta));
}

export async function saveAlertaConfig(
  uid: string,
  data: Omit<ConfigAlerta, "id">,
  id?: string
): Promise<string> {
  if (id) {
    await updateDoc(docRef(uid, "alertas_config", id), { ...data });
    return id;
  } else {
    const ref = await addDoc(col(uid, "alertas_config"), { ...data });
    return ref.id;
  }
}

export async function deleteAlertaConfig(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, "alertas_config", id));
}

// ── Alertas — Historial ────────────────────────────────────────────────────

export async function getAlertasHistorial(uid: string): Promise<AlertaHistorial[]> {
  const snap = await getDocs(
    query(col(uid, "alertas_historial"), orderBy("fecha_deteccion", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AlertaHistorial));
}

export async function addAlertaHistorial(
  uid: string,
  data: Omit<AlertaHistorial, "id">
): Promise<void> {
  await addDoc(col(uid, "alertas_historial"), { ...data });
}

export async function deleteAlertasHistorialByCultivo(
  uid: string,
  cultivo: string
): Promise<void> {
  try {
    const snap = await getDocs(col(uid, "alertas_historial"));
    const batch = snap.docs.filter((d) => d.data().nombre_cultivo === cultivo);
    if (batch.length > 0) {
      await Promise.all(batch.map((d) => deleteDoc(d.ref)));
    }
  } catch (error) {
    console.error(`Error eliminando historial para cultivo ${cultivo}:`, error);
  }
}

// ── Usuarios de campo ─────────────────────────────────────────────────────

export async function getUsuariosCampo(uid: string): Promise<UsuarioCampo[]> {
  const snap = await getDocs(query(col(uid, "usuarios_campo"), orderBy("fecha_registro", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UsuarioCampo));
}

export async function saveUsuarioCampo(
  uid: string,
  data: Omit<UsuarioCampo, "id">,
  id?: string
): Promise<void> {
  if (id) {
    await updateDoc(docRef(uid, "usuarios_campo", id), { ...data });
  } else {
    await addDoc(col(uid, "usuarios_campo"), { ...data });
  }
}

export async function deleteUsuarioCampo(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, "usuarios_campo", id));
}

// ── Nodos / Sensores ───────────────────────────────────────────────────────

// ── Relés ──────────────────────────────────────────────────────────────────

export async function getReles(uid: string): Promise<Rele[]> {
  const snap = await getDocs(query(col(uid, "reles"), orderBy("ultima_activacion", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Rele));
}

export async function saveRele(uid: string, data: Omit<Rele, "id">, id?: string): Promise<void> {
  if (id) {
    await updateDoc(docRef(uid, "reles", id), { ...data });
  } else {
    await addDoc(col(uid, "reles"), { ...data });
  }
}

export async function deleteRele(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, "reles", id));
}

export async function toggleReleEstado(uid: string, id: string, nuevoEstado: "encendido" | "apagado"): Promise<void> {
  await updateDoc(docRef(uid, "reles", id), {
    estado: nuevoEstado,
    ultima_activacion: new Date().toISOString(),
  });
}

// ── Nodos / Sensores ───────────────────────────────────────────────────────

export async function getNodos(uid: string): Promise<NodoSensor[]> {
  try {
    const snap = await getDocs(col(uid, "nodos"));
    return snap.docs.map((d) => ({ ...d.data() } as NodoSensor));
  } catch (error) {
    console.error("Error obteniendo nodos:", error);
    return [];
  }
}

export async function saveNodos(uid: string, sensores: NodoSensor[]): Promise<void> {
  await setDoc(doc(db, "usuarios", uid, "nodos_config", "main"), { 
    sensores, 
    updatedAt: serverTimestamp() 
  });
}
