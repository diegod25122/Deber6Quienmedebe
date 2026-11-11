// Parte 1 · "Continuar con Google" con Supabase OAuth.
//
// 1. Supabase arma la URL de Google (signInWithOAuth con skipBrowserRedirect).
// 2. expo-web-browser la abre en el navegador del teléfono.
// 3. El usuario elige su cuenta; Google vuelve a Supabase y Supabase
//    redirige a nuestra app (redirectTo) con los tokens en la URL.
// 4. Leemos los tokens y creamos la sesión con setSession.
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';
import { parametrosDeUrl } from '@/lib/url';

// En web, cierra la ventana emergente cuando Google termina.
WebBrowser.maybeCompleteAuthSession();

// Expo Go:  exp://192.168.x.x:8081/--/auth/callback
// APK:      quienmedebe://auth/callback
// Las dos están permitidas en Supabase → Authentication → URL Configuration.
export const urlDeRegreso = Linking.createURL('auth/callback');

export type ResultadoGoogle = 'ok' | 'cancelado';

export async function sesionDesdeUrl(url: string): Promise<boolean> {
  const p = parametrosDeUrl(url);
  if (p.error_description || p.error) throw new Error(p.error_description || p.error);
  if (p.access_token && p.refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token: p.access_token, refresh_token: p.refresh_token });
    if (error) throw error;
    return true;
  }
  if (p.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(p.code);
    if (error) throw error;
    return true;
  }
  return false;
}

export async function entrarConGoogle(): Promise<ResultadoGoogle> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: urlDeRegreso,
      skipBrowserRedirect: true,
      // Siempre muestra el selector de cuentas, aunque haya una sola abierta.
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Supabase no devolvió la dirección de Google.');

  const respuesta = await WebBrowser.openAuthSessionAsync(data.url, urlDeRegreso);
  if (respuesta.type !== 'success') return 'cancelado';

  const creada = await sesionDesdeUrl(respuesta.url);
  return creada ? 'ok' : 'cancelado';
}
