import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerCarnes() {
  const { data, error } = await supabase
    .from('carnes')
    .select('id, nombre, ingredientes, video_url, precio');

  if (error) {
    console.error('Error al obtener carnes:', error);
    return [];
  }

  return data;
}
