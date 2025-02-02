-- Add sort_order column to products table
alter table products add column sort_order integer default 0;

-- Create index for better query performance
create index products_sort_order_idx on products(sort_order);

-- Update existing products to have sequential sort_order
with numbered_products as (
  select id, row_number() over (order by created_at desc) - 1 as rn
  from products
)
update products
set sort_order = numbered_products.rn
from numbered_products
where products.id = numbered_products.id; 