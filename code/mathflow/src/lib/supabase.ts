import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flftuutqvexvbgxdevar.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZnR1dXRxdmV4dmJneGRldmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTAxNzcsImV4cCI6MjA4MjU2NjE3N30.RkdavytAWPjMz9_6pStavEK4kK_U93zYNIbyF-l-uT8';

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
