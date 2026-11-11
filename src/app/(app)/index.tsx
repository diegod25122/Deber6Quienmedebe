// Parte 2 · READ: la libreta. Cuánto te deben, filtros y la lista de préstamos.
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColor } from '@/animaciones/useColores';
import { Animacion } from '@/components/Animacion';
import { Boton } from '@/components/Boton';
import { Filtros } from '@/components/Filtros';
import { Renglones } from '@/components/Renglones';
import { ResumenDeuda } from '@/components/ResumenDeuda';
import { iniciales, TarjetaPrestamo } from '@/components/TarjetaPrestamo';
import { usePrestamos } from '@/data/hooks';
import { estadoDe, filtrar, resumir, type Filtro } from '@/domain/prestamo';
import { esErrorDeRed, mensajeDeError } from '@/lib/errores';
import { useSesion } from '@/state/sesion';

const VACIO_FILTRO: Record<Filtro, string> = {
  pendientes: 'Nadie te debe nada ahora mismo. 🎉',
  atrasados: 'Ningún préstamo atrasado.',
  devueltos: 'Todavía no te han devuelto nada.',
  todos: 'No hay préstamos.',
};

export default function Libreta() {
  const insets = useSafeAreaInsets();
  const { nombre, foto } = useSesion();
  const { data, isPending, isError, error, refetch, isRefetching } = usePrestamos();
  const [filtro, setFiltro] = useState<Filtro>('pendientes');
  const ambar = useColor('ambar');

  const lista = data ?? [];
  const resumen = resumir(lista);
  const visibles = filtrar(lista, filtro);
  const primerNombre = nombre.split(' ')[0];

  return (
    <View className="flex-1 bg-papel">
      <Renglones />
      <ScrollView
        contentContainerClassName="pb-32"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={ambar} colors={[ambar]} />}>
        {/* Cabecera azul tinta con el total */}
        <View className="bg-tinta rounded-b-[32px] px-5 pb-6 gap-5" style={{ paddingTop: insets.top + 12 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-renglon">Tu libreta</Text>
              <Animated.Text entering={FadeInDown.springify()} className="text-3xl font-display text-blanco" numberOfLines={1}>
                Hola, {primerNombre}
              </Animated.Text>
            </View>
            <Pressable
              onPress={() => router.push('/cuenta')}
              accessibilityRole="button"
              accessibilityLabel="Mi cuenta"
              className="w-12 h-12 rounded-full border-2 border-ambar items-center justify-center bg-tinta-suave overflow-hidden active:opacity-70">
              {foto ? (
                <Image source={{ uri: foto }} className="w-full h-full" />
              ) : (
                <Text className="text-lg font-display text-ambar">{iniciales(nombre)}</Text>
              )}
            </Pressable>
          </View>
          <ResumenDeuda resumen={resumen} />
        </View>

        <View className="pl-12 pr-5 pt-5 gap-4">
          {/* Cargando por primera vez */}
          {isPending ? (
            <View className="items-center gap-2 py-8">
              <Animacion nombre="cargando" repetir className="w-44 h-36" descripcion="Cargando tus préstamos" />
              <Text className="text-base font-bold text-tinta">Abriendo tu libreta…</Text>
            </View>
          ) : null}

          {/* Error al leer de Supabase */}
          {isError && !data ? (
            <View className="items-center gap-3 rounded-2xl border-2 border-tinta bg-hoja p-5">
              <Animacion
                nombre={esErrorDeRed(error) ? 'sin-conexion' : 'error'}
                repetir
                className="w-36 h-32"
                descripcion="Error al cargar"
              />
              <Text className="text-lg font-display-bold text-tinta text-center">No pudimos abrir tu libreta</Text>
              <Text className="text-base text-tenue text-center">{mensajeDeError(error)}</Text>
              <Boton titulo="Reintentar" variante="secundario" onPress={() => void refetch()} />
            </View>
          ) : null}

          {/* Libreta vacía: todavía no hay ni un préstamo */}
          {data && lista.length === 0 ? (
            <Animated.View entering={FadeInDown.springify()} className="items-center gap-2 rounded-2xl border-2 border-tinta bg-hoja p-6">
              <Animacion nombre="lista-vacia" repetir className="w-40 h-40" descripcion="Libreta vacía" />
              <Text className="text-2xl font-display text-tinta text-center">Tu libreta está vacía</Text>
              <Text className="text-base text-tenue text-center">
                Anota a quién le prestaste plata o algo, y la app te avisa cuando se atrase.
              </Text>
            </Animated.View>
          ) : null}

          {data && lista.length > 0 ? (
            <>
              <Filtros
                actual={filtro}
                onCambiar={setFiltro}
                conteo={{
                  pendientes: resumen.pendientes,
                  atrasados: resumen.atrasados,
                  devueltos: lista.filter((p) => estadoDe(p) === 'devuelto').length,
                }}
              />
              {visibles.length === 0 ? (
                <Text className="text-base text-tenue text-center py-6">{VACIO_FILTRO[filtro]}</Text>
              ) : (
                visibles.map((p, i) => (
                  <Animated.View
                    key={p.id}
                    entering={FadeInDown.delay(Math.min(i, 8) * 60).springify().damping(16)}
                    layout={LinearTransition.springify().damping(18)}>
                    <TarjetaPrestamo prestamo={p} onPress={() => router.push({ pathname: '/prestamo/[id]', params: { id: p.id } })} />
                  </Animated.View>
                ))
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Botón fijo para anotar */}
      <View className="absolute left-0 right-0 bottom-0 px-5 pt-3 bg-papel/90" style={{ paddingBottom: insets.bottom + 12 }}>
        <Boton titulo="Anotar préstamo" icono="✍️" onPress={() => router.push('/prestamo/nuevo')} />
      </View>
    </View>
  );
}
