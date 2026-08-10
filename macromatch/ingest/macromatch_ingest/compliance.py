"""Compliance layer: licensing gate, robots.txt, rate limiting, polite HTTP.

Rules enforced in code, not in comments:
  * An importer cannot run unless its source row exists with licence_cleared=True.
  * Every HTTP GET checks robots.txt for our user agent first.
  * A token-bucket limiter enforces a per-host request interval.
  * We identify ourselves honestly and never bypass auth/CAPTCHA/anti-bot
    measures — if a request is blocked (401/403/robots), we stop and report,
    we do not retry around it.
"""
from __future__ import annotations

import logging
import time
import urllib.robotparser
from urllib.parse import urlparse

import httpx

log = logging.getLogger("macromatch.compliance")

USER_AGENT = "MacroMatchDataBot/1.0 (+https://macromatch.example/databot; data@macromatch.example)"


class LicenceError(RuntimeError):
    pass


class RobotsDisallowed(RuntimeError):
    pass


def assert_licence_cleared(store, source_id: str) -> dict:
    src = store.get_source(source_id)
    if src is None:
        raise LicenceError(
            f"source '{source_id}' is not registered in food_sources — add it with "
            f"its licence terms before importing")
    if not src.get("licence_cleared"):
        raise LicenceError(
            f"source '{source_id}' exists but licence_cleared is false — clear the "
            f"licence review before importing")
    return src


class RateLimiter:
    """Minimum interval between requests, per host."""

    def __init__(self, min_interval_s: float = 5.0) -> None:
        self.min_interval_s = min_interval_s
        self._last: dict[str, float] = {}

    def wait(self, host: str) -> None:
        now = time.monotonic()
        last = self._last.get(host, 0.0)
        delta = now - last
        if delta < self.min_interval_s:
            time.sleep(self.min_interval_s - delta)
        self._last[host] = time.monotonic()


class PoliteFetcher:
    """robots.txt-aware, rate-limited, retrying HTTP fetcher."""

    RETRYABLE = {429, 500, 502, 503, 504}

    def __init__(self, min_interval_s: float = 5.0, max_retries: int = 3,
                 timeout_s: float = 30.0) -> None:
        self.limiter = RateLimiter(min_interval_s)
        self.max_retries = max_retries
        self._robots: dict[str, urllib.robotparser.RobotFileParser] = {}
        self._client = httpx.Client(
            headers={"User-Agent": USER_AGENT}, timeout=timeout_s, follow_redirects=True)

    def _robots_for(self, url: str) -> urllib.robotparser.RobotFileParser:
        host = urlparse(url).netloc
        if host not in self._robots:
            rp = urllib.robotparser.RobotFileParser()
            robots_url = f"{urlparse(url).scheme}://{host}/robots.txt"
            try:
                resp = self._client.get(robots_url)
                rp.parse(resp.text.splitlines() if resp.status_code == 200 else [])
            except httpx.HTTPError:
                rp.parse([])  # unreachable robots.txt -> assume allowed, stay rate-limited
            self._robots[host] = rp
        return self._robots[host]

    def get(self, url: str) -> httpx.Response:
        if not self._robots_for(url).can_fetch(USER_AGENT, url):
            raise RobotsDisallowed(f"robots.txt disallows fetching {url} — skipping, not bypassing")
        host = urlparse(url).netloc
        attempt = 0
        while True:
            self.limiter.wait(host)
            attempt += 1
            try:
                resp = self._client.get(url)
            except httpx.HTTPError as e:
                if attempt > self.max_retries:
                    raise
                backoff = 2 ** attempt
                log.warning("network error on %s (%s), retry %d in %ds", url, e, attempt, backoff)
                time.sleep(backoff)
                continue
            if resp.status_code in (401, 403):
                # Access control — hard stop by design. We do not work around it.
                resp.raise_for_status()
            if resp.status_code in self.RETRYABLE and attempt <= self.max_retries:
                backoff = float(resp.headers.get("Retry-After") or 2 ** attempt)
                log.warning("HTTP %d on %s, retry %d in %.0fs", resp.status_code, url, attempt, backoff)
                time.sleep(backoff)
                continue
            resp.raise_for_status()
            return resp
