from macromatch_ingest.dedupe import DuplicateIndex
from macromatch_ingest.models import Food


def make(name, brand=None, barcode=None, serving="100 g"):
    return Food(source_id="t", external_id=name, name=name, source_url="u",
                raw={}, retrieved_at="now", brand=brand, barcode=barcode,
                serving_size_desc=serving).finalise()


def test_barcode_wins():
    idx = DuplicateIndex()
    idx.add("id1", "9300601234567", "nk1", "BrandX", "Choc Bar 50g")
    m = idx.find(make("Completely different name", brand="Other", barcode="9300601234567"))
    assert m and m.match_type == "barcode" and m.existing_id == "id1"


def test_natural_key_match():
    idx = DuplicateIndex()
    f1 = make("Chicken, breast, grilled")
    idx.add("id1", None, f1.natural_key, None, f1.name)
    m = idx.find(make("chicken  BREAST grilled"))
    assert m and m.match_type == "natural_key"


def test_fuzzy_candidate_same_brand_only():
    idx = DuplicateIndex()
    idx.add("id1", None, "nk1", "KFC", "Zinger Burger")
    near = make("Zinger Burgers", brand="KFC")
    other_brand = make("Zinger Burgers", brand="HJs")
    m1, m2 = idx.find(near), idx.find(other_brand)
    assert m1 and m1.match_type == "fuzzy" and m1.score >= 92
    assert m2 is None


def test_unrelated_names_do_not_match():
    idx = DuplicateIndex()
    idx.add("id1", None, "nk1", "KFC", "Zinger Burger")
    assert idx.find(make("Original Recipe piece", brand="KFC")) is None
