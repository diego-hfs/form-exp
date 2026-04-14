
-- Create conferencias table
CREATE TABLE public.conferencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_embarque TEXT NOT NULL,
  separador TEXT NOT NULL,
  conferente TEXT,
  fiscal TEXT,
  status TEXT NOT NULL DEFAULT 'aguardando_conferencia',
  decisao_fiscal TEXT,
  data_separacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_conferencia TIMESTAMP WITH TIME ZONE,
  data_fiscal TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itens_separacao table
CREATE TABLE public.itens_separacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conferencia_id UUID NOT NULL REFERENCES public.conferencias(id) ON DELETE CASCADE,
  codigo_produto TEXT NOT NULL,
  descricao_produto TEXT NOT NULL,
  lote TEXT NOT NULL,
  data_fabricacao TEXT NOT NULL,
  data_validade TEXT NOT NULL,
  tipo_embalagem TEXT NOT NULL,
  quantidade_pallets INTEGER NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itens_conferencia table
CREATE TABLE public.itens_conferencia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conferencia_id UUID NOT NULL REFERENCES public.conferencias(id) ON DELETE CASCADE,
  item_separacao_id UUID NOT NULL REFERENCES public.itens_separacao(id) ON DELETE CASCADE,
  codigo_produto TEXT NOT NULL,
  lote TEXT NOT NULL,
  data_fabricacao TEXT NOT NULL,
  data_validade TEXT NOT NULL,
  tipo_embalagem TEXT NOT NULL,
  quantidade_pallets INTEGER NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_separacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_conferencia ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated and anonymous users full access (no auth in this app)
CREATE POLICY "Allow full access to conferencias" ON public.conferencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to itens_separacao" ON public.itens_separacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to itens_conferencia" ON public.itens_conferencia FOR ALL USING (true) WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_conferencias_updated_at
  BEFORE UPDATE ON public.conferencias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
