// No 0/O or 1/I so codes are easy to read aloud and type.
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function generateLobbyCode(): string {
  // 256 is a multiple of the 32-character alphabet, so this has no modulo bias.
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/**
 * Turns whatever someone typed or pasted into a code: uppercases it, strips
 * spaces/dashes, and pulls the code out of a pasted invite link.
 */
export function normalizeLobbyCode(input: string): string {
  const fromLink = /\/lobby\/([A-Za-z0-9-]+)/.exec(input);
  return (fromLink ? fromLink[1]! : input).toUpperCase().replace(/[\s-]/g, "");
}

export function isValidLobbyCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}
