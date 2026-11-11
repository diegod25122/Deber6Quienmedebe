// Portada de las pantallas de acceso: bloque azul tinta con la animación
// "bienvenida" y el nombre de la app.
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Animacion, type NombreAnimacion } from '@/components/Animacion';

interface Props {
  titulo: string;
  bajada: string;
  animacion?: NombreAnimacion;
  repetir?: boolean;
}

export function CabeceraLogin({ titulo, bajada, animacion = 'bienvenida', repetir = true }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-tinta rounded-b-[32px] px-6 pb-6 items-center" style={{ paddingTop: insets.top + 8 }}>
      <Animacion nombre={animacion} repetir={repetir} className="w-48 h-40" descripcion={titulo} />
      <Animated.Text entering={FadeInDown.delay(100).springify()} className="text-4xl font-display text-blanco text-center">
        {titulo}
      </Animated.Text>
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Text className="text-base text-renglon text-center mt-1">{bajada}</Text>
      </Animated.View>
    </View>
  );
}
