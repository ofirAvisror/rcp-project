import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full px-6 py-4 bg-gradient-to-r from-purple-700 via-pink-500 to-red-400 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white shadow-xl flex items-center justify-between">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-mono">
        🚀{" "}
        <span className="text-white drop-shadow-sm">
          chef recepies for everyone to share!
        </span>
      </h1>

      {user ? (
        <div className="flex items-center gap-4">
          <p className="text-sm sm:text-base text-white/90">
            Welcome,{" "}
            <span className="font-semibold text-yellow-300">{user.name}</span>
          </p>

          <Button
            onClick={logout}
            className="bg-yellow-300 hover:bg-yellow-200 text-purple-900 font-semibold rounded-full px-5 py-2 text-sm shadow-sm transition-all"
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <p className="text-sm sm:text-base italic text-yellow-100">
          🔐 Access restricted — please log in
        </p>
      )}
    </header>
  );
}
