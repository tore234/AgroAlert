import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Login con correo y contraseña
 */
export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Crear cuenta con correo y contraseña
 */
export const signUpWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Login con Google
 */
export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

/**
 * Logout
 */
export const logout = () => {
  return signOut(auth);
};

/**
 * Monitorear estado de autenticación
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
