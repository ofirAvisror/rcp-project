import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  chef: z.string().min(1, "Chef ID or Name is required"),
  chefBirthYear: z
    .string()
    .regex(/^\d{4}$/, "Chef Birth Year must be a valid year (e.g. 1980)")
    .optional()
    .or(z.literal("")),
  publishedYear: z
    .string()
    .regex(/^\d{4}$/, "Published year must be a valid year (e.g. 2023)"),
  categories: z.string().min(1, "Categories are required (comma-separated)"),
  description: z.string().min(0).optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreateRecipeFormData = z.infer<typeof createRecipeSchema>;

type Recipe = {
  _id: string;
  title: string;
  chef: { _id: string; name: string };
  publishedYear: number;
  categories: string[];
  description?: string;
  ingredients?: string[];
  addedBy: { _id: string; name: string };
  imageUrl?: string; // ✅ נוסיף פה
};

type Props = {
  recipe?: Recipe;
  onClose?: () => void;
};

export function CreateRecipeForm({ recipe, onClose }: Props) {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ingredients state
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients || []
  );
  const [newIngredient, setNewIngredient] = useState("");

  const form = useForm<CreateRecipeFormData>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      title: "",
      chef: "",
      chefBirthYear: "",
      publishedYear: "",
      categories: "",
      description: "",
      imageUrl: "", // ✅ ברירת מחדל ריקה במקום undefined
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset({
        title: recipe.title,
        chef: recipe.chef._id,
        chefBirthYear: "",
        publishedYear: String(recipe.publishedYear),
        categories: recipe.categories.join(", "),
        description: recipe.description ?? "",
        imageUrl: recipe.imageUrl ?? "", // ✅ תמיד ערך מוגדר
      });
      setIngredients(recipe.ingredients || []);
    }
  }, [recipe, form]);

  const mutation = useMutation({
    mutationFn: async (data: CreateRecipeFormData) => {
      const method = recipe ? "PATCH" : "POST";
      const url = recipe
        ? `http://localhost:3001/api/recipes/${recipe._id}`
        : `http://localhost:3001/api/recipes`;

      const body: any = {
        title: data.title,
        publishedYear: Number(data.publishedYear),
        categories: data.categories.split(",").map((c) => c.trim()),
        description: data.description || "",
        ingredients,
        imageUrl: data.imageUrl?.trim() || "", // ✅ שולחים ל־DB
      };

      if (!recipe) {
        body.chef = data.chef;
        if (data.chefBirthYear && data.chefBirthYear !== "") {
          body.chefBirthYear = Number(data.chefBirthYear);
        }
      } else {
        body.chef = recipe.chef._id;
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
      setIngredients([]);
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

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    setIngredients([...ingredients, newIngredient.trim()]);
    setNewIngredient("");
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
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

          {!recipe ? (
            <>
              <FormFieldWrapper
                control={form.control}
                name="chef"
                label="Chef ID or Name"
                type="text"
                placeholder="Chef ID or Name"
              />
              <FormFieldWrapper
                control={form.control}
                name="chefBirthYear"
                label="Chef Birth Year (if creating new chef)"
                type="text"
                placeholder="e.g. 1980"
              />
            </>
          ) : (
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Chef:
              </p>
              <p className="text-lg font-semibold text-purple-600 dark:text-pink-300">
                {recipe.chef.name}
              </p>
            </div>
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
            name="imageUrl"
            label="Recipe Image URL"
            type="text"
            placeholder="https://example.com/myimage.jpg"
          />

          <FormFieldWrapper
            control={form.control}
            name="categories"
            label="Categories"
            type="text"
            placeholder="comma,separated,categories"
          />
          <FormFieldWrapper
            control={form.control}
            name="description"
            label="Description"
            type="text"
            placeholder="Recipe description / instructions"
          />

          {/* Ingredients Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ingredients
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="e.g. 2 cups of flour"
              />
              <Button
                type="button"
                onClick={handleAddIngredient}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Add
              </Button>
            </div>

            {ingredients.length > 0 && (
              <ul className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {ing}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
