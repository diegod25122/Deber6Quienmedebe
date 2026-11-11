// Barra superior de las pantallas internas: volver, título y una acción.
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  titulo: string;
  antetitulo?: string;
  volver?: boolean;
  accion?: ReactNode;
}

export function Encabezado({ titulo, antetitulo, volver = true, accion }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-tinta px-5 pb-4 flex-row items-end gap-3" style={{ paddingTop: insets.top + 10 }}>
      {volver ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={12}
          className="w-10 h-10 rounded-full bg-tinta-suave items-center justify-center active:opacity-70">
          <Text className="text-blanco text-xl font-bold">←</Text>
        </Pressable>
      ) : null}
      <View className="flex-1">
        {antetitulo ? (
          <Text className="text-ambar text-xs font-bold tracking-widest uppercase">{antetitulo}</Text>
        ) : null}
        <Text className="text-blanco text-2xl font-display" numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      {accion}
    </View>
  );
}
