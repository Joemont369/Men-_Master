/**
 * Guardar datos en LocalStorage
 * @param {string} clave - Nombre del dato a almacenar
 * @param {any} valor - Valor del dato
 */
export function guardarEnLocalStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

/**
 * Obtener datos desde LocalStorage
 * @param {string} clave - Nombre del dato
 * @returns {any} - Valor almacenado
 */
export function obtenerDeLocalStorage(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

/**
 * Eliminar datos de LocalStorage
 * @param {string} clave - Nombre del dato a eliminar
 */
export function eliminarDeLocalStorage(clave) {
    localStorage.removeItem(clave);
}
