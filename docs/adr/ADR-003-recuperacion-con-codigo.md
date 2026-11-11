# ADR-003: Recuperar la contraseña con un código de 6 dígitos en vez de un enlace

## Estado
Aceptado.

## Fecha
2026-11-09

## Requisitos relacionados
Deber 6 · Parte 1: los usuarios creados con correo deben poder recuperar la contraseña.

## Contexto
Por defecto Supabase manda un enlace que abre una página web. Para que vuelva a la app, el enlace debe abrir `exp://...` o `quienmedebe://...` desde el correo, y en Expo Go eso falla con frecuencia. Además, el correo de Supabase sin SMTP propio solo permite 2 correos por hora y no deja editar las plantillas.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Código de 6 dígitos (`{{ .Token }}`) + `verifyOtp({ type: 'recovery' })` | Todo pasa dentro de la app. No depende de enlaces ni del navegador. | Hay que editar la plantilla "Reset password", y para eso hace falta SMTP propio. |
| Enlace mágico que abre la app | Es el comportamiento por defecto. | Frágil en Expo Go; hay que leer la sesión desde el enlace. |

## Decisión
- Supabase: SMTP con Gmail (contraseña de aplicación), "Email OTP length" en 6 y la plantilla "Reset password" con `{{ .Token }}`.
- `src/app/recuperar.tsx`: paso 1 pide el correo (`resetPasswordForEmail`); paso 2 pide el código y la nueva contraseña (`verifyOtp` + `updateUser`).
- `verifyOtp` abre la sesión antes de cambiar la contraseña. `sesion.tsx` marca `recuperando = true` para que `_layout` no entre a la app hasta terminar; si falla el cambio, cierra la sesión.

## Consecuencias
- El límite sube a 30 correos por hora (SMTP propio).
- Hay que esperar 60 segundos entre un código y otro (límite de Supabase); la pantalla muestra la cuenta regresiva.
- Desventaja: si Gmail bloquea el envío, la recuperación no llega; se revisa en Supabase → Logs → Auth.

## Verificación
- "¿Olvidaste tu contraseña?" → llega un correo con 6 números → con el código y una nueva contraseña, la app muestra "Contraseña cambiada" y entra.

## Uso de IA
La IA propuso el código en lugar del enlace para evitar problemas de deep links en Expo Go; se aceptó.
