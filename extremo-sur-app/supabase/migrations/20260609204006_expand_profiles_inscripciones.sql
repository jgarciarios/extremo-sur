-- Expandir tabla profiles con datos del competidor
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS academia text,
  ADD COLUMN IF NOT EXISTS faixa text CHECK (faixa IN ('blanca','azul','morada','marron','negra')),
  ADD COLUMN IF NOT EXISTS pais text DEFAULT 'Uruguay',
  ADD COLUMN IF NOT EXISTS fecha_nacimiento date;

-- Agregar resultado a inscripciones
ALTER TABLE public.inscripciones
  ADD COLUMN IF NOT EXISTS resultado text CHECK (resultado IN ('oro','plata','bronce','sin_podio'));

-- RLS: el usuario solo puede leer y editar su propio perfil
CREATE POLICY IF NOT EXISTS "perfil_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "perfil_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
