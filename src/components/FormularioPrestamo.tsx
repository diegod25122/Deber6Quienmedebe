// Formulario de préstamo, compartido por "Anotar" (CREATE) y "Editar" (UPDATE).
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { atajosDevolucion, CampoFecha } from '@/components/CampoFecha';
import { Pantalla } from '@/components/Pantalla';
import { SelectorTipo } from '@/components/SelectorTipo';
import {
  datosDesdeForm,
  hoyISO,
  sumarDias,
  validarPrestamo,
  type CampoPrestamo,
  type DatosPrestamo,
  type FormPrestamo,
} from '@/domain/prestamo';
import { hayErrores } from '@/domain/validaciones';
import { mensajeDeError } from '@/lib/errores';
import type { ReactNode } from 'react';

interface Props {
  inicial: FormPrestamo;
  encabezado: ReactNode;
  textoGuardar: string;
  onGuardar: (d: DatosPrestamo) => Promise<void>;
}

export function FormularioPrestamo({ inicial, encabezado, textoGuardar, onGuardar }: Props) {
  const [f, setF] = useState<FormPrestamo>(inicial);
  const [errores, setErrores] = useState<Partial<Record<CampoPrestamo, string>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { estilo, sacudir } = useSacudida();

  const cambiar = <K extends keyof FormPrestamo>(campo: K, valor: FormPrestamo[K], limpiar?: CampoPrestamo) => {
    setF((actual) => ({ ...actual, [campo]: valor }));
    if (limpiar) setErrores((e) => ({ ...e, [limpiar]: undefined }));
  };

  const guardar = async () => {
    const e = validarPrestamo(f);
    setErrores(e);
    setErrorGeneral(null);
    if (hayErrores(e)) return sacudir();
    setGuardando(true);
    try {
      await onGuardar(datosDesdeForm(f));
    } catch (error) {
      setErrorGeneral(mensajeDeError(error, 'No se pudo guardar. Inténtalo de nuevo.'));
      sacudir();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Pantalla
      encabezado={encabezado}
      pie={
        <View className="flex-1">
          <Boton titulo={textoGuardar} onPress={guardar} cargando={guardando} icono="✓" />
        </View>
      }>
      <Animated.View style={estilo} className="gap-5">
        <Campo
          etiqueta="¿A quién le prestaste?"
          value={f.persona}
          onChangeText={(t) => cambiar('persona', t, 'persona')}
          autoCapitalize="words"
          placeholder="Ej.: Mateo, el primo"
          maxLength={60}
          error={errores.persona}
        />

        <SelectorTipo valor={f.tipo} onCambiar={(t) => cambiar('tipo', t)} />

        {f.tipo === 'dinero' ? (
          <Animated.View key="dinero" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
            <Campo
              etiqueta="¿Cuánto?"
              value={f.montoTexto}
              onChangeText={(t) => cambiar('montoTexto', t.replace(/[^\d.,]/g, ''), 'monto')}
              keyboardType="decimal-pad"
              placeholder="0.00"
              prefijo="$"
              grande
              error={errores.monto}
            />
          </Animated.View>
        ) : (
          <Animated.View key="objeto" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
            <Campo
              etiqueta="¿Qué le prestaste?"
              value={f.objeto}
              onChangeText={(t) => cambiar('objeto', t, 'objeto')}
              placeholder="Ej.: el cargador del portátil"
              maxLength={80}
              error={errores.objeto}
            />
          </Animated.View>
        )}

        <CampoFecha
          etiqueta="¿Cuándo se lo prestaste?"
          valor={f.fechaPrestamo}
          onCambiar={(v) => cambiar('fechaPrestamo', v ?? hoyISO())}
          atajos={[
            { texto: 'Hoy', valor: hoyISO() },
            { texto: 'Ayer', valor: sumarDias(hoyISO(), -1) },
          ]}
        />

        <CampoFecha
          etiqueta="¿Para cuándo te devuelve?"
          valor={f.fechaLimite}
          onCambiar={(v) => cambiar('fechaLimite', v, 'fechaLimite')}
          atajos={atajosDevolucion(f.fechaPrestamo)}
          minimo={f.fechaPrestamo}
          error={errores.fechaLimite}
        />

        <Campo
          etiqueta="Nota (opcional)"
          value={f.nota}
          onChangeText={(t) => cambiar('nota', t, 'nota')}
          placeholder="Ej.: para la entrada del concierto"
          multiline
          maxLength={200}
          error={errores.nota}
          ayuda={`${f.nota.length}/200`}
        />

        {errorGeneral ? <Aviso tipo="error">{errorGeneral}</Aviso> : null}
      </Animated.View>
    </Pantalla>
  );
}
