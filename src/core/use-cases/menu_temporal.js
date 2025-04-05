
import { supabase } from '../../infra/supabase/supabaseClient';
import { guardarLocal, obtenerLocal } from '../../infra/localstore/storage';

/**
 * Guardar cambios temporales en el menú (local + Supabase)
 * @param {string} categoria - Categoría del producto (ej. 'cocteles', 'cervezas')
 * @param {number} productoId - ID del producto modificado
 * @param {Object} cambios - Cambios realizados al producto
 * @returns {boolean} - true si se guardó correctamente, false en caso contrario
 */
export async function guardarCambioTemporal(categoria, productoId, cambios) {
    try {
        // Guarda en localStorage
        const claveTemporal = `menu_temp_${categoria}_${productoId}`;
        guardarLocal(claveTemporal, {
            ...cambios,
            timestamp: new Date().toISOString()
        });
        
        // Guarda en Supabase (menu_temporal)
        const { error } = await supabase
            .from('menu_temporal')
            .upsert({
                categoria,
                producto_id: productoId,
                cambios: cambios,
                updated_at: new Date().toISOString()
            });
            
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Error al guardar cambio temporal:', error);
        return false;
    }
}

/**
 * Verificar si hay cambios temporales en Supabase y actualizar localStorage
 * @returns {Object} - Información sobre cambios sincronizados
 */
export async function sincronizarCambiosTemporales() {
    try {
        // Obtiene el timestamp del último sync
        const ultimoSync = obtenerLocal('ultimo_sync_temporal') || '1970-01-01T00:00:00Z';
        
        // Busca cambios más recientes que el último sync
        const { data, error } = await supabase
            .from('menu_temporal')
            .select('*')
            .gt('updated_at', ultimoSync);
            
        if (error) throw error;
        
        // Si hay cambios, actualiza localStorage
        if (data && data.length > 0) {
            data.forEach(item => {
                const claveTemporal = `menu_temp_${item.categoria}_${item.producto_id}`;
                guardarLocal(claveTemporal, {
                    ...item.cambios,
                    timestamp: item.updated_at
                });
            });
            
            // Actualiza timestamp del último sync
            guardarLocal('ultimo_sync_temporal', new Date().toISOString());
            
            return {
                sincronizado: true,
                cantidadCambios: data.length
            };
        }
        
        // No había cambios para sincronizar
        return {
            sincronizado: true,
            cantidadCambios: 0
        };
    } catch (error) {
        console.error('Error al sincronizar cambios temporales:', error);
        return {
            sincronizado: false,
            error: error.message
        };
    }
}

/**
 * Guardar cambios temporales de forma permanente
 * @param {string} categoria - Categoría del producto
 * @param {number} productoId - ID del producto modificado
 * @returns {boolean} - true si se guardó correctamente, false en caso contrario
 */
export async function confirmarCambiosPermanentes(categoria, productoId) {
    try {
        // Obtiene cambios temporales
        const claveTemporal = `menu_temp_${categoria}_${productoId}`;
        const cambiosTemp = obtenerLocal(claveTemporal);
        
        if (!cambiosTemp) return false;
        
        // Actualiza la tabla principal
        const { error: errorUpdate } = await supabase
            .from(categoria)
            .update(cambiosTemp)
            .eq('id', productoId);
            
        if (errorUpdate) throw errorUpdate;
        
        // Elimina de menu_temporal
        const { error: errorDelete } = await supabase
            .from('menu_temporal')
            .delete()
            .match({ categoria, producto_id: productoId });
            
        if (errorDelete) throw errorDelete;
        
        // Elimina de localStorage
        localStorage.removeItem(claveTemporal);
        
        return true;
    } catch (error) {
        console.error('Error al confirmar cambios permanentes:', error);
        return false;
    }
}
