"""Storage layer.

Two interchangeable backends behind one interface:

  * SupabaseStore — production. Talks to Supabase's PostgREST API with the
    service-role key, batch upserts with `on_conflict=source_id,external_id`.
  * SQLiteStore   — local dev, tests, and offline runs. Mirrors the schema.

Both support incremental checkpointing: foods are committed in batches and the
run's `last_checkpoint` cursor is updated in the same transaction-ish step, so
an interrupted run resumes from the last committed batch (rule #8).
"""
from __future__ import annotations

import json
import logging
import os
import sqlite3
import uuid
from typing import Any, Iterable, Optional

import httpx

from .models import Food, utcnow

log = logging.getLogger("macromatch.store")


class BaseStore:
    def get_source(self, source_id: str) -> Optional[dict]: ...
    def start_run(self, source_id: str, input_ref: str) -> str: ...
    def get_resume_checkpoint(self, source_id: str, input_ref: str) -> Optional[str]: ...
    def commit_batch(self, run_id: str, foods: list[Food], checkpoint: str) -> list[str]: ...
    def finish_run(self, run_id: str, status: str, stats: dict) -> None: ...
    def add_review(self, run_id: str, food_id: Optional[str], reason: str, detail: dict) -> None: ...
    def add_duplicate(self, food_a: str, food_b: str, match_type: str, score: float) -> None: ...
    def iter_food_index(self, ) -> Iterable[dict]: ...


# --------------------------------------------------------------------------
# SQLite (dev / tests / offline)
# --------------------------------------------------------------------------
class SQLiteStore(BaseStore):
    def __init__(self, path: str = "macromatch.db") -> None:
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript("""
        create table if not exists food_sources(
          id text primary key, name text, publisher text, source_url text,
          licence text, licence_cleared integer default 0, attribution_text text);
        create table if not exists import_runs(
          id text primary key, source_id text, input_ref text, started_at text,
          finished_at text, status text default 'running',
          last_checkpoint text, stats text default '{}');
        create table if not exists foods(
          id text primary key, source_id text, external_id text, barcode text,
          name text, brand text, category text, is_liquid integer,
          serving_size_desc text, serving_weight_g real,
          energy_kj_100 real, energy_kcal_100 real, protein_g_100 real,
          carbs_g_100 real, sugars_g_100 real, fat_g_100 real,
          sat_fat_g_100 real, sodium_mg_100 real,
          raw text, source_url text, source_version text, retrieved_at text,
          last_verified_at text, confidence text, quality_flags text,
          natural_key text, unique(source_id, external_id));
        create index if not exists foods_nk on foods(natural_key);
        create table if not exists review_queue(
          id text primary key, food_id text, run_id text, reason text,
          detail text, status text default 'open', created_at text);
        create table if not exists duplicate_pairs(
          id text primary key, food_a text, food_b text, match_type text,
          score real, status text default 'open', unique(food_a, food_b));
        """)

    def register_source(self, source_id: str, name: str, publisher: str,
                        source_url: str, licence: str, licence_cleared: bool,
                        attribution_text: str = "") -> None:
        self.conn.execute(
            "insert or replace into food_sources values (?,?,?,?,?,?,?)",
            (source_id, name, publisher, source_url, licence,
             int(licence_cleared), attribution_text))
        self.conn.commit()

    def get_source(self, source_id: str) -> Optional[dict]:
        r = self.conn.execute("select * from food_sources where id=?", (source_id,)).fetchone()
        return dict(r) if r else None

    def start_run(self, source_id: str, input_ref: str) -> str:
        rid = str(uuid.uuid4())
        self.conn.execute(
            "insert into import_runs(id, source_id, input_ref, started_at) values (?,?,?,?)",
            (rid, source_id, input_ref, utcnow().isoformat()))
        self.conn.commit()
        return rid

    def get_resume_checkpoint(self, source_id: str, input_ref: str) -> Optional[str]:
        r = self.conn.execute(
            "select last_checkpoint from import_runs where source_id=? and input_ref=? "
            "and status in ('interrupted','failed','running') "
            "order by started_at desc limit 1", (source_id, input_ref)).fetchone()
        return r["last_checkpoint"] if r else None

    def commit_batch(self, run_id: str, foods: list[Food], checkpoint: str) -> list[str]:
        ids: list[str] = []
        cur = self.conn.cursor()
        for f in foods:
            row = f.to_row()
            existing = cur.execute(
                "select id from foods where source_id=? and external_id=?",
                (f.source_id, f.external_id)).fetchone()
            fid = existing["id"] if existing else str(uuid.uuid4())
            cur.execute("""
              insert into foods values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
              on conflict(source_id, external_id) do update set
                name=excluded.name, brand=excluded.brand, category=excluded.category,
                barcode=excluded.barcode, is_liquid=excluded.is_liquid,
                serving_size_desc=excluded.serving_size_desc,
                serving_weight_g=excluded.serving_weight_g,
                energy_kj_100=excluded.energy_kj_100, energy_kcal_100=excluded.energy_kcal_100,
                protein_g_100=excluded.protein_g_100, carbs_g_100=excluded.carbs_g_100,
                sugars_g_100=excluded.sugars_g_100, fat_g_100=excluded.fat_g_100,
                sat_fat_g_100=excluded.sat_fat_g_100, sodium_mg_100=excluded.sodium_mg_100,
                raw=excluded.raw, source_url=excluded.source_url,
                source_version=excluded.source_version,
                last_verified_at=excluded.last_verified_at,
                confidence=excluded.confidence, quality_flags=excluded.quality_flags,
                natural_key=excluded.natural_key
            """, (
                fid, f.source_id, f.external_id, f.barcode, f.name, f.brand,
                f.category, int(f.is_liquid), f.serving_size_desc, f.serving_weight_g,
                f.energy_kj_100, f.energy_kcal_100, f.protein_g_100, f.carbs_g_100,
                f.sugars_g_100, f.fat_g_100, f.sat_fat_g_100, f.sodium_mg_100,
                json.dumps(row["raw"]), f.source_url, f.source_version,
                f.retrieved_at, utcnow().isoformat(), f.confidence,
                json.dumps(f.quality_flags), f.natural_key))
            ids.append(fid)
        cur.execute("update import_runs set last_checkpoint=? where id=?", (checkpoint, run_id))
        self.conn.commit()   # batch + checkpoint land together -> resumable
        return ids

    def finish_run(self, run_id: str, status: str, stats: dict) -> None:
        self.conn.execute(
            "update import_runs set status=?, stats=?, finished_at=? where id=?",
            (status, json.dumps(stats), utcnow().isoformat(), run_id))
        self.conn.commit()

    def add_review(self, run_id: str, food_id: Optional[str], reason: str, detail: dict) -> None:
        self.conn.execute(
            "insert into review_queue(id, food_id, run_id, reason, detail, created_at) "
            "values (?,?,?,?,?,?)",
            (str(uuid.uuid4()), food_id, run_id, reason, json.dumps(detail),
             utcnow().isoformat()))
        self.conn.commit()

    def add_duplicate(self, food_a: str, food_b: str, match_type: str, score: float) -> None:
        self.conn.execute(
            "insert or ignore into duplicate_pairs(id, food_a, food_b, match_type, score) "
            "values (?,?,?,?,?)", (str(uuid.uuid4()), food_a, food_b, match_type, score))
        self.conn.commit()

    def iter_food_index(self) -> Iterable[dict]:
        for r in self.conn.execute(
                "select id, barcode, natural_key, brand, name from foods"):
            yield dict(r)

    # convenience for tests / CLI reporting
    def count(self, table: str) -> int:
        return self.conn.execute(f"select count(*) n from {table}").fetchone()["n"]


