// No 0/O or 1/I so codes are easy to read aloud and type.
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function generateLobbyCode(): string {
  // 256 is a multiple of the 32-character alphabet, so this has no modulo bias.
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Uppercases and strips spaces/dashes so pasted or typed codes still match. */
export function normalizeLobbyCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function isValidLobbyCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}
