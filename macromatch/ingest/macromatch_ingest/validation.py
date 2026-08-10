"""Data-quality validation: flag missing or inconsistent nutrition data.

The pipeline NEVER fills in values it doesn't have. Validation only attaches
quality flags and downgrades confidence; humans resolve via the review queue.
"""
from __future__ import annotations

from .models import Food
from .units import KJ_PER_KCAL

REQUIRED = ("energy_kj_100", "protein_g_100", "carbs_g_100", "fat_g_100")
ATWATER = {"protein_g_100": 17.0, "carbs_g_100": 17.0, "fat_g_100": 37.0}  # kJ per g (AU labelling factors)
FIBRE_KJ_PER_G = 8.0

# Physical bounds per 100 g
BOUNDS = {
    "energy_kj_100": (0, 3800),     # pure fat ≈ 3700 kJ/100 g
    "protein_g_100": (0, 100),
    "carbs_g_100": (0, 105),        # small headroom for rounding on labels
    "sugars_g_100": (0, 105),
    "fat_g_100": (0, 100),
    "sat_fat_g_100": (0, 100),
    "sodium_mg_100": (0, 40000),    # table salt ≈ 39,000 mg/100 g
}


def validate(food: Food, fibre_g_100: float | None = None,
             energy_tolerance: float = 0.20) -> Food:
    """Attach quality flags to a Food in place and set confidence.

    energy_tolerance: allowed relative gap between stated energy and energy
    recomputed from macros. 20% default absorbs label rounding, fibre and
    organic-acid contributions on real-world products.
    """
    flags: list[str] = []

    for f in REQUIRED:
        if getattr(food, f) is None:
            flags.append(f"missing_{f.rsplit('_100', 1)[0]}")

    for f, (lo, hi) in BOUNDS.items():
        v = getattr(food, f)
        if v is not None and not (lo <= v <= hi):
            flags.append(f"out_of_range_{f.rsplit('_100', 1)[0]}")

    # internal consistency
    if food.sugars_g_100 is not None and food.carbs_g_100 is not None:
        if food.sugars_g_100 > food.carbs_g_100 + 0.5:
            flags.append("sugars_exceed_carbs")
    if food.sat_fat_g_100 is not None and food.fat_g_100 is not None:
        if food.sat_fat_g_100 > food.fat_g_100 + 0.5:
            flags.append("satfat_exceeds_fat")

    # energy vs macros (Australian labelling factors, kJ)
    if food.energy_kj_100 and all(getattr(food, f) is not None for f in ATWATER):
        computed = sum(getattr(food, f) * kjg for f, kjg in ATWATER.items())
        if fibre_g_100:
            computed += fibre_g_100 * FIBRE_KJ_PER_G
        stated = food.energy_kj_100
        if stated > 50:  # tiny-energy foods: relative comparison is meaningless
            rel = abs(stated - computed) / stated
            if rel > energy_tolerance:
                flags.append("energy_macro_mismatch")

    # kJ vs kcal cross-check when both were source-stated
    if food.energy_kj_100 and food.energy_kcal_100:
        implied = food.energy_kj_100 / KJ_PER_KCAL
        if food.energy_kcal_100 > 20 and abs(implied - food.energy_kcal_100) / food.energy_kcal_100 > 0.05:
            flags.append("kj_kcal_mismatch")

    food.quality_flags = sorted(set(food.quality_flags) | set(flags))
    hard = {f for f in food.quality_flags
            if f.startswith(("missing_", "out_of_range_")) or f in
            ("energy_macro_mismatch", "sugars_exceed_carbs", "satfat_exceeds_fat", "kj_kcal_mismatch")}
    if hard:
        food.confidence = "suspect"
    return food


def review_reason(food: Food) -> str | None:
    """The primary reason a suspect food should enter the review queue."""
    if food.confidence != "suspect" or not food.quality_flags:
        return None
    priority = ["energy_macro_mismatch", "kj_kcal_mismatch", "sugars_exceed_carbs",
                "satfat_exceeds_fat"]
    for p in priority:
        if p in food.quality_flags:
            return p
    return food.quality_flags[0]
