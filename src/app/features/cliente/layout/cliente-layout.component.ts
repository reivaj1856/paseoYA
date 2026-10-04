import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';
import { ChatbotComponent } from '../components/chatbot/chatbot.component';
import { AiOrbIconComponent } from '../../../shared/ui/ai-orb/ai-orb-icon.component';
import { PwaInstallModalComponent } from '../../../shared/ui/pwa-install-modal/pwa-install-modal.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { LoyaltyService } from '../../../core/services/loyalty.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    ChatbotComponent,
    PwaInstallModalComponent,
    IconComponent,
  ],
  template: `
    <div class="min-h-dvh flex flex-col bg-slate-100 text-slate-900 pb-20 md:pb-8 select-none">
      <app-toast />
      <app-chatbot />

      <!-- PWA Smart Install Banner (Mobile Only) -->
      @if (pwaInstall.isMobile() && showPwaInstallBanner() && !pwaInstall.isInstalled()) {
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs shadow-md border-b border-indigo-900/50 safe-top">
          <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div class="size-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                PY
              </div>
              <div class="truncate">
                <span class="font-bold text-amber-400">Instala PaseoYa PWA</span>
                <span class="text-slate-300 text-[11px] ml-2 hidden sm:inline">Acceso directo en Android y retiros QR sin conexión</span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                (click)="triggerInstallPrompt()"
                type="button"
                class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition active:scale-95 shadow-xs cursor-pointer"
              >
                Instalar App
              </button>
              <button
                (click)="dismissPwaBanner()"
                type="button"
                class="text-slate-400 hover:text-white p-1 text-xs cursor-pointer flex items-center justify-center"
                aria-label="Cerrar banner"
              >
                <app-icon name="x" [size]="16" />
              </button>
            </div>
          </div>
        </div>
      }

      <!-- RESPONSIVE HEADER: MOBILE APP BAR + EXPANDED TABLET/DESKTOP NAVBAR -->
      <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs safe-top">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <!-- Left: Hamburger Button (Mobile) & Brand Logo -->
          <div class="flex items-center gap-3">
            <!-- Sidebar Hamburger (Mobile / Tablet drawer) -->
            <button
              type="button"
              (click)="toggleSidePanel()"
              class="btn-press size-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.95] text-slate-800 flex items-center justify-center shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              title="Abrir menú de opciones del Paseo"
              aria-label="Abrir panel lateral"
            >
              <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Brand Logo with Official Paseo Aranjuez Image -->
            <a routerLink="/cliente" class="flex items-center group">
              <img
                src="/logo-negro.png"
                alt="Paseo Aranjuez Logo"
                class="h-9 w-auto max-w-[130px] sm:max-w-[160px] object-contain group-hover:scale-105 transition-transform"
              />
            </a>
          </div>

          <!-- DESKTOP & TABLET HORIZONTAL NAVIGATION LINKS (Visible on md+ screens) -->
          <nav class="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-bold text-slate-600">
            <a
              routerLink="/cliente"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 whitespace-nowrap"
            >
              Inicio
            </a>

            <a
              routerLink="/cliente/productos"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="shopping-bag" [size]="16" />
              <span>Todos los Productos</span>
            </a>

            <a
              routerLink="/cliente/tiendas"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="store" [size]="16" />
              <span>Tiendas & Pisos</span>
            </a>

            <a
              routerLink="/cliente/reels"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="film" [size]="16" />
              <span>Reels</span>
            </a>

            <a
              routerLink="/cliente/buscar"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="search" [size]="16" />
              <span>Buscador</span>
            </a>

            <a
              routerLink="/cliente/pedidos"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="package" [size]="16" />
              <span>Mis Pedidos</span>
            </a>

            <a
              routerLink="/cliente/club"
              routerLinkActive="bg-slate-900 text-white shadow-xs"
              class="btn-press px-3 py-2 rounded-xl hover:bg-slate-100 text-amber-700 font-extrabold whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="gem" [size]="16" class="text-amber-500" />
              <span>Club & Puntos</span>
            </a>

            <a
              routerLink="/cliente/jarvis"
              routerLinkActive="bg-amber-500 text-slate-950 font-black shadow-xs"
              class="btn-press px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold whitespace-nowrap flex items-center gap-1.5"
            >
              <app-icon name="sparkles" [size]="15" class="text-amber-600" />
              <span>Jarvis Paseo AI</span>
            </a>
          </nav>

          <!-- Right: Actions & Role / Cart -->
          <div class="flex items-center gap-2">
            <!-- Install App Quick Button (Header - Mobile Only) -->
            @if (pwaInstall.isMobile() && !pwaInstall.isInstalled()) {
              <button
                type="button"
                (click)="triggerInstallPrompt()"
                class="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs cursor-pointer inner-border-subtle"
                title="Instalar PaseoYa en tu teléfono"
              >
                <app-icon name="smartphone" [size]="16" />
                <span>Instalar App</span>
              </button>
            }



            <!-- Points Quick Pill -->
            <a
              routerLink="/cliente/club"
              class="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 text-xs font-black transition cursor-pointer"
              title="Tus puntos de fidelización"
            >
              <app-icon name="gem" [size]="14" class="text-amber-600" />
              <span class="tabular-nums">{{ loyalty.totalPoints() }} pts</span>
            </a>

            <!-- Cart Quick Icon with item count -->
            <a
              routerLink="/cliente/carrito"
              class="relative size-9 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-700 transition"
              title="Ver mi carrito"
              aria-label="Ver carrito"
            >
              <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              @if (cartService.totalItems() > 0) {
                <span class="absolute -top-1 -right-1 size-5 bg-amber-600 text-white rounded-full text-xs font-black flex items-center justify-center tabular-nums shadow-xs">
                  {{ cartService.totalItems() }}
                </span>
              }
            </a>

            <!-- User Avatar / Role Switch -->
            @if (authService.isAuthenticated()) {
              <div class="flex items-center gap-2">
                <div class="text-right hidden xl:block">
                  <p class="text-xs font-bold text-slate-900 leading-tight">{{ authService.profile()?.nombre_completo || 'Usuario' }}</p>
                  <p class="text-[10px] text-slate-500 capitalize">{{ authService.role() }}</p>
                </div>
                <button
                  type="button"
                  (click)="authService.logout()"
                  class="size-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:bg-slate-800 transition"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  {{ (authService.profile()?.nombre_completo || 'U').charAt(0).toUpperCase() }}
                </button>
              </div>
            } @else {
              <a
                routerLink="/auth/login"
                class="h-9 px-4 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-800 transition shadow-xs"
              >
                Entrar
              </a>
            }
          </div>
        </div>
      </header>

      <!-- SLIDE-OUT SIDE PANEL / DRAWER (PANEL LATERAL TIPO FACEBOOK) -->
      @if (isSidePanelOpen()) {
        <!-- Backdrop Blur Overlay -->
        <div
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          (click)="closeSidePanel()"
        >
          <!-- Drawer Container (White Modern Style) -->
          <aside
            id="cliente-side-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación de PaseoYa"
            class="w-84 max-w-[88vw] h-full bg-white text-slate-800 flex flex-col justify-between shadow-[0_0_80px_rgba(15,23,42,0.22)] border-r border-slate-200/80 overflow-y-auto animate-in slide-in-from-left duration-200 select-none"
            (click)="$event.stopPropagation()"
          >
            <!-- Top Profile & Brand Header -->
            <div class="p-5 border-b border-slate-100 space-y-4 bg-white">
              <div class="flex items-center justify-between">
                <!-- Brand header -->
                <div class="flex items-center">
                  <img
                    src="/logo-negro.png"
                    alt="Paseo Aranjuez Logo"
                    class="h-9 w-auto max-w-[140px] object-contain"
                  />
                </div>

                <button
                  type="button"
                  (click)="closeSidePanel()"
                  class="size-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 flex items-center justify-center transition cursor-pointer text-xs"
                  aria-label="Cerrar menú"
                >
                  <app-icon name="x" [size]="18" />
                </button>
              </div>

              <!-- Profile Row -->
              <div class="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition flex items-center justify-between gap-2 cursor-pointer">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="relative shrink-0">
                    <div class="size-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-amber-500 text-white font-extrabold text-base flex items-center justify-center shadow-sm ring-1 ring-inset ring-black/5">
                      {{ (authService.profile()?.nombre_completo || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <span class="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>
                  <div class="truncate">
                    <p class="text-sm font-extrabold text-slate-900 truncate leading-tight tracking-tight">
                      {{ authService.profile()?.nombre_completo || 'Invitado del Paseo' }}
                    </p>
                    <p class="text-[10px] text-slate-500 mt-1 font-medium capitalize">
                      {{ roleLabel() }} &middot; Activo ahora
                    </p>
                  </div>
                </div>

                <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border {{ roleChip() }}">
                  En línea
                </span>
              </div>
            </div>

            <!-- Drawer Navigation Body -->
            <div class="flex-1 p-3.5 space-y-3 text-xs overflow-y-auto">
              
              <!-- Main Navigation Items -->
              <div class="space-y-1">
                <span class="drawer-section-label block mb-1.5">
                  Menú Principal
                </span>

                <!-- 1. Todos los Productos -->
                <a
                  routerLink="/cliente/productos"
                  routerLinkActive="drawer-link-active"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="shopping-bag" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Todos los Productos</span>
                </a>

                <!-- 2. Tiendas y Pisos -->
                <a
                  routerLink="/cliente/tiendas"
                  routerLinkActive="drawer-link-active"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="store" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Tiendas y Pisos</span>
                </a>

                <!-- 3. Reels de Publicaciones -->
                <a
                  routerLink="/cliente/reels"
                  routerLinkActive="drawer-link-active"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="film" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Reels de Publicaciones</span>
                </a>

                <!-- 4. Buscador -->
                <a
                  routerLink="/cliente/buscar"
                  routerLinkActive="drawer-link-active"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center text-lg shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="search" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Buscador</span>
                </a>

                <!-- 5. Mis Pedidos -->
                <a
                  routerLink="/cliente/pedidos"
                  routerLinkActive="drawer-link-active"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="package" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Mis Pedidos</span>
                </a>

                <!-- 6. Club de Puntos y Referidos -->
                <a
                  routerLink="/cliente/club"
                  routerLinkActive="drawer-link-active"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="gem" [size]="18" />
                  </div>
                  <div class="flex-1 min-w-0 flex items-center justify-between">
                    <span class="font-bold text-xs text-slate-900">Club & Puntos</span>
                    <span class="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                      {{ loyalty.totalPoints() }} pts
                    </span>
                  </div>
                </a>
              </div>

              <!-- Divider -->
              <hr class="drawer-divider" />

              <!-- Section: Tus accesos directos (Shortcuts) -->
              <div class="space-y-1">
                <span class="drawer-section-label block mb-1.5">
                  Tus accesos directos (Pisos)
                </span>

                <a
                  routerLink="/cliente/tiendas"
                  [queryParams]="{ piso: 'Piso 1' }"
                  [class.drawer-link-active]="activeFloor() === 'Piso 1'"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="shirt" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Piso 1: Moda & Joyería</span>
                </a>

                <a
                  routerLink="/cliente/tiendas"
                  [queryParams]="{ piso: 'Piso 2' }"
                  [class.drawer-link-active]="activeFloor() === 'Piso 2'"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-base shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="headphones" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Piso 2: Tecnología & Audio</span>
                </a>

                <a
                  routerLink="/cliente/tiendas"
                  [queryParams]="{ piso: 'Piso 3' }"
                  [class.drawer-link-active]="activeFloor() === 'Piso 3'"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-base shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="burger" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Piso 3: Mercado Gastronómico</span>
                </a>

                <a
                  routerLink="/cliente/tiendas"
                  [queryParams]="{ piso: 'Piso 4' }"
                  [class.drawer-link-active]="activeFloor() === 'Piso 4'"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl group"
                >
                  <div class="size-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-base shrink-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-inset ring-black/5 group-hover:scale-105 transition-transform">
                    <app-icon name="wine" [size]="18" />
                  </div>
                  <span class="font-bold text-xs text-slate-900 flex-1">Piso 4: Terraza El Cuarto</span>
                </a>
              </div>

              <!-- Divider -->
              <hr class="drawer-divider" />

              <!-- Section: Otros Paneles -->
              <div class="space-y-1">
                <span class="drawer-section-label block mb-1.5">
                  Administración & Comercios
                </span>

                <a
                  routerLink="/comercio/pedidos"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl text-slate-600 hover:text-emerald-700"
                >
                  <span class="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base shrink-0 ring-1 ring-inset ring-emerald-100">
                    <app-icon name="store" [size]="18" />
                  </span>
                  <span class="font-bold text-xs">Panel de Comercio (Escanear QR)</span>
                </a>

                <a
                  routerLink="/admin"
                  (click)="closeSidePanel()"
                  class="drawer-link flex items-center gap-3 pr-3 py-2.5 rounded-xl text-slate-600 hover:text-purple-700"
                >
                  <span class="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base shrink-0 ring-1 ring-inset ring-purple-100">
                    <app-icon name="chart-bar" [size]="18" />
                  </span>
                  <span class="font-bold text-xs">Panel de Supervisión y Admin</span>
                </a>
              </div>
            </div>

            <!-- Modern White Footer -->
            <div class="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
              @if (authService.isAuthenticated()) {
                <button
                  type="button"
                  (click)="logoutAndClose()"
                  class="btn-press w-full h-10 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <app-icon name="log-out" [size]="16" />
                  <span>Cerrar Sesión</span>
                </button>
              }

              <p class="text-[10px] text-slate-400 leading-tight text-center">
                PaseoYa &middot; Paseo Aranjuez © 2026
              </p>
            </div>
          </aside>
        </div>
      }

      <!-- RESPONSIVE MAIN ROUTER CONTAINER (Fluid width on tablet/desktop) -->
      <main class="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 md:py-6">
        <router-outlet></router-outlet>
      </main>

      <!-- CENTRAL NAVIGATION DOCK WITH PROMINENT CENTRAL IA BUTTON (Mobile bottom bar & Desktop floating dock) -->
      <nav
        class="fixed bottom-0 md:hidden left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all"
        aria-label="Navegación principal PaseoYa"
      >
        <div class="max-w-md md:max-w-lg mx-auto grid grid-cols-5 h-16 items-center px-2">
          
          <!-- 1. INICIO -->
          <a
            routerLink="/cliente"
            routerLinkActive="text-amber-600 font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-800 transition py-1 touch-target group"
          >
            <div class="relative group-active:scale-90 transition-transform">
              <svg class="size-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span class="text-[10px] tracking-tight leading-none">Inicio</span>
          </a>

          <!-- 2. CATÁLOGO / BUSCAR -->
          <a
            routerLink="/cliente/productos"
            routerLinkActive="text-amber-600 font-bold"
            class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-800 transition py-1 touch-target group"
          >
            <div class="relative group-active:scale-90 transition-transform">
              <svg class="size-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span class="text-[10px] tracking-tight leading-none">Buscar</span>
          </a>

          <!-- 3. ✨ IA PASEOYA (EN EL MEDIO - ORBE CÓSMICO VECTORIAL) -->
          <div class="flex flex-col items-center justify-center -mt-5 relative z-40">
            <button
              (click)="chatbotService.toggleOpen()"
              type="button"
              class="relative size-13 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 p-[2.5px] shadow-xl hover:shadow-indigo-500/30 active:scale-90 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-400/30"
              aria-label="Abrir asistente inteligente IA PaseoYa"
              title="IA PaseoYa • Asistente Virtual"
            >
              <!-- Glowing Pulsating Ring -->
              <span class="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 blur-xs opacity-60 animate-pulse"></span>
              
              <!-- Inner Button Body with 4-pointed Star SVG -->
              <div class="relative w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-white">
                <svg class="size-6 text-amber-300 drop-shadow-md animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
              </div>
            </button>
            <span class="text-[9px] font-extrabold tracking-tight text-indigo-700 mt-0.5">
              IA Asistente
            </span>
          </div>

          <!-- 4. CARRITO -->
          <a
            routerLink="/cliente/carrito"
            routerLinkActive="text-amber-600 font-bold"
            class="relative flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-800 transition py-1 touch-target group"
          >
            <div class="relative group-active:scale-90 transition-transform">
              <svg class="size-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              @if (cartService.totalItems() > 0) {
                <span class="absolute -top-1.5 -right-2 size-4.5 bg-amber-600 text-white rounded-full text-[10px] font-black flex items-center justify-center tabular-nums shadow-xs">
                  {{ cartService.totalItems() }}
                </span>
              }
            </div>
            <span class="text-[10px] tracking-tight leading-none">Carrito</span>
          </a>

          <!-- 5. MIS PEDIDOS -->
          <a
            routerLink="/cliente/pedidos"
            routerLinkActive="text-amber-600 font-bold"
            class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-800 transition py-1 touch-target group"
          >
            <div class="relative group-active:scale-90 transition-transform">
              <svg class="size-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span class="text-[10px] tracking-tight leading-none">Pedidos</span>
          </a>
        </div>
      </nav>

      <!-- Floating PWA Install Pill (Mobile Only, fixed right above bottom nav) -->
      @if (pwaInstall.isMobile() && !pwaInstall.isInstalled() && showFloatingInstall()) {
        <div class="fixed bottom-18 right-3 z-30 md:hidden animate-in slide-in-from-bottom duration-300">
          <button
            type="button"
            (click)="triggerInstallPrompt()"
            class="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-slate-950 text-white border border-amber-500/60 shadow-xl active:scale-95 transition cursor-pointer"
          >
            <span class="size-2 rounded-full bg-amber-400 animate-ping"></span>
            <app-icon name="smartphone" [size]="14" class="text-amber-300" />
            <span class="text-xs font-bold text-amber-300">Instalar App</span>
            <span class="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">PWA</span>
            <span
              (click)="dismissFloatingInstall($event)"
              class="text-slate-400 hover:text-white ml-0.5 p-0.5 text-xs font-bold"
              title="Ocultar"
              aria-label="Cerrar"
            >
              <app-icon name="x" [size]="14" />
            </span>
          </button>
        </div>
      }

      <!-- PWA Install Guide Modal (Android / iOS / PC) -->
      <app-pwa-install-modal />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteLayoutComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  chatbotService = inject(ChatbotService);
  pwaInstall = inject(PwaInstallService);
  loyalty = inject(LoyaltyService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  showPwaInstallBanner = signal<boolean>(false);
  showFloatingInstall = signal<boolean>(true);
  isSidePanelOpen = signal<boolean>(false);
  activeFloor = signal<string | null>(null);

  /** Color del chip de rol según el tipo de usuario autenticado */
  readonly roleChip = computed(() => {
    switch (this.authService.role()) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'comercio':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cliente':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  });

  readonly roleLabel = computed(() => {
    switch (this.authService.role()) {
      case 'admin':
        return 'Administración';
      case 'comercio':
        return 'Comercio';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Invitado';
    }
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => this.activeFloor.set(params.get('piso')));
  }

  ngOnInit(): void {
    if (!this.pwaInstall.isInstalled()) {
      const dismissed = localStorage.getItem('PWA_BANNER_DISMISSED');
      if (!dismissed) {
        this.showPwaInstallBanner.set(true);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isSidePanelOpen()) {
      this.closeSidePanel();
    }
  }

  toggleSidePanel(): void {
    this.isSidePanelOpen.update((v) => !v);
  }

  closeSidePanel(): void {
    this.isSidePanelOpen.set(false);
  }

  logoutAndClose(): void {
    this.closeSidePanel();
    this.authService.logout();
  }

  async triggerInstallPrompt(): Promise<void> {
    const outcome = await this.pwaInstall.installPwa();
    if (outcome === 'accepted') {
      this.toastService.success('¡PaseoYa se ha instalado en tu pantalla de inicio!');
      this.showPwaInstallBanner.set(false);
      this.showFloatingInstall.set(false);
    }
  }

  dismissPwaBanner(): void {
    this.showPwaInstallBanner.set(false);
    localStorage.setItem('PWA_BANNER_DISMISSED', 'true');
  }

  dismissFloatingInstall(e: Event): void {
    e.stopPropagation();
    this.showFloatingInstall.set(false);
  }
}
