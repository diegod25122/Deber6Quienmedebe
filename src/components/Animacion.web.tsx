/**
 * Versión web de Animacion: usa @lottiefiles/dotlottie-react, que reproduce
 * el mismo JSON de Lottie en el navegador (Metro elige este archivo solo).
 */
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useEffect } from 'react';
import { View } from 'react-native';

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
  repetir?: boolean;
  className?: string;
  descripcion: string;
  alTerminar?: () => void;
}

export function Animacion({ nombre, repetir = false, className = 'w-40 h-40', descripcion, alTerminar }: Props) {
  // En web no hay evento de fin fiable para JSON: se avisa tras 2,2 s.
  useEffect(() => {
    if (repetir || !alTerminar) return;
    const t = setTimeout(alTerminar, 2200);
    return () => clearTimeout(t);
  }, [repetir, alTerminar]);

  return (
    <View className={className} accessible accessibilityRole="image" accessibilityLabel={descripcion}>
      <DotLottieReact data={JSON.stringify(ANIMACIONES[nombre])} autoplay loop={repetir} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
