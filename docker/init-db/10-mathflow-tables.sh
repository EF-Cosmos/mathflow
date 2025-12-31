#!/bin/bash
# ===========================================
# MathFlow 应用表初始化脚本
# ===========================================

set -e

DB_NAME="${POSTGRES_DB:-postgres}"

echo "=== [10] 创建 MathFlow 应用表 ==="

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "$DB_NAME" <<-EOSQL

    -- =========================================
    -- 1. 创建应用表
    -- =========================================
    
    -- 用户配置表
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL,
        username TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 推导记录表
    CREATE TABLE IF NOT EXISTS public.derivations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title TEXT NOT NULL DEFAULT 'Untitled',
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 推导步骤表
    CREATE TABLE IF NOT EXISTS public.derivation_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        derivation_id UUID NOT NULL REFERENCES public.derivations(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        input_latex TEXT NOT NULL,
        output_latex TEXT NOT NULL,
        operation TEXT,
        annotation TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 数学模板表
    CREATE TABLE IF NOT EXISTS public.math_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        latex_template TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- AI 对话记录表
    CREATE TABLE IF NOT EXISTS public.ai_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        derivation_id UUID REFERENCES public.derivations(id) ON DELETE SET NULL,
        messages JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =========================================
    -- 2. 创建索引
    -- =========================================
    CREATE INDEX IF NOT EXISTS idx_derivations_user_id ON public.derivations(user_id);
    CREATE INDEX IF NOT EXISTS idx_derivation_steps_derivation_id ON public.derivation_steps(derivation_id);
    CREATE INDEX IF NOT EXISTS idx_math_templates_category ON public.math_templates(category);
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);

    -- =========================================
    -- 3. 授予权限
    -- =========================================
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

    -- =========================================
    -- 4. 启用 RLS (行级安全)
    -- =========================================
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.derivations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.derivation_steps ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
    -- math_templates 不启用 RLS，所有人可读

    -- =========================================
    -- 5. RLS 策略
    -- =========================================
    
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
    CREATE POLICY "steps_all" ON public.derivation_steps FOR ALL 
        USING (derivation_id IN (SELECT id FROM public.derivations WHERE user_id = auth.uid()));

    -- ai_conversations 策略
    DROP POLICY IF EXISTS "conversations_all" ON public.ai_conversations;
    CREATE POLICY "conversations_all" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

    -- math_templates 策略 (所有人可读)
    DROP POLICY IF EXISTS "templates_select" ON public.math_templates;
    CREATE POLICY "templates_select" ON public.math_templates FOR SELECT USING (true);

    -- =========================================
    -- 6. 插入默认数学模板
    -- =========================================
    INSERT INTO public.math_templates (category, name, description, latex_template) VALUES
        ('algebra', 'Quadratic Formula', 'Solution for ax² + bx + c = 0', 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'),
        ('algebra', 'Binomial Expansion', '(a+b)ⁿ expansion', '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k'),
        ('calculus', 'Power Rule', 'Derivative of xⁿ', '\\frac{d}{dx}x^n = nx^{n-1}'),
        ('calculus', 'Chain Rule', 'Derivative of composite function', '\\frac{d}{dx}f(g(x)) = f''(g(x)) \\cdot g''(x)'),
        ('calculus', 'Integration by Parts', '∫u dv formula', '\\int u\\,dv = uv - \\int v\\,du'),
        ('linear_algebra', 'Determinant 2x2', '2x2 matrix determinant', '\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc'),
        ('probability', 'Bayes Theorem', 'Conditional probability', 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}')
    ON CONFLICT DO NOTHING;

EOSQL

echo "=== [10] MathFlow 应用表创建完成 ==="
