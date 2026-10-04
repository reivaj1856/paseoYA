import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoyaltyService, POINTS_PER_BOLIVIANO_DISCOUNT, MAX_DISCOUNT_PERCENTAGE } from '../../../../core/services/loyalty.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-club-fidelizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 pb-12">
      <!-- Header Banner VIP -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-amber-500/30">
        <div class="absolute -right-10 -bottom-10 size-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold tracking-wide">
              <app-icon name="gem" [size]="14" />
              <span>PASEOYA CLUB &middot; FIDELIZACIÓN</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gana Puntos & Ahorra en tus Compras
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Acumula puntos por cada compra, like o interacción en el Paseo. Canjea hasta un <strong class="text-amber-400">10% de descuento directo</strong> en tus productos al momento de retirar.
            </p>
          </div>

          <!-- Puntos Totales Badge -->
          <div class="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-44 shadow-inner">
            <span class="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">Tus Puntos Disponibles</span>
            <div class="flex items-center justify-center gap-1.5 my-1">
              <app-icon name="gem" [size]="24" class="text-amber-400 animate-pulse" />
              <span class="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                {{ loyalty.totalPoints() }}
              </span>
            </div>
            <span class="text-xs text-slate-300 font-semibold block">
              &asymp; Bs. {{ loyalty.availableBolivianos() }} en descuentos
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Action: Código de Referido -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Compartir mi Código -->
        <div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <app-icon name="users" [size]="20" />
            </div>
            <div>
              <h2 class="text-sm font-black text-slate-900">Invita Amigos y Gana +100 Puntos</h2>
              <p class="text-xs text-slate-500">Comparte tu código personal. Ambos reciben puntos de bono.</p>
            </div>
          </div>

          <!-- Código Display -->
          <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
            <span class="px-3 text-sm font-mono font-black text-slate-900 tracking-wider flex-1 truncate">
              {{ loyalty.referralCode() }}
            </span>
            <button
              type="button"
              (click)="copyReferralCode()"
              class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <app-icon name="copy" [size]="14" />
              <span>{{ copied() ? '¡Copiado!' : 'Copiar' }}</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Amigos invitados con tu código:</span>
            <span class="font-black text-slate-900 tabular-nums">{{ loyalty.totalReferrals() }}</span>
          </div>
        </div>

        <!-- Canjear Código de un Amigo -->
        <div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center shrink-0">
              <app-icon name="gift" [size]="20" />
            </div>
            <div>
              <h2 class="text-sm font-black text-slate-900">¿Tienes un Código de Referido?</h2>
              <p class="text-xs text-slate-500">Ingrésalo aquí y suma 100 puntos automáticamente.</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="text"
              [(ngModel)]="friendCode"
              placeholder="Ej: PASEO-123"
              class="flex-1 h-11 px-3.5 text-xs uppercase font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            <button
              type="button"
              (click)="applyCode()"
              class="h-11 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition active:scale-95 cursor-pointer shrink-0 shadow-xs"
            >
              Canjear
            </button>
          </div>

          <p class="text-[11px] text-slate-400">
            * Válido una vez por cliente. 10 puntos equivalen a Bs. 1 de descuento en tus compras.
          </p>
        </div>
      </div>

      <!-- Cómo Funciona el Descuento (Regla de Negocio del 10%) -->
      <div class="bg-slate-50 rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <app-icon name="sparkles" [size]="16" class="text-amber-600" />
          <span>Reglas de Ahorro y Fidelidad</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div class="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
              1
            </div>
            <h4 class="font-bold text-slate-900">Compras en el Paseo</h4>
            <p class="text-slate-500 text-[11px] leading-relaxed">
              Recibes <strong>1 punto por cada 1 Bs gastado</strong> en cualquier local del mall.
            </p>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div class="size-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-black">
              2
            </div>
            <h4 class="font-bold text-slate-900">Interacciones en App</h4>
            <p class="text-slate-500 text-[11px] leading-relaxed">
              Ganas <strong>5 a 10 puntos</strong> al dar me gusta a publicaciones, mirar reels o consultar a la IA.
            </p>
          </div>

          <div class="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div class="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              3
            </div>
            <h4 class="font-bold text-slate-900">Descuento Máximo 10%</h4>
            <p class="text-slate-500 text-[11px] leading-relaxed">
              En tu carrito o checkout puedes canjear tus puntos para descontar <strong>hasta el 10% del total</strong> de tu orden.
            </p>
          </div>
        </div>
      </div>

      <!-- Historial de Transacciones de Puntos -->
      <div class="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <app-icon name="clock" [size]="16" />
            <span>Historial de Movimientos</span>
          </h3>
          <span class="text-[11px] text-slate-400">Puntos registrados</span>
        </div>

        @if (loyalty.history().length === 0) {
          <p class="text-xs text-slate-400 py-4 text-center">No tienes movimientos de puntos aún.</p>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (tx of loyalty.history(); track tx.id) {
              <div class="py-3 flex items-center justify-between text-xs">
                <div class="space-y-0.5">
                  <p class="font-bold text-slate-900">{{ tx.descripcion }}</p>
                  <p class="text-[10px] text-slate-400">{{ tx.created_at | date:'short' }}</p>
                </div>
                <span
                  class="font-black text-sm tabular-nums px-2.5 py-1 rounded-xl"
                  [ngClass]="tx.puntos > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
                >
                  {{ tx.puntos > 0 ? '+' : '' }}{{ tx.puntos }} pts
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClubFidelizacionComponent {
  loyalty = inject(LoyaltyService);
  private toast = inject(ToastService);

  friendCode = '';
  copied = signal<boolean>(false);

  copyReferralCode(): void {
    const code = this.loyalty.referralCode();
    navigator.clipboard.writeText(code).then(() => {
      this.copied.set(true);
      this.toast.success('¡Código copiado al portapapeles!');
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  applyCode(): void {
    if (!this.friendCode) {
      this.toast.error('Por favor ingresa un código.');
      return;
    }
    const res = this.loyalty.applyReferralCode(this.friendCode);
    if (res.success) {
      this.friendCode = '';
    } else {
      this.toast.error(res.message);
    }
  }
}
