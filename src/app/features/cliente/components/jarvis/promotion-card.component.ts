import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promotion } from '../../../../core/models/jarvis-guide.models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-promotion-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white text-slate-900 rounded-2xl border border-amber-200/90 p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden group"
    >
      <div class="absolute -right-8 -top-8 size-24 bg-amber-50 rounded-full blur-xl pointer-events-none"></div>

      <!-- Top Badges -->
      <div class="flex items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs uppercase tracking-wider">
          {{ promotion().descuento }}
        </span>

        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
          [class]="
            promotion().disponible
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          "
        >
          {{ promotion().disponible ? 'Disponible' : 'Agotada' }}
        </span>
      </div>

      <!-- Content -->
      <div class="space-y-1">
        <h4 class="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
          {{ promotion().titulo }}
        </h4>
        <p class="text-xs font-bold text-amber-800">
          {{ promotion().nombreComercio }}
        </p>
      </div>

      <!-- Pricing if available -->
      @if (promotion().precioAhoraBs) {
        <div class="flex items-baseline gap-2 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70">
          <span class="text-xs text-slate-400 line-through">Bs. {{ promotion().precioAntesBs }}</span>
          <span class="text-base font-black text-amber-900">Bs. {{ promotion().precioAhoraBs }}</span>
          <span class="text-[10px] text-emerald-700 font-bold ml-auto bg-emerald-100/80 px-2 py-0.5 rounded-md">
            Ahorro activo
          </span>
        </div>
      }

      <!-- Conditions & Validity -->
      <div class="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div class="flex items-start gap-1.5">
          <span class="text-amber-700 font-bold shrink-0">• Condiciones:</span>
          <span>{{ promotion().condiciones }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-500 text-[10px]">
          <app-icon name="calendar" [size]="12" class="text-amber-600 shrink-0" />
          <span>Vigencia: {{ promotion().vigencia }}</span>
        </div>
      </div>

      <!-- Action -->
      <button
        type="button"
        (click)="claimClicked.emit(promotion())"
        class="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer text-center"
      >
        Aprovechar en tienda
      </button>
    </div>
  `,
})
export class PromotionCardComponent {
  readonly promotion = input.required<Promotion>();
  readonly claimClicked = output<Promotion>();
}
