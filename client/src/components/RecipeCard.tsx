// RecipeCard.tsx
import { useQuery } from "@tanstack/react-query";
import { AddReviewButton } from "./AddReviewButton";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
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
  // ✅ useQuery is allowed here
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
    <div className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 border shadow-xl p-6 hover:shadow-2xl">
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

      {/* Reviews */}
      <div className="mt-3">
        <h4 className="font-semibold">Reviews:</h4>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading reviews...</p>
        ) : reviews?.reviews?.length ? (
          <ul className="mt-1 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {reviews.reviews.map((rev) => (
              <li key={rev._id}>
                ⭐ {rev.rating} – {rev.text}{" "}
                <span className="italic text-xs">
                  ({rev.reviewer?.email || "Anonymous"})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No reviews yet</p>
        )}
      </div>

      {/* Add review */}
      {userId && (
        <AddReviewButton recipeId={recipe._id} onSubmit={onReviewSubmit} />
      )}

      {/* Edit & Delete (only owner) */}
      {userId === recipe.addedBy._id && (
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="ghost" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" onClick={onDelete}>
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
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
