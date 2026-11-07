export default function SearchBar() {
  const params = new URLSearchParams(window.location.search);
  return <form className="search-recipes" action="/pages/receitas.html">
    <button type="submit" aria-label="Buscar receitas"><i className="fa-solid fa-magnifying-glass" /></button>
    <div className="search-fields">
      <input type="search" name="q" defaultValue={params.get("q") ?? params.get("name") ?? params.get("ingredients") ?? ""} maxLength={100} placeholder="Buscar por receita ou ingrediente..." className="input-search-recipes" aria-label="Buscar por receita ou ingrediente" />
    </div>
  </form>;
}
