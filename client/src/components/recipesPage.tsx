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

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

// ✅ Recipe type with imageUrl optional
export type Recipe = {
  _id: string;
  title: string;
  chef: { _id: string; name: string };
  publishedYear: number;
  categories: string[];
  description?: string;
  ingredients: string[];
  imageUrl?: string;
  addedBy: { _id: string; name: string };
  averageRating?: number; // ⭐ calculated from reviews
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

  // filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStars, setSelectedStars] = useState<string>("");
  const [selectedChef, setSelectedChef] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"recipes" | "chefs">("recipes");

  // ✅ New Recipe dialog state
  const [openNewRecipe, setOpenNewRecipe] = useState(false);

  // --- Recipes query
  const {
    data: recipes = [],
    isLoading: loadingRecipes,
    isError: errorRecipes,
  } = useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/recipes/all", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const recipes = (await res.json()).data || [];

      // ✅ fetch reviews for each recipe and attach averageRating
      const withRatings = await Promise.all(
        recipes.map(async (recipe: Recipe) => {
          try {
            const revRes = await fetch(
              `http://localhost:3001/api/recipes/${recipe._id}/reviews`,
              { credentials: "include" }
            );
            if (!revRes.ok) return { ...recipe, averageRating: 0 };
            const data = await revRes.json();
            const reviews = data.reviews || [];
            const avg =
              reviews.length > 0
                ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
                  reviews.length
                : 0;
            return { ...recipe, averageRating: avg };
          } catch {
            return { ...recipe, averageRating: 0 };
          }
        })
      );

      return withRatings;
    },
    enabled: !!user && activeTab === "recipes",
  });

  // --- Chefs query
  const {
    data: chefs = [],
    isLoading: loadingChefs,
    isError: errorChefs,
  } = useQuery<Chef[]>({
    queryKey: ["chefs"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/api/chefs/all", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chefs");
      return (await res.json()).data || [];
    },
    enabled: !!user,
  });

  // --- Categories
  const allCategories = useMemo(() => {
    return Array.from(new Set(recipes.flatMap((r) => r.categories)));
  }, [recipes]);

  // --- Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      let ok = true;
      if (selectedCategory && !r.categories.includes(selectedCategory))
        ok = false;
      if (selectedChef && r.chef.name !== selectedChef) ok = false;
      if (selectedStars) {
        const stars = r.averageRating ?? 0;
        if (selectedStars === "gt4" && !(stars > 4)) ok = false;
        if (selectedStars === "gt3" && !(stars > 3)) ok = false;
        if (selectedStars === "gt2" && !(stars > 2)) ok = false;
        if (selectedStars === "lt2" && !(stars < 2)) ok = false;
      }
      return ok;
    });
  }, [recipes, selectedCategory, selectedStars, selectedChef]);

  // --- Delete recipe
  const handleDelete = async () => {
    if (!user || !recipeToDelete) return;
    try {
      await fetch(`http://localhost:3001/api/recipes/${recipeToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setRecipeToDelete(null);
    } catch (err: any) {
      alert(`Error deleting recipe: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header + Tabs */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-extrabold text-amber-800 dark:text-amber-300">
  🍽️ My Recipes
</h1>

          {/* Tabs (warm, dark) */}
          <div className="flex gap-2">
            <Button
              className={`rounded-full px-6 py-2 ${
                activeTab === "recipes"
                  ? "bg-amber-800 text-white"
                  : "bg-stone-700 text-white/90 hover:bg-stone-600"
              }`}
              onClick={() => setActiveTab("recipes")}
            >
              Recipes
            </Button>
            <Button
              className={`rounded-full px-6 py-2 ${
                activeTab === "chefs"
                  ? "bg-amber-800 text-white"
                  : "bg-stone-700 text-white/90 hover:bg-stone-600"
              }`}
              onClick={() => setActiveTab("chefs")}
            >
              Chefs
            </Button>
          </div>
        </div>

        {/* ✅ Controlled New Recipe Dialog */}
        {user && activeTab === "recipes" && (
          <Dialog open={openNewRecipe} onOpenChange={setOpenNewRecipe}>
            <DialogTrigger asChild>
              <Button className="bg-amber-800 hover:bg-amber-700 text-white rounded-full px-5 py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add a New Recipe</DialogTitle>
              </DialogHeader>
              <CreateRecipeForm onClose={() => setOpenNewRecipe(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ✅ Three filter NavBars */}
      {activeTab === "recipes" && (
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Categories */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 rounded-full bg-amber-800 text-white">
                  Categories
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 min-w-[180px]">
                  <ul>
                    <li>
                      <NavigationMenuLink
                        className={`block px-3 py-1 rounded cursor-pointer ${
                          selectedCategory === ""
                            ? "bg-amber-700 text-white"
                            : "hover:bg-stone-200 dark:hover:bg-stone-800"
                        }`}
                        onClick={() => setSelectedCategory("")}
                      >
                        All
                      </NavigationMenuLink>
                    </li>
                    {allCategories.map((cat) => (
                      <li key={cat}>
                        <NavigationMenuLink
                          className={`block px-3 py-1 rounded cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-amber-700 text-white"
                              : "hover:bg-stone-200 dark:hover:bg-stone-800"
                          }`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Stars */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 rounded-full bg-amber-800 text-white">
                  Stars
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 min-w-[180px]">
                  <ul>
                    <li>
                      <NavigationMenuLink className="block px-3 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800" onClick={() => setSelectedStars("gt4")}>
                        ⭐ More than 4
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink className="block px-3 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800" onClick={() => setSelectedStars("gt3")}>
                        ⭐ More than 3
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink className="block px-3 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800" onClick={() => setSelectedStars("gt2")}>
                        ⭐ More than 2
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink className="block px-3 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800" onClick={() => setSelectedStars("lt2")}>
                        ⭐ Less than 2
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink className="block px-3 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800" onClick={() => setSelectedStars("")}>
                        Reset
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Chefs */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 rounded-full bg-amber-800 text-white">
                  Chefs
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 min-w-[180px]">
                  <ul>
                    <li>
                      <NavigationMenuLink className="block px-3 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800" onClick={() => setSelectedChef("")}>
                        All
                      </NavigationMenuLink>
                    </li>
                    {chefs.map((chef) => (
                      <li key={chef._id}>
                        <NavigationMenuLink
                          className={`block px-3 py-1 rounded cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-800 ${
                            selectedChef === chef.name ? "bg-amber-700 text-white" : ""
                          }`}
                          onClick={() => setSelectedChef(chef.name)}
                        >
                          {chef.name}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
                  await fetch(
                    `http://localhost:3001/api/recipes/${recipe._id}/reviews`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify(data),
                    }
                  );
                  queryClient.invalidateQueries({
                    queryKey: ["recipes"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["reviews", recipe._id],
                  });
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
              <div
                key={chef._id}
                className="border rounded-xl p-6 shadow bg-white dark:bg-gray-900 transition hover:shadow-lg"
              >
                <h3 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">
                  {chef.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  👨‍🍳 Specialty: {chef.specialty}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📈 Experience years: {chef.experienceYears}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🎂 Born: {chef.birthYear}
                </p>
                {chef.about && (
                  <p className="text-sm mt-2 italic text-gray-500">
                    {chef.about}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!recipeToDelete}
        onOpenChange={() => setRecipeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-stone-700 text-white hover:bg-stone-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-800 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
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
