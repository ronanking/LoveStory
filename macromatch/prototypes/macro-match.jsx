import React, { useState, useMemo } from "react";

// ---------------------------------------------------------------
// MacroMatch AU v4
//  • Optional body fat % → Katch-McArdle BMR + lean-mass protein
//  • Expanded goals incl. recomp + "Help me choose" guide
//  • Educational deep-dives on every macro style
//  • Learn tab: articulate guides on energy balance, protein,
//    carbs, fat, body fat %, and muscle gain/maintenance
// ---------------------------------------------------------------

const C = {
  bg: "#F2F4F0", ink: "#182420", sub: "#5C6B62", card: "#FFFFFF",
  line: "#E2E7E0", board: "#16251E", boardSub: "#8FA598",
  protein: "#D6455D", carbs: "#DE9B1B", fat: "#3E8E8E",
  fit: "#2F7D4F", over: "#C24040", warnBg: "#FBF3E2", warn: "#8A6414",
  okBg: "#E4F0E8", chipBg: "#EAEEE9",
};

const CAL = { p: 4, c: 4, f: 9 };
const macroCals = (p, c, f) => p * CAL.p + c * CAL.c + f * CAL.f;
const num = (v) => (v === "" || v === null || v === undefined ? null : Math.max(0, Number(v) || 0));
const n0 = (v) => num(v) ?? 0;

// kcal / protein / carbs / fat — approximate, per published AU nutrition panels
const FOODS = [
  { id: 1, name: "Cheeseburger", venue: "McDonald's", cat: "fast", kcal: 300, p: 16, c: 31, f: 12 },
  { id: 2, name: "Hamburger", venue: "McDonald's", cat: "fast", kcal: 250, p: 13, c: 30, f: 9 },
  { id: 3, name: "Double Cheeseburger", venue: "McDonald's", cat: "fast", kcal: 450, p: 26, c: 32, f: 24 },
  { id: 4, name: "Big Mac", venue: "McDonald's", cat: "fast", kcal: 550, p: 27, c: 44, f: 29 },
  { id: 5, name: "Quarter Pounder", venue: "McDonald's", cat: "fast", kcal: 550, p: 31, c: 38, f: 29 },
  { id: 6, name: "McChicken", venue: "McDonald's", cat: "fast", kcal: 420, p: 17, c: 41, f: 21 },
  { id: 7, name: "Chicken McNuggets (6)", venue: "McDonald's", cat: "fast", kcal: 270, p: 16, c: 16, f: 16 },
  { id: 8, name: "Chicken McNuggets (10)", venue: "McDonald's", cat: "fast", kcal: 450, p: 27, c: 26, f: 26 },
  { id: 9, name: "Grilled Chicken Salad", venue: "McDonald's", cat: "fast", kcal: 180, p: 25, c: 8, f: 5 },
  { id: 10, name: "Small Fries", venue: "McDonald's", cat: "fast", kcal: 230, p: 3, c: 30, f: 11 },
  { id: 11, name: "Medium Fries", venue: "McDonald's", cat: "fast", kcal: 340, p: 4, c: 44, f: 16 },
  { id: 12, name: "Original Recipe piece", venue: "KFC", cat: "fast", kcal: 290, p: 21, c: 8, f: 19 },
  { id: 13, name: "Zinger Burger", venue: "KFC", cat: "fast", kcal: 450, p: 22, c: 42, f: 21 },
  { id: 14, name: "Original Tenders (3)", venue: "KFC", cat: "fast", kcal: 310, p: 24, c: 18, f: 15 },
  { id: 15, name: "Twister (Original)", venue: "KFC", cat: "fast", kcal: 560, p: 25, c: 54, f: 26 },
  { id: 16, name: "Regular Chips", venue: "KFC", cat: "fast", kcal: 310, p: 4, c: 40, f: 14 },
  { id: 17, name: "Coleslaw (regular)", venue: "KFC", cat: "fast", kcal: 150, p: 1, c: 13, f: 10 },
  { id: 18, name: "Whopper", venue: "Hungry Jack's", cat: "fast", kcal: 630, p: 27, c: 50, f: 35 },
  { id: 19, name: "Whopper Junior", venue: "Hungry Jack's", cat: "fast", kcal: 320, p: 15, c: 28, f: 16 },
  { id: 20, name: "Grilled Chicken Burger", venue: "Hungry Jack's", cat: "fast", kcal: 480, p: 30, c: 40, f: 21 },
  { id: 21, name: "Jack's Fried Chicken Classic", venue: "Hungry Jack's", cat: "fast", kcal: 560, p: 26, c: 48, f: 28 },
  { id: 22, name: "Simply Grill'd (panini)", venue: "Grill'd", cat: "fast", kcal: 500, p: 35, c: 45, f: 17 },
  { id: 23, name: "Simply Grill'd (low-carb bun)", venue: "Grill'd", cat: "fast", kcal: 360, p: 33, c: 12, f: 18 },
  { id: 24, name: "Sweet Chilli Chicken", venue: "Grill'd", cat: "fast", kcal: 550, p: 34, c: 50, f: 21 },
  { id: 25, name: "Chicken Burrito", venue: "GYG", cat: "fast", kcal: 700, p: 38, c: 70, f: 27 },
  { id: 26, name: "Chicken Bowl (with rice)", venue: "GYG", cat: "fast", kcal: 550, p: 35, c: 55, f: 18 },
  { id: 27, name: "Chicken Bowl (no rice)", venue: "GYG", cat: "fast", kcal: 330, p: 32, c: 15, f: 15 },
  { id: 28, name: "Chicken Soft Taco (1)", venue: "GYG", cat: "fast", kcal: 190, p: 12, c: 17, f: 8 },
  { id: 29, name: "Chicken Bowl", venue: "Zambrero", cat: "fast", kcal: 520, p: 33, c: 50, f: 18 },
  { id: 30, name: "Chicken Soft Taco (1)", venue: "Zambrero", cat: "fast", kcal: 200, p: 13, c: 18, f: 8 },
  { id: 31, name: "6\" Chicken Teriyaki", venue: "Subway", cat: "fast", kcal: 340, p: 24, c: 48, f: 5 },
  { id: 32, name: "6\" Turkey", venue: "Subway", cat: "fast", kcal: 280, p: 16, c: 42, f: 4 },
  { id: 33, name: "6\" Steak & Cheese", venue: "Subway", cat: "fast", kcal: 350, p: 24, c: 42, f: 9 },
  { id: 34, name: "Footlong Chicken Teriyaki", venue: "Subway", cat: "fast", kcal: 680, p: 48, c: 96, f: 10 },
  { id: 35, name: "Chicken Teriyaki Salad", venue: "Subway", cat: "fast", kcal: 180, p: 20, c: 16, f: 3 },
  { id: 36, name: "Quarter Chicken (skin off)", venue: "Red Rooster", cat: "fast", kcal: 330, p: 40, c: 2, f: 18 },
  { id: 37, name: "Classic Chicken Roll", venue: "Red Rooster", cat: "fast", kcal: 480, p: 24, c: 46, f: 21 },
  { id: 38, name: "Bondi Burger (single)", venue: "Oporto", cat: "fast", kcal: 450, p: 28, c: 40, f: 18 },
  { id: 39, name: "Double Bondi Burger", venue: "Oporto", cat: "fast", kcal: 610, p: 45, c: 42, f: 27 },
  { id: 40, name: "1/4 PERi-PERi Chicken", venue: "Nando's", cat: "fast", kcal: 330, p: 36, c: 3, f: 20 },
  { id: 41, name: "Chicken Tenderloins (4)", venue: "Nando's", cat: "fast", kcal: 220, p: 33, c: 5, f: 8 },
  { id: 42, name: "Classic Burger", venue: "Nando's", cat: "fast", kcal: 470, p: 33, c: 45, f: 15 },
  { id: 43, name: "Pepperoni slice (value)", venue: "Domino's", cat: "fast", kcal: 190, p: 8, c: 22, f: 8 },
  { id: 44, name: "Chicken Supreme slice", venue: "Domino's", cat: "fast", kcal: 170, p: 10, c: 20, f: 6 },
  { id: 45, name: "Teriyaki Chicken Roll", venue: "Sushi bar", cat: "fast", kcal: 290, p: 13, c: 44, f: 7 },
  { id: 46, name: "Cooked Tuna Roll", venue: "Sushi bar", cat: "fast", kcal: 260, p: 10, c: 42, f: 6 },
  { id: 47, name: "Salmon Sashimi (5 pc)", venue: "Sushi bar", cat: "fast", kcal: 120, p: 12, c: 0, f: 8 },
  { id: 48, name: "Salmon Nigiri (2 pc)", venue: "Sushi bar", cat: "fast", kcal: 90, p: 5, c: 12, f: 2 },
  { id: 49, name: "Protein Supreme smoothie (med)", venue: "Boost Juice", cat: "fast", kcal: 350, p: 25, c: 45, f: 8 },
  { id: 50, name: "Large Skim Flat White", venue: "Café", cat: "snack", kcal: 130, p: 12, c: 18, f: 1 },
  { id: 51, name: "Large Flat White (full cream)", venue: "Café", cat: "snack", kcal: 220, p: 11, c: 18, f: 11 },
  { id: 52, name: "Hot Roast Chicken breast (150 g)", venue: "Coles / Woolies", cat: "super", kcal: 240, p: 45, c: 0, f: 6 },
  { id: 53, name: "Chicken & Brown Rice ready meal", venue: "Coles / Woolies", cat: "super", kcal: 420, p: 30, c: 50, f: 9 },
  { id: 54, name: "YouFoodz-style chicken meal", venue: "Coles / Woolies", cat: "super", kcal: 450, p: 35, c: 40, f: 14 },
  { id: 55, name: "High-protein yoghurt pot (160 g)", venue: "Coles / Woolies", cat: "super", kcal: 130, p: 15, c: 10, f: 2 },
  { id: 56, name: "Cottage cheese (100 g)", venue: "Coles / Woolies", cat: "super", kcal: 100, p: 12, c: 3, f: 4 },
  { id: 57, name: "Tuna pouch (95 g)", venue: "Coles / Woolies", cat: "super", kcal: 105, p: 17, c: 1, f: 4 },
  { id: 58, name: "Musashi RTD protein shake", venue: "Coles / Woolies", cat: "super", kcal: 220, p: 30, c: 12, f: 5 },
  { id: 59, name: "Protein bar (45 g)", venue: "Coles / Woolies", cat: "super", kcal: 180, p: 20, c: 15, f: 5 },
  { id: 60, name: "Beef jerky (50 g)", venue: "Coles / Woolies", cat: "super", kcal: 130, p: 25, c: 5, f: 2 },
  { id: 61, name: "Microwave rice cup (250 g)", venue: "Coles / Woolies", cat: "super", kcal: 350, p: 7, c: 76, f: 2 },
  { id: 62, name: "Skim milk (300 ml)", venue: "Coles / Woolies", cat: "super", kcal: 105, p: 11, c: 15, f: 0 },
  { id: 63, name: "Banana", venue: "Coles / Woolies", cat: "super", kcal: 105, p: 1, c: 27, f: 0 },
  { id: 64, name: "Sushi roll (packaged)", venue: "Coles / Woolies", cat: "super", kcal: 280, p: 11, c: 46, f: 5 },
  { id: 65, name: "Ham & Cheese Toastie", venue: "7-Eleven", cat: "snack", kcal: 300, p: 15, c: 30, f: 13 },
  { id: 66, name: "Chicken & Salad Sandwich", venue: "7-Eleven", cat: "snack", kcal: 340, p: 20, c: 38, f: 11 },
  { id: 67, name: "Up&Go Protein Energize", venue: "7-Eleven", cat: "snack", kcal: 250, p: 15, c: 30, f: 7 },
];

