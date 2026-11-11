import {
  datosDesdeForm,
  diasEntre,
  dinero,
  estadoDe,
  filtrar,
  FORM_VACIO,
  leerMonto,
  resumir,
  sumarDias,
  textoPlazo,
  validarPrestamo,
  type Prestamo,
} from '@/domain/prestamo';

const HOY = '2026-11-10';

function prestamo(cambios: Partial<Prestamo>): Prestamo {
  return {
    id: Math.random().toString(36).slice(2),
    persona: 'Mateo',
    tipo: 'dinero',
    monto: 10,
    objeto: null,
    fechaPrestamo: '2026-11-01',
    fechaLimite: null,
    devuelto: false,
    devueltoEn: null,
    nota: null,
    creadoEn: '2026-11-01T10:00:00Z',
    ...cambios,
  };
}

describe('fechas', () => {
  it('suma días cruzando meses y cuenta la diferencia', () => {
    expect(sumarDias('2026-11-28', 7)).toBe('2026-12-05');
    expect(diasEntre('2026-11-10', '2026-11-13')).toBe(3);
    expect(diasEntre('2026-11-10', '2026-11-08')).toBe(-2);
  });
});

describe('estado de un préstamo', () => {
  it('devuelto gana sobre cualquier fecha', () => {
    expect(estadoDe(prestamo({ devuelto: true, fechaLimite: '2026-01-01' }), HOY)).toBe('devuelto');
  });
  it('atrasado si ya pasó la fecha límite', () => {
    expect(estadoDe(prestamo({ fechaLimite: '2026-11-09' }), HOY)).toBe('atrasado');
  });
  it('vence pronto si faltan 3 días o menos', () => {
    expect(estadoDe(prestamo({ fechaLimite: '2026-11-13' }), HOY)).toBe('pronto');
    expect(estadoDe(prestamo({ fechaLimite: '2026-11-14' }), HOY)).toBe('pendiente');
  });
  it('sin fecha límite es pendiente', () => {
    expect(estadoDe(prestamo({}), HOY)).toBe('pendiente');
  });
  it('explica el plazo en español', () => {
    expect(textoPlazo(prestamo({ fechaLimite: HOY }), HOY)).toBe('Vence hoy');
    expect(textoPlazo(prestamo({ fechaLimite: '2026-11-11' }), HOY)).toBe('Vence mañana');
    expect(textoPlazo(prestamo({ fechaLimite: '2026-11-05' }), HOY)).toBe('Atrasado 5 días');
  });
});

describe('dinero', () => {
  it('lee montos con punto, coma o símbolo', () => {
    expect(leerMonto('15')).toBe(15);
    expect(leerMonto('12,50')).toBe(12.5);
    expect(leerMonto('$ 7.25')).toBe(7.25);
  });
  it('rechaza montos inválidos', () => {
    expect(leerMonto('')).toBeNull();
    expect(leerMonto('0')).toBeNull();
    expect(leerMonto('1.234')).toBeNull();
    expect(leerMonto('abc')).toBeNull();
  });
  it('formatea en dólares', () => {
    expect(dinero(12.5)).toMatch(/12,50|12\.50/);
  });
});

describe('resumen y filtros', () => {
  const lista = [
    prestamo({ monto: 20, fechaLimite: '2026-11-01' }), // atrasado
    prestamo({ monto: 5.5 }), // pendiente
    prestamo({ tipo: 'objeto', monto: null, objeto: 'Libro' }), // objeto pendiente
    prestamo({ monto: 100, devuelto: true }), // devuelto: no cuenta
  ];

  it('suma solo lo que falta devolver', () => {
    expect(resumir(lista, HOY)).toEqual({ totalDinero: 25.5, objetosPendientes: 1, atrasados: 1, pendientes: 3 });
  });
  it('filtra y pone primero lo atrasado', () => {
    const pendientes = filtrar(lista, 'pendientes', HOY);
    expect(pendientes).toHaveLength(3);
    expect(pendientes[0].monto).toBe(20);
    expect(filtrar(lista, 'devueltos', HOY)).toHaveLength(1);
    expect(filtrar(lista, 'atrasados', HOY)).toHaveLength(1);
    expect(filtrar(lista, 'todos', HOY)).toHaveLength(4);
  });
});

describe('formulario', () => {
  it('pide persona y monto en un préstamo de dinero', () => {
    const e = validarPrestamo({ ...FORM_VACIO(HOY) });
    expect(e.persona).toBeDefined();
    expect(e.monto).toBeDefined();
  });
  it('pide el objeto en un préstamo de objeto', () => {
    const e = validarPrestamo({ ...FORM_VACIO(HOY), persona: 'Ana', tipo: 'objeto' });
    expect(e.objeto).toBeDefined();
    expect(e.monto).toBeUndefined();
  });
  it('no deja una devolución antes del préstamo', () => {
    const e = validarPrestamo({ ...FORM_VACIO(HOY), persona: 'Ana', montoTexto: '5', fechaLimite: '2026-11-01' });
    expect(e.fechaLimite).toBeDefined();
  });
  it('arma los datos para Supabase', () => {
    const d = datosDesdeForm({ ...FORM_VACIO(HOY), persona: '  Ana  ', montoTexto: '7,5', objeto: 'no va', nota: ' ' });
    expect(d).toMatchObject({ persona: 'Ana', tipo: 'dinero', monto: 7.5, objeto: null, nota: null });
  });
});
