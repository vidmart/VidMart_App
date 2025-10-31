-- Create users profile table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  category text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for products (public read)
alter table public.profiles enable row level security;

create policy "Anyone can view products"
  on public.products for select
  using (true);

-- Create orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  items jsonb not null,
  total numeric(10,2) not null,
  payment_method text,
  shipping_address text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- Orders policies
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed products data
insert into public.products (name, description, price, category, image_url) values
  -- Electronics
  ('Wireless Headphones', 'Premium noise-cancelling headphones', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
  ('Smart Watch', 'Fitness tracking smartwatch', 299.99, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
  
  -- Fashion
  ('Designer Sunglasses', 'UV protection sunglasses', 149.99, 'Fashion', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'),
  ('Leather Handbag', 'Genuine leather handbag', 249.99, 'Fashion', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'),
  
  -- Groceries
  ('Organic Coffee Beans', 'Premium organic coffee', 24.99, 'Groceries', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'),
  ('Fresh Fruit Basket', 'Assorted fresh fruits', 34.99, 'Groceries', 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400'),
  
  -- Home Decor
  ('Modern Table Lamp', 'LED table lamp with dimmer', 79.99, 'Home Decor', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'),
  ('Decorative Vase', 'Handcrafted ceramic vase', 59.99, 'Home Decor', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400'),
  
  -- Books
  ('Best Seller Novel', 'Award-winning fiction book', 19.99, 'Books', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
  ('Cooking Recipe Book', 'Gourmet cooking guide', 29.99, 'Books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
  
  -- Beauty
  ('Luxury Perfume', 'Floral scent perfume', 89.99, 'Beauty', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'),
  ('Skincare Set', 'Complete skincare routine', 119.99, 'Beauty', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400');