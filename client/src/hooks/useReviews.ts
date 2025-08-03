import { useQuery } from "@tanstack/react-query";

type Review = {
  _id: string;
  text: string;
  rating: number;
  createdAt: string;
  reviewer: {
    email: string;
  };
};

export function useReviews(recipeId: string) {
  return useQuery<Review[], Error>({
  queryKey: ["reviews", recipeId],
  queryFn: async () => {
    const res = await fetch(`/api/recipes/${recipeId}/reviews`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const data = await res.json();
    return data.reviews;
  },
  enabled: !!recipeId,
});
}
