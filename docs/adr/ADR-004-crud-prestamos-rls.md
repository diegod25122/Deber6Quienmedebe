# ADR-004: CRUD de préstamos en una tabla de Supabase protegida con RLS

## Estado
Aceptado.

## Fecha
2026-11-09

## Requisitos relacionados
Deber 6 · Parte 2: CRUD completo con Supabase (tema libre: "¿Quién me debe?", préstamos entre amigos) y cambio de contraseña con la sesión abierta.

## Contexto
Cada usuario anota a quién le prestó dinero u objetos. Nadie debe ver los préstamos de otro. La app usa la publishable key, que es pública.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Tabla `prestamos` con RLS (`auth.uid() = user_id`) | La base de datos impide leer o cambiar préstamos ajenos, aunque alguien use la key desde otro programa. `user_id` lo pone Postgres (`default auth.uid()`). | Hay que escribir las políticas en SQL. |
| Filtrar por `user_id` solo en la app | Más simple. | Inseguro: con la key pública cualquiera podría leer todo. |

## Decisión
- `supabase/esquema.sql`: tabla `prestamos` con restricciones (`tipo` dinero u objeto, monto > 0, fecha límite ≥ fecha del préstamo), trigger de `actualizado_en`, RLS y cuatro políticas (select, insert, update, delete) para `authenticated`.
- `src/data/prestamos.ts`: `listarPrestamos`, `obtenerPrestamo`, `crearPrestamo`, `actualizarPrestamo`, `marcarDevuelto`, `eliminarPrestamo`.
- `src/data/hooks.ts`: TanStack Query guarda la lista y la vuelve a pedir después de cada cambio.
- Reglas en funciones puras (`src/domain/prestamo.ts`): estado (pendiente, vence pronto, atrasado, devuelto), resumen, filtros y validación del formulario.
- Cambio de contraseña (`src/app/(app)/cambiar-clave.tsx`): se comprueba la actual con `signInWithPassword` y se cambia con `updateUser`. Las cuentas de Google no tienen contraseña; la pantalla lo explica.

## Consecuencias
- Un usuario no puede ver ni borrar préstamos de otro, ni siquiera llamando a la API directamente.
- Desventaja: sin internet no se pueden ver los préstamos (no hay copia local); la app lo avisa.

## Verificación
- Entrar con dos cuentas distintas: cada una ve solo sus préstamos.
- `npm test`: `src/domain/__tests__/prestamo.test.ts`.

## Uso de IA
Se le pidió a la IA proponer temas sin fotos; se eligió "¿Quién me debe?". La IA escribió el SQL con RLS y se revisó que cada política use `auth.uid()`.
