// Parte 2 · UPDATE: corregir un préstamo ya anotado.
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Animacion } from '@/components/Animacion';
import { Encabezado } from '@/components/Encabezado';
import { FormularioPrestamo } from '@/components/FormularioPrestamo';
import { useActualizarPrestamo, usePrestamo } from '@/data/hooks';
import { formDesde } from '@/domain/prestamo';
import { useFestejo } from '@/state/festejo';

export default function EditarPrestamo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: prestamo, isPending } = usePrestamo(id);
  const actualizar = useActualizarPrestamo(id);
  const festejar = useFestejo();

  if (!prestamo) {
    return (
      <View className="flex-1 bg-papel">
        <Encabezado titulo="Editar préstamo" />
        <View className="flex-1 items-center justify-center gap-2">
          <Animacion nombre={isPending ? 'cargando' : 'error'} repetir className="w-40 h-32" descripcion="Cargando" />
          <Text className="text-base text-tinta">{isPending ? 'Cargando…' : 'Este préstamo ya no existe.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <FormularioPrestamo
      // key: si llegan datos nuevos del servidor, el formulario se rearma con ellos.
      key={prestamo.id}
      inicial={formDesde(prestamo)}
      encabezado={<Encabezado titulo="Editar préstamo" antetitulo={prestamo.persona} />}
      textoGuardar="Guardar cambios"
      onGuardar={async (datos) => {
        await actualizar.mutateAsync(datos);
        router.back();
        await festejar({ animacion: 'exito', titulo: 'Cambios guardados' });
      }}
    />
  );
}
