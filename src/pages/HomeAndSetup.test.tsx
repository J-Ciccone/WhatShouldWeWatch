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
  it("offers hosting or entering a code, with no code box until asked", () => {
    renderWithApp(<HomePage />);
    expect(screen.getByRole("link", { name: /Host a movie night/ })).toHaveAttribute("href", "/new");
    expect(screen.getByRole("button", { name: /Enter a code/ })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Enter the code/)).not.toBeInTheDocument();
  });

  it("joins with a typed code", async () => {
    const user = userEvent.setup();
    renderWithApp(<HomePage />);
    await user.click(screen.getByRole("button", { name: /Enter a code/ }));
    const input = screen.getByLabelText(/Enter the code/);
    expect(input).toHaveFocus();
    expect(screen.getByRole("button", { name: /Join/ })).toBeDisabled();
    await user.type(input, "abc234{Enter}");
    expect(screen.getByTestId("location")).toHaveTextContent("/lobby/ABC234");
  });

  it("joins with a pasted invite link", async () => {
    const user = userEvent.setup();
    renderWithApp(<HomePage />);
    await user.click(screen.getByRole("button", { name: /Enter a code/ }));
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
