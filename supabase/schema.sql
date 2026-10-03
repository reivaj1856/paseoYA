-- ============================================================================
-- PASEO ARANJUEZ - PASEOYA: ESQUEMA DE BASE DE DATOS Y LÓGICA DE NEGOCIO (SUPABASE)
-- ============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('cliente', 'comercio', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'recibido',
        'confirmado',
        'preparando',
        'listo_para_recoger',
        'cliente_llego',
        'entregado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE parking_status AS ENUM ('emitido', 'canjeado', 'expirado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: CATEGORIES (Rubros comerciales de Paseo Aranjuez)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    icono TEXT,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABLA: STORES (Tiendas y Locales de Paseo Aranjuez)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    rubro TEXT NOT NULL,
    piso TEXT NOT NULL, -- 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'
    sector TEXT,
    local TEXT NOT NULL, -- Ej: 'Local 104', 'L-215'
    horario_semana TEXT NOT NULL DEFAULT '10:00 - 22:00',
    horario_domingo_feriado TEXT NOT NULL DEFAULT '12:00 - 22:00',
    telefono TEXT,
    logo_url TEXT,
    portada_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABLA: PROFILES (Perfiles con roles y vinculación de tienda - UUID v4 automático)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    rol user_role NOT NULL DEFAULT 'cliente',
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Si la tabla ya existía con la restricción foránea a auth.users, la eliminamos para evitar errores 23503:
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 6. TABLA: PRODUCTS (Catálogo con control de stock de cada tienda)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url TEXT,
    categoria TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. TABLA: ORDERS (Pedidos con ventana de retiro y códigos de seguridad)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
    estado order_status NOT NULL DEFAULT 'recibido',
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    pickup_code TEXT NOT NULL UNIQUE, -- Código QR/alfanumérico (ej: PY-A89F2)
    pin_seguridad TEXT NOT NULL,      -- PIN numérico de respaldo (4 dígitos)
    ventana_retiro TEXT NOT NULL,     -- Ej: 'Hoy 15:30 - 16:30'
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. TABLA: ORDER_ITEMS (Detalle de productos comprados)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    nombre_producto TEXT NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. TABLA: ORDER_STATUS_HISTORY (Trazabilidad y auditoría de cambios de estado)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    estado_anterior order_status,
    estado_nuevo order_status NOT NULL,
    cambiado_por UUID REFERENCES public.profiles(id),
    rol_actor TEXT NOT NULL,
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. TABLA: PARKING_VALIDATIONS (Validación de parqueo subterráneo por consumo)
CREATE TABLE IF NOT EXISTS public.parking_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.profiles(id),
    codigo_qr TEXT NOT NULL UNIQUE,
    horas_libres INT NOT NULL DEFAULT 2,
    valido_hasta TIMESTAMPTZ NOT NULL,
    estado parking_status NOT NULL DEFAULT 'emitido',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- FUNCIONES AUXILIARES DE ROL Y AUTORIZACIÓN (SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT rol FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT store_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE((SELECT rol = 'admin' FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- ============================================================================
-- TRIGGER: CREACIÓN AUTOMÁTICA DE PERFIL AL REGISTRAR EN AUTH.USERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rol user_role := 'cliente';
    v_nombre TEXT;
    v_telefono TEXT;
    v_store_id UUID := NULL;
BEGIN
    IF NEW.raw_user_meta_data->>'rol' IN ('cliente', 'comercio', 'admin') THEN
        v_rol := (NEW.raw_user_meta_data->>'rol')::user_role;
    END IF;

    v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1));
    v_telefono := NEW.raw_user_meta_data->>'telefono';

    IF NEW.raw_user_meta_data->>'store_id' IS NOT NULL AND NEW.raw_user_meta_data->>'store_id' <> '' THEN
        v_store_id := (NEW.raw_user_meta_data->>'store_id')::UUID;
    END IF;

    INSERT INTO public.profiles (id, email, nombre_completo, telefono, rol, store_id)
    VALUES (NEW.id, NEW.email, v_nombre, v_telefono, v_rol, v_store_id)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre_completo = EXCLUDED.nombre_completo,
        telefono = EXCLUDED.telefono,
        rol = EXCLUDED.rol,
        store_id = COALESCE(EXCLUDED.store_id, profiles.store_id),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_validations ENABLE ROW LEVEL SECURITY;

-- 1. CATEGORIES: Lectura pública; escritura solo admin
DROP POLICY IF EXISTS "Categorias visibles para todos" ON public.categories;
CREATE POLICY "Categorias visibles para todos" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admin gestiona categorias" ON public.categories;
CREATE POLICY "Solo admin gestiona categorias" ON public.categories
    FOR ALL USING (public.is_admin());

-- 2. STORES: Lectura pública de tiendas activas; comercio ve y edita la suya; admin gestiona todo
DROP POLICY IF EXISTS "Tiendas activas son públicas" ON public.stores;
CREATE POLICY "Tiendas activas son públicas" ON public.stores
    FOR SELECT USING (activo = true OR public.is_admin() OR id = public.get_my_store_id());

DROP POLICY IF EXISTS "Comercio puede actualizar su propia tienda" ON public.stores;
CREATE POLICY "Comercio puede actualizar su propia tienda" ON public.stores
    FOR UPDATE USING (id = public.get_my_store_id() OR public.is_admin());

DROP POLICY IF EXISTS "Admin administra tiendas" ON public.stores;
CREATE POLICY "Admin administra tiendas" ON public.stores
    FOR ALL USING (public.is_admin());

-- 3. PROFILES: Cada usuario lee su perfil; admin lee todos
DROP POLICY IF EXISTS "Lectura de perfiles" ON public.profiles;
CREATE POLICY "Lectura de perfiles" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Actualización de propio perfil" ON public.profiles;
CREATE POLICY "Actualización de propio perfil" ON public.profiles
    FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- 4. PRODUCTS: Catálogo público de productos activos; comercio gestiona los de su tienda; admin todo
DROP POLICY IF EXISTS "Productos activos son públicos" ON public.products;
CREATE POLICY "Productos activos son públicos" ON public.products
    FOR SELECT USING (activo = true OR public.is_admin() OR store_id = public.get_my_store_id());

DROP POLICY IF EXISTS "Comercio gestiona productos de su tienda" ON public.products;
CREATE POLICY "Comercio gestiona productos de su tienda" ON public.products
    FOR ALL USING (store_id = public.get_my_store_id() OR public.is_admin());

-- 5. ORDERS: Cliente solo ve sus pedidos; comercio ve pedidos de su tienda; admin ve todo
DROP POLICY IF EXISTS "Lectura de pedidos por rol" ON public.orders;
CREATE POLICY "Lectura de pedidos por rol" ON public.orders
    FOR SELECT USING (
        cliente_id = auth.uid() OR
        store_id = public.get_my_store_id() OR
        public.is_admin()
    );

-- Nota: Creación y cambios de estado de pedidos se realizan mediante funciones RPC con SECURITY DEFINER
-- para garantizar validación de stock, cálculo de total en servidor y transiciones de estado legales.

-- 6. ORDER_ITEMS: Lectura correspondiente al pedido permitido
DROP POLICY IF EXISTS "Lectura de items de pedidos" ON public.order_items;
CREATE POLICY "Lectura de items de pedidos" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.cliente_id = auth.uid() OR o.store_id = public.get_my_store_id() OR public.is_admin())
        )
    );