const VENUES = [...new Set(FOODS.map((x) => x.venue))];
const CATS = [
  { key: "all", label: "Everything" }, { key: "fast", label: "Fast food" },
  { key: "super", label: "Supermarket" }, { key: "snack", label: "Servo & snacks" },
];
const MACROS = [
  { key: "kcal", label: "Calories", unit: "cal", color: C.ink },
  { key: "p", label: "Protein", unit: "g", color: C.protein },
  { key: "c", label: "Carbs", unit: "g", color: C.carbs },
  { key: "f", label: "Fat", unit: "g", color: C.fat },
];
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];

// ---- Wizard reference data ----
const ACTIVITY = [
  { key: 1.2, label: "Sedentary", desc: "Desk job, little planned exercise" },
  { key: 1.375, label: "Lightly active", desc: "1–3 light sessions a week" },
  { key: 1.55, label: "Moderately active", desc: "3–5 solid training sessions a week" },
  { key: 1.725, label: "Very active", desc: "6–7 hard sessions, or a physical job" },
  { key: 1.9, label: "Athlete / labourer", desc: "Heavy training plus physical work" },
];

const GOALS = [
  { key: "cut_agg", label: "Aggressive cut", rate: "≈ −0.75 kg/week", adj: -825, pBoost: 0.3,
    best: "Short pushes (4–8 weeks) when you have a fair amount of fat to lose and strong habits.",
    note: "Hardest to stick to, and the most muscle-loss risk — protein gets bumped to compensate." },
  { key: "cut_std", label: "Standard cut", rate: "≈ −0.5 kg/week", adj: -550, pBoost: 0.2,
    best: "The default fat-loss pick for most people — meaningful progress that's still liveable.",
    note: "Sustainable for 8–16 weeks. Expect visible change roughly every fortnight." },
  { key: "cut_slow", label: "Gentle cut", rate: "≈ −0.25 kg/week", adj: -275, pBoost: 0.2,
    best: "Already fairly lean, or you want to keep gym performance high while trimming.",
    note: "Slowest but safest for muscle. Great for a 'diet without feeling like a diet'." },
  { key: "recomp", label: "Recomposition", rate: "maintenance calories", adj: 0, pBoost: 0.3,
    best: "New or returning lifters, or higher body fat + new training stimulus: build muscle and lose fat at once.",
    note: "Eat at maintenance with high protein and train hard. The scale barely moves — photos and strength tell the story." },
  { key: "maintain", label: "Maintain", rate: "TDEE", adj: 0, pBoost: 0,
    best: "Happy where you are, or taking a structured break between phases.",
    note: "Maintenance phases protect long-term progress — dieting year-round backfires." },
  { key: "gain_lean", label: "Lean gain", rate: "≈ +0.25 kg/week", adj: 275, pBoost: 0,
    best: "Experienced lifters adding muscle while keeping fat gain minimal.",
    note: "Muscle is built slowly — a small surplus is used; a big one is mostly stored." },
  { key: "gain_std", label: "Standard gain", rate: "≈ +0.5 kg/week", adj: 550, pBoost: 0,
    best: "Beginners or genuinely underweight people who can grow fast enough to use the surplus.",
    note: "Expect some fat alongside the muscle — that's the trade for faster growth." },
];

