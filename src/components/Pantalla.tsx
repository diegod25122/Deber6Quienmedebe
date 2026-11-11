// Marco común: fondo de libreta, zona segura, teclado y botones fijos abajo.
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Renglones } from '@/components/Renglones';

interface Props {
  children: ReactNode;
  encabezado?: ReactNode; // barra fija arriba (pantallas internas)
  cabecera?: ReactNode; // portada que se desplaza con el contenido (login)
  pie?: ReactNode; // botones fijos abajo
  libreta?: boolean; // fondo con renglones (true por defecto)
}

export function Pantalla({ children, encabezado, cabecera, pie, libreta = true }: Props) {
  const insets = useSafeAreaInsets();
  const arriba = encabezado || cabecera ? 16 : insets.top + 16;
  return (
    <KeyboardAvoidingView className="flex-1 bg-papel" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {libreta ? <Renglones /> : null}
      {encabezado}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: pie ? 24 : insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled">
        {cabecera}
        {/* pl-12: el contenido empieza después del margen rojo de la libreta */}
        <View className="pl-12 pr-5 gap-4" style={{ paddingTop: arriba }}>
          {children}
        </View>
      </ScrollView>
      {pie ? (
        <View className="flex-row gap-3 px-5 pt-3 bg-hoja border-t-2 border-tinta" style={{ paddingBottom: insets.bottom + 12 }}>
          {pie}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
