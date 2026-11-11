// Mi cuenta: quién soy, con qué entro (correo o Google), cambiar contraseña
// y cerrar sesión.
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Aviso } from '@/components/Aviso';
import { Boton } from '@/components/Boton';
import { Encabezado } from '@/components/Encabezado';
import { Pantalla } from '@/components/Pantalla';
import { iniciales } from '@/components/TarjetaPrestamo';
import { mensajeDeError } from '@/lib/errores';
import { useSesion } from '@/state/sesion';

const NOMBRE_PROVEEDOR: Record<string, string> = { email: 'Correo y contraseña', google: 'Google' };

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="gap-0.5 py-2 border-b border-renglon">
      <Text className="text-xs font-bold tracking-widest uppercase text-tenue">{etiqueta}</Text>
      <Text className="text-base text-tinta" selectable>
        {valor}
      </Text>
    </View>
  );
}

export default function Cuenta() {
  const { usuario, nombre, foto, proveedores, tieneClave, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const salir = async () => {
    setSaliendo(true);
    setError(null);
    try {
      await cerrarSesion(); // _layout vuelve al login solo
    } catch (e) {
      setError(mensajeDeError(e));
      setSaliendo(false);
    }
  };

  const creada = usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-EC', { dateStyle: 'long' }) : '—';

  return (
    <Pantalla encabezado={<Encabezado titulo="Mi cuenta" antetitulo="¿Quién me debe?" />}>
      <Animated.View entering={FadeInDown.springify()} className="items-center gap-2 rounded-2xl border-2 border-tinta bg-hoja p-5">
        {foto ? (
          <Image source={{ uri: foto }} className="w-20 h-20 rounded-full border-2 border-tinta" accessibilityLabel="Tu foto" />
        ) : (
          <View className="w-20 h-20 rounded-full bg-ambar border-2 border-tinta items-center justify-center">
            <Text className="text-3xl font-display text-tinta">{iniciales(nombre)}</Text>
          </View>
        )}
        <Text className="text-2xl font-display text-tinta text-center">{nombre}</Text>
        <Text className="text-base text-tenue" selectable>
          {usuario?.email}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).springify()} className="rounded-2xl border-2 border-tinta bg-hoja px-4 py-2">
        <Fila etiqueta="Entras con" valor={proveedores.map((p) => NOMBRE_PROVEEDOR[p] ?? p).join(' y ') || '—'} />
        <Fila etiqueta="Cuenta creada" valor={creada} />
        <Fila etiqueta="Guardada en" valor="Supabase Auth" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).springify()} className="gap-3">
        {tieneClave ? (
          <Boton titulo="Cambiar contraseña" variante="secundario" icono="🔒" onPress={() => router.push('/cambiar-clave')} />
        ) : (
          <Aviso tipo="info" titulo="Entras con Google">
            Tu cuenta no tiene contraseña en esta app: Google se encarga de protegerla. Para cambiarla, hazlo desde tu
            cuenta de Google.
          </Aviso>
        )}
        {error ? <Aviso tipo="error">{error}</Aviso> : null}
        <Boton titulo="Cerrar sesión" variante="peligro" icono="↩" onPress={salir} cargando={saliendo} />
      </Animated.View>
    </Pantalla>
  );
}
