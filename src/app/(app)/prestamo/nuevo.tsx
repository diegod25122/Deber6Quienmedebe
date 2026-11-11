// Parte 2 · CREATE: anotar un préstamo nuevo.
import { router } from 'expo-router';

import { Encabezado } from '@/components/Encabezado';
import { FormularioPrestamo } from '@/components/FormularioPrestamo';
import { useCrearPrestamo } from '@/data/hooks';
import { FORM_VACIO, queSePresto } from '@/domain/prestamo';
import { useFestejo } from '@/state/festejo';

export default function NuevoPrestamo() {
  const crear = useCrearPrestamo();
  const festejar = useFestejo();

  return (
    <FormularioPrestamo
      inicial={FORM_VACIO()}
      encabezado={<Encabezado titulo="Anotar préstamo" antetitulo="Nuevo" />}
      textoGuardar="Guardar en la libreta"
      onGuardar={async (datos) => {
        const p = await crear.mutateAsync(datos);
        router.back();
        await festejar({ animacion: 'exito', titulo: '¡Anotado!', detalle: `${p.persona} te debe ${queSePresto(p)}.` });
      }}
    />
  );
}
