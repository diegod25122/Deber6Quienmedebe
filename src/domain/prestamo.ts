// Modelo de un préstamo y sus reglas (funciones puras: se prueban con Jest).

export type TipoPrestamo = 'dinero' | 'objeto';

export interface Prestamo {
  id: string;
  persona: string;
  tipo: TipoPrestamo;
  monto: number | null;
  objeto: string | null;
  fechaPrestamo: string; // AAAA-MM-DD
  fechaLimite: string | null; // AAAA-MM-DD
  devuelto: boolean;
  devueltoEn: string | null;
  nota: string | null;
  creadoEn: string;
}

// Lo que el formulario manda a Supabase al crear o editar.
export interface DatosPrestamo {
  persona: string;
  tipo: TipoPrestamo;
  monto: number | null;
  objeto: string | null;
  fechaPrestamo: string;
  fechaLimite: string | null;
  nota: string | null;
}

export type EstadoPrestamo = 'devuelto' | 'atrasado' | 'pronto' | 'pendiente';

export const DIAS_PRONTO = 3; // "vence pronto" si faltan 3 días o menos

// ---------- Fechas (siempre en hora local, como AAAA-MM-DD) ----------

export function hoyISO(fecha = new Date()): string {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

export function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  return hoyISO(new Date(a, m - 1, d + dias));
}

export function diasEntre(desdeISO: string, hastaISO: string): number {
  const [a1, m1, d1] = desdeISO.split('-').map(Number);
  const [a2, m2, d2] = hastaISO.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const anioActual = new Date().getFullYear();
  return `${d} ${MESES[m - 1]}${a !== anioActual ? ` ${a}` : ''}`;
}

// ---------- Estado ----------

export function estadoDe(p: Pick<Prestamo, 'devuelto' | 'fechaLimite'>, hoy = hoyISO()): EstadoPrestamo {
  if (p.devuelto) return 'devuelto';
  if (!p.fechaLimite) return 'pendiente';
  const faltan = diasEntre(hoy, p.fechaLimite);
  if (faltan < 0) return 'atrasado';
  if (faltan <= DIAS_PRONTO) return 'pronto';
  return 'pendiente';
}

export function textoPlazo(p: Pick<Prestamo, 'devuelto' | 'fechaLimite' | 'devueltoEn'>, hoy = hoyISO()): string {
  if (p.devuelto) return p.devueltoEn ? `Devuelto el ${fechaCorta(p.devueltoEn.slice(0, 10))}` : 'Devuelto';
  if (!p.fechaLimite) return 'Sin fecha de devolución';
  const faltan = diasEntre(hoy, p.fechaLimite);
  if (faltan < -1) return `Atrasado ${-faltan} días`;
  if (faltan === -1) return 'Atrasado 1 día';
  if (faltan === 0) return 'Vence hoy';
  if (faltan === 1) return 'Vence mañana';
  return `Vence en ${faltan} días`;
}

// ---------- Dinero ----------

const FORMATO_USD = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export function dinero(valor: number): string {
  return FORMATO_USD.format(valor);
}

// Acepta "12", "12.5", "12,50" o "$ 12.50". Devuelve null si no es un monto válido.
export function leerMonto(texto: string): number | null {
  const limpio = texto.replace(/[$\s]/g, '').replace(',', '.');
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(limpio)) return null;
  const n = Number(limpio);
  return n > 0 ? n : null;
}

export function queSePresto(p: Pick<Prestamo, 'tipo' | 'monto' | 'objeto'>): string {
  return p.tipo === 'dinero' ? dinero(p.monto ?? 0) : (p.objeto ?? 'Objeto');
}

// ---------- Resumen y filtros ----------

export interface Resumen {
  totalDinero: number; // dinero que todavía te deben
  objetosPendientes: number;
  atrasados: number;
  pendientes: number; // préstamos sin devolver (dinero + objetos)
}

export function resumir(lista: Prestamo[], hoy = hoyISO()): Resumen {
  const r: Resumen = { totalDinero: 0, objetosPendientes: 0, atrasados: 0, pendientes: 0 };
  for (const p of lista) {
    if (p.devuelto) continue;
    r.pendientes++;
    if (p.tipo === 'dinero') r.totalDinero += p.monto ?? 0;
    else r.objetosPendientes++;
    if (estadoDe(p, hoy) === 'atrasado') r.atrasados++;
  }
  r.totalDinero = Math.round(r.totalDinero * 100) / 100;
  return r;
}

