import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerRon() {
  const { data, error } = await supabase
    .from('ron')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener ron:', error);
    return [];
  }

  return data;
}