# --------------------------------------------------------------------------
# Supabase (production) — PostgREST over HTTPS with the service-role key.
# --------------------------------------------------------------------------
class SupabaseStore(BaseStore):
    def __init__(self, url: Optional[str] = None, service_key: Optional[str] = None) -> None:
        self.url = (url or os.environ["SUPABASE_URL"]).rstrip("/")
        key = service_key or os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        self.client = httpx.Client(
            base_url=f"{self.url}/rest/v1",
            headers={"apikey": key, "Authorization": f"Bearer {key}",
                     "Content-Type": "application/json"},
            timeout=60.0)

    def _post(self, path: str, payload, params=None, prefer="return=representation"):
        r = self.client.post(path, json=payload, params=params or {},
                             headers={"Prefer": prefer})
        r.raise_for_status()
        return r.json() if r.text else None

    def get_source(self, source_id: str) -> Optional[dict]:
        r = self.client.get("/food_sources", params={"id": f"eq.{source_id}"})
        r.raise_for_status()
        rows = r.json()
        return rows[0] if rows else None

    def start_run(self, source_id: str, input_ref: str) -> str:
        rows = self._post("/import_runs", {"source_id": source_id, "input_ref": input_ref})
        return rows[0]["id"]

    def get_resume_checkpoint(self, source_id: str, input_ref: str) -> Optional[str]:
        r = self.client.get("/import_runs", params={
            "source_id": f"eq.{source_id}", "input_ref": f"eq.{input_ref}",
            "status": "in.(interrupted,failed,running)",
            "order": "started_at.desc", "limit": "1"})
        r.raise_for_status()
        rows = r.json()
        return rows[0]["last_checkpoint"] if rows else None

    def commit_batch(self, run_id: str, foods: list[Food], checkpoint: str) -> list[str]:
        payload = []
        for f in foods:
            row = f.to_row()
            row["last_verified_at"] = utcnow().isoformat()
            payload.append(row)
        rows = self._post("/foods", payload,
                          params={"on_conflict": "source_id,external_id"},
                          prefer="resolution=merge-duplicates,return=representation")
        patch = self.client.patch("/import_runs", params={"id": f"eq.{run_id}"},
                                  json={"last_checkpoint": checkpoint})
        patch.raise_for_status()
        return [r["id"] for r in rows]

    def finish_run(self, run_id: str, status: str, stats: dict) -> None:
        r = self.client.patch("/import_runs", params={"id": f"eq.{run_id}"},
                              json={"status": status, "stats": stats,
                                    "finished_at": utcnow().isoformat()})
        r.raise_for_status()

    def add_review(self, run_id, food_id, reason, detail) -> None:
        self._post("/review_queue", {"run_id": run_id, "food_id": food_id,
                                     "reason": reason, "detail": detail},
                   prefer="return=minimal")

    def add_duplicate(self, food_a, food_b, match_type, score) -> None:
        self._post("/duplicate_pairs",
                   {"food_a": food_a, "food_b": food_b,
                    "match_type": match_type, "score": score},
                   params={"on_conflict": "food_a,food_b"},
                   prefer="resolution=ignore-duplicates,return=minimal")

    def iter_food_index(self) -> Iterable[dict]:
        offset, page = 0, 1000
        while True:
            r = self.client.get("/foods", params={
                "select": "id,barcode,natural_key,brand,name",
                "offset": str(offset), "limit": str(page)})
            r.raise_for_status()
            rows = r.json()
            if not rows:
                return
            yield from rows
            offset += page
