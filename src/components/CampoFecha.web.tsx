// Versión web de CampoFecha: el selector de fecha del navegador.
import { createElement } from 'react';
import { Pressable, Text, View } from 'react-native';

import { sumarDias } from '@/domain/prestamo';

export interface Atajo {
  texto: string;
  valor: string | null;
}

interface Props {
  etiqueta: string;
  valor: string | null;
  onCambiar: (v: string | null) => void;
  atajos?: Atajo[];
  minimo?: string;
  error?: string | null;
}

export function atajosDevolucion(desde: string): Atajo[] {
  return [
    { texto: '1 semana', valor: sumarDias(desde, 7) },
    { texto: '15 días', valor: sumarDias(desde, 15) },
    { texto: '1 mes', valor: sumarDias(desde, 30) },
    { texto: 'Sin fecha', valor: null },
  ];
}

export function CampoFecha({ etiqueta, valor, onCambiar, atajos = [], minimo, error }: Props) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold tracking-widest uppercase text-tenue">{etiqueta}</Text>
      <View className={`rounded-xl border-2 bg-hoja px-4 py-3 ${error ? 'border-debe' : 'border-tinta'}`}>
        {createElement('input', {
          type: 'date',
          value: valor ?? '',
          min: minimo,
          onChange: (e: { target: { value: string } }) => onCambiar(e.target.value || null),
          style: { border: 0, background: 'transparent', fontSize: 16, fontWeight: 700, width: '100%' },
          'aria-label': etiqueta,
        })}
      </View>
      {atajos.length ? (
        <View className="flex-row flex-wrap gap-2">
          {atajos.map((a) => {
            const activo = a.valor === valor;
            return (
              <Pressable
                key={a.texto}
                onPress={() => onCambiar(a.valor)}
                className={`rounded-full border-2 px-3 py-1.5 ${activo ? 'bg-tinta border-tinta' : 'bg-hoja border-borde'}`}>
                <Text className={`text-sm font-bold ${activo ? 'text-blanco' : 'text-tinta'}`}>{a.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {error ? <Text className="text-sm font-semibold text-debe">{error}</Text> : null}
    </View>
  );
}
