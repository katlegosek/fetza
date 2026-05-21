/** Normalizes Expo Router search params that may be `string | string[]`. */
export function asSingleRouteParam(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}
