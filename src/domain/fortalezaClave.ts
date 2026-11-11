// Indicador de seguridad de la contraseña mientras se escribe.
// Suma un punto por: 8+, 12+, mayúsculas y minúsculas, número, símbolo.

export type NivelClave = 'vacia' | 'debil' | 'media' | 'fuerte';

export interface Fortaleza {
  nivel: NivelClave;
  valor: 0 | 1 | 2 | 3; // barras encendidas
  sugerencia: string | null;
}

const COMUNES = ['12345678', '123456789', 'password', 'contraseña', 'qwertyui', 'abcdefgh', '11111111', 'ecuador1', 'iloveyou'];

export const TEXTO_NIVEL: Record<NivelClave, string> = {
  vacia: '',
  debil: 'Débil',
  media: 'Media',
  fuerte: 'Fuerte',
};

export function evaluarFortaleza(clave: string): Fortaleza {
  if (!clave) return { nivel: 'vacia', valor: 0, sugerencia: null };

  const sugerencias: string[] = [];
  let puntos = 0;
  if (clave.length >= 8) puntos++;
  else sugerencias.push('usa al menos 8 caracteres');
  if (clave.length >= 12) puntos++;
  if (/[a-z]/.test(clave) && /[A-Z]/.test(clave)) puntos++;
  else sugerencias.push('mezcla mayúsculas y minúsculas');
  if (/\d/.test(clave)) puntos++;
  else sugerencias.push('agrega un número');
  if (/[^A-Za-z0-9]/.test(clave)) puntos++;
  else sugerencias.push('agrega un símbolo como # o !');

  const comun = COMUNES.includes(clave.toLowerCase());
  const repetida = /^(.)\1+$/.test(clave);
  const sugerencia = sugerencias.length ? `Para mejorarla: ${sugerencias.slice(0, 2).join(' y ')}.` : null;

  if (clave.length < 8 || comun || repetida) {
    return { nivel: 'debil', valor: 1, sugerencia: comun || repetida ? 'Es una contraseña muy fácil de adivinar.' : sugerencia };
  }
  if (puntos >= 4) return { nivel: 'fuerte', valor: 3, sugerencia: null };
  if (puntos === 3) return { nivel: 'media', valor: 2, sugerencia };
  return { nivel: 'debil', valor: 1, sugerencia };
}
