// Cliente único de Supabase para toda la app.
// La sesión se guarda en AsyncStorage: al cerrar y abrir la app sigue dentro.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

// Si falta .env.local, la app lo dice en pantalla en vez de fallar sin explicación.
export const configuracionLista = url.startsWith('https://') && key.length > 20 && !key.includes('PEGA_AQUI');

export const supabase = createClient(url || 'https://falta-configurar.supabase.co', key || 'falta-configurar', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En el teléfono la sesión de Google llega por la URL de regreso y la
    // leemos a mano (src/lib/oauth.ts), no desde la barra del navegador.
    detectSessionInUrl: false,
  },
});

// Supabase recomienda refrescar el token solo con la app en primer plano.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
