import { useEffect, useState } from "react";
import { recipesApi } from "../services/api";
import FavoriteButton from "../components/FavoriteButton";
import RecipeImage from "../components/RecipeImage";
export default function RecipeDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  const validId = /^[1-9]\d*$/.test(id ?? "") && Number(id) <= 2147483647;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(validId);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();
    setLoading(true); setError(""); setRecipe(null);
    recipesApi.detail(id, controller.signal).then((data) => { setRecipe(data); document.title = `${data.nome} | Wasfa`; })
      .catch((err) => { if (err.name !== "AbortError") setError(err.status === 404 ? "Receita não encontrada." : err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, validId, attempt]);
  return <main className="main-receita"><article className="receita-page">
    <a href="/pages/receitas.html" className="receita-voltar"><i className="fa-solid fa-arrow-left" /> Voltar às receitas</a>
    {!validId && <p role="alert">Selecione uma receita válida na listagem.</p>}
    {loading && <p role="status">Carregando receita...</p>}
    {error && <div role="alert"><p>{error}</p><button className="btn btn-cadastrar" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button></div>}
    {recipe && !loading && !error && <>
      <section className="receita-hero">
        <RecipeImage recipe={recipe} className="receita-hero-img" loading="eager" />
        <div className="receita-hero-info">
          <h1 className="title receita-title">{recipe.nome}</h1>
          <ul className="receita-meta">
            <li><i className="fa-regular fa-clock" /><span>{recipe.tempo_preparo} min</span></li>
            <li><i className="fa-solid fa-gauge-simple" /><span>{recipe.dificuldade}</span></li>
          </ul>
          <FavoriteButton id={String(recipe.id_receita)} title={recipe.nome} />
        </div>
      </section>
      <section className="receita-corpo">
        <div className="receita-bloco receita-ingredientes"><h2 className="title">Ingredientes</h2>
          {recipe.ingredientes.length ? <ul>{recipe.ingredientes.map((item) => <li key={item.id_ingrediente}>{item.quantidade} — {item.nome}</li>)}</ul> : <p>Ingredientes não informados.</p>}
        </div>
        <div className="receita-bloco receita-preparo"><h2 className="title">Modo de preparo</h2><p className="recipe-preparation">{recipe.modo_preparo || "Modo de preparo não informado."}</p></div>
      </section>
    </>}
  </article></main>;
}
