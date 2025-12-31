-- 重新应用 RLS 策略

-- profiles 策略
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- derivations 策略
DROP POLICY IF EXISTS "derivations_select" ON public.derivations;
CREATE POLICY "derivations_select" ON public.derivations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "derivations_insert" ON public.derivations;
CREATE POLICY "derivations_insert" ON public.derivations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "derivations_update" ON public.derivations;
CREATE POLICY "derivations_update" ON public.derivations FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "derivations_delete" ON public.derivations;
CREATE POLICY "derivations_delete" ON public.derivations FOR DELETE USING (auth.uid() = user_id);

-- derivation_steps 策略
DROP POLICY IF EXISTS "steps_all" ON public.derivation_steps;
DROP POLICY IF EXISTS "steps_select" ON public.derivation_steps;
DROP POLICY IF EXISTS "steps_insert" ON public.derivation_steps;
DROP POLICY IF EXISTS "steps_update" ON public.derivation_steps;
DROP POLICY IF EXISTS "steps_delete" ON public.derivation_steps;
DROP POLICY IF EXISTS "Users can view steps" ON public.derivation_steps;
DROP POLICY IF EXISTS "Users can insert steps" ON public.derivation_steps;
DROP POLICY IF EXISTS "Users can update steps" ON public.derivation_steps;
DROP POLICY IF EXISTS "Users can delete steps" ON public.derivation_steps;

CREATE POLICY "steps_select" ON public.derivation_steps FOR SELECT 
    USING (derivation_id IN (SELECT id FROM public.derivations WHERE user_id = auth.uid()));

CREATE POLICY "steps_insert" ON public.derivation_steps FOR INSERT 
    WITH CHECK (derivation_id IN (SELECT id FROM public.derivations WHERE user_id = auth.uid()));

CREATE POLICY "steps_update" ON public.derivation_steps FOR UPDATE 
    USING (derivation_id IN (SELECT id FROM public.derivations WHERE user_id = auth.uid()));

CREATE POLICY "steps_delete" ON public.derivation_steps FOR DELETE 
    USING (derivation_id IN (SELECT id FROM public.derivations WHERE user_id = auth.uid()));

-- ai_conversations 策略
DROP POLICY IF EXISTS "conversations_all" ON public.ai_conversations;
CREATE POLICY "conversations_all" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- math_templates 策略 (所有人可读)
DROP POLICY IF EXISTS "templates_select" ON public.math_templates;
CREATE POLICY "templates_select" ON public.math_templates FOR SELECT USING (true);
