import { useState } from "react";
import { recipes } from "../data/recipes";
import RecipeCard from "../components/RecipeCard";
import CategoryFilters from "../components/CategoryFilters";
export default function Recipes() {
  const [category, setCategory] = useState("");
  const query = new URLSearchParams(window.location.search).get("q") || "";
  const filtered = recipes.filter((recipe) => (!category || recipe.category === category) && recipe.title.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  return <main className="main-receitas">
        <section className="init-receitas">
          <h1 className="init-receitas-h1">Receitas</h1>
          <CategoryFilters selected={category} onSelect={setCategory} />
            <div className="receitas-container">{filtered.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}{!filtered.length && <p>Nenhuma receita encontrada.</p>}
                
                
                
                
            </div>
        </section>
    </main>;
}
