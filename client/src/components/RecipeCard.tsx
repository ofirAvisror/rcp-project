// RecipeCard.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddReviewButton } from "./AddReviewButton";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Info } from "lucide-react";
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
  addedBy: { _id: string; name: string };
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

  const { data: reviews, isLoading } = useQuery<{ reviews: Review[] }>({
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

  return (
    <div className="relative rounded-2xl bg-white/90 dark:bg-gray-900/80 border border-purple-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4 space-y-1">
        <h3 className="text-xl font-bold text-purple-800 dark:text-pink-300">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          👨‍🍳{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {recipe.chef.name}
          </span>{" "}
          · {recipe.publishedYear}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-300">
          🏷 Categories: {(recipe.categories ?? []).join(", ")}
        </p>
      </div>

      {/* Review Section */}
      <div className="mt-3">
        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1">
          🗣 Reviews
        </h4>
        {isLoading ? (
          <p className="text-xs text-gray-500">Loading reviews...</p>
        ) : reviews?.reviews?.length ? (
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {reviews.reviews.map((rev) => (
              <li key={rev._id} className="border-b pb-1">
                ⭐ {rev.rating} – {rev.text}{" "}
                <span className="italic text-xs text-gray-500">
                  ({rev.reviewer?.email || "Anonymous"})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">No reviews yet</p>
        )}
      </div>

      {/* Review Button */}
      {userId && (
        <div className="mt-4">
          <AddReviewButton recipeId={recipe._id} onSubmit={onReviewSubmit} />
        </div>
      )}

      {/* Buttons Top Right */}
      <div className="absolute top-3 right-3 flex gap-1">
        {/* Info */}
        <Dialog open={openDetails} onOpenChange={setOpenDetails}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="w-4 h-4 text-gray-500 hover:text-indigo-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{recipe.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p>
                <strong>Chef:</strong> {recipe.chef.name}
              </p>
              <p>
                <strong>Published:</strong> {recipe.publishedYear}
              </p>
              <p>
                <strong>Categories:</strong>{" "}
                {(recipe.categories ?? []).join(", ")}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {recipe.description || "No description provided"}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit + Delete (only if owner) */}
        {userId === recipe.addedBy._id && (
          <>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="w-4 h-4 text-gray-500 hover:text-yellow-600" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
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
  );
}
