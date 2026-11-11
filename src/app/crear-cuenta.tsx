// Parte 1 · Crear cuenta con correo y contraseña. El usuario queda guardado
// en Supabase Auth (Authentication → Users) y entra de una vez.
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { CabeceraLogin } from '@/components/CabeceraLogin';
import { Campo } from '@/components/Campo';
import { IndicadorClave } from '@/components/IndicadorClave';
import { Pantalla } from '@/components/Pantalla';
import {
  hayErrores,
  validarClave,
  validarConfirmacion,
  validarCorreo,
  validarNombre,
  type Errores,
} from '@/domain/validaciones';
import { mensajeDeError } from '@/lib/errores';
import { useFestejo } from '@/state/festejo';
import { useSesion } from '@/state/sesion';

type CampoRegistro = 'nombre' | 'correo' | 'clave' | 'repetida';

export default function CrearCuenta() {
  const { registrarse } = useSesion();
  const festejar = useFestejo();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [errores, setErrores] = useState<Errores<CampoRegistro>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const { estilo, sacudir } = useSacudida();

  const limpiar = (campo: CampoRegistro) => setErrores((e) => ({ ...e, [campo]: undefined }));

  const crear = async () => {
    const e: Errores<CampoRegistro> = {
      nombre: validarNombre(nombre) ?? undefined,
      correo: validarCorreo(correo) ?? undefined,
      clave: validarClave(clave) ?? undefined,
      repetida: validarConfirmacion(clave, repetida) ?? undefined,
    };
    setErrores(e);
    setErrorGeneral(null);
    if (hayErrores(e)) return sacudir();
    setCreando(true);
    try {
      await registrarse(nombre, correo, clave);
      // La sesión ya cambió: _layout muestra la app y el festejo queda encima.
      void festejar({
        animacion: 'cuenta-creada',
        titulo: `¡Bienvenido, ${nombre.trim().split(' ')[0]}!`,
        detalle: 'Tu cuenta quedó creada. Anota tu primer préstamo.',
      });
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      sacudir();
    } finally {
      setCreando(false);
    }
  };

  return (
    <Pantalla
      cabecera={
        <CabeceraLogin titulo="Crea tu cuenta" bajada="Para que nadie se olvide de lo que te debe." animacion="bienvenida" />
      }>
      <Animated.View style={estilo} className="gap-4 rounded-2xl border-2 border-tinta bg-hoja p-4">
        <Campo
          etiqueta="Tu nombre"
          value={nombre}
          onChangeText={(t) => {
            setNombre(t);
            limpiar('nombre');
          }}
          autoCapitalize="words"
          autoComplete="name"
          placeholder="Diego Camacho"
          error={errores.nombre}
          maxLength={40}
        />
        <Campo
          etiqueta="Correo"
          value={correo}
          onChangeText={(t) => {
            setCorreo(t);
            limpiar('correo');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="tucorreo@gmail.com"
          error={errores.correo}
        />
        <View className="gap-2">
          <Campo
            etiqueta="Contraseña"
            value={clave}
            onChangeText={(t) => {
              setClave(t);
              limpiar('clave');
            }}
            esClave
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={errores.clave}
          />
          <IndicadorClave clave={clave} />
        </View>
        <Campo
          etiqueta="Repite la contraseña"
          value={repetida}
          onChangeText={(t) => {
            setRepetida(t);
            limpiar('repetida');
          }}
          esClave
          autoComplete="new-password"
          placeholder="La misma de arriba"
          error={errores.repetida}
          onSubmitEditing={crear}
        />
        {errorGeneral ? <Aviso tipo="error">{errorGeneral}</Aviso> : null}
        <Boton titulo="Crear cuenta" onPress={crear} cargando={creando} icono="✍️" />
      </Animated.View>
      <View className="items-center pb-2">
        <Boton titulo="Ya tengo cuenta" variante="fantasma" onPress={() => router.back()} />
      </View>
      <Text className="text-xs text-tenue text-center px-4">
        Tu correo y tu contraseña se guardan en Supabase Auth. La contraseña nunca se guarda en el teléfono.
      </Text>
    </Pantalla>
  );
}
