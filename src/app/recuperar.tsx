// Parte 1 · Recuperar la contraseña (usuarios creados con correo).
// 1) Se pide el correo y Supabase manda un código de 6 dígitos.
// 2) Se escribe el código y la nueva contraseña: verifyOtp + updateUser.
// Así no depende de que un enlace del correo abra la app.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { CabeceraLogin } from '@/components/CabeceraLogin';
import { Campo } from '@/components/Campo';
import { IndicadorClave } from '@/components/IndicadorClave';
import { Pantalla } from '@/components/Pantalla';
import {
  hayErrores,
  LONGITUD_CODIGO,
  validarClave,
  validarCodigo,
  validarConfirmacion,
  validarCorreo,
  type Errores,
} from '@/domain/validaciones';
import { mensajeDeError } from '@/lib/errores';
import { useFestejo } from '@/state/festejo';
import { useSesion } from '@/state/sesion';

type CampoCodigo = 'codigo' | 'clave' | 'repetida';
const ESPERA_REENVIO_S = 60; // Supabase no deja pedir otro código antes

export default function Recuperar() {
  const { enviarCodigo, restablecerClave, terminarRecuperacion } = useSesion();
  const festejar = useFestejo();
  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo');
  const [correo, setCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [errores, setErrores] = useState<Errores<CampoCodigo>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [espera, setEspera] = useState(0);
  const { estilo, sacudir } = useSacudida();

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const pedirCodigo = async () => {
    const e = validarCorreo(correo);
    setErrorCorreo(e);
    setErrorGeneral(null);
    if (e) return sacudir();
    setOcupado(true);
    try {
      await enviarCodigo(correo);
      setPaso('codigo');
      setEspera(ESPERA_REENVIO_S);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      sacudir();
    } finally {
      setOcupado(false);
    }
  };

  const cambiar = async () => {
    const e: Errores<CampoCodigo> = {
      codigo: validarCodigo(codigo) ?? undefined,
      clave: validarClave(clave) ?? undefined,
      repetida: validarConfirmacion(clave, repetida) ?? undefined,
    };
    setErrores(e);
    setErrorGeneral(null);
    if (hayErrores(e)) return sacudir();
    setOcupado(true);
    try {
      await restablecerClave(correo, codigo, clave);
      await festejar({
        animacion: 'clave-cambiada',
        titulo: 'Contraseña cambiada',
        detalle: 'Listo, ya puedes usar tu nueva contraseña.',
      });
      terminarRecuperacion(); // ahora sí entra a la app
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      sacudir();
    } finally {
      setOcupado(false);
    }
  };

  if (paso === 'correo') {
    return (
      <Pantalla
        cabecera={
          <CabeceraLogin titulo="Recupera tu cuenta" bajada="Te mandamos un código a tu correo." animacion="bienvenida" />
        }>
        <Animated.View style={estilo} className="gap-4 rounded-2xl border-2 border-tinta bg-hoja p-4">
          <Text className="text-base text-tinta">
            Escribe el correo con el que creaste tu cuenta. Si entras con Google, no necesitas contraseña: usa
            «Continuar con Google».
          </Text>
          <Campo
            etiqueta="Correo"
            value={correo}
            onChangeText={(t) => {
              setCorreo(t);
              setErrorCorreo(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="tucorreo@gmail.com"
            error={errorCorreo}
            onSubmitEditing={pedirCodigo}
          />
          {errorGeneral ? <Aviso tipo="error">{errorGeneral}</Aviso> : null}
          <Boton titulo="Enviar código" onPress={pedirCodigo} cargando={ocupado} icono="✉️" />
        </Animated.View>
        <View className="items-center">
          <Boton titulo="Volver al inicio de sesión" variante="fantasma" onPress={() => router.back()} />
        </View>
      </Pantalla>
    );
  }

  return (
    <Pantalla
      cabecera={
        <CabeceraLogin
          titulo="Revisa tu correo"
          bajada={`Enviamos un código de ${LONGITUD_CODIGO} números a ${correo.trim()}.`}
          animacion="correo-enviado"
          repetir={false}
        />
      }>
      <Animated.View entering={FadeInRight.springify().damping(16)}>
        <Animated.View style={estilo} className="gap-4 rounded-2xl border-2 border-tinta bg-hoja p-4">
          <Aviso tipo="info">Si no lo ves en unos segundos, busca en Spam o Promociones.</Aviso>
          <Campo
            etiqueta="Código"
            value={codigo}
            onChangeText={(t) => {
              setCodigo(t.replace(/\D/g, '').slice(0, LONGITUD_CODIGO));
              setErrores((e) => ({ ...e, codigo: undefined }));
            }}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            placeholder="000000"
            maxLength={LONGITUD_CODIGO}
            grande
            error={errores.codigo}
          />
          <View className="gap-2">
            <Campo
              etiqueta="Nueva contraseña"
              value={clave}
              onChangeText={(t) => {
                setClave(t);
                setErrores((e) => ({ ...e, clave: undefined }));
              }}
              esClave
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              error={errores.clave}
            />
            <IndicadorClave clave={clave} />
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
            onSubmitEditing={cambiar}
          />
          {errorGeneral ? <Aviso tipo="error">{errorGeneral}</Aviso> : null}
          <Boton titulo="Cambiar contraseña" onPress={cambiar} cargando={ocupado} icono="🔒" />
        </Animated.View>
      </Animated.View>
      <View className="items-center gap-1">
        <Boton
          titulo={espera > 0 ? `Reenviar código en ${espera} s` : 'Reenviar código'}
          variante="fantasma"
          deshabilitado={espera > 0 || ocupado}
          onPress={pedirCodigo}
        />
        <Boton titulo="Usar otro correo" variante="fantasma" onPress={() => setPaso('correo')} />
      </View>
    </Pantalla>
  );
}
