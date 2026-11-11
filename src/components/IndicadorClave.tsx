// Indicador débil / media / fuerte debajo del campo de contraseña.
// Tres barras que se llenan y cambian de color con Reanimated.
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useColores } from '@/animaciones/useColores';
import { evaluarFortaleza, TEXTO_NIVEL } from '@/domain/fortalezaClave';

const COLOR_TEXTO = { vacia: 'text-tenue', debil: 'text-debe', media: 'text-pronto', fuerte: 'text-pago' } as const;

function Barra({ indice, valor }: { indice: number; valor: number }) {
  const c = useColores(['borde', 'debe', 'ambar', 'pago'] as const);
  const lleno = useSharedValue(0);
  const nivel = useSharedValue(0);

  useEffect(() => {
    lleno.value = withTiming(valor > indice ? 1 : 0, { duration: 260 });
    nivel.value = withTiming(valor, { duration: 260 });
  }, [valor, indice, lleno, nivel]);

  const estilo = useAnimatedStyle(() => ({
    width: `${lleno.value * 100}%`,
    backgroundColor: interpolateColor(nivel.value, [1, 2, 3], [c.debe, c.ambar, c.pago]),
  }));

  return (
    <View className="flex-1 h-2 rounded-full bg-borde overflow-hidden">
      <Animated.View style={estilo} className="h-full rounded-full" />
    </View>
  );
}

export function IndicadorClave({ clave }: { clave: string }) {
  const f = evaluarFortaleza(clave);
  if (f.nivel === 'vacia') return null;
  return (
    <View className="gap-1.5" accessibilityLabel={`Seguridad de la contraseña: ${TEXTO_NIVEL[f.nivel]}`}>
      <View className="flex-row gap-1.5">
        {[0, 1, 2].map((i) => (
          <Barra key={i} indice={i} valor={f.valor} />
        ))}
      </View>
      <Text className={`text-sm font-bold ${COLOR_TEXTO[f.nivel]}`}>
        {TEXTO_NIVEL[f.nivel]}
        {f.sugerencia ? <Text className="font-normal text-tenue"> · {f.sugerencia}</Text> : null}
      </Text>
    </View>
  );
}
