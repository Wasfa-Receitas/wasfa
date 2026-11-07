import { useState } from "react";
import optimizedImages from "../recipe-images.json";

export default function RecipeImage({ recipe, className = "", loading = "lazy" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const [failedOptimizedUrl, setFailedOptimizedUrl] = useState(null);
  if (!recipe.imagem_url || failedUrl === recipe.imagem_url) {
    return <div className={`recipe-image-placeholder ${className}`} aria-hidden="true"><i className="fa-solid fa-utensils" /></div>;
  }
  const variants = failedOptimizedUrl === recipe.imagem_url ? null : optimizedImages[recipe.imagem_url];
  const image = <img className="recipe-image" src={variants ? variants[className ? 2 : 0].url : recipe.imagem_url}
    srcSet={variants?.map(({ url, width }) => `${url} ${width}w`).join(", ")}
    sizes={className ? "(max-width: 968px) 80vw, 380px" : "210px"}
    alt={recipe.nome} loading={loading} decoding="async"
    onError={() => variants ? setFailedOptimizedUrl(recipe.imagem_url) : setFailedUrl(recipe.imagem_url)} />;
  return className ? <div className={className}>{image}</div> : image;
}
