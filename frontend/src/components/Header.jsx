import { useState } from "react";
import { useAuth } from "../context/AuthContext";
const links = [["/index.html", "In\xEDcio"], ["/pages/receitas.html", "Receitas"], ["/pages/sobre.html", "Sobre"], ["/pages/contato.html", "Contato"]];
export default function Header({ page }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const account = page === "perfil" ? "Sair" : user ? "Meu perfil" : "Cadastrar";
  const accountLink = (mobile) => page !== "login" && <li className={mobile ? "nav-item-mobile" : "nav-item"}><a href={user && page !== "perfil" ? "/pages/perfil.html" : "/pages/login.html"} onClick={page === "perfil" ? (e) => {
    e.preventDefault();
    logout();
  } : void 0} className={mobile ? "nav-link-mobile btn-cadastrar-mobile" : "btn btn-cadastrar"}>{account}</a></li>;
  return <header><nav className="navbar"><a href="/index.html"><img src="/assets/img/wasfalogo.png" alt="Wasfa" className="logo-img" /></a><ul className="navlist">{links.map(([href, label]) => <li key={href} className="nav-item"><a href={href} className="nav-link">{label}</a></li>)}{accountLink(false)}</ul><button className="menu-toggle" id="menuToggle" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="navMobile" onClick={() => setOpen(!open)}><i aria-hidden="true" className={"fa-solid " + (open ? "fa-xmark" : "fa-bars")} /></button></nav><nav className={"nav-mobile" + (open ? " active" : "")} id="navMobile"><ul className="navlist-mobile">{links.map(([href, label]) => <li key={href} className="nav-item-mobile"><a href={href} className="nav-link-mobile">{label}</a></li>)}{accountLink(true)}</ul></nav></header>;
}
