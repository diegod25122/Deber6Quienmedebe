// Validaciones del login (funciones puras: se prueban con Jest).

export const LONGITUD_MINIMA_CLAVE = 8; // la misma que en Supabase → Email
export const LONGITUD_CODIGO = 6; // Email OTP length en Supabase

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarCorreo(correo: string): string | null {
  const c = correo.trim();
  if (!c) return 'Escribe tu correo.';
  if (!PATRON_CORREO.test(c)) return 'Ese correo no parece válido.';
  return null;
}

export function validarClave(clave: string): string | null {
  if (!clave) return 'Escribe tu contraseña.';
  if (clave.length < LONGITUD_MINIMA_CLAVE) return `Usa al menos ${LONGITUD_MINIMA_CLAVE} caracteres.`;
  return null;
}

export function validarConfirmacion(clave: string, repetida: string): string | null {
  if (!repetida) return 'Repite la contraseña.';
  if (clave !== repetida) return 'Las contraseñas no coinciden.';
  return null;
}

export function validarNombre(nombre: string): string | null {
  const n = nombre.trim();
  if (!n) return 'Escribe tu nombre.';
  if (n.length > 40) return 'Máximo 40 caracteres.';
  return null;
}

export function validarCodigo(codigo: string): string | null {
  const c = codigo.trim();
  if (!c) return 'Escribe el código del correo.';
  if (!new RegExp(`^\\d{${LONGITUD_CODIGO}}$`).test(c)) return `El código tiene ${LONGITUD_CODIGO} números.`;
  return null;
}

export type Errores<K extends string> = Partial<Record<K, string>>;

export function hayErrores<K extends string>(e: Errores<K>): boolean {
  return Object.values(e).some(Boolean);
}
