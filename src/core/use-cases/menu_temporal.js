
import { supabase } from '../../infra/supabase/supabaseClient';
import { guardarLocal, obtenerLocal } from '../../infra/localstore/storage';

/**
 * Guardar cambios temporales en el menú (local + Supabase)
 * @param {string} categoria - Categoría del producto (ej. 'cocteles', 'cervezas')
 * @param {number} productoId - ID del producto modificado
 * @param {Object} cambios - Cambios realizados al producto
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function guardarCambioTemporal(categoria, productoId, cambios) {
    try {
        // Obtener dispositivo_id para identificar quién hizo el cambio
        const dispositivoId = obtenerLocal('dispositivo_id') || 
                            'tablet-' + Math.random().toString(36).substring(2, 9);
        
        // Si no hay dispositivo_id, guardarlo
        if (!obtenerLocal('dispositivo_id')) {
            guardarLocal('dispositivo_id', dispositivoId);
        }
        
        // Preparar objeto de cambios con metadatos
        const cambioCompleto = {
            ...cambios,
            timestamp: new Date().toISOString(),
            dispositivo_id: dispositivoId
        };
        
        // Guarda en localStorage
        const claveTemporal = `menu_temp_${categoria}_${productoId}`;
        guardarLocal(claveTemporal, cambioCompleto);
        
        // Intentar guardar en Supabase (menu_temporal)
        try {
            const { error } = await supabase
                .from('menu_temporal')
                .upsert({
                    categoria,
                    producto_id: productoId,
                    cambios: cambioCompleto,
                    updated_at: new Date().toISOString(),
                    dispositivo_id: dispositivoId
                });
                
            if (error) throw error;
            
            return { 
                success: true, 
                syncedWithSupabase: true 
            };
        } catch (error) {
            console.warn('No se pudo sincronizar con Supabase, guardado localmente:', error);
            // Si falla, al menos tenemos los cambios en localStorage
            return { 
                success: true, 
                syncedWithSupabase: false,
                error: error.message 
            };
        }
    } catch (error) {
        console.error('Error al guardar cambio temporal:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Verificar si hay cambios temporales en Supabase y actualizar localStorage
 * @returns {Promise<Object>} - Información sobre cambios sincronizados
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
            let cambiosAplicados = 0;
            const dispositivoId = obtenerLocal('dispositivo_id');
            
            data.forEach(item => {
                // Solo actualizar cambios de otros dispositivos o más recientes
                const claveTemporal = `menu_temp_${item.categoria}_${item.producto_id}`;
                const cambioLocal = obtenerLocal(claveTemporal);
                
                // Si es un cambio de otro dispositivo, o es más reciente que nuestro cambio local
                if (item.dispositivo_id !== dispositivoId || 
                    !cambioLocal || 
                    new Date(item.updated_at) > new Date(cambioLocal.timestamp)) {
                    
                    guardarLocal(claveTemporal, {
                        ...item.cambios,
                        timestamp: item.updated_at
                    });
                    
                    cambiosAplicados++;
                }
            });
            
            // Actualiza timestamp del último sync
            guardarLocal('ultimo_sync_temporal', new Date().toISOString());
            
            return {
                sincronizado: true,
                cantidadCambios: cambiosAplicados
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
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function confirmarCambiosPermanentes(categoria, productoId) {
    try {
        // Obtiene cambios temporales
        const claveTemporal = `menu_temp_${categoria}_${productoId}`;
        const cambiosTemp = obtenerLocal(claveTemporal);
        
        if (!cambiosTemp) {
            return {
                success: false, 
                error: 'No hay cambios temporales para confirmar'
            };
        }
        
        // Extraer solo los datos relevantes del producto (eliminar metadatos)
        const { timestamp, dispositivo_id, ...datosPermanentes } = cambiosTemp;
        
        // Actualiza la tabla principal
        const { error: errorUpdate } = await supabase
            .from(categoria)
            .update(datosPermanentes)
            .eq('id', productoId);
            
        if (errorUpdate) throw errorUpdate;
        
        // Elimina de menu_temporal
        const { error: errorDelete } = await supabase
            .from('menu_temporal')
            .delete()
            .match({ categoria, producto_id: productoId });
            
        if (errorDelete) {
            console.warn('No se pudo eliminar de menu_temporal, continuando:', errorDelete);
        }
        
        // Elimina de localStorage
        localStorage.removeItem(claveTemporal);
        
        return {
            success: true,
            message: 'Cambios guardados permanentemente'
        };
    } catch (error) {
        console.error('Error al confirmar cambios permanentes:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sincronizar todos los cambios temporales pendientes desde localStorage a Supabase
 * @returns {Promise<Object>} - Resultados de la sincronización
 */
export async function sincronizarTodosLosCambiosTemporales() {
    try {
        const cambiosPendientes = [];
        // Buscar todas las claves que comienzan con "menu_temp_"
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave && clave.startsWith('menu_temp_')) {
                // Extraer categoría y producto_id del nombre de la clave
                const [, , categoria, productoId] = clave.split('_');
                if (categoria && productoId) {
                    cambiosPendientes.push({
                        categoria,
                        producto_id: parseInt(productoId),
                        cambios: obtenerLocal(clave)
                    });
                }
            }
        }

        if (cambiosPendientes.length === 0) {
            return { success: true, mensaje: 'No hay cambios pendientes' };
        }

        // Formatear para inserción en Supabase
        const registrosParaInsertar = cambiosPendientes.map(item => ({
            categoria: item.categoria,
            producto_id: item.producto_id,
            cambios: item.cambios,
            updated_at: new Date().toISOString(),
            dispositivo_id: obtenerLocal('dispositivo_id') || 'unknown'
        }));

        // Insertar en lote
        const { error } = await supabase
            .from('menu_temporal')
            .upsert(registrosParaInsertar);

        if (error) throw error;

        // Actualizar timestamp del último sync
        guardarLocal('ultimo_sync_temporal', new Date().toISOString());

        return {
            success: true,
            mensaje: `${cambiosPendientes.length} cambios sincronizados`
        };
    } catch (error) {
        console.error('Error al sincronizar todos los cambios temporales:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
