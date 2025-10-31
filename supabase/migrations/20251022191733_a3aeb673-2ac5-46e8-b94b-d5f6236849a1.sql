-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price > 0),
  category text NOT NULL,
  image_url text,
  stock integer DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view products
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

-- Create index for better performance
CREATE INDEX idx_products_category ON public.products(category);

-- Insert sample products for each category
INSERT INTO public.products (name, description, price, category, image_url) VALUES
-- Vegetables
('Fresh Tomatoes', 'Juicy red tomatoes', 40, 'Vegetables', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80'),
('Green Capsicum', 'Fresh bell peppers', 50, 'Vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80'),
('Onions', 'Fresh red onions', 30, 'Vegetables', 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80'),
('Potatoes', 'Farm fresh potatoes', 25, 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80'),
('Carrots', 'Crunchy orange carrots', 35, 'Vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80'),

-- Fruits
('Apples', 'Crispy red apples', 120, 'Fruits', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80'),
('Bananas', 'Fresh yellow bananas', 50, 'Fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80'),
('Oranges', 'Juicy sweet oranges', 80, 'Fruits', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80'),
('Grapes', 'Sweet green grapes', 90, 'Fruits', 'https://images.unsplash.com/photo-1599819177018-c42c6e4e9455?w=400&q=80'),
('Watermelon', 'Fresh watermelon', 60, 'Fruits', 'https://images.unsplash.com/photo-1587049352846-4a222e784343?w=400&q=80'),

-- Grocery
('Rice - 1kg', 'Premium basmati rice', 80, 'Grocery', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80'),
('Sugar - 1kg', 'Pure white sugar', 45, 'Grocery', 'https://images.unsplash.com/photo-1514576446057-b449bc88d0c0?w=400&q=80'),
('Salt - 1kg', 'Iodized table salt', 20, 'Grocery', 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&q=80'),
('Cooking Oil - 1L', 'Sunflower oil', 150, 'Grocery', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80'),
('Pasta - 500g', 'Italian pasta', 70, 'Grocery', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80'),

-- Dairy
('Milk - 1L', 'Fresh full cream milk', 60, 'Dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'),
('Curd - 400g', 'Fresh homemade curd', 40, 'Dairy', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80'),
('Cheese - 200g', 'Processed cheese', 120, 'Dairy', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80'),
('Butter - 100g', 'Premium butter', 55, 'Dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80'),
('Paneer - 200g', 'Fresh cottage cheese', 80, 'Dairy', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80'),

-- Bakery
('Bread', 'Fresh whole wheat bread', 35, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'),
('Cookies - 200g', 'Chocolate chip cookies', 60, 'Bakery', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80'),
('Cake - 500g', 'Vanilla sponge cake', 250, 'Bakery', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'),
('Croissant', 'Butter croissants', 45, 'Bakery', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80'),
('Muffins - 4pcs', 'Blueberry muffins', 100, 'Bakery', 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&q=80'),

-- Beverages
('Coca Cola - 1L', 'Cold drink', 50, 'Beverages', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80'),
('Orange Juice - 1L', 'Fresh orange juice', 80, 'Beverages', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80'),
('Coffee - 200g', 'Instant coffee powder', 120, 'Beverages', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80'),
('Tea - 250g', 'Premium tea leaves', 90, 'Beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'),
('Energy Drink', 'Sports energy drink', 60, 'Beverages', 'https://images.unsplash.com/photo-1622543925917-763c34f6a1bb?w=400&q=80');