// The macro handbook — six educational sections, ported from the jsx prototype.
// dot: which ledger dot colour heads the section.

export const LEARN = [
  {
    title: 'Energy balance — the physics of weight change',
    dot: 'var(--ink)',
    body: [
      'Your body weight moves with the gap between calories eaten and calories burned. Roughly 7,700 calories equals one kilogram of body tissue, which is why a 550 cal/day deficit works out to about half a kilo a week. No food, timing trick, or macro split overrides this — they only change how easy the balance is to hold.',
      'Total daily burn (TDEE) has parts: your resting burn (BMR, usually 60–70%), digestion (~10%, protein costing the most), formal exercise, and all the incidental movement of daily life. That last one shrinks quietly when you diet hard, which is one reason aggressive deficits underdeliver.',
      'Practical takeaways: prefer the slowest rate that still shows progress; expect the scale to bounce day-to-day with water and food weight (judge weekly averages, not single mornings); and plan maintenance phases — nobody should diet indefinitely.',
    ],
  },
  {
    title: 'Protein — the macro that earns its reputation',
    dot: 'var(--dot-p)',
    body: [
      "Protein builds and repairs muscle, but it also makes enzymes, hormones, skin, and immune cells. It's the most satiating macro and the most expensive to digest — 20–30% of protein's calories are burned just processing it, versus 5–10% for carbs and 0–3% for fat.",
      'How much: general health sits around 0.8–1.2 g per kg of body weight. Building or holding muscle while training: 1.6–2.2 g/kg. Dieting hard while lean: up to ~2.7 g per kg of lean mass, because a calorie deficit raises the risk of losing muscle and protein is the main defence. More than this shows no extra benefit — it just displaces carbs and fat.',
      'Distribution helps: spreading protein over 3–5 feeds of roughly 0.4 g/kg each stimulates muscle-building more effectively than one giant dinner. And protein needs scale with lean mass, not total weight — which is exactly why the setup asks for body fat.',
    ],
  },
  {
    title: 'Carbohydrates — fuel, not the enemy',
    dot: 'var(--dot-c)',
    body: [
      "Carbs are the body's preferred fuel for the brain and for hard exercise, stored in muscle and liver as glycogen. Full glycogen means better sessions; better sessions drive the adaptations you actually want. Carbs are not inherently fattening — excess calories are, regardless of source.",
      "Quality matters more than quantity fear: wholegrains, fruit, legumes and vegetables carry fibre (aim ~25–38 g/day), which slows digestion, feeds gut bacteria, and keeps you full. Refined carbs aren't poison, but they're easy to overeat because they're calorie-dense and low-satiety.",
      'Timing is a refinement, not a requirement: carbs before/after training support performance and recovery, and each gram of stored glycogen holds ~3 g of water — the reason low-carb diets show fast early scale drops that are mostly water, and why the scale jumps back after a big carb day.',
    ],
  },
  {
    title: 'Fat — essential, dense, and easy to misjudge',
    dot: 'var(--dot-f)',
    body: [
      'Dietary fat builds hormones (including testosterone and oestrogen), forms every cell membrane, and carries vitamins A, D, E and K. Chronically very low fat intake can disrupt hormones — which is why the app floors fat at about 0.5 g/kg and typically prescribes 0.8–1.2 g/kg.',
      "Fat's defining feature is density: 9 calories per gram, more than double protein or carbs. A tablespoon of oil is ~120 cal; the same calories in vegetables fills a plate. That's why fat is the easiest macro to under-track — cooking oils, sauces, and 'a bit of butter' add up invisibly.",
      'Quality: favour unsaturated fats (olive oil, nuts, avocado, oily fish — the omega-3s in salmon and sardines are genuinely worth prioritising) and keep saturated fat moderate. Trans fats are worth avoiding outright.',
    ],
  },
  {
    title: 'Body fat % — why it changes your targets',
    dot: 'var(--forest)',
    body: [
      'Two 95 kg people can be built completely differently: one carries 80 kg of lean mass, the other 60 kg. Lean mass — muscle, bone, organs — is the metabolically active tissue, so it drives both how much you burn and how much protein you need. Total body weight is a blunt proxy for it.',
      "That's why, when you supply a body fat estimate, MacroMatch switches from the weight-based Mifflin-St Jeor equation to Katch-McArdle (370 + 21.6 × lean mass) and prescribes protein per kg of lean mass. At higher body fat this prevents overshooting calories and protein; at very low body fat it prevents undershooting.",
      'Estimating it: DEXA scans are the practical gold standard (~$50–80 in Australia); calipers in trained hands are decent; smart-scale bioimpedance readings swing wildly with hydration — treat them as a trend, not a truth. Honest visual comparison is within a few percent for most people, which is plenty for setting targets. Precision matters less than consistency.',
    ],
  },
  {
    title: 'Building & keeping muscle — what actually works',
    dot: 'var(--dot-p)',
    body: [
      'Muscle grows from three inputs, in order: progressive resistance training (the signal), adequate protein (the material), and enough calories (the budget). Miss the training and the other two just make you heavier. No macro split compensates for not lifting.',
      'Rate expectations keep you sane: a newer lifter might add 0.5–1 kg of actual muscle per month; after a few years, a few kilos per YEAR is a good return. This is why huge calorie surpluses mostly add fat — muscle protein synthesis has a speed limit. A 250–500 cal surplus captures nearly all of the available growth.',
      'Keeping muscle is cheaper than building it: on a diet, high protein (1.8–2.7 g/kg lean mass) plus continuing to lift heavy preserves nearly all of it. And in a recomposition — maintenance calories, high protein, hard training — newer lifters and those returning from a break can genuinely do both at once.',
    ],
  },
];
