"""Unit conversion into the canonical schema.

Canonical: energy kJ (kcal derived), macros g, sodium mg, basis per 100 g/ml.
Every converter returns None for None — missing data stays missing (rule #7).
"""
from __future__ import annotations

import re
from typing import Optional

KJ_PER_KCAL = 4.184


def kj_to_kcal(kj: Optional[float]) -> Optional[float]:
    return None if kj is None else round(kj / KJ_PER_KCAL, 1)


def kcal_to_kj(kcal: Optional[float]) -> Optional[float]:
    return None if kcal is None else round(kcal * KJ_PER_KCAL, 1)


def mg_from(value: Optional[float], unit: str) -> Optional[float]:
    """Convert a mass to milligrams. Supports mg, g, ug/mcg."""
    if value is None:
        return None
    u = unit.strip().lower()
    factor = {"mg": 1.0, "g": 1000.0, "ug": 0.001, "mcg": 0.001, "µg": 0.001}.get(u)
    if factor is None:
        raise ValueError(f"unknown mass unit for sodium: {unit!r}")
    return round(value * factor, 3)


def g_from(value: Optional[float], unit: str) -> Optional[float]:
    """Convert a mass to grams. Supports g, mg, kg."""
    if value is None:
        return None
    u = unit.strip().lower()
    factor = {"g": 1.0, "mg": 0.001, "kg": 1000.0}.get(u)
    if factor is None:
        raise ValueError(f"unknown mass unit: {unit!r}")
    return round(value * factor, 4)


def per_serving_to_per_100(value: Optional[float], serving_weight_g: Optional[float]) -> Optional[float]:
    """Rescale a per-serving nutrient to per-100 g. Returns None if weight unknown
    (we flag, we do not guess a serving weight)."""
    if value is None or not serving_weight_g or serving_weight_g <= 0:
        return None
    return round(value * 100.0 / serving_weight_g, 3)


_NUM = re.compile(r"([\d.]+)")


def parse_quantity(text: Optional[str]) -> tuple[Optional[float], Optional[str]]:
    """Parse strings like '105 g', '2.5g', '375 mL', '1 serve (60g)'.

    Returns (value, unit) for the FIRST recognised quantity, else (None, None).
    """
    if not text:
        return None, None
    m = re.search(r"([\d.]+)\s*(kg|g|mg|ml|l)\b", text.lower())
    if not m:
        return None, None
    value = float(m.group(1))
    unit = m.group(2)
    if unit == "l":
        return value * 1000.0, "ml"
    if unit == "kg":
        return value * 1000.0, "g"
    return value, unit


def to_float(v) -> Optional[float]:
    """Lenient numeric parse for spreadsheet cells: '', 'N/A', '<0.1', '1,234'."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace(",", "")
    if s in ("", "-", "N/A", "NA", "n/a", "tr", "Tr"):
        return None
    if s.startswith("<"):        # 'less than' values: keep the bound, flag upstream if needed
        s = s[1:]
    try:
        return float(s)
    except ValueError:
        return None
