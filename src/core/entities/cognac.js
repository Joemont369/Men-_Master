import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerCognac() {
  const { data, error } = await supabase
    .from('cognac')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener cognac:', error);
    return [];
  }

  return data;
}
