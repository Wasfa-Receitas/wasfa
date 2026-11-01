import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
export default function Profile() {
  const { user, loading, error, retry, logout } = useAuth();
  useEffect(() => {
    if (!loading && !error && !user) window.location.replace("/pages/login.html");
  }, [user, loading, error]);
  if (loading) return <main className="main-perfil"><p role="status">Carregando perfil...</p></main>;
  if (error) return <main className="main-perfil"><div role="alert"><p>{error}</p><button className="btn btn-cadastrar" onClick={retry}>Tentar novamente</button></div></main>;
  if (!user) return null;
  return <main className="main-perfil">
      <div className="perfil-page">

        <section className="perfil-topo">
          <div className="perfil-avatar" id="perfilAvatar">{user.nome?.charAt(0).toUpperCase()}</div>
          <div className="perfil-boasvindas">
            <small>Seu perfil</small>
            <h1 className="title perfil-nome">Olá, <span id="perfilNome">{user.nome}</span>!</h1>
            <p>O que vamos cozinhar hoje?</p>
          </div>
          <button type="button" className="btn btn-cadastrar perfil-sair js-logout" onClick={logout}><i className="fa-solid fa-right-from-bracket" /> Sair</button>
        </section>

        <section className="perfil-atalhos">
        <a href="#" className="perfil-atalho">
          <span className="perfil-badge">Em breve</span>
          <div className="perfil-atalho-icone"><i className="fa-solid fa-heart" /></div>
          <h3>Favoritos</h3>
          <p>Todas as receitas que você marcou com o coração.</p>
        </a>
        <a href="#" className="perfil-atalho">
          <span className="perfil-badge">Em breve</span>
          <div className="perfil-atalho-icone"><i className="fa-solid fa-circle-check" /></div>
          <h3>Minhas receitas</h3>
          <p>As receitas que você criou e compartilhou.</p>
        </a>
        <a href="#" className="perfil-atalho">
          <span className="perfil-badge">Em breve</span>
          <div className="perfil-atalho-icone"><i className="fa-solid fa-book-open" /></div>
          <h3>Cardápio</h3>
          <p>Monte o cardápio da semana com suas receitas.</p>
        </a>
        </section>

        <a href="/pages/receitas.html" className="perfil-explorar">Explorar receitas <i className="fa-solid fa-arrow-right" /></a>

      </div>
    </main>;
}
