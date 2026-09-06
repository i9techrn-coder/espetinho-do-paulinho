-- Criação da Tabela de Clientes (Tenants)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL, -- ex: 'espetinhonordestino'
    name TEXT NOT NULL,
    pix_key TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da Tabela de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'aberto',
    total NUMERIC(10,2) NOT NULL,
    customer_data JSONB, -- Nome, telefone, endereço, etc
    items JSONB NOT NULL, -- Array de itens comprados
    origin TEXT DEFAULT 'Online', -- 'Mesa' ou 'Online'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de Performance (O que deixa tudo fluido e rápido)
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products (tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders (tenant_id);

-- Ativando RLS (Row Level Security) para segurança
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para Leitura Baseado no Tenant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tenants are viewable by everyone') THEN
        CREATE POLICY "Tenants are viewable by everyone" ON public.tenants FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products are viewable by everyone') THEN
        CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories are viewable by everyone') THEN
        CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert orders') THEN
        CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Orders viewable by everyone for now') THEN
        CREATE POLICY "Orders viewable by everyone for now" ON public.orders FOR SELECT USING (true);
    END IF;
END $$;
