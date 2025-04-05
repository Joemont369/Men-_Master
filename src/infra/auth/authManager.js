import { supabase } from '../supabase/SupabaseClient';

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email - Correo del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object} - Respuesta de Supabase
 */
export async function iniciarSesion(email, password) {
    const { user, error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error } : { user };
}

/**
 * Cerrar sesión
 * @returns {Object} - Respuesta de Supabase
 */
export async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    return error ? { error } : { mensaje: 'Sesión cerrada correctamente' };
}
