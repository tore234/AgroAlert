# 🔥 Guía de Configuración Firebase

## Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Crear un proyecto"**
3. Nombre del proyecto: `AgroAlert` (o el que prefieras)
4. Acepta los términos y crea el proyecto

## Paso 2: Habilitar Authentication

1. En la consola, ve a **Authentication** (lado izquierdo)
2. Haz clic en **"Comenzar"**
3. Selecciona **"Correo electrónico/Contraseña"**
4. Habilita ambas opciones
5. Guarda los cambios

## Paso 3: Obtener credenciales

1. Ve a **Configuración del proyecto** (ícono de engranaje arriba a la derecha)
2. En la pestaña **"General"**, desplázate hacia abajo
3. En **"Tus aplicaciones"**, haz clic en **"</>" (Web)**
4. Registra la app con el nombre `AgroAlert`
5. Copia el objeto `firebaseConfig`

Verá algo así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "agroalert-xxxxx.firebaseapp.com",
  projectId: "agroalert-xxxxx",
  storageBucket: "agroalert-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Paso 4: Configurar en el proyecto

1. Abre el archivo `src/firebase.ts`
2. Reemplaza `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. con tus valores
3. Para Realtime Database, agrega `databaseURL` si la vas a usar

## Paso 5: Crear usuarios de prueba

1. En Firebase Console → **Authentication** → **Users**
2. Haz clic en **"Crear usuario"**
3. Ingresa:
   - Email: `admin@agroalert.com`
   - Password: `123456` (o la que prefieras)

## Paso 6: Probar la aplicación

1. Abre la terminal y ejecuta:
   ```bash
   npm run dev
   ```
2. La app debería compilar sin errores
3. Intenta login con el email y password que creaste

## 📱 Servicios disponibles

- ✅ **Firebase Auth**: Autenticación con correo/contraseña
- ✅ **Firestore**: Base de datos NoSQL (descomenta en firebase.ts si la necesitas)
- ✅ **Realtime Database**: Base de datos en tiempo real (descomenta en firebase.ts si la necesitas)

## 🔒 Seguridad

- Las credenciales están en `src/firebase.ts`
- Para producción, considera usar variables de entorno (`.env`)

## ❓ ¿Problemas?

Si ves errores de configuración:
1. Verifica que copié las credenciales correctamente
2. Revisa que el proyecto esté habilitado
3. Asegúrate de que Authentication esté activo
