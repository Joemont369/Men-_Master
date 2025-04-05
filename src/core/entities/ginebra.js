import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerGinebra() {
  const { data, error } = await supabase
    .from('ginebra')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener ginebra:', error);
    return [];
  }

  return data;
}
