-- ============================================
-- UPGRADE: Sistema de Trial + Super Admin
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Novas colunas na tabela tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS responsible_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_until TIMESTAMP WITH TIME ZONE;

-- 2. Atualizar o tenant existente para status 'active' (espetinhonordestino já existia)
UPDATE public.tenants SET status = 'active', approved_until = NOW() + INTERVAL '1 year' WHERE slug = 'espetinhonordestino';

-- 3. Permitir INSERT anônimo na tabela tenants (para o cadastro do site)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create tenants') THEN
        CREATE POLICY "Anyone can create tenants" ON public.tenants FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update tenants') THEN
        CREATE POLICY "Anyone can update tenants" ON public.tenants FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert products') THEN
        CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update products') THEN
        CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete products') THEN
        CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert categories') THEN
        CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update categories') THEN
        CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete categories') THEN
        CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update orders') THEN
        CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete orders') THEN
        CREATE POLICY "Anyone can delete orders" ON public.orders FOR DELETE USING (true);
    END IF;
END $$;
