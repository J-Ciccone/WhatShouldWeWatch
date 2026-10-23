import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, generateLobbyCode, isValidLobbyCode, normalizeLobbyCode } from "./lobbyCode";

describe("lobby codes", () => {
  it("generates valid 6-character codes from the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateLobbyCode();
      expect(code).toHaveLength(6);
      expect([...code].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
      expect(isValidLobbyCode(code)).toBe(true);
    }
  });

  it("normalizes case, spaces and dashes", () => {
    expect(normalizeLobbyCode(" abc-234 ")).toBe("ABC234");
  });

  it("pulls the code out of a pasted invite link", () => {
    expect(normalizeLobbyCode("https://mymoviepicker.web.app/lobby/abc234")).toBe("ABC234");
    expect(normalizeLobbyCode("Join us! https://whatshouldwewatch.net/lobby/XYZ789?x=1")).toBe("XYZ789");
  });

  it("rejects codes with the wrong length or look-alike characters", () => {
    expect(isValidLobbyCode("ABC23")).toBe(false);
    expect(isValidLobbyCode("ABC2345")).toBe(false);
    expect(isValidLobbyCode("ABC10O")).toBe(false);
    expect(isValidLobbyCode("abc234")).toBe(false);
  });

  it("matches the pattern in the database rules", async () => {
    const { readFileSync } = await import("node:fs");
    const rules = readFileSync("database.rules.json", "utf8");
    expect(rules).toContain(`[${CODE_ALPHABET}]{6}`);
  });
});
