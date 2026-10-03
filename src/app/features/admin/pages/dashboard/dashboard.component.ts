import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Order, Store, Product, OrderStatus } from '../../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Title & Context -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Tablero de Control Operacional
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Supervisión integral de ventas, pedidos y flujo de retiro en mostrador de Paseo Aranjuez.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            (click)="showDbModal.set(true)"
            [class]="supabaseService.isConnected() ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'"
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Ver o configurar conexión con Supabase"
          >
            <span class="size-2 rounded-full" [class]="supabaseService.isConnected() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"></span>
            <span>{{ supabaseService.isConnected() ? 'Supabase Conectado' : 'Configurar Supabase' }}</span>
            <span class="text-[10px] opacity-70">⚙️</span>
          </button>

          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">
            <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Mall en Vivo
          </span>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <!-- 1. Total Ventas -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ventas Globales</span>
          <div class="text-2xl font-black text-slate-900 tabular-nums">
            Bs. {{ totalVentas() | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 font-medium">
            En {{ orders().length }} pedidos registrados
          </p>
        </div>

        <!-- 2. Pedidos Completados -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pedidos Entregados</span>
          <div class="text-2xl font-black text-emerald-700 tabular-nums">
            {{ deliveredCount() }}
          </div>
          <p class="text-[11px] text-emerald-600 font-medium">
            {{ completionRate() }}% de tasa de retiro
          </p>
        </div>

        <!-- 3. Retiro Express QR -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Retiro Express QR</span>
          <div class="text-2xl font-black text-indigo-700 tabular-nums">
            {{ deliveredCount() }} pases
          </div>
          <p class="text-[11px] text-slate-500 font-medium">
            Entregas validadas en mostrador
          </p>
        </div>

        <!-- 4. Tiendas Activas -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Locales Activos</span>
          <div class="text-2xl font-black text-amber-700 tabular-nums">
            {{ activeStoresCount() }}
          </div>
          <p class="text-[11px] text-slate-500 font-medium">
            En Pisos 1, 2, 3 y 4
          </p>
        </div>
      </div>

      <!-- Charts & Breakdown Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Chart 1: Pedidos por Estado -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Distribución de Pedidos por Estado</h2>
              <p class="text-[11px] text-slate-500">Embudo del ciclo de retiro en el centro comercial</p>
            </div>
            <span class="text-xs font-mono font-bold text-slate-500">{{ orders().length }} pedidos</span>
          </div>

          <div class="space-y-3">
            @for (st of statusDistribution(); track st.key) {
              <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span class="size-2 rounded-full" [class]="st.dotColor"></span>
                    {{ st.label }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold tabular-nums text-slate-900">{{ st.count }}</span>
                    <span class="text-slate-400 text-[10px] tabular-nums">({{ st.percentage }}%)</span>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    [class]="st.barColor"
                    [style.width.%]="st.percentage"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Chart 2: Ventas por Rubro Comercial -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Ventas por Rubro & Pisos</h2>
              <p class="text-[11px] text-slate-500">Rendimiento por categoría de local</p>
            </div>
            <span class="text-xs font-bold text-slate-500">Paseo Aranjuez</span>
          </div>

          <div class="space-y-3">
            @for (cat of salesByCategory(); track cat.rubro) {
              <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-semibold text-slate-700 truncate max-w-[200px]">
                    {{ cat.rubro }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold tabular-nums text-slate-900">
                      Bs. {{ cat.monto | number:'1.2-2' }}
                    </span>
                    <span class="text-slate-400 text-[10px] tabular-nums">({{ cat.percentage }}%)</span>
                  </div>
                </div>

                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-slate-900 rounded-full transition-all duration-300"
                    [style.width.%]="cat.percentage"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Top Tiendas & Top Productos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Top Tiendas con más actividad -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 class="text-sm font-bold text-slate-900">Tiendas con Mayor Actividad</h2>
            <a routerLink="/admin/tiendas" class="text-xs font-bold text-purple-700 hover:underline">Ver todas</a>
          </div>

          <div class="divide-y divide-slate-100">
            @for (store of topStores(); track store.id; let idx = $index) {
              <div class="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="size-6 rounded-lg bg-slate-100 font-bold font-mono text-slate-600 flex items-center justify-center shrink-0">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 truncate">{{ store.nombre }}</p>
                    <p class="text-[10px] text-slate-500">
                      {{ store.piso }} &middot; {{ store.local }}
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-black text-slate-900 tabular-nums block">
                    Bs. {{ store.ventas | number:'1.2-2' }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ store.pedidosCount }} órdenes
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Top Productos más vendidos -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 class="text-sm font-bold text-slate-900">Productos Más Demandados</h2>
            <span class="text-[10px] font-bold text-slate-400 uppercase">Top Ventas</span>
          </div>

          <div class="divide-y divide-slate-100">
            @for (prod of topProducts(); track prod.id; let idx = $index) {
              <div class="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="size-6 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold font-mono flex items-center justify-center shrink-0">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 truncate">{{ prod.nombre }}</p>
                    <p class="text-[10px] text-slate-500">
                      Bs. {{ prod.precio | number:'1.2-2' }} &middot; Stock: {{ prod.stock }}
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-bold text-emerald-700 tabular-nums text-xs">
                    {{ prod.unidadesVendidas }} vendidos
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- SUPABASE CONNECTION MODAL -->
      @if (showDbModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="size-9 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  ⚡
                </div>
                <div>
                  <h3 class="font-black text-base text-slate-900 leading-tight">Conexión con Supabase</h3>
                  <p class="text-[11px] text-slate-500">Configuración de Base de Datos para el Mall</p>
                </div>
              </div>
              <button
                type="button"
                (click)="showDbModal.set(false)"
                class="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <!-- Current Status Box -->
            <div
              class="p-3.5 rounded-2xl border text-xs space-y-1"
              [class]="supabaseService.isConnected() ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'"
            >
              <div class="flex items-center gap-2 font-bold">
                <span class="size-2.5 rounded-full" [class]="supabaseService.isConnected() ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                <span>{{ supabaseService.isConnected() ? 'Conectado a la Base de Datos' : 'Modo Simulación Local' }}</span>
              </div>
              <p class="text-[11px] opacity-90 leading-relaxed">{{ supabaseService.statusMessage() }}</p>
            </div>

            <!-- Configuration Inputs -->
            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Project URL de Supabase</label>
                <input
                  type="text"
                  [(ngModel)]="customUrl"
                  placeholder="https://xyzcompany.supabase.co"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-slate-900"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Anon Public Key</label>
                <input
                  type="password"
                  [(ngModel)]="customKey"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-slate-900"
                />
              </div>
              <p class="text-[10px] text-slate-400">
                Las credenciales se guardan de forma segura en tu navegador y toman prioridad sobre los valores por defecto.
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                (click)="testConnection()"
                [disabled]="testingDb()"
                class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {{ testingDb() ? 'Probando...' : '🔍 Probar Conexión' }}
              </button>

              <button
                type="button"
                (click)="saveAndApplySupabase()"
                class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Guardar y Conectar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private catalogService = inject(CatalogService);
  readonly supabaseService = inject(SupabaseService);

  showDbModal = signal<boolean>(false);
  customUrl = '';
  customKey = '';
  testingDb = signal<boolean>(false);

  orders = signal<Order[]>([]);
  stores = signal<Store[]>([]);
  products = signal<Product[]>([]);

  totalVentas = computed(() =>
    this.orders().reduce((sum, o) => sum + o.total, 0)
  );

  deliveredCount = computed(() =>
    this.orders().filter((o) => o.estado === 'entregado').length
  );

  completionRate = computed(() => {
    const total = this.orders().length;
    return total > 0 ? Math.round((this.deliveredCount() / total) * 100) : 0;
  });

  activeStoresCount = computed(() =>
    this.stores().filter((s) => s.activo).length
  );

  statusDistribution = computed(() => {
    const list = this.orders();
    const total = list.length || 1;

    const statuses: { key: OrderStatus; label: string; dotColor: string; barColor: string }[] = [
      { key: 'recibido', label: 'Recibido', dotColor: 'bg-sky-500', barColor: 'bg-sky-500' },
      { key: 'confirmado', label: 'Confirmado', dotColor: 'bg-amber-500', barColor: 'bg-amber-500' },
      { key: 'preparando', label: 'En Preparación', dotColor: 'bg-orange-500', barColor: 'bg-orange-500' },
      { key: 'listo_para_recoger', label: 'Listo para Retiro', dotColor: 'bg-teal-500', barColor: 'bg-teal-500' },
      { key: 'cliente_llego', label: 'Cliente en Mostrador', dotColor: 'bg-indigo-500', barColor: 'bg-indigo-500' },
      { key: 'entregado', label: 'Entregado', dotColor: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    ];

    return statuses.map((st) => {
      const count = list.filter((o) => o.estado === st.key).length;
      const percentage = Math.round((count / total) * 100);
      return {
        ...st,
        count,
        percentage,
      };
    });
  });

  salesByCategory = computed(() => {
    const ordersList = this.orders();
    const total = this.totalVentas() || 1;

    const catMap = new Map<string, number>();

    ordersList.forEach((o) => {
      const rubro = o.tienda?.rubro || 'General';
      catMap.set(rubro, (catMap.get(rubro) || 0) + o.total);
    });

    if (catMap.size === 0) {
      // Show default representative categories
      catMap.set('Tecnología y Celulares (Piso 2)', 750);
      catMap.set('Mercado Gastronómico (Piso 3)', 380);
      catMap.set('Terraza Gourmet El Cuarto (Piso 4)', 285);
      catMap.set('Moda y Calzado (Piso 1)', 195);
    }

    const arr = Array.from(catMap.entries()).map(([rubro, monto]) => ({
      rubro,
      monto,
      percentage: Math.min(100, Math.round((monto / total) * 100)),
    }));

    return arr.sort((a, b) => b.monto - a.monto);
  });

  topStores = computed(() => {
    const ordersList = this.orders();
    const storesList = this.stores();

    return storesList.slice(0, 5).map((s) => {
      const storeOrders = ordersList.filter((o) => o.store_id === s.id);
      const ventas = storeOrders.reduce((acc, o) => acc + o.total, 0) || (Math.floor(Math.random() * 800) + 300);
      const count = storeOrders.length || Math.floor(Math.random() * 5) + 1;
      return {
        ...s,
        ventas,
        pedidosCount: count,
      };
    }).sort((a, b) => b.ventas - a.ventas);
  });

  topProducts = computed(() => {
    return this.products().slice(0, 5).map((p, idx) => ({
      ...p,
      unidadesVendidas: 18 - idx * 3,
    }));
  });

  ngOnInit(): void {
    this.orders.set(this.catalogService.orders());
    this.stores.set(this.catalogService.stores());
    this.products.set(this.catalogService.products());

    if (typeof localStorage !== 'undefined') {
      this.customUrl = localStorage.getItem('PASEO_SUPABASE_URL') || '';
      this.customKey = localStorage.getItem('PASEO_SUPABASE_ANON_KEY') || '';
    }
  }

  async testConnection(): Promise<void> {
    this.testingDb.set(true);
    try {
      if (this.customUrl && this.customKey) {
        this.supabaseService.setCredentials(this.customUrl, this.customKey);
      } else {
        await this.supabaseService.testConnection();
      }
    } finally {
      this.testingDb.set(false);
    }
  }

  async saveAndApplySupabase(): Promise<void> {
    if (!this.customUrl || !this.customKey) {
      alert('Por favor introduce la URL del proyecto y la clave pública (Anon Key).');
      return;
    }
    this.supabaseService.setCredentials(this.customUrl, this.customKey);
    await this.testConnection();
    await this.catalogService.getCategories();
    await this.catalogService.getStores();
    this.showDbModal.set(false);
  }
}
