import { createClient } from '@supabase/supabase-js';

// Conexión con Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Agregar una orden a la base de datos
 * @param {Object} orden - Datos de la orden (ej. productos, total, usuario)
 * @returns {Object} - Respuesta de Supabase
 */
export async function agregarOrden(orden) {
    try {
        const { data, error } = await supabase
            .from('ordenes')
            .insert([orden]);

        if (error) throw error;

        console.log('Orden guardada exitosamente:', data);
        return data;
    } catch (error) {
        console.error('Error al guardar la orden:', error);
        return null;
    }
}
