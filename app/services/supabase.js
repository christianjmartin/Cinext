import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../../config.js'; 

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_KEY = CONFIG.SUPABASE_API_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
