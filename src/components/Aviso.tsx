// Mensaje en línea (error, información, éxito) que entra con FadeInUp.
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

type Tipo = 'error' | 'info' | 'exito';

const CAJA: Record<Tipo, string> = {
  error: 'bg-debe-claro border-debe',
  info: 'bg-ambar-claro border-ambar-hondo',
  exito: 'bg-pago-claro border-pago',
};
const TITULO: Record<Tipo, string> = { error: 'text-debe', info: 'text-ambar-hondo', exito: 'text-pago' };

export function Aviso({ tipo, titulo, children }: { tipo: Tipo; titulo?: string; children?: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOut.duration(150)}
      className={`rounded-xl border-2 px-4 py-3 gap-1 ${CAJA[tipo]}`}
      accessibilityLiveRegion="polite">
      {titulo ? <Text className={`font-bold text-base ${TITULO[tipo]}`}>{titulo}</Text> : null}
      {typeof children === 'string' ? <Text className="text-[15px] text-tinta leading-5">{children}</Text> : children}
    </Animated.View>
  );
}
