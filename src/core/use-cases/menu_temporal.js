
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
                    dispositivo_id: dispositivoId,
                    updated_at: new Date().toISOString()
                });
                
            if (error) throw error;
            
            // Marcar como sincronizado con Supabase
            cambioCompleto.sincronizado = true;
            guardarLocal(claveTemporal, cambioCompleto);
            
            return { success: true };
        } catch (error) {
            console.warn('Error al guardar cambio en Supabase:', error);
            
            // Marcar como pendiente de sincronización
            cambioCompleto.sincronizado = false;
            guardarLocal(claveTemporal, cambioCompleto);
            
            // Agregar a la cola de pendientes
            const cambiosPendientes = obtenerLocal('cambios_pendientes') || [];
            cambiosPendientes.push({
                categoria,
                producto_id: productoId,
                clave: claveTemporal
            });
            guardarLocal('cambios_pendientes', cambiosPendientes);
            
            return { 
                success: false, 
                error: error.message,
                pendiente: true
            };
        }
    } catch (error) {
        console.error('Error al guardar cambio temporal:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Sincronizar todos los cambios pendientes con Supabase
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function sincronizarTodosLosCambiosTemporales() {
    try {
        const cambiosPendientes = obtenerLocal('cambios_pendientes') || [];
        
        if (cambiosPendientes.length === 0) {
            return { 
                success: true, 
                mensaje: 'No hay cambios pendientes para sincronizar' 
            };
        }
        
        // Preparar registros para insertar en lote
        const registrosParaInsertar = cambiosPendientes.map(({ categoria, producto_id, clave }) => {
            const cambio = obtenerLocal(clave);
            return {
                categoria,
                producto_id,
                cambios: cambio,
                dispositivo_id: cambio.dispositivo_id || obtenerLocal('dispositivo_id'),
                updated_at: new Date().toISOString()
            };
        });

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
                        sincronizado: true
                    });
                    
                    cambiosAplicados++;
                }
            });
            
            // Actualizar timestamp del último sync
            guardarLocal('ultimo_sync_temporal', new Date().toISOString());
            
            return { 
                sincronizado: true, 
                cantidadCambios: cambiosAplicados,
                mensaje: `${cambiosAplicados} cambios aplicados desde Supabase`
            };
        }
        
        // No hay cambios nuevos
        return { 
            sincronizado: true, 
            cantidadCambios: 0,
            mensaje: 'No hay cambios nuevos para sincronizar'
        };
    } catch (error) {
        console.error('Error al sincronizar cambios de Supabase:', error);
        return { 
            sincronizado: false, 
            error: error.message 
        };
    }
}

/**
 * Aplicar un cambio temporal a un producto (actualizar vista)
 * @param {string} categoria - Categoría del producto
 * @param {number} productoId - ID del producto
 * @param {Array} productos - Lista de productos a actualizar
 * @returns {Array} - Lista actualizada con cambios temporales aplicados
 */
export function aplicarCambiosTemporales(categoria, productos) {
    if (!productos || !Array.isArray(productos)) return productos;
    
    // Copia para no modificar el original
    const productosActualizados = [...productos];
    
    productosActualizados.forEach((producto, index) => {
        // Buscar cambios temporales para este producto
        const claveTemporal = `menu_temp_${categoria}_${producto.id}`;
        const cambiosTemporal = obtenerLocal(claveTemporal);
        
        if (cambiosTemporal) {
            // Aplicar cambios temporales
            if (cambiosTemporal.nombre) producto.nombre = cambiosTemporal.nombre;
            if (cambiosTemporal.precio) producto.precio = cambiosTemporal.precio;
            if (cambiosTemporal.descripcion) producto.descripcion = cambiosTemporal.descripcion;
            if (cambiosTemporal.disponible !== undefined) producto.disponible = cambiosTemporal.disponible;
            if (cambiosTemporal.destacado !== undefined) producto.destacado = cambiosTemporal.destacado;
            
            // Si el producto está marcado como no disponible, añadir indicador visual
            if (cambiosTemporal.disponible === false) {
                producto.noDisponible = true;
            }
        }
    });
    
    return productosActualizados;
}
