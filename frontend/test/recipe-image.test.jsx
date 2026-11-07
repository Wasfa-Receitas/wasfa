import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecipeImage from "../src/components/RecipeImage";

describe("Fotos de receitas", () => {
  it("usa variantes responsivas e recupera a foto original se a otimizada falhar", () => {
    const recipe = { nome: "Panqueca", imagem_url: "/images/receitas/panqueca-de-banana.jpg" };
    const { container } = render(<RecipeImage recipe={recipe} />);
    const image = screen.getByAltText("Panqueca");
    expect(image.getAttribute("src")).toContain("-320.webp");
    expect(image.getAttribute("srcset")).toContain("1200w");
    fireEvent.error(image);
    expect(image.getAttribute("src")).toBe(recipe.imagem_url);
    expect(image.hasAttribute("srcset")).toBe(false);
    fireEvent.error(image);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".recipe-image-placeholder")).toBeTruthy();
  });
  it("exibe URLs novas sem exigir variantes geradas", () => {
    render(<RecipeImage recipe={{ nome: "Nova receita", imagem_url: "/uploads/nova.webp" }} />);
    expect(screen.getByAltText("Nova receita").getAttribute("src")).toBe("/uploads/nova.webp");
  });
});
