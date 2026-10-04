import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { ChatbotService } from './chatbot.service';
import { CatalogService } from './catalog.service';
import { LoyaltyService } from './loyalty.service';
import { AuthService } from './auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SupabaseService } from './supabase.service';

describe('ChatbotService — Jarvis Paseo AI Reto 2', () => {
  let service: ChatbotService;
  let loyaltyService: LoyaltyService;

  beforeEach(() => {
    localStorage.clear();
    const mockSupabase = {
      isConfigured: () => false,
      isConnected: () => false,
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      channel: () => ({
        on: () => ({
          subscribe: () => {},
        }),
      }),
      from: () => ({
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    };

    const injector = Injector.create({
      providers: [
        { provide: ToastService, useValue: { success: () => {}, error: () => {}, show: () => {} } },
        { provide: SupabaseService, useValue: mockSupabase },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: AuthService, useClass: AuthService },
        { provide: CatalogService, useClass: CatalogService },
        { provide: LoyaltyService, useClass: LoyaltyService },
        { provide: ChatbotService, useClass: ChatbotService },
      ],
    });

    runInInjectionContext(injector, () => {
      service = injector.get(ChatbotService);
      loyaltyService = injector.get(LoyaltyService);
    });
  });

  it('inicia con el mensaje oficial de bienvenida', () => {
    expect(service.messages().length).toBeGreaterThan(0);
    expect(service.messages()[0].text).toContain('Paseo Aranjuez');
  });

  it('permite alternar el estado abierto/cerrado', () => {
    expect(service.isOpen()).toBe(false);
    service.toggleOpen();
    expect(service.isOpen()).toBe(true);
    service.setOpen(false);
    expect(service.isOpen()).toBe(false);
  });

  it('permite enviar mensajes y genera respuesta del bot', async () => {
    const initialCount = service.messages().length;
    await service.sendMessage('¿Qué comer en Piso 3?');
    expect(service.messages().length).toBeGreaterThan(initialCount);
  });
});
