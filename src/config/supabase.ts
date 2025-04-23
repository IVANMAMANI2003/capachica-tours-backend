// Inicializa y exporta el cliente Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from './index';

// Configuración simplificada ya que no usamos la autenticación integrada de Supabase
export const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);