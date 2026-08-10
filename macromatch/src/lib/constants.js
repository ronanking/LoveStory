// Shared reference data for MacroMatch.
// Atwater factors are a hard product rule: protein/carbs 4 cal/g, fat 9 cal/g.

export const CAL = { p: 4, c: 4, f: 9 };

export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const CATS = [
  { key: 'all', label: 'Everything' },
  { key: 'fast', label: 'Fast food' },
  { key: 'super', label: 'Supermarket' },
  { key: 'snack', label: 'Servo & snacks' },
];

export const ACTIVITY = [
  { key: 1.2, label: 'Sedentary', desc: 'Desk job, little planned exercise' },
  { key: 1.375, label: 'Lightly active', desc: '1–3 light sessions a week' },
  { key: 1.55, label: 'Moderately active', desc: '3–5 solid training sessions a week' },
  { key: 1.725, label: 'Very active', desc: '6–7 hard sessions, or a physical job' },
  { key: 1.9, label: 'Athlete / labourer', desc: 'Heavy training plus physical work' },
];

export const GOALS = [
  { key: 'cut_agg', label: 'Aggressive cut', rate: '≈ −0.75 kg/week', adj: -825, pBoost: 0.3,
    best: 'Short pushes (4–8 weeks) when you have a fair amount of fat to lose and strong habits.',
    note: 'Hardest to stick to, and the most muscle-loss risk — protein gets bumped to compensate.' },
  { key: 'cut_std', label: 'Standard cut', rate: '≈ −0.5 kg/week', adj: -550, pBoost: 0.2,
    best: "The default fat-loss pick for most people — meaningful progress that's still liveable.",
    note: 'Sustainable for 8–16 weeks. Expect visible change roughly every fortnight.' },
  { key: 'cut_slow', label: 'Gentle cut', rate: '≈ −0.25 kg/week', adj: -275, pBoost: 0.2,
    best: 'Already fairly lean, or you want to keep gym performance high while trimming.',
    note: "Slowest but safest for muscle. Great for a 'diet without feeling like a diet'." },
  { key: 'recomp', label: 'Recomposition', rate: 'maintenance calories', adj: 0, pBoost: 0.3,
    best: 'New or returning lifters, or higher body fat + new training stimulus: build muscle and lose fat at once.',
    note: 'Eat at maintenance with high protein and train hard. The scale barely moves — photos and strength tell the story.' },
  { key: 'maintain', label: 'Maintain', rate: 'TDEE', adj: 0, pBoost: 0,
    best: 'Happy where you are, or taking a structured break between phases.',
    note: 'Maintenance phases protect long-term progress — dieting year-round backfires.' },
  { key: 'gain_lean', label: 'Lean gain', rate: '≈ +0.25 kg/week', adj: 275, pBoost: 0,
    best: 'Experienced lifters adding muscle while keeping fat gain minimal.',
    note: 'Muscle is built slowly — a small surplus is used; a big one is mostly stored.' },
  { key: 'gain_std', label: 'Standard gain', rate: '≈ +0.5 kg/week', adj: 550, pBoost: 0,
    best: 'Beginners or genuinely underweight people who can grow fast enough to use the surplus.',
    note: "Expect some fat alongside the muscle — that's the trade for faster growth." },
];

export const SPLITS = [
  { key: 'performance', label: 'Performance', desc: 'Higher carbs to fuel hard training', pKg: 1.8, fKg: 0.8,
    bestFor: 'People training hard 4+ times a week — lifting, team sport, CrossFit, endurance.',
    science: "Carbohydrate is the body's preferred fuel for intense exercise, stored as glycogen in muscle. Keeping carbs high protects training quality, which is what actually drives muscle growth and performance. Fat sits near the healthy floor (~0.8 g/kg) to free up calories for carbs.",
    tradeoff: 'More of your calories come from carbs, so on limited calories your meals need to stay leaner. Less suitable if you barely train — the extra carbs have less of a job to do.' },
  { key: 'balanced', label: 'Balanced', desc: 'Even, sustainable middle ground', pKg: 1.8, fKg: 1.0,
    bestFor: "Most people, most of the time. If you're unsure, start here.",
    science: 'Protein at 1.8 g/kg comfortably covers the 1.6–2.2 g/kg range research supports for building or keeping muscle. Fat at 1 g/kg supports hormones and lets meals feel normal, and carbs fill the remainder for energy and fibre.',
    tradeoff: 'Master of none by design — dedicated athletes may want more carbs, and dieters may want the extra satiety of high protein.' },
  { key: 'highprotein', label: 'High protein', desc: 'Max satiety and muscle retention', pKg: 2.2, fKg: 0.9,
    bestFor: 'Fat-loss phases, anyone who struggles with hunger, and lifters cutting while protecting muscle.',
    science: 'Protein is the most filling macro and costs the most energy to digest (20–30% of its calories are burned processing it). At 2.2 g/kg it maximises muscle retention in a deficit — the strongest-evidenced trick in dieting.',
    tradeoff: 'Hitting 2.2 g/kg takes deliberate effort — protein at basically every meal. Slightly less room for carbs and fats, so food choice matters more.' },
  { key: 'lowercarb', label: 'Lower carb', desc: 'More fats, carbs trimmed back', pKg: 2.0, fKg: 1.2,
    bestFor: 'People who feel better on fattier meals, do mostly low-intensity activity, or simply prefer eating this way.',
    science: "For fat loss, research is clear: calories and protein matter far more than the carb/fat ratio. Lower carb is a preference, not a cheat code — but adherence is king, and if fattier meals keep you full and consistent, that IS the advantage.",
    tradeoff: "High-intensity training can feel flatter with less glycogen on board. Fat's 9 cal/g density also means portions look smaller for the same calories." },
];

export const BF_BANDS = {
  male: [
    { label: 'Very lean', range: '6–10%', mid: 8, desc: 'Clear abs, visible veins — competition lean' },
    { label: 'Athletic', range: '11–14%', mid: 12, desc: 'Abs visible in good light, defined muscle' },
    { label: 'Fit', range: '15–19%', mid: 17, desc: 'Some definition, abs not clearly visible' },
    { label: 'Average', range: '20–25%', mid: 22, desc: 'Softer look, little visible definition' },
    { label: 'Above average', range: '26%+', mid: 30, desc: 'Noticeable fat storage around the middle' },
  ],
  female: [
    { label: 'Very lean', range: '14–17%', mid: 15, desc: 'Competition lean, very defined' },
    { label: 'Athletic', range: '18–22%', mid: 20, desc: 'Visible muscle tone, athletic shape' },
    { label: 'Fit', range: '23–27%', mid: 25, desc: 'Healthy, lightly toned appearance' },
    { label: 'Average', range: '28–33%', mid: 30, desc: 'Softer look, typical healthy range' },
    { label: 'Above average', range: '34%+', mid: 38, desc: 'Noticeable fat storage' },
  ],
};
