import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerEspumosos() {
  const { data, error } = await supabase
    .from('espumosos')
    .select('id, nombre, imagen_url, precio_botella, licor_id');

  if (error) {
    console.error('Error al obtener espumosos:', error);
    return [];
  }

  return data;
}
