// ¿Dinero u objeto? Dos opciones grandes; la elegida se hunde con un resorte.
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import type { TipoPrestamo } from '@/domain/prestamo';

const OPCIONES: { id: TipoPrestamo; icono: string; texto: string; detalle: string }[] = [
  { id: 'dinero', icono: '💵', texto: 'Dinero', detalle: 'Le prestaste plata' },
  { id: 'objeto', icono: '📦', texto: 'Objeto', detalle: 'Un libro, un cargador…' },
];

function Opcion({ activa, onPress, icono, texto, detalle }: { activa: boolean; onPress: () => void; icono: string; texto: string; detalle: string }) {
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(activa ? 3 : 0, { damping: 15 }) }],
  }));
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: activa }} className="flex-1">
      <View className="absolute left-0 right-0 top-1 bottom-[-4px] rounded-xl bg-tinta" />
      <Animated.View
        style={estilo}
        className={`rounded-xl border-2 border-tinta px-3 py-3 gap-0.5 ${activa ? 'bg-ambar' : 'bg-hoja'}`}>
        <Text className="text-2xl">{icono}</Text>
        <Text className="text-base font-display-bold text-tinta">{texto}</Text>
        <Text className={`text-xs ${activa ? 'text-tinta' : 'text-tenue'}`}>{detalle}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function SelectorTipo({ valor, onCambiar }: { valor: TipoPrestamo; onCambiar: (t: TipoPrestamo) => void }) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold tracking-widest uppercase text-tenue">¿Qué prestaste?</Text>
      <View className="flex-row gap-3" accessibilityRole="radiogroup">
        {OPCIONES.map((o) => (
          <Opcion key={o.id} activa={valor === o.id} onPress={() => onCambiar(o.id)} {...o} />
        ))}
      </View>
    </View>
  );
}
