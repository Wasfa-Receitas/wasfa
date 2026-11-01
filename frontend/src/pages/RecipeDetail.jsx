import FavoriteButton from "../components/FavoriteButton";
export default function RecipeDetail() {
  return <main className="main-receita">
      <article className="receita-page">
        <a href="/pages/receitas.html" className="receita-voltar"><i className="fa-solid fa-arrow-left" /> Voltar às receitas</a>

        <section className="receita-hero">
          <div className="receita-hero-img">
            <img src="/assets/img/frango-assado.png" alt="Prato de frango assado com arroz" />
          </div>

          <div className="receita-hero-info">
            <span className="receita-tag almoco-tag">ALMOÇO</span>
            <h1 className="title receita-title">Frango Assado com Arroz</h1>
            <p className="receita-resumo">Frango suculento com pele dourada e crocante, temperado com alho e limão, servido com um arroz soltinho. Um clássico de domingo que não dá trabalho.</p>

            <ul className="receita-meta">
              <li><i className="fa-regular fa-clock" /><span>40 min</span></li>
              <li><i className="fa-solid fa-gauge-simple" /><span>Fácil</span></li>
              <li><i className="fa-solid fa-utensils" /><span>4 porções</span></li>
              <li className="receita-meta-nota"><i className="fa-solid fa-star" /><span>4.8</span></li>
            </ul>

            <FavoriteButton id="1" title="Frango Assado com Arroz" />
          </div>
        </section>

        <section className="receita-corpo">
          <div className="receita-bloco receita-ingredientes">
            <h2 className="title">Ingredientes</h2>
            <ul>
              <li>1 frango inteiro (cerca de 1,5 kg)</li>
              <li>4 dentes de alho amassados</li>
              <li>Suco de 2 limões</li>
              <li>2 colheres (sopa) de azeite</li>
              <li>1 colher (sopa) de páprica</li>
              <li>2 xícaras de arroz</li>
              <li>4 xícaras de água quente</li>
              <li>Sal e pimenta-do-reino a gosto</li>
            </ul>
          </div>

          <div className="receita-bloco receita-preparo">
            <h2 className="title">Modo de preparo</h2>
            <ol>
              <li>Misture o alho, o limão, o azeite, a páprica, o sal e a pimenta e esfregue no frango. Deixe marinar por 20 minutos.</li>
              <li>Preaqueça o forno a 200 °C e coloque o frango em uma assadeira.</li>
              <li>Asse por cerca de 40 minutos, regando com o próprio molho na metade do tempo, até dourar.</li>
              <li>Enquanto isso, refogue o arroz com um fio de azeite, junte a água quente e cozinhe em fogo baixo até secar.</li>
              <li>Deixe o frango descansar por 5 minutos antes de cortar e sirva com o arroz.</li>
            </ol>
          </div>
        </section>
      </article>
    </main>;
}
