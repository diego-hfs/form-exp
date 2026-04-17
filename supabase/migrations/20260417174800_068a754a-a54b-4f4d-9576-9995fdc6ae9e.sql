ALTER TABLE public.conferencias
  ADD COLUMN IF NOT EXISTS lider text,
  ADD COLUMN IF NOT EXISTS data_lider timestamp with time zone,
  ADD COLUMN IF NOT EXISTS decisao_lider text;
