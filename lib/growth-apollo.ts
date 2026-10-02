/** The selected search employer must still match before any email is returned. */
export function matchesApolloEmployer(
  data: unknown,
  expected: { personId: string; domain: string; organization: string },
) {
  if (!data || typeof data !== "object") return false;
  const person = (data as Record<string, unknown>).person;
  if (!person || typeof person !== "object") return false;
  const p = person as Record<string, unknown>;
  const normalize = (value: unknown) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";
  return (
    p.id === expected.personId &&
    normalize(p.domain) === normalize(expected.domain) &&
    normalize(p.organization) === normalize(expected.organization)
  );
}
