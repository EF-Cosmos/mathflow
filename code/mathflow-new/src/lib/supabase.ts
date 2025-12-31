import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DerivationStep = {
  id: string;
  derivation_id: string;
  step_number: number;
  input_latex: string;
  output_latex: string;
  operation: string | null;
  annotation: string | null;
  is_verified: boolean;
  created_at: string;
};

export type Derivation = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type MathTemplate = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  latex_template: string;
  created_at: string;
};
