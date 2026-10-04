import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Business } from '../../../../core/models/jarvis-guide.models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-business-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white text-slate-900 rounded-2xl border border-slate-200/90 hover:border-amber-400 shadow-2xs hover:shadow-md overflow-hidden transition-all duration-200 group flex flex-col"
    >
      <!-- Business Header & Image -->
      <div class="relative h-32 sm:h-36 overflow-hidden bg-slate-100">
        <img
          [src]="business().imagenUrl"
          [alt]="business().nombre"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>

        <!-- Floor & Local Badges -->
        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200 shadow-xs uppercase tracking-wider">
            {{ business().ubicacion.piso }}
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200">
            {{ business().ubicacion.local }}
          </span>
        </div>

        <!-- Average Ticket -->
        <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs">
          ~Bs. {{ business().ticketPromedioBs }}
        </div>

        <!-- Name & Category on bottom of image -->
        <div class="absolute bottom-2 left-3 right-3 truncate">
          <p class="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 drop-shadow-xs">{{ business().categoria }}</p>
          <h4 class="text-sm font-black text-white truncate drop-shadow-sm">{{ business().nombre }}</h4>
        </div>
      </div>

      <!-- Body Information -->
      <div class="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between bg-white">
        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {{ business().descripcionCorta }}
        </p>

        <!-- Location & Hours Details -->
        <div class="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div class="flex items-center gap-1.5 truncate">
            <app-icon name="map-pin" [size]="13" class="text-amber-600 shrink-0" />
            <span class="truncate font-medium text-slate-700">{{ business().ubicacion.sector }}</span>
          </div>

          @if (business().horario) {
            <div class="flex items-center gap-1.5">
              <app-icon name="clock" [size]="13" class="text-slate-500 shrink-0" />
              <span>Horario: <strong class="text-slate-800">{{ business().horario }}</strong></span>
            </div>
          }

          @if (business().ubicacion.referencia) {
            <div class="flex items-start gap-1.5 text-[10px] text-slate-500 italic">
              <span class="text-amber-700 font-bold shrink-0">Ref:</span>
              <span class="line-clamp-1">{{ business().ubicacion.referencia }}</span>
            </div>
          }
        </div>

        <!-- Interactive Action Buttons -->
        <div class="pt-1 flex items-center gap-2">
          <button
            type="button"
            (click)="detailsClicked.emit(business())"
            class="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer text-center"
          >
            Ver detalles
          </button>

          <button
            type="button"
            (click)="showMapClicked.emit(business().ubicacion.id)"
            class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
            title="Ver en el plano del Paseo"
            aria-label="Ver en el plano"
          >
            <app-icon name="map" [size]="16" />
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BusinessCardComponent {
  readonly business = input.required<Business>();
  readonly detailsClicked = output<Business>();
  readonly showMapClicked = output<string>();
}