-- 7. ORDER_STATUS_HISTORY: Lectura según acceso al pedido
DROP POLICY IF EXISTS "Lectura de historial de pedidos" ON public.order_status_history;
CREATE POLICY "Lectura de historial de pedidos" ON public.order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_status_history.order_id
            AND (o.cliente_id = auth.uid() OR o.store_id = public.get_my_store_id() OR public.is_admin())
        )
    );

-- 8. PARKING_VALIDATIONS: Cliente ve su validación; comercio de la tienda o admin la ve
DROP POLICY IF EXISTS "Lectura de validaciones de parqueo" ON public.parking_validations;
CREATE POLICY "Lectura de validaciones de parqueo" ON public.parking_validations
    FOR SELECT USING (
        cliente_id = auth.uid() OR
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = parking_validations.order_id
            AND o.store_id = public.get_my_store_id()
        )
    );

-- ============================================================================
-- FUNCIONES RPC DE NEGOCIO
-- ============================================================================

-- RPC 1: CREAR PEDIDO (Valida stock, descuenta inventario, calcula total en servidor, genera QR y PIN)
CREATE OR REPLACE FUNCTION public.crear_pedido(
    p_store_id UUID,
    p_items JSONB,              -- Formato: [{"product_id": "...", "cantidad": 2}, ...]
    p_ventana_retiro TEXT,
    p_nota TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cliente_id UUID := auth.uid();
    v_cliente_rol user_role;
    v_order_id UUID;
    v_total NUMERIC(10,2) := 0;
    v_item JSONB;
    v_prod RECORD;
    v_pickup_code TEXT;
    v_pin TEXT;
    v_cantidad INT;
    v_subtotal NUMERIC(10,2);
BEGIN
    IF v_cliente_id IS NULL THEN
        RAISE EXCEPTION 'Debe iniciar sesión para realizar un pedido.';
    END IF;

    -- Validar que la tienda exista y esté activa
    IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND activo = TRUE) THEN
        RAISE EXCEPTION 'La tienda seleccionada no está disponible o no existe.';
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'El carrito de compras no puede estar vacío.';
    END IF;

    -- Generar código de retiro legible (Ej: PY-B8C24) y PIN de 4 dígitos
    v_pickup_code := 'PY-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));
    v_pin := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

    -- Insertar encabezado preliminar del pedido
    INSERT INTO public.orders (
        cliente_id,
        store_id,
        estado,
        total,
        pickup_code,
        pin_seguridad,
        ventana_retiro,
        nota
    ) VALUES (
        v_cliente_id,
        p_store_id,
        'recibido',
        0,
        v_pickup_code,
        v_pin,
        p_ventana_retiro,
        p_nota
    ) RETURNING id INTO v_order_id;

    -- Procesar y validar cada item con bloqueo de fila (FOR UPDATE) para prevenir sobreventa
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_cantidad := (v_item->>'cantidad')::INT;
        IF v_cantidad <= 0 THEN
            RAISE EXCEPTION 'La cantidad del producto debe ser mayor a 0.';
        END IF;

        SELECT id, nombre, precio, stock, store_id, activo
        INTO v_prod
        FROM public.products
        WHERE id = (v_item->>'product_id')::UUID
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto con ID % no encontrado.', (v_item->>'product_id');
        END IF;

        IF v_prod.store_id <> p_store_id THEN
            RAISE EXCEPTION 'Todos los productos deben pertenecer a la misma tienda del Paseo Aranjuez.';
        END IF;

        IF NOT v_prod.activo THEN
            RAISE EXCEPTION 'El producto "%" ya no se encuentra activo.', v_prod.nombre;
        END IF;

        IF v_prod.stock < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, solicitado: %.',
                v_prod.nombre, v_prod.stock, v_cantidad;
        END IF;

        -- Descontar stock
        UPDATE public.products
        SET stock = stock - v_cantidad
        WHERE id = v_prod.id;

        v_subtotal := v_prod.precio * v_cantidad;
        v_total := v_total + v_subtotal;

        -- Insertar order_item
        INSERT INTO public.order_items (
            order_id,
            product_id,
            nombre_producto,
            precio_unitario,
            cantidad,
            subtotal
        ) VALUES (
            v_order_id,
            v_prod.id,
            v_prod.nombre,
            v_prod.precio,
            v_cantidad,
            v_subtotal
        );
    END LOOP;

    -- Actualizar total consolidado
    UPDATE public.orders
    SET total = v_total
    WHERE id = v_order_id;

    -- Registrar historial inicial de estado
    INSERT INTO public.order_status_history (
        order_id,
        estado_anterior,
        estado_nuevo,
        cambiado_por,
        rol_actor,
        nota
    ) VALUES (
        v_order_id,
        NULL,
        'recibido',
        v_cliente_id,
        'cliente',
        'Pedido creado por el cliente y pendiente de confirmación'
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', v_order_id,
        'pickup_code', v_pickup_code,
        'pin_seguridad', v_pin,
        'total', v_total
    );