const SPLITS = [
  { key: "performance", label: "Performance", desc: "Higher carbs to fuel hard training", pKg: 1.8, fKg: 0.8,
    bestFor: "People training hard 4+ times a week — lifting, team sport, CrossFit, endurance.",
    science: "Carbohydrate is the body's preferred fuel for intense exercise, stored as glycogen in muscle. Keeping carbs high protects training quality, which is what actually drives muscle growth and performance. Fat sits near the healthy floor (~0.8 g/kg) to free up calories for carbs.",
    tradeoff: "More of your calories come from carbs, so on limited calories your meals need to stay leaner. Less suitable if you barely train — the extra carbs have less of a job to do." },
  { key: "balanced", label: "Balanced", desc: "Even, sustainable middle ground", pKg: 1.8, fKg: 1.0,
    bestFor: "Most people, most of the time. If you're unsure, start here.",
    science: "Protein at 1.8 g/kg comfortably covers the 1.6–2.2 g/kg range research supports for building or keeping muscle. Fat at 1 g/kg supports hormones and lets meals feel normal, and carbs fill the remainder for energy and fibre.",
    tradeoff: "Master of none by design — dedicated athletes may want more carbs, and dieters may want the extra satiety of high protein." },
  { key: "highprotein", label: "High protein", desc: "Max satiety and muscle retention", pKg: 2.2, fKg: 0.9,
    bestFor: "Fat-loss phases, anyone who struggles with hunger, and lifters cutting while protecting muscle.",
    science: "Protein is the most filling macro and costs the most energy to digest (20–30% of its calories are burned processing it). At 2.2 g/kg it maximises muscle retention in a deficit — the strongest-evidenced trick in dieting.",
    tradeoff: "Hitting 2.2 g/kg takes deliberate effort — protein at basically every meal. Slightly less room for carbs and fats, so food choice matters more." },
  { key: "lowercarb", label: "Lower carb", desc: "More fats, carbs trimmed back", pKg: 2.0, fKg: 1.2,
    bestFor: "People who feel better on fattier meals, do mostly low-intensity activity, or simply prefer eating this way.",
    science: "For fat loss, research is clear: calories and protein matter far more than the carb/fat ratio. Lower carb is a preference, not a cheat code — but adherence is king, and if fattier meals keep you full and consistent, that IS the advantage.",
    tradeoff: "High-intensity training can feel flatter with less glycogen on board. Fat's 9 cal/g density also means portions look smaller for the same calories." },
];

// Body fat self-estimation reference (visual guide bands)
const BF_BANDS = {
  male: [
    { label: "Very lean", range: "6–10%", mid: 8, desc: "Clear abs, visible veins — competition lean" },
    { label: "Athletic", range: "11–14%", mid: 12, desc: "Abs visible in good light, defined muscle" },
    { label: "Fit", range: "15–19%", mid: 17, desc: "Some definition, abs not clearly visible" },
    { label: "Average", range: "20–25%", mid: 22, desc: "Softer look, little visible definition" },
    { label: "Above average", range: "26%+", mid: 30, desc: "Noticeable fat storage around the middle" },
  ],
  female: [
    { label: "Very lean", range: "14–17%", mid: 15, desc: "Competition lean, very defined" },
    { label: "Athletic", range: "18–22%", mid: 20, desc: "Visible muscle tone, athletic shape" },
    { label: "Fit", range: "23–27%", mid: 25, desc: "Healthy, lightly toned appearance" },
    { label: "Average", range: "28–33%", mid: 30, desc: "Softer look, typical healthy range" },
    { label: "Above average", range: "34%+", mid: 38, desc: "Noticeable fat storage" },
  ],
};

function calcPlan(profile) {
  const { sex, age, heightCm, weightKg, bodyFat, activity, goal, split } = profile;
  const a = num(age), h = num(heightCm), w = num(weightKg);
  const bfRaw = num(bodyFat);
  const bf = bfRaw !== null && bfRaw >= 3 && bfRaw <= 60 ? bfRaw : null;
  if (a === null || h === null || w === null) return null;

  let bmr, formula, lbm = null;
  if (bf !== null) {
    lbm = w * (1 - bf / 100);
    bmr = Math.round(370 + 21.6 * lbm);
    formula = "Katch-McArdle (uses your lean mass)";
  } else {
    bmr = Math.round(10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161));
    formula = "Mifflin-St Jeor";
  }
  const tdee = Math.round(bmr * activity);
  const goalObj = GOALS.find((g) => g.key === goal);
  const kcalTarget = Math.max(tdee + goalObj.adj, 0);
  const sp = SPLITS.find((s) => s.key === split);

  // Protein: per kg lean mass when BF known (preset +0.4 g/kg LBM ≈ same
  // intake for average leanness, fairer at high/low body fat), else per kg total.
  const pKgUsed = bf !== null ? sp.pKg + 0.4 + goalObj.pBoost : sp.pKg + goalObj.pBoost;
  const pBase = bf !== null ? lbm : w;
  const p = Math.round(pKgUsed * pBase);
  const f = Math.max(Math.round(sp.fKg * w), Math.round(0.5 * w)); // hormone floor
  const c = Math.max(Math.round((kcalTarget - macroCals(p, 0, f)) / CAL.c), 0);
  const finalKcal = macroCals(p, c, f);
  const lowFlag = finalKcal < bmr || finalKcal < (sex === "male" ? 1500 : 1200);
  return { bmr, tdee, adj: goalObj.adj, kcal: finalKcal, p, c, f, sp, goalObj, lowFlag, formula, lbm: lbm !== null ? Math.round(lbm) : null, bf, pKgUsed: pKgUsed.toFixed(1), pBase: Math.round(pBase) };
}

// ---- small shared components ----
function Info({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen((o) => !o)} aria-label="More info"
        style={{ border: `1px solid ${C.line}`, background: C.chipBg, color: C.sub, borderRadius: "50%", width: 18, height: 18, fontSize: 11, lineHeight: "16px", cursor: "pointer", padding: 0, marginLeft: 6, verticalAlign: "middle" }}>i</button>
      {open && (
        <span style={{ position: "absolute", zIndex: 50, top: 24, left: -80, width: 230, background: C.ink, color: "#fff", fontSize: 12, lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", display: "block" }}
          onClick={() => setOpen(false)}>{text}</span>
      )}
    </span>
  );
}
function SectionTitle({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.sub }}>{children}</div>;
}

