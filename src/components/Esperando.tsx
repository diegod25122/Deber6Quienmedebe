// Capa de espera con la animación Lottie "cargando" (entrar, esperar a
// Google, guardar...). Bloquea los toques mientras dura.
import { Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Animacion } from '@/components/Animacion';

export function Esperando({ texto }: { texto: string }) {
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      className="absolute inset-0 bg-velo items-center justify-center gap-2 px-8"
      accessibilityLiveRegion="polite">
      <Animacion nombre="cargando" repetir className="w-44 h-36" descripcion={texto} />
      <Text className="text-lg font-display-bold text-blanco text-center">{texto}</Text>
    </Animated.View>
  );
}
