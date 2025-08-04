import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddReviewButton } from "./AddReviewButton";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Info, ImageOff } from "lucide-react";
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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ---------- Types ---------- */
type Review = {
  _id: string;
  text: string;
  rating: number;
  reviewer: { _id: string; email: string };
  createdAt: string;
};

type Recipe = {
  _id: string;
  title: string;
  chef: { _id: string; name: string };
  publishedYear: number;
  categories: string[];
  description?: string;
  ingredients: string[];
  addedBy: { _id: string; name: string };
  imageUrl?: string;
};

export function RecipeCard({
  recipe,
  userId,
  onEdit,
  onDelete,
  onReviewSubmit,
}: {
  recipe: Recipe;
  userId?: string;
  onEdit: () => void;
  onDelete: () => void;
  onReviewSubmit: (data: { text: string; rating: number }) => void;
}) {
  const [openDetails, setOpenDetails] = useState(false);

  const { data: reviews } = useQuery<{ reviews: Review[] }>({
    queryKey: ["reviews", recipe._id],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3001/api/recipes/${recipe._id}/reviews`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
  });

  const reviewList = reviews?.reviews ?? [];
  const averageRating = reviewList.length
    ? (
        reviewList.reduce((acc, r) => acc + r.rating, 0) / reviewList.length
      ).toFixed(1)
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500 bg-gradient-to-br from-purple-700 to-purple-900 shadow-lg hover:shadow-xl transition-shadow">
      {/* ----- Image with floating actions ----- */}
      <div className="relative">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-56 object-cover rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-56 bg-purple-600 flex items-center justify-center rounded-t-2xl">
            <div className="flex items-center gap-2 text-purple-300">
              <ImageOff className="w-5 h-5" />
              <span className="text-sm">No image</span>
            </div>
          </div>
        )}

        {/* Rating badge */}
        {averageRating && (
          <div className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-purple-900 px-2 py-1 rounded shadow-sm">
            ⭐ {averageRating}/5
          </div>
        )}

        {/* Action buttons (Info / Edit / Delete) */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Dialog open={openDetails} onOpenChange={setOpenDetails}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/90 hover:bg-white"
              >
                <Info className="w-5 h-5 text-purple-900" />
              </Button>
            </DialogTrigger>

            {/* ---------- INFO DIALOG ---------- */}
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle>{recipe.title}</DialogTitle>
              </DialogHeader>

              {/* Hero */}
              <div className="relative">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-60 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-60 bg-gray-200 dark:bg-gray-800" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-10">
                  <h2 className="text-2xl font-bold text-white">
                    {recipe.title}
                  </h2>
                  <p className="mt-1 text-xs text-white/90">
                    👨‍🍳 {recipe.chef.name}
                    <span className="mx-2">•</span>
                    📅 {recipe.publishedYear}
                    {averageRating && (
                      <>
                        <span className="mx-2">•</span>⭐ {averageRating}/5
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: description + reviews */}
                <div className="lg:col-span-2 space-y-6">
                  <section>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Description
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                      {recipe.description || "No description provided."}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Reviews
                    </h3>
                    {reviewList.length > 0 ? (
                      <ul className="mt-2 space-y-3">
                        {reviewList.map((rev) => (
                          <li
                            key={rev._id}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                ⭐ {rev.rating}
                              </span>
                              <span className="text-xs text-gray-500">
                                {rev.reviewer?.email || "Anonymous"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                              {rev.text}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        No reviews yet.
                      </p>
                    )}
                  </section>
                </div>

                {/* Right: Ingredients + meta */}
                <aside className="space-y-6">
                  <section>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Ingredients
                    </h3>
                    {recipe.ingredients?.length ? (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {recipe.ingredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        No ingredients listed.
                      </p>
                    )}
                  </section>

                  <section className="text-sm">
                    <h4 className="text-gray-500">Recipe info</h4>
                    <div className="mt-2 space-y-1 text-gray-800 dark:text-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chef</span>
                        <span className="font-medium">{recipe.chef.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Year</span>
                        <span className="font-medium">
                          {recipe.publishedYear}
                        </span>
                      </div>
                      {(recipe.categories?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-gray-500">Categories</span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300">
                            {(recipe.categories ?? []).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </aside>
              </div>
            </DialogContent>
          </Dialog>

          {userId === recipe.addedBy._id && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="rounded-full bg-white/90 hover:bg-white"
              >
                <Pencil className="w-5 h-5 text-purple-900" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/90 hover:bg-white"
                  >
                    <Trash2 className="w-5 h-5 text-purple-900" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Are you sure?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* ----- Content (clean) ----- */}
      <div className="px-5 pt-4 pb-5">
        <h3 className="text-2xl font-extrabold text-white tracking-wide leading-tight">
          {recipe.title}
        </h3>

        <p className="mt-1 text-lg font-semibold text-purple-300 tracking-wide">
          👨‍🍳 {recipe.chef.name}
        </p>

        {userId && (
          <div className="mt-4">
            <AddReviewButton recipeId={recipe._id} onSubmit={onReviewSubmit} />
          </div>
        )}
      </div>
    </div>
  );
}
