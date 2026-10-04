import { Component, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaseoLocation } from '../../../../core/models/jarvis-guide.models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-map-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white text-slate-900 rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
            <app-icon name="map" [size]="16" />
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-black text-slate-900">Plano de Navegación del Paseo</h4>
            <p class="text-[10px] text-amber-800 font-bold">Plano esquemático interactivo • Datos de demostración</p>
          </div>
        </div>

        <!-- Floor Switcher -->
        <div class="flex items-center gap-1 bg-amber-50/80 p-1 rounded-xl border border-amber-200 text-[10px] font-bold">
          @for (floor of floors; track floor) {
            <button
              type="button"
              (click)="selectedFloor.set(floor)"
              class="px-2.5 py-1 rounded-lg transition cursor-pointer"
              [class]="selectedFloor() === floor ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            >
              {{ floor }}
            </button>
          }
        </div>
      </div>

      <!-- Schematic Map Canvas (Vectorial Blueprint - Light Modern Style) -->
      <div class="relative w-full h-56 sm:h-64 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden select-none">
        <!-- Blueprint Grid Pattern -->
        <div
          class="absolute inset-0 opacity-40 pointer-events-none"
          style="background-image: radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px); background-size: 20px 20px;"
        ></div>

        <!-- Mall Floor Outlines (SVG) -->
        <svg class="absolute inset-0 w-full h-full text-slate-300" viewBox="0 0 100 100" preserveAspectRatio="none">
          <!-- Central Atrium & Corridors -->
          <rect x="15" y="15" width="70" height="70" rx="8" fill="white" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2" />
          <circle cx="50" cy="50" r="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
          
          <!-- Escalators / Elevators Icon -->
          <rect x="46" y="20" width="8" height="6" rx="1" fill="#fef3c7" stroke="#d97706" stroke-width="0.4" />
          <text x="50" y="24" font-size="2.5" fill="#92400e" text-anchor="middle" font-weight="bold">ASCENSORES</text>

          <!-- North / South Wings -->
          <text x="50" y="10" font-size="3" fill="#64748b" text-anchor="middle" font-weight="bold">ALA NORTE (Av. América)</text>
          <text x="50" y="94" font-size="3" fill="#64748b" text-anchor="middle" font-weight="bold">ALA SUR (Pantaleón Dalence)</text>
        </svg>

        <!-- Dynamic Markers for this Floor -->
        @for (loc of filteredLocations(); track loc.id) {
          <div
            class="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 transition-transform hover:scale-125"
            [style.left.%]="loc.mapCoords.x"
            [style.top.%]="loc.mapCoords.y"
            (click)="activeLocation.set(loc)"
          >
            <!-- Pulsing Pin -->
            <div class="relative flex items-center justify-center">
              <span class="absolute size-6 rounded-full bg-amber-400/40 animate-ping"></span>
              <div
                class="size-6 rounded-full border-2 flex items-center justify-center shadow-md text-[10px] font-black"
                [class]="
                  activeLocation()?.id === loc.id
                    ? 'bg-amber-500 border-amber-800 text-slate-950 scale-110 shadow-lg'
                    : 'bg-amber-600 border-white text-white'
                "
              >
                <app-icon name="map-pin" [size]="12" />
              </div>
            </div>

            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap bg-amber-950 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-amber-800 pointer-events-none">
              {{ loc.local }} • {{ loc.sector }}
            </div>
          </div>
        }

        <!-- Active Floor Label in corner -->
        <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-white/95 text-[10px] font-black text-slate-800 border border-slate-200 shadow-2xs">
          NIVEL ACTIVO: {{ selectedFloor() | uppercase }}
        </div>
      </div>

      <!-- Active Location Detail Card -->
      @if (activeLocation(); as loc) {
        <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div class="space-y-0.5 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-slate-900">{{ loc.local }}</span>
              <span class="text-[10px] text-amber-800 font-bold">({{ loc.piso }})</span>
            </div>
            <p class="text-[11px] text-slate-700 truncate font-medium">{{ loc.sector }}</p>
            <p class="text-[10px] text-slate-500 italic">Ref: {{ loc.referencia }}</p>
          </div>
          <span class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black shadow-xs shrink-0">
            Seleccionado
          </span>
        </div>
      }
    </div>
  `,
})
export class MapPanelComponent {
  readonly locations = input<PaseoLocation[]>([]);
  readonly initialFloor = input<string>('Piso 1');

  readonly floors = ['Piso 1', 'Piso 2', 'Piso 3', 'Piso 4'];
  readonly selectedFloor = signal<string>('Piso 1');
  readonly activeLocation = signal<PaseoLocation | null>(null);

  constructor() {
    if (this.initialFloor()) {
      this.selectedFloor.set(this.initialFloor());
    }
  }

  readonly filteredLocations = computed(() => {
    const list = this.locations() || [];
    return list.filter((l) => l.piso === this.selectedFloor());
  });
}
