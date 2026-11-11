// Raíz de la app: fuentes, proveedores y qué pantallas se pueden ver según la
// sesión de Supabase (Stack.Protected).
import '../../global.css';

import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColor } from '@/animaciones/useColores';
import { BarraSinConexion } from '@/components/BarraSinConexion';
import { ProveedorFestejo } from '@/state/festejo';
import { ProveedorSesion, useSesion } from '@/state/sesion';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Navegacion({ fuentesListas }: { fuentesListas: boolean }) {
  const { sesion, cargando, recuperando } = useSesion();
  const papel = useColor('papel');
  const listo = fuentesListas && !cargando;

  useEffect(() => {
    if (listo) SplashScreen.hideAsync().catch(() => {});
  }, [listo]);

  if (!listo) return null; // sigue la pantalla de inicio (splash)

  // Durante la recuperación con código, verifyOtp abre la sesión antes de
  // poner la nueva contraseña: se sigue en "recuperar" hasta terminar.
  const dentro = !!sesion && !recuperando;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: papel } }}>
        <Stack.Protected guard={dentro}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!dentro}>
          <Stack.Screen name="login" options={{ animation: 'fade' }} />
          <Stack.Screen name="crear-cuenta" />
          <Stack.Screen name="recuperar" />
        </Stack.Protected>
        {/* A donde vuelve Google si Android abre la app con el enlace. */}
        <Stack.Screen name="auth/callback" options={{ animation: 'none' }} />
      </Stack>
      <BarraSinConexion />
    </>
  );
}

export default function Raiz() {
  const [fuentesListas, errorFuentes] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });
  const [clienteQuery] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }),
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={clienteQuery}>
        <ProveedorSesion>
          <ProveedorFestejo>
            {/* Si las fuentes fallan, la app sigue con la del sistema. */}
            <Navegacion fuentesListas={fuentesListas || !!errorFuentes} />
          </ProveedorFestejo>
        </ProveedorSesion>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
