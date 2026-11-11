// Sello de goma sobre la tarjeta: DEVUELTO, ATRASADO, VENCE PRONTO, PENDIENTE.
// Entra "estampándose": crece de golpe y se asienta (ZoomIn con resorte).
import { Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import type { EstadoPrestamo } from '@/domain/prestamo';

const ESTILO: Record<EstadoPrestamo, string> = {
  devuelto: 'border-pago',
  atrasado: 'border-debe',
  pronto: 'border-pronto',
  pendiente: 'border-tinta-suave',
};
const TEXTO_COLOR: Record<EstadoPrestamo, string> = {
  devuelto: 'text-pago',
  atrasado: 'text-debe',
  pronto: 'text-pronto',
  pendiente: 'text-tinta-suave',
};
export const TEXTO_ESTADO: Record<EstadoPrestamo, string> = {
  devuelto: 'Devuelto',
  atrasado: 'Atrasado',
  pronto: 'Vence pronto',
  pendiente: 'Pendiente',
};

export function Sello({ estado, grande = false }: { estado: EstadoPrestamo; grande?: boolean }) {
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12)}
      className={`self-start border-2 rounded-md px-2 py-0.5 -rotate-6 ${ESTILO[estado]} ${grande ? 'px-3 py-1' : ''}`}>
      <Text
        className={`font-display uppercase tracking-widest ${TEXTO_COLOR[estado]} ${grande ? 'text-base' : 'text-[11px]'}`}>
        {TEXTO_ESTADO[estado]}
      </Text>
    </Animated.View>
  );
}
