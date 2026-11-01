import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
const pages = { receitas: Recipes, receita: RecipeDetail, login: Login, perfil: Profile, sobre: About, contato: Contact };
export default function App() {
  const name = window.location.pathname.split("/").pop().replace(/\.html$/, "");
  const Page = pages[name] || Home;
  return <><Header page={name} /><Page /><Footer /></>;
}
