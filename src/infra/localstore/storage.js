
/**
 * Guardar datos en localStorage
 * @param {string} clave - Clave para identificar los datos
 * @param {any} valor - Valor a guardar (será convertido a JSON)
 * @returns {boolean} - true si se guardó correctamente
 */
export function guardarLocal(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

/**
 * Obtener datos de localStorage
 * @param {string} clave - Clave de los datos a obtener
 * @returns {any} - Valor guardado o null si no existe
 */
export function obtenerLocal(clave) {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : null;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return null;
    }
}

/**
 * Eliminar datos de localStorage
 * @param {string} clave - Clave de los datos a eliminar
 * @returns {boolean} - true si se eliminó correctamente
 */
export function eliminarLocal(clave) {
    try {
        localStorage.removeItem(clave);
        return true;
    } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
        return false;
    }
}

/**
 * Sincronizar un objeto del localStorage con el servidor
 * @param {string} clave - Clave del objeto a sincronizar
 * @param {Function} funcionSync - Función que realiza la sincronización con el servidor
 * @returns {Promise<any>} - Resultado de la sincronización
 */
export async function sincronizarLocal(clave, funcionSync) {
    try {
        const datos = obtenerLocal(clave);
        if (!datos) return null;
        
        const resultado = await funcionSync(datos);
        return resultado;
    } catch (error) {
        console.error('Error al sincronizar datos locales:', error);
        return null;
    }
}
