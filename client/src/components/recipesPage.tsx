// src/components/RecipesPage.tsx
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { CreateRecipeForm } from "./CreateRecipeForm";
import { RecipeCard } from "./RecipeCard";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Recipe = {
  _id: string;
  title: string;
  chef: { _id: string; name: string };
  publishedYear: number;
  categories: string[];
  description?: string;
  addedBy: { _id: string; name: string };
};

export function RecipesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // ✅ Fetch all recipes
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
      if (!res.ok) {
        throw new Error(
          (await res.json()).message || "Failed to fetch recipes"
        );
      }
      const json = await res.json();
      return json.data;
    },
    enabled: !!user,
  });

  // ✅ Delete recipe
  const handleDelete = async () => {
    if (!user || !recipeToDelete) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/recipes/${recipeToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error(
          (await res.json()).message || "Failed to delete recipe"
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setRecipeToDelete(null);
    } catch (err: any) {
      alert(`Error deleting recipe: ${err.message}`);
    }
  };

  // ✅ Mutation for adding review
  const reviewMutation = useMutation({
    mutationFn: async ({
      recipeId,
      text,
      rating,
    }: {
      recipeId: string;
      text: string;
      rating: number;
    }) => {
      const res = await fetch(
        `http://localhost:3001/api/recipes/${recipeId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text, rating }),
        }
      );

      if (!res.ok) {
        let errMsg = "Failed to add review";
        try {
          const err = await res.json();
          errMsg = err.message || JSON.stringify(err);
        } catch (parseErr) {
          console.error("❌ Could not parse error JSON:", parseErr);
        }
        console.error("❌ Review request failed:", {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          body: { text, rating },
        });
        throw new Error(errMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-black text-purple-700 dark:text-pink-300">
          🍳 Recipes
        </h1>
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

      {/* Not logged in message */}
      {!user && (
        <div className="text-center text-lg text-yellow-700 dark:text-yellow-300 mb-8">
          Please log in to view recipes.
        </div>
      )}

      {/* Recipes list */}
      {isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : isError ? (
        <div className="text-center py-20 text-red-600">
          {error?.message || "Something went wrong."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {recipes?.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              userId={user?.userId}
              onEdit={() => setEditingRecipe(recipe)}
              onDelete={() => {
                setRecipeToDelete(recipe._id);
                handleDelete();
              }}
              onReviewSubmit={(data) =>
                reviewMutation.mutate({ ...data, recipeId: recipe._id })
              }
            />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      {editingRecipe && (
        <Dialog
          open={!!editingRecipe}
          onOpenChange={() => setEditingRecipe(null)}
        >
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
