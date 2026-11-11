// Cabecera de la lista: cuánto te deben en total, con el número subiendo
// hasta su valor (Reanimated) y los contadores de objetos y atrasados.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { dinero, type Resumen } from '@/domain/prestamo';

function MontoAnimado({ valor }: { valor: number }) {
  const v = useSharedValue(0);
  const [texto, setTexto] = useState(dinero(0));

  useEffect(() => {
    v.value = withTiming(valor, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [valor, v]);

  // dinero() es JavaScript normal (usa Intl): no puede ejecutarse dentro del
  // worklet, que corre en el hilo de la interfaz. El worklet solo manda el
  // número con runOnJS y el formato se hace aquí, en el hilo de JavaScript.
  const mostrar = (n: number) => setTexto(dinero(n));

  useAnimatedReaction(
    () => Math.round(v.value * 100) / 100,
    (actual, previo) => {
      if (actual !== previo) runOnJS(mostrar)(actual);
    },
  );

  return (
    <Text className="text-5xl font-display text-blanco tabular-nums" adjustsFontSizeToFit numberOfLines={1}>
      {texto}
    </Text>
  );
}

function Dato({ valor, texto, alerta = false }: { valor: number; texto: string; alerta?: boolean }) {
  return (
    <View className={`flex-1 rounded-xl px-3 py-2 ${alerta && valor > 0 ? 'bg-debe' : 'bg-tinta-suave'}`}>
      <Text className="text-2xl font-display text-blanco tabular-nums">{valor}</Text>
      <Text className="text-xs font-bold uppercase tracking-wider text-renglon">{texto}</Text>
    </View>
  );
}

export function ResumenDeuda({ resumen }: { resumen: Resumen }) {
  return (
    <View className="gap-3">
      <View>
        <Text className="text-xs font-bold uppercase tracking-widest text-ambar">Te deben en total</Text>
        <MontoAnimado valor={resumen.totalDinero} />
      </View>
      <View className="flex-row gap-2">
        <Dato valor={resumen.pendientes} texto="Sin devolver" />
        <Dato valor={resumen.objetosPendientes} texto="Objetos" />
        <Dato valor={resumen.atrasados} texto="Atrasados" alerta />
      </View>
    </View>
  );
}