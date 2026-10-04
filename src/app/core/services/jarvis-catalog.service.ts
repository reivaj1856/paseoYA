import { Injectable, signal } from '@angular/core';
import {
  Business,
  Promotion,
  PaseoEvent,
  PaseoLocation,
  Itinerary,
  ItineraryStop,
} from '../models/jarvis-guide.models';

/**
 * Catálogo estructurado de demostración para Paseo Aranjuez.
 * NOTA DE SEGURIDAD Y TRANSPARENCIA:
 * Todos los elementos aquí contenidos son datos de demostración creados
 * para modelar el comportamiento del asistente inteligente Jarvis Paseo.
 */
export const IS_DEMO_DATA = true;
export const DEMO_DATA_DISCLAIMER =
  'Datos de demostración para Paseo Aranjuez • No representan información contractual en tiempo real.';

const DEMO_LOCATIONS: Record<string, PaseoLocation> = {
  'loc-sony': {
    id: 'loc-sony',
    piso: 'Piso 2',
    sector: 'Ala Norte Tecnología',
    local: 'Local 215',
    referencia: 'Junto a las escaleras mecánicas del sector norte',
    mapCoords: { x: 32, y: 40 },
  },
  'loc-xiaomi': {
    id: 'loc-xiaomi',
    piso: 'Piso 2',
    sector: 'Plaza Central Tech',
    local: 'Local 208',
    referencia: 'Frente al mirador interno del atrio',
    mapCoords: { x: 48, y: 45 },
  },
  'loc-ishop': {
    id: 'loc-ishop',
    piso: 'Piso 2',
    sector: 'Ala Sur',
    local: 'Local 222',
    referencia: 'Al lado de la tienda de accesorios gamer',
    mapCoords: { x: 70, y: 42 },
  },
  'loc-burger': {
    id: 'loc-burger',
    piso: 'Piso 3',
    sector: 'Food Court Central',
    local: 'Local 302',
    referencia: 'Frente a las mesas centrales del mercado gastronómico',
    mapCoords: { x: 28, y: 55 },
  },
  'loc-cafe': {
    id: 'loc-cafe',
    piso: 'Piso 3',
    sector: 'Isla Gastronómica',
    local: 'Isla 310',
    referencia: 'En el centro del pasillo de cafeterías de autor',
    mapCoords: { x: 50, y: 50 },
  },
  'loc-valluna': {
    id: 'loc-valluna',
    piso: 'Piso 3',
    sector: 'Plaza Tradicional',
    local: 'Local 306',
    referencia: 'Junto a la fuente decorativa del piso 3',
    mapCoords: { x: 72, y: 58 },
  },
  'loc-skygames': {
    id: 'loc-skygames',
    piso: 'Piso 3',
    sector: 'Área Recreativa Familiar',
    local: 'Local 315',
    referencia: 'Extremo este del piso 3, entrada a arcades',
    mapCoords: { x: 85, y: 35 },
  },
  'loc-fuego': {
    id: 'loc-fuego',
    piso: 'Piso 4',
    sector: 'Terraza Gourmet El Cuarto',
    local: 'Local 401',
    referencia: 'Balcón exterior con vista panorámica a la ciudad',
    mapCoords: { x: 35, y: 65 },
  },
  'loc-cava': {
    id: 'loc-cava',
    piso: 'Piso 4',
    sector: 'Terraza Lounge',
    local: 'Local 405',
    referencia: 'Zona de cavas climatizadas y mesas lounge',
    mapCoords: { x: 65, y: 68 },
  },
  'loc-plateria': {
    id: 'loc-plateria',
    piso: 'Piso 1',
    sector: 'Galería de Joyas',
    local: 'Local 103',
    referencia: 'Planta baja, pasillo derecho ingresando por Av. América',
    mapCoords: { x: 25, y: 30 },
  },
  'loc-paris': {
    id: 'loc-paris',
    piso: 'Piso 1',
    sector: 'Boulevard de Moda',
    local: 'Local 114',
    referencia: 'Al frente de los ascensores panorámicos principales',
    mapCoords: { x: 58, y: 32 },
  },
  'loc-parqueo': {
    id: 'loc-parqueo',
    piso: 'Subsuelo',
    sector: 'Niveles S-1, S-2 y S-3',
    local: 'Acceso Dalence',
    referencia: 'Ingreso vehicular por calle Pantaleón Dalence',
    mapCoords: { x: 50, y: 85 },
  },
};

