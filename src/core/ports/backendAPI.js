import { supabase } from '../../infra/supabase/supabaseClient';

/**
 * Obtener todas las órdenes desde Supabase
 * @returns {Array} Lista de órdenes
 */
export async function obtenerOrdenes() {
    try {
        const { data, error } = await supabase
            .from('ordenes')
            .select('*');

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return [];
    }
}

/**
 * Actualizar una orden existente
 * @param {number} id - ID de la orden
 * @param {Object} nuevosDatos - Datos actualizados
 * @returns {Object} - Respuesta de Supabase
 */
export async function actualizarOrden(id, nuevosDatos) {
    try {
        const { data, error } = await supabase
            .from('ordenes')
            .update(nuevosDatos)
            .eq('id', id);

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        return null;
    }
}

/**
 * Eliminar una orden
 * @param {number} id - ID de la orden a eliminar
 * @returns {boolean} - `true` si se eliminó correctamente, `false` en caso contrario
 */
export async function eliminarOrden(id) {
    try {
        const { error } = await supabase
            .from('ordenes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error al eliminar orden:', error);
        return false;
    }
}
