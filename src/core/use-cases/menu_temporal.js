export async function confirmarCambios() {
    const cambios = await obtenerCambiosPendientes(); // Obtener datos de menu_temporal
    if (!cambios.length) {
        console.log("No hay cambios para confirmar.");
        return;
    }

    // Filtrar datos para `menu_final`
    const cambiosFiltrados = cambios.map(({ producto, precio, updated_at }) => ({
        producto, precio, updated_at
    }));

    console.log("Intentando insertar estos datos en menu_final:", cambiosFiltrados);

    // Insertar cambios en `menu_final`
    const { data, error: insertError } = await supabase
        .from('menu_final')
        .insert(cambiosFiltrados);

    if (insertError) {
        console.error('Error al insertar en menu_final:', insertError);
        return;
    }

    console.log("¡Datos movidos correctamente!");

    // Limpiar `menu_temporal`
    const { error: deleteError } = await supabase
        .from('menu_temporal')
        .delete()
        .in('id', cambios.map(c => c.id));

    if (deleteError) {
        console.error('Error eliminando cambios de menu_temporal:', deleteError);
    }
}
confirmarCambios();