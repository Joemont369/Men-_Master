import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerSopas() {
  const { data, error } = await supabase
    .from('sopas')
    .select('id, nombre, ingredientes, video_url, precio');

  if (error) {
    console.error('Error al obtener sopas:', error);
    return [];
  }

  return data;
}
