
-- 模拟用户登录环境
BEGIN;
    -- 设置当前用户 ID (来自之前的查询结果)
    SELECT set_config('request.jwt.claim.sub', '1d19132f-869d-4ab1-ace2-2e98b72a8714', true);
    SET ROLE authenticated;

    RAISE NOTICE 'Testing RLS for user 1d19132f-869d-4ab1-ace2-2e98b72a8714';

    RAISE NOTICE '--- Checking auth.uid() ---';
    SELECT auth.uid() as current_uid;

    RAISE NOTICE '--- Checking derivations (should see 1 row for this user) ---';
    SELECT id, title, user_id FROM derivations WHERE user_id = auth.uid();

    RAISE NOTICE '--- Checking derivation_steps (should see 1 row for derivation b1aafea3...) ---';
    SELECT id, derivation_id, step_number, input_latex 
    FROM derivation_steps 
    WHERE derivation_id = 'b1aafea3-c071-49d8-8a1a-513d96d7d2d0';

ROLLBACK;
