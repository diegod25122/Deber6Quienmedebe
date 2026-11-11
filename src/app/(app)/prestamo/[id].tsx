// Parte 2 · Detalle de un préstamo: marcar devuelto (UPDATE), editar,
// recordarle a la persona y eliminar (DELETE).
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Animacion } from '@/components/Animacion';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Encabezado } from '@/components/Encabezado';
import { Pantalla } from '@/components/Pantalla';
import { Sello } from '@/components/Sello';
import { useEliminarPrestamo, useMarcarDevuelto, usePrestamo } from '@/data/hooks';
import { estadoDe, fechaCorta, queSePresto, textoPlazo } from '@/domain/prestamo';
import { mensajeDeError } from '@/lib/errores';
import { useFestejo } from '@/state/festejo';
import { useSesion } from '@/state/sesion';

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row justify-between gap-3 py-2.5 border-b border-dashed border-borde">
      <Text className="text-sm text-tenue">{etiqueta}</Text>
      <Text className="text-sm font-bold text-tinta text-right flex-1">{valor}</Text>
    </View>
  );
}

export default function DetallePrestamo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: p, isPending, isError, error } = usePrestamo(id);
  const devolver = useMarcarDevuelto(id);
  const eliminar = useEliminarPrestamo();
  const festejar = useFestejo();
  const { nombre } = useSesion();
  const [confirmando, setConfirmando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  if (!p) {
    return (
      <View className="flex-1 bg-papel">
        <Encabezado titulo="Préstamo" />
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Animacion nombre={isPending ? 'cargando' : 'error'} repetir className="w-40 h-32" descripcion="Cargando" />
          <Text className="text-base text-tinta text-center">
            {isPending ? 'Buscando en la libreta…' : isError ? mensajeDeError(error) : 'Este préstamo ya no existe.'}
          </Text>
        </View>
      </View>
    );
  }

  const estado = estadoDe(p);

  const alternarDevuelto = async () => {
    setErrorAccion(null);
    try {
      const actualizado = await devolver.mutateAsync(!p.devuelto);
      if (actualizado.devuelto) {
        await festejar({
          animacion: 'devuelto',
          titulo: '¡Te devolvió!',
          detalle: `${p.persona} saldó ${queSePresto(p)}.`,
        });
      }
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    }
  };

  const borrar = async () => {
    setErrorAccion(null);
    try {
      await eliminar.mutateAsync(p.id);
      router.back();
      await festejar({ animacion: 'eliminado', titulo: 'Préstamo eliminado', detalle: `Se borró de tu libreta.` });
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
      setConfirmando(false);
    }
  };

  const recordar = () => {
    const plazo = p.fechaLimite ? ` Quedamos para el ${fechaCorta(p.fechaLimite)}.` : '';
    void Share.share({
      message: `Hola ${p.persona.split(' ')[0]} 👋 Te recuerdo lo que te presté: ${queSePresto(p)}.${plazo} ¡Gracias! — ${nombre}`,
    });
  };

  return (
    <Pantalla encabezado={<Encabezado titulo={p.persona} antetitulo="Préstamo" />}>
      {/* "Ticket" del préstamo */}
      <Animated.View entering={FadeInDown.springify().damping(16)} className="rounded-2xl border-2 border-tinta bg-hoja overflow-hidden">
        <View className="px-5 pt-5 pb-4 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="text-xs font-bold tracking-widest uppercase text-tenue">
              {p.tipo === 'dinero' ? 'Te debe' : 'Te tiene'}
            </Text>
            <Sello estado={estado} grande />
          </View>
          <Text
            className={`font-display tabular-nums text-tinta ${p.tipo === 'dinero' ? 'text-5xl' : 'text-3xl'} ${p.devuelto ? 'line-through text-tenue' : ''}`}
            adjustsFontSizeToFit
            numberOfLines={2}>
            {p.tipo === 'objeto' ? '📦 ' : ''}
            {queSePresto(p)}
          </Text>
          <Text className={`text-base font-bold ${estado === 'atrasado' ? 'text-debe' : estado === 'devuelto' ? 'text-pago' : 'text-tinta-suave'}`}>
            {textoPlazo(p)}
          </Text>
        </View>
        {/* Corte del ticket */}
        <View className="flex-row items-center">
          <View className="w-4 h-4 -ml-2 rounded-full bg-papel border-2 border-tinta" />
          <View className="flex-1 border-t-2 border-dashed border-borde" />
          <View className="w-4 h-4 -mr-2 rounded-full bg-papel border-2 border-tinta" />
        </View>
        <View className="px-5 pt-1 pb-4">
          <Dato etiqueta="Persona" valor={p.persona} />
          <Dato etiqueta="Prestado el" valor={fechaCorta(p.fechaPrestamo)} />
          <Dato etiqueta="Devuelve" valor={p.fechaLimite ? fechaCorta(p.fechaLimite) : 'Sin fecha'} />
          {p.nota ? (
            <View className="pt-3 gap-1">
              <Text className="text-sm text-tenue">Nota</Text>
              <Text className="text-base text-tinta italic">“{p.nota}”</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {errorAccion ? <Aviso tipo="error">{errorAccion}</Aviso> : null}

      <Animated.View entering={FadeInDown.delay(100).springify()} className="gap-3">
        <Boton
          titulo={p.devuelto ? 'Marcar como pendiente' : 'Ya me devolvió'}
          variante={p.devuelto ? 'secundario' : 'exito'}
          icono={p.devuelto ? '↺' : '🤝'}
          onPress={alternarDevuelto}
          cargando={devolver.isPending}
        />
        {!p.devuelto ? <Boton titulo="Recordarle" variante="secundario" icono="💬" onPress={recordar} /> : null}
        <Boton
          titulo="Editar"
          variante="secundario"
          icono="✎"
          onPress={() => router.push({ pathname: '/prestamo/editar/[id]', params: { id: p.id } })}
        />

        {!confirmando ? (
          <Boton titulo="Eliminar" variante="fantasma" onPress={() => setConfirmando(true)} />
        ) : (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
            <Aviso tipo="error" titulo="¿Eliminar este préstamo?">
              <View className="gap-3 pt-1">
                <Text className="text-[15px] text-tinta">Se borra de tu libreta y no se puede recuperar.</Text>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Boton titulo="Cancelar" variante="secundario" onPress={() => setConfirmando(false)} />
                  </View>
                  <View className="flex-1">
                    <Boton titulo="Eliminar" variante="peligro" onPress={borrar} cargando={eliminar.isPending} />
                  </View>
                </View>
              </View>
            </Aviso>
          </Animated.View>
        )}
      </Animated.View>
    </Pantalla>
  );
}
