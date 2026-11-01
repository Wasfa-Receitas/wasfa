export default function About() {
  return <main className="main-sobre">
      <div className="sobre-page">

        <section className="sobre-hero">
          <div className="sobre-hero-titulo">
            <img src="/assets/img/Estrela.png" alt="" className="sobre-estrela" />
            <h1 className="title sobre-h1">Sobre o Wasfa</h1>
          </div>
          <p className="sobre-lead">
            <strong>Wasfa</strong> significa "receita" em árabe. Nasceu para responder uma pergunta que todo mundo faz todo dia: <em>o que eu vou comer hoje?</em>
          </p>
        </section>

        <section className="sobre-texto">
          <h2 className="title">Nossa história</h2>
          <p>O Wasfa é um projeto feito por uma equipe de seis pessoas que gostam de cozinhar, comer e criar coisas para a web. A ideia é simples: reunir receitas de um jeito bonito, organizado e fácil de encontrar, para que decidir o cardápio deixe de ser um problema.</p>
          <p>Aqui você navega por categorias, guarda suas receitas favoritas e acompanha cada passo do preparo sem complicação.</p>
        </section>

        <section className="sobre-valores">
          <div className="sobre-card">
            <div className="sobre-card-icone"><i className="fa-solid fa-magnifying-glass" /></div>
            <h3>Descubra</h3>
            <p>Almoço, sobremesa, refresco, lanchinho, apimentado ou vegetariano: ache a receita ideal para o seu apetite.</p>
          </div>
          <div className="sobre-card">
            <div className="sobre-card-icone"><i className="fa-solid fa-heart" /></div>
            <h3>Favorite</h3>
            <p>Gostou de uma receita? Marque o coração e tenha as suas preferidas sempre à mão no seu perfil.</p>
          </div>
          <div className="sobre-card">
            <div className="sobre-card-icone"><i className="fa-solid fa-utensils" /></div>
            <h3>Cozinhe</h3>
            <p>Ingredientes e modo de preparo em passos numerados, com tempo, dificuldade e porções à vista.</p>
          </div>
        </section>

        <section className="sobre-equipe">
          <h2 className="title">Quem faz o Wasfa</h2>
          <ul className="sobre-equipe-lista">
            <li>Anny</li>
            <li>Isabelly</li>
            <li>Kaue</li>
            <li>Natasha</li>
            <li>Samuel</li>
            <li>Yago</li>
          </ul>
        </section>

        <section className="sobre-cta">
          <h2 className="title">Bora cozinhar?</h2>
          <a href="/pages/receitas.html" className="btn btn-cadastrar sobre-cta-btn">Ver receitas</a>
        </section>

      </div>
    </main>;
}
