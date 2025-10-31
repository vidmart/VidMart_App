-- Delete existing products
DELETE FROM public.products;

-- Insert 60 products (10 per category) for VidMart food categories
INSERT INTO public.products (name, description, price, category, image_url) VALUES
  -- Vegetables (10 items)
  ('Fresh Tomatoes', 'Organic vine-ripened tomatoes', 3.99, 'Vegetables', 'https://images.unsplash.com/photo-1546470427-e26264d4e2c8?w=400'),
  ('Green Bell Peppers', 'Crisp green peppers', 2.99, 'Vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'),
  ('Fresh Spinach', 'Organic baby spinach', 4.49, 'Vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'),
  ('Carrots', 'Sweet crunchy carrots', 2.49, 'Vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'),
  ('Broccoli', 'Fresh green broccoli', 3.49, 'Vegetables', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400'),
  ('Cauliflower', 'Organic cauliflower head', 3.99, 'Vegetables', 'https://images.unsplash.com/photo-1568584711271-e291f8e6e4a8?w=400'),
  ('Red Onions', 'Fresh red onions', 1.99, 'Vegetables', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400'),
  ('Potatoes', 'Farm fresh potatoes', 2.99, 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'),
  ('Cucumbers', 'Crispy fresh cucumbers', 2.49, 'Vegetables', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400'),
  ('Lettuce', 'Green leaf lettuce', 2.99, 'Vegetables', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400'),

  -- Fruits (10 items)
  ('Red Apples', 'Sweet and crispy apples', 4.99, 'Fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'),
  ('Bananas', 'Ripe yellow bananas', 2.99, 'Fruits', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'),
  ('Oranges', 'Juicy Valencia oranges', 3.99, 'Fruits', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400'),
  ('Strawberries', 'Fresh sweet strawberries', 5.99, 'Fruits', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'),
  ('Grapes', 'Seedless green grapes', 4.49, 'Fruits', 'https://images.unsplash.com/photo-1599819177331-4e87dc8a2af8?w=400'),
  ('Watermelon', 'Sweet red watermelon', 6.99, 'Fruits', 'https://images.unsplash.com/photo-1587049352846-4a222e784319?w=400'),
  ('Mangoes', 'Tropical ripe mangoes', 5.49, 'Fruits', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'),
  ('Pineapple', 'Fresh golden pineapple', 4.99, 'Fruits', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400'),
  ('Blueberries', 'Organic blueberries', 6.49, 'Fruits', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400'),
  ('Kiwi', 'Green kiwi fruits', 3.99, 'Fruits', 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400'),

  -- Grocery (10 items)
  ('Basmati Rice', 'Premium long grain rice 5kg', 12.99, 'Grocery', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
  ('Whole Wheat Flour', 'Organic wheat flour 2kg', 8.99, 'Grocery', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
  ('Olive Oil', 'Extra virgin olive oil 1L', 14.99, 'Grocery', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'),
  ('Pasta', 'Italian spaghetti 500g', 3.49, 'Grocery', 'https://images.unsplash.com/photo-1551462147-37950b60ec8d?w=400'),
  ('Canned Beans', 'Kidney beans 400g', 2.49, 'Grocery', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400'),
  ('Sugar', 'White granulated sugar 1kg', 3.99, 'Grocery', 'https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?w=400'),
  ('Salt', 'Iodized table salt 1kg', 1.99, 'Grocery', 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400'),
  ('Tea Bags', 'Black tea 100 bags', 6.99, 'Grocery', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400'),
  ('Coffee', 'Ground coffee 250g', 9.99, 'Grocery', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'),
  ('Honey', 'Pure organic honey 500g', 11.99, 'Grocery', 'https://images.unsplash.com/photo-1587049352846-4a222e784319?w=400'),

  -- Dairy (10 items)
  ('Fresh Milk', 'Full cream milk 1L', 2.99, 'Dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'),
  ('Cheddar Cheese', 'Aged cheddar cheese 200g', 5.99, 'Dairy', 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400'),
  ('Greek Yogurt', 'Plain Greek yogurt 500g', 4.49, 'Dairy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
  ('Butter', 'Unsalted butter 250g', 4.99, 'Dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'),
  ('Cream', 'Heavy whipping cream 500ml', 3.99, 'Dairy', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400'),
  ('Mozzarella', 'Fresh mozzarella 250g', 6.49, 'Dairy', 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400'),
  ('Paneer', 'Fresh cottage cheese 200g', 5.49, 'Dairy', 'https://images.unsplash.com/photo-1631403852716-2bb9c66aabda?w=400'),
  ('Eggs', 'Farm fresh eggs 12 pack', 4.99, 'Dairy', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
  ('Ice Cream', 'Vanilla ice cream 1L', 7.99, 'Dairy', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'),
  ('Sour Cream', 'Sour cream 250ml', 3.49, 'Dairy', 'https://images.unsplash.com/photo-1629699883057-d5f1d24e0c6d?w=400'),

  -- Bakery (10 items)
  ('White Bread', 'Fresh white bread loaf', 2.99, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
  ('Croissants', 'Buttery croissants 4 pack', 5.99, 'Bakery', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'),
  ('Bagels', 'Plain bagels 6 pack', 4.49, 'Bakery', 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ef6?w=400'),
  ('Chocolate Cake', 'Rich chocolate cake', 12.99, 'Bakery', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'),
  ('Donuts', 'Glazed donuts 6 pack', 6.99, 'Bakery', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400'),
  ('Muffins', 'Blueberry muffins 4 pack', 5.49, 'Bakery', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400'),
  ('Baguette', 'French baguette', 3.49, 'Bakery', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400'),
  ('Cookies', 'Chocolate chip cookies 12 pack', 4.99, 'Bakery', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'),
  ('Cinnamon Rolls', 'Fresh cinnamon rolls 4 pack', 7.49, 'Bakery', 'https://images.unsplash.com/photo-1542838309-d5b6f4d5d742?w=400'),
  ('Pita Bread', 'Whole wheat pita 6 pack', 3.99, 'Bakery', 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400'),

  -- Beverages (10 items)
  ('Orange Juice', 'Fresh squeezed juice 1L', 5.99, 'Beverages', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'),
  ('Coca Cola', 'Cola soft drink 2L', 3.49, 'Beverages', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'),
  ('Mineral Water', 'Sparkling water 1L', 2.49, 'Beverages', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400'),
  ('Green Tea', 'Organic green tea 20 bags', 6.49, 'Beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
  ('Energy Drink', 'Energy boost drink 250ml', 3.99, 'Beverages', 'https://images.unsplash.com/photo-1622543925917-763c34c1a86e?w=400'),
  ('Apple Juice', 'Pure apple juice 1L', 4.99, 'Beverages', 'https://images.unsplash.com/photo-1600514632620-ae6c433ecf8a?w=400'),
  ('Iced Coffee', 'Cold brew coffee 500ml', 4.49, 'Beverages', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400'),
  ('Lemonade', 'Fresh lemonade 1L', 3.99, 'Beverages', 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400'),
  ('Smoothie', 'Mixed berry smoothie 500ml', 5.49, 'Beverages', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400'),
  ('Coconut Water', 'Natural coconut water 500ml', 3.99, 'Beverages', 'https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?w=400');