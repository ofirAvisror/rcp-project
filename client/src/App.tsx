import { Header } from "@/components/Header";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "./components/AuthContext";
import { BooksPage } from "./components/BooksPage"; // תוקן כאן השם

function App() {
  const { user } = useAuth();

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500">
      <Header />
      
      <main className="p-6">{user ? <BooksPage /> : <AuthPage />} </main>
    </div>
  );
}

export default App;
