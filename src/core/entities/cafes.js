import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerCafes() {
  const { data, error } = await supabase
    .from('cafes')
    .select('id, nombre, ingredientes, video_url, precio, categoria')
    .eq('eliminado', false);

  if (error) {
    console.error('Error al obtener cafés:', error);
    return [];
  }

  return data;
}
