export default function SearchBar() {
  return <form className="search-recipes" action="/pages/receitas.html"><button type="submit" aria-label="Buscar receitas"><i className="fa-solid fa-magnifying-glass" /></button><input type="search" name="q" aria-label="Buscar receitas" placeholder="Buscar receitas..." className="input-search-recipes" /></form>;
}