const DEMO_BUSINESSES: Business[] = [
  {
    id: 'biz-cafe',
    nombre: 'Café & Dulces Gourmet',
    categoria: 'Gastronomía',
    descripcionCorta: 'Café de especialidad de altura y repostería rápida artesanal.',
    descripcionCompleta:
      'Tostaduría local con granos de Caranavi, espresso bar, sándwiches calientes en pan ciabatta y postres individuales.',
    ubicacion: DEMO_LOCATIONS['loc-cafe'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Económico',
    ticketPromedioBs: 25,
    telefono: '75567890',
    imagenUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
    destacado: true,
  },
  {
    id: 'biz-burger',
    nombre: 'Burger Craft Aranjuez',
    categoria: 'Gastronomía',
    descripcionCorta: 'Hamburguesas smash artesanales y papas rústicas con servicio express.',
    descripcionCompleta:
      'Carne 100% de res madurada, pan brioche horneado diario y salsas de la casa en el patio gastronómico.',
    ubicacion: DEMO_LOCATIONS['loc-burger'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Medio',
    ticketPromedioBs: 45,
    telefono: '74456789',
    imagenUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    destacado: true,
  },
  {
    id: 'biz-plateria',
    nombre: 'Platería Real Cochabamba',
    categoria: 'Moda y Joyería',
    descripcionCorta: 'Joyería fina en plata 925 boliviana y piedras semipreciosas para regalos.',
    descripcionCompleta:
      'Collares, pulseras, dijes y aretes artesanales con certificado de autenticidad en estuches de obsequio listos.',
    ubicacion: DEMO_LOCATIONS['loc-plateria'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Medio',
    ticketPromedioBs: 110,
    telefono: '71122334',
    imagenUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    destacado: true,
  },
  {
    id: 'biz-paris',
    nombre: 'Boutique París & Tendencias',
    categoria: 'Moda y Joyería',
    descripcionCorta: 'Accesorios de vestir, pañuelos de seda, bolsos de autor y camisas casuales.',
    descripcionCompleta:
      'Prendas seleccionadas de temporada, regalos de vestir y complementos elegantes para ocasiones especiales.',
    ubicacion: DEMO_LOCATIONS['loc-paris'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Medio',
    ticketPromedioBs: 135,
    telefono: '72244668',
    imagenUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    destacado: false,
  },
  {
    id: 'biz-xiaomi',
    nombre: 'Xiaomi Mi Store Aranjuez',
    categoria: 'Tecnología',
    descripcionCorta: 'Smartphones, pulseras inteligentes y audífonos bluetooth compactos.',
    descripcionCompleta:
      'Distribuidor oficial de ecosistema inteligente, cargadores rápidos y tecnología accesible.',
    ubicacion: DEMO_LOCATIONS['loc-xiaomi'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Medio',
    ticketPromedioBs: 180,
    telefono: '72234567',
    imagenUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    destacado: true,
  },
  {
    id: 'biz-sony',
    nombre: 'Sony Store Cochabamba',
    categoria: 'Tecnología',
    descripcionCorta: 'Audio de alta fidelidad, audífonos con cancelación de ruido y consolas.',
    descripcionCompleta:
      'Línea completa de auriculares inalámbricos con batería de hasta 50h y sonido balanceado.',
    ubicacion: DEMO_LOCATIONS['loc-sony'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Premium',
    ticketPromedioBs: 250,
    telefono: '71798765',
    imagenUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    destacado: true,
  },
  {
    id: 'biz-ishop',
    nombre: 'iShop Apple Authorized',
    categoria: 'Tecnología',
    descripcionCorta: 'Accesorios oficiales, estuches magnéticos y audio Beats premium.',
    descripcionCompleta: 'Garantía oficial y servicio de asesoría técnica para productos Apple.',
    ubicacion: DEMO_LOCATIONS['loc-ishop'],
    horario: '10:00 - 22:00',
    rangoPrecios: 'Premium',
    ticketPromedioBs: 320,
    telefono: '73345678',
    imagenUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80',
    destacado: false,
  },
  {
    id: 'biz-fuego',
    nombre: 'Fuego & Corte Steakhouse',
    categoria: 'Gastronomía',
    descripcionCorta: 'Cortes madurados a la brasa en terraza panorámica del piso 4.',
    descripcionCompleta:
      'Ojo de bife, bife de chorizo y tomahawk a la parrilla con guarniciones vallunas y vista de Cochabamba.',
    ubicacion: DEMO_LOCATIONS['loc-fuego'],
    horario: '12:00 - 23:00',
    rangoPrecios: 'Premium',
    ticketPromedioBs: 95,
    telefono: '77789012',
    imagenUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    destacado: true,
  },
  {
    id: 'biz-cava',
    nombre: 'La Cava & Tapas El Cuarto',
    categoria: 'Gastronomía',
    descripcionCorta: 'Tablas de jamón ibérico, quesos curados y vinos de altura de Tarija.',
    descripcionCompleta:
      'Espacio lounge con cava climatizada, maridajes sugeridos y ambiente musical acústico.',
    ubicacion: DEMO_LOCATIONS['loc-cava'],
    horario: '12:00 - 23:00',
    rangoPrecios: 'Premium',
    ticketPromedioBs: 80,
    telefono: '78890123',
    imagenUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
    destacado: false,
  },
  {
    id: 'biz-skygames',
    nombre: 'Sky Games & Arcades',
    categoria: 'Ocio y Entretenimiento',
    descripcionCorta: 'Simuladores de carreras, realidad virtual y máquinas arcade para la familia.',
    descripcionCompleta:
      'Centro de entretenimiento familiar con tarjetas recargables y canje de tickets por premios.',
    ubicacion: DEMO_LOCATIONS['loc-skygames'],
    horario: '11:00 - 22:00',
    rangoPrecios: 'Económico',
    ticketPromedioBs: 30,
    telefono: '79901234',
    imagenUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    destacado: false,
  },
];

const DEMO_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-cafe-combo',
    titulo: 'Combo Express: Café + Croissant',
    comercioId: 'biz-cafe',
    nombreComercio: 'Café & Dulces Gourmet',
    descuento: '20% OFF',
    condiciones: 'Válido de 10:00 a 18:00 presentando el cupón en mostrador.',
    vigencia: 'Hasta fin de mes',
    disponible: true,
    categoria: 'Gastronomía',
    precioAntesBs: 35,
    precioAhoraBs: 28,
  },
  {
    id: 'promo-joya-regalo',
    titulo: 'Dije de Plata 925 con Estuche Gratis',
    comercioId: 'biz-plateria',
    nombreComercio: 'Platería Real Cochabamba',
    descuento: 'Bs. 120 (Precio Especial)',
    condiciones: 'Incluye cadena de plata y estuche de regalo de terciopelo.',
    vigencia: 'Válido esta semana',
    disponible: true,
    categoria: 'Moda y Joyería',
    precioAntesBs: 160,
    precioAhoraBs: 120,
  },
  {
    id: 'promo-burger-duo',
    titulo: 'Smash Burger Doble + Papas Rústicas',
    comercioId: 'biz-burger',
    nombreComercio: 'Burger Craft Aranjuez',
    descuento: 'Bs. 42 (Ahorro de Bs. 10)',
    condiciones: 'Retiro en mostrador en menos de 10 minutos.',
    vigencia: 'Lunes a Viernes',
    disponible: true,
    categoria: 'Gastronomía',
    precioAntesBs: 52,
    precioAhoraBs: 42,
  },
  {
    id: 'promo-xiaomi-buds',
    titulo: 'Redmi Buds 4 Active con Estuche',
    comercioId: 'biz-xiaomi',
    nombreComercio: 'Xiaomi Mi Store Aranjuez',
    descuento: 'Precio Flash Bs. 175',
    condiciones: 'Garantía oficial de 6 meses por falla técnica.',
    vigencia: 'Hasta agotar stock de 15 unidades',
    disponible: true,
    categoria: 'Tecnología',
    precioAntesBs: 210,
    precioAhoraBs: 175,
  },
];

const DEMO_EVENTS: PaseoEvent[] = [
  {
    id: 'event-jazz',
    nombre: 'Noche de Jazz Acústico en Terraza El Cuarto',
    fecha: 'Este Viernes y Sábado',
    hora: '20:30 - 22:30',
    lugar: 'Terraza Gourmet El Cuarto',
    piso: 'Piso 4',
    descripcion: 'Música en vivo con saxofón y piano con vista panorámica nocturna de Cochabamba. Entrada libre para comensales.',
    categoria: 'Cultura & Música',
    imagenUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'event-torneo-arcade',
    nombre: 'Torneo Relámpago Mario Kart & Smash',
    fecha: 'Sábado próximo',
    hora: '16:00 - 18:30',
    lugar: 'Sky Games',
    piso: 'Piso 3',
    descripcion: 'Competencia abierta para jóvenes y familias con premios en puntos PaseoYa Club para los ganadores.',
    categoria: 'Gamer',
    imagenUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'event-moda-plata',
    nombre: 'Muestra Artesanal de Platería y Moda Cochabambina',
    fecha: 'Domingo',
    hora: '11:00 - 19:00',
    lugar: 'Pasillo Central Planta Baja',
    piso: 'Piso 1',
    descripcion: 'Exposición de diseñadores locales y orfebrería tradicional con piezas exclusivas para obsequio.',
    categoria: 'Moda',
    imagenUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Utilidad de normalización de cadenas para búsquedas naturales e insensibles a tildes/mayúsculas
 */
function normalizeText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const COMMON_STOP_WORDS = new Set([
  'de', 'la', 'el', 'en', 'un', 'una', 'unos', 'unas', 'algo', 'quiero', 'por', 'favor',
  'me', 'que', 'los', 'las', 'con', 'para', 'hay', 'al', 'del', 'ver', 'donde', 'aqui',
  'muestra', 'muestrame', 'dame', 'busca', 'tienes', 'algun', 'alguna', 'cuales', 'cual',
  'como', 'sobre', 'todo', 'todos', 'nada', 'mas', 'muy', 'este', 'esta', 'estos', 'estas',
  'centro', 'paseo', 'aranjuez'
]);

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'Gastronomía': [
    'gastro', 'comid', 'comer', 'hambre', 'almuerz', 'cena', 'cenar', 'restauran',
    'cafe', 'burger', 'hamburgues', 'carne', 'bife', 'tostad', 'reposter', 'dulce',
    'tapas', 'vino', 'bebida', 'beber', 'churrasc', 'parrill', 'postre', 'sandwich'
  ],
  'Tecnología': [
    'tecno', 'celular', 'telefono', 'smartphone', 'audifon', 'auricular', 'audio',
    'sony', 'xiaomi', 'apple', 'ishop', 'consola', 'bluetooth', 'laptop', 'cable',
    'cargador', 'gadget', 'computad', 'gamer'
  ],
  'Moda y Joyería': [
    'regalo', 'joya', 'joyer', 'plata', 'anillo', 'collar', 'pulsera', 'moda',
    'ropa', 'boutique', 'prenda', 'vestir', 'bolso', 'panuelo', 'accesorio', 'reloj'
  ],
  'Ocio y Entretenimiento': [
    'juego', 'arcade', 'skygames', 'diversion', 'familia', 'cine', 'recreaci', 'entretenimiento', 'nino'
  ],
};

@Injectable({
  providedIn: 'root',
})
export class JarvisCatalogService {
  readonly isDemo = signal<boolean>(IS_DEMO_DATA);
  readonly disclaimer = signal<string>(DEMO_DATA_DISCLAIMER);

  /**
   * Búsqueda controlada de negocios con soporte semántico, filtros y presupuesto máximo
   */
  searchBusinesses(query?: string, category?: string, maxBudget?: number): Business[] {
    let results = [...DEMO_BUSINESSES];

    if (category && category.trim()) {
      const catNorm = normalizeText(category);
      results = results.filter((b) => normalizeText(b.categoria).includes(catNorm));
    }

    if (query && query.trim()) {
      const rawNormalized = normalizeText(query);

      // 1. Detectar categorías semánticas asociadas a la consulta
      const matchedCategories = new Set<string>();
      for (const [catName, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
        if (synonyms.some((syn) => rawNormalized.includes(syn))) {
          matchedCategories.add(catName);
        }
      }

      // 2. Extraer tokens limpios descartando palabras vacías (stopwords)
      const tokens = rawNormalized
        .split(/[^a-z0-9]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 2 && !COMMON_STOP_WORDS.has(t));

      const filtered = results.filter((b) => {
        // Coincidencia por categoría semántica
        if (matchedCategories.has(b.categoria)) {
          return true;
        }

        const bNormNombre = normalizeText(b.nombre);
        const bNormDesc = normalizeText(b.descripcionCorta + ' ' + b.descripcionCompleta);
        const bNormCat = normalizeText(b.categoria);
        const bNormSector = normalizeText(b.ubicacion.sector);
        const bNormPiso = normalizeText(b.ubicacion.piso);

        // Coincidencia de texto completo
        if (
          bNormNombre.includes(rawNormalized) ||
          bNormDesc.includes(rawNormalized) ||
          bNormCat.includes(rawNormalized) ||
          bNormSector.includes(rawNormalized) ||
          bNormPiso.includes(rawNormalized)
        ) {
          return true;
        }

        // Coincidencia por palabras clave / tokens
        if (tokens.length > 0) {
          return tokens.some(
            (token) =>
              bNormNombre.includes(token) ||
              bNormDesc.includes(token) ||
              bNormCat.includes(token) ||
              bNormSector.includes(token) ||
              bNormPiso.includes(token)
          );
        }

        return false;
      });

      if (filtered.length > 0) {
        results = filtered;
      }
    }

    if (typeof maxBudget === 'number' && maxBudget > 0) {
      results = results.filter((b) => b.ticketPromedioBs <= maxBudget);
    }

    return results;
  }

  getBusinessById(id: string): Business | undefined {
    return DEMO_BUSINESSES.find((b) => b.id === id);
  }

  getPromotions(category?: string, maxBudget?: number): Promotion[] {
    let promos = [...DEMO_PROMOTIONS];
    if (category && category.trim()) {
      const c = normalizeText(category);
      promos = promos.filter((p) => normalizeText(p.categoria).includes(c));
    }
    if (typeof maxBudget === 'number' && maxBudget > 0) {
      promos = promos.filter((p) => !p.precioAhoraBs || p.precioAhoraBs <= maxBudget);
    }
    return promos;
  }

  getEvents(filter?: string): PaseoEvent[] {
    if (!filter) return DEMO_EVENTS;
    const f = filter.toLowerCase().trim();
    return DEMO_EVENTS.filter(
      (e) =>
        e.nombre.toLowerCase().includes(f) ||
        e.lugar.toLowerCase().includes(f) ||
        e.categoria.toLowerCase().includes(f)
    );
  }

  getLocation(id: string): PaseoLocation | undefined {
    return DEMO_LOCATIONS[id];
  }

  getAllLocations(): PaseoLocation[] {
    return Object.values(DEMO_LOCATIONS);
  }

  /**
   * Construye un recorrido lógico y eficiente calculando tiempos y costos estimados
   */
  buildItinerary(
    businessIds: string[],
    availableMinutes: number,
    budgetBs: number,
    reason?: string
  ): Itinerary {
    const validMinutes = Math.max(15, Math.min(240, availableMinutes || 45));
    const validBudget = Math.max(10, budgetBs || 150);

    const selectedBusinesses = businessIds
      .map((id) => this.getBusinessById(id))
      .filter((b): b is Business => Boolean(b));

    // Regla de cálculo: asignar tiempo y presupuesto secuencial
    let accumulatedTime = 0;
    let accumulatedCost = 0;
    const paradas: ItineraryStop[] = [];

    // Si no enviaron comercios o enviaron menos de 2, sugerimos el combo ideal (comida rápida + regalo)
    const targets =
      selectedBusinesses.length > 0
        ? selectedBusinesses
        : [
            this.getBusinessById('biz-cafe')!,
            this.getBusinessById('biz-plateria')!,
          ];

    targets.forEach((biz, index) => {
      const isFood = biz.categoria === 'Gastronomía';
      const allocatedTime = isFood
        ? Math.min(20, Math.floor(validMinutes * 0.4))
        : Math.min(20, Math.floor(validMinutes * 0.5));

      const allocatedCost = Math.min(biz.ticketPromedioBs, validBudget - accumulatedCost);

      paradas.push({
        orden: index + 1,
        businessId: biz.id,
        nombreLugar: biz.nombre,
        piso: biz.ubicacion.piso,
        local: biz.ubicacion.local,
        actividad: isFood ? 'Comer algo rico y rápido' : 'Explorar opciones de regalo',
        tiempoEstimadoMinutos: allocatedTime,
        costoEstimadoBs: allocatedCost > 0 ? allocatedCost : biz.ticketPromedioBs,
        motivoRecomendacion: isFood
          ? `Servicio express en ${biz.ubicacion.piso} sin demoras.`
          : `Opciones de obsequio por menos de Bs. ${validBudget} con entrega inmediata.`,
      });

      accumulatedTime += allocatedTime;
      accumulatedCost += allocatedCost > 0 ? allocatedCost : biz.ticketPromedioBs;
    });

    // Agregar 5 minutos de desplazamiento entre pisos
    accumulatedTime += (paradas.length - 1) * 3;

    return {
      id: 'itin-' + Date.now(),
      titulo: 'Recorrido Sugerido Inteligente',
      tiempoTotalMinutos: accumulatedTime,
      tiempoDisponibleMinutos: validMinutes,
      presupuestoEstimadoBs: accumulatedCost,
      presupuestoDisponibleBs: validBudget,
      motivoResumen:
        reason ||
        `Optimizado para tus ${validMinutes} minutos disponibles y presupuesto de Bs. ${validBudget}.`,
      paradas,
    };
  }
}
