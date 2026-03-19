-- Бакет для фото товаров (публичное чтение)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Чтение файлов из бакета products для всех
DROP POLICY IF EXISTS "products_bucket_select_public" ON storage.objects;
CREATE POLICY "products_bucket_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'products');

-- Загрузка в бакет products только для авторизованных
DROP POLICY IF EXISTS "products_bucket_insert_authenticated" ON storage.objects;
CREATE POLICY "products_bucket_insert_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Политики INSERT/UPDATE/DELETE для products — в миграции 02_policies.sql
