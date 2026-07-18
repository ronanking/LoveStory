from macromatch_ingest.units import (kj_to_kcal, kcal_to_kj, mg_from, g_from,
                                     per_serving_to_per_100, parse_quantity, to_float)


def test_energy_roundtrip():
    assert kj_to_kcal(418.4) == 100.0
    assert kcal_to_kj(100) == 418.4
    assert kj_to_kcal(None) is None


def test_mass_conversions():
    assert mg_from(1.5, "g") == 1500
    assert mg_from(500, "mg") == 500
    assert g_from(250, "mg") == 0.25


def test_per_serving_rescale():
    assert per_serving_to_per_100(25, 250) == 10.0
    assert per_serving_to_per_100(25, None) is None      # never guess a serving weight
    assert per_serving_to_per_100(None, 250) is None


def test_parse_quantity():
    assert parse_quantity("375 mL") == (375.0, "ml")
    assert parse_quantity("1 serve (60g)") == (60.0, "g")
    assert parse_quantity("0.5 L") == (500.0, "ml")
    assert parse_quantity("one burger") == (None, None)


def test_to_float_handles_spreadsheet_noise():
    assert to_float("1,234") == 1234.0
    assert to_float("<0.1") == 0.1
    assert to_float("N/A") is None
    assert to_float("") is None
    assert to_float(7) == 7.0
