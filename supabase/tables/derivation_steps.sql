CREATE TABLE derivation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    derivation_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    input_latex TEXT NOT NULL,
    output_latex TEXT NOT NULL,
    operation TEXT,
    annotation TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);