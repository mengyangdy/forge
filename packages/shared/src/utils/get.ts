import { type Key, type NamePath, isObjectRecord, toSegments } from "./path-utils";

/**
 * Safely read a deep value.
 */
export function deepGet<T>(obj: T, path: NamePath | null): unknown;
export function deepGet<T, D>(obj: T, path: NamePath | null, def: D): D;
export function deepGet<T, D>(obj: T, path: NamePath | null, def?: D): unknown {
  if (path === null || path === undefined) return def as D;

  const segs = toSegments(path);

  if (segs.length === 0) return def as D;

  let cur: unknown = obj;

  for (const seg of segs) {
    if (!isObjectRecord(cur) && !Array.isArray(cur)) return def as D;

    cur = (cur as Record<Key, unknown>)[seg];

    if (cur === undefined) return def as D;
  }

  return cur;
}
