import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JarvisVisualItem } from '../../../../core/models/jarvis-guide.models';
import { BusinessCardComponent } from './business-card.component';
import { PromotionCardComponent } from './promotion-card.component';
import { MapPanelComponent } from './map-panel.component';
import { ItineraryPanelComponent } from './itinerary-panel.component';
import { EventCardComponent } from './event-card.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-jarvis-stage',
  standalone: true,
  imports: [
    CommonModule,
    BusinessCardComponent,
    PromotionCardComponent,
    MapPanelComponent,
    ItineraryPanelComponent,
    EventCardComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Section Header -->
      <div class="flex items-center justify-between gap-2 px-1">
        <div class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-amber-500 animate-ping"></span>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-800">
            Escenario Visual Interactivo
          </h3>
          <span class="text-[10px] text-amber-900 font-black px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
            {{ items().length }} componente(s)
          </span>
        </div>

        @if (items().length > 0) {
          <button
            type="button"
            (click)="clearAll.emit()"
            class="text-[11px] text-slate-500 hover:text-rose-600 transition cursor-pointer flex items-center gap-1 font-medium"
          >
            <app-icon name="trash" [size]="12" />
            <span>Limpiar escenario</span>
          </button>
        }
      </div>

      <!-- Empty State: Balanced Studio Workspace Preview -->
      @if (items().length === 0) {
        <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-5 shadow-2xs min-h-[460px] flex flex-col items-center justify-center">
          <div class="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/80 shadow-2xs">
            <app-icon name="sparkles" [size]="28" />
          </div>
          <div class="space-y-1 max-w-md">
            <h4 class="text-sm sm:text-base font-black text-slate-900">Escenario Visual Interactivo Activo</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Mientras conversas con Jarvis, aquí se renderizan en tiempo real los componentes visuales interactivos de Paseo Aranjuez:
            </p>
          </div>

          <!-- Feature Cards Grid (4 Clickable Interactive Triggers) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg pt-1">
            <button
              type="button"
              (click)="triggerPrompt.emit('Muéstrame locales gastronómicos y destacados del Paseo')"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 active:scale-95 border border-slate-200/80 hover:border-amber-300 flex flex-col items-center gap-1.5 text-center transition cursor-pointer group"
            >
              <div class="size-8 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center font-bold transition">
                <app-icon name="store" [size]="16" />
              </div>
              <span class="text-[11px] font-bold text-slate-800 group-hover:text-amber-950">Comercios</span>
              <span class="text-[10px] text-slate-400">Ver locales</span>
            </button>

            <button
              type="button"
              (click)="triggerPrompt.emit('¿Qué promociones hay hoy en gastronomía?')"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 active:scale-95 border border-slate-200/80 hover:border-amber-300 flex flex-col items-center gap-1.5 text-center transition cursor-pointer group"
            >
              <div class="size-8 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center font-bold transition">
                <app-icon name="tag" [size]="16" />
              </div>
              <span class="text-[11px] font-bold text-slate-800 group-hover:text-amber-950">Promociones</span>
              <span class="text-[10px] text-slate-400">Descuentos</span>
            </button>

            <button
              type="button"
              (click)="triggerPrompt.emit('Muéstrame el plano esquemático del Paseo Aranjuez')"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 active:scale-95 border border-slate-200/80 hover:border-amber-300 flex flex-col items-center gap-1.5 text-center transition cursor-pointer group"
            >
              <div class="size-8 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center font-bold transition">
                <app-icon name="map" [size]="16" />
              </div>
              <span class="text-[11px] font-bold text-slate-800 group-hover:text-amber-950">Plano</span>
              <span class="text-[10px] text-slate-400">Por niveles</span>
            </button>

            <button
              type="button"
              (click)="triggerPrompt.emit('Tengo 40 minutos, quiero comer algo rápido y buscar un regalo por menos de Bs 150')"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 active:scale-95 border border-slate-200/80 hover:border-amber-300 flex flex-col items-center gap-1.5 text-center transition cursor-pointer group"
            >
              <div class="size-8 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center font-bold transition">
                <app-icon name="compass" [size]="16" />
              </div>
              <span class="text-[11px] font-bold text-slate-800 group-hover:text-amber-950">Ruta Inteligente</span>
              <span class="text-[10px] text-slate-400">Tiempo y costo</span>
            </button>
          </div>

          <button
            type="button"
            (click)="triggerPrompt.emit('Tengo 40 minutos, quiero comer algo rápido y buscar un regalo por menos de Bs 150')"
            class="text-[11px] text-amber-900 bg-amber-50 hover:bg-amber-100 active:scale-98 border border-amber-300 px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 justify-center transition cursor-pointer shadow-2xs"
          >
            <app-icon name="sparkles" [size]="14" class="text-amber-600 shrink-0" />
            <span><strong>Prueba 1-clic:</strong> Ejecutar <em>"Escenario Oficial Reto 4.11 (40 min, comer rápido y regalo < Bs 150)"</em></span>
          </button>
        </div>
      }

      <!-- Grid of Visual Items -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of items(); track item.id) {
          <div
            class="relative rounded-2xl transition-all duration-200"
            [class.col-span-full]="item.type === 'map-panel' || item.type === 'itinerary-panel' || item.expanded"
          >
            <!-- Card Action Control Bar -->
            <div class="flex items-center justify-between mb-1.5 px-2 text-[11px] text-slate-500">
              <span class="font-extrabold uppercase tracking-wider text-[10px] text-slate-700 truncate">
                {{ item.title }}
              </span>

              <div class="flex items-center gap-1">
                <!-- Re-query button -->
                <button
                  type="button"
                  (click)="requery.emit(item)"
                  class="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-amber-800 border border-slate-200 transition cursor-pointer text-[10px] font-bold shadow-2xs"
                  title="Preguntar a Jarvis más sobre esto"
                >
                  Consultar más
                </button>

                <!-- Expand button -->
                <button
                  type="button"
                  (click)="toggleExpand.emit(item.id)"
                  class="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer shadow-2xs"
                  [title]="item.expanded ? 'Reducir' : 'Expandir'"
                >
                  <app-icon [name]="item.expanded ? 'minimize' : 'maximize'" [size]="12" />
                </button>

                <!-- Close button -->
                <button
                  type="button"
                  (click)="removeItem.emit(item.id)"
                  class="p-1 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition cursor-pointer shadow-2xs"
                  title="Cerrar esta tarjeta"
                >
                  <app-icon name="x" [size]="12" />
                </button>
              </div>
            </div>

            <!-- Dynamic Component Dispatcher -->
            @switch (item.type) {
              @case ('business-card') {
                <app-business-card
                  [business]="item.data"
                  (detailsClicked)="businessDetail.emit($event)"
                  (showMapClicked)="showLocationMap.emit($event)"
                />
              }
              @case ('promotion-card') {
                <app-promotion-card
                  [promotion]="item.data"
                  (claimClicked)="promotionClaim.emit($event)"
                />
              }
              @case ('map-panel') {
                <app-map-panel
                  [locations]="item.data.locations"
                  [initialFloor]="item.data.initialFloor || 'Piso 1'"
                />
              }
              @case ('itinerary-panel') {
                <app-itinerary-panel
                  [itinerary]="item.data"
                  (stopClicked)="itineraryStopSelected.emit($event)"
                />
              }
              @case ('event-card') {
                <app-event-card
                  [event]="item.data"
                  (locateClicked)="eventLocationSelected.emit($event)"
                />
              }
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class JarvisStageComponent {
  readonly items = input.required<JarvisVisualItem[]>();
  readonly clearAll = output<void>();
  readonly removeItem = output<string>();
  readonly toggleExpand = output<string>();
  readonly requery = output<JarvisVisualItem>();
  readonly businessDetail = output<any>();
  readonly showLocationMap = output<string>();
  readonly promotionClaim = output<any>();
  readonly itineraryStopSelected = output<any>();
  readonly eventLocationSelected = output<any>();
  readonly triggerPrompt = output<string>();
}
