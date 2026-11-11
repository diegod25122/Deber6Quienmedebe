// Google → Supabase → esta ruta. En Android, a veces el enlace de regreso
// también abre la app aquí (además de cerrar el navegador). Se lee la sesión
// de la URL, si hace falta, y se vuelve al inicio.
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Animacion } from '@/components/Animacion';
import { sesionDesdeUrl } from '@/lib/oauth';
import { supabase } from '@/lib/supabase';

export default function CallbackGoogle() {
  const url = Linking.useLinkingURL();

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session && url) await sesionDesdeUrl(url);
      } catch {
        // Si falla, el login muestra el botón de Google otra vez.
      } finally {
        if (activo) router.replace('/');
      }
    })();
    return () => {
      activo = false;
    };
  }, [url]);

  return (
    <View className="flex-1 bg-tinta items-center justify-center">
      <Animacion nombre="cargando" repetir className="w-44 h-36" descripcion="Entrando con Google" />
    </View>
  );
}
