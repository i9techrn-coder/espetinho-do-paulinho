-- Novas colunas do "Espetinho da Jana" para a tabela tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS delivery_fees JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS order_methods JSONB DEFAULT '{"pickup": true, "delivery": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{
    "Segunda": { "open": "18:00", "close": "00:00", "active": true },
    "Terça": { "open": "18:00", "close": "00:00", "active": true },
    "Quarta": { "open": "18:00", "close": "00:00", "active": true },
    "Quinta": { "open": "18:00", "close": "00:00", "active": true },
    "Sexta": { "open": "18:00", "close": "02:00", "active": true },
    "Sábado": { "open": "18:00", "close": "02:00", "active": true },
    "Domingo": { "open": "18:00", "close": "23:00", "active": true }
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_config JSONB DEFAULT '{"phone": "", "instagram": "", "locationUrl": ""}'::jsonb;
