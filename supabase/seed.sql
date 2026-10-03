-- ============================================================================
-- PASEO ARANJUEZ - PASEOYA: SEED DATA COMPLETO (DEMO HACKATHON)
-- ============================================================================

-- 1. CATEGORÍAS
INSERT INTO public.categories (id, nombre, descripcion, icono, orden) VALUES
('11111111-c000-0000-0000-000000000001', 'Tecnología y Celulares', 'Smartphones, audio de alta fidelidad y accesorios', '🎧', 1),
('11111111-c000-0000-0000-000000000002', 'Mercado Gastronómico', 'Comida rápida, cafeterías y especialidades en Piso 3', '🍔', 2),
('11111111-c000-0000-0000-000000000003', 'Terraza Gourmet El Cuarto', 'Restaurantes premium y carnes a las brasas en Piso 4', '🍷', 3),
('11111111-c000-0000-0000-000000000004', 'Moda y Ropa Exclusiva', 'Prendas de diseñador y vestimenta casual en Pisos 1 y 2', '👗', 4),
('11111111-c000-0000-0000-000000000005', 'Calzado y Marroquinería', 'Calzado formal, sneakers y carteras de cuero', '👟', 5),
('11111111-c000-0000-0000-000000000006', 'Joyería y Relojes', 'Plata, oro y bijouterie de alta gama en Piso 1', '💍', 6),
('11111111-c000-0000-0000-000000000007', 'Sky Games y Ocio', 'Arcades, simuladores y diversión familiar en Piso 3', '🕹️', 7)
ON CONFLICT (id) DO NOTHING;

-- 2. TIENDAS (Pisos 1, 2, 3 y 4 de Paseo Aranjuez)
INSERT INTO public.stores (id, category_id, nombre, rubro, piso, sector, local, horario_semana, horario_domingo_feriado, telefono, logo_url, portada_url, activo) VALUES
-- PISO 2: 3 Tiendas con Audífonos Bluetooth para Comparación
('a0000000-0000-0000-0000-000000000001', '11111111-c000-0000-0000-000000000001', 'Sony Store Cochabamba', 'Tecnología y Celulares', 'Piso 2', 'Ala Norte', 'Local 215', '10:00 - 22:00', '12:00 - 22:00', '71798765', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000002', '11111111-c000-0000-0000-000000000001', 'Xiaomi Mi Store Aranjuez', 'Tecnología y Celulares', 'Piso 2', 'Plaza Central', 'Local 208', '10:00 - 22:00', '12:00 - 22:00', '72234567', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000003', '11111111-c000-0000-0000-000000000001', 'iShop Apple Reseller', 'Tecnología y Celulares', 'Piso 2', 'Ala Sur', 'Local 222', '10:00 - 22:00', '12:00 - 22:00', '73345678', 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&auto=format&fit=crop&q=80', true),

-- PISO 3: Mercado Gastronómico & Sky Games (6 Locales Gastronómicos)
('a0000000-0000-0000-0000-000000000004', '11111111-c000-0000-0000-000000000002', 'Burger Craft Aranjuez', 'Mercado Gastronómico', 'Piso 3', 'Food Court', 'Local 302', '10:00 - 22:00', '12:00 - 22:00', '74456789', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000005', '11111111-c000-0000-0000-000000000002', 'Café & Dulces Gourmet', 'Mercado Gastronómico', 'Piso 3', 'Isla Central', 'Isla 310', '10:00 - 22:00', '12:00 - 22:00', '75567890', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000006', '11111111-c000-0000-0000-000000000002', 'Tradición Valluna', 'Mercado Gastronómico', 'Piso 3', 'Food Court', 'Local 306', '10:00 - 22:00', '12:00 - 22:00', '76678901', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000007', '11111111-c000-0000-0000-000000000002', 'Pizzería Napolitana Aranjuez', 'Mercado Gastronómico', 'Piso 3', 'Food Court', 'Local 308', '10:00 - 22:00', '12:00 - 22:00', '77789001', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000008', '11111111-c000-0000-0000-000000000002', 'Bebidas & Jugos Tropicales', 'Mercado Gastronómico', 'Piso 3', 'Isla Central', 'Isla 312', '10:00 - 22:00', '12:00 - 22:00', '78890112', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', true),

-- PISO 4: Terraza Gourmet "El Cuarto" (2 Locales Premium)
('a0000000-0000-0000-0000-000000000009', '11111111-c000-0000-0000-000000000003', 'Fuego & Corte Steakhouse', 'Terraza Gourmet El Cuarto', 'Piso 4', 'Terraza Norte', 'Local 401', '12:00 - 23:00', '12:00 - 23:00', '77789012', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000010', '11111111-c000-0000-0000-000000000003', 'La Cava & Tapas Panorámica', 'Terraza Gourmet El Cuarto', 'Piso 4', 'Mirador Sur', 'Local 405', '12:00 - 23:00', '12:00 - 23:00', '78890124', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80', true),

-- PISO 1: Moda y Joyería
('a0000000-0000-0000-0000-000000000011', '11111111-c000-0000-0000-000000000004', 'Boutique Aranjuez Chic', 'Moda y Ropa Exclusiva', 'Piso 1', 'Hall Central', 'Local 104', '10:00 - 22:00', '12:00 - 22:00', '79901235', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop&q=80', true),
('a0000000-0000-0000-0000-000000000012', '11111111-c000-0000-0000-000000000006', 'Joyería Fina Illimani', 'Joyería y Relojes', 'Piso 1', 'Hall Central', 'Local 108', '10:00 - 22:00', '12:00 - 22:00', '70012346', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=160&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCTOS (35 Productos con control de precios y stock)
INSERT INTO public.products (id, store_id, nombre, descripcion, precio, stock, imagen_url, categoria, activo) VALUES
-- Audífonos Bluetooth Comparativa (Piso 2)
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Audífonos Bluetooth Xiaomi Redmi Buds 4 Active', 'Cancelación de ruido en llamadas, Bluetooth 5.3, driver dinámico de 12 mm y 28 hrs de batería.', 180.00, 25, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80', 'Audio', true),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Audífonos Bluetooth Sony WH-CH520', 'Sonido DSEE nítido, 50 horas continuas de autonomía, carga ultrarrápida y micrófono HD.', 250.00, 15, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80', 'Audio', true),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Audífonos Bluetooth Beats Flex Wireless (Apple)', 'Chip Apple W1, emparejamiento magnético automático, cable antienredos y 12 hrs de música.', 320.00, 10, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80', 'Audio', true),

-- Más tecnología (Piso 2)
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Parlante Portátil Sony SRS-XB100 Extra Bass', 'Resistente a polvo y agua IP67, correa versátil y bajos impresionantes.', 380.00, 8, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80', 'Audio', true),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Smartwatch Xiaomi Redmi Watch 3 Active', 'Pantalla LCD de 1.83 pulgadas, sensor cardíaco 24/7 y 100 modos deportivos.', 290.00, 14, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80', 'Wearables', true),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Cargador Rápido Apple USB-C 20W Original', 'Carga ultrarrápida certificada para iPhone, iPad y accesorios Apple.', 210.00, 20, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80', 'Accesorios', true),

