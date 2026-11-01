import React from "react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import AuthPanel from "../src/components/AuthPanel";
import Recipes from "../src/pages/Recipes";
import RecipeDetail from "../src/pages/RecipeDetail";
import Profile from "../src/pages/Profile";
import { api, authApi, session } from "../src/services/api";
const usuario = { id_usuario: 4, nome: "Maria", email: "maria@example.com" };
const recipe = { id_receita: 7, nome: "Vitamina de banana", dificuldade: "Facil", tempo_preparo: 5 };
const response = (data, status = 200) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) });
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); window.history.replaceState({}, "", "/");
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => { vi.unstubAllGlobals(); });
function Account() {
  const { user, loading, error, login, register } = useAuth();
  return <><p>{loading ? "Carregando sessão" : user?.nome ?? "Visitante"}</p><p>{error}</p>
    <button onClick={() => login({ email: usuario.email, senha: "test-password" })}>Login de teste</button>
    <button onClick={() => register({ nome: usuario.nome, email: usuario.email, senha: "test-password" })}>Cadastro de teste</button></>;
}
describe("Autenticação React com serviço real e HTTP simulado", () => {
  it.each([['Login de teste', '/auth/login'], ['Cadastro de teste', '/auth/register']])("%s envia dados, guarda somente JWT e atualiza usuário", async (label, endpoint) => {
    fetch.mockImplementation(() => response({ usuario, accessToken: "test-token", tokenType: "Bearer", expiresIn: 3600 }));
    render(<AuthProvider><Account /></AuthProvider>);
    fireEvent.click(screen.getByText(label));
    await screen.findByText("Maria");
    expect(fetch.mock.calls[0][0]).toMatch(new RegExp(`${endpoint}$`));
    expect(JSON.parse(fetch.mock.calls[0][1].body).senha).toBe("test-password");
    expect(session.get()).toBe("test-token");
    expect(Object.keys(localStorage)).toEqual([]);
    expect(Object.keys(sessionStorage)).toEqual(["wasfa:accessToken"]);
  });
  it("restaura sessão usando /auth/me e remove senhas do protótipo antigo", async () => {
    session.set("test-token");
    localStorage.setItem(usuario.email, JSON.stringify({ username: "Maria", email: usuario.email, password: "legacy" }));
    localStorage.setItem("loggedUser", "Maria");
    localStorage.setItem("other", "preserve");
    fetch.mockImplementation(() => response(usuario));
    render(<AuthProvider><Account /></AuthProvider>);
    await screen.findByText("Maria");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer test-token");
    expect(localStorage.getItem(usuario.email)).toBeNull();
    expect(localStorage.getItem("loggedUser")).toBeNull();
    expect(localStorage.getItem("other")).toBe("preserve");
  });
  it("token inválido limpa a sessão", async () => {
    session.set("expired");
    fetch.mockImplementation(() => response({ message: "Token inválido." }, 401));
    render(<AuthProvider><Account /></AuthProvider>);
    await screen.findByText("Visitante");
    expect(session.get()).toBeNull();
  });
  it("perfil mostra indisponibilidade sem apagar token e permite tentar novamente", async () => {
    session.set("test-token");
    fetch.mockRejectedValueOnce(new TypeError("network")).mockImplementation(() => response(usuario));
    render(<AuthProvider><Profile /></AuthProvider>);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(session.get()).toBe("test-token");
    fireEvent.click(screen.getByText("Tentar novamente"));
    await screen.findByText("Maria");
  });
  it("formulário exibe credenciais inválidas e não salva senha", async () => {
    fetch.mockImplementation(() => response({ message: "Credenciais inválidas." }, 401));
    const { container } = render(<AuthProvider><AuthPanel /></AuthProvider>);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: usuario.email } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "wrong-password" } });
    fireEvent.submit(container.querySelector("form"));
    await screen.findByText("Credenciais inválidas.");
    expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
  });
  it("cadastro valida confirmação e exibe email duplicado do servidor", async () => {
    fetch.mockImplementation(() => response({ message: "Email já cadastrado." }, 409));
    const { container } = render(<AuthProvider><AuthPanel /></AuthProvider>);
    fireEvent.click(screen.getByText("Criar conta"));
    for (const [label, value] of [["Nome", "Maria"], ["Email", usuario.email], ["Senha", "test-password"], ["Confirmar senha", "different"]]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.submit(container.querySelector("form"));
    await screen.findByText("As senhas não conferem!");
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "test-password" } });
    fireEvent.submit(container.querySelector("form"));
    await screen.findByText("Email já cadastrado.");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ nome: "Maria", email: usuario.email, senha: "test-password" });
  });
});
describe("Receitas MySQL no React", () => {
  it("envia os dois filtros, mostra carregamento, card com ID e paginação", async () => {
    window.history.replaceState({}, "", "/pages/receitas.html?name=vitamina&ingredients=banana,aveia");
    let resolve;
    fetch.mockImplementationOnce(() => new Promise((done) => { resolve = done; }))
      .mockImplementation(() => response({ items: [{ ...recipe, id_receita: 8, nome: "Segunda receita" }], total: 11, page: 2, limit: 10 }));
    render(<Recipes />);
    expect(screen.getByText("Carregando receitas...")).toBeTruthy();
    resolve(await response({ items: [recipe], total: 11, page: 1, limit: 10 }));
    const link = await screen.findByRole("link", { name: recipe.nome });
    expect(link.getAttribute("href")).toBe("/pages/receita.html?id=7");
    const query = new URL(fetch.mock.calls[0][0]).searchParams;
    expect(query.get("name")).toBe("vitamina"); expect(query.get("ingredients")).toBe("banana,aveia");
    fireEvent.click(screen.getByText("Próxima"));
    await screen.findByText("Segunda receita");
    expect(new URL(fetch.mock.calls[1][0]).searchParams.get("page")).toBe("2");
  });
  it("mostra ausência de resultados", async () => {
    fetch.mockImplementation(() => response({ items: [], total: 0, page: 1, limit: 10 }));
    render(<Recipes />);
    await screen.findByText("Nenhuma receita encontrada.");
  });
  it("mostra erro e recupera listagem ao tentar novamente", async () => {
    fetch.mockRejectedValueOnce(new TypeError("network")).mockImplementation(() => response({ items: [recipe], total: 1, page: 1, limit: 10 }));
    render(<Recipes />);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByText("Tentar novamente"));
    await screen.findByText(recipe.nome);
  });
  it("carrega detalhes do ID selecionado com ingredientes e preparo reais", async () => {
    window.history.replaceState({}, "", "/pages/receita.html?id=7");
    fetch.mockImplementation(() => response({ ...recipe, modo_preparo: "Bata no liquidificador.", ingredientes: [{ id_ingrediente: 1, nome: "Banana", quantidade: "1 unidade" }] }));
    render(<RecipeDetail />);
    await screen.findByRole("heading", { name: recipe.nome });
    expect(fetch.mock.calls[0][0]).toMatch(/\/recipes\/7$/);
    expect(screen.getByText("1 unidade — Banana")).toBeTruthy();
    expect(screen.getByText("Bata no liquidificador.")).toBeTruthy();
    expect(document.title).toBe(`${recipe.nome} | Wasfa`);
  });
  it("ID ausente não consulta API", () => {
    render(<RecipeDetail />);
    expect(screen.getByRole("alert").textContent).toContain("Selecione uma receita válida");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("detalhe inexistente exibe mensagem 404", async () => {
    window.history.replaceState({}, "", "/pages/receita.html?id=999");
    fetch.mockImplementation(() => response({ message: "Receita não encontrada." }, 404));
    render(<RecipeDetail />);
    await screen.findByText("Receita não encontrada.");
  });
});
it("serviço trata erros de DTO sem incluir senha ou autenticação em buscas públicas", async () => {
  session.set("test-token");
  fetch.mockImplementation(() => response({ message: ["email must be an email", "senha must be longer"] }, 400));
  await expect(authApi.login({ email: "invalid", senha: "x" })).rejects.toMatchObject({ status: 400 });
  expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  await expect(api("/recipes")).rejects.toMatchObject({ status: 400 });
  expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
});