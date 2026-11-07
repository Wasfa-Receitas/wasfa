import AuthPanel from "../components/AuthPanel";
export default function Login() {
  return <main className="main-login">
      <div className="login-card">

        <aside className="login-side">
          <img src="/assets/img/Estrela.png" alt="" className="login-estrela" />
          <img src="/assets/img/almoco.webp" alt="" className="login-prato" />
          <h2 className="title">Bem-vindo ao Wasfa!</h2>
          <p>Salve suas receitas favoritas e nunca mais fique sem saber o que cozinhar.</p>
        </aside>

        <AuthPanel />

      </div>
    </main>;
}
