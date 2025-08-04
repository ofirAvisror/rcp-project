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
  ingredients: string[]; // ✅ added here
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
    <div className="relative rounded-2xl bg-white/90 dark:bg-gray-900/80 border border-purple-200 dark:border-gray-700 shadow-xl p-6 hover:shadow-2xl transition duration-300">
      {averageRating && (
        <div className="absolute top-3 left-3 text-sm text-yellow-600 font-bold bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded shadow">
          ⭐ {averageRating}/4
        </div>
      )}

      <div className="mb-4 mt-6 space-y-2">
        <h3 className="text-2xl font-extrabold text-purple-800 dark:text-pink-300 tracking-tight">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          👨‍🍳{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {recipe.chef.name}
          </span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Year: {recipe.publishedYear}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-300">
          🏷 Categories: {(recipe.categories ?? []).join(", ")}
        </p>
      </div>

      {userId && (
        <div className="mt-4">
          <AddReviewButton recipeId={recipe._id} onSubmit={onReviewSubmit} />
        </div>
      )}
      <div className="relative rounded-2xl overflow-hidden bg-white/90 dark:bg-gray-900/80 border border-purple-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition duration-300">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6">
          {/* rest of your card content like title, chef, categories, etc. */}
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-1">
        <Dialog open={openDetails} onOpenChange={setOpenDetails}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="w-5 h-5 text-gray-600 hover:text-indigo-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-purple-800 dark:text-pink-300">
                {recipe.title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3 text-sm text-gray-800 dark:text-gray-100">
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

              {/* ✅ Ingredients list */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="font-semibold text-base mb-2">
                    🥗 Ingredients
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ✅ Reviews */}
              {reviewList.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="font-semibold text-base">All Reviews</h4>
                  <ul className="text-sm space-y-2 mt-2">
                    {reviewList.map((rev) => (
                      <li key={rev._id} className="border-b pb-2">
                        ⭐ {rev.rating} – {rev.text} <br />
                        <span className="italic text-xs text-gray-500">
                          ({rev.reviewer?.email || "Anonymous"})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {userId === recipe.addedBy._id && (
          <>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="w-5 h-5 text-gray-600 hover:text-yellow-600" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
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
