import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerMezcal() {
  const { data, error } = await supabase
    .from('mezcal')
    .select('id, nombre, imagen_url, precio_botella, precio_litro, precio_copa, licor_id');

  if (error) {
    console.error('Error al obtener mezcal:', error);
    return [];
  }

  return data;
}
