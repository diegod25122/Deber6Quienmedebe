// TanStack Query sobre el CRUD: guarda la lista en memoria, muestra el estado
// de carga y vuelve a pedir los datos después de cada cambio.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  actualizarPrestamo,
  crearPrestamo,
  eliminarPrestamo,
  listarPrestamos,
  marcarDevuelto,
  obtenerPrestamo,
} from '@/data/prestamos';
import type { DatosPrestamo, Prestamo } from '@/domain/prestamo';
import { useSesion } from '@/state/sesion';

export const CLAVE_PRESTAMOS = ['prestamos'] as const;

export function usePrestamos() {
  const { usuario } = useSesion();
  return useQuery({
    // La clave incluye el usuario: al cambiar de cuenta no se mezclan listas.
    queryKey: [...CLAVE_PRESTAMOS, usuario?.id],
    queryFn: listarPrestamos,
    enabled: !!usuario,
  });
}

export function usePrestamo(id: string) {
  const { usuario } = useSesion();
  const cliente = useQueryClient();
  return useQuery({
    queryKey: [...CLAVE_PRESTAMOS, usuario?.id, id],
    queryFn: () => obtenerPrestamo(id),
    enabled: !!usuario && !!id,
    // Mientras llega, muestra el que ya está en la lista.
    placeholderData: () =>
      cliente
        .getQueryData<Prestamo[]>([...CLAVE_PRESTAMOS, usuario?.id])
        ?.find((p) => p.id === id),
  });
}

function useRefrescar() {
  const cliente = useQueryClient();
  return () => cliente.invalidateQueries({ queryKey: CLAVE_PRESTAMOS });
}

export function useCrearPrestamo() {
  const refrescar = useRefrescar();
  return useMutation({ mutationFn: (d: DatosPrestamo) => crearPrestamo(d), onSuccess: refrescar });
}

export function useActualizarPrestamo(id: string) {
  const refrescar = useRefrescar();
  return useMutation({ mutationFn: (d: DatosPrestamo) => actualizarPrestamo(id, d), onSuccess: refrescar });
}

export function useMarcarDevuelto(id: string) {
  const refrescar = useRefrescar();
  return useMutation({ mutationFn: (devuelto: boolean) => marcarDevuelto(id, devuelto), onSuccess: refrescar });
}

export function useEliminarPrestamo() {
  const refrescar = useRefrescar();
  return useMutation({ mutationFn: (id: string) => eliminarPrestamo(id), onSuccess: refrescar });
}
