import { obtenerOrdenes } from '../ports/frontendAPI';

/**
 * Calcular estadísticas de ventas
 * @returns {Object} - Datos procesados
 */
export async function obtenerEstadisticas() {
    const ordenes = await obtenerOrdenes();
    if (!ordenes || ordenes.length === 0) return { totalVentas: 0, productosMasVendidos: [] };

    // Procesar datos de ventas
    let totalVentas = 0;
    const conteoProductos = {};

    ordenes.forEach(orden => {
        totalVentas += orden.total;
        orden.productos.forEach(producto => {
            conteoProductos[producto] = (conteoProductos[producto] || 0) + 1;
        });
    });

    // Identificar los productos más vendidos
    const productosMasVendidos = Object.entries(conteoProductos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 productos más vendidos
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    return { totalVentas, productosMasVendidos };
}

