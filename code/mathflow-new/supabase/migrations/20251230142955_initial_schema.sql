-- 启用必要的扩展
create extension if not exists "uuid-ossp";

--_derivations 表：存储用户的数学推导记录
create table public.derivations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- derivation_steps 表：存储推导的每一步
create table public.derivation_steps (
  id uuid primary key default uuid_generate_v4(),
  derivation_id uuid not null references public.derivations(id) on delete cascade,
  step_number integer not null,
  input_latex text not null,
  output_latex text not null,
  operation text,
  annotation text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- math_templates 表：数学公式模板
create table public.math_templates (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  name text not null,
  description text,
  latex_template text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index derivations_user_id_idx on public.derivations(user_id);
create index derivation_steps_derivation_id_idx on public.derivation_steps(derivation_id);
create index math_templates_category_idx on public.math_templates(category);

-- 启用 RLS
alter table public.derivations enable row level security;
alter table public.derivation_steps enable row level security;
alter table public.math_templates enable row level security;

-- RLS 策略：derivations
create policy "用户可以查看自己的推导" on public.derivations
  for select using (auth.uid() = user_id);

create policy "用户可以创建自己的推导" on public.derivations
  for insert with check (auth.uid() = user_id);

create policy "用户可以更新自己的推导" on public.derivations
  for update using (auth.uid() = user_id);

create policy "用户可以删除自己的推导" on public.derivations
  for delete using (auth.uid() = user_id);

-- RLS 策略：derivation_steps (通过 derivations 间接控制)
create policy "用户可以查看自己推导的步骤" on public.derivation_steps
  for select using (
    exists (
      select 1 from public.derivations
      where derivations.id = derivation_steps.derivation_id
      and derivations.user_id = auth.uid()
    )
  );

create policy "用户可以为自己推导创建步骤" on public.derivation_steps
  for insert with check (
    exists (
      select 1 from public.derivations
      where derivations.id = derivation_steps.derivation_id
      and derivations.user_id = auth.uid()
    )
  );

create policy "用户可以更新自己推导的步骤" on public.derivation_steps
  for update using (
    exists (
      select 1 from public.derivations
      where derivations.id = derivation_steps.derivation_id
      and derivations.user_id = auth.uid()
    )
  );

create policy "用户可以删除自己推导的步骤" on public.derivation_steps
  for delete using (
    exists (
      select 1 from public.derivations
      where derivations.id = derivation_steps.derivation_id
      and derivations.user_id = auth.uid()
    )
  );

-- RLS 策略：math_templates (公开读取)
create policy "所有人可以查看模板" on public.math_templates
  for select using (true);

-- 自动更新 updated_at 触发器
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_derivations_updated_at
  before update on public.derivations
  for each row
  execute procedure public.update_updated_at_column();

-- 插入一些初始数学模板
insert into public.math_templates (category, name, description, latex_template) values
  ('代数', '二次方程', '求解二次方程', 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'),
  ('微积分', '导数定义', '导数的极限定义', 'f''(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}'),
  ('积分', '基本积分', '不定积分', '\\int f(x) dx = F(x) + C');
