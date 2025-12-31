#!/bin/bash
echo "=== Databases ==="
docker compose exec -T database psql -U postgres -c "\l"

echo ""
echo "=== Schemas in postgres DB ==="
docker compose exec -T database psql -U postgres -d postgres -c "\dn"

echo ""
echo "=== Tables in auth schema ==="
docker compose exec -T database psql -U postgres -d postgres -c "\dt auth.*"

echo ""
echo "=== Row count in auth.users ==="
docker compose exec -T database psql -U postgres -d postgres -c "SELECT count(*) FROM auth.users;"

echo ""
echo "=== Row count in public.profiles ==="
docker compose exec -T database psql -U postgres -d postgres -c "SELECT count(*) FROM public.profiles;"

echo ""
echo "=== Check RLS on auth.users ==="
docker compose exec -T database psql -U postgres -d postgres -c "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');"
