export default function SearchBar() {
  const params = new URLSearchParams(window.location.search);
  return <form className="search-recipes" action="/pages/receitas.html">
    <button type="submit" aria-label="Buscar receitas"><i className="fa-solid fa-magnifying-glass" /></button>
    <div className="search-fields">
      <label>Nome da receita<input type="search" name="name" defaultValue={params.get("name") ?? params.get("q") ?? ""} maxLength={100} placeholder="Buscar receitas..." className="input-search-recipes" /></label>
      <label>Ingredientes<input type="search" name="ingredients" defaultValue={params.get("ingredients") ?? ""} placeholder="Banana, aveia..." className="input-search-recipes" aria-describedby="ingredients-hint" /></label>
      <small id="ingredients-hint">Separe os ingredientes por vírgula.</small>
    </div>
  </form>;
}
