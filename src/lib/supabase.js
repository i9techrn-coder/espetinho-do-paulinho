import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wxjbifodewrmqmqvqjwj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NFfgz53qtNpcbEno24m4sQ_tEA6Ku5Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
