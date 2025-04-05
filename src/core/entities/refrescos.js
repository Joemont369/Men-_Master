import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerRefrescos() {
  const { data, error } = await supabase
    .from('refrescos')
    .select('id, nombre, presentacion, imagen_url, precio, categoria');

  if (error) {
    console.error('Error al obtener refrescos:', error);
    return [];
  }

  return data;
}
