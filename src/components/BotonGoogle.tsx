// "Continuar con Google": fondo blanco y la G de colores, como pide la guía
// de marca de Google para botones de inicio de sesión.
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useColor } from '@/animaciones/useColores';

interface Props {
  onPress: () => void;
  cargando?: boolean;
}

export function BotonGoogle({ onPress, cargando = false }: Props) {
  const escala = useSharedValue(1);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  const tinta = useColor('tinta');

  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      accessibilityRole="button"
      accessibilityLabel="Continuar con Google"
      onPressIn={() => (escala.value = withSpring(0.97, { damping: 18, stiffness: 400 }))}
      onPressOut={() => (escala.value = withSpring(1, { damping: 14, stiffness: 300 }))}>
      <Animated.View
        style={estilo}
        className="min-h-[52px] rounded-xl border-2 border-borde bg-blanco flex-row items-center justify-center gap-3 px-4">
        {cargando ? (
          <ActivityIndicator color={tinta} />
        ) : (
          <View className="w-7 h-7 rounded-full bg-blanco items-center justify-center">
            <Text className="text-xl font-black text-google-azul">G</Text>
          </View>
        )}
        <Text className="text-base font-bold text-google-texto">{cargando ? 'Esperando a Google…' : 'Continuar con Google'}</Text>
      </Animated.View>
    </Pressable>
  );
}
