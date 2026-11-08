import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
export default function Home() {
  const titles = ["ALMO\xC7O E JANTAR", "SOBREMESA", "REFRESCO", "LANCHINHO"];
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let timer;
    const update = () => {
      clearInterval(timer);
      if (!preference?.matches) timer = setInterval(() => {
        if (!document.hidden) setTurn((value) => value + 1);
      }, 3e3);
    };
    update();
    preference?.addEventListener("change", update);
    return () => { clearInterval(timer); preference?.removeEventListener("change", update); };
  }, []);
  return <><main>
      <section className="init-content">
        <SearchBar />
        <div className="init-title">
          <img src="/assets/img/Estrela.png" alt="" className="init-title-h1-star" /> 
        <h1 className="title init-title-h1" id="indexTitle">{titles[turn % titles.length]}</h1>
        </div>
        <div className="init-subtitle">
          <h2 className="title init-title-h2">Qual é a sua <br /> vontade hoje?</h2>
        <p>ACHE A RECEITA IDEAL PRO SEU <br /> APETITE</p>
        </div>
      </section>
    </main><div className="roleta-comida-container" id="roletaComidaContainer" style={{ transform: `rotate(${-turn * 90}deg)` }}>
      <div className="roleta-comida">
        <div className="roleta-comida-verde" />
        
        <div className="roleta-comida-vermelho" />
        
        <div className="roleta-comida-amarelo" />
        
        <div className="roleta-comida-laranja" />
        
        
      </div>
      <img src="/assets/img/almoco.webp" alt="" />
      <img src="/assets/img/torta.webp" alt="" />
      <img src="/assets/img/suco.webp" alt="" />
      <img src="/assets/img/hotdog.webp" alt="" />
    </div>
    

    </>;
}
