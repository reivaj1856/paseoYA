import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaseoEvent } from '../../../../core/models/jarvis-guide.models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white text-slate-900 rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 overflow-hidden relative group hover:border-amber-400"
    >
      <div class="absolute -right-8 -top-8 size-24 bg-amber-50 rounded-full blur-xl pointer-events-none"></div>

      <!-- Top Badges -->
      <div class="flex items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200 shadow-xs uppercase tracking-wider">
          {{ event().categoria }}
        </span>

        <span class="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <app-icon name="calendar" [size]="12" class="text-amber-700" />
          {{ event().fecha }}
        </span>
      </div>

      <!-- Content -->
      <div class="space-y-1.5">
        <h4 class="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
          {{ event().nombre }}
        </h4>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ event().descripcion }}
        </p>
      </div>

      <!-- Place & Time -->
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
        <div class="flex items-center gap-2 text-slate-900 font-bold">
          <app-icon name="map-pin" [size]="14" class="text-amber-600 shrink-0" />
          <span>{{ event().lugar }} &middot; {{ event().piso }}</span>
        </div>
        <div class="flex items-center gap-2 text-[11px] text-slate-500">
          <app-icon name="clock" [size]="13" class="text-slate-400 shrink-0" />
          <span>{{ event().hora }}</span>
        </div>
      </div>

      <!-- Action -->
      <button
        type="button"
        (click)="locateClicked.emit(event())"
        class="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
      >
        <app-icon name="compass" [size]="14" class="text-slate-950" />
        <span>Ver ubicación en el Paseo</span>
      </button>
    </div>
  `,
})
export class EventCardComponent {
  readonly event = input.required<PaseoEvent>();
  readonly locateClicked = output<PaseoEvent>();
}
