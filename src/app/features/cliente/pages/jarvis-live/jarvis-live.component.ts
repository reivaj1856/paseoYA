import {
  Component,
  inject,
  signal,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JarvisGeminiService } from '../../../../core/services/jarvis-gemini.service';
import { JarvisCatalogService } from '../../../../core/services/jarvis-catalog.service';
import { JarvisStageComponent } from '../../components/jarvis/jarvis-stage.component';
import { AiOrbIconComponent } from '../../../../shared/ui/ai-orb/ai-orb-icon.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { JarvisVisualItem, Business, Promotion, PaseoEvent } from '../../../../core/models/jarvis-guide.models';

@Component({
  selector: 'app-jarvis-live',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JarvisStageComponent,
    AiOrbIconComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4 max-w-7xl mx-auto pb-8">
      
      <!-- TOP HUD TOOLBAR (Compact, Sleek, Single-row Studio Layout) -->
      <div class="rounded-2xl bg-white border border-slate-200/90 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        
        <!-- Left: AI Orb + Title + Status Badges -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative size-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
            <span class="absolute inset-0 rounded-xl bg-amber-400/20 animate-ping"></span>
            <app-ai-orb-icon [size]="32" [glow]="true" label="Jarvis Paseo AI" />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-base sm:text-lg font-black tracking-tight text-slate-900">
                JARVIS PASEO
              </h1>
              <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                Guía Viva
              </span>
              <span
                class="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                [class]="
                  jarvis.isRealGeminiMode()
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                "
              >
                {{ jarvis.isRealGeminiMode() ? 'Gemini Live' : 'Modo Demostración' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 truncate hidden sm:block">
              Asistente en tiempo real &bull; Centro Comercial Paseo Aranjuez Cochabamba
            </p>
          </div>
        </div>

        <!-- Right: Status Equalizer & HUD Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Audio Equalizer Wave & State -->
          @if (jarvis.state() === 'hablando' || jarvis.state() === 'escuchando') {
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold animate-in fade-in">
              <div class="flex items-center gap-0.5 h-3">
                <span class="w-1 bg-amber-600 rounded-full animate-bounce h-full"></span>
                <span class="w-1 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.2s] h-2"></span>
                <span class="w-1 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.4s] h-3"></span>
              </div>
              <span class="text-[11px] font-black uppercase tracking-wider">
                {{ jarvis.state() === 'hablando' ? 'Hablando' : 'Escuchando' }}
              </span>
              @if (jarvis.state() === 'hablando') {
                <button
                  type="button"
                  (click)="jarvis.interruptSpeech()"
                  class="ml-1 px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-black cursor-pointer transition"
                  title="Interrumpir voz"
                >
                  <app-icon name="volume-x" [size]="10" />
                </button>
              }
            </div>
          } @else {
            <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span class="size-2 rounded-full bg-emerald-500"></span>
              <span>Listo para conversar</span>
            </div>
          }

          <!-- Voice Mute Toggle -->
          <button
            type="button"
            (click)="jarvis.toggleVoiceMute()"
            class="px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            [class]="
              jarvis.isVoiceMuted()
                ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-black'
            "
            [title]="jarvis.isVoiceMuted() ? 'Activar voz de Jarvis' : 'Silenciar voz de Jarvis'"
          >
            <app-icon [name]="jarvis.isVoiceMuted() ? 'volume-x' : 'volume-2'" [size]="14" />
            <span>{{ jarvis.isVoiceMuted() ? 'Mute' : 'Voz' }}</span>
          </button>

          <!-- Gemini Config Modal Button -->
          <button
            type="button"
            (click)="showConfigModal.set(true)"
            class="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Configurar clave Gemini API"
          >
            <app-icon name="settings" [size]="14" />
            <span class="hidden sm:inline">Configuración</span>
          </button>
        </div>
      </div>

      <!-- ACTIVE ERROR NOTICE (IF ANY) -->
      @if (jarvis.activeError()) {
        <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div class="flex items-center gap-2">
            <app-icon name="alert-circle" [size]="16" class="text-rose-600 shrink-0" />
            <span>{{ jarvis.activeError() }}</span>
          </div>
          <button
            type="button"
            (click)="jarvis.activeError.set(null)"
            class="text-rose-600 hover:text-rose-900 font-bold p-1 cursor-pointer flex items-center justify-center"
            aria-label="Cerrar aviso"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }

      <!-- MAIN WORKSPACE: BALANCED 2-COLUMN GRID (5 Cols Chat Console + 7 Cols Stage) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- LEFT COLUMN (5 Cols): CONVERSATION WORKBENCH -->
        <div class="lg:col-span-5 flex flex-col gap-3">
          
          <!-- QUICK ACTION BAR: Escenario Oficial (1 Clic) + Category Chips -->
          <div class="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <!-- Escenario oficial destacado con 1 clic -->
            <button
              type="button"
              (click)="sendQuickPrompt('Tengo 40 minutos, quiero comer algo rápido y buscar un regalo por menos de Bs 150.')"
              class="w-full text-left p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 border border-amber-300 text-slate-900 transition flex items-center justify-between gap-2.5 shadow-2xs group cursor-pointer active:scale-98"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div class="size-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-2xs">
                  <app-icon name="star" [size]="14" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span>Escenario Oficial Reto 4.11</span>
                    <span class="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">1 clic</span>
                  </p>
                  <p class="text-[11px] text-slate-600 truncate font-medium mt-0.5">
                    "40 min, comer rápido y regalo &lt; Bs 150"
                  </p>
                </div>
              </div>
              <span class="text-[10px] font-black text-amber-900 bg-white border border-amber-300 px-2 py-1 rounded-lg shrink-0 shadow-2xs group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                Ejecutar
              </span>
            </button>

            <!-- 4 Quick Suggestion Chips in Clean 2x2 Grid -->
            <div class="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                (click)="sendQuickPrompt('¿Qué promociones hay hoy en gastronomía?')"
                class="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition cursor-pointer text-left font-medium flex items-center gap-1.5 truncate"
              >
                <app-icon name="burger" [size]="13" class="text-amber-600 shrink-0" />
                <span class="truncate">Promos comida</span>
              </button>
              <button
                type="button"
                (click)="sendQuickPrompt('Muéstrame el plano esquemático del Paseo Aranjuez')"
                class="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition cursor-pointer text-left font-medium flex items-center gap-1.5 truncate"
              >
                <app-icon name="map" [size]="13" class="text-amber-600 shrink-0" />
                <span class="truncate">Plano del centro</span>
              </button>
              <button
                type="button"
                (click)="sendQuickPrompt('¿Cuáles son los eventos culturales de esta semana?')"
                class="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition cursor-pointer text-left font-medium flex items-center gap-1.5 truncate"
              >
                <app-icon name="calendar" [size]="13" class="text-amber-600 shrink-0" />
                <span class="truncate">Eventos culturales</span>
              </button>
              <button
                type="button"
                (click)="sendQuickPrompt('Quiero ver opciones de tecnología en el Piso 2')"
                class="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition cursor-pointer text-left font-medium flex items-center gap-1.5 truncate"
              >
                <app-icon name="headphones" [size]="13" class="text-amber-600 shrink-0" />
                <span class="truncate">Tecnología Piso 2</span>
              </button>
            </div>
          </div>

          <!-- CHAT STREAM & INPUT CONTAINER (Ergonomic Fixed Height with Internal Scrolling) -->
          <div class="rounded-2xl bg-white border border-slate-200/90 flex flex-col h-[520px] lg:h-[560px] overflow-hidden shadow-2xs">
            
            <!-- Chat Card Header -->
            <div class="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <div class="flex items-center gap-2">
                <div class="size-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[11px] shadow-2xs">
                  <app-icon name="robot" [size]="14" />
                </div>
                <span>Conversación en Vivo</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                  {{ jarvis.history().length }} turnos
                </span>
                @if (jarvis.history().length > 0) {
                  <button
                    type="button"
                    (click)="jarvis.clearHistory()"
                    class="text-[10px] text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Reiniciar chat"
                  >
                    <app-icon name="trash" [size]="12" />
                  </button>
                }
              </div>
            </div>

            <!-- Messages Stream Area -->
            <div #chatScrollContainer class="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 text-xs scroll-smooth">
              @if (jarvis.history().length === 0) {
                <div class="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                  <div class="size-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-2xs">
                    <app-icon name="robot" [size]="22" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="font-bold text-slate-800 text-xs sm:text-sm">Inicia una conversación con Jarvis</p>
                    <p class="text-[11px] text-slate-500">Pulsa el botón de micrófono o escribe una consulta abajo.</p>
                  </div>
                </div>
              }

              @for (turn of jarvis.history(); track turn.id) {
                <div
                  class="p-3.5 rounded-2xl space-y-1.5 leading-relaxed text-xs animate-in fade-in duration-150"
                  [class]="
                    turn.sender === 'visitante'
                      ? 'bg-amber-500 text-slate-950 font-medium ml-6 rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 mr-6 rounded-tl-xs shadow-2xs'
                  "
                >
                  <div class="flex items-center justify-between text-[10px] font-bold">
                    <span [class]="turn.sender === 'visitante' ? 'text-slate-950 font-black' : 'text-amber-900 font-black'">
                      {{ turn.sender === 'visitante' ? 'Tú (Visitante)' : 'Jarvis Paseo' }}
                    </span>
                    <span [class]="turn.sender === 'visitante' ? 'text-slate-950/70' : 'text-slate-400'">
                      {{ turn.timestamp | date:'shortTime' }}
                    </span>
                  </div>

                  <p class="whitespace-pre-line text-[12px] sm:text-[13px]">{{ turn.text }}</p>

                  @if (turn.sender === 'jarvis') {
                    <div class="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <button
                        type="button"
                        (click)="jarvis.speak(turn.text)"
                        class="text-amber-800 hover:text-amber-900 font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <app-icon name="volume-2" [size]="12" />
                        <span>Reescuchar</span>
                      </button>

                      @if (turn.visualItems && turn.visualItems.length > 0) {
                        <span class="text-emerald-700 font-bold flex items-center gap-1">
                          <app-icon name="check" [size]="12" />
                          <span>{{ turn.visualItems.length }} componente(s) en pantalla</span>
                        </span>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- LIVE TRANSCRIPTION INTERIM FEEDBACK -->
            @if (jarvis.liveTranscription()) {
              <div class="px-3.5 py-1.5 bg-amber-100/90 border-t border-amber-300 text-amber-950 text-[11px] italic font-medium flex items-center gap-2">
                <span class="size-2 rounded-full bg-amber-600 animate-ping"></span>
                <span class="truncate">Transcribiendo: "{{ jarvis.liveTranscription() }}"</span>
              </div>
            }

            <!-- ANCHORED INPUT BAR (Firmly Visible at bottom) -->
            <div class="p-2.5 bg-white border-t border-slate-200 shrink-0">
              <form (ngSubmit)="handleSendText()" class="flex items-center gap-2">
                <!-- Microphone Action Button -->
                <button
                  type="button"
                  (click)="handleMicClick()"
                  class="size-11 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                  [class]="
                    jarvis.state() === 'escuchando'
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                      : 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black'
                  "
                  [title]="jarvis.state() === 'escuchando' ? 'Detener micrófono' : 'Hablar por micrófono'"
                  aria-label="Hablar con Jarvis"
                >
                  @if (jarvis.state() === 'escuchando') {
                    <app-icon name="mic-off" [size]="20" />
                  } @else {
                    <app-icon name="mic" [size]="20" />
                  }
                </button>

                <!-- Text Input -->
                <input
                  type="text"
                  [(ngModel)]="userInput"
                  name="userInput"
                  placeholder="Pregunta a Jarvis (comer, regalos, plano...)"
                  class="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-400"
                  [disabled]="jarvis.state() === 'pensando'"
                />

                <!-- Send Button -->
                <button
                  type="submit"
                  [disabled]="!userInput.trim() || jarvis.state() === 'pensando'"
                  class="size-11 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95 shadow-xs"
                  aria-label="Enviar texto"
                >
                  <app-icon name="send" [size]="16" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN (7 Cols): LIVE VISUAL STAGE -->
        <div class="lg:col-span-7">
          <app-jarvis-stage
            [items]="jarvis.visualItems()"
            (clearAll)="jarvis.clearVisualItems()"
            (removeItem)="jarvis.removeVisualItem($event)"
            (toggleExpand)="jarvis.toggleExpandItem($event)"
            (requery)="handleRequery($event)"
            (businessDetail)="handleBusinessDetail($event)"
            (showLocationMap)="handleShowMap($event)"
            (promotionClaim)="handlePromotionClaim($event)"
            (itineraryStopSelected)="handleItineraryStop($event)"
            (eventLocationSelected)="handleEventLocation($event)"
            (triggerPrompt)="sendQuickPrompt($event)"
          />
        </div>
      </div>

      <!-- CONFIGURATION MODAL (GEMINI API KEY & MODEL) -->
      @if (showConfigModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <div class="size-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <app-icon name="settings" [size]="18" />
                </div>
                <h3 class="font-black text-base text-slate-900">Configuración de Jarvis Paseo</h3>
              </div>
              <button
                type="button"
                (click)="showConfigModal.set(false)"
                class="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition text-xs font-bold"
                aria-label="Cerrar modal de configuración"
              >
                <app-icon name="x" [size]="14" />
              </button>
            </div>

            <div class="space-y-3.5 text-xs">
              <p class="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                Por defecto, Jarvis funciona en <strong>Modo Demostración Local</strong>, ejecutando las mismas llamadas a funciones y validaciones de forma autónoma sin requerir conexión externa.
              </p>

              <div>
                <label class="block font-bold text-slate-800 mb-1">Google Gemini API Key (Opcional):</label>
                <input
                  type="password"
                  [(ngModel)]="tempApiKey"
                  placeholder="AIzaSy..."
                  class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:border-amber-500 focus:outline-none transition-all"
                />
                <p class="text-[11px] text-slate-500 mt-1">
                  Obtén tu clave gratuita que inicia con <code>AIzaSy...</code> en <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-amber-700 underline font-bold">Google AI Studio</a>.
                </p>
              </div>

              <div>
                <label class="block font-bold text-slate-800 mb-1">Modelo de Gemini:</label>
                <input
                  type="text"
                  [(ngModel)]="tempModel"
                  placeholder="gemini-2.5-flash"
                  class="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:border-amber-500 focus:outline-none transition-all"
                />
                <p class="text-[11px] text-slate-500 mt-1">
                  Configurado por variable de entorno. Modelos recomendados: <code>gemini-2.5-flash</code>, <code>gemini-1.5-flash</code>.
                </p>
              </div>
            </div>

            <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                (click)="showConfigModal.set(false)"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveConfiguration()"
                class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black transition cursor-pointer shadow-xs"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class JarvisLiveComponent {
  readonly jarvis = inject(JarvisGeminiService);
  readonly catalog = inject(JarvisCatalogService);
  private toast = inject(ToastService);

  @ViewChild('chatScrollContainer') private chatScroll?: ElementRef<HTMLDivElement>;

  userInput = '';
  showConfigModal = signal<boolean>(false);
  tempApiKey = '';
  tempModel = '';

  constructor() {
    this.tempApiKey = this.jarvis.apiKey();
    this.tempModel = this.jarvis.modelName();

    afterNextRender(() => {
      this.scrollToBottom();
    });
  }

  async handleMicClick(): Promise<void> {
    if (this.jarvis.state() === 'escuchando') {
      this.jarvis.stopListening();
      return;
    }

    if (this.jarvis.micPermissionGranted() !== true) {
      const ok = await this.jarvis.requestMicPermission();
      if (!ok) {
        this.toast.error('Se requiere permiso de micrófono para el reconocimiento de voz.');
        return;
      }
    }

    this.jarvis.startListening();
  }

  async handleSendText(): Promise<void> {
    const text = this.userInput.trim();
    if (!text) return;
    this.userInput = '';
    await this.jarvis.handleUserInput(text);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  async sendQuickPrompt(promptText: string): Promise<void> {
    await this.jarvis.handleUserInput(promptText);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  handleRequery(item: JarvisVisualItem): void {
    const prompt = `Cuéntame más sobre ${item.title}`;
    this.sendQuickPrompt(prompt);
  }

  handleBusinessDetail(business: Business): void {
    this.jarvis.showBusinessLocation(business.ubicacion.id);
    this.toast.info(`Mostrando ubicación de ${business.nombre} en el plano.`);
  }

  handleShowMap(locationId: string): void {
    this.jarvis.showBusinessLocation(locationId);
  }

  handlePromotionClaim(promo: Promotion): void {
    this.toast.success(`Promoción "${promo.titulo}" lista para canjear en mostrador.`);
    this.jarvis.speak(`Puedes presentar esta promoción directamente en ${promo.nombreComercio}.`);
  }

  handleItineraryStop(stop: any): void {
    const loc = this.catalog.getBusinessById(stop.businessId)?.ubicacion;
    if (loc) {
      this.jarvis.showBusinessLocation(loc.id);
    }
  }

  handleEventLocation(event: PaseoEvent): void {
    this.toast.info(`Evento en ${event.lugar} (${event.piso}).`);
    this.jarvis.speak(`El evento ${event.nombre} se realiza en ${event.lugar}, en el ${event.piso}.`);
  }

  saveConfiguration(): void {
    this.jarvis.setCredentials(this.tempApiKey, this.tempModel);
    this.showConfigModal.set(false);
    this.toast.success('Configuración guardada exitosamente.');
  }

  private scrollToBottom(): void {
    if (this.chatScroll?.nativeElement) {
      this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
    }
  }
}
