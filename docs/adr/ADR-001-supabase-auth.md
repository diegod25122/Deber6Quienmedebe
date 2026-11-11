# ADR-001: Supabase Auth con `@supabase/supabase-js` para el login con correo

## Estado
Aceptado.

## Fecha
2026-11-09

## Requisitos relacionados
Deber 6 · Parte 1: crear usuario (guardado en Supabase Auth), iniciar sesión y recuperar la contraseña.

## Contexto
El deber pide que los usuarios se creen en Supabase por medio de Supabase Auth. La app se prueba en Expo Go (SDK 57) y se compila con EAS. La sesión debe seguir abierta al cerrar la app.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `@supabase/supabase-js` con AsyncStorage | JavaScript puro: funciona en Expo Go. Trae `signUp`, `signInWithPassword`, `resetPasswordForEmail`, `verifyOtp`, `updateUser`, `signInWithOAuth`. La sesión se guarda en AsyncStorage y se refresca sola. | Necesita `react-native-url-polyfill` en React Native. |
| Llamar a la API REST de Supabase Auth con `fetch` | Sin dependencias. | Habría que guardar y refrescar los tokens a mano. |
| Firebase Authentication | Ya se usó en el Deber 5. | El deber pide Supabase. |

## Decisión
- `src/lib/supabase.ts`: `createClient` con `storage: AsyncStorage`, `persistSession`, `autoRefreshToken` y `detectSessionInUrl: false`. El refresco se pausa con la app en segundo plano (`AppState`).
- `src/state/sesion.tsx`: único lugar que llama a `supabase.auth`. `onAuthStateChange` es la fuente de verdad y `Stack.Protected` en `src/app/_layout.tsx` decide qué pantallas se ven.
- En Supabase, "Confirm email" está apagado: al crear la cuenta el usuario entra de una vez. El nombre se guarda en `user_metadata.nombre`.
- Los valores van en `.env.local` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`); `.easignore` los incluye en el APK.

## Consecuencias
- Los usuarios aparecen en Supabase → Authentication → Users.
- Desventaja: sin confirmar el correo, alguien podría registrarse con un correo ajeno. Para una app real habría que encender "Confirm email".
- Riesgo: si `.env.local` falta o tiene la key incompleta, el login muestra el aviso "Falta configurar Supabase".

## Verificación
- Crear una cuenta en la app → aparece en Authentication → Users.
- Cerrar y abrir la app → sigue dentro.

## Uso de IA
Se le pidió a la IA aplicar la misma lógica del taller de Firebase con Supabase. Propuso mantener `Stack.Protected` y concentrar las llamadas en `sesion.tsx`; se aceptó.
