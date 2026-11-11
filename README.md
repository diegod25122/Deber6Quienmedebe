# ¿Quién me debe?

Deber 6 · Desarrollo de Aplicaciones Móviles (ESFOT · EPN) · Diego David Camacho Molina

La libreta del fiado en el teléfono: anota a quién le prestaste dinero u objetos, cuándo te lo devuelven y quién está atrasado.

- **Parte 1 · Login profesional:** crear cuenta con correo (Supabase Auth), iniciar sesión, recuperar la contraseña con un código de 6 dígitos y "Continuar con Google" (OAuth de Supabase).
- **Parte 2 · CRUD con Supabase:** préstamos (crear, ver, editar, marcar devuelto, eliminar) protegidos con RLS, y cambio de contraseña con la sesión abierta.
- **Parte 3 · Diseño:** Uniwind (sin StyleSheet), 11 animaciones Lottie ligadas a estados reales y animaciones con Reanimated.

## Tecnologías

Expo SDK 57 · React Native 0.86 · Expo Router · TypeScript · Supabase (`@supabase/supabase-js`) · TanStack Query · Uniwind (Tailwind 4) · Lottie · Reanimated 4 · expo-web-browser · expo-network.

## Cómo ejecutarlo

1. Instala las dependencias y las librerías nuevas (las versiones las elige Expo para el SDK 57):

   ```bash
   npm install
   npx expo install @supabase/supabase-js react-native-url-polyfill expo-web-browser @react-native-community/datetimepicker @expo-google-fonts/bricolage-grotesque
   ```

2. Crea `.env.local` a partir de `.env.example` con la URL y la publishable key de tu proyecto de Supabase.
3. En Supabase → SQL Editor, ejecuta `supabase/esquema.sql`.
4. Arranca limpiando la caché:

   ```bash
   npx expo start -c
   ```

5. APK: `eas build -p android --profile preview`. `.easignore` incluye `.env.local` en la compilación.

## Configuración de Supabase y Google

| Dónde | Qué |
|---|---|
| Supabase → Sign In / Providers | Email activado, "Confirm email" apagado, "Secure password change" apagado, mínimo 8 caracteres, Email OTP length 6 |
| Supabase → Emails → SMTP Settings | SMTP con Gmail (contraseña de aplicación) |
| Supabase → Emails → Templates → Reset password | Plantilla con `{{ .Token }}` |
| Supabase → URL Configuration | Site URL `quienmedebe://`; Redirect URLs `exp://**`, `quienmedebe://**`, `http://localhost:8081/**` |
| Google Cloud → Google Auth Platform | Público externo con usuarios de prueba; cliente "Aplicación web" con la Callback URL de Supabase |
| Supabase → Providers → Google | Client ID y Client Secret de Google Cloud |

## Estructura

```
src/
  app/                  pantallas (Expo Router)
    _layout.tsx         fuentes, proveedores y Stack.Protected según la sesión
    login.tsx, crear-cuenta.tsx, recuperar.tsx, auth/callback.tsx
    (app)/index.tsx     la libreta (lista, resumen y filtros)
    (app)/prestamo/     nuevo, [id] (detalle) y editar/[id]
    (app)/cuenta.tsx, (app)/cambiar-clave.tsx
  lib/                  cliente de Supabase, Google OAuth, errores en español
  state/                sesión (Supabase Auth) y festejos con Lottie
  data/                 CRUD de préstamos y hooks de TanStack Query
  domain/               reglas puras (préstamos, validaciones, seguridad de la clave)
  components/           interfaz con Uniwind, Lottie y Reanimated
supabase/esquema.sql    tabla, RLS y políticas
docs/adr/               decisiones de arquitectura
```

## Pruebas

```bash
npm test
npm run typecheck
```
