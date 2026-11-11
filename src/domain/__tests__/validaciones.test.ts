import { evaluarFortaleza } from '@/domain/fortalezaClave';
import { validarClave, validarCodigo, validarConfirmacion, validarCorreo } from '@/domain/validaciones';

describe('login', () => {
  it('valida el correo', () => {
    expect(validarCorreo('')).not.toBeNull();
    expect(validarCorreo('diego@')).not.toBeNull();
    expect(validarCorreo(' diego@gmail.com ')).toBeNull();
  });
  it('exige 8 caracteres en la contraseña', () => {
    expect(validarClave('1234567')).not.toBeNull();
    expect(validarClave('12345678')).toBeNull();
  });
  it('compara las dos contraseñas', () => {
    expect(validarConfirmacion('abcdefgh', 'abcdefgx')).not.toBeNull();
    expect(validarConfirmacion('abcdefgh', 'abcdefgh')).toBeNull();
  });
  it('el código de recuperación tiene 6 números', () => {
    expect(validarCodigo('12345')).not.toBeNull();
    expect(validarCodigo('12a456')).not.toBeNull();
    expect(validarCodigo('123456')).toBeNull();
  });
});

describe('seguridad de la contraseña', () => {
  it('débil, media y fuerte', () => {
    expect(evaluarFortaleza('').nivel).toBe('vacia');
    expect(evaluarFortaleza('prestamo').nivel).toBe('debil');
    expect(evaluarFortaleza('12345678').nivel).toBe('debil');
    expect(evaluarFortaleza('Prestamo26').nivel).toBe('media');
    expect(evaluarFortaleza('QuienMeDebe#2026').nivel).toBe('fuerte');
  });
});
