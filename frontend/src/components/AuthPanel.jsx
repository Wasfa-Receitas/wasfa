import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthField from "./AuthField";
export default function AuthPanel() {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register, logout } = useAuth();
  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    const data = new FormData(event.currentTarget);
    const prefix = signup ? "signup" : "login";
    const email = data.get(prefix + "-email").trim();
    const senha = data.get(prefix + "-password");
    if (signup && senha !== data.get("signup-password-confirm")) { setError("As senhas não conferem!"); return; }
    setSubmitting(true);
    try {
      if (signup) await register({ nome: data.get("signup-name").trim(), email, senha });
      else await login({ email, senha });
      window.location.assign("/pages/perfil.html");
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }
  const prefix = signup ? "signup" : "login";
  function changeMode(value) { setSignup(value); setError(""); }
  return <section className="login-panel">
    <div className="auth-toggle">
      <button type="button" disabled={submitting} className={!signup ? "active" : ""} onClick={() => changeMode(false)}>Entrar</button>
      <button type="button" disabled={submitting} className={signup ? "active" : ""} onClick={() => changeMode(true)}>Criar conta</button>
      {user && <button type="button" onClick={logout}>Sair</button>}
    </div>
    <div className="auth-forms"><form key={prefix} id={prefix + "-form"} className="auth-form active" onSubmit={submit} aria-busy={submitting}>
      <h1 className="title login-titulo">{signup ? "Criar conta" : "Entrar"}</h1>
      {signup && <AuthField id="signup-name" label="Nome" placeholder="Insira seu nome" autoComplete="name" icon="user" maxLength={100} />}
      <AuthField id={prefix + "-email"} label="Email" type="email" placeholder="voce@email.com" autoComplete="email" icon="envelope" maxLength={150} />
      <AuthField id={prefix + "-password"} label="Senha" type="password" placeholder={signup ? "Crie uma senha" : "Insira sua senha"} autoComplete={signup ? "new-password" : "current-password"} icon="lock" minLength={signup ? 8 : 1} maxLength={128} />
      {signup && <AuthField id="signup-password-confirm" label="Confirmar senha" type="password" placeholder="Confirme sua senha" autoComplete="new-password" icon="lock" minLength={8} maxLength={128} />}
      {error && <p role="alert">{error}</p>}
      {submitting && <p role="status">Aguarde...</p>}
      <button type="submit" disabled={submitting} className="btn-cadastro">{signup ? "Cadastrar" : "Entrar"}</button>
    </form></div>
  </section>;
}
