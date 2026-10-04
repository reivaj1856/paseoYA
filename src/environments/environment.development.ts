export const environment = {
  production: false,
  supabaseUrl: (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_URL) ||
               (typeof localStorage !== 'undefined' && localStorage.getItem('PASEO_SUPABASE_URL')) ||
               'https://cxqmhrjjthxyerddyyim.supabase.co',
  supabaseKey: (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_ANON_KEY) ||
               (typeof localStorage !== 'undefined' && localStorage.getItem('PASEO_SUPABASE_ANON_KEY')) ||
               'sb_publishable_eETZLfAWm3JGli4XdZAyRg_yXMO-ySW',
  geminiModel: (typeof window !== 'undefined' && (window as any).__ENV__?.GEMINI_MODEL) ||
               (typeof localStorage !== 'undefined' && localStorage.getItem('PASEO_GEMINI_MODEL')) ||
               'gemini-2.5-flash',
  geminiApiKey: (typeof window !== 'undefined' && (window as any).__ENV__?.GEMINI_API_KEY) ||
                (typeof localStorage !== 'undefined' && localStorage.getItem('PASEO_GEMINI_API_KEY')) ||
                '',
};
