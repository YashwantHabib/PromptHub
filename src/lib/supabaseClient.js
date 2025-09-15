import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vbxqqugnwptppwmhlpoz.supabase.co"; // replace
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieHFxdWdud3B0cHB3bWhscG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Mzg0NzYsImV4cCI6MjA3MzUxNDQ3Nn0.AUAfIAzcQVcGUAj83kKO4XAtk5EVDlykKFHhQyzkZoI"; // replace

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
