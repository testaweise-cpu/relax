"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { PresenceResponse } from "@/lib/data/presence-dto";
import { parsePresenceResponse } from "@/lib/data/presence-guard";

export const POLL_MS = 60_000;

/**
 * Gemeinsamer Live-Stand für alle Anzeigen einer Seite (Hero-Pille, Leiste,
 * Raster): EIN Abruf von /api/presence alle 60 s, egal wie viele Komponenten
 * zuhören – und nur, solange der Tab sichtbar ist. Wird der Tab wieder
 * sichtbar und sind die Daten älter als 60 s, wird sofort nachgeladen.
 * Bei Fehlern bleibt der letzte Stand stehen (`stale`).
 */
type State = { data: PresenceResponse; stale: boolean };

let state: State | undefined;
let last = 0;
let timer: ReturnType<typeof setInterval> | undefined;
let controller: AbortController | undefined;
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

async function load() {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch("/api/presence", {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(String(res.status));
    const parsed = parsePresenceResponse(await res.json());
    if (!parsed) throw new Error("ungültige Antwort");
    last = Date.now();
    set({ data: parsed, stale: false });
  } catch (e) {
    if ((e as Error).name !== "AbortError" && state)
      set({ ...state, stale: true });
  }
}

function startTimer() {
  stopTimer();
  timer = setInterval(load, POLL_MS);
}
function stopTimer() {
  if (timer) clearInterval(timer);
  timer = undefined;
}
function onVisibility() {
  if (document.visibilityState === "visible") {
    if (Date.now() - last >= POLL_MS) void load();
    startTimer();
  } else {
    stopTimer();
    controller?.abort();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    if (document.visibilityState === "visible") startTimer();
    document.addEventListener("visibilitychange", onVisibility);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopTimer();
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      // nächste Seite beginnt mit ihrem eigenen Serverstand
      state = undefined;
    }
  };
}

export function usePresence(initial: PresenceResponse) {
  // Serverstand der Seite übernehmen, wenn er neuer ist als der bekannte
  const initialAt = Date.parse(initial.updatedAt);
  useEffect(() => {
    if (!state || initialAt > last) {
      last = Math.max(last, initialAt);
      state = { data: initial, stale: false };
    }
    // nur beim Einhängen: `initial` ist der Serverstand dieser Seite
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => undefined,
  );
  return current && Date.parse(current.data.updatedAt) >= initialAt
    ? current
    : { data: initial, stale: false };
}
