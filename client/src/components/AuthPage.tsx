import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "@/components/ui/button";
import { Sparkles, LogIn, UserPlus } from "lucide-react";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-[#c2e9fb] via-[#a1c4fd] to-[#d4fc79] dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e] overflow-hidden">
      {/* רקע גלואינג */}
      <div className="absolute -z-10 w-[1000px] h-[1000px] bg-purple-300/20 dark:bg-indigo-800/30 rounded-full blur-3xl animate-pulse" />

      {/* קופסת טופס */}
      <div className="w-full max-w-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-10 rounded-[2rem] shadow-2xl border border-white/40 dark:border-gray-800 transition-all duration-300">
        {/* כותרת */}
        <div className="text-center mb-10">
          <Sparkles className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-300" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2">
            {isLogin ? "Welcome Back!" : "Create an Account"}
          </h1>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
            {isLogin
              ? "Sign in to access your dashboard."
              : "Sign up and start your journey with us!"}
          </p>
        </div>

        {/* כפתורי טאבים */}
        <div className="flex mb-8 border border-gray-300 dark:border-gray-700 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-inner">
          <Button
            variant="ghost"
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 rounded-none ${
              !isLogin
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setIsLogin(false)}
          >
            <UserPlus size={16} />
            Register
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 rounded-none ${
              isLogin
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setIsLogin(true)}
          >
            <LogIn size={16} />
            Login
          </Button>
        </div>

        {/* טופס */}
        <div className="transition duration-500 ease-in-out">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSuccess={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
