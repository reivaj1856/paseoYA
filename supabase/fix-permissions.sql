-- ============================================================================
-- PASEOYA MALL - CORRECCIÓN DE PRIVILEGIOS Y POLÍTICAS (SUPABASE)
-- ============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase para conceder
-- permisos de lectura y uso a los roles 'anon' (público) y 'authenticated'.

-- 1. Permiso de uso del schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Permisos en todas las tablas existentes
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- 3. Permisos en secuencias y funciones/RPCs
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 5. ASIGNACIÓN AUTOMÁTICA DE UUID V4 Y CORRECCIÓN DE RESTRICCIÓN PROFILES (Error 23503)
-- Elimina el requisito estricto de que el ID de perfil exista en auth.users antes de tiempo
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 6. Confirmar que las tiendas y categorías sean legibles públicamente
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categorias publicas" ON public.categories;
CREATE POLICY "Categorias publicas" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tiendas activas publicas" ON public.stores;
CREATE POLICY "Tiendas activas publicas" ON public.stores FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "Productos activos publicos" ON public.products;
CREATE POLICY "Productos activos publicos" ON public.products FOR SELECT USING (activo = true);
