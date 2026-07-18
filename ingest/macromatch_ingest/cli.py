"""CLI entry point.

  python -m macromatch_ingest.cli afcd <file.xlsx|.csv> [--db macromatch.db]
         [--supabase] [--limit N] [--no-resume]

--supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars and a
licence-cleared food_sources row (seeded by schema.sql).
"""
import argparse

from .logging_setup import setup
from .store import SQLiteStore, SupabaseStore
from .importers import AFCDImporter


def main() -> None:
    ap = argparse.ArgumentParser(prog="macromatch-ingest")
    sub = ap.add_subparsers(dest="cmd", required=True)

    afcd = sub.add_parser("afcd", help="import the FSANZ AFCD workbook (xlsx/csv)")
    afcd.add_argument("file", help="path to the downloaded AFCD file")
    for p in (afcd,):
        p.add_argument("--db", default="macromatch.db", help="SQLite path (dev mode)")
        p.add_argument("--supabase", action="store_true", help="write to Supabase instead of SQLite")
        p.add_argument("--limit", type=int, default=None)
        p.add_argument("--no-resume", action="store_true")
        p.add_argument("--log-level", default="INFO")

    args = ap.parse_args()
    setup(args.log_level)

    if args.supabase:
        store = SupabaseStore()
    else:
        store = SQLiteStore(args.db)
        if store.get_source("afcd_r2") is None:
            store.register_source(
                "afcd_r2", "Australian Food Composition Database, Release 2",
                "Food Standards Australia New Zealand",
                "https://www.foodstandards.gov.au/science-data/monitoringnutrients/afcd",
                "CC BY (per FSANZ copyright statement)", True,
                "Source: Australian Food Composition Database Release 2, FSANZ.")

    if args.cmd == "afcd":
        stats = AFCDImporter(store).run(args.file, resume=not args.no_resume, limit=args.limit)
        print(f"Done: {stats}")


if __name__ == "__main__":
    main()
