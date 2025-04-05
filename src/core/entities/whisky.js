import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerWhiskys() {
  const { data, error } = await supabase
    .from('whiskys')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener whiskys:', error);
    return [];
  }

  return data;
}
