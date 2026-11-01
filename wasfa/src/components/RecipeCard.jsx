import FavoriteButton from "./FavoriteButton";
export default function RecipeCard({ recipe }) {
  return <article className="receita"><a href="/pages/receita.html" className="recipe-card-link" aria-label={recipe.title} /><img src={recipe.image} alt={recipe.title} /><div className="receita-info"><h4>{recipe.category}</h4><p className="receita-title">{recipe.title}</p><p className="receita-prep">{recipe.prep}</p></div><div className="receita-rating"><span className={"receita-category " + recipe.badge}>{recipe.label}</span><p className="receita-rate"><i className="fa-solid fa-star" /> {recipe.rating}</p></div><FavoriteButton id={recipe.id} title={recipe.title} /></article>;
}
