
import { supabase } from '../supabase/supabaseClient';

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

/**
 * Obtener sesión actual
 * @returns {Object} - Usuario actualmente autenticado o null
 */
export async function obtenerSesion() {
    const { data, error } = await supabase.auth.getSession();
    return error ? { error } : { session: data.session };
}

/**
 * Registrar nuevo usuario admin
 * @param {string} email - Correo del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Object} - Respuesta de Supabase
 */
export async function registrarAdmin(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'admin'
            }
        }
    });
    return error ? { error } : { user: data.user };
}
