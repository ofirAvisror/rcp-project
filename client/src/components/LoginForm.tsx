import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useAuth } from "./AuthContext";
import loginIllustration from "../img/image.png"; // ← הוספת תמונה

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSwitchToRegister: () => void;
};

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const responseData = await res.json();
      const { user } = responseData;

      login({
        userId: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role,
      });

      form.reset();
    } catch (error: any) {
      form.setError("email", { type: "manual", message: error.message });
      form.setError("password", { type: "manual", message: error.message });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
      {/* גריד דו־עמודי: תמונה + טופס */}
      <div className="grid md:grid-cols-2">
        {/* צד תמונה (נעלם במסכים קטנים) */}
        <div className="hidden md:block relative bg-gray-100 dark:bg-gray-800">
          <img
            src={loginIllustration}
            alt="Login"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* שכבת מידע קטנה בתחתית – אופציונלי */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white px-4 py-3 text-sm">
            Welcome back
          </div>
        </div>

        {/* צד טופס */}
        <div className="bg-white dark:bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Login to Your Account
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormFieldWrapper
                control={form.control}
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
              />

              <FormFieldWrapper
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full py-3 text-base font-semibold"
              >
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}