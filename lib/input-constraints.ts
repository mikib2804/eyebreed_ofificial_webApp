export const PERSON_NAME_INPUT_PATTERN = "[\\p{L}\\p{M}][\\p{L}\\p{M}\\p{Pd}'’.׳״ .]{1,79}";
export const PLACE_NAME_INPUT_PATTERN = "[\\p{L}\\p{M}][\\p{L}\\p{M}\\p{Pd}'’.׳״ ,&\\(\\)]{1,79}";
export const PHONE_INPUT_PATTERN = "\\+?[0-9\\(\\) .\\-]{7,30}";
export const POSTAL_CODE_INPUT_PATTERN = "[\\p{L}\\p{N}][\\p{L}\\p{N} \\-]{1,19}";

export const personNameInputAttributes = {
  minLength: 2,
  maxLength: 80,
  pattern: PERSON_NAME_INPUT_PATTERN,
} as const;

export const placeNameInputAttributes = {
  minLength: 2,
  maxLength: 80,
  pattern: PLACE_NAME_INPUT_PATTERN,
} as const;

export const phoneInputAttributes = {
  type: "tel",
  inputMode: "tel",
  autoComplete: "tel",
  minLength: 7,
  maxLength: 30,
  pattern: PHONE_INPUT_PATTERN,
} as const;

export const postalCodeInputAttributes = {
  minLength: 2,
  maxLength: 20,
  pattern: POSTAL_CODE_INPUT_PATTERN,
} as const;

/** Removes characters that can never be part of an international phone number. */
export function sanitizePhoneInput(value: string) {
  const allowed = value.replace(/[^0-9+(). -]/g, "");
  const hasLeadingPlus = allowed.trimStart().startsWith("+");
  return `${hasLeadingPlus ? "+" : ""}${allowed.replace(/\+/g, "").trimStart()}`.slice(0, 30);
}
