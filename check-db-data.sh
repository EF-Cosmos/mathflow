#!/bin/bash
# ===========================================
# 检查数据库记录脚本
# ===========================================

DERIVATION_ID="735ada87-951e-4bd6-b6a4-90ed42feb0ae"

echo "=== 检查推导记录 (Derivations) ==="
docker compose exec -T database psql -U postgres -d postgres -c "SELECT * FROM derivations WHERE id = '$DERIVATION_ID';"

echo ""
echo "=== 检查推导步骤 (Derivation Steps) ==="
docker compose exec -T database psql -U postgres -d postgres -c "SELECT id, derivation_id, step_number, input_latex, output_latex FROM derivation_steps WHERE derivation_id = '$DERIVATION_ID' ORDER BY step_number;"

echo ""
echo "=== 检查 RLS 策略 ==="
docker compose exec -T database psql -U postgres -d postgres -c "SELECT * FROM pg_policies WHERE tablename = 'derivations' OR tablename = 'derivation_steps';"
