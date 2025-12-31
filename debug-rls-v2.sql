
-- 模拟用户登录环境
BEGIN;
    -- 设置当前用户 ID
    SELECT set_config('request.jwt.claim.sub', '1d19132f-869d-4ab1-ace2-2e98b72a8714', true);
    SET ROLE authenticated;

    -- 检查 auth.uid()
    SELECT auth.uid() as current_uid;

    -- 检查 derivations
    SELECT id, title, user_id FROM derivations WHERE user_id = auth.uid();

    -- 检查 derivation_steps
    SELECT id, derivation_id, step_number, input_latex 
    FROM derivation_steps 
    WHERE derivation_id = 'b1aafea3-c071-49d8-8a1a-513d96d7d2d0';

ROLLBACK;
