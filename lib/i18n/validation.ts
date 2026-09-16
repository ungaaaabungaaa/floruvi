import type { Messages } from "./messages";

type Validation = Messages["common"]["validation"];
type RequestErrors = Messages["common"]["requestErrors"];

/** Show a translated message for the first failed enquiry field. */
export function validationMessage(
  issue: { path: PropertyKey[] } | undefined,
  t: Validation,
  field?: keyof Validation,
) {
  const key = (field ?? issue?.path[0]) as keyof Validation | undefined;
  return (key && t[key]) || t.generic;
}

/** Translate an enquiry API failure without exposing English server text. */
export function requestErrorMessage(status: number, t: RequestErrors, v: Validation) {
  if (status === 429) return t.tooMany;
  if (status === 400) return v.generic;
  return t.notSaved;
}
