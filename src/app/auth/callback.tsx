// Google → Supabase → esta ruta. Cuando Supabase devuelve a la app
// (exp://.../auth/callback o quienmedebe://auth/callback), Expo Router abre
// esta pantalla. Aquí se crea la sesión con los tokens de la URL (si la app
// no lo hizo ya) y se sale según el resultado:
//   - con sesión → la libreta ("/")
//   - sin sesión → el login
// Esta ruta está fuera de los Stack.Protected, así que hay que salir de ella
// a mano: el guard no la cierra solo cuando aparece la sesión.
import * as Linking from 'expo-linking';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Animacion } from '@/components/Animacion';
import { sesionDesdeUrl } from '@/lib/oauth';
import { useSesion } from '@/state/sesion';

export default function CallbackGoogle() {
  const { sesion } = useSesion();
  const url = Linking.useLinkingURL();
  const [termino, setTermino] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        // Si la app se abrió desde cero con el enlace, la sesión viene aquí.
        if (url && /access_token|code=/.test(url)) await sesionDesdeUrl(url);
      } catch {
        // Si falla, se vuelve al login y se puede intentar otra vez.
      } finally {
        if (activo) setTermino(true);
      }
    })();
    return () => {
      activo = false;
    };
  }, [url]);

  if (sesion) return <Redirect href="/" />;
  if (termino) return <Redirect href="/login" />;

  return (
    <View className="flex-1 bg-tinta items-center justify-center gap-2">
      <Animacion nombre="cargando" repetir className="w-44 h-36" descripcion="Entrando con Google" />
      <Text className="text-lg font-display-bold text-blanco">Entrando con Google…</Text>
    </View>
  );
}