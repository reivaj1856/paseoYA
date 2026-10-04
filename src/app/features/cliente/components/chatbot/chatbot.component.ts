import { Component, ElementRef, ViewChild, inject, signal, afterNextRender, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../../core/services/chatbot.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { AiOrbIconComponent } from '../../../../shared/ui/ai-orb/ai-orb-icon.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, AiOrbIconComponent, IconComponent],
  template: `
    <!-- Chat Modal Window (Only launched via central IA button) -->
    @if (chatbot.isOpen()) {
      <div class="fixed inset-x-2 bottom-20 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-xl bg-slate-950/40 border border-white/10 flex items-center justify-center shrink-0">
              <app-ai-orb-icon [size]="30" [glow]="false" label="Asistente PaseoYa" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-bold text-sm tracking-tight text-white leading-tight">Asistente PaseoYa</h3>
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p class="text-[11px] text-slate-300">Paseo Aranjuez • Con Voz & IA</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <!-- Voice Output Toggle Button -->
            <button
              (click)="toggleSpeechOutput()"
              type="button"
              class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              [title]="speechOutputEnabled() ? 'Silenciar voz del asistente' : 'Activar voz del asistente'"
            >
              <app-icon [name]="speechOutputEnabled() ? 'volume-2' : 'volume-x'" [size]="18" />
            </button>

            <!-- Close Chat Button -->
            <button
              (click)="closeChat()"
              type="button"
              class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Cerrar chat"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-sm">
          @for (msg of chatbot.messages(); track msg.id) {
            @if (msg.sender === 'bot') {
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                  <app-icon name="robot" [size]="15" />
                </div>
                <div class="max-w-[85%] space-y-2">
                  <div class="bg-white p-3 rounded-2xl rounded-tl-sm shadow-xs border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                    {{ msg.text }}
                    
                    <!-- Voice Speak Button for this message -->
                    <div class="flex items-center justify-end pt-2 border-t border-slate-100 mt-2">
                      <button
                        (click)="speakText(msg.text)"
                        type="button"
                        class="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-medium px-2 py-0.5 rounded-lg hover:bg-amber-50 transition-colors"
                        title="Escuchar este mensaje en voz alta"
                      >
                        <app-icon name="volume-2" [size]="13" />
                        <span>Escuchar voz</span>
                      </button>
                    </div>
                  </div>

                  <!-- Attached Products if any -->
                  @if (msg.products && msg.products.length > 0) {
                    <div class="space-y-1.5 pt-1">
                      <div class="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-1">Opciones en tiendas:</div>
                      @for (p of msg.products; track p.id) {
                        <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-amber-400 transition-colors">
                          <img [src]="p.imagen_url" [alt]="p.nombre" class="w-11 h-11 object-cover rounded-lg bg-slate-100 shrink-0" />
                          <div class="min-w-0 flex-1">
                            <p class="font-bold text-xs text-slate-900 truncate">{{ p.nombre }}</p>
                            <p class="text-[11px] text-slate-500 truncate">{{ p.tienda?.nombre || 'Paseo Aranjuez' }} • {{ p.tienda?.piso || 'Tienda' }}</p>
                            <span class="text-xs font-black text-amber-700">Bs. {{ p.precio.toFixed(2) }}</span>
                          </div>
                          <button
                            (click)="addToCart(p)"
                            type="button"
                            class="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-transform shrink-0"
                            title="Añadir al carrito"
                          >
                            + Pedir
                          </button>
                        </div>
                      }
                    </div>
                  }

                  <!-- Attached Suggestion Chips -->
                  @if (msg.suggestions && msg.suggestions.length > 0) {
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      @for (sug of msg.suggestions; track sug) {
                        <button
                          (click)="sendQuickPrompt(sug)"
                          type="button"
                          class="text-[11px] bg-white hover:bg-amber-50 text-amber-900 font-medium px-2.5 py-1 rounded-full border border-amber-200 hover:border-amber-400 transition-colors text-left"
                        >
                          {{ sug }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- User Message -->
              <div class="flex items-end justify-end gap-2">
                <div class="max-w-[80%] bg-amber-600 text-white p-3 rounded-2xl rounded-br-sm shadow-xs text-xs sm:text-[13px] leading-relaxed">
                  {{ msg.text }}
                </div>
              </div>
            }
          }

          <!-- Typing Indicator -->
          @if (chatbot.isTyping()) {
            <div class="flex items-center gap-2 text-slate-400 text-xs pl-2">
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span class="text-[11px] italic">Escribiendo respuesta...</span>
            </div>
          }
        </div>

        <!-- Listening Bar Indicator (Visible when speech recognition is active) -->
        @if (isListening()) {
          <div class="bg-red-50 border-t border-red-200 px-3 py-2 flex items-center justify-between text-xs text-red-700 animate-pulse">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span class="font-medium">Escuchando tu voz... Habla ahora</span>
            </div>
            <button
              (click)="stopListening()"
              type="button"
              class="text-[11px] font-bold text-red-700 hover:text-red-900 underline"
            >
              Detener
            </button>
          </div>
        }

        <!-- Footer Input Form -->
        <div class="p-2.5 bg-white border-t border-slate-200">
          <form (ngSubmit)="handleSend()" class="flex items-center gap-2">
            <!-- Voice Dictation Button -->
            <button
              type="button"
              (click)="toggleVoiceInput()"
              [class]="isListening() ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
              class="p-2.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center justify-center border border-slate-200"
              [title]="isListening() ? 'Detener micrófono' : 'Hablar por micrófono'"
            >
              <app-icon [name]="isListening() ? 'mic-off' : 'mic'" [size]="18" />
            </button>

            <!-- Text Input -->
            <input
              type="text"
              [(ngModel)]="userInput"
              name="userInput"
              [placeholder]="isListening() ? 'Escuchando tu voz...' : 'Escribe o presiona el micrófono...'"
              class="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none transition-all"
              [disabled]="chatbot.isTyping()"
            />

            <!-- Send Button -->
            <button
              type="submit"
              [disabled]="!userInput.trim() || chatbot.isTyping()"
              class="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all active:scale-95 shrink-0"
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
            >
              <app-icon name="send" [size]="16" />
            </button>
          </form>
          <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
            <span>Paseo Aranjuez • Dictado y Audio</span>
            <span>Retiro con código QR</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class ChatbotComponent implements OnDestroy {
  readonly chatbot = inject(ChatbotService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  userInput = '';
  readonly isListening = signal<boolean>(false);
  readonly speechOutputEnabled = signal<boolean>(true);
  readonly isSpeaking = signal<boolean>(false);

  private recognition: any = null;

  constructor() {
    this.initSpeechRecognition();

    afterNextRender(() => {
      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.stopListening();
    this.stopSpeaking();
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      return;
    }

    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = 'es-BO';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening.set(true);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          this.userInput = currentText;
        }

        if (finalTranscript.trim()) {
          this.stopListening();
          setTimeout(() => {
            this.handleSend();
          }, 300);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening.set(false);
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition notice:', event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };
    } catch (e) {
      console.warn('Speech recognition could not be initialized:', e);
    }
  }

  toggleVoiceInput(): void {
    if (!this.recognition) {
      this.toastService.show('El dictado por voz no es compatible con este navegador', 'info');
      return;
    }

    if (this.isListening()) {
      this.stopListening();
    } else {
      this.stopSpeaking();
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
        this.isListening.set(false);
      }
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening()) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
    }
    this.isListening.set(false);
  }

  toggleSpeechOutput(): void {
    const newState = !this.speechOutputEnabled();
    this.speechOutputEnabled.set(newState);
    if (!newState) {
      this.stopSpeaking();
      this.toastService.show('Voz del asistente desactivada', 'info');
    } else {
      this.toastService.show('Voz del asistente activada', 'success');
    }
  }

  speakText(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.toastService.show('La síntesis de voz no está soportada en este navegador', 'info');
      return;
    }

    this.stopSpeaking();

    const clean = this.cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'es-BO';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang.startsWith('es') || v.lang.includes('es'));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
    }
  }

  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/•\s*/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/Bs\.\s*/g, 'Bolivianos ')
      .replace(/\n+/g, '. ')
      .trim();
  }

  closeChat(): void {
    this.stopListening();
    this.stopSpeaking();
    this.chatbot.setOpen(false);
  }

  async handleSend(): Promise<void> {
    const text = this.userInput.trim();
    if (!text) return;
    this.userInput = '';
    this.stopSpeaking();

    await this.chatbot.sendMessage(text);
    setTimeout(() => this.scrollToBottom(), 100);

    // If speech output is enabled, read the assistant's reply automatically
    if (this.speechOutputEnabled()) {
      const msgs = this.chatbot.messages();
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.sender === 'bot') {
        this.speakText(lastMsg.text);
      }
    }
  }

  async sendQuickPrompt(promptText: string): Promise<void> {
    this.stopSpeaking();
    await this.chatbot.sendMessage(promptText);
    setTimeout(() => this.scrollToBottom(), 100);

    if (this.speechOutputEnabled()) {
      const msgs = this.chatbot.messages();
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.sender === 'bot') {
        this.speakText(lastMsg.text);
      }
    }
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
    this.toastService.show(`"${product.nombre}" agregado al carrito`, 'success');
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
