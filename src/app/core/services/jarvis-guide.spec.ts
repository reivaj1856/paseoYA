import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { JarvisCatalogService } from './jarvis-catalog.service';
import { JarvisGeminiService } from './jarvis-gemini.service';

describe('JARVIS PASEO — GUÍA VIVA DE PASEO ARANJUEZ', () => {
  let catalog: JarvisCatalogService;
  let jarvis: JarvisGeminiService;

  beforeEach(() => {
    localStorage.clear();
    const injector = Injector.create({
      providers: [JarvisCatalogService, JarvisGeminiService],
    });

    runInInjectionContext(injector, () => {
      catalog = injector.get(JarvisCatalogService);
      jarvis = injector.get(JarvisGeminiService);
    });
  });

  describe('1. JarvisCatalogService — Catálogo Controlado', () => {
    it('indica explícitamente que los datos son de demostración', () => {
      expect(catalog.isDemo()).toBe(true);
      expect(catalog.disclaimer()).toContain('Datos de demostración para Paseo Aranjuez');
    });

    it('permite buscar negocios por categoría y presupuesto', () => {
      const cheapFood = catalog.searchBusinesses('', 'Gastronomía', 30);
      expect(cheapFood.length).toBeGreaterThan(0);
      expect(cheapFood.every((b) => b.categoria === 'Gastronomía')).toBe(true);
      expect(cheapFood.every((b) => b.ticketPromedioBs <= 30)).toBe(true);
    });

    it('construye un itinerario con tiempos y presupuesto calculado', () => {
      const itin = catalog.buildItinerary(['biz-cafe', 'biz-plateria'], 40, 150);
      expect(itin.tiempoDisponibleMinutos).toBe(40);
      expect(itin.presupuestoDisponibleBs).toBe(150);
      expect(itin.paradas.length).toBe(2);
      expect(itin.tiempoTotalMinutos).toBeLessThanOrEqual(45);
      expect(itin.presupuestoEstimadoBs).toBeLessThanOrEqual(160);
    });

    it('retorna undefined para IDs inexistentes sin romper la ejecución', () => {
      const nonExistent = catalog.getBusinessById('biz-inexistente-999');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('2. JarvisGeminiService — Escenario Principal de Demostración', () => {
    it('inicia en estado "listo" y en Modo Demostración Local cuando no hay API Key', () => {
      expect(jarvis.state()).toBe('listo');
      expect(jarvis.isRealGeminiMode()).toBe(false);
      expect(jarvis.visualItems().length).toBe(0);
    });

    it('procesa el escenario principal del visitante ("40 minutos, comer rápido y regalo < Bs 150")', async () => {
      const prompt =
        'Tengo 40 minutos, quiero comer algo rápido y buscar un regalo por menos de Bs 150.';
      await jarvis.handleUserInput(prompt);

      // Comprobar turno en el historial
      expect(jarvis.history().length).toBe(2); // Turno visitante + Turno Jarvis
      const botResponse = jarvis.history()[1];
      expect(botResponse.sender).toBe('jarvis');
      expect(botResponse.text).toContain('Piso 3');
      expect(botResponse.text).toContain('Piso 1');

      // Comprobar que se solicitaron y renderizaron los componentes visuales controlados
      const items = jarvis.visualItems();
      expect(items.length).toBeGreaterThanOrEqual(3);

      const hasItinerary = items.some((i) => i.type === 'itinerary-panel');
      const hasBusinessCards = items.some((i) => i.type === 'business-card');
      const hasMap = items.some((i) => i.type === 'map-panel');

      expect(hasItinerary).toBe(true);
      expect(hasBusinessCards).toBe(true);
      expect(hasMap).toBe(true);
    });

    it('permite limpiar el escenario visual y eliminar tarjetas individualmente', async () => {
      await jarvis.handleUserInput('¿Qué promociones hay?');
      expect(jarvis.visualItems().length).toBeGreaterThan(0);

      const firstId = jarvis.visualItems()[0].id;
      jarvis.removeVisualItem(firstId);
      expect(jarvis.visualItems().some((i) => i.id === firstId)).toBe(false);

      jarvis.clearVisualItems();
      expect(jarvis.visualItems().length).toBe(0);
    });

    it('soporta interrupción de voz (barge-in) sin romper el estado', () => {
      jarvis.state.set('hablando');
      jarvis.interruptSpeech();
      expect(jarvis.state()).toBe('listo');
    });

    it('permite configurar credenciales y modelo por entorno o interfaz', () => {
      jarvis.setCredentials('AIzaSyMockKeyForTest', 'gemini-1.5-flash');
      expect(jarvis.apiKey()).toBe('AIzaSyMockKeyForTest');
      expect(jarvis.modelName()).toBe('gemini-1.5-flash');
      expect(jarvis.isRealGeminiMode()).toBe(true);
    });

    it('procesa lenguaje natural ("Algo de gastronomia.") y despliega tarjetas visuales interactivas', async () => {
      await jarvis.handleUserInput('Algo de gastronomia.');
      expect(jarvis.visualItems().length).toBeGreaterThan(0);
      const items = jarvis.visualItems();
      expect(items.some((i) => i.type === 'business-card')).toBe(true);
      expect(items.some((i) => i.type === 'map-panel')).toBe(true);
    });

    it('proporciona tarjetas y mapa garantizados ante cualquier consulta general o imprevista', async () => {
      jarvis.clearVisualItems();
      await jarvis.handleUserInput('No veo nada aquí.');
      expect(jarvis.visualItems().length).toBeGreaterThan(0);
    });
  });
});
