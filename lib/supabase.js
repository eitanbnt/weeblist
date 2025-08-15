import { createClient } from '@supabase/supabase-js';// Import the createClient function from Supabase

// Initialize the Supabase client with the URL and anon key from environment variables

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
