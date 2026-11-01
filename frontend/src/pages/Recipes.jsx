import { useEffect, useState } from "react";
import { recipesApi } from "../services/api";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
export default function Recipes() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name") ?? params.get("q") ?? "";
  const ingredients = params.get("ingredients") ?? "";
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setData(null);
    recipesApi.list({ name, ingredients, page: String(page), limit: "10" }, controller.signal)
      .then(setData).catch((err) => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [name, ingredients, page, attempt]);
  return <main className="main-receitas"><section className="init-receitas">
    <h1 className="init-receitas-h1">Receitas</h1>
    <SearchBar />
    <div className="receitas-container" aria-busy={loading}>
      {loading && <p role="status">Carregando receitas...</p>}
      {error && <div role="alert"><p>{error}</p><button type="button" className="btn btn-cadastrar" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button></div>}
      {!loading && !error && data?.items.length === 0 && <p role="status">Nenhuma receita encontrada.</p>}
      {!loading && !error && data?.items.map((recipe) => <RecipeCard key={recipe.id_receita} recipe={recipe} />)}
    </div>
    {!loading && !error && data && data.total > 0 && <nav className="recipes-pagination" aria-label="Paginação de receitas">
      <button className="btn btn-cadastrar" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Anterior</button>
      <span>Página {page} de {Math.ceil(data.total / data.limit)}</span>
      <button className="btn btn-cadastrar" disabled={page * data.limit >= data.total} onClick={() => setPage((value) => value + 1)}>Próxima</button>
    </nav>}
  </section></main>;
}
