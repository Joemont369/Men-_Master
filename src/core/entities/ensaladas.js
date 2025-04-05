import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerEnsaladas() {
  const { data, error } = await supabase
    .from('ensaladas')
    .select('id, nombre, ingredientes, video_url, precio');

  if (error) {
    console.error('Error al obtener ensaladas:', error);
    return [];
  }

  return data;
}
