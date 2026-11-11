// Parte 2 · Cambiar la contraseña con la sesión abierta.
// Pide la actual (se comprueba en Supabase) y la nueva dos veces.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Encabezado } from '@/components/Encabezado';
import { IndicadorClave } from '@/components/IndicadorClave';
import { Pantalla } from '@/components/Pantalla';
import { hayErrores, validarClave, validarConfirmacion, type Errores } from '@/domain/validaciones';
import { mensajeDeError } from '@/lib/errores';
import { useFestejo } from '@/state/festejo';
import { useSesion } from '@/state/sesion';

type CampoClave = 'actual' | 'nueva' | 'repetida';

export default function CambiarClave() {
  const { cambiarClave, tieneClave } = useSesion();
  const festejar = useFestejo();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [errores, setErrores] = useState<Errores<CampoClave>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { estilo, sacudir } = useSacudida();

  const guardar = async () => {
    const e: Errores<CampoClave> = {
      actual: actual ? undefined : 'Escribe tu contraseña actual.',
      nueva: validarClave(nueva) ?? (nueva && nueva === actual ? 'Debe ser distinta de la actual.' : undefined),
      repetida: validarConfirmacion(nueva, repetida) ?? undefined,
    };
    setErrores(e);
    setErrorGeneral(null);
    if (hayErrores(e)) return sacudir();
    setGuardando(true);
    try {
      await cambiarClave(actual, nueva);
      await festejar({ animacion: 'clave-cambiada', titulo: 'Contraseña cambiada', detalle: 'La próxima vez entra con la nueva.' });
      router.back();
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      sacudir();
    } finally {
      setGuardando(false);
    }
  };

  if (!tieneClave) {
    return (
      <Pantalla encabezado={<Encabezado titulo="Cambiar contraseña" />}>
        <Aviso tipo="info" titulo="Entras con Google">
          Tu cuenta no tiene contraseña en esta app.
        </Aviso>
      </Pantalla>
    );
  }

  return (
    <Pantalla
      encabezado={<Encabezado titulo="Cambiar contraseña" antetitulo="Mi cuenta" />}
      pie={
        <View className="flex-1">
          <Boton titulo="Guardar contraseña" onPress={guardar} cargando={guardando} icono="🔒" />
        </View>
      }>
      <Animated.View style={estilo} className="gap-4 rounded-2xl border-2 border-tinta bg-hoja p-4">
        <Campo
          etiqueta="Contraseña actual"
          value={actual}
          onChangeText={(t) => {
            setActual(t);
            setErrores((e) => ({ ...e, actual: undefined }));
          }}
          esClave
          autoComplete="current-password"
          error={errores.actual}
        />
        <View className="gap-2">
          <Campo
            etiqueta="Nueva contraseña"
            value={nueva}
            onChangeText={(t) => {
              setNueva(t);
              setErrores((e) => ({ ...e, nueva: undefined }));
            }}
            esClave
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={errores.nueva}
          />
          <IndicadorClave clave={nueva} />
        </View>
        <Campo
          etiqueta="Repite la nueva contraseña"
          value={repetida}
          onChangeText={(t) => {
            setRepetida(t);
            setErrores((e) => ({ ...e, repetida: undefined }));
          }}
          esClave
          autoComplete="new-password"
          error={errores.repetida}
          onSubmitEditing={guardar}
        />
        {errorGeneral ? <Aviso tipo="error">{errorGeneral}</Aviso> : null}
      </Animated.View>
    </Pantalla>
  );
}
