export function normalizeVerificationQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, "/");
}

export function matchesVerificationQuery(
  storedValue: string,
  query: string,
): boolean {
  return normalizeVerificationQuery(storedValue) === normalizeVerificationQuery(query);
}
