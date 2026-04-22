# ✅ CRUD de Firebase - Estado Actual

## Lo que hemos corregido:

### 1. ✅ Estructura de Firestore
- **Antes:** `/cultivos/{uid}/items/{id}` (INCORRECTO)
- **Ahora:** `/usuarios/{uid}/cultivos/{id}` (CORRECTO)
- Esto aplica a todas las colecciones: cultivos, alertas_config, usuarios_campo, etc.

### 2. ✅ Funciones CRUD Completas
Tu `firestoreService.ts` ahora tiene:

#### Cultivos
- `getCultivos(uid)` - Leer todos ✓
- `saveCultivo(uid, data, id?)` - Crear/Actualizar ✓
- `deleteCultivo(uid, id)` - Eliminar ✓

#### Alertas - Configuración
- `getAlertasConfig(uid)` - Leer todas ✓
- `saveAlertaConfig(uid, data, id?)` - Crear/Actualizar ✓
- `deleteAlertaConfig(uid, id)` - Eliminar ✓

#### Alertas - Historial
- `getAlertasHistorial(uid)` - Leer historial ✓
- `addAlertaHistorial(uid, data)` - Registrar alerta ✓
- `deleteAlertasHistorialByCultivo(uid, cultivo)` - Limpiar historial ✓

#### Usuarios de Campo
- `getUsuariosCampo(uid)` - Leer todos ✓
- `saveUsuarioCampo(uid, data, id?)` - Crear/Actualizar ✓
- `deleteUsuarioCampo(uid, id)` - Eliminar ✓

#### Nodos/Sensores
- `getNodos(uid)` - **NUEVA** ✓
- `saveNodos(uid, sensores)` - Actualizado ✓

### 3. ✅ Reglas de Seguridad de Firestore
- Archivo `firestore.rules` creado
- Cada usuario solo puede acceder a sus propios datos
- Instrucciones en `FIRESTORE_RULES_SETUP.md`

### 4. ✅ Hook de Debug
- Nuevo hook `useFirebaseDebug.ts`
- Verifica autenticación y acceso a colecciones
- Útil para troubleshooting

---

## 📋 Siguientes pasos (IMPORTANTE):

### Paso 1: Crear archivo `.env`
1. Copia el contenido de `.env.example`
2. Crea un archivo `.env` en la raíz del proyecto
3. Rellena tus credenciales de Firebase:
   ```
   VITE_FIREBASE_API_KEY=tu_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   # ... resto de variables
   ```

### Paso 2: Aplicar Firestore Rules
1. Ve a Firebase Console → Firestore → Rules
2. Reemplaza el contenido con las reglas de `firestore.rules`
3. Haz clic en "Publish"

### Paso 3: Crear usuarios de prueba
1. Firebase Console → Authentication → Users
2. Crea un usuario de prueba
3. Usa esas credenciales para iniciar sesión

### Paso 4: Probar en tu app
1. Ejecuta `npm run dev`
2. Registra o inicia sesión con el usuario de prueba
3. Prueba crear un cultivo en "Gestión de Cultivos"
4. Si funciona → **¡TODO OK!** ✓

---

## 🔍 Verificar que funciona

### En la consola del navegador:
```javascript
// 1. Ver si el usuario está autenticado
import { auth } from '/src/firebase'
console.log(auth.currentUser)

// 2. Ver estructura de Firestore (desde Firebase Console)
// Navega a: usuarios → {tu_uid} → cultivos
```

### Errores comunes:

| Problema | Solución |
|----------|----------|
| "Permission denied" | Verifica `.env` y aplica las reglas de Firestore |
| No aparecen cultivos | Usuario no autenticado o estructura incorrecta |
| Error al guardar | Revisa que `.env` tenga todas las variables |

---

## 📁 Archivos Nuevos/Modificados

- ✅ `/src/services/firestoreService.ts` - CORREGIDA
- ✅ `/firestore.rules` - NUEVA
- ✅ `/FIRESTORE_RULES_SETUP.md` - NUEVA
- ✅ `/src/hooks/useFirebaseDebug.ts` - NUEVA
- ⏳ `.env` - NECESITA SER CREADA

¡Listo para usar! 🚀
