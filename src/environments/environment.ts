export const environment = {
  production: false,
  supabaseUrl: (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_URL) ||
               (typeof localStorage !== 'undefined' && localStorage.getItem('PASEO_SUPABASE_URL')) ||
               'https://cxqmhrjjthxyerddyyim.supabase.co',
  supabaseKey: (typeof window !== 'undefined' && (window as any).__ENV__?.SUPABASE_ANON_KEY) ||
               (typeof localStorage !== 'undefined' && localStorage.getItem('PASEO_SUPABASE_ANON_KEY')) ||
               'sb_publishable_eETZLfAWm3JGli4XdZAyRg_yXMO-ySW',
};
