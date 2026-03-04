

## Plan: 3 Changes

### 1. Update South India delivery charge to ₹100

**Current**: Zone 5 "South India States" has `delivery_charge = 150`
**Change**: Update to `delivery_charge = 100` via SQL migration

```sql
UPDATE delivery_zones SET delivery_charge = 100, updated_at = NOW()
WHERE zone_number = 5;
```

### 2. Show oldest trending products first

**Current**: The `get_products_paginated` RPC sorts by `created_at DESC` (newest first)
**Change**: Update the RPC function to sort trending products by `created_at ASC` (oldest first), while keeping the default `DESC` sort for non-trending queries.

Update the SQL function's ORDER BY:
```sql
ORDER BY 
  CASE WHEN trending_only THEN plv.created_at END ASC,
  CASE WHEN NOT trending_only THEN plv.created_at END DESC
```

Also update `useTrendingProducts.ts` (the non-optimized hook) to add `.order('created_at', { ascending: true })`.

### 3. Change free shipping threshold from ₹3000 to ₹2000

**File**: `src/hooks/useDeliveryInfo.ts` - Change `FREE_SHIPPING_THRESHOLD = 3000` to `2000`

This constant is already used in all 4 places that reference free shipping (CartPage, CheckoutPage, PincodeChecker, useDeliveryInfo), so changing it in one place updates everything.

### Files to modify
- New migration SQL (delivery charge + RPC update)
- `src/hooks/useDeliveryInfo.ts` (threshold)
- `src/hooks/useTrendingProducts.ts` (sort order)

