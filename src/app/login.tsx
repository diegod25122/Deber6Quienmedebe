// Parte 1 · Login: correo y contraseña (Supabase Auth) o "Continuar con Google".
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSacudida } from '@/animaciones/useSacudida';
import { Animacion } from '@/components/Animacion';
import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { BotonGoogle } from '@/components/BotonGoogle';
import { CabeceraLogin } from '@/components/CabeceraLogin';
import { Campo } from '@/components/Campo';
import { Esperando } from '@/components/Esperando';
import { Pantalla } from '@/components/Pantalla';
import { hayErrores, validarCorreo, type Errores } from '@/domain/validaciones';
import { mensajeDeError } from '@/lib/errores';
import { useSesion } from '@/state/sesion';

type CampoLogin = 'correo' | 'clave';

export default function Login() {
  const { iniciarSesion, entrarConGoogle, configuracionLista } = useSesion();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errores, setErrores] = useState<Errores<CampoLogin>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [conGoogle, setConGoogle] = useState(false);
  const { estilo, sacudir } = useSacudida();

  const fallar = (mensaje: string) => {
    setErrorGeneral(mensaje);
    sacudir();
  };

  const entrar = async () => {
    const e: Errores<CampoLogin> = { correo: validarCorreo(correo) ?? undefined, clave: clave ? undefined : 'Escribe tu contraseña.' };
    setErrores(e);
    setErrorGeneral(null);
    if (hayErrores(e)) return sacudir();
    setEntrando(true);
    try {
      await iniciarSesion(correo, clave);
      // No se navega: al cambiar la sesión, _layout muestra la app.
    } catch (error) {
      fallar(mensajeDeError(error));
    } finally {
      setEntrando(false);
    }
  };

  const google = async () => {
    setErrorGeneral(null);
    setConGoogle(true);
    try {
      await entrarConGoogle();
    } catch (error) {
      fallar(mensajeDeError(error, 'No se pudo entrar con Google. Inténtalo de nuevo.'));
    } finally {
      setConGoogle(false);
    }
  };

  return (
    <View className="flex-1 bg-papel">
      <Pantalla cabecera={<CabeceraLogin titulo="¿Quién me debe?" bajada="La libreta del fiado, en tu bolsillo." />}>
        {!configuracionLista ? (
          <Aviso tipo="error" titulo="Falta configurar Supabase">
            Copia .env.example como .env.local, pon tu URL y tu publishable key, y reinicia con npx expo start -c.
          </Aviso>
        ) : null}

        <Animated.View style={estilo} className="gap-4 rounded-2xl border-2 border-tinta bg-hoja p-4">
          <Text className="text-2xl font-display text-tinta">Inicia sesión</Text>
          <Campo
            etiqueta="Correo"
            value={correo}
            onChangeText={(t) => {
              setCorreo(t);
              setErrores((e) => ({ ...e, correo: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="tucorreo@gmail.com"
            error={errores.correo}
            returnKeyType="next"
          />
          <Campo
            etiqueta="Contraseña"
            value={clave}
            onChangeText={(t) => {
              setClave(t);
              setErrores((e) => ({ ...e, clave: undefined }));
            }}
            esClave
            autoComplete="current-password"
            placeholder="Tu contraseña"
            error={errores.clave}
            returnKeyType="go"
            onSubmitEditing={entrar}
          />
          <Link href="/recuperar" asChild>
            <Pressable accessibilityRole="link" className="self-end" hitSlop={8}>
              <Text className="text-sm font-bold text-ambar-hondo underline">¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </Link>

          {errorGeneral ? (
            <Aviso tipo="error">
              <View className="flex-row items-center gap-2">
                <Animacion nombre="error" className="w-14 h-12" descripcion="Error" />
                <Text className="flex-1 text-[15px] font-semibold text-debe">{errorGeneral}</Text>
              </View>
            </Aviso>
          ) : null}

          <Boton titulo="Entrar" onPress={entrar} cargando={entrando} deshabilitado={conGoogle} />

          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-[2px] bg-borde" />
            <Text className="text-sm font-bold text-tenue">o</Text>
            <View className="flex-1 h-[2px] bg-borde" />
          </View>

          <BotonGoogle onPress={google} cargando={conGoogle} />
        </Animated.View>

        <View className="flex-row justify-center gap-1 pb-2">
          <Text className="text-base text-tenue">¿No tienes cuenta?</Text>
          <Link href="/crear-cuenta" asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <Text className="text-base font-bold text-tinta underline">Crea una</Text>
            </Pressable>
          </Link>
        </View>
      </Pantalla>
      {entrando ? <Esperando texto="Abriendo tu libreta…" /> : null}
      {conGoogle ? <Esperando texto="Esperando a Google…" /> : null}
    </View>
  );
}
