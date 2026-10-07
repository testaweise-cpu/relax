"use client";

import { useEffect, useRef, useState } from "react";
import {
  presenceResponseSchema,
  type PresenceResponse,
} from "@/lib/data/presence-dto";

export const POLL_MS = 60_000;

/**
 * Lädt /api/presence alle 60 s neu – aber nur, solange der Tab sichtbar ist.
 * Wird der Tab wieder sichtbar und sind die Daten älter als 60 s, wird sofort
 * nachgeladen. Bei Fehlern bleibt der letzte Stand stehen (`stale`).
 */
export function usePresence(initial: PresenceResponse) {
  const [data, setData] = useState(initial);
  const [stale, setStale] = useState(false);
  const last = useRef(Date.parse(initial.updatedAt));

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let controller: AbortController | undefined;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch("/api/presence", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const parsed = presenceResponseSchema.safeParse(await res.json());
        if (!parsed.success) throw new Error("ungültige Antwort");
        setData(parsed.data);
        setStale(false);
        last.current = Date.now();
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStale(true);
      }
    };

    const start = () => {
      stop();
      timer = setInterval(load, POLL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - last.current >= POLL_MS) void load();
        start();
      } else {
        stop();
        controller?.abort();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { data, stale };
}