// ================= APP =================
export default function MacroMatch() {
  const [tab, setTab] = useState("day");
  const [targets, setTargets] = useState({ kcal: "", p: "", c: "", f: "" });
  const [diary, setDiary] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });
  const [activeMeal, setActiveMeal] = useState("Lunch");
  const [cat, setCat] = useState("all");
  const [venueSel, setVenueSel] = useState([]);
  const [sort, setSort] = useState("fit");
  const [wiggle, setWiggle] = useState(false);
  const [search, setSearch] = useState("");
  const [showOver, setShowOver] = useState(false);

  const eaten = useMemo(() => {
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    MEALS.forEach((m) => diary[m].forEach((e) => { t.kcal += e.kcal * e.qty; t.p += e.p * e.qty; t.c += e.c * e.qty; t.f += e.f * e.qty; }));
    return t;
  }, [diary]);

  const remaining = useMemo(() => {
    const r = {};
    MACROS.forEach(({ key }) => { const t = num(targets[key]); r[key] = t === null ? null : t - eaten[key]; });
    return r;
  }, [targets, eaten]);

  const needDensity = remaining.p !== null && remaining.kcal !== null && remaining.kcal > 0 && remaining.p > 0
    ? (remaining.p / remaining.kcal) * 100 : null;

  const tP = num(targets.p), tC = num(targets.c), tF = num(targets.f), tK = num(targets.kcal);
  const targetMacroCals = tP !== null && tC !== null && tF !== null ? macroCals(tP, tC, tF) : null;
  const calGap = targetMacroCals !== null && tK !== null ? tK - targetMacroCals : null;
  const consistent = calGap !== null && Math.abs(calGap) <= 25;

  const logFood = (food, meal = activeMeal) => {
    setDiary((d) => {
      const list = d[meal];
      const i = list.findIndex((e) => e.foodId === food.id && food.id !== undefined);
      if (i >= 0) { const cp = [...list]; cp[i] = { ...cp[i], qty: cp[i].qty + 1 }; return { ...d, [meal]: cp }; }
      return { ...d, [meal]: [...list, { uid: Date.now() + Math.random(), foodId: food.id, name: food.name, venue: food.venue || "Custom", kcal: food.kcal, p: food.p, c: food.c, f: food.f, qty: 1 }] };
    });
  };
  const changeQty = (meal, uid, delta) =>
    setDiary((d) => ({ ...d, [meal]: d[meal].flatMap((e) => (e.uid === uid ? (e.qty + delta > 0 ? [{ ...e, qty: e.qty + delta }] : []) : [e])) }));

  const tol = wiggle ? 0.1 : 0;
  const evaluate = (food) => {
    const overs = [];
    MACROS.forEach(({ key, label, unit }) => {
      const rem = remaining[key];
      if (rem === null) return;
      const limit = Math.max(rem, 0) * (1 + tol);
      if (food[key] > limit) overs.push({ key, label, unit, by: food[key] - Math.max(rem, 0) });
    });
    const weights = { p: 50, c: 20, f: 10, kcal: 20 };
    let score = 0, wSum = 0;
    MACROS.forEach(({ key }) => {
      const rem = remaining[key];
      if (rem === null || rem <= 0) return;
      score += Math.min(food[key] / rem, 1) * weights[key];
      wSum += weights[key];
    });
    return { overs, score: wSum ? (score / wSum) * 100 : 0 };
  };

  const results = useMemo(() => {
    const filtered = FOODS.filter((f) => {
      if (cat !== "all" && f.cat !== cat) return false;
      if (venueSel.length && !venueSel.includes(f.venue)) return false;
      if (search && !(f.name + " " + f.venue).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const fits = [], near = [];
    filtered.forEach((f) => {
      const ev = evaluate(f);
      const item = { ...f, ...ev };
      if (ev.overs.length === 0) fits.push(item);
      else if (ev.overs.every((o) => o.by <= Math.max(f[o.key] * 0.2, 8))) near.push(item);
    });
    const sorters = { fit: (a, b) => b.score - a.score, protein: (a, b) => b.p - a.p, kcal: (a, b) => a.kcal - b.kcal };
    fits.sort(sorters[sort]);
    near.sort((a, b) => a.overs.length - b.overs.length);
    return { fits, near };
  }, [cat, venueSel, search, sort, remaining, tol]);

  const toggleVenue = (v) => setVenueSel((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  const anyTarget = MACROS.some(({ key }) => num(targets[key]) !== null);

  const tabBtn = (key, label) => (
    <button onClick={() => setTab(key)}
      style={{ padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid rgba(255,255,255,0.25)", background: tab === key ? "#fff" : "transparent", color: tab === key ? C.ink : "#fff" }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background: C.board, color: "#fff", padding: "18px 16px 20px", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 4px 20px rgba(22,37,30,0.35)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.02em", fontWeight: 800 }}>
              MacroMatch <span style={{ color: C.boardSub, fontWeight: 500, fontSize: 14 }}>AU</span>
            </h1>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tabBtn("day", "My day")}
              {tabBtn("find", "Find food")}
              {tabBtn("setup", "Set up")}
              {tabBtn("learn", "Learn")}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 14 }}>
            {MACROS.map(({ key, label, unit, color }) => {
              const t = num(targets[key]);
              const rem = remaining[key];
              const pct = t ? Math.min(Math.max((eaten[key] / t) * 100, 0), 100) : 0;
              return (
                <div key={key} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.boardSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <span>{label}</span><span>{unit}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, padding: "2px 0" }}>
                    {t === null ? "—" : Math.max(rem, 0)}<span style={{ fontSize: 12, fontWeight: 500, color: C.boardSub }}> left</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: key === "kcal" ? "#fff" : color, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: rem !== null && rem < 0 ? "#F0A0A0" : C.boardSub, marginTop: 4 }}>
                    {t === null ? "no target set" : `${eaten[key]} of ${t} eaten${rem < 0 ? " — over!" : ""}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 16px 60px" }}>
        {tab === "setup" && (
          <SetupWizard onApply={(plan) => {
            setTargets({ kcal: String(plan.kcal), p: String(plan.p), c: String(plan.c), f: String(plan.f) });
            setTab("day");
          }} goLearn={() => setTab("learn")} />
        )}
        {tab === "learn" && <LearnView />}
        {tab === "day" && (
          <DayView
            targets={targets} setTargets={setTargets}
            targetMacroCals={targetMacroCals} calGap={calGap} consistent={consistent}
            diary={diary} changeQty={changeQty} logFood={logFood}
            eaten={eaten} remaining={remaining} needDensity={needDensity}
            goSetup={() => setTab("setup")} goFind={() => setTab("find")}
          />
        )}
        {tab === "find" && (
          <FinderView
            anyTarget={anyTarget} results={results} remaining={remaining} needDensity={needDensity}
            cat={cat} setCat={setCat} sort={sort} setSort={setSort}
            search={search} setSearch={setSearch} wiggle={wiggle} setWiggle={setWiggle}
            venueSel={venueSel} toggleVenue={toggleVenue} setVenueSel={setVenueSel}
            showOver={showOver} setShowOver={setShowOver}
            activeMeal={activeMeal} setActiveMeal={setActiveMeal} logFood={logFood}
          />
        )}
        <p style={{ marginTop: 30, fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
          Calculations use Mifflin-St Jeor (or Katch-McArdle when body fat is provided) and 4/4/9 Atwater factors. All figures are estimates and general information only — not dietary or medical advice; individual needs vary, and an accredited practising dietitian can personalise properly. Food macros approximate published AU nutrition info.
        </p>
      </div>
    </div>
  );
}

// ================= SET UP WIZARD =================
function SetupWizard({ onApply, goLearn }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ sex: "male", age: "", heightCm: "", weightKg: "", bodyFat: "", activity: 1.55, goal: "maintain", split: "balanced" });
  const plan = calcPlan(profile);
  const steps = ["About you", "Activity", "Goal", "Macro style", "Your numbers"];
  const canNext = step !== 0 || (num(profile.age) && num(profile.heightCm) && num(profile.weightKg));
  const set = (k, v) => setProfile((s) => ({ ...s, [k]: v }));

  const numInput = (k, label, ph, unit, optional = false) => (
    <div>
      <label style={{ fontSize: 12, color: C.sub }}>{label} <span style={{ color: C.line }}>·</span> <span style={{ color: C.sub }}>{unit}</span>{optional && <span style={{ color: C.boardSub }}> (optional)</span>}</label>
      <input inputMode="numeric" value={profile[k]} placeholder={ph}
        onChange={(e) => set(k, e.target.value.replace(/[^\d]/g, ""))}
        style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "12px", fontSize: 18, fontWeight: 700, borderRadius: 10, border: `1px solid ${C.line}`, outline: "none", background: C.bg }} />
    </div>
  );

  const OptionRow = ({ selected, onClick, title, subtitle, desc, right, expandable }) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ marginBottom: 8, borderRadius: 12, border: `2px solid ${selected ? C.fit : C.line}`, background: selected ? C.okBg : C.card, overflow: "hidden" }}>
        <button onClick={onClick}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "13px 14px", cursor: "pointer", border: "none", background: "transparent" }}>
          <span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
            {subtitle && <span style={{ fontSize: 12, color: C.sub, marginLeft: 8 }}>{subtitle}</span>}
            {desc && <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 2 }}>{desc}</span>}
          </span>
          {right && <span style={{ fontSize: 12, fontWeight: 700, color: selected ? C.fit : C.sub, whiteSpace: "nowrap", marginLeft: 10 }}>{right}</span>}
        </button>
        {expandable && (
          <div style={{ padding: "0 14px 12px" }}>
            <button onClick={() => setOpen((o) => !o)}
              style={{ border: "none", background: "none", color: C.fit, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>
              {open ? "▾ Hide details" : "▸ Who is this for, and why?"}
            </button>
            {open && <div style={{ fontSize: 13, lineHeight: 1.6, color: C.ink, marginTop: 6 }}>{expandable}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C.fit : C.line, transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>Step {step + 1} of {steps.length} — <strong style={{ color: C.ink }}>{steps[step]}</strong></div>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        {step === 0 && (
          <div>
            <SectionTitle>Tell us about you<Info text="These feed the calorie equations. If you also give a body fat estimate, we switch to the Katch-McArdle formula, which works off your lean mass — more accurate, especially at higher or lower body fat." /></SectionTitle>
            <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
              {["male", "female"].map((s) => (
                <button key={s} onClick={() => set("sex", s)}
                  style={{ flex: 1, padding: "11px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", textTransform: "capitalize", border: `2px solid ${profile.sex === s ? C.fit : C.line}`, background: profile.sex === s ? C.okBg : C.card, color: C.ink }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {numInput("age", "Age", "25", "years")}
              {numInput("heightCm", "Height", "180", "cm")}
              {numInput("weightKg", "Weight", "82", "kg")}
            </div>
            <div style={{ marginTop: 12 }}>
              {numInput("bodyFat", "Body fat", "e.g. 18", "%", true)}
              <div style={{ fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.5 }}>
                Why it helps: your lean mass — muscle, bone, organs — is what burns energy and needs protein. Two people at 90 kg can have very different lean mass. Don't know it? Tap the closest description:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                {BF_BANDS[profile.sex].map((b) => (
                  <button key={b.label} onClick={() => set("bodyFat", String(b.mid))}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px",
                      borderRadius: 10, cursor: "pointer", fontSize: 12, textAlign: "left",
                      border: `1px solid ${num(profile.bodyFat) === b.mid ? C.fit : C.line}`,
                      background: num(profile.bodyFat) === b.mid ? C.okBg : C.bg,
                    }}>
                    <span><strong>{b.label}</strong> <span style={{ color: C.sub }}>· {b.desc}</span></span>
                    <span style={{ fontWeight: 700, color: C.sub, whiteSpace: "nowrap", marginLeft: 8 }}>{b.range}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 6 }}>
                Visual estimates are within a few percent for most people — plenty accurate for setting targets. Skip it and we'll use the weight-based formula instead.
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <SectionTitle>How active are you?<Info text="Your resting burn (BMR) gets multiplied by an activity factor to estimate total daily energy expenditure (TDEE) — everything you burn in a normal day. Most people overestimate this by one level; when in doubt, pick the lower one." /></SectionTitle>
            <div style={{ marginTop: 12 }}>
              {ACTIVITY.map((a) => (
                <OptionRow key={a.key} selected={profile.activity === a.key} onClick={() => set("activity", a.key)}
                  title={a.label} desc={a.desc} right={`×${a.key}`} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <SectionTitle>What's the goal?<Info text="Roughly 7,700 cal ≈ 1 kg of body weight, so ±0.5 kg/week works out to about ±550 cal/day from your TDEE. Cutting goals also nudge protein up to protect muscle." /></SectionTitle>
            <GoalHelper profile={profile} onPick={(k) => set("goal", k)} />
            <div style={{ marginTop: 12 }}>
              {GOALS.map((g) => (
                <OptionRow key={g.key} selected={profile.goal === g.key} onClick={() => set("goal", g.key)}
                  title={g.label} subtitle={g.rate} desc={g.best}
                  right={g.adj === 0 ? (g.key === "recomp" ? "TDEE +P" : "TDEE") : `${g.adj > 0 ? "+" : ""}${g.adj} cal`}
                  expandable={g.note} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <SectionTitle>Pick a macro style<Info text="Protein and fat are set per kg of body weight (or lean mass, if you gave body fat) — the way sports nutrition actually prescribes them. Carbs fill whatever calories remain, so your macros always sum exactly to your calorie target." /></SectionTitle>
            <div style={{ fontSize: 12, color: C.sub, margin: "8px 0 4px", lineHeight: 1.5 }}>
              There's no single "correct" split — protein and total calories do the heavy lifting for every goal. The right style is the one you'll stick to. Open the details on each:
            </div>
            <div style={{ marginTop: 8 }}>
              {SPLITS.map((s) => (
                <OptionRow key={s.key} selected={profile.split === s.key} onClick={() => set("split", s.key)}
                  title={s.label} desc={s.desc} right={`${s.pKg} g/kg P · ${s.fKg} g/kg F`}
                  expandable={
                    <span>
                      <strong>Best for:</strong> {s.bestFor}<br />
                      <strong>The science:</strong> {s.science}<br />
                      <strong>Trade-off:</strong> {s.tradeoff}
                    </span>
                  } />
              ))}
            </div>
            <button onClick={goLearn} style={{ marginTop: 6, border: "none", background: "none", color: C.fit, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              Want the full story on each macro? Open the Learn tab →
            </button>
          </div>
        )}

        {step === 4 && plan && (
          <div>
            <SectionTitle>Your numbers — and the working</SectionTitle>
            <div style={{ background: C.bg, borderRadius: 12, padding: 14, marginTop: 12, fontSize: 14, lineHeight: 2 }}>
              {plan.lbm !== null && (
                <MathRow label={`Lean mass (${plan.bf}% body fat)`} info="Weight × (1 − body fat %). The tissue that burns energy and holds your muscle." value={`${plan.lbm} kg`} />
              )}
              <MathRow label={`Resting burn — ${plan.formula}`} info={plan.lbm !== null ? "Katch-McArdle: 370 + 21.6 × lean mass. More accurate than weight-based formulas when body fat is known." : "Mifflin-St Jeor: 10×weight + 6.25×height − 5×age ± sex constant."} value={`${plan.bmr} cal`} />
              <MathRow label={`× activity (${ACTIVITY.find((a) => a.key === profile.activity).label})`} value={`${plan.tdee} cal TDEE`} />
              <MathRow label={plan.goalObj.label} value={`${plan.adj >= 0 ? "+" : ""}${plan.adj} cal`} />
              <div style={{ borderTop: `2px solid ${C.ink}`, marginTop: 6, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}>
                <span>Daily target</span><span>{plan.kcal} cal</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
              {[
                { label: "Protein", v: plan.p, color: C.protein, note: `${plan.pKgUsed} g/kg ${plan.lbm !== null ? "lean mass" : "bodyweight"}` },
                { label: "Carbs", v: plan.c, color: C.carbs, note: "fills the rest" },
                { label: "Fat", v: plan.f, color: C.fat, note: `${plan.sp.fKg} g/kg bodyweight` },
              ].map((m) => (
                <div key={m.label} style={{ background: C.bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.v}g</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{m.note}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 10 }}>
              Cross-check: {plan.p}×4 + {plan.c}×4 + {plan.f}×9 = <strong style={{ color: C.fit }}>{macroCals(plan.p, plan.c, plan.f)} cal ✓</strong>
            </div>
            {plan.lowFlag && (
              <div style={{ marginTop: 10, background: C.warnBg, color: C.warn, borderRadius: 10, padding: "10px 12px", fontSize: 13, lineHeight: 1.5 }}>
                This lands quite low relative to your estimated resting burn. Consider a slower rate — and it's worth talking to a GP or accredited dietitian before running an aggressive deficit.
              </div>
            )}
            <button onClick={() => onApply(plan)}
              style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 12, border: "none", background: C.ink, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Use these as my daily targets
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}
          style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.card, color: step === 0 ? C.line : C.ink, fontWeight: 700, fontSize: 13, cursor: step === 0 ? "default" : "pointer" }}>
          ← Back
        </button>
        {step < 4 && (
          <button onClick={() => canNext && setStep((s) => s + 1)}
            style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: canNext ? C.ink : C.line, color: "#fff", fontWeight: 700, fontSize: 13, cursor: canNext ? "pointer" : "default" }}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// "Help me choose" goal recommender
function GoalHelper({ profile, onPick }) {
  const [open, setOpen] = useState(false);
  const [aim, setAim] = useState(null);
  const [exp, setExp] = useState(null);
  const bf = num(profile.bodyFat);
  const male = profile.sex === "male";

  let rec = null;
  if (aim && exp) {
    if (aim === "keep") rec = "maintain";
    else if (aim === "lose") {
      const veryLean = bf !== null && bf < (male ? 12 : 20);
      rec = veryLean ? "cut_slow" : "cut_std";
    } else if (aim === "both") {
      if (exp === "new") rec = "recomp";
      else rec = bf !== null && bf > (male ? 18 : 26) ? "cut_slow" : "gain_lean";
    } else if (aim === "build") {
      rec = bf !== null && bf > (male ? 20 : 30) ? "recomp" : (exp === "new" ? "gain_std" : "gain_lean");
    }
  }
  const recObj = rec ? GOALS.find((g) => g.key === rec) : null;
  const why = {
    maintain: "You said you're happy where you are — maintenance protects that while you focus on training and habits.",
    cut_std: "A standard cut is the sweet spot for fat loss: real progress without wrecking your training or social life.",
    cut_slow: "You're already lean (or want to protect performance), so a gentle deficit keeps muscle safe while trimming.",
    recomp: "With a new training stimulus (or higher body fat), your body can build muscle and burn fat at the same calories — no deficit needed yet.",
    gain_lean: "As an experienced trainee, muscle comes slowly — a small surplus feeds growth without stacking on fat.",
    gain_std: "Newer lifters grow quickly enough to use a bigger surplus, so a faster gain gets you moving.",
  };

  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick}
      style={{ padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${active ? C.fit : C.line}`, background: active ? C.okBg : C.bg, color: active ? C.fit : C.ink }}>
      {children}
    </button>
  );

  return (
    <div style={{ margin: "10px 0", borderRadius: 12, border: `1px dashed ${C.line}`, background: C.bg, padding: "10px 12px" }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ border: "none", background: "none", fontWeight: 700, fontSize: 13, color: C.ink, cursor: "pointer", padding: 0 }}>
        {open ? "▾" : "▸"} No idea what's right for you? Answer two questions
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 5 }}>Right now, I mostly want to…</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip active={aim === "lose"} onClick={() => setAim("lose")}>Lose fat</Chip>
            <Chip active={aim === "build"} onClick={() => setAim("build")}>Build muscle</Chip>
            <Chip active={aim === "both"} onClick={() => setAim("both")}>Both at once</Chip>
            <Chip active={aim === "keep"} onClick={() => setAim("keep")}>Stay as I am</Chip>
          </div>
          <div style={{ fontSize: 12, color: C.sub, margin: "10px 0 5px" }}>My weight training experience:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip active={exp === "new"} onClick={() => setExp("new")}>New / returning (&lt;1 yr consistent)</Chip>
            <Chip active={exp === "exp"} onClick={() => setExp("exp")}>Experienced (1+ yrs)</Chip>
          </div>
          {recObj && (
            <div style={{ marginTop: 12, background: C.okBg, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 13 }}>
                <strong style={{ color: C.fit }}>Suggested: {recObj.label}</strong> <span style={{ color: C.sub }}>({recObj.rate})</span>
              </div>
              <div style={{ fontSize: 12, color: C.ink, marginTop: 4, lineHeight: 1.5 }}>{why[rec]}</div>
              {bf === null && aim !== "keep" && (
                <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>Tip: adding a body fat estimate on step 1 sharpens this suggestion.</div>
              )}
              <button onClick={() => onPick(rec)}
                style={{ marginTop: 8, padding: "7px 14px", borderRadius: 8, border: "none", background: C.fit, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Select {recObj.label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MathRow({ label, value, info }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: C.sub }}>{label}{info && <Info text={info} />}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

// ================= LEARN =================
const LEARN = [
  {
    title: "Energy balance — the physics of weight change",
    color: C.ink,
    body: [
      "Your body weight moves with the gap between calories eaten and calories burned. Roughly 7,700 calories equals one kilogram of body tissue, which is why a 550 cal/day deficit works out to about half a kilo a week. No food, timing trick, or macro split overrides this — they only change how easy the balance is to hold.",
      "Total daily burn (TDEE) has parts: your resting burn (BMR, usually 60–70%), digestion (~10%, protein costing the most), formal exercise, and all the incidental movement of daily life. That last one shrinks quietly when you diet hard, which is one reason aggressive deficits underdeliver.",
      "Practical takeaways: prefer the slowest rate that still shows progress; expect the scale to bounce day-to-day with water and food weight (judge weekly averages, not single mornings); and plan maintenance phases — nobody should diet indefinitely.",
    ],
  },
  {
    title: "Protein — the macro that earns its reputation",
    color: C.protein,
    body: [
      "Protein builds and repairs muscle, but it also makes enzymes, hormones, skin, and immune cells. It's the most satiating macro and the most expensive to digest — 20–30% of protein's calories are burned just processing it, versus 5–10% for carbs and 0–3% for fat.",
      "How much: general health sits around 0.8–1.2 g per kg of body weight. Building or holding muscle while training: 1.6–2.2 g/kg. Dieting hard while lean: up to ~2.7 g per kg of lean mass, because a calorie deficit raises the risk of losing muscle and protein is the main defence. More than this shows no extra benefit — it just displaces carbs and fat.",
      "Distribution helps: spreading protein over 3–5 feeds of roughly 0.4 g/kg each stimulates muscle-building more effectively than one giant dinner. And protein needs scale with lean mass, not total weight — which is exactly why the setup asks for body fat.",
    ],
  },
  {
    title: "Carbohydrates — fuel, not the enemy",
    color: C.carbs,
    body: [
      "Carbs are the body's preferred fuel for the brain and for hard exercise, stored in muscle and liver as glycogen. Full glycogen means better sessions; better sessions drive the adaptations you actually want. Carbs are not inherently fattening — excess calories are, regardless of source.",
      "Quality matters more than quantity fear: wholegrains, fruit, legumes and vegetables carry fibre (aim ~25–38 g/day), which slows digestion, feeds gut bacteria, and keeps you full. Refined carbs aren't poison, but they're easy to overeat because they're calorie-dense and low-satiety.",
      "Timing is a refinement, not a requirement: carbs before/after training support performance and recovery, and each gram of stored glycogen holds ~3 g of water — the reason low-carb diets show fast early scale drops that are mostly water, and why the scale jumps back after a big carb day.",
    ],
  },
  {
    title: "Fat — essential, dense, and easy to misjudge",
    color: C.fat,
    body: [
      "Dietary fat builds hormones (including testosterone and oestrogen), forms every cell membrane, and carries vitamins A, D, E and K. Chronically very low fat intake can disrupt hormones — which is why the app floors fat at about 0.5 g/kg and typically prescribes 0.8–1.2 g/kg.",
      "Fat's defining feature is density: 9 calories per gram, more than double protein or carbs. A tablespoon of oil is ~120 cal; the same calories in vegetables fills a plate. That's why fat is the easiest macro to under-track — cooking oils, sauces, and 'a bit of butter' add up invisibly.",
      "Quality: favour unsaturated fats (olive oil, nuts, avocado, oily fish — the omega-3s in salmon and sardines are genuinely worth prioritising) and keep saturated fat moderate. Trans fats are worth avoiding outright.",
    ],
  },
  {
    title: "Body fat % — why it changes your targets",
    color: C.fit,
    body: [
      "Two 95 kg people can be built completely differently: one carries 80 kg of lean mass, the other 60 kg. Lean mass — muscle, bone, organs — is the metabolically active tissue, so it drives both how much you burn and how much protein you need. Total body weight is a blunt proxy for it.",
      "That's why, when you supply a body fat estimate, MacroMatch switches from the weight-based Mifflin-St Jeor equation to Katch-McArdle (370 + 21.6 × lean mass) and prescribes protein per kg of lean mass. At higher body fat this prevents overshooting calories and protein; at very low body fat it prevents undershooting.",
      "Estimating it: DEXA scans are the practical gold standard (~$50–80 in Australia); calipers in trained hands are decent; smart-scale bioimpedance readings swing wildly with hydration — treat them as a trend, not a truth. Honest visual comparison is within a few percent for most people, which is plenty for setting targets. Precision matters less than consistency.",
    ],
  },
  {
    title: "Building & keeping muscle — what actually works",
    color: C.protein,
    body: [
      "Muscle grows from three inputs, in order: progressive resistance training (the signal), adequate protein (the material), and enough calories (the budget). Miss the training and the other two just make you heavier. No macro split compensates for not lifting.",
      "Rate expectations keep you sane: a newer lifter might add 0.5–1 kg of actual muscle per month; after a few years, a few kilos per YEAR is a good return. This is why huge calorie surpluses mostly add fat — muscle protein synthesis has a speed limit. A 250–500 cal surplus captures nearly all of the available growth.",
      "Keeping muscle is cheaper than building it: on a diet, high protein (1.8–2.7 g/kg lean mass) plus continuing to lift heavy preserves nearly all of it. And in a recomposition — maintenance calories, high protein, hard training — newer lifters and those returning from a break can genuinely do both at once.",
    ],
  },
];

function LearnView() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 4px" }}>The macro handbook</h2>
      <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, marginTop: 4 }}>
        Everything the setup wizard assumes, explained properly. Six short reads — no fads, no fear-mongering, just the mechanics.
      </p>
      {LEARN.map((sec, i) => (
        <div key={sec.title} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "15px 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: sec.color, marginRight: 10 }} />
              {sec.title}
            </span>
            <span style={{ color: C.sub, fontSize: 18 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div style={{ padding: "0 16px 16px" }}>
              {sec.body.map((para, j) => (
                <p key={j} style={{ fontSize: 14, lineHeight: 1.7, color: C.ink, margin: "0 0 10px" }}>{para}</p>
              ))}
            </div>
          )}
        </div>
      ))}
      <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
        These are general principles from mainstream sports-nutrition research. Individual circumstances (medical conditions, medications, pregnancy, history with food) change the picture — an accredited practising dietitian is the right call for personalised advice.
      </p>
    </div>
  );
}

// ================= MY DAY =================
function DayView({ targets, setTargets, targetMacroCals, calGap, consistent, diary, changeQty, logFood, eaten, remaining, needDensity, goSetup, goFind }) {
  const noTargets = !num(targets.kcal) && !num(targets.p);
  const mealCals = MEALS.map((m) => diary[m].reduce((t, e) => t + e.kcal * e.qty, 0));
  const maxMeal = Math.max(...mealCals, 1);
  const densityBand = needDensity === null ? null
    : needDensity <= 5 ? { label: "Cruise mode", color: C.fit, msg: "Plenty of calories per gram of protein left — almost anything on the menu can work." }
    : needDensity <= 8 ? { label: "On track", color: C.fit, msg: "Moderately lean picks (grilled chicken, subs, bowls) will keep everything balanced." }
    : needDensity <= 12 ? { label: "Lean picks only", color: C.warn, msg: "You need protein-dense food now — think grilled chicken, tuna, tenders, protein shakes." }
    : { label: "Tight squeeze", color: C.over, msg: "Very little calorie room for the protein you still need. Shakes, sashimi and plain chicken breast are your friends." };

  return (
    <div>
      {noTargets && (
        <div style={{ background: C.board, color: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Don't know your numbers?</div>
            <div style={{ fontSize: 13, color: C.boardSub, marginTop: 3 }}>Answer a few quick questions and we'll calculate them — and show every step of the maths.</div>
          </div>
          <button onClick={goSetup} style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: "#fff", color: C.ink, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            Calculate my targets →
          </button>
        </div>
      )}

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionTitle>Daily requirements</SectionTitle>
          <button onClick={goSetup} style={{ border: "none", background: "none", color: C.fit, fontWeight: 700, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>recalculate</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginTop: 10 }}>
          {MACROS.map(({ key, label, unit, color }) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: C.sub }}>{label} ({unit})</label>
              <input inputMode="numeric" value={targets[key]} placeholder="—"
                onChange={(e) => setTargets((s) => ({ ...s, [key]: e.target.value.replace(/[^\d]/g, "") }))}
                style={{ width: "100%", boxSizing: "border-box", marginTop: 4, padding: "10px 12px", fontSize: 18, fontWeight: 700, borderRadius: 10, border: `1px solid ${C.line}`, outline: "none", color: key === "kcal" ? C.ink : color, background: C.bg }} />
            </div>
          ))}
        </div>
        {targetMacroCals !== null && (
          <div style={{ marginTop: 12, borderRadius: 10, padding: "10px 12px", fontSize: 13, lineHeight: 1.5, background: consistent ? C.okBg : C.warnBg, color: consistent ? C.fit : C.warn }}>
            {consistent
              ? <span>✓ Your maths lines up — {targets.p}g P + {targets.c}g C + {targets.f}g F = <strong>{targetMacroCals} cal</strong>.</span>
              : <span>Your macros add up to <strong>{targetMacroCals} cal</strong> but your calorie target is <strong>{targets.kcal || "not set"}</strong>{calGap !== null && <> — <strong>{Math.abs(calGap)} cal {calGap > 0 ? "unaccounted for" : "over"}</strong></>}. Use "recalculate" for a guaranteed-balanced plan.</span>}
          </div>
        )}
      </div>

      {!noTargets && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginTop: 14 }}>
          {densityBand && (
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
              <SectionTitle>Protein pressure<Info text="Grams of protein you still need per 100 remaining calories. The higher it climbs, the leaner your next food has to be. Chicken breast is ~19g/100cal; chips are ~1g/100cal." /></SectionTitle>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: densityBand.color }}>{needDensity.toFixed(1)}</span>
                <span style={{ fontSize: 12, color: C.sub }}>g protein / 100 cal remaining</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, marginTop: 8, background: `linear-gradient(90deg, ${C.fit}, ${C.warn}, ${C.over})`, position: "relative" }}>
                <div style={{ position: "absolute", left: `${Math.min((needDensity / 15) * 100, 98)}%`, top: -3, width: 4, height: 14, background: C.ink, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 12, marginTop: 8 }}>
                <strong style={{ color: densityBand.color }}>{densityBand.label}.</strong> <span style={{ color: C.sub }}>{densityBand.msg}</span>
              </div>
              <button onClick={goFind} style={{ marginTop: 10, padding: "8px 14px", borderRadius: 10, border: "none", background: C.ink, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Show me what fits →
              </button>
            </div>
          )}
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
            <SectionTitle>Where your day went<Info text="Calories logged per meal. A common pattern: light early meals push a huge calorie load into dinner, which makes hitting protein evenly much harder." /></SectionTitle>
            <div style={{ marginTop: 10 }}>
              {MEALS.map((m, i) => (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 70, fontSize: 12, color: C.sub }}>{m}</span>
                  <div style={{ flex: 1, height: 14, background: C.chipBg, borderRadius: 7, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(mealCals[i] / maxMeal) * 100}%`, background: C.board, borderRadius: 7, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ width: 60, textAlign: "right", fontSize: 12, fontWeight: 700 }}>{mealCals[i]} cal</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>
              Day total <strong style={{ color: C.ink }}>{eaten.kcal} cal · {eaten.p}P / {eaten.c}C / {eaten.f}F</strong>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 800, margin: "20px 0 10px" }}>Food diary</h2>
      {MEALS.map((meal) => (
        <MealSection key={meal} meal={meal} entries={diary[meal]} changeQty={changeQty} logFood={logFood} />
      ))}
    </div>
  );
}

function MealSection({ meal, entries, changeQty, logFood }) {
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState({ name: "", kcal: "", p: "", c: "", f: "" });
  const totals = entries.reduce((t, e) => ({ kcal: t.kcal + e.kcal * e.qty, p: t.p + e.p * e.qty, c: t.c + e.c * e.qty, f: t.f + e.f * e.qty }), { kcal: 0, p: 0, c: 0, f: 0 });
  const matches = q.length > 1 ? FOODS.filter((f) => (f.name + " " + f.venue).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const customMacroCals = macroCals(n0(custom.p), n0(custom.c), n0(custom.f));
  const customKcal = num(custom.kcal);
  const customMismatch = customKcal !== null && customMacroCals > 0 && Math.abs(customKcal - customMacroCals) > Math.max(customMacroCals * 0.15, 20);
  const addCustom = () => {
    if (!custom.name) return;
    logFood({ name: custom.name, venue: "Custom", kcal: customKcal ?? customMacroCals, p: n0(custom.p), c: n0(custom.c), f: n0(custom.f) }, meal);
    setCustom({ name: "", kcal: "", p: "", c: "", f: "" }); setQ(""); setAdding(false);
  };
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{meal}</div>
        <div style={{ fontSize: 12, color: C.sub }}>{totals.kcal} cal · {totals.p}P / {totals.c}C / {totals.f}F</div>
      </div>
      {entries.map((e) => (
        <div key={e.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 14 }}>
            <strong>{e.qty > 1 ? `${e.qty}× ` : ""}{e.name}</strong>
            <span style={{ color: C.sub }}> · {e.venue} · {e.kcal * e.qty} cal · {e.p * e.qty}P / {e.c * e.qty}C / {e.f * e.qty}F</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <QtyBtn onClick={() => changeQty(meal, e.uid, -1)}>−</QtyBtn>
            <QtyBtn onClick={() => changeQty(meal, e.uid, +1)}>+</QtyBtn>
          </div>
        </div>
      ))}
      {!adding ? (
        <button onClick={() => setAdding(true)}
          style={{ marginTop: 10, padding: "8px 14px", borderRadius: 10, border: `1px dashed ${C.line}`, background: C.bg, color: C.sub, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + Add food
        </button>
      ) : (
        <div style={{ marginTop: 10, background: C.bg, borderRadius: 10, padding: 12 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the database…" autoFocus
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14, outline: "none" }} />
          {matches.map((f) => (
            <div key={f.id} onClick={() => { logFood(f, meal); setQ(""); setAdding(false); }}
              style={{ display: "flex", justifyContent: "space-between", padding: "8px 6px", fontSize: 13, cursor: "pointer", borderBottom: `1px solid ${C.line}` }}>
              <span><strong>{f.name}</strong> <span style={{ color: C.sub }}>· {f.venue}</span></span>
              <span style={{ color: C.sub }}>{f.kcal} cal · {f.p}P/{f.c}C/{f.f}F</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: C.sub, margin: "10px 0 6px", fontWeight: 700 }}>…or quick add custom</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 6 }}>
            {[{ k: "name", ph: "Food name" }, { k: "kcal", ph: "cal" }, { k: "p", ph: "P g" }, { k: "c", ph: "C g" }, { k: "f", ph: "F g" }].map(({ k, ph }) => (
              <input key={k} value={custom[k]} placeholder={ph} inputMode={k === "name" ? "text" : "numeric"}
                onChange={(e) => setCustom((s) => ({ ...s, [k]: k === "name" ? e.target.value : e.target.value.replace(/[^\d]/g, "") }))}
                style={{ padding: "8px 8px", borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, outline: "none", minWidth: 0 }} />
            ))}
          </div>
          {customMismatch && (
            <div style={{ fontSize: 12, color: C.warn, background: C.warnBg, borderRadius: 8, padding: "6px 10px", marginTop: 6 }}>
              Heads up: those macros work out to ~{customMacroCals} cal, not {custom.kcal}. Leave calories blank to auto-calculate.
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={addCustom} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: C.ink, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Log it</button>
            <button onClick={() => { setAdding(false); setQ(""); }} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", color: C.sub, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function QtyBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ border: `1px solid ${C.line}`, background: C.bg, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>{children}</button>
  );
}

// ================= FIND FOOD =================
function FinderView({ anyTarget, results, remaining, needDensity, cat, setCat, sort, setSort, search, setSearch, wiggle, setWiggle, venueSel, toggleVenue, setVenueSel, showOver, setShowOver, activeMeal, setActiveMeal, logFood }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {CATS.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)}
            style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${cat === c.key ? C.ink : C.line}`, background: cat === c.key ? C.ink : C.card, color: cat === c.key ? "#fff" : C.ink, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {c.label}
          </button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ marginLeft: "auto", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.card, fontSize: 13, color: C.ink }}>
          <option value="fit">Sort: best fit</option>
          <option value="protein">Sort: most protein</option>
          <option value="kcal">Sort: fewest calories</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods or venues…"
          style={{ flex: "1 1 200px", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.card, fontSize: 14, outline: "none" }} />
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: C.sub, cursor: "pointer" }}>
          <input type="checkbox" checked={wiggle} onChange={(e) => setWiggle(e.target.checked)} />
          10% wiggle
          <Info text="Allows foods to exceed your remaining budget by up to 10% on any macro. Handy near the end of the day when nothing fits perfectly." />
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: C.sub }}>
          logging to
          <select value={activeMeal} onChange={(e) => setActiveMeal(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.card, fontSize: 13, color: C.ink }}>
            {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {VENUES.map((v) => (
          <button key={v} onClick={() => toggleVenue(v)}
            style={{ padding: "5px 10px", borderRadius: 999, fontSize: 12, cursor: "pointer", border: `1px solid ${venueSel.includes(v) ? C.fit : C.line}`, background: venueSel.includes(v) ? C.okBg : C.chipBg, color: venueSel.includes(v) ? C.fit : C.sub, fontWeight: 600 }}>
            {v}
          </button>
        ))}
        {venueSel.length > 0 && (
          <button onClick={() => setVenueSel([])} style={{ border: "none", background: "none", color: C.sub, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>clear</button>
        )}
      </div>

      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
          {anyTarget ? `${results.fits.length} options fit what's left of your day` : "Set your daily requirements first (My day or Set up)"}
        </h2>
        {needDensity !== null && (
          <span style={{ fontSize: 12, color: C.sub }}>
            ⚡ = keeps you on protein pace ({needDensity.toFixed(1)}g+ P per 100 cal)
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12, marginTop: 12 }}>
        {results.fits.map((f) => (
          <FoodCard key={f.id} food={f} remaining={remaining} needDensity={needDensity} onAdd={() => logFood(f)} meal={activeMeal} />
        ))}
      </div>

      {results.fits.length === 0 && anyTarget && (
        <div style={{ marginTop: 12, padding: 20, background: C.card, border: `1px dashed ${C.line}`, borderRadius: 14, color: C.sub, fontSize: 14 }}>
          Nothing fits those numbers exactly. Try the 10% wiggle toggle, widen your venue filters, or check the "just over" list below.
        </div>
      )}

      {results.near.length > 0 && anyTarget && (
        <div style={{ marginTop: 22 }}>
          <button onClick={() => setShowOver((s) => !s)}
            style={{ border: "none", background: "none", color: C.sub, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0 }}>
            {showOver ? "▾" : "▸"} Just over budget ({results.near.length})
          </button>
          {showOver && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12, marginTop: 10, opacity: 0.85 }}>
              {results.near.map((f) => (
                <FoodCard key={f.id} food={f} remaining={remaining} needDensity={needDensity} onAdd={() => logFood(f)} meal={activeMeal} over />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FoodCard({ food, remaining, needDensity, onAdd, meal, over = false }) {
  const chips = [
    { label: `${food.p}g P`, color: C.protein, key: "p" },
    { label: `${food.c}g C`, color: C.carbs, key: "c" },
    { label: `${food.f}g F`, color: C.fat, key: "f" },
  ];
  const pRem = remaining.p;
  const pFill = pRem && pRem > 0 ? Math.min(Math.round((food.p / pRem) * 100), 100) : null;
  const density = food.kcal > 0 ? (food.p / food.kcal) * 100 : 0;
  const onPace = !over && needDensity !== null && density >= needDensity;
  return (
    <div style={{ background: C.card, border: `1px solid ${over ? "#EBD9D9" : onPace ? C.fit : C.line}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>
            {onPace && <span title="Keeps you on protein pace">⚡ </span>}{food.name}
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{food.venue} · {density.toFixed(0)}g P/100cal</div>
        </div>
        <div style={{ textAlign: "right", fontWeight: 800, fontSize: 18, whiteSpace: "nowrap" }}>
          {food.kcal}<span style={{ fontSize: 11, fontWeight: 600, color: C.sub }}> cal</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {chips.map((ch) => (
          <span key={ch.key} style={{ fontSize: 12, fontWeight: 700, color: ch.color, background: C.chipBg, borderRadius: 999, padding: "3px 9px" }}>{ch.label}</span>
        ))}
      </div>
      {over ? (
        <div style={{ fontSize: 12, color: C.over }}>
          Over by {food.overs.map((o) => `${Math.ceil(o.by)}${o.unit === "cal" ? " cal" : `g ${o.label.toLowerCase()}`}`).join(", ")}
        </div>
      ) : pFill !== null ? (
        <div style={{ fontSize: 12, color: C.fit }}>Covers {pFill}% of your remaining protein</div>
      ) : null}
      <button onClick={onAdd}
        style={{ marginTop: "auto", padding: "9px 0", borderRadius: 10, border: "none", background: over ? C.chipBg : C.ink, color: over ? C.ink : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        {over ? `Log to ${meal} anyway` : `Log to ${meal}`}
      </button>
    </div>
  );
}
