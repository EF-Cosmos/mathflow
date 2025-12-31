#!/bin/bash
echo "=== 检查 mathflow 数据库中的数据 ==="

echo "1. Derivations (推导记录):"
docker compose exec -T database psql -U postgres -d mathflow -c "SELECT id, user_id, title, created_at FROM derivations ORDER BY created_at DESC LIMIT 5;"

echo ""
echo "2. Derivation Steps (推导步骤):"
docker compose exec -T database psql -U postgres -d mathflow -c "SELECT id, derivation_id, step_number, input_latex FROM derivation_steps ORDER BY created_at DESC LIMIT 5;"

echo ""
echo "3. RLS Policies (安全策略):"
docker compose exec -T database psql -U postgres -d mathflow -c "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('derivations', 'derivation_steps');"

echo ""
echo "4. Table Permissions (表权限):"
docker compose exec -T database psql -U postgres -d mathflow -c "\z derivation_steps"
