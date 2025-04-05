import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerVodkas() {
  const { data, error } = await supabase
    .from('vodka')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener vodkas:', error);
    return [];
  }

  return data;
}
