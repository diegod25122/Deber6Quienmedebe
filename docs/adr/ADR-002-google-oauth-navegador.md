# ADR-002: "Continuar con Google" con OAuth de Supabase en el navegador (`expo-web-browser`)

## Estado
Aceptado.

## Fecha
2026-11-09

## Requisitos relacionados
Deber 6 · Parte 1: Social Login con Google usando el OAuth integrado de Supabase y un Client ID / Client Secret de Google Cloud.

## Contexto
El deber describe el flujo: tocar "Continuar con Google" → se abre el navegador con Google → el usuario elige su cuenta → vuelve a la app autenticado. Debe funcionar en Expo Go.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| `signInWithOAuth` + `WebBrowser.openAuthSessionAsync` | Es el flujo que pide el deber. Funciona en Expo Go. Google solo habla con Supabase: en Google Cloud basta un cliente "Aplicación web". | La app debe volver con un enlace propio (`quienmedebe://` o `exp://`) que esté permitido en Supabase → URL Configuration. |
| `@react-native-google-signin/google-signin` + `signInWithIdToken` | Selector de cuentas nativo, sin navegador. | No funciona en Expo Go (necesita development build) y pide clientes Android con la huella SHA-1. |

## Decisión
`src/lib/oauth.ts`:
1. `signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } })` devuelve la URL de Google.
2. `openAuthSessionAsync(url, redirectTo)` la abre y espera el regreso.
3. Se leen `access_token` y `refresh_token` de la URL (`src/lib/url.ts`) y se crea la sesión con `setSession` (o `exchangeCodeForSession` si llega un `code`).

`redirectTo = Linking.createURL('auth/callback')`: en Expo Go es `exp://IP:8081/--/auth/callback`; en el APK, `quienmedebe://auth/callback`. En Supabase se permiten `exp://**`, `quienmedebe://**` y `http://localhost:8081/**`. La ruta `src/app/auth/callback.tsx` atiende el caso en que Android abre la app con ese enlace.

## Consecuencias
- No se pide contraseña ni correo de confirmación.
- La app de Google Cloud está en modo "Prueba": solo entran los correos agregados como usuarios de prueba.
- Una cuenta de Google con el mismo correo que una cuenta creada con contraseña se une a ella (Supabase vincula identidades con el mismo correo verificado).

## Verificación
- "Continuar con Google" → elegir una cuenta de prueba → la app muestra la libreta.
- En Supabase → Users, el proveedor de esa cuenta es Google.
- `npm test`: `src/lib/__tests__/url.test.ts`.

## Uso de IA
La IA propuso el flujo con `expo-web-browser` según la guía de Supabase para Expo y la ruta `auth/callback` para Android; se aceptó.
