import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useAuth } from "./AuthContext";

const registerSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  onSuccess: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const { login } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const responseData = await res.json();
      const { user } = responseData;

      login({
        userId: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      form.setError("email", { type: "manual", message: error.message });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Create a New Account
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormFieldWrapper
            control={form.control}
            name="name"
            label="Full Name"
            type="text"
            placeholder="Enter your name"
            description="At least 4 characters"
          />
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
            placeholder="Create a strong password"
            description="At least 6 characters, 1 uppercase, 1 lowercase, and 1 number"
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full py-3 text-base font-semibold"
          >
            {form.formState.isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
