ALTER TABLE orders
ADD COLUMN IF NOT EXISTS item_weight_kg DECIMAL(10,3)
CHECK (item_weight_kg IS NULL OR item_weight_kg > 0);

UPDATE orders
SET item_weight_kg = regexp_replace(lower(trim(item_weight)), '\\s*kg$', '')::DECIMAL(10,3)
WHERE item_weight_kg IS NULL
  AND item_weight IS NOT NULL
  AND trim(item_weight) ~* '^\\d+(\\.\\d+)?(\\s*kg)?$';