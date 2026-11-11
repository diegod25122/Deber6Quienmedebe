# ADR-005: Diseño con Uniwind, 11 animaciones Lottie y Reanimated

## Estado
Aceptado.

## Fecha
2026-11-09

## Requisitos relacionados
Deber 6 · Parte 3: interfaz con Uniwind y Lottie, con mucho énfasis en ambos; atractiva, intuitiva y funcional.

## Contexto
La app trata de deudas entre amigos. La idea visual es la "libreta del fiado" de la tienda del barrio: hoja con renglones azules y margen rojo, tinta azul oscura, sellos de DEVUELTO y ATRASADO, y el ámbar de la animación de carga como color de acción.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
|---|---|---|
| Uniwind (Tailwind 4) + Lottie + Reanimated | Lo pide el deber. Los colores viven en `global.css` y se usan como clases (`bg-tinta`, `text-debe`). Lottie da animaciones ilustradas; Reanimated, las de la interfaz. | Hay que conocer las clases de Tailwind y leer los colores con `useCSSVariable` para Reanimated. |
| StyleSheet | Sin dependencias. | El deber pide Uniwind. |

## Decisión
- `global.css` con `@theme static`: colores de la libreta y la fuente Bricolage Grotesque (`font-display`) para títulos y montos.
- 11 animaciones Lottie (`src/components/Animacion.tsx`), cada una ligada a un estado real:

| Animación | Cuándo |
|---|---|
| `bienvenida` | Portada de login, crear cuenta y recuperar |
| `cargando` | Entrando, esperando a Google, cargando la libreta |
| `error` | Contraseña incorrecta, error al cargar |
| `cuenta-creada` | Al crear la cuenta |
| `correo-enviado` | Código de recuperación enviado |
| `clave-cambiada` | Contraseña cambiada (recuperada o desde Mi cuenta) |
| `lista-vacia` | Libreta sin préstamos |
| `exito` | Préstamo guardado o editado |
| `devuelto` | Al marcar "Ya me devolvió" |
| `eliminado` | Préstamo eliminado |
| `sin-conexion` | Barra de sin internet y error de red |

- Las confirmaciones se muestran en una capa encima de la navegación (`src/state/festejo.tsx`) que se cierra sola al terminar la animación.
- Reanimated: botones con resorte, sacudida en errores, sello que se estampa, total que sube contando, pastilla de filtros que se desliza, lista escalonada, barras del indicador de contraseña y barra de sin conexión que baja.

## Consecuencias
- Cada animación comunica algo; ninguna es solo adorno.
- Desventaja: los JSON de Lottie suman unos 500 KB a la app.

## Verificación
- Recorrer el flujo: login con error → crear cuenta → anotar → marcar devuelto → eliminar → modo avión.
- `grep -r "StyleSheet" src` no devuelve nada.

## Uso de IA
Las animaciones se descargaron de LottieFiles. La IA propuso en qué momento usar cada una y la idea visual de la libreta del fiado.
