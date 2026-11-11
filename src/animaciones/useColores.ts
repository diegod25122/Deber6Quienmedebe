// Lee los colores de global.css desde JavaScript. Reanimated los necesita como
// valor real (#rrggbb) para interpolar; así no se repiten en otro archivo.
import { useCSSVariable } from 'uniwind';

export type NombreColor =
  | 'tinta' | 'tinta-suave' | 'papel' | 'hoja' | 'renglon' | 'margen' | 'tenue' | 'borde' | 'blanco'
  | 'ambar' | 'ambar-hondo' | 'ambar-claro' | 'debe' | 'debe-claro' | 'pago' | 'pago-claro' | 'pronto';

export function useColor(nombre: NombreColor): string {
  const v = useCSSVariable(`--color-${nombre}`);
  return typeof v === 'string' && v ? v : '#000000';
}

export function useColores<const T extends readonly NombreColor[]>(nombres: T): Record<T[number], string> {
  const valores = useCSSVariable(nombres.map((n) => `--color-${n}`));
  const salida = {} as Record<T[number], string>;
  nombres.forEach((n, i) => {
    const v = Array.isArray(valores) ? valores[i] : undefined;
    salida[n as T[number]] = typeof v === 'string' && v ? v : '#000000';
  });
  return salida;
}
