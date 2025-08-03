import { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateRecipeForm } from "./CreateRecipeForm";

import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Plus } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Recipe = {
  _id: string;
  title: string;
  chef: {
    _id: string;
    name: string;
  };
  publishedYear: number;
  categories: string[];
  description?: string;
  addedBy: {
    _id: string;
    name: string;
  };
};

export function RecipesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const {
    data: recipes,
    isLoading,
    isError,
    error,
  } = useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("http://localhost:3001/api/recipes/all", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const json = await res.json();
      return json.data;
    },
    enabled: !!user,
  });

  const allCategories = useMemo(() => {
    return Array.from(new Set((recipes ?? []).flatMap((r) => r.categories)));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) return recipes;
    return recipes?.filter((r) => r.categories.includes(selectedCategory));
  }, [recipes, selectedCategory]);

  const handleDelete = async () => {
    if (!user || !recipeToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/recipes/${recipeToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete recipe");
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setRecipeToDelete(null);
    } catch (err:any)
 {
      alert(`Error deleting recipe: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      {/* Header + Sidebar Trigger */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                ☰
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <SheetHeader>
                <SheetTitle>Filter by Category</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </Button>
                {allCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-5xl font-black text-purple-700 dark:text-pink-300">🍳 Recipes</h1>
        </div>

        {/* New Recipe Button */}
        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full shadow">
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

      {/* Desktop Sidebar */}
      {user && allCategories.length > 0 && (
        <div className="hidden md:flex gap-3 mb-10 flex-wrap">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {allCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {!user && (
        <div className="text-center text-lg text-yellow-700 dark:text-yellow-300 mb-8">
          Please log in to view recipes.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : isError ? (
        <div className="text-center py-20 text-red-600">{error?.message}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredRecipes?.map((recipe) => (
            <div
              key={recipe._id}
              className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 border shadow-xl p-6 hover:shadow-2xl"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-purple-800 dark:text-pink-300 mb-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  👨‍🍳{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {recipe.chef.name}
                  </span>{" "}
                  · {recipe.publishedYear}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Categories: {(recipe.categories ?? []).join(", ")}
                </p>
              </div>

              {/* Actions */}
              {user?.userId === recipe.addedBy._id && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingRecipe(recipe)}
                    className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-400 rounded-full p-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => setRecipeToDelete(recipe._id)}
                        className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-full p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this recipe?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRecipeToDelete(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingRecipe && (
        <Dialog open={!!editingRecipe} onOpenChange={() => setEditingRecipe(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>
            </DialogHeader>
            <CreateRecipeForm
              recipe={editingRecipe}
              onClose={() => setEditingRecipe(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
