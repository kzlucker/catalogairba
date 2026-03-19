-- Таблица категорий
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Таблица товаров
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  weight_info TEXT,
  barcode TEXT,
  composition TEXT,
  calories NUMERIC(8, 2) NOT NULL DEFAULT 0,
  proteins NUMERIC(8, 2) NOT NULL DEFAULT 0,
  fats NUMERIC(8, 2) NOT NULL DEFAULT 0,
  carbs NUMERIC(8, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы для частых запросов
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);

-- RLS для categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- RLS для products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_all"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Тестовые данные: категории
INSERT INTO categories (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Готовая еда'),
  ('a0000000-0000-0000-0000-000000000002', 'Напитки');

-- Тестовые данные: товары
INSERT INTO products (
  id,
  name,
  price,
  weight_info,
  barcode,
  composition,
  calories,
  proteins,
  fats,
  carbs,
  image_url,
  is_active,
  category_id
) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Салат Цезарь с курицей',
    349.00,
    '350 г',
    '4601234567896',
    'Салат романо, куриная грудка, пармезан, соус Цезарь, сухарики, масло оливковое.',
    340,
    28,
    22,
    8,
    NULL,
    true,
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Овсянка с ягодами',
    189.00,
    '300 г',
    '4601234567894',
    'Овсяные хлопья, черника сушёная, малина сушёная, соль.',
    150,
    5,
    3,
    27,
    NULL,
    true,
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Смузи зелёный',
    199.00,
    '400 мл',
    '4601234567897',
    'Шпинат, киви, банан, яблоко, вода, лёд.',
    85,
    2,
    1,
    18,
    NULL,
    true,
    'a0000000-0000-0000-0000-000000000002'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Греческий йогурт 2%',
    129.00,
    '250 г',
    '4601234567892',
    'Молоко нормализованное, закваска молочнокислых культур.',
    97,
    9,
    5,
    4,
    NULL,
    true,
    'a0000000-0000-0000-0000-000000000002'
  );
