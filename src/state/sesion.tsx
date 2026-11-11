// Sesión con Supabase Auth. Es el único lugar de la app que llama a
// supabase.auth (salvo src/lib/oauth.ts para Google).
//
// onAuthStateChange es la fuente de verdad: cuando cambia la sesión, el
// _layout raíz muestra las pantallas de login o las de la app solo
// (Stack.Protected). Las pantallas no navegan a mano después de entrar o salir.
import type { Session, User } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { entrarConGoogle as abrirGoogle, type ResultadoGoogle } from '@/lib/oauth';
import { configuracionLista, supabase } from '@/lib/supabase';

interface ValorSesion {
  sesion: Session | null;
  usuario: User | null;
  cargando: boolean; // leyendo la sesión guardada al abrir la app
  configuracionLista: boolean;
  nombre: string;
  foto: string | null;
  proveedores: string[]; // 'email', 'google'
  tieneClave: boolean; // false si solo entra con Google
  // true mientras se restablece la contraseña con el código: verifyOtp ya
  // abrió sesión, pero el usuario no debe entrar hasta poner la nueva clave.
  recuperando: boolean;
  iniciarSesion: (correo: string, clave: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, clave: string) => Promise<void>;
  entrarConGoogle: () => Promise<ResultadoGoogle>;
  enviarCodigo: (correo: string) => Promise<void>;
  restablecerClave: (correo: string, codigo: string, nueva: string) => Promise<void>;
  terminarRecuperacion: () => void;
  cambiarClave: (actual: string, nueva: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const Contexto = createContext<ValorSesion | null>(null);

function nombreDe(u: User | null): string {
  if (!u) return '';
  const m = u.user_metadata ?? {};
  const nombre = (m.nombre ?? m.full_name ?? m.name ?? '') as string;
  return nombre.trim() || (u.email ?? '').split('@')[0];
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [recuperando, setRecuperando] = useState(false);

  useEffect(() => {
    let activo = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (activo) setSesion(data.session);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    // No llamar a otras funciones de supabase dentro de este callback
    // (lo recomienda Supabase): solo se guarda la sesión.
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva);
    });
    return () => {
      activo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const usuario = sesion?.user ?? null;
  const proveedores = (usuario?.app_metadata?.providers as string[] | undefined) ??
    (usuario?.app_metadata?.provider ? [usuario.app_metadata.provider as string] : []);
  const m = usuario?.user_metadata ?? {};

  const valor: ValorSesion = {
    sesion,
    usuario,
    cargando,
    configuracionLista,
    nombre: nombreDe(usuario),
    foto: ((m.avatar_url ?? m.picture) as string | undefined) ?? null,
    proveedores,
    tieneClave: proveedores.includes('email'),
    recuperando,

    iniciarSesion: async (correo, clave) => {
      const { error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: clave });
      if (error) throw error;
    },

    // "Confirm email" está apagado en Supabase: signUp devuelve la sesión y
    // el usuario entra de una vez. El nombre se guarda en user_metadata.
    registrarse: async (nombre, correo, clave) => {
      const { data, error } = await supabase.auth.signUp({
        email: correo.trim(),
        password: clave,
        options: { data: { nombre: nombre.trim() } },
      });
      if (error) throw error;
      // Con un correo ya registrado Supabase no da error: devuelve un usuario
      // sin identidades (para no revelar qué correos existen).
      if (data.user && data.user.identities?.length === 0) {
        throw { code: 'user_already_exists' };
      }
    },

    entrarConGoogle: () => abrirGoogle(),

    // Recuperación por código: la plantilla "Reset password" de Supabase
    // manda {{ .Token }} (6 dígitos) en lugar de un enlace.
    enviarCodigo: async (correo) => {
      // Supabase no avisa si el correo no existe; se pregunta antes con la
      // función tipo_de_cuenta (supabase/esquema.sql).
      const tipo = await supabase.rpc('tipo_de_cuenta', { correo: correo.trim() });
      if (tipo.error) throw tipo.error;
      if (tipo.data === 'no_existe') throw { code: 'cuenta_no_existe' };
      if (tipo.data === 'google') throw { code: 'cuenta_google' };
      const { error } = await supabase.auth.resetPasswordForEmail(correo.trim());
      if (error) throw error;
    },

    restablecerClave: async (correo, codigo, nueva) => {
      setRecuperando(true);
      try {
        const { error } = await supabase.auth.verifyOtp({ email: correo.trim(), token: codigo.trim(), type: 'recovery' });
        if (error) throw error;
        const cambio = await supabase.auth.updateUser({ password: nueva });
        if (cambio.error) throw cambio.error;
      } catch (error) {
        // Si el código abrió sesión pero falló el cambio, no se deja entrar
        // a medias: se cierra la sesión y se puede volver a intentar.
        await supabase.auth.signOut();
        setRecuperando(false);
        throw error;
      }
    },

    // La pantalla lo llama cuando terminó la animación de "contraseña cambiada".
    terminarRecuperacion: () => setRecuperando(false),

    // Con la sesión abierta. Se comprueba la contraseña actual volviendo a
    // iniciar sesión con ella (como reauthenticate en el taller de Firebase).
    cambiarClave: async (actual, nueva) => {
      const correo = usuario?.email;
      if (!correo) throw new Error('No hay usuario.');
      const prueba = await supabase.auth.signInWithPassword({ email: correo, password: actual });
      if (prueba.error) {
        throw prueba.error.code === 'invalid_credentials' || /invalid login/i.test(prueba.error.message)
          ? { code: 'clave_actual_incorrecta', message: 'La contraseña actual no es correcta.' }
          : prueba.error;
      }
      const { error } = await supabase.auth.updateUser({ password: nueva });
      if (error) throw error;
    },

    cerrarSesion: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  return <Contexto value={valor}>{children}</Contexto>;
}

export function useSesion(): ValorSesion {
  const v = use(Contexto);
  if (!v) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>.');
  return v;
}