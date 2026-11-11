// Fondo de "libreta del fiado": renglones azules y el margen rojo a la
// izquierda. Es solo decoración: no recibe toques.
import { View } from 'react-native';

const RENGLONES = Array.from({ length: 48 }, (_, i) => i);

export function Renglones() {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      {RENGLONES.map((i) => (
        <View key={i} className="h-8 border-b border-renglon/60" />
      ))}
      <View className="absolute top-0 bottom-0 left-7 w-[2px] bg-margen/70" />
    </View>
  );
}
