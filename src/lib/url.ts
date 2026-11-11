// Lee los parámetros de la URL de regreso de Google: los del # (flujo
// implícito: access_token, refresh_token) y los del ? (código PKCE o error).
export function parametrosDeUrl(url: string): Record<string, string> {
  const salida: Record<string, string> = {};
  const partes = [url.split('#')[1], url.split('?')[1]?.split('#')[0]];
  for (const parte of partes) {
    if (!parte) continue;
    for (const par of parte.split('&')) {
      const [clave, valor = ''] = par.split('=');
      if (clave) salida[decodeURIComponent(clave)] = decodeURIComponent(valor.replace(/\+/g, ' '));
    }
  }
  return salida;
}
