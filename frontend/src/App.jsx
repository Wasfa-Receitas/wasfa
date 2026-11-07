import Header from "./components/Header";
import Footer from "./components/Footer";
import { lazy, Suspense } from "react";
const Home = lazy(() => import("./pages/Home"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const pages = { receitas: Recipes, receita: RecipeDetail, login: Login, perfil: Profile, sobre: About, contato: Contact };
export default function App() {
  const name = window.location.pathname.split("/").pop().replace(/\.html$/, "");
  const Page = pages[name] || Home;
  return <><Header page={name} /><Suspense fallback={<main><p role="status">Carregando...</p></main>}><Page /></Suspense><Footer /></>;
}
