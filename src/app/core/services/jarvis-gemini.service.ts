import { Injectable, inject, signal, computed } from '@angular/core';
import { environment } from '../../../environments/environment';
import { JarvisCatalogService } from './jarvis-catalog.service';
import {
  JarvisState,
  JarvisVisualItem,
  ConversationTurn,
  Business,
  Promotion,
  PaseoEvent,
  PaseoLocation,
  Itinerary,
} from '../models/jarvis-guide.models';

/**
 * Declaraciones oficiales de herramientas (Function Declarations)
 * según la especificación de Gemini API v1beta / generateContent.
 */
export const JARVIS_GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_businesses',
        description: 'Busca negocios en Paseo Aranjuez por texto, categoría o presupuesto máximo en Bolivianos.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Término de búsqueda opcional' },
            category: {
              type: 'string',
              description: 'Categoría opcional (Gastronomía, Tecnología, Moda y Joyería, etc.)',
            },
            max_budget: {
              type: 'number',
              description: 'Presupuesto máximo sugerido en Bolivianos (Bs)',
            },
          },
        },
      },
      {
        name: 'get_business_details',
        description: 'Obtiene detalles completos de un comercio específico por su ID único.',
        parameters: {
          type: 'object',
          properties: {
            business_id: { type: 'string', description: 'ID del comercio (ej. biz-cafe, biz-plateria)' },
          },
          required: ['business_id'],
        },
      },
      {
        name: 'get_promotions',
        description: 'Consulta promociones vigentes en el Paseo, opcionalmente filtradas por categoría o presupuesto.',
        parameters: {
          type: 'object',
          properties: {
            category: { type: 'string', description: 'Categoría de la promoción' },
            max_budget: { type: 'number', description: 'Monto máximo en Bolivianos' },
          },
        },
      },
      {
        name: 'get_events',
        description: 'Consulta la cartelera de eventos y actividades programadas en Paseo Aranjuez.',
        parameters: {
          type: 'object',
          properties: {
            date_filter: { type: 'string', description: 'Filtro de fecha o palabra clave' },
          },
        },
      },
      {
        name: 'show_business_cards',
        description: 'Solicita mostrar tarjetas interactivas de comercios en el escenario visual del usuario.',
        parameters: {
          type: 'object',
          properties: {
            business_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lista de IDs de comercios a renderizar en pantalla (máximo 4)',
            },
          },
          required: ['business_ids'],
        },
      },
      {
        name: 'show_map',
        description: 'Solicita desplegar el plano esquemático de navegación con marcadores de locales.',
        parameters: {
          type: 'object',
          properties: {
            location_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lista de IDs de ubicaciones a marcar en el plano (ej. loc-cafe, loc-plateria)',
            },
            floor: {
              type: 'string',
              description: 'Piso a mostrar prioritariamente (Piso 1, Piso 2, Piso 3, Piso 4)',
            },
          },
          required: ['location_ids'],
        },
      },
      {
        name: 'build_itinerary',
        description: 'Genera un recorrido optimizado con tiempos por parada y presupuesto estimado.',
        parameters: {
          type: 'object',
          properties: {
            business_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Comercios que forman parte del recorrido',
            },
            available_minutes: {
              type: 'number',
              description: 'Minutos disponibles indicados por el visitante',
            },
            budget_bs: {
              type: 'number',
              description: 'Presupuesto total en Bolivianos disponible para el recorrido',
            },
            reason: {
              type: 'string',
              description: 'Breve justificación de por qué se recomienda este recorrido',
            },
          },
          required: ['available_minutes', 'budget_bs'],
        },
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class JarvisGeminiService {
  private catalog = inject(JarvisCatalogService);

  // Estados del asistente reactivos
  readonly state = signal<JarvisState>('listo');
  readonly liveTranscription = signal<string>('');
  readonly activeError = signal<string | null>(null);
  readonly visualItems = signal<JarvisVisualItem[]>([]);
  readonly history = signal<ConversationTurn[]>([]);
  readonly isVoiceMuted = signal<boolean>(false);
  readonly micPermissionGranted = signal<boolean | null>(null);

  // Configuración Gemini desde entorno
  readonly modelName = signal<string>(environment.geminiModel || 'gemini-2.5-flash');
  readonly apiKey = signal<string>(environment.geminiApiKey || '');

  // Detección de soporte del navegador
  readonly sttSupported = signal<boolean>(
    typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  );
  readonly ttsSupported = signal<boolean>(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  readonly isRealGeminiMode = computed<boolean>(() => Boolean(this.apiKey().trim()));

  // Instancias de Web Speech API
  private recognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  // -------------------------------------------------------------
  // GESTIÓN DE MICRÓFONO Y SPEECH RECOGNITION
  // -------------------------------------------------------------
  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-BO';

        this.recognition.onstart = () => {
          this.state.set('escuchando');
          this.liveTranscription.set('');
          this.activeError.set(null);
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.liveTranscription.set(transcript);
              this.handleUserInput(transcript);
            } else {
              interim += transcript;
              this.liveTranscription.set(interim);
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            this.micPermissionGranted.set(false);
            this.activeError.set('Permiso de micrófono denegado. Puedes escribir tu consulta por texto.');
          } else if (event.error !== 'no-speech') {
            this.activeError.set(`Aviso de entrada de audio: ${event.error}`);
          }
          if (this.state() === 'escuchando') {
            this.state.set('listo');
          }
        };

        this.recognition.onend = () => {
          if (this.state() === 'escuchando') {
            this.state.set('listo');
          }
        };
      } catch (err) {
        console.warn('SpeechRecognition setup error:', err);
      }
    }
  }

  async requestMicPermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.micPermissionGranted.set(false);
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Detener pistas inmediatas tras validar permiso
      stream.getTracks().forEach((track) => track.stop());
      this.micPermissionGranted.set(true);
      return true;
    } catch (e) {
      this.micPermissionGranted.set(false);
      this.activeError.set('Acceso al micrófono no concedido. Puedes usar la entrada de texto.');
      return false;
    }
  }

  startListening(): void {
    this.interruptSpeech();
    this.activeError.set(null);

    if (!this.sttSupported()) {
      this.activeError.set('El reconocimiento de voz no está soportado en este navegador. Usa la entrada de texto.');
      return;
    }

    try {
      this.recognition?.start();
    } catch (e) {
      // Si ya estaba activo, reiniciar
      try {
        this.recognition?.stop();
        setTimeout(() => this.recognition?.start(), 100);
      } catch (err) {
        console.warn(err);
      }
    }
  }

  stopListening(): void {
    try {
      this.recognition?.stop();
    } catch (e) {
      console.warn(e);
    }
    if (this.state() === 'escuchando') {
      this.state.set('listo');
    }
  }

  // -------------------------------------------------------------
  // SÍNTESIS DE VOZ (TTS) CON SOPORTE DE BARGE-IN / INTERRUPCIÓN
  // -------------------------------------------------------------
  speak(text: string): void {
    if (this.isVoiceMuted() || !this.ttsSupported()) return;

    this.interruptSpeech();

    // Limpieza de markdown para voz fluida
    const cleanSpeech = text
      .replace(/\*\*/g, '')
      .replace(/•/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/Bs\.\s?(\d+)/g, '$1 Bolivianos')
      .trim();

    if (!cleanSpeech) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.state.set('hablando');
      };

      utterance.onend = () => {
        this.state.set('listo');
        this.currentUtterance = null;
      };

      utterance.onerror = () => {
        this.state.set('listo');
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.state.set('listo');
    }
  }

  interruptSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn(e);
      }
    }
    this.currentUtterance = null;
    if (this.state() === 'hablando') {
      this.state.set('listo');
    }
  }

  toggleVoiceMute(): void {
    const next = !this.isVoiceMuted();
    this.isVoiceMuted.set(next);
    if (next) {
      this.interruptSpeech();
    }
  }

  // -------------------------------------------------------------
  // PROCESAMIENTO DE CONVERSACIÓN (GEMINI REAL VS DEMO LOCAL)
  // -------------------------------------------------------------
  async handleUserInput(userText: string): Promise<void> {
    const clean = userText.trim();
    if (!clean) return;

    // Interrumpir cualquier audio en curso
    this.interruptSpeech();
    this.stopListening();

    // Añadir turno del visitante
    const turnId = 'turn-' + Date.now();
    const visitorTurn: ConversationTurn = {
      id: turnId,
      sender: 'visitante',
      text: clean,
      timestamp: new Date(),
    };
    this.history.update((h) => [...h, visitorTurn]);

    this.state.set('pensando');
    this.activeError.set(null);

    try {
      if (this.isRealGeminiMode()) {
        await this.executeRealGeminiFlow(clean);
      } else {
        await this.executeLocalDemoFlow(clean);
      }
    } catch (err: any) {
      console.error('Jarvis processing error:', err);
      this.state.set('error');
      this.activeError.set('Hubo un problema al procesar la solicitud. Reintentando con el motor de respaldo local.');
      // Respaldo garantizado al motor local para que la experiencia nunca se corte
      await this.executeLocalDemoFlow(clean);
    }
  }

  /**
   * Flujo con API oficial de Gemini mediante generateContent y Function Calling
   */
  private async executeRealGeminiFlow(userText: string): Promise<void> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName()}:generateContent?key=${this.apiKey()}`;

    const requestBody = {
      systemInstruction: {
        parts: [
          {
            text:
              'Eres Jarvis Paseo, la guía viva y asistente virtual inteligente de Paseo Aranjuez en Cochabamba, Bolivia. ' +
              'Responde en español de forma natural, cálida y breve (máximo 2 a 3 oraciones explicativas). ' +
              'Cuando el usuario busque comercios, promociones, mapas o itinerarios, INVOCA obligatoriamente las herramientas declaradas ' +
              '(show_business_cards, show_map, build_itinerary, get_promotions). ' +
              'No inventes datos que no estén en el catálogo. No generes HTML ni código ejecutable.',
          },
        ],
      },
      contents: [
        ...this.history().slice(-6).map((turn) => ({
          role: turn.sender === 'visitante' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        })),
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
      tools: JARVIS_GEMINI_TOOLS,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      throw new Error(`Gemini API HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Inspeccionar si Gemini solicitó functionCall
    const functionCallPart = parts.find((p: any) => Boolean(p.functionCall));

    if (functionCallPart) {
      const { name, args } = functionCallPart.functionCall;
      const functionResult = this.executeFunctionCall(name, args);

      // Responder con función ejecutada a Gemini para resumen
      const followUpBody = {
        contents: [
          ...requestBody.contents,
          {
            role: 'model',
            parts: [functionCallPart],
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name,
                  response: { result: functionResult.summaryData },
                },
              },
            ],
          },
        ],
      };

      let finalBotText = functionResult.fallbackSpeech;

      try {
        const followUpRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(followUpBody),
        });
        if (followUpRes.ok) {
          const followUpData = await followUpRes.json();
          const textPart = followUpData.candidates?.[0]?.content?.parts?.find((p: any) => Boolean(p.text));
          if (textPart?.text) {
            finalBotText = textPart.text;
          }
        }
      } catch (e) {
        console.warn('Follow-up Gemini error, using fallback summary:', e);
      }

      this.completeBotTurn(finalBotText, functionResult.newVisualItems);
    } else {
      const textPart = parts.find((p: any) => Boolean(p.text));
      const botText = textPart?.text || 'He recibido tu consulta. ¿En qué más puedo orientarte en Paseo Aranjuez?';
      // Desplegar componentes visuales interactivos para que el escenario nunca quede vacío
      const searchRes = this.executeFunctionCall('search_businesses', { query: userText, max_budget: 350 });
      let items = searchRes.newVisualItems;
      if (items.length === 0) {
        const fallbackCards = this.executeFunctionCall('show_business_cards', {
          business_ids: ['biz-cafe', 'biz-plateria', 'biz-sony'],
        });
        const mapRes = this.executeFunctionCall('show_map', { floor: 'Piso 1' });
        items = [...fallbackCards.newVisualItems, ...mapRes.newVisualItems];
      }
      this.completeBotTurn(botText, items);
    }
  }

  /**
   * Modo Demostración Local Controlado:
   * Realiza el mismo ciclo de vida de Function Calling de Gemini pero de forma autónoma y offline.
   */
  private async executeLocalDemoFlow(userText: string): Promise<void> {
    // Normalización de texto para tolerancia a acentos y mayúsculas
    const q = userText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // Simulación de latencia natural del modelo (350ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    // 1. ESCENARIO PRINCIPAL RETO 4.11: "Tengo 40 minutos, quiero comer algo rápido y buscar un regalo por menos de Bs 150"
    if (
      (q.includes('40') || q.includes('tiempo') || q.includes('minuto')) &&
      (q.includes('comer') || q.includes('rapido') || q.includes('cafe')) &&
      (q.includes('regalo') || q.includes('150') || q.includes('plata') || q.includes('comprar'))
    ) {
      const itinResult = this.executeFunctionCall('build_itinerary', {
        business_ids: ['biz-cafe', 'biz-plateria'],
        available_minutes: 40,
        budget_bs: 150,
        reason: 'Café gourmet express en Piso 3 y joyería fina de plata boliviana en Piso 1.',
      });

      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-cafe', 'biz-plateria'],
      });

      const mapResult = this.executeFunctionCall('show_map', {
        location_ids: ['loc-cafe', 'loc-plateria'],
        floor: 'Piso 3',
      });

      const speech =
        'Encontré una cafetería express en el Piso 3 y opciones de regalo en plata fina en el Piso 1 dentro de tus Bs. 150. ' +
        'He diseñado un recorrido de 38 minutos en pantalla con el plano de orientación para que no pierdas tiempo.';

      this.completeBotTurn(speech, [
        ...itinResult.newVisualItems,
        ...cardsResult.newVisualItems,
        ...mapResult.newVisualItems,
      ]);
      return;
    }

    // 2. GASTRONOMÍA, COMIDA, CAFÉ, RESTAURANTES
    if (
      q.includes('gastro') ||
      q.includes('comid') ||
      q.includes('comer') ||
      q.includes('hambre') ||
      q.includes('almuerz') ||
      q.includes('cena') ||
      q.includes('cenar') ||
      q.includes('restauran') ||
      q.includes('cafe') ||
      q.includes('burger') ||
      q.includes('hamburgues') ||
      q.includes('carne') ||
      q.includes('bife') ||
      q.includes('dulce') ||
      q.includes('postre') ||
      q.includes('tapas') ||
      q.includes('vino') ||
      q.includes('beber') ||
      q.includes('sed') ||
      q.includes('sandwich')
    ) {
      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-cafe', 'biz-burger', 'biz-fuego'],
      });
      const promoResult = this.executeFunctionCall('get_promotions', { category: 'Gastronomía' });
      const mapResult = this.executeFunctionCall('show_map', {
        location_ids: ['loc-cafe', 'loc-burger', 'loc-fuego'],
        floor: 'Piso 3',
      });

      const speech =
        'En el Piso 3 (Food Court) y Terraza Piso 4 tenemos excelentes opciones gastronómicas: Café & Dulces Gourmet, Burger Craft y Fuego & Corte Steakhouse. Te muestro sus tarjetas, promociones y el mapa en pantalla.';

      this.completeBotTurn(speech, [
        ...cardsResult.newVisualItems,
        ...promoResult.newVisualItems.slice(0, 1),
        ...mapResult.newVisualItems,
      ]);
      return;
    }

    // 3. TECNOLOGÍA, SMARTPHONES, AUDIO, ELECTRÓNICA
    if (
      q.includes('tecno') ||
      q.includes('celular') ||
      q.includes('telefono') ||
      q.includes('smartphone') ||
      q.includes('audifon') ||
      q.includes('auricular') ||
      q.includes('audio') ||
      q.includes('sony') ||
      q.includes('xiaomi') ||
      q.includes('apple') ||
      q.includes('ishop') ||
      q.includes('consola') ||
      q.includes('bluetooth') ||
      q.includes('laptop') ||
      q.includes('cable') ||
      q.includes('cargador') ||
      q.includes('gadget') ||
      q.includes('gamer')
    ) {
      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-sony', 'biz-xiaomi', 'biz-ishop'],
      });
      const promoResult = this.executeFunctionCall('get_promotions', { category: 'Tecnología' });
      const mapResult = this.executeFunctionCall('show_map', {
        location_ids: ['loc-sony', 'loc-xiaomi', 'loc-ishop'],
        floor: 'Piso 2',
      });

      const speech =
        'En el Piso 2 se ubica el Ala Tecnológica de Paseo Aranjuez con Sony Store, Xiaomi Mi Store e iShop Apple. Desplegué sus tarjetas de producto, promociones y el plano esquemático.';

      this.completeBotTurn(speech, [
        ...cardsResult.newVisualItems,
        ...promoResult.newVisualItems.slice(0, 1),
        ...mapResult.newVisualItems,
      ]);
      return;
    }

    // 4. REGALOS, JOYERÍA, MODA Y COMPRAS
    if (
      q.includes('regalo') ||
      q.includes('joya') ||
      q.includes('joyer') ||
      q.includes('plata') ||
      q.includes('moda') ||
      q.includes('ropa') ||
      q.includes('boutique') ||
      q.includes('anillo') ||
      q.includes('collar') ||
      q.includes('pulsera') ||
      q.includes('bolso') ||
      q.includes('vestir') ||
      q.includes('accesorio')
    ) {
      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-plateria', 'biz-paris'],
      });
      const promoResult = this.executeFunctionCall('get_promotions', { category: 'Moda y Joyería' });
      const mapResult = this.executeFunctionCall('show_map', {
        location_ids: ['loc-plateria', 'loc-paris'],
        floor: 'Piso 1',
      });

      const speech =
        'Para regalos y moda, te recomiendo Platería Real Cochabamba en el Piso 1 con piezas finas en plata 925 y Boutique París. Aquí tienes las tarjetas y su ubicación en el plano.';

      this.completeBotTurn(speech, [
        ...cardsResult.newVisualItems,
        ...promoResult.newVisualItems.slice(0, 1),
        ...mapResult.newVisualItems,
      ]);
      return;
    }

    // 5. OCIO, ARCADES, JUEGOS Y ENTRETENIMIENTO FAMILIAR
    if (
      q.includes('juego') ||
      q.includes('arcade') ||
      q.includes('skygames') ||
      q.includes('diversion') ||
      q.includes('familia') ||
      q.includes('nino') ||
      q.includes('recreaci')
    ) {
      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-skygames'],
      });
      const eventsResult = this.executeFunctionCall('get_events', {});
      const mapResult = this.executeFunctionCall('show_map', {
        location_ids: ['loc-skygames'],
        floor: 'Piso 3',
      });

      const speech =
        'En el Piso 3 tienes Sky Games & Arcades con simuladores y realidad virtual para toda la familia, además de eventos en cartelera activa.';

      this.completeBotTurn(speech, [
        ...cardsResult.newVisualItems,
        ...eventsResult.newVisualItems.slice(0, 1),
        ...mapResult.newVisualItems,
      ]);
      return;
    }

    // 6. PROMOCIONES Y DESCUENTOS
    if (q.includes('promo') || q.includes('descuento') || q.includes('oferta') || q.includes('rebaja') || q.includes('combo')) {
      const res = this.executeFunctionCall('get_promotions', { category: '', max_budget: 200 });
      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-cafe', 'biz-burger'],
      });
      const speech =
        'Aquí tienes las mejores promociones vigentes en Paseo Aranjuez, desde combos de café y hamburguesas hasta descuentos especiales en joyería.';
      this.completeBotTurn(speech, [...res.newVisualItems, ...cardsResult.newVisualItems]);
      return;
    }

    // 7. EVENTOS Y ACTIVIDADES CULTURALES
    if (q.includes('evento') || q.includes('actividad') || q.includes('jazz') || q.includes('cartelera') || q.includes('show') || q.includes('concierto')) {
      const res = this.executeFunctionCall('get_events', {});
      const mapResult = this.executeFunctionCall('show_map', {
        location_ids: ['loc-fuego', 'loc-cava'],
        floor: 'Piso 4',
      });
      const speech =
        'Tenemos cartelera activa en Paseo Aranjuez: Noches de Jazz en la Terraza El Cuarto, torneos en Sky Games y muestras artesanales en Planta Baja.';
      this.completeBotTurn(speech, [...res.newVisualItems, ...mapResult.newVisualItems]);
      return;
    }

    // 8. PLANO, MAPA O UBICACIÓN
    if (
      q.includes('mapa') ||
      q.includes('donde queda') ||
      q.includes('donde esta') ||
      q.includes('plano') ||
      q.includes('ubicacion') ||
      q.includes('piso') ||
      q.includes('llegar')
    ) {
      const res = this.executeFunctionCall('show_map', {
        location_ids: ['loc-cafe', 'loc-burger', 'loc-plateria', 'loc-sony'],
        floor: 'Piso 1',
      });
      const cardsResult = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-cafe', 'biz-plateria', 'biz-sony'],
      });
      const speech =
        'Desplegando el plano esquemático de Paseo Aranjuez con puntos clave de referencia. Puedes cambiar de piso en el panel superior para ubicar cada local.';
      this.completeBotTurn(speech, [...res.newVisualItems, ...cardsResult.newVisualItems]);
      return;
    }

    // 9. BÚSQUEDA GENERAL Y RESPALDO GARANTIZADO (NUNCA DEJA EL ESCENARIO EN BLANCO)
    const searchRes = this.executeFunctionCall('search_businesses', { query: userText, max_budget: 350 });

    if (searchRes.newVisualItems.length > 0) {
      const mapRes = this.executeFunctionCall('show_map', { floor: 'Piso 1' });
      const speech =
        'Encontré locales recomendados en Paseo Aranjuez relacionados con tu consulta. Puedes tocar cualquier tarjeta para ver su información y ubicación.';
      this.completeBotTurn(speech, [...searchRes.newVisualItems, ...mapRes.newVisualItems]);
    } else {
      // Fallback seguro: Proporcionar comercios insignia, promoción y mapa general
      const featuredCards = this.executeFunctionCall('show_business_cards', {
        business_ids: ['biz-cafe', 'biz-plateria', 'biz-sony'],
      });
      const promoRes = this.executeFunctionCall('get_promotions', { max_budget: 200 });
      const mapRes = this.executeFunctionCall('show_map', {
        location_ids: ['loc-cafe', 'loc-plateria', 'loc-sony'],
        floor: 'Piso 1',
      });
      const speech =
        'Para ayudarte a explorar Paseo Aranjuez, aquí tienes los locales y promociones más destacados en gastronomía, regalos y tecnología, junto al plano interactivo del centro.';
      this.completeBotTurn(speech, [
        ...featuredCards.newVisualItems,
        ...promoRes.newVisualItems.slice(0, 1),
        ...mapRes.newVisualItems,
      ]);
    }
  }

  /**
   * Ejecutor y Validador Seguro de Funciones (Controlled Registry)
   */
  private executeFunctionCall(
    name: string,
    args: any
  ): { summaryData: any; newVisualItems: JarvisVisualItem[]; fallbackSpeech: string } {
    const newVisualItems: JarvisVisualItem[] = [];

    switch (name) {
      case 'build_itinerary': {
        const availableMinutes = Number(args.available_minutes) || 45;
        const budgetBs = Number(args.budget_bs) || 150;
        const businessIds: string[] = Array.isArray(args.business_ids) ? args.business_ids : [];
        const reason: string = typeof args.reason === 'string' ? args.reason : '';

        const itinerary = this.catalog.buildItinerary(businessIds, availableMinutes, budgetBs, reason);

        newVisualItems.push({
          id: 'item-itin-' + Date.now(),
          type: 'itinerary-panel',
          title: `Recorrido (${itinerary.tiempoTotalMinutos} min • Bs. ${itinerary.presupuestoEstimadoBs})`,
          data: itinerary,
          timestamp: new Date(),
        });

        return {
          summaryData: {
            tiempoTotal: itinerary.tiempoTotalMinutos,
            costoEstimado: itinerary.presupuestoEstimadoBs,
            paradas: itinerary.paradas.map((p) => p.nombreLugar),
          },
          newVisualItems,
          fallbackSpeech: `Diseñé un recorrido optimizado de ${itinerary.tiempoTotalMinutos} minutos con ${itinerary.paradas.length} paradas.`,
        };
      }

      case 'show_business_cards': {
        const ids: string[] = Array.isArray(args.business_ids) ? args.business_ids : [];
        ids.slice(0, 4).forEach((id) => {
          const biz = this.catalog.getBusinessById(id);
          if (biz) {
            newVisualItems.push({
              id: `item-biz-${biz.id}-${Date.now()}`,
              type: 'business-card',
              title: biz.nombre,
              data: biz,
              timestamp: new Date(),
            });
          }
        });

        return {
          summaryData: { totalMostrados: newVisualItems.length },
          newVisualItems,
          fallbackSpeech: `Te muestro las tarjetas de los locales seleccionados con horarios y ubicación.`,
        };
      }

      case 'search_businesses': {
        const q = typeof args.query === 'string' ? args.query : '';
        const cat = typeof args.category === 'string' ? args.category : '';
        const maxBudget = typeof args.max_budget === 'number' ? args.max_budget : undefined;

        const results = this.catalog.searchBusinesses(q, cat, maxBudget).slice(0, 3);

        results.forEach((biz) => {
          newVisualItems.push({
            id: `item-biz-${biz.id}-${Date.now()}`,
            type: 'business-card',
            title: biz.nombre,
            data: biz,
            timestamp: new Date(),
          });
        });

        return {
          summaryData: { totalEncontrados: results.length, nombres: results.map((b) => b.nombre) },
          newVisualItems,
          fallbackSpeech: `He encontrado ${results.length} opciones en Paseo Aranjuez.`,
        };
      }

      case 'get_promotions': {
        const cat = typeof args.category === 'string' ? args.category : '';
        const maxBudget = typeof args.max_budget === 'number' ? args.max_budget : undefined;
        const promos = this.catalog.getPromotions(cat, maxBudget).slice(0, 3);

        promos.forEach((promo) => {
          newVisualItems.push({
            id: `item-promo-${promo.id}-${Date.now()}`,
            type: 'promotion-card',
            title: `Promo: ${promo.titulo}`,
            data: promo,
            timestamp: new Date(),
          });
        });

        return {
          summaryData: { totalPromos: promos.length },
          newVisualItems,
          fallbackSpeech: `Te presento ${promos.length} promociones vigentes con descuentos especiales.`,
        };
      }

      case 'get_events': {
        const filter = typeof args.date_filter === 'string' ? args.date_filter : '';
        const events = this.catalog.getEvents(filter).slice(0, 3);

        events.forEach((ev) => {
          newVisualItems.push({
            id: `item-event-${ev.id}-${Date.now()}`,
            type: 'event-card',
            title: `Evento: ${ev.nombre}`,
            data: ev,
            timestamp: new Date(),
          });
        });

        return {
          summaryData: { totalEventos: events.length },
          newVisualItems,
          fallbackSpeech: `Cartelera de actividades y eventos culturales en el Paseo.`,
        };
      }

      case 'show_map': {
        const locIds: string[] = Array.isArray(args.location_ids) ? args.location_ids : [];
        const floor: string = typeof args.floor === 'string' ? args.floor : 'Piso 1';

        const locations = locIds
          .map((id) => this.catalog.getLocation(id))
          .filter((l): l is PaseoLocation => Boolean(l));

        const displayLocations = locations.length > 0 ? locations : this.catalog.getAllLocations();

        newVisualItems.push({
          id: 'item-map-' + Date.now(),
          type: 'map-panel',
          title: `Plano de Navegación (${floor})`,
          data: { locations: displayLocations, initialFloor: floor },
          timestamp: new Date(),
        });

        return {
          summaryData: { piso: floor, totalMarcadores: displayLocations.length },
          newVisualItems,
          fallbackSpeech: `Plano esquemático de Paseo Aranjuez desplegado con los puntos de referencia.`,
        };
      }

      default:
        console.warn(`Función desconocida solicitada por la IA: ${name}`);
        return {
          summaryData: { error: 'Función no registrada en el catálogo' },
          newVisualItems: [],
          fallbackSpeech: 'No pude ejecutar esa acción en este momento.',
        };
    }
  }

  private completeBotTurn(text: string, newItems: JarvisVisualItem[]): void {
    if (newItems.length > 0) {
      // Agregar nuevos componentes al escenario visual
      this.visualItems.update((current) => [...newItems, ...current].slice(0, 8)); // Límite de 8 tarjetas en pantalla
    }

    const botTurn: ConversationTurn = {
      id: 'turn-' + Date.now(),
      sender: 'jarvis',
      text,
      timestamp: new Date(),
      visualItems: newItems,
    };

    this.history.update((h) => [...h, botTurn]);
    this.state.set('listo');

    // Reproducir voz si no está silenciado
    this.speak(text);
  }

  // -------------------------------------------------------------
  // CONTROLES DE LA ETAPA VISUAL Y CONVERSACIÓN
  // -------------------------------------------------------------
  clearHistory(): void {
    this.history.set([]);
  }

  clearVisualItems(): void {
    this.visualItems.set([]);
  }

  removeVisualItem(id: string): void {
    this.visualItems.update((items) => items.filter((i) => i.id !== id));
  }

  toggleExpandItem(id: string): void {
    this.visualItems.update((items) =>
      items.map((i) => (i.id === id ? { ...i, expanded: !i.expanded } : i))
    );
  }

  showBusinessLocation(locationId: string): void {
    const loc = this.catalog.getLocation(locationId);
    if (loc) {
      this.visualItems.update((items) => [
        {
          id: 'item-map-' + Date.now(),
          type: 'map-panel',
          title: `Ubicación: ${loc.local}`,
          data: { locations: [loc], initialFloor: loc.piso },
          timestamp: new Date(),
        },
        ...items,
      ]);
      this.speak(`Te muestro en el plano la ubicación de ${loc.local} en el ${loc.piso}.`);
    }
  }

  setCredentials(apiKey: string, modelName?: string): void {
    const cleanKey = apiKey.trim();
    this.apiKey.set(cleanKey);
    if (modelName && modelName.trim()) {
      this.modelName.set(modelName.trim());
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('PASEO_GEMINI_API_KEY', cleanKey);
      if (modelName) localStorage.setItem('PASEO_GEMINI_MODEL', modelName.trim());
    }
  }
}
