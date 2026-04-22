# 🔒 Guía de Configuración de Firestore Security Rules

## Paso 1: Aplicar las reglas en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Firestore Database**
4. Haz clic en la pestaña **"Rules"**
5. **Reemplaza el contenido actual** con el contenido del archivo `firestore.rules`
6. Haz clic en **"Publish"**

## Paso 2: Verificar la estructura de Firestore

Después de aplicar las reglas, la estructura debe verse así:

```
usuarios/
  └─ {uid_del_usuario}/
      ├─ cultivos/
      │  ├─ documento1
      │  ├─ documento2
      │  └─ ...
      ├─ alertas_config/
      │  ├─ documento1
      │  └─ ...
      ├─ alertas_historial/
      │  └─ ...
      ├─ usuarios_campo/
      │  └─ ...
      └─ nodos_config/
         └─ main
```

## Paso 3: Probar en la consola de Firestore

1. Crea un documento de prueba manualmente en `usuarios/{tu_uid}/cultivos/`
2. Agrega estos campos:
   ```json
   {
     "nombre": "Maíz de prueba",
     "zona": "Zona A",
     "hectareas": 10,
     "fechaSiembra": "2024-04-01",
     "estado": "activo",
     "coordenadas": {
       "lat": 20.4,
       "lng": -100.3
     }
   }
   ```

## Paso 4: Autorización de usuarios

Las reglas permiten que **cada usuario solo vea y modifique sus propios datos**. 
Asegúrate de que los usuarios se registren correctamente con Firebase Authentication.

## Troubleshooting

### ❌ Error: "Permission denied"
- Verifica que el usuario esté autenticado (`onAuthStateChanged` debe devolver un usuario)
- Confirma que las reglas estén publicadas correctamente
- Revisa la consola del navegador para más detalles

### ❌ Error: "Collection not found"
- Firestore crea collections automáticamente al agregar el primer documento
- Intenta crear manualmente un documento en `usuarios/{uid}/cultivos/`

### ✅ Verificar que funciona
Abre la consola del navegador y ejecuta:
```javascript
import { getAuth } from "firebase/auth";
const user = getAuth().currentUser;
console.log("Usuario autenticado:", user?.uid);
```
