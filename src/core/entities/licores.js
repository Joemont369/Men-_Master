import { supabase } from '../../infra/supabase/supabaseClient';

export async function obtenerLicores() {
  const { data, error } = await supabase
    .from('licores')
    .select('id, nombre, imagen_url, categoria');

  if (error) {
    console.error('Error al obtener licores:', error);
    return [];
  }

  return data;
}
