-- Agregar columna comprobante_url a inscripciones
ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS comprobante_url TEXT NULL;

-- Crear bucket para comprobantes (ejecutar en Storage, no en SQL editor)
-- insert into storage.buckets (id, name, public) values ('comprobantes', 'comprobantes', false);

-- Policy: cualquiera puede subir (insert) a comprobantes
-- create policy "upload_comprobante" on storage.objects
--   for insert with check (bucket_id = 'comprobantes');

-- Policy: solo service role puede leer (se accede desde el admin con signed URLs)
