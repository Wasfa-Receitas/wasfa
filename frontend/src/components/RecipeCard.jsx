import FavoriteButton from "./FavoriteButton";
export default function RecipeCard({ recipe }) {
  return <article className="receita">
    <a href={`/pages/receita.html?id=${recipe.id_receita}`} className="recipe-card-link" aria-label={recipe.nome} />
    <div className="recipe-image-placeholder" aria-hidden="true"><i className="fa-solid fa-utensils" /></div>
    <div className="receita-info"><p className="receita-title">{recipe.nome}</p><p className="receita-prep">{recipe.dificuldade} • {recipe.tempo_preparo} min</p></div>
    <FavoriteButton id={String(recipe.id_receita)} title={recipe.nome} />
  </article>;
}
