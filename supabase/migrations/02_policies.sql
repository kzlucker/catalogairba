-- RLS: изменение товаров только для авторизованных пользователей (роль authenticated)
-- SELECT для всех остаётся из миграции 01_init (products_select_all).

DROP POLICY IF EXISTS "products_insert_authenticated" ON products;
CREATE POLICY "products_insert_authenticated"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "products_update_authenticated" ON products;
CREATE POLICY "products_update_authenticated"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "products_delete_authenticated" ON products;
CREATE POLICY "products_delete_authenticated"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);
