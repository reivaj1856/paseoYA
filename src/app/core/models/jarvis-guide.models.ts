/**
 * Modelos y tipos estrictos para JARVIS PASEO — GUÍA VIVA DE PASEO ARANJUEZ
 * Todos los datos están tipados y validados antes de renderizarse en la interfaz.
 */

export type JarvisState =
  | 'listo'
  | 'escuchando'
  | 'pensando'
  | 'hablando'
  | 'reconectando'
  | 'error';

export interface PaseoLocation {
  id: string;
  piso: 'Piso 1' | 'Piso 2' | 'Piso 3' | 'Piso 4' | 'Subsuelo' | 'Planta Baja';
  sector: string;
  local: string;
  referencia: string;
  /** Coordenadas relativas en porcentaje (0-100) para el plano interactivo de demostración */
  mapCoords: { x: number; y: number };
}

export interface Business {
  id: string;
  nombre: string;
  categoria: 'Gastronomía' | 'Tecnología' | 'Moda y Joyería' | 'Ocio y Entretenimiento' | 'Servicios';
  descripcionCorta: string;
  descripcionCompleta?: string;
  ubicacion: PaseoLocation;
  horario: string;
  rangoPrecios: 'Económico' | 'Medio' | 'Premium';
  ticketPromedioBs: number;
  telefono?: string;
  imagenUrl: string;
  destacado?: boolean;
}

export interface Promotion {
  id: string;
  titulo: string;
  comercioId: string;
  nombreComercio: string;
  descuento: string;
  condiciones: string;
  vigencia: string;
  disponible: boolean;
  categoria: string;
  precioAntesBs?: number;
  precioAhoraBs?: number;
}

export interface PaseoEvent {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  piso: string;
  descripcion: string;
  categoria: 'Cultura & Música' | 'Gamer' | 'Gastronomía' | 'Moda';
  imagenUrl?: string;
}

export interface ItineraryStop {
  orden: number;
  businessId: string;
  nombreLugar: string;
  piso: string;
  local: string;
  actividad: string;
  tiempoEstimadoMinutos: number;
  costoEstimadoBs: number;
  motivoRecomendacion: string;
}

export interface Itinerary {
  id: string;
  titulo: string;
  tiempoTotalMinutos: number;
  tiempoDisponibleMinutos: number;
  presupuestoEstimadoBs: number;
  presupuestoDisponibleBs: number;
  motivoResumen: string;
  paradas: ItineraryStop[];
}

export type JarvisVisualComponentType =
  | 'business-card'
  | 'promotion-card'
  | 'map-panel'
  | 'itinerary-panel'
  | 'event-card';

export interface JarvisVisualItem {
  id: string;
  type: JarvisVisualComponentType;
  title: string;
  data: any;
  timestamp: Date;
  expanded?: boolean;
}

export interface ConversationTurn {
  id: string;
  sender: 'visitante' | 'jarvis';
  text: string;
  timestamp: Date;
  functionCalled?: string;
  visualItems?: JarvisVisualItem[];
}
