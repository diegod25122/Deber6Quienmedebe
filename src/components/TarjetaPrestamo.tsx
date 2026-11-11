// Un préstamo en la lista: persona, qué se prestó, plazo y sello de estado.
import { Pressable, Text, View } from 'react-native';

import { Sello } from '@/components/Sello';
import { estadoDe, queSePresto, textoPlazo, type Prestamo } from '@/domain/prestamo';

const COLOR_PLAZO = { devuelto: 'text-pago', atrasado: 'text-debe', pronto: 'text-pronto', pendiente: 'text-tenue' } as const;

// Iniciales para el "avatar" de la persona.
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '?') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

export function TarjetaPrestamo({ prestamo, onPress }: { prestamo: Prestamo; onPress: () => void }) {
  const estado = estadoDe(prestamo);
  const devuelto = estado === 'devuelto';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${prestamo.persona}, ${queSePresto(prestamo)}, ${textoPlazo(prestamo)}`}
      className="rounded-2xl border-2 border-tinta bg-hoja active:bg-ambar-claro">
      <View className="flex-row items-center gap-3 px-4 py-3.5">
        <View className={`w-11 h-11 rounded-full items-center justify-center ${devuelto ? 'bg-pago-claro' : 'bg-ambar-claro'}`}>
          <Text className={`font-display text-base ${devuelto ? 'text-pago' : 'text-ambar-hondo'}`}>{iniciales(prestamo.persona)}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-bold text-tinta" numberOfLines={1}>
            {prestamo.persona}
          </Text>
          <Text className={`text-sm ${COLOR_PLAZO[estado]}`}>{textoPlazo(prestamo)}</Text>
        </View>
        <View className="items-end gap-1 max-w-[45%]">
          <Text
            className={`font-display tabular-nums text-right ${prestamo.tipo === 'dinero' ? 'text-xl' : 'text-base'} ${devuelto ? 'text-tenue line-through' : 'text-tinta'}`}
            numberOfLines={1}>
            {prestamo.tipo === 'objeto' ? '📦 ' : ''}
            {queSePresto(prestamo)}
          </Text>
          {estado !== 'pendiente' ? <Sello estado={estado} /> : null}
        </View>
      </View>
    </Pressable>
  );
}
