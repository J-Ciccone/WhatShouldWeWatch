import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rememberLobby } from "../lib/recentLobbies";
import { createLobby } from "../services/lobby";
import { renderWithApp } from "../test/render";
import { HomePage } from "./HomePage";
import { NewLobbyPage } from "./NewLobbyPage";

vi.mock("../services/lobby", () => ({ createLobby: vi.fn(() => Promise.resolve("NEW234")) }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => localStorage.clear());

describe("HomePage", () => {
  it("joins with a typed code", async () => {
    const user = userEvent.setup();
    renderWithApp(<HomePage />);
    const join = screen.getByRole("button", { name: /Join/ });
    expect(join).toBeDisabled();
    await user.type(screen.getByLabelText(/Enter the code/), "abc234{Enter}");
    expect(screen.getByTestId("location")).toHaveTextContent("/lobby/ABC234");
  });

  it("joins with a pasted invite link", async () => {
    const user = userEvent.setup();
    renderWithApp(<HomePage />);
    await user.click(screen.getByLabelText(/Enter the code/));
    await user.paste("https://mymoviepicker.web.app/lobby/XYZ789");
    await user.click(screen.getByRole("button", { name: /Join/ }));
    expect(screen.getByTestId("location")).toHaveTextContent("/lobby/XYZ789");
  });

  it("offers recent lobbies", () => {
    rememberLobby("ABC234");
    renderWithApp(<HomePage />);
    expect(screen.getByRole("link", { name: "ABC234" })).toHaveAttribute("href", "/lobby/ABC234");
  });
});

describe("NewLobbyPage", () => {
  it("creates a lobby with the chosen settings and the host's name", async () => {
    const user = userEvent.setup();
    renderWithApp(<NewLobbyPage />, { route: "/new" });
    const create = screen.getByRole("button", { name: /Create lobby/ });
    expect(create).toBeDisabled();

    await user.type(screen.getByLabelText("Your name"), "Hana");
    await user.click(screen.getByRole("radio", { name: "5" }));
    await user.click(screen.getByRole("radio", { name: /Vote for any/ }));
    await user.click(create);

    expect(createLobby).toHaveBeenCalledWith("me", { numMovies: 5, unlimitedVotes: true }, "Hana");
    expect(localStorage.getItem("wsww:name")).toBe("Hana");
    expect(screen.getByTestId("location")).toHaveTextContent("/lobby/NEW234");
  });

  it("prefills the name from last time", () => {
    localStorage.setItem("wsww:name", "Hana");
    renderWithApp(<NewLobbyPage />, { route: "/new" });
    expect(screen.getByLabelText("Your name")).toHaveValue("Hana");
  });
});
