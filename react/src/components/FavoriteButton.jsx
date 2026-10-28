import { useEffect, useState } from "react";
export default function FavoriteButton({ id, title }) {
  const [favorite, setFavorite] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wasfa:favorites") || "[]").includes(id);
    } catch {
      return false;
    }
  });
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [message]);
  function toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem("wasfa:favorites") || "[]");
      if (!Array.isArray(saved)) saved = [];
    } catch {
      saved = [];
    }
    localStorage.setItem("wasfa:favorites", JSON.stringify(favorite ? saved.filter((value) => value !== id) : [.../* @__PURE__ */ new Set([...saved, id])]));
    setFavorite(!favorite);
    setMessage('"' + title + '" foi ' + (favorite ? "removida dos favoritos." : "adicionada aos favoritos!"));
  }
  return <><button type="button" className={(favorite ? "fa-solid" : "fa-regular") + " fa-heart favoritar"} aria-label={"Favoritar " + title} aria-pressed={favorite} onClick={toggle} />{message && <div className="toast show" role="status">{message}</div>}</>;
}
