/**
 * Safely extract a single string value from Express query parameters.
 * Express types req.query values as string | string[] | ParsedQs | ParsedQs[].
 */
export function queryString(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

export function queryNumber(val: unknown): number | undefined {
  const s = queryString(val);
  if (!s) return undefined;
  const n = Number(s);
  return isNaN(n) ? undefined : n;
}
