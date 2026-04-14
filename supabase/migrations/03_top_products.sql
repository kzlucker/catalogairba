-- Таблица топ-10 товаров за месяц (управляется из админки)
CREATE TABLE top_products (
  rank        INTEGER   PRIMARY KEY CHECK (rank BETWEEN 1 AND 10),
  product_id  UUID      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE top_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "top_products_select_all"
  ON top_products FOR SELECT TO public USING (true);

CREATE POLICY "top_products_insert_authenticated"
  ON top_products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "top_products_update_authenticated"
  ON top_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "top_products_delete_authenticated"
  ON top_products FOR DELETE TO authenticated USING (true);