-- Hamburguesas (Piso 3, Rango Bs. 35 - 55)
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'Hamburguesa Doble Queso Aranjuez Burger', 'Doble carne 200g, queso cheddar fundido, tocino crocante y papas rústicas.', 45.00, 40, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', 'Hamburguesas', true),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'Combo Smash Bacon Clásica', 'Hamburguesa smash, cebolla caramelizada, salsa secreta de la casa + bebida fría.', 38.00, 35, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80', 'Hamburguesas', true),
('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'Hamburguesa Monster BBQ 300g', 'Triple medallón de res a la parrilla, salsa BBQ ahumada, aros de cebolla y queso.', 52.00, 25, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=80', 'Hamburguesas', true),

-- Comida Tradicional (Piso 3, Rango Bs. 35 - 60)
('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000006', 'Pique Macho Especial Cochabambino', 'Lomo tierno saltado, salchichas vienesas, huevo duro, papas fritas y locoto fresco.', 52.00, 30, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Tradicional', true),
('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'Silpancho Tradicional Aranjuez', 'Fina lámina de carne apanada sobre arroz graneado, papas doradas y huevo frito.', 38.00, 35, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Tradicional', true),
('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', 'Planchita Mixta Familiar (Media)', 'Carne de res, chorizo criollo, plátano de freír, yuca y queso derretido en plancha.', 58.00, 18, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Tradicional', true),

-- Bebidas & Cafetería (Piso 3, Rango Bs. 10 - 25)
('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000005', 'Iced Caramel Macchiato 16oz', 'Espresso de altura, leche cremosa fría y sirope de caramelo artesanal.', 22.00, 50, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80', 'Bebidas', true),
('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000005', 'Capuccino Vainilla Francesa', 'Café arábico recién molido, espuma densa de leche y esencia de vainilla.', 18.00, 45, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=80', 'Bebidas', true),
('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000008', 'Limonada Frappé con Menta y Jengibre', 'Jugo natural de limón prensado al momento con hierbabuena fresca.', 15.00, 60, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', 'Bebidas', true),
('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000008', 'Smoothie Frutos del Valle', 'Frutilla, arándanos, mora y yogurt probiótico cremoso.', 20.00, 40, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80', 'Bebidas', true),
('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000008', 'Agua Mineral de Manantial 600ml', 'Refrescante, con o sin gas.', 10.00, 80, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80', 'Bebidas', true),

-- Pizzería (Piso 3, Rango Bs. 40 - 55)
('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000007', 'Pizza Margherita Tradizionale', 'Masa fermentada 48 hrs, salsa pomodoro San Marzano, mozzarella fior di latte y albahaca.', 45.00, 25, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', 'Pizzas', true),
('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000007', 'Pizza Pepperoni & Jalapeño Crunch', 'Mozzarella generosa, pepperoni curado artesanal y rodajas de jalapeño tostado.', 48.00, 20, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80', 'Pizzas', true),

-- Carnes Premium en Terraza Piso 4 (Rango Bs. 65 - 130)
('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000009', 'Ojo de Bife Angustifolia 400g', 'Corte madurado 21 días, sellado a las brasas de quebracho blanco con papas trufadas.', 95.00, 18, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Carnes Premium', true),
('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000009', 'Bife de Chorizo Premium 350g', 'Corte jugoso y tierno con chimichurri casero y ensalada verde de la huerta.', 85.00, 22, 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80', 'Carnes Premium', true),
('b0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000009', 'Tomahawk Steak Especial 800g (Para compartir)', 'El rey de las carnes a la parrilla, con hueso largo caramelizado a la brasa.', 130.00, 8, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Carnes Premium', true),
('b0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000009', 'Picaña Brasileña a las Brasas 300g', 'Capa dorada de grasa crocante, sal marina en escamas y mandioca frita.', 75.00, 20, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', 'Carnes Premium', true),
('b0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000010', 'Tabla Gourmet de Jamón Serrano y Quesos Madurados', 'Selección de quesos brie, gouda añejo, jamón serrano reserva y aceitunas marinadas.', 68.00, 15, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80', 'Tapas & Vinos', true),
('b0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000010', 'Copa de Vino Tannat Reserva Tarija', 'Vino tinto de altura de Tarija, notas a frutos negros y roble francés.', 28.00, 30, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80', 'Tapas & Vinos', true),

-- Moda y Joyería (Piso 1)
('b0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000011', 'Camisa de Lino Italiano Premium Unisex', '100% lino puro, tejido transpirable, corte relajado ideal para el clima de Cochabamba.', 195.00, 15, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80', 'Moda', true),
('b0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000011', 'Vestido Midi Seda Estampado Floral', 'Diseño exclusivo de temporada, corte favorecedor con lazo ajustable a la cintura.', 260.00, 10, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80', 'Moda', true),
('b0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000012', 'Collar en Plata 925 con Zirconias Suizas', 'Diseño minimalista con baño de rodio antialérgico y cadena eslabonada.', 240.00, 12, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80', 'Joyería', true),
('b0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000012', 'Reloj Cronógrafo Cuarzo Acero Inoxidable', 'Cristal mineral antirreflejo, fechador y resistencia al agua 50m.', 450.00, 6, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=80', 'Joyería', true)
ON CONFLICT (id) DO NOTHING;

-- 4. USUARIOS DE PRUEBA (Profiles asociados)
-- Asegurar que profiles no exija que el ID exista previamente en auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

INSERT INTO public.profiles (id, email, nombre_completo, telefono, rol, store_id) VALUES
('11111111-1111-4111-a111-111111111111', 'cliente@paseo.bo', 'Carlos Mendoza', '70712345', 'cliente', NULL),
('22222222-2222-4222-a222-222222222222', 'comercio@paseo.bo', 'Sony Store Cochabamba (Piso 2)', '71798765', 'comercio', 'a0000000-0000-0000-0000-000000000001'),
('22222222-2222-4222-b222-222222222222', 'comercio2@paseo.bo', 'Burger Craft (Piso 3)', '74456789', 'comercio', 'a0000000-0000-0000-0000-000000000004'),
('33333333-3333-4333-a333-333333333333', 'admin@paseo.bo', 'Administración Paseo Aranjuez', '44521000', 'admin', NULL)
ON CONFLICT (id) DO UPDATE SET
    rol = EXCLUDED.rol,
    store_id = EXCLUDED.store_id;
