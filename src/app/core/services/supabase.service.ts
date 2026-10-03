import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client!: SupabaseClient;

  readonly isConfigured = signal<boolean>(false);
  readonly isConnected = signal<boolean | null>(null);
  readonly statusMessage = signal<string>('Inicializando Supabase...');

  constructor() {
    this.initClient(environment.supabaseUrl, environment.supabaseKey);
    // Automatic silent connection test if configured
    if (this.isConfigured()) {
      this.testConnection();
    }
  }

  private initClient(url: string, key: string): void {
    const configured = Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
    this.isConfigured.set(configured);

    this.client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    if (!configured) {
      this.statusMessage.set('Supabase en modo simulación local (credenciales placeholder).');
    }
  }

  /**
   * Allows setting Supabase credentials at runtime and persists them to localStorage
   */
  setCredentials(url: string, key: string): void {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('PASEO_SUPABASE_URL', cleanUrl);
      localStorage.setItem('PASEO_SUPABASE_ANON_KEY', cleanKey);
    }
    this.initClient(cleanUrl, cleanKey);
    this.testConnection();
  }

  /**
   * Tests whether the Supabase instance is reachable and responding
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      const msg = 'Supabase no está configurado (utilizando datos locales).';
      this.isConnected.set(false);
      this.statusMessage.set(msg);
      return { success: false, message: msg };
    }

    try {
      this.statusMessage.set('Probando conexión con Supabase...');
      // Ping the categories or stores table
      const { data, error } = await this.client.from('categories').select('id').limit(1);

      if (error) {
        // Table might not be populated or RLS policy requires auth
        if (error.code === '42P01') {
          const msg = `Conectado a Supabase, pero la tabla 'categories' aún no existe. Ejecuta supabase/schema.sql.`;
          this.isConnected.set(true);
          this.statusMessage.set(msg);
          return { success: true, message: msg };
        }
        const msg = `Error al consultar Supabase: ${error.message} (Código ${error.code})`;
        this.isConnected.set(false);
        this.statusMessage.set(msg);
        return { success: false, message: msg };
      }

      const msg = 'Conexión a Supabase establecida exitosamente con el centro comercial.';
      this.isConnected.set(true);
      this.statusMessage.set(msg);
      return { success: true, message: msg };
    } catch (err: any) {
      const msg = `Fallo de red al conectar con Supabase: ${err?.message || 'Error desconocido'}`;
      this.isConnected.set(false);
      this.statusMessage.set(msg);
      return { success: false, message: msg };
    }
  }

  get instance(): SupabaseClient {
    return this.client;
  }

  get auth() {
    return this.client.auth;
  }

  get rpc() {
    return this.client.rpc.bind(this.client);
  }

  get from() {
    return this.client.from.bind(this.client);
  }

  get channel() {
    return this.client.channel.bind(this.client);
  }
}
