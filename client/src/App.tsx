import { Header } from "@/components/Header";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "./components/AuthContext";
import {BooksPages } from "./components/BooksPage";

function App() {
  const { user } = useAuth();

  return (
<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500">
      <Header />
      <main className="p-6">{user ? <BooksPages /> : <AuthPage />}</main>
    </div>
  );
}

export default App;
