import { obtenerOrdenes } from '../ports/frontendAPI';

/**
 * Calcular estadísticas de ventas
 * @returns {Object} - Datos procesados
 */
export async function obtenerEstadisticas() {
    // Obtener órdenes de Supabase
    const ordenesSupa = await obtenerOrdenes();

    // Obtener órdenes locales
    const ordenesLocales = obtenerLocal('ordenes_locales') || [];

    // Combinar órdenes para análisis
    const ordenes = [...ordenesSupa, ...ordenesLocales];

    if (!ordenes || ordenes.length === 0) {
        return { totalVentas: 0, productosMasVendidos: [] };
    }

    // Procesar datos de ventas
    let totalVentas = 0;
    const conteoProductos = {};

    ordenes.forEach(orden => {
        totalVentas += orden.total || 0;

        // Procesar los items (pueden estar en items o productos según la implementación)
        const productosLista = orden.items || orden.productos || [];

        productosLista.forEach(producto => {
            const nombreProducto = typeof producto === 'string'
                ? producto
                : (producto.nombre || 'Producto sin nombre');

            conteoProductos[nombreProducto] = (conteoProductos[nombreProducto] || 0) + 1;
        });
    });

    // Identificar los productos más vendidos
    const productosMasVendidos = Object.entries(conteoProductos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 productos más vendidos
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    return { totalVentas, productosMasVendidos };
}

import { supabase } from '../../infra/supabase/supabaseClient';
import { obtenerLocal } from '../../infra/localstore/storage';

/**
 * Obtener órdenes desde Supabase
 * @returns {Array} - Lista de órdenes
 */
export async function obtenerOrdenesSupabase() {
    try {
        const { data, error } = await supabase
            .from('ordenes')
            .select('*');

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return [];
    }
}


/**
 * Obtener estadísticas de ventas desde la vista materializada
 * @param {string} periodo - Periodo de tiempo ('dia', 'semana', 'mes')
 * @returns {Array} - Datos estadísticos
 */
export async function obtenerEstadisticasSupabase(periodo = 'semana') {
  try {
    const { data, error } = await supabase
      .from('vista_estadisticas')
      .select('*')
      .eq('periodo', periodo);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    
    // Fallback: usar datos locales si falla la conexión
    return obtenerEstadisticasLocales(periodo);
  }
}

/**
 * Obtener estadísticas locales (respaldo)
 * @param {string} periodo - Periodo de tiempo
 * @returns {Array} - Estadísticas calculadas desde localStorage
 */
function obtenerEstadisticasLocales(periodo) {
  const ordenesLocales = obtenerLocal('ordenes_locales') || [];
  const ahora = new Date();
  let fechaLimite = new Date();
  
  // Configurar periodo
  switch(periodo) {
    case 'dia':
      fechaLimite.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      fechaLimite.setDate(ahora.getDate() - 7);
      break;
    case 'mes':
      fechaLimite.setMonth(ahora.getMonth() - 1);
      break;
    default:
      fechaLimite.setDate(ahora.getDate() - 7); // Por defecto una semana
  }
  
  // Filtrar órdenes por periodo
  const ordenesFiltradas = ordenesLocales.filter(orden => {
    const fechaOrden = new Date(orden.fecha);
    return fechaOrden >= fechaLimite;
  });
  
  // Calcular totales por categoría
  const estadisticas = {};
  
  ordenesFiltradas.forEach(orden => {
    orden.items.forEach(item => {
      const categoria = item.categoria || 'sin_categoria';
      
      if (!estadisticas[categoria]) {
        estadisticas[categoria] = {
          total: 0,
          cantidad: 0
        };
      }
      
      estadisticas[categoria].total += item.precio;
      estadisticas[categoria].cantidad += 1;
    });
  });
  
  // Convertir a array para compatibilidad con formato de la vista materializada
  return Object.entries(estadisticas).map(([categoria, datos]) => ({
    categoria,
    total_ventas: datos.total,
    cantidad_productos: datos.cantidad,
    periodo
  }));
}

/**
 * Sincronizar estadísticas locales con Supabase
 * @returns {boolean} - true si la sincronización fue exitosa
 */
export async function sincronizarEstadisticasLocales() {
    try {
        const ordenesLocales = obtenerLocal('ordenes_locales') || [];
        if (ordenesLocales.length === 0) return true;

        // Enviar órdenes locales a Supabase en lote
        const { error } = await supabase
            .from('ordenes')
            .insert(ordenesLocales);

        if (error) throw error;

        // Limpiar órdenes locales después de sincronizar
        localStorage.removeItem('ordenes_locales');

        return true;
    } catch (error) {
        console.error('Error al sincronizar estadísticas locales:', error);
        return false;
    }
}

/**
 * Solicitar actualización manual de la vista materializada
 * Solo para administradores
 * @returns {boolean} - true si se inició la actualización
 */
export async function actualizarVistaEstadisticas() {
  try {
    // Solo un admin puede actualizar la vista materializada
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Se requiere autenticación para esta operación');
    }
    
    // Llamar a una función RPC que actualiza la vista materializada
    const { error } = await supabase.rpc('actualizar_vista_estadisticas');
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error al actualizar vista materializada:', error);
    return false;
  }
}