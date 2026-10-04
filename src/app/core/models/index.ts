export type UserRole = 'cliente' | 'comercio' | 'admin';

export type OrderStatus =
  | 'recibido'
  | 'confirmado'
  | 'preparando'
  | 'listo_para_recoger'
  | 'cliente_llego'
  | 'entregado';

export interface Profile {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  rol: UserRole;
  store_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden: number;
  created_at?: string;
}

export interface Store {
  id: string;
  nombre: string;
  rubro: string;
  piso: string;
  sector?: string;
  local: string;
  horario_semana: string;
  horario_domingo_feriado: string;
  telefono?: string;
  logo_url?: string;
  portada_url?: string;
  activo: boolean;
  category_id?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  store_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  activo: boolean;
  categoria?: string;
  created_at?: string;
  tienda?: Store;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  producto?: Product;
}

export interface Order {
  id: string;
  cliente_id: string;
  store_id: string;
  estado: OrderStatus;
  total: number;
  pickup_code: string;
  pin_seguridad: string;
  ventana_retiro: string;
  nota?: string;
  created_at: string;
  updated_at: string;
  tienda?: Store;
  cliente?: Profile;
  items?: OrderItem[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  estado_anterior?: OrderStatus;
  estado_nuevo: OrderStatus;
  cambiado_por: string;
  rol_actor: UserRole;
  nota?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PointActivityType =
  | 'compra'
  | 'interaccion_feed'
  | 'interaccion_story'
  | 'interaccion_reel'
  | 'interaccion_chat'
  | 'referido_invitado'
  | 'referido_canjeado'
  | 'descuento_aplicado';

export interface PointTransaction {
  id: string;
  cliente_id: string;
  puntos: number; // positivo para ganar, negativo para canjear
  tipo: PointActivityType;
  descripcion: string;
  order_id?: string;
  created_at: string;
}

export interface LoyaltyAccount {
  cliente_id: string;
  puntos_totales: number;
  codigo_referido: string;
  total_referidos: number;
  historial: PointTransaction[];
}

export * from './jarvis-guide.models';

