import { useState } from "react";

export default function RecipeImage({ recipe, className = "", loading = "lazy" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  if (!recipe.imagem_url || failedUrl === recipe.imagem_url) {
    return <div className={`recipe-image-placeholder ${className}`} aria-hidden="true"><i className="fa-solid fa-utensils" /></div>;
  }
  const image = <img className="recipe-image" src={recipe.imagem_url} alt={recipe.nome} loading={loading} onError={() => setFailedUrl(recipe.imagem_url)} />;
  return className ? <div className={className}>{image}</div> : image;
}
