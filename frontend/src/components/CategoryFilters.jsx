const categories = [["almoco", "ALMO\xC7O"], ["sobremesa", "SOBREMESA"], ["refresco", "REFRESCO"], ["lanchinho", "LANCHINHO"], ["apimentado", "APIMENTADO"], ["vegetariano", "VEGETARIANO"]];
export default function CategoryFilters({ selected, onSelect }) {
  return <div className="receitas-categories">{categories.map(([style, label]) => <button key={style} className={"btn-category " + style} aria-pressed={selected === label} onClick={() => onSelect(selected === label ? "" : label)}>{label}</button>)}</div>;
}
