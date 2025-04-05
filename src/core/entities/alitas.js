import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerAlitas() {
  const { data, error } = await supabase
    .from('alitas')
    .select('id, nombre, ingredientes, video_url, precio');

  if (error) {
    console.error('Error al obtener alitas:', error);
    return [];
  }

  return data;
}
