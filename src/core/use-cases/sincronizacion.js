
import { sincronizarCambiosTemporales, sincronizarTodosLosCambiosTemporales } from './menu_temporal';
import { sincronizarEstadisticasLocales } from './estadisticas';
import { guardarLocal, obtenerLocal } from '../../infra/localstore/storage';

/**
 * Servicio de sincronización completo
 * @returns {Promise<Object>} - Resultado de todas las sincronizaciones
 */
export async function ejecutarSincronizacionCompleta() {
    try {
        const resultado = {
            menuTemporal: null,
            estadisticas: null,
            enviosPendientes: null,
            ultimaSincronizacion: new Date().toISOString()
        };

        // 1. Sincronizar cambios temporales bidireccionales
        try {
            // Primero enviamos cambios locales a Supabase
            const envioResult = await sincronizarTodosLosCambiosTemporales();
            resultado.enviosPendientes = envioResult;
            
            // Luego obtenemos cambios de Supabase
            const recepcionResult = await sincronizarCambiosTemporales();
            resultado.menuTemporal = recepcionResult;
        } catch (error) {
            console.error('Error en sincronización de menú temporal:', error);
            resultado.menuTemporal = { 
                sincronizado: false, 
                error: error.message 
            };
        }

        // 2. Sincronizar estadísticas
        try {
            const estadisticasResult = await sincronizarEstadisticasLocales();
            resultado.estadisticas = { 
                sincronizado: estadisticasResult 
            };
        } catch (error) {
            console.error('Error en sincronización de estadísticas:', error);
            resultado.estadisticas = { 
                sincronizado: false, 
                error: error.message 
            };
        }

        // 3. Guardar timestamp de última sincronización
        guardarLocal('ultima_sincronizacion_completa', resultado.ultimaSincronizacion);

        return resultado;
    } catch (error) {
        console.error('Error en sincronización completa:', error);
        return {
            error: error.message,
            ultimaSincronizacion: obtenerLocal('ultima_sincronizacion_completa') || 'nunca'
        };
    }
}

/**
 * Verifica si es necesario realizar una sincronización basado en el tiempo transcurrido
 * @param {number} minutos - Minutos entre sincronizaciones
 * @returns {boolean} - true si se debe sincronizar
 */
export function esTiempoDeSincronizar(minutos = 5) {
    const ultimaSinc = obtenerLocal('ultima_sincronizacion_completa');
    if (!ultimaSinc) return true;
    
    const tiempoTranscurrido = new Date() - new Date(ultimaSinc);
    const minutosTranscurridos = tiempoTranscurrido / (1000 * 60);
    
    return minutosTranscurridos >= minutos;
}
