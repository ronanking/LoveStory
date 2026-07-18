import { CAL, GOALS, SPLITS } from './constants';

export const macroCals = (p, c, f) => p * CAL.p + c * CAL.c + f * CAL.f;

export const num = (v) =>
  v === '' || v === null || v === undefined ? null : Math.max(0, Number(v) || 0);
export const n0 = (v) => num(v) ?? 0;

// Target calculation. Uses Katch-McArdle (lean mass) when a plausible body fat
// is supplied, otherwise Mifflin-St Jeor. Carbs fill the remaining calories so
// the macros always sum exactly to the calorie target.
export function calcPlan(profile) {
  const { sex, age, heightCm, weightKg, bodyFat, activity, goal, split } = profile;
  const a = num(age), h = num(heightCm), w = num(weightKg);
  const bfRaw = num(bodyFat);
  const bf = bfRaw !== null && bfRaw >= 3 && bfRaw <= 60 ? bfRaw : null;
  if (a === null || h === null || w === null) return null;

  let bmr, formula, lbm = null;
  if (bf !== null) {
    lbm = w * (1 - bf / 100);
    bmr = Math.round(370 + 21.6 * lbm);
    formula = 'Katch-McArdle (uses your lean mass)';
  } else {
    bmr = Math.round(10 * w + 6.25 * h - 5 * a + (sex === 'male' ? 5 : -161));
    formula = 'Mifflin-St Jeor';
  }
  const tdee = Math.round(bmr * activity);
  const goalObj = GOALS.find((g) => g.key === goal);
  const kcalTarget = Math.max(tdee + goalObj.adj, 0);
  const sp = SPLITS.find((s) => s.key === split);

  // Protein: per kg lean mass when BF known (preset +0.4 g/kg LBM ≈ same
  // intake at average leanness, fairer at high/low body fat), else per kg total.
  const pKgUsed = bf !== null ? sp.pKg + 0.4 + goalObj.pBoost : sp.pKg + goalObj.pBoost;
  const pBase = bf !== null ? lbm : w;
  const p = Math.round(pKgUsed * pBase);
  const f = Math.max(Math.round(sp.fKg * w), Math.round(0.5 * w)); // hormone floor
  const c = Math.max(Math.round((kcalTarget - macroCals(p, 0, f)) / CAL.c), 0);
  const finalKcal = macroCals(p, c, f);
  const lowFlag = finalKcal < bmr || finalKcal < (sex === 'male' ? 1500 : 1200);
  return {
    bmr, tdee, adj: goalObj.adj, kcal: finalKcal, p, c, f, sp, goalObj, lowFlag,
    formula, lbm: lbm !== null ? Math.round(lbm) : null, bf,
    pKgUsed: pKgUsed.toFixed(1), pBase: Math.round(pBase),
  };
}

// Protein pressure: grams of protein still needed per 100 remaining calories.
export function proteinPressure(remainingP, remainingKcal) {
  return remainingKcal > 0 && remainingP > 0 ? (remainingP / remainingKcal) * 100 : 0;
}

// Bands: cruise / on track / lean picks only / tight squeeze.
export function pressureBand(pp) {
  return pp <= 5 ? 0 : pp <= 8 ? 1 : pp <= 12 ? 2 : 3;
}

export const PRESSURE_READS = [
  { label: 'Cruise mode', msg: 'Plenty of room — nearly anything on the menu can work.' },
  { label: 'On track', msg: 'Moderately lean picks (grilled chicken, bowls, subs) keep everything balanced.' },
  { label: 'Lean picks only', msg: 'Your remaining calories need to carry serious protein — tenders, breast, shakes.' },
  { label: 'Tight squeeze', msg: 'Very little calorie room for the protein still owed. Sashimi, tuna, plain breast.' },
];

export function greeting(h) {
  return h < 12 ? 'Good morning' : h < 17 ? 'Good arvo' : 'Good evening';
}

export function fmtTime(d) {
  let h = d.getHours();
  const m = d.getMinutes(), ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' + m : m) + ap;
}

export function autoMeal() {
  const h = new Date().getHours();
  return h < 11 ? 'Breakfast' : h < 16 ? 'Lunch' : h < 21 ? 'Dinner' : 'Snacks';
}

// Evaluate one food against the remaining budget.
// Fit = doesn't blow calories, carbs or fat (protein overshoot is fine);
// wiggle allows 10% headroom on each. Pace = protein density ≥ what's needed.
export function evaluateFood(food, rem, need, wiggle) {
  const tol = wiggle ? 1.1 : 1;
  const over = [];
  if (food.kcal > rem.kcal * tol) over.push(`${Math.ceil(food.kcal - rem.kcal)} cal`);
  if (food.c > rem.c * tol) over.push(`${Math.ceil(food.c - rem.c)}g carbs`);
  if (food.f > rem.f * tol) over.push(`${Math.ceil(food.f - rem.f)}g fat`);
  const fits = over.length === 0;
  const pace = fits && need > 0 && food.kcal > 0 && (food.p / food.kcal) * 100 >= need;
  return { fits, pace, over };
}
