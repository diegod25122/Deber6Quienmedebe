// Fecha con atajos ("En 1 semana"...) y el calendario del sistema.
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { fechaCorta, hoyISO, sumarDias } from '@/domain/prestamo';

export interface Atajo {
  texto: string;
  valor: string | null;
}

interface Props {
  etiqueta: string;
  valor: string | null; // AAAA-MM-DD o null ("sin fecha")
  onCambiar: (v: string | null) => void;
  atajos?: Atajo[];
  minimo?: string;
  error?: string | null;
}

function aDate(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
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
  const [verIos, setVerIos] = useState(false);

  const abrirCalendario = () => {
    const actual = aDate(valor ?? hoyISO());
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: actual,
        mode: 'date',
        minimumDate: minimo ? aDate(minimo) : undefined,
        onChange: (evento, fecha) => {
          if (evento.type === 'set' && fecha) onCambiar(hoyISO(fecha));
        },
      });
    } else {
      setVerIos((v) => !v);
    }
  };

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold tracking-widest uppercase text-tenue">{etiqueta}</Text>
      <Pressable
        onPress={abrirCalendario}
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${valor ? fechaCorta(valor) : 'sin fecha'}. Cambiar`}
        className={`flex-row items-center justify-between rounded-xl border-2 bg-hoja px-4 py-3.5 ${error ? 'border-debe' : 'border-tinta'}`}>
        <Text className="text-base font-bold text-tinta">📅 {valor ? fechaCorta(valor) : 'Sin fecha'}</Text>
        <Text className="text-sm font-bold text-ambar-hondo">Cambiar</Text>
      </Pressable>
      {Platform.OS === 'ios' && verIos ? (
        <DateTimePicker
          value={aDate(valor ?? hoyISO())}
          mode="date"
          display="inline"
          minimumDate={minimo ? aDate(minimo) : undefined}
          onChange={(_e, fecha) => fecha && onCambiar(hoyISO(fecha))}
        />
      ) : null}
      {atajos.length ? (
        <View className="flex-row flex-wrap gap-2">
          {atajos.map((a) => {
            const activo = a.valor === valor;
            return (
              <Pressable
                key={a.texto}
                onPress={() => onCambiar(a.valor)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
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