export type Filtro = 'todos' | 'pendientes' | 'atrasados' | 'devueltos';

export const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'pendientes', texto: 'Me deben' },
  { id: 'atrasados', texto: 'Atrasados' },
  { id: 'devueltos', texto: 'Devueltos' },
  { id: 'todos', texto: 'Todos' },
];

export function filtrar(lista: Prestamo[], filtro: Filtro, hoy = hoyISO()): Prestamo[] {
  const salida = lista.filter((p) => {
    if (filtro === 'todos') return true;
    if (filtro === 'devueltos') return p.devuelto;
    if (filtro === 'atrasados') return estadoDe(p, hoy) === 'atrasado';
    return !p.devuelto;
  });
  // Primero lo más urgente: atrasados, luego por fecha límite más cercana.
  const peso: Record<EstadoPrestamo, number> = { atrasado: 0, pronto: 1, pendiente: 2, devuelto: 3 };
  return salida.sort((a, b) => {
    const pa = peso[estadoDe(a, hoy)];
    const pb = peso[estadoDe(b, hoy)];
    if (pa !== pb) return pa - pb;
    const fa = a.fechaLimite ?? '9999-12-31';
    const fb = b.fechaLimite ?? '9999-12-31';
    if (fa !== fb) return fa.localeCompare(fb);
    return b.creadoEn.localeCompare(a.creadoEn);
  });
}

// ---------- Formulario ----------

export interface FormPrestamo {
  persona: string;
  tipo: TipoPrestamo;
  montoTexto: string;
  objeto: string;
  fechaPrestamo: string;
  fechaLimite: string | null;
  nota: string;
}

export type CampoPrestamo = 'persona' | 'monto' | 'objeto' | 'fechaLimite' | 'nota';

export const FORM_VACIO = (hoy = hoyISO()): FormPrestamo => ({
  persona: '',
  tipo: 'dinero',
  montoTexto: '',
  objeto: '',
  fechaPrestamo: hoy,
  fechaLimite: sumarDias(hoy, 7),
  nota: '',
});

export function formDesde(p: Prestamo): FormPrestamo {
  return {
    persona: p.persona,
    tipo: p.tipo,
    montoTexto: p.monto !== null ? String(p.monto) : '',
    objeto: p.objeto ?? '',
    fechaPrestamo: p.fechaPrestamo,
    fechaLimite: p.fechaLimite,
    nota: p.nota ?? '',
  };
}

export function validarPrestamo(f: FormPrestamo): Partial<Record<CampoPrestamo, string>> {
  const e: Partial<Record<CampoPrestamo, string>> = {};
  const persona = f.persona.trim();
  if (!persona) e.persona = '¿A quién le prestaste?';
  else if (persona.length > 60) e.persona = 'Máximo 60 caracteres.';

  if (f.tipo === 'dinero') {
    if (!f.montoTexto.trim()) e.monto = 'Escribe cuánto prestaste.';
    else if (leerMonto(f.montoTexto) === null) e.monto = 'Monto no válido. Ejemplo: 15.50';
  } else {
    const objeto = f.objeto.trim();
    if (!objeto) e.objeto = '¿Qué prestaste?';
    else if (objeto.length > 80) e.objeto = 'Máximo 80 caracteres.';
  }

  if (f.fechaLimite && f.fechaLimite < f.fechaPrestamo) {
    e.fechaLimite = 'La fecha de devolución no puede ser antes del préstamo.';
  }
  if (f.nota.trim().length > 200) e.nota = 'Máximo 200 caracteres.';
  return e;
}

export function datosDesdeForm(f: FormPrestamo): DatosPrestamo {
  return {
    persona: f.persona.trim(),
    tipo: f.tipo,
    monto: f.tipo === 'dinero' ? leerMonto(f.montoTexto) : null,
    objeto: f.tipo === 'objeto' ? f.objeto.trim() : null,
    fechaPrestamo: f.fechaPrestamo,
    fechaLimite: f.fechaLimite,
    nota: f.nota.trim() || null,
  };
}
