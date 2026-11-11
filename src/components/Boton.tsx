// Botón con resorte al tocarlo (Reanimated) y estado de carga.
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useColor } from '@/animaciones/useColores';

type Variante = 'principal' | 'secundario' | 'peligro' | 'exito' | 'fantasma';

const CAJA: Record<Variante, string> = {
  principal: 'bg-ambar border-tinta',
  secundario: 'bg-hoja border-tinta',
  peligro: 'bg-debe border-tinta',
  exito: 'bg-pago border-tinta',
  fantasma: 'bg-transparent border-transparent',
};

const TEXTO: Record<Variante, string> = {
  principal: 'text-tinta',
  secundario: 'text-tinta',
  peligro: 'text-blanco',
  exito: 'text-blanco',
  fantasma: 'text-tinta underline',
};

// La sombra dura de abajo es la "hoja pegada" de la libreta.
const SOMBRA: Record<Variante, string> = {
  principal: 'bg-tinta',
  secundario: 'bg-tinta',
  peligro: 'bg-tinta',
  exito: 'bg-tinta',
  fantasma: 'bg-transparent',
};

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  icono?: string; // un carácter o emoji corto a la izquierda
}

export function Boton({ titulo, onPress, variante = 'principal', cargando = false, deshabilitado = false, icono }: Props) {
  const escala = useSharedValue(1);
  const hundido = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }, { translateY: hundido.value }],
  }));
  const colorCarga = useColor(variante === 'peligro' || variante === 'exito' ? 'blanco' : 'tinta');
  const bloqueado = cargando || deshabilitado;

  return (
    <View className={`relative ${bloqueado ? 'opacity-60' : ''}`}>
      <View className={`absolute left-0 right-0 top-1 bottom-[-4px] rounded-xl ${SOMBRA[variante]}`} />
      <Pressable
        onPress={onPress}
        disabled={bloqueado}
        accessibilityRole="button"
        accessibilityState={{ disabled: bloqueado, busy: cargando }}
        onPressIn={() => {
          escala.value = withSpring(0.98, { damping: 18, stiffness: 400 });
          hundido.value = withSpring(variante === 'fantasma' ? 0 : 3, { damping: 18, stiffness: 400 });
        }}
        onPressOut={() => {
          escala.value = withSpring(1, { damping: 14, stiffness: 300 });
          hundido.value = withSpring(0, { damping: 14, stiffness: 300 });
        }}>
        <Animated.View
          style={estilo}
          className={`min-h-[52px] px-4 rounded-xl border-2 flex-row items-center justify-center gap-2 ${CAJA[variante]}`}>
          {cargando ? <ActivityIndicator color={colorCarga} /> : null}
          {!cargando && icono ? <Text className={`text-lg ${TEXTO[variante]}`}>{icono}</Text> : null}
          <Text className={`text-base font-display-bold ${TEXTO[variante]}`}>{titulo}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}
