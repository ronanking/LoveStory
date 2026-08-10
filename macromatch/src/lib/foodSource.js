// Food data layer. If Supabase is configured (VITE_SUPABASE_URL +
// VITE_SUPABASE_ANON_KEY in .env), foods come from the `foods` table that the
// Python ingestion pipeline populates; otherwise the bundled local seed DB is
// used. Rows missing any core macro are excluded rather than guessed at —
// "never invent nutrition data" holds in the frontend too.

import { FOODS } from '../data/foods';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function mapRow(row) {
  // Canonical storage is per 100 g / 100 ml; scale to the published serving
  // when one exists, otherwise present honestly as "per 100 g".
  const scale = row.serving_weight_g ? row.serving_weight_g / 100 : 1;
  const perServing = row.serving_weight_g != null;
  const kcal100 = row.energy_kcal_100 ?? (row.energy_kj_100 != null ? row.energy_kj_100 / 4.184 : null);
  if (kcal100 == null || row.protein_g_100 == null || row.carbs_g_100 == null || row.fat_g_100 == null) {
    return null; // incomplete data: exclude, never invent
  }
  const label = perServing && row.serving_size_desc ? row.serving_size_desc : 'per 100 g';
  return {
    id: row.id,
    name: row.brand ? `${row.brand} ${row.name}` : row.name,
    venue: row.brand || row.category || 'Generic',
    cat: 'super',
    serving: label,
    kcal: Math.round(kcal100 * scale),
    p: Math.round(row.protein_g_100 * scale),
    c: Math.round(row.carbs_g_100 * scale),
    f: Math.round(row.fat_g_100 * scale),
  };
}

export async function loadFoods() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await sb
        .from('foods')
        .select('id,name,brand,category,serving_size_desc,serving_weight_g,energy_kj_100,energy_kcal_100,protein_g_100,carbs_g_100,fat_g_100')
        .neq('confidence', 'suspect')
        .limit(2000);
      if (error) throw error;
      const mapped = (data || []).map(mapRow).filter(Boolean);
      if (mapped.length) return { foods: mapped, source: 'supabase' };
    } catch (e) {
      console.warn('Supabase foods unavailable, using local database:', e.message || e);
    }
  }
  return { foods: FOODS, source: 'local' };
}
