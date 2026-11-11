// "Festejo": una animación Lottie a pantalla completa para confirmar algo
// importante (cuenta creada, préstamo guardado, devuelto, eliminado, clave
// cambiada). Vive encima de la navegación, así sigue visible aunque la
// pantalla cambie por debajo (por ejemplo, al entrar a la app tras registrarse).
import { createContext, use, useRef, useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { Animacion, type NombreAnimacion } from '@/components/Animacion';

interface Festejo {
  animacion: NombreAnimacion;
  titulo: string;
  detalle?: string;
}

type Festejar = (f: Festejo) => Promise<void>;

const Contexto = createContext<Festejar | null>(null);

export function ProveedorFestejo({ children }: { children: ReactNode }) {
  const [actual, setActual] = useState<(Festejo & { id: number }) | null>(null);
  const resolver = useRef<(() => void) | null>(null);
  const contador = useRef(0);

  const festejar: Festejar = (f) =>
    new Promise<void>((resolve) => {
      resolver.current?.();
      resolver.current = resolve;
      contador.current += 1;
      setActual({ ...f, id: contador.current });
    });

  const cerrar = () => {
    setActual(null);
    resolver.current?.();
    resolver.current = null;
  };

  return (
    <Contexto value={festejar}>
      {children}
      {actual ? (
        <Animated.View
          key={actual.id}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(220)}
          className="absolute inset-0 bg-velo items-center justify-center px-8">
          <Pressable onPress={cerrar} className="absolute inset-0" accessibilityLabel="Cerrar" />
          <Animated.View
            entering={ZoomIn.springify().damping(14)}
            className="w-full max-w-[340px] items-center gap-2 rounded-3xl border-2 border-tinta bg-hoja px-6 pt-4 pb-6">
            <Animacion
              nombre={actual.animacion}
              className="w-52 h-52"
              descripcion={actual.titulo}
              // Se cierra solo al terminar la animación, con una pausa corta.
              alTerminar={() => setTimeout(cerrar, 450)}
            />
            <Text className="text-2xl font-display text-tinta text-center">{actual.titulo}</Text>
            {actual.detalle ? <Text className="text-base text-tenue text-center">{actual.detalle}</Text> : null}
            <View className="h-1" />
            <Text className="text-xs text-tenue">Toca para continuar</Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </Contexto>
  );
}

export function useFestejo(): Festejar {
  const f = use(Contexto);
  if (!f) throw new Error('useFestejo debe usarse dentro de <ProveedorFestejo>.');
  return f;
}
