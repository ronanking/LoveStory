import os
import pytest
from macromatch_ingest.importers.afcd import AFCDImporter
from macromatch_ingest.store import SQLiteStore
from macromatch_ingest.compliance import LicenceError

FIX = os.path.join(os.path.dirname(__file__), "fixtures", "afcd_sample.csv")


def new_store(tmp_path):
    s = SQLiteStore(str(tmp_path / "test.db"))
    s.register_source("afcd_r2", "AFCD R2", "FSANZ", "https://example.gov.au",
                      "CC BY", True, "FSANZ attribution")
    return s


def test_full_import(tmp_path):
    store = new_store(tmp_path)
    stats = AFCDImporter(store).run(FIX)
    assert stats["seen"] == 8
    assert stats["upserted"] == 8
    assert store.count("foods") == 8
    row = store.conn.execute(
        "select * from foods where external_id='F002258'").fetchone()
    assert row["energy_kj_100"] == 687
    assert abs(row["energy_kcal_100"] - 687 / 4.184) < 0.2
    assert row["confidence"] == "unverified"
    assert row["source_url"].startswith("https://")


def test_suspect_rows_reach_review_queue(tmp_path):
    store = new_store(tmp_path)
    stats = AFCDImporter(store).run(FIX)
    assert stats["suspect"] >= 3
    reasons = [r["reason"] for r in
               store.conn.execute("select reason from review_queue")]
    assert "energy_macro_mismatch" in reasons
    assert any(r.startswith("missing_") for r in reasons)
    assert "sugars_exceed_carbs" in reasons


def test_fuzzy_duplicate_candidate_flagged(tmp_path):
    store = new_store(tmp_path)
    AFCDImporter(store).run(FIX)
    dups = store.conn.execute("select * from duplicate_pairs").fetchall()
    types = {d["match_type"] for d in dups}
    assert "natural_key" in types      # identical after normalisation
    assert "fuzzy" in types            # the typo variant, flagged not merged


def test_rerun_is_idempotent(tmp_path):
    store = new_store(tmp_path)
    AFCDImporter(store).run(FIX)
    AFCDImporter(store).run(FIX, resume=False)
    assert store.count("foods") == 8


def test_resume_from_checkpoint(tmp_path):
    store = new_store(tmp_path)
    imp = AFCDImporter(store)
    imp.batch_size = 2
    imp.run(FIX, limit=3)
    store.conn.execute("update import_runs set status='interrupted'")
    store.conn.commit()
    stats = AFCDImporter(store).run(FIX)
    assert stats["skipped_resume"] is True
    assert store.count("foods") == 8


def test_licence_gate_blocks_uncleared_source(tmp_path):
    store = SQLiteStore(str(tmp_path / "gate.db"))
    store.register_source("afcd_r2", "AFCD R2", "FSANZ", "u", "CC BY", False)
    with pytest.raises(LicenceError):
        AFCDImporter(store).run(FIX)
