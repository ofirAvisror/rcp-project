import { Header } from "@/components/Header";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "./components/AuthContext";
import { RecipesPage } from "./components/recipesPage";
import bgImage from "./img/ing.jpg"; // ← ייבוא התמונה מתוך src/img

function App() {
  const { user } = useAuth();

  return (
<div
  className="min-h-screen bg-repeat-y bg-top"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundRepeat: "repeat-y",
    backgroundPosition: "top",
  }}
>




      <Header />
      <main className="p-6">
        {user ? <RecipesPage /> : <AuthPage />}
      </main>
    </div>
  );
}

export default App;
