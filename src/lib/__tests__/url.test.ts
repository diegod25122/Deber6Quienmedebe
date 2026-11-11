import { parametrosDeUrl } from '@/lib/url';

describe('URL de regreso de Google', () => {
  it('lee los tokens del # (flujo implícito)', () => {
    const p = parametrosDeUrl('exp://192.168.1.5:8081/--/auth/callback#access_token=abc&refresh_token=xyz&token_type=bearer');
    expect(p.access_token).toBe('abc');
    expect(p.refresh_token).toBe('xyz');
  });
  it('lee el código PKCE del ?', () => {
    expect(parametrosDeUrl('quienmedebe://auth/callback?code=123').code).toBe('123');
  });
  it('lee el error que manda Supabase', () => {
    const p = parametrosDeUrl('quienmedebe://auth/callback#error=access_denied&error_description=Acceso+denegado');
    expect(p.error_description).toBe('Acceso denegado');
  });
});
