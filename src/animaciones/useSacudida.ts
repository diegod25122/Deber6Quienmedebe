// Sacudida horizontal cuando algo sale mal (contraseña incorrecta, formulario
// con errores). Corre en el hilo de interfaz con Reanimated.
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export function useSacudida() {
  const x = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const sacudir = () => {
    x.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 70 }),
      withTiming(-9, { duration: 60 }),
      withTiming(9, { duration: 60 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };
  return { estilo, sacudir };
}
