// Parte 2 · CRUD de préstamos contra la tabla public.prestamos de Supabase.
// RLS (supabase/esquema.sql) garantiza que cada usuario solo vea los suyos:
// por eso aquí no se filtra por user_id, y al crear lo pone la base de datos.
import type { DatosPrestamo, Prestamo } from '@/domain/prestamo';
import { supabase } from '@/lib/supabase';

interface FilaPrestamo {
  id: string;
  persona: string;
  tipo: 'dinero' | 'objeto';
  monto: number | string | null; // numeric llega como texto en algunas versiones
  objeto: string | null;
  fecha_prestamo: string;
  fecha_limite: string | null;
  devuelto: boolean;
  devuelto_en: string | null;
  nota: string | null;
  creado_en: string;
}

const COLUMNAS =
  'id, persona, tipo, monto, objeto, fecha_prestamo, fecha_limite, devuelto, devuelto_en, nota, creado_en';

function desdeFila(f: FilaPrestamo): Prestamo {
  return {
    id: f.id,
    persona: f.persona,
    tipo: f.tipo,
    monto: f.monto === null ? null : Number(f.monto),
    objeto: f.objeto,
    fechaPrestamo: f.fecha_prestamo,
    fechaLimite: f.fecha_limite,
    devuelto: f.devuelto,
    devueltoEn: f.devuelto_en,
    nota: f.nota,
    creadoEn: f.creado_en,
  };
}

function aFila(d: DatosPrestamo) {
  return {
    persona: d.persona,
    tipo: d.tipo,
    monto: d.monto,
    objeto: d.objeto,
    fecha_prestamo: d.fechaPrestamo,
    fecha_limite: d.fechaLimite,
    nota: d.nota,
  };
}

// READ (lista)
export async function listarPrestamos(): Promise<Prestamo[]> {
  const { data, error } = await supabase
    .from('prestamos')
    .select(COLUMNAS)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as FilaPrestamo[]).map(desdeFila);
}

// READ (uno)
export async function obtenerPrestamo(id: string): Promise<Prestamo | null> {
  const { data, error } = await supabase.from('prestamos').select(COLUMNAS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? desdeFila(data as FilaPrestamo) : null;
}

// CREATE
export async function crearPrestamo(d: DatosPrestamo): Promise<Prestamo> {
  const { data, error } = await supabase.from('prestamos').insert(aFila(d)).select(COLUMNAS).single();
  if (error) throw error;
  return desdeFila(data as FilaPrestamo);
}

// UPDATE
export async function actualizarPrestamo(id: string, d: DatosPrestamo): Promise<Prestamo> {
  const { data, error } = await supabase.from('prestamos').update(aFila(d)).eq('id', id).select(COLUMNAS).single();
  if (error) throw error;
  return desdeFila(data as FilaPrestamo);
}

// UPDATE (solo el estado)
export async function marcarDevuelto(id: string, devuelto: boolean): Promise<Prestamo> {
  const { data, error } = await supabase
    .from('prestamos')
    .update({ devuelto, devuelto_en: devuelto ? new Date().toISOString() : null })
    .eq('id', id)
    .select(COLUMNAS)
    .single();
  if (error) throw error;
  return desdeFila(data as FilaPrestamo);
}

// DELETE
export async function eliminarPrestamo(id: string): Promise<void> {
  const { error } = await supabase.from('prestamos').delete().eq('id', id);
  if (error) throw error;
}
