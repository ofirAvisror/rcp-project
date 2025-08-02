import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  chef: z.string().min(1, "Chef ID or Name is required"),
  chefBirthYear: z
    .string()
    .regex(/^\d{4}$/, "Chef Birth Year must be a valid year (e.g. 1980)")
    .optional()
    .or(z.literal('')), // מאפשר גם מחרוזת ריקה
  publishedYear: z
    .string()
    .regex(/^\d{4}$/, "Published year must be a valid year (e.g. 2023)"),
  genres: z.string().min(1, "Genres are required (comma-separated)"),
  description: z.string().min(0).optional(),
});

type CreateRecipeFormData = z.infer<typeof createRecipeSchema>;

type Recipe = {
  _id: string;
  title: string;
  chef: { _id: string; name: string };
  publishedYear: number;
  genres: string[];
  description?: string;
  addedBy: { _id: string; name: string };
};

type Props = {
  recipe?: Recipe;
  onClose?: () => void;
};

export function CreateRecipeForm({ recipe, onClose }: Props) {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateRecipeFormData>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      title: "",
      chef: "",
      chefBirthYear: "",
      publishedYear: "",
      genres: "",
      description: "",
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset({
        title: recipe.title,
        chef: recipe.chef._id,
        chefBirthYear: "", // מאפס כי בשינוי עריכה השדה לא רלוונטי
        publishedYear: String(recipe.publishedYear),
        genres: recipe.genres.join(", "),
        description: recipe.description ?? "",
      });
    }
  }, [recipe, form]);

  const mutation = useMutation({
    mutationFn: async (data: CreateRecipeFormData) => {
      const method = recipe ? "PATCH" : "POST";
      const url = recipe
        ? `http://localhost:3001/api/recipes/${recipe._id}`
        : `http://localhost:3001/api/recipes`;

      const body = {
        title: data.title,
        chef: data.chef,
        publishedYear: Number(data.publishedYear),
        genres: data.genres.split(",").map((g) => g.trim()),
        description: data.description || "",
      };

      // שולחים chefBirthYear רק אם קיים ולא ריק (כשיוצרים שף חדש)
      if (!recipe && data.chefBirthYear && data.chefBirthYear !== "") {
        Object.assign(body, { chefBirthYear: Number(data.chefBirthYear) });
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save recipe");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      form.reset();
      if (onClose) onClose();
      else {
        setSuccessMessage("✅ Recipe saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    },
    onError: (error: any) => {
      setSuccessMessage(null);
      form.setError("title", { type: "manual", message: error.message });
    },
  });

  const onSubmit = (data: CreateRecipeFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-10 rounded-3xl shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Sparkles className="text-indigo-500 dark:text-pink-400" />
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center">
          {recipe ? "Edit Recipe" : "Add a New Recipe"}
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 transition-all"
        >
          <FormFieldWrapper
            control={form.control}
            name="title"
            label="Title"
            type="text"
            placeholder="Recipe title"
          />
          <FormFieldWrapper
            control={form.control}
            name="chef"
            label="Chef ID or Name"
            type="text"
            placeholder="Chef ID or Name"
          />
          {!recipe && (
            <FormFieldWrapper
              control={form.control}
              name="chefBirthYear"
              label="Chef Birth Year (if creating new chef)"
              type="text"
              placeholder="e.g. 1980"
            />
          )}
          <FormFieldWrapper
            control={form.control}
            name="publishedYear"
            label="Published Year"
            type="text"
            placeholder="2023"
          />
          <FormFieldWrapper
            control={form.control}
            name="genres"
            label="Genres"
            type="text"
            placeholder="comma,separated,genres"
          />
          <FormFieldWrapper
            control={form.control}
            name="description"
            label="Description"
            type="text"
            placeholder="Recipe description / instructions"
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full text-base font-semibold tracking-wide py-3 rounded-full"
          >
            {mutation.isPending
              ? recipe
                ? "Updating..."
                : "Adding..."
              : recipe
              ? "Update Recipe ✏️"
              : "Add Recipe 🍳"}
          </Button>

          {successMessage && (
            <div className="text-center text-green-600 dark:text-green-400 font-medium mt-4 animate-pulse">
              {successMessage}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
