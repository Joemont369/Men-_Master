
import { sincronizarCambiosTemporales, sincronizarTodosLosCambiosTemporales } from './menu_temporal';
import { sincronizarEstadisticasLocales } from './estadisticas';
import { guardarLocal, obtenerLocal } from '../../infra/localstore/storage';

/**
 * Verifica si es tiempo de realizar una sincronización automática
 * @returns {boolean} - true si han pasado al menos 5 minutos desde la última sincronización
 */
export function esTiempoDeSincronizar() {
  const ultimaSincronizacion = obtenerLocal('ultima_sincronizacion_completa');
  if (!ultimaSincronizacion) return true;

  const ahora = new Date();
  const ultima = new Date(ultimaSincronizacion);
  const diferenciaMilisegundos = ahora - ultima;
  const diferenciaMinutos = diferenciaMilisegundos / (1000 * 60);

  return diferenciaMinutos >= 5; // Sincronizar cada 5 minutos
}

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
      resultado.estadisticas = estadisticasResult;
    } catch (error) {
      console.error('Error en sincronización de estadísticas:', error);
      resultado.estadisticas = {
        sincronizado: false,
        error: error.message
      };
    }

    // 3. Registrar sincronización exitosa
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
 * Verifica pendientes de sincronización
 * @returns {Object} - Cantidad de elementos pendientes por sincronizar
 */
export function obtenerPendientesSincronizacion() {
  const cambiosPendientes = obtenerLocal('cambios_pendientes') || [];
  const ordenesPendientes = obtenerLocal('ordenes_locales') || [];
  
  return {
    cambioPendientes: cambiosPendientes.length,
    ordenesPendientes: ordenesPendientes.length,
    total: cambiosPendientes.length + ordenesPendientes.length
  };
}
