from macromatch_ingest.models import Food
from macromatch_ingest.validation import validate, review_reason


def make(**kw):
    base = dict(source_id="t", external_id="x", name="Test", source_url="u",
                raw={}, retrieved_at="now")
    base.update(kw)
    return Food(**base).finalise()


def test_clean_food_stays_unverified_no_flags():
    f = validate(make(energy_kj_100=687, protein_g_100=31, carbs_g_100=0, fat_g_100=3.7))
    assert f.quality_flags == []
    assert f.confidence == "unverified"
    assert review_reason(f) is None


def test_missing_required_flags_not_invented():
    f = validate(make(energy_kj_100=900))
    assert "missing_protein_g" in f.quality_flags
    assert f.protein_g_100 is None          # value stays missing
    assert f.confidence == "suspect"


def test_energy_macro_mismatch_flagged():
    f = validate(make(energy_kj_100=2500, protein_g_100=5, carbs_g_100=10, fat_g_100=5))
    assert "energy_macro_mismatch" in f.quality_flags
    assert review_reason(f) == "energy_macro_mismatch"


def test_fibre_closes_small_energy_gaps():
    f = validate(make(energy_kj_100=620, protein_g_100=10, carbs_g_100=20, fat_g_100=2),
                 fibre_g_100=5.0)
    assert "energy_macro_mismatch" not in f.quality_flags


def test_sugars_cannot_exceed_carbs():
    f = validate(make(energy_kj_100=1700, protein_g_100=0.5, carbs_g_100=50,
                      sugars_g_100=80, fat_g_100=0.1))
    assert "sugars_exceed_carbs" in f.quality_flags


def test_kj_kcal_crosscheck():
    f = validate(make(energy_kj_100=1000, energy_kcal_100=400,
                      protein_g_100=10, carbs_g_100=30, fat_g_100=5))
    assert "kj_kcal_mismatch" in f.quality_flags
