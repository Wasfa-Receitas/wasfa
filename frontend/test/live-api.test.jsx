import React from "react";
import { it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Recipes from "../src/pages/Recipes";
import RecipeDetail from "../src/pages/RecipeDetail";

it.skipIf(import.meta.env.MODE !== "live")("consulta receitas MySQL pelo serviço React e abre detalhes do card, sem escrita", async () => {
  window.history.replaceState({}, "", "/pages/receitas.html?name=banana&ingredients=banana,aveia");
  render(<Recipes />);
  const [link] = await screen.findAllByRole("link", { name: /banana/i }, { timeout: 10000 });
  const title = link.getAttribute("aria-label");
  const target = link.getAttribute("href");
  expect(target).toMatch(/receita\.html\?id=\d+/);
  cleanup();
  window.history.replaceState({}, "", target);
  render(<RecipeDetail />);
  await screen.findByRole("heading", { name: title }, { timeout: 10000 });
  expect(screen.getByRole("heading", { name: "Ingredientes" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Modo de preparo" })).toBeTruthy();
}, 15000);
