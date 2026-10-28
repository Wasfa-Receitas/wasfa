import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthField from "./AuthField";
export default function AuthPanel() {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState("");
  const { user, login, logout } = useAuth();
  function submit(event) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const prefix2 = signup ? "signup" : "login";
    const email = data.get(prefix2 + "-email").trim();
    const password = data.get(prefix2 + "-password");
    if (signup) {
      if (password !== data.get("signup-password-confirm")) {
        setError("As senhas n\xE3o conferem!");
        return;
      }
      if (localStorage.getItem(email)) {
        setError("Esse email j\xE1 est\xE1 cadastrado!");
        return;
      }
      const username = data.get("signup-name").trim();
      if (!username) {
        setError("Insira seu nome.");
        return;
      }
      localStorage.setItem(email, JSON.stringify({ username, email, password }));
      login(username);
    } else {
      let stored;
      try {
        stored = JSON.parse(localStorage.getItem(email));
      } catch {
        setError("Usu\xE1rio n\xE3o encontrado!");
        return;
      }
      if (!stored) {
        setError("Usu\xE1rio n\xE3o encontrado!");
        return;
      }
      if (stored.password !== password) {
        setError("Senha incorreta!");
        return;
      }
      login(stored.username);
    }
    window.location.assign("/pages/perfil.html");
  }
  const prefix = signup ? "signup" : "login";
  return <section className="login-panel"><div className="auth-toggle"><button type="button" className={!signup ? "active" : ""} onClick={() => {
    setSignup(false);
    setError("");
  }}>Entrar</button><button type="button" className={signup ? "active" : ""} onClick={() => {
    setSignup(true);
    setError("");
  }}>Criar conta</button>{user && <button type="button" onClick={logout}>Sair</button>}</div><div className="auth-forms"><form key={prefix} id={prefix + "-form"} className="auth-form active" onSubmit={submit}><h1 className="title login-titulo">{signup ? "Criar conta" : "Entrar"}</h1>{signup && <AuthField id="signup-name" label="Nome" placeholder="Insira seu nome" autoComplete="name" icon="user" />}<AuthField id={prefix + "-email"} label="Email" type="email" placeholder="voce@email.com" autoComplete="email" icon="envelope" /><AuthField id={prefix + "-password"} label="Senha" type="password" placeholder={signup ? "Crie uma senha" : "Insira sua senha"} autoComplete={signup ? "new-password" : "current-password"} icon="lock" />{signup && <AuthField id="signup-password-confirm" label="Confirmar senha" type="password" placeholder="Confirme sua senha" autoComplete="new-password" icon="lock" />}{error && <p role="alert">{error}</p>}<button type="submit" className="btn-cadastro">{signup ? "Cadastrar" : "Entrar"}</button></form></div></section>;
}
