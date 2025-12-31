-- Migration: enable_rls_policies
-- Created at: 1767002364


-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE derivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE derivation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Derivations policies
CREATE POLICY "Users can view own derivations" ON derivations FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can insert derivations" ON derivations FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can update own derivations" ON derivations FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can delete own derivations" ON derivations FOR DELETE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Derivation steps policies
CREATE POLICY "Users can view steps" ON derivation_steps FOR SELECT USING (auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can insert steps" ON derivation_steps FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can update steps" ON derivation_steps FOR UPDATE USING (auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can delete steps" ON derivation_steps FOR DELETE USING (auth.role() IN ('anon', 'service_role'));

-- Math templates policies (public read)
CREATE POLICY "Anyone can view templates" ON math_templates FOR SELECT USING (true);
CREATE POLICY "Service can manage templates" ON math_templates FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- AI conversations policies
CREATE POLICY "Users can view own conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
CREATE POLICY "Users can insert conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));
;