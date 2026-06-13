## Remove the AI Product Assistant feature

### Files to delete
- `supabase/functions/product-assistant/index.ts` (edge function — will also be removed from Supabase via `delete_edge_functions`)
- `src/components/chat/ProductAssistant.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatMessage.tsx`
- `src/components/chat/ProductRecommendationCard.tsx`
- `src/hooks/useProductAssistant.ts`
- `src/types/chat.ts`

### Files to edit
- `src/components/layout/MainLayout.tsx` — remove the `ProductAssistant` import and `<ProductAssistant />` render.
- `supabase/config.toml` — remove the `[functions.product-assistant]` block.

### Secret cleanup
- Delete the `LOVABLE_API_KEY` Supabase secret (no other function or frontend code references it — confirmed earlier). Done via `secrets--delete_secret`.

  Note: `LOVABLE_API_KEY` is a Lovable-managed internal secret. If the delete tool refuses to remove it, I'll leave it in place (it will simply be unused) and tell you — no other action needed.

### Verification after build mode
1. `rg LOVABLE_API_KEY` returns no results in the codebase.
2. `rg ProductAssistant|product-assistant|useProductAssistant` returns no results.
3. Preview still loads the homepage with no floating chat button and no console errors.

### What stays the same
No database, routing, cart, checkout, Razorpay, email, or admin code is touched. Only the chatbot UI and its edge function are removed.
