import { agregarOrden } from '../use-cases/agregarOrden.js';
import { obtenerOrdenes } from './backendAPI.js';

/**
 * Enviar una nueva orden desde la interfaz al backend
 * @param {Object} orden - Datos de la orden
 * @returns {Object} - Respuesta de Supabase
 */
export async function enviarOrden(orden) {
    try {
        const resultado = await agregarOrden(orden);
        return resultado;
    } catch (error) {
        console.error('Error al enviar la orden:', error);
        return null;
    }
}

/**
 * Obtener todas las órdenes para mostrar en el frontend
 * @returns {Array} Lista de órdenes
 */
export async function cargarOrdenes() {
    try {
        const ordenes = await obtenerOrdenes();
        return ordenes;
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        return [];
    }
}
