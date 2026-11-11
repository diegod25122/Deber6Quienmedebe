// Traduce los errores de Supabase a mensajes en español que el usuario entiende.

interface ErrorConCodigo {
  code?: string;
  message?: string;
  status?: number;
}

const POR_CODIGO: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  clave_actual_incorrecta: 'La contraseña actual no es correcta.',
  cuenta_no_existe: 'No hay ninguna cuenta con ese correo. Revisa que esté bien escrito o crea una cuenta.',
  cuenta_google: 'Esa cuenta entra con Google y no tiene contraseña. Usa «Continuar con Google».',
  user_already_exists: 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.',
  email_exists: 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.',
  weak_password: 'La contraseña es muy débil: usa al menos 8 caracteres.',
  same_password: 'La nueva contraseña debe ser distinta de la actual.',
  otp_expired: 'El código no es válido o ya venció. Pide uno nuevo.',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Espera un minuto e inténtalo de nuevo.',
  over_request_rate_limit: 'Demasiados intentos seguidos. Espera un momento.',
  email_address_invalid: 'Ese correo no es válido.',
  validation_failed: 'Revisa los datos: alguno no tiene el formato correcto.',
  user_not_found: 'No hay una cuenta con ese correo.',
  provider_disabled: 'El inicio con Google no está activado en Supabase.',
  bad_oauth_callback: 'Google no completó el inicio de sesión. Inténtalo de nuevo.',
  // La función tipo_de_cuenta no existe: falta ejecutar supabase/esquema.sql.
  PGRST202: 'Falta crear la función tipo_de_cuenta en Supabase (ejecuta supabase/esquema.sql).',
};

const POR_TEXTO: [RegExp, string][] = [
  [/invalid login credentials/i, POR_CODIGO.invalid_credentials],
  [/already registered/i, POR_CODIGO.user_already_exists],
  [/rate limit/i, POR_CODIGO.over_email_send_rate_limit],
  [/token has expired|invalid.*token|otp/i, POR_CODIGO.otp_expired],
  [/should be different/i, POR_CODIGO.same_password],
  [/password should be at least/i, POR_CODIGO.weak_password],
  [/network request failed|failed to fetch|fetch failed|network/i, 'Sin conexión: revisa tu internet e inténtalo de nuevo.'],
  [/invalid api key|no api key/i, 'La clave de Supabase no es válida. Revisa el archivo .env.local.'],
  [/jwt/i, 'Tu sesión venció. Vuelve a iniciar sesión.'],
  [/row-level security/i, 'No tienes permiso para hacer eso.'],
];

export function mensajeDeError(error: unknown, porDefecto = 'Algo salió mal. Inténtalo de nuevo.'): string {
  const e = (error ?? {}) as ErrorConCodigo;
  if (e.code && POR_CODIGO[e.code]) return POR_CODIGO[e.code];
  const texto = e.message ?? (typeof error === 'string' ? error : '');
  for (const [patron, mensaje] of POR_TEXTO) if (patron.test(texto)) return mensaje;
  return porDefecto;
}

export function esErrorDeRed(error: unknown): boolean {
  const texto = (error as ErrorConCodigo | null)?.message ?? '';
  return /network request failed|failed to fetch|fetch failed|network/i.test(texto);
}