import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerPizzas() {
  const { data, error } = await supabase
    .from('pizzas')
    .select('id, nombre, ingredientes, video_url, precio');

  if (error) {
    console.error('Error al obtener pizzas:', error);
    return [];
  }

  return data;
}
