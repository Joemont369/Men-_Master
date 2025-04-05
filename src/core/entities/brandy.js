import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerBrandy() {
  const { data, error } = await supabase
    .from('brandy')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener brandy:', error);
    return [];
  }

  return data;
}
