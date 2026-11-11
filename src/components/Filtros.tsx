// Pestañas de filtro con una "pastilla" ámbar que se desliza a la elegida.
import { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { FILTROS, type Filtro } from '@/domain/prestamo';

interface Props {
  actual: Filtro;
  onCambiar: (f: Filtro) => void;
  conteo: Partial<Record<Filtro, number>>;
}

export function Filtros({ actual, onCambiar, conteo }: Props) {
  const [anchos, setAnchos] = useState<Record<string, { x: number; w: number }>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);

  const medir = (id: Filtro) => (e: LayoutChangeEvent) => {
    const { x: px, width } = e.nativeEvent.layout;
    setAnchos((a) => ({ ...a, [id]: { x: px, w: width } }));
    if (id === actual) {
      x.value = px;
      w.value = width;
    }
  };

  const elegir = (id: Filtro) => {
    const m = anchos[id];
    if (m) {
      x.value = withSpring(m.x, { damping: 18, stiffness: 220 });
      w.value = withSpring(m.w, { damping: 18, stiffness: 220 });
    }
    onCambiar(id);
  };

  const pastilla = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: w.value }));

  return (
    <View className="flex-row rounded-xl border-2 border-tinta bg-hoja p-1" accessibilityRole="tablist">
      <Animated.View style={pastilla} className="absolute top-1 bottom-1 left-0 rounded-lg bg-ambar" />
      {FILTROS.map((f) => {
        const activo = f.id === actual;
        const n = conteo[f.id];
        return (
          <Pressable
            key={f.id}
            onLayout={medir(f.id)}
            onPress={() => elegir(f.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            className="flex-1 items-center py-2 px-1">
            <Text className={`text-[13px] font-bold ${activo ? 'text-tinta' : 'text-tenue'}`} numberOfLines={1}>
              {f.texto}
              {n !== undefined ? ` ${n}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
