DROP POLICY IF EXISTS "orders_anon_select_none" ON public.orders;
REVOKE SELECT ON public.orders FROM anon;
