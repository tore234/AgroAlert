import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, setDoc, serverTimestamp, query, orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Subcollection path: /{col}/{uid}/items */
const col = (uid: string, name: string) =>
  collection(db, name, uid, "items");

const docRef = (uid: string, name: string, id: string) =>
  doc(db, name, uid, "items", id);

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
  const snap = await getDocs(col(uid, "alertas_historial"));
  const batch = snap.docs.filter((d) => d.data().nombre_cultivo === cultivo);
  await Promise.all(batch.map((d) => deleteDoc(d.ref)));
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

export async function saveNodos(uid: string, sensores: NodoSensor[]): Promise<void> {
  await setDoc(doc(db, "nodos", uid), { sensores, updatedAt: serverTimestamp() });
}
