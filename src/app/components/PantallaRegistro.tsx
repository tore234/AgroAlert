import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "../../ThemeContext";

interface PantallaRegistroProps {
  onSignUp: (email: string, password: string) => Promise<void>;
  onGoogleSignUp: () => Promise<void>;
  onBackToLogin: () => void;
  error: string;
}

export function PantallaRegistro({ 
  onSignUp, 
  onGoogleSignUp, 
  onBackToLogin, 
  error 
}: PantallaRegistroProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validaciones
    if (!nombre.trim()) {
      setLocalError("El nombre es requerido");
      return;
    }

    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSignUp(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await onGoogleSignUp();
    } finally {
      setGoogleLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-900 flex items-center justify-center p-6 relative">
      {/* BOTÓN TEMA */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
      >
        {theme === "light" ? (
          <Moon size={20} className="text-slate-700" />
        ) : (
          <Sun size={20} className="text-yellow-400" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* CARD PRINCIPAL */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border-b-4 border-emerald-500">
          {/* HEADER CON GRADIENTE */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-600 dark:from-slate-800 dark:to-emerald-600 px-8 py-10 text-center relative">
            <button
              onClick={onBackToLogin}
              className="absolute left-6 top-6 text-emerald-200 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl font-black text-white mb-2">
              Agro<span className="text-emerald-300">Alert</span>
            </h1>
            <p className="text-emerald-200 text-sm font-semibold tracking-widest uppercase">
              Crear Nueva Cuenta
            </p>
          </div>

          {/* CONTENIDO */}
          <div className="px-8 py-8">
            {/* MENSAJE DE ERROR */}
            {displayError && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                <p className="text-red-600 dark:text-red-400 font-semibold text-sm">{displayError}</p>
              </div>
            )}

            {/* FORM REGISTRO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* INPUT NOMBRE */}
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-all font-medium text-sm text-slate-900 dark:text-white"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              {/* INPUT EMAIL */}
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-all font-medium text-sm text-slate-900 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* INPUT PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-all font-medium text-sm text-slate-900 dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* INPUT CONFIRMAR PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar Contraseña"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-all font-medium text-sm text-slate-900 dark:text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* BOTÓN CREAR CUENTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>

            {/* SEPARADOR */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">O REGISTRATE CON</span>
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
            </div>

            {/* BOTÓN GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full py-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <FcGoogle size={24} />
              {googleLoading ? "Conectando..." : "Registrate con Google"}
            </button>

            {/* ENLACE LOGIN */}
            <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-sm">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-8">
          <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold">
            🔐 Tu información está segura con <span className="text-emerald-600 dark:text-emerald-400 font-bold">Firebase</span>
          </p>
        </div>
      </div>
    </div>
  );
}