END;
$$;

-- RPC 2: CAMBIAR ESTADO PEDIDO (Valida rol y transición permitida)
CREATE OR REPLACE FUNCTION public.cambiar_estado_pedido(
    p_order_id UUID,
    p_nuevo_estado order_status,
    p_nota TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_order RECORD;
    v_user_prof RECORD;
    v_transicion_valida BOOLEAN := FALSE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debe iniciar sesión para realizar esta acción.';
    END IF;

    SELECT id, cliente_id, store_id, estado
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado.';
    END IF;

    SELECT rol, store_id INTO v_user_prof
    FROM public.profiles
    WHERE id = v_user_id;

    -- Reglas de transición y roles permitidos:
    -- 'recibido'           -> 'confirmado':          comercio (de la tienda) o admin
    -- 'confirmado'         -> 'preparando':          comercio (de la tienda) o admin
    -- 'preparando'         -> 'listo_para_recoger':  comercio (de la tienda) o admin
    -- 'listo_para_recoger' -> 'cliente_llego':       cliente (del pedido), comercio o admin
    -- 'cliente_llego'      -> 'entregado':           comercio o admin (vía validar_retiro o pin)

    IF v_user_prof.rol = 'admin' THEN
        -- Admin tiene autorización de avance operacional
        v_transicion_valida := TRUE;
    ELSIF v_user_prof.rol = 'comercio' THEN
        IF v_user_prof.store_id <> v_order.store_id THEN
            RAISE EXCEPTION 'No tiene permisos para modificar pedidos de otra tienda.';
        END IF;

        IF (v_order.estado = 'recibido' AND p_nuevo_estado = 'confirmado') OR
           (v_order.estado = 'confirmado' AND p_nuevo_estado = 'preparando') OR
           (v_order.estado = 'preparando' AND p_nuevo_estado = 'listo_para_recoger') OR
           (v_order.estado = 'cliente_llego' AND p_nuevo_estado = 'entregado') OR
           (v_order.estado = 'listo_para_recoger' AND p_nuevo_estado = 'entregado') THEN
            v_transicion_valida := TRUE;
        END IF;
    ELSIF v_user_prof.rol = 'cliente' THEN
        IF v_order.cliente_id <> v_user_id THEN
            RAISE EXCEPTION 'No puede modificar pedidos de otro cliente.';
        END IF;

        -- El cliente solo puede indicar que ya llegó al local a recoger
        IF v_order.estado = 'listo_para_recoger' AND p_nuevo_estado = 'cliente_llego' THEN
            v_transicion_valida := TRUE;
        END IF;
    END IF;

    IF NOT v_transicion_valida THEN
        RAISE EXCEPTION 'Transición no permitida de "%" a "%" para el rol "%".',
            v_order.estado, p_nuevo_estado, v_user_prof.rol;
    END IF;

    -- Actualizar estado del pedido
    UPDATE public.orders
    SET estado = p_nuevo_estado,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Registrar historial
    INSERT INTO public.order_status_history (
        order_id,
        estado_anterior,
        estado_nuevo,
        cambiado_por,
        rol_actor,
        nota
    ) VALUES (
        p_order_id,
        v_order.estado,
        p_nuevo_estado,
        v_user_id,
        v_user_prof.rol::TEXT,
        p_nota
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'estado_anterior', v_order.estado,
        'estado_nuevo', p_nuevo_estado
    );
END;
$$;

-- RPC 3: VALIDAR RETIRO (Verifica pickup_code o PIN, pasa a entregado y emite pase de parqueo)
CREATE OR REPLACE FUNCTION public.validar_retiro(
    p_order_id UUID,
    p_codigo TEXT -- Puede ser el pickup_code (ej. PY-ABCDE) o el PIN de 4 dígitos
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_prof RECORD;
    v_order RECORD;
    v_clean_codigo TEXT;
    v_parking_qr TEXT;
    v_parking_id UUID;
    v_valido_hasta TIMESTAMPTZ;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Debe iniciar sesión para validar el retiro.';
    END IF;

    SELECT rol, store_id INTO v_user_prof
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_user_prof.rol NOT IN ('comercio', 'admin') THEN
        RAISE EXCEPTION 'Solo comercios autorizados o administradores pueden validar el retiro.';
    END IF;

    SELECT id, cliente_id, store_id, estado, pickup_code, pin_seguridad
    INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado.';
    END IF;

    IF v_user_prof.rol = 'comercio' AND v_user_prof.store_id <> v_order.store_id THEN
        RAISE EXCEPTION 'Este pedido no corresponde a su comercio.';
    END IF;

    IF v_order.estado = 'entregado' THEN
        RAISE EXCEPTION 'Este pedido ya fue retirado y entregado previamente.';
    END IF;

    v_clean_codigo := UPPER(TRIM(p_codigo));

    -- Verificar coincidencia con pickup_code o con el PIN de 4 dígitos
    IF v_clean_codigo <> UPPER(v_order.pickup_code) AND v_clean_codigo <> v_order.pin_seguridad THEN
        RAISE EXCEPTION 'Código o PIN de retiro inválido. Verifique el código mostrado en el teléfono del cliente.';
    END IF;

    -- Cambiar estado a 'entregado'
    UPDATE public.orders
    SET estado = 'entregado',
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Registrar auditoría en historial
    INSERT INTO public.order_status_history (
        order_id,
        estado_anterior,
        estado_nuevo,
        cambiado_por,
        rol_actor,
        nota
    ) VALUES (
        p_order_id,
        v_order.estado,
        'entregado',
        v_user_id,
        v_user_prof.rol::TEXT,
        'Retiro validado exitosamente en local físico de Paseo Aranjuez'
    );

    -- Generar ticket de parqueo subterráneo gratis (2 horas)
    v_parking_qr := 'PARK-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
    v_valido_hasta := NOW() + INTERVAL '3 hours';

    INSERT INTO public.parking_validations (
        order_id,
        cliente_id,
        codigo_qr,
        horas_libres,
        valido_hasta,
        estado
    ) VALUES (
        p_order_id,
        v_order.cliente_id,
        v_parking_qr,
        2,
        v_valido_hasta,
        'emitido'
    ) RETURNING id INTO v_parking_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'estado', 'entregado',
        'parking', jsonb_build_object(
            'id', v_parking_id,
            'codigo_qr', v_parking_qr,
            'horas_libres', 2,
            'valido_hasta', v_valido_hasta,
            'mensaje', '¡Validación de parqueo subterráneo Paseo Aranjuez generada con 2 horas libres!'
        )
    );
END;
$$;

-- ============================================================================
-- HABILITAR SUPABASE REALTIME
-- ============================================================================

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 9. PRIVILEGIOS Y PERMISOS DE SCHEMA PARA ROLES DE SUPABASE
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO authenticated;

