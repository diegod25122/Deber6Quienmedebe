/**
 * Las 11 animaciones Lottie de la app (assets/lottie). Cada una corresponde a
 * un estado real: entrar, esperar, fallar, crear, guardar, devolver, borrar,
 * quedarse sin internet... En web se usa Animacion.web.tsx.
 */
import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

// withUniwind deja darle tamaño con className, como al resto de la app.
const Lottie = withUniwind(LottieView);

export const ANIMACIONES = {
  bienvenida: require('../../assets/lottie/bienvenida.json'),
  cargando: require('../../assets/lottie/cargando.json'),
  error: require('../../assets/lottie/error.json'),
  exito: require('../../assets/lottie/exito.json'),
  'cuenta-creada': require('../../assets/lottie/cuenta-creada.json'),
  'correo-enviado': require('../../assets/lottie/correo-enviado.json'),
  'clave-cambiada': require('../../assets/lottie/clave-cambiada.json'),
  'lista-vacia': require('../../assets/lottie/lista-vacia.json'),
  devuelto: require('../../assets/lottie/devuelto.json'),
  eliminado: require('../../assets/lottie/eliminado.json'),
  'sin-conexion': require('../../assets/lottie/sin-conexion.json'),
};

export type NombreAnimacion = keyof typeof ANIMACIONES;

interface Props {
  nombre: NombreAnimacion;
  repetir?: boolean; // true en esperas y escenas; false en confirmaciones
  className?: string; // tamaño, p. ej. "w-40 h-40"
  descripcion: string; // lo que lee el lector de pantalla
  alTerminar?: () => void; // solo si repetir = false
}

export function Animacion({ nombre, repetir = false, className = 'w-40 h-40', descripcion, alTerminar }: Props) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={descripcion}>
      <Lottie
        source={ANIMACIONES[nombre]}
        autoPlay
        loop={repetir}
        resizeMode="contain"
        className={className}
        onAnimationFinish={alTerminar ? () => alTerminar() : undefined}
      />
    </View>
  );
}
