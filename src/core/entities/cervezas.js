import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerCervezas() {
  const { data, error } = await supabase
    .from('cervezas')
    .select('id, nombre, imagen_url, precio');

  if (error) {
    console.error('Error al obtener cervezas:', error);
    return [];
  }

  return data;
}
