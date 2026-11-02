import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useReducer } from "react";
import { describe, expect, it, vi } from "vitest";
import { MenuOverlay } from "@/demo/MenuOverlay";
import { openAt } from "@/demo/menu-state";
import { initialState, reducer } from "@/demo/state";
import type { Command } from "@/lib/commands";

function Harness({ exec }: { exec: (c: Command) => void }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...initialState("tokyo-night"),
    phase: "desktop" as const,
    overlay: openAt("omarchy", [], { theme: "tokyo-night", view: "tuned" }),
  }));
  if (!state.overlay) return <p>closed</p>;
  return <MenuOverlay overlay={state.overlay} state={state} interactive listId="t" dispatch={dispatch} exec={exec} />;
}

describe("Omarchy menu", () => {
  it("filters as you type and runs the chosen row", async () => {
    const exec = vi.fn();
    const user = userEvent.setup();
    render(<Harness exec={exec} />);
    const input = screen.getByRole("combobox", { name: "Search the menu" });
    await user.type(input, "upd");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([expect.stringContaining("Update")]);
    await user.keyboard("{Enter}");
    expect(exec).toHaveBeenCalledWith(expect.objectContaining({ type: "notify", title: "Update" }));
  });

  it("opens a submenu on the current choice and goes back with the left arrow", async () => {
    const user = userEvent.setup();
    render(<Harness exec={vi.fn()} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "appearance");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox", { name: "Appearance" })).toBeTruthy();
    expect(screen.getByRole("option", { selected: true }).textContent).toContain("Theme");
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("option", { selected: true }).textContent).toContain("Appearance");
  });
});
