import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerTequilas() {
  const { data, error } = await supabase
    .from('tequilas')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener tequilas:', error);
    return [];
  }

  return data;
}
