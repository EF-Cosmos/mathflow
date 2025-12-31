
-- 模拟用户登录环境
BEGIN;
    -- 设置当前用户 ID
    SELECT set_config('request.jwt.claim.sub', '1d19132f-869d-4ab1-ace2-2e98b72a8714', true);
    SET ROLE authenticated;

    -- 尝试读取 derivation_steps
    SELECT id, derivation_id, step_number FROM derivation_steps;

ROLLBACK;
