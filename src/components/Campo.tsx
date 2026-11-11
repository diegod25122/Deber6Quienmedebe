// Campo de texto con etiqueta, error y botón Mostrar/Ocultar para claves.
import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

interface Props extends Omit<TextInputProps, 'className' | 'style'> {
  etiqueta: string;
  error?: string | null;
  ayuda?: string;
  esClave?: boolean;
  prefijo?: string; // p. ej. "$"
  grande?: boolean; // montos
}

export function Campo({ etiqueta, error, ayuda, esClave = false, prefijo, grande = false, ...resto }: Props) {
  const [enfocado, setEnfocado] = useState(false);
  const [visible, setVisible] = useState(false);
  const borde = error ? 'border-debe' : enfocado ? 'border-ambar' : 'border-tinta';

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold tracking-widest uppercase text-tenue">{etiqueta}</Text>
      <View className={`flex-row items-center rounded-xl border-2 bg-hoja ${borde}`}>
        {prefijo ? <Text className={`pl-4 text-tenue ${grande ? 'text-3xl font-display' : 'text-base'}`}>{prefijo}</Text> : null}
        <TextInput
          {...resto}
          secureTextEntry={esClave && !visible}
          autoCapitalize={esClave ? 'none' : resto.autoCapitalize}
          autoCorrect={esClave ? false : resto.autoCorrect}
          onFocus={(e) => {
            setEnfocado(true);
            resto.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            resto.onBlur?.(e);
          }}
          placeholderTextColorClassName="accent-tenue"
          cursorColorClassName="accent-ambar-hondo"
          className={`flex-1 px-4 text-tinta ${grande ? 'py-3 text-3xl font-display tabular-nums' : 'py-3.5 text-base'}`}
          accessibilityLabel={etiqueta}
        />
        {esClave ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
            className="px-4 py-3">
            <Text className="text-sm font-bold text-ambar-hondo">{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="text-sm font-semibold text-debe">{error}</Text>
      ) : ayuda ? (
        <Text className="text-sm text-tenue">{ayuda}</Text>
      ) : null}
    </View>
  );
}
