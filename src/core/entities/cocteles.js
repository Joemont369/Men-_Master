import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerCocteles() {
  const { data, error } = await supabase
    .from('cocteleria')
    .select('id, nombre, ingredientes, video_url, precio, categoria')
    .eq('eliminado', false);

  if (error) {
    console.error('Error al obtener cocteles:', error);
    return [];
  }

  return data;
}
