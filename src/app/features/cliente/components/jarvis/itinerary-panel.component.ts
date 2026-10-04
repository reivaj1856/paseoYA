import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Itinerary, ItineraryStop } from '../../../../core/models/jarvis-guide.models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-itinerary-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white text-slate-900 rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div class="flex items-center gap-1.5 text-amber-700 text-xs font-black uppercase tracking-wider">
            <app-icon name="compass" [size]="15" />
            <span>Guía Viva &middot; Planificador de Recorrido</span>
          </div>
          <h3 class="text-base font-black text-slate-900 mt-0.5">{{ itinerary().titulo }}</h3>
        </div>

        <div class="text-right shrink-0">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
            <app-icon name="clock" [size]="13" class="text-amber-700" />
            {{ itinerary().tiempoTotalMinutos }} min total
          </span>
        </div>
      </div>

      <!-- Summary metrics: Time & Budget balance -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p class="text-[10px] text-slate-500 font-bold uppercase">Tiempo Disponible</p>
          <p class="text-sm font-black text-slate-900 mt-0.5">
            {{ itinerary().tiempoTotalMinutos }} / {{ itinerary().tiempoDisponibleMinutos }} min
          </p>
          <span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <app-icon name="check" [size]="11" />
            <span>Margen seguro</span>
          </span>
        </div>

        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p class="text-[10px] text-slate-500 font-bold uppercase">Presupuesto Sugerido</p>
          <p class="text-sm font-black text-amber-700 mt-0.5">
            Bs. {{ itinerary().presupuestoEstimadoBs }} / Bs. {{ itinerary().presupuestoDisponibleBs }}
          </p>
          <span class="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <app-icon name="check" [size]="11" />
            <span>Dentro del límite</span>
          </span>
        </div>
      </div>

      <!-- Recommendation Motive -->
      <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
        <app-icon name="sparkles" [size]="16" class="text-amber-600 shrink-0 mt-0.5" />
        <p class="font-medium">{{ itinerary().motivoResumen }}</p>
      </div>

      <!-- Step by step timeline -->
      <div class="space-y-2 pt-1">
        <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Orden recomendado de paradas:</p>

        @for (stop of itinerary().paradas; track stop.orden) {
          <div class="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400 transition-colors flex items-start gap-3 group">
            <!-- Step Number Badge -->
            <div class="size-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {{ stop.orden }}
            </div>

            <!-- Stop Details -->
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center justify-between gap-1">
                <h4 class="font-black text-xs text-slate-900 truncate">{{ stop.nombreLugar }}</h4>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 shrink-0">
                  {{ stop.piso }} &middot; {{ stop.local }}
                </span>
              </div>

              <p class="text-[11px] text-slate-600">{{ stop.actividad }}</p>

              <!-- Estimation & reason -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-0.5">
                <span class="text-amber-800 font-black">~Bs. {{ stop.costoEstimadoBs }}</span>
                <span>⏱️ {{ stop.tiempoEstimadoMinutos }} min aprox.</span>
                <span class="italic text-slate-500">{{ stop.motivoRecomendacion }}</span>
              </div>
            </div>

            <!-- Locate Action -->
            <button
              type="button"
              (click)="stopClicked.emit(stop)"
              class="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-amber-700 border border-slate-200 transition cursor-pointer shrink-0 self-center shadow-2xs"
              title="Ver ubicación"
              aria-label="Ubicar en plano"
            >
              <app-icon name="map-pin" [size]="14" />
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ItineraryPanelComponent {
  readonly itinerary = input.required<Itinerary>();
  readonly stopClicked = output<ItineraryStop>();
}
