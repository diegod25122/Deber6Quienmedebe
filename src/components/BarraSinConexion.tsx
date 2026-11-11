// Aviso fijo arriba cuando el teléfono pierde internet (expo-network).
// Usa la animación Lottie "sin-conexion" y baja deslizándose.
import { useNetworkState } from 'expo-network';
import { Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Animacion } from '@/components/Animacion';

export function useSinConexion(): boolean {
  const red = useNetworkState();
  return red.isConnected === false || red.isInternetReachable === false;
}

export function BarraSinConexion() {
  const sinConexion = useSinConexion();
  const insets = useSafeAreaInsets();
  if (!sinConexion) return null;
  return (
    <Animated.View
      entering={SlideInUp.springify().damping(16)}
      exiting={SlideOutUp.duration(200)}
      className="absolute left-0 right-0 top-0 bg-tinta flex-row items-center gap-2 px-4 pb-2 border-b-2 border-debe"
      style={{ paddingTop: insets.top + 4 }}
      accessibilityLiveRegion="polite">
      <Animacion nombre="sin-conexion" repetir className="w-10 h-10" descripcion="Sin conexión" />
      <View className="flex-1">
        <Text className="text-blanco font-bold">Sin conexión</Text>
        <Text className="text-renglon text-xs">Tus préstamos se actualizan cuando vuelva el internet.</Text>
      </View>
    </Animated.View>
  );
}
