// RecipesPage.tsx
import { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateRecipeForm } from "./CreateRecipeForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecipeCard } from "./RecipeCard";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export type Recipe = {
  _id: string;
  title: string;
  chef: { _id: string; name: string };
  publishedYear: number;
  categories: string[];
  description?: string;
  addedBy: { _id: string; name: string };
};

export type Chef = {
  _id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  about?: string;
  birthYear: number;
};

export function RecipesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"recipes" | "chefs">("recipes");

  const { data: recipes = [], isLoading: loadingRecipes, isError: errorRecipes } = useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/recipes/all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return (await res.json()).data || [];
    },
    enabled: !!user && activeTab === "recipes",
  });

  const { data: chefs = [], isLoading: loadingChefs, isError: errorChefs } = useQuery<Chef[]>({
    queryKey: ["chefs"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/chefs/all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chefs");
      return (await res.json()).data || [];
    },
    enabled: !!user && activeTab === "chefs",
  });

  const allCategories = useMemo(() => {
    return Array.from(new Set(recipes.flatMap((r) => r.categories)));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return selectedCategory ? recipes.filter((r) => r.categories.includes(selectedCategory)) : recipes;
  }, [recipes, selectedCategory]);

  const handleDelete = async () => {
    if (!user || !recipeToDelete) return;
    try {
      await fetch(`http://localhost:3001/api/recipes/${recipeToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setRecipeToDelete(null);
    } catch (err:any)
 {
      alert(`Error deleting recipe: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header + Tabs */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-extrabold text-purple-700 dark:text-pink-300">🍽️ My Recipes</h1>
          <div className="flex gap-2">
            <Button
              className={`rounded-full px-6 py-2 ${activeTab === "recipes" ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white"}`}
              onClick={() => setActiveTab("recipes")}
            >
              Recipes
            </Button>
            <Button
              className={`rounded-full px-6 py-2 ${activeTab === "chefs" ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white"}`}
              onClick={() => setActiveTab("chefs")}
            >
              Chefs
            </Button>
          </div>
        </div>
        {user && activeTab === "recipes" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add a New Recipe</DialogTitle>
              </DialogHeader>
              <CreateRecipeForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Category Filters */}
      {activeTab === "recipes" && allCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            className={`rounded-full px-4 py-1 text-sm ${selectedCategory === "" ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"}`}
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {allCategories.map((cat) => (
            <Button
              key={cat}
              className={`rounded-full px-4 py-1 text-sm ${selectedCategory === cat ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Recipes */}
      {activeTab === "recipes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingRecipes ? (
            <p>Loading recipes...</p>
          ) : errorRecipes ? (
            <p className="text-red-500">Failed to load recipes</p>
          ) : (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                userId={user?.userId}
                onEdit={() => setEditingRecipe(recipe)}
                onDelete={() => setRecipeToDelete(recipe._id)}
                onReviewSubmit={async (data) => {
                  await fetch(`http://localhost:3001/api/recipes/${recipe._id}/reviews`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(data),
                  });
                  queryClient.invalidateQueries({ queryKey: ["reviews", recipe._id] });
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Chefs */}
      {activeTab === "chefs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingChefs ? (
            <p>Loading chefs...</p>
          ) : errorChefs ? (
            <p className="text-red-500">❌ Failed to load chefs</p>
          ) : (
            chefs.map((chef) => (
              <div key={chef._id} className="border rounded-xl p-6 shadow bg-white dark:bg-gray-900 transition hover:shadow-lg">
                <h3 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">{chef.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">👨‍🍳 Specialty: {chef.specialty}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">📈 Experience years: {chef.experienceYears} </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">🎂 Born: {chef.birthYear}</p>
                {chef.about && <p className="text-sm mt-2 italic text-gray-500">{chef.about}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!recipeToDelete} onOpenChange={() => setRecipeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editingRecipe && (
        <Dialog open={!!editingRecipe} onOpenChange={() => setEditingRecipe(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>
            </DialogHeader>
            <CreateRecipeForm recipe={editingRecipe} onClose={() => setEditingRecipe(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
