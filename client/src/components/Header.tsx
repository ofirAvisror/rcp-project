import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white/70 backdrop-blur-sm border-b border-white/40 shadow-sm">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        {/* Title on the left */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 font-mono">
          🍽 Chef Recipes <span className="text-gray-400">for Everyone</span>
        </h1>

        {/* User info / buttons on the right */}
        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">
              Welcome,{" "}
              <span className="font-medium text-gray-900">{user.name}</span>
            </p>
            <Button
              onClick={logout}
              className="bg-white/70 hover:bg-white/90 text-sm text-gray-900 border border-gray-200 rounded-md px-4 py-2 transition"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">🔐 Please log in</p>
        )}
      </div>
    </header>
  );
}
