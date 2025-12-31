CREATE TABLE math_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    latex_template TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);