import { Injectable, inject, signal } from '@angular/core';
import { CatalogService } from './catalog.service';
import { Product, Store } from '../models';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  products?: Product[];
  stores?: Store[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private catalogService = inject(CatalogService);

  readonly isOpen = signal<boolean>(false);
  readonly isTyping = signal<boolean>(false);
  readonly messages = signal<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Hola! Soy tu asistente virtual de Paseo Aranjuez. Puedo ayudarte a buscar productos, comparar precios entre tiendas, ubicar locales por piso o resolver tus dudas sobre el retiro con QR.',
      timestamp: new Date(),
      suggestions: [
        'Comparar audífonos bluetooth',
        '¿Qué comer en Piso 3?',
        'Restaurantes en Terraza Piso 4',
        '¿Cómo funciona el retiro con QR?',
        '¿Cuáles son los horarios de atención?',
      ],
    },
  ]);

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  setOpen(open: boolean): void {
    this.isOpen.set(open);
  }

  async sendMessage(userText: string): Promise<void> {
    const cleanText = userText.trim();
    if (!cleanText) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date(),
    };

    this.messages.update((msgs) => [...msgs, userMsg]);
    this.isTyping.set(true);

    // Simulate natural response latency (300-600ms)
    await new Promise((resolve) => setTimeout(resolve, 450));
    const botResponse = await this.generateResponse(cleanText);
    this.messages.update((msgs) => [...msgs, botResponse]);
    this.isTyping.set(false);
  }

  private async generateResponse(query: string): Promise<ChatMessage> {
    const cleanText = query.trim();
    const q = cleanText.toLowerCase();
    const allProducts = this.catalogService.products();
    const allStores = this.catalogService.stores();

    // 1. COMPARATIVA DE AUDÍFONOS BLUETOOTH
    if (q.includes('audifono') || q.includes('audífono') || q.includes('auricular') || q.includes('bluetooth') || q.includes('headphone')) {
      const matched = allProducts.filter((p) =>
        p.nombre.toLowerCase().includes('audífonos') ||
        p.nombre.toLowerCase().includes('audifonos') ||
        p.nombre.toLowerCase().includes('beats') ||
        p.categoria === 'Audio'
      ).sort((a, b) => a.precio - b.precio);

      return {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `En el **Piso 2** de Paseo Aranjuez tenemos 3 opciones de audífonos bluetooth a distintos precios:\n\n` +
          `• **Xiaomi Mi Store** (Local 208): **Bs. 180.00** (Redmi Buds 4 Active)\n` +
          `• **Sony Store** (Local 215): **Bs. 250.00** (Sony WH-CH520)\n` +
          `• **iShop Apple** (Local 222): **Bs. 320.00** (Beats Flex Wireless)\n\n` +
          `Puedes agregarlos al carrito directamente desde aquí para retirarlos hoy con QR:`,
        timestamp: new Date(),
        products: matched.slice(0, 3),
        suggestions: ['¿Cómo retiro mi compra?', 'Ver Sony Store', 'Ver Xiaomi Mi Store'],
      };
    }

    // 2. GASTRONOMÍA / PISO 3
    if (q.includes('hamburguesa') || q.includes('comer') || q.includes('comida') || q.includes('piso 3') || q.includes('almuerzo') || q.includes('cena') || q.includes('pique') || q.includes('silpancho')) {
      const foodProducts = allProducts.filter((p) =>
        p.categoria === 'Hamburguesas' ||
        p.categoria === 'Tradicional' ||
        p.categoria === 'Bebidas' ||
        p.categoria === 'Pizzas'
      );

      const foodStores = allStores.filter((s) => s.piso === 'Piso 3');

      return {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `En el **Piso 3 (Mercado Gastronómico)** tienes una amplia variedad gastronómica:\n\n` +
          `• **Burger Craft** (Local 302): Hamburguesas gourmet desde **Bs. 38** a **Bs. 52**.\n` +
          `• **Tradición Valluna** (Local 306): Pique Macho (**Bs. 52**) y Silpancho tradicional (**Bs. 38**).\n` +
          `• **Pizzería Napolitana** (Local 308): Pizzas artesanales desde **Bs. 45**.\n` +
          `• **Café & Dulces Gourmet** (Isla 310): Bebidas y repostería desde **Bs. 15** a **Bs. 22**.\n\n` +
          `¡Además, junto al patio de comidas se encuentra **Sky Games** con arcades para la familia!`,
        timestamp: new Date(),
        products: foodProducts.slice(0, 4),
        stores: foodStores,
        suggestions: ['Ver Hamburguesa Doble', 'Ver Pique Macho', '¿Hay carnes premium?'],
      };
    }

    // 3. TERRAZA GOURMET EL CUARTO / PISO 4
    if (q.includes('piso 4') || q.includes('terraza') || q.includes('el cuarto') || q.includes('carne') || q.includes('vino') || q.includes('bife') || q.includes('tomahawk')) {
      const premiumProducts = allProducts.filter((p) =>
        p.categoria === 'Carnes Premium' || p.categoria === 'Tapas & Vinos'
      );

      return {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `En el **Piso 4** se encuentra la exclusiva **Terraza Gourmet "El Cuarto"** con vista panorámica de Cochabamba:\n\n` +
          `• **Fuego & Corte Steakhouse** (Local 401): Ojo de bife (**Bs. 95**), Bife de chorizo (**Bs. 85**) y Tomahawk para compartir (**Bs. 130**).\n` +
          `• **La Cava & Tapas** (Local 405): Tablas de quesos y jamón serrano (**Bs. 68**) y vinos de altura de Tarija (**Bs. 28**).\n\n` +
          `Horario de la terraza: Todos los días de 12:00 a 23:00.`,
        timestamp: new Date(),
        products: premiumProducts.slice(0, 3),
        suggestions: ['Ver Ojo de Bife', 'Ver Tabla Gourmet', '¿Cuáles son los horarios?'],
      };
    }

    // 4. HORARIOS Y UBICACIÓN DEL PASEO
    if (q.includes('horario') || q.includes('hora') || q.includes('abierto') || q.includes('ubicacion') || q.includes('ubicación') || q.includes('donde queda') || q.includes('dónde queda') || q.includes('direccion') || q.includes('dirección')) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `**Ubicación & Horarios de Paseo Aranjuez:**\n\n` +
          `• **Dirección:** Av. América y Pantaleón Dalence (Zona Norte, Cochabamba, Bolivia).\n\n` +
          `• **Horarios de Tiendas (Pisos 1 y 2):**\n` +
          `  - Lunes a Sábado: 10:00 - 22:00\n` +
          `  - Domingos y Feriados: 12:00 - 22:00\n\n` +
          `• **Terraza El Cuarto (Piso 4):** 12:00 - 23:00`,
        timestamp: new Date(),
        suggestions: ['Ver tiendas Piso 1', 'Ver tiendas Piso 2', 'Ver restaurantes Piso 3'],
      };
    }

    // 5. TIENDAS ESPECÍFICAS
    const matchedStore = allStores.find((s) => q.includes(s.nombre.toLowerCase()));
    if (matchedStore) {
      const storeProds = allProducts.filter((p) => p.store_id === matchedStore.id);
      return {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `**${matchedStore.nombre}**:\n\n` +
          `• **Ubicación:** ${matchedStore.piso}, ${matchedStore.local} (${matchedStore.sector || 'Sector Principal'})\n` +
          `• **Rubro:** ${matchedStore.rubro}\n` +
          `• **Horario:** ${matchedStore.horario_semana}\n` +
          `• **Teléfono WhatsApp:** ${matchedStore.telefono || 'Atención en mostrador'}\n\n` +
          `Aquí tienes algunos de sus productos disponibles para retiro inmediato:`,
        timestamp: new Date(),
        products: storeProds.slice(0, 3),
        suggestions: ['Ir al catálogo de la tienda', '¿Cómo retiro mi compra?'],
      };
    }

    // 6. PRODUCT SEARCH MATCH
    const searchMatches = await this.catalogService.searchProducts(cleanText);
    if (searchMatches.length > 0) {
      return {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `Encontré **${searchMatches.length} productos** en las tiendas de Paseo Aranjuez relacionados con "${cleanText}":`,
        timestamp: new Date(),
        products: searchMatches.slice(0, 3),
        suggestions: ['Ver más opciones', '¿Dónde queda el local?'],
      };
    }

    // DEFAULT FALLBACK
    return {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: `No encontré productos específicos para "${cleanText}", pero puedo ayudarte con:\n\n` +
        `• **Tecnología:** Audífonos bluetooth, celulares, cargadores (Piso 2)\n` +
        `• **Mercado Gastronómico:** Hamburguesas, pique macho, café (Piso 3)\n` +
        `• **Terraza Gourmet:** Carnes a la brasa, vinos y tablas (Piso 4)\n` +
        `• **Moda y Joyería:** Ropa de lino, joyas de plata y vestidos (Piso 1)\n` +
        `• **Retiro con QR:** Paga online y recoge tu pedido en el mostrador del local.`,
      timestamp: new Date(),
      suggestions: [
        'Audífonos bluetooth',
        'Hamburguesas en Piso 3',
        '¿Cómo retiro mi compra?',
      ],
    };
  }
}
