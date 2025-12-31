-- 添加外键约束
ALTER TABLE public.derivations 
ADD CONSTRAINT fk_derivations_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.ai_conversations 
ADD CONSTRAINT fk_ai_conversations_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
