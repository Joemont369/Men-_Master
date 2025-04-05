import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerDigestivos() {
  const { data, error } = await supabase
    .from('digestivos')
    .select('id, nombre, imagen_url, precio_botella, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener digestivos:', error);
    return [];
  }

  return data;
}
