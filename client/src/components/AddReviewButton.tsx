import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type AddReviewButtonProps = {
  recipeId: string;
  onSubmit: (data: { recipeId: string; text: string; rating: number }) => void;
  className?: string;
};

export function AddReviewButton({
  recipeId,
  onSubmit,
  className,
}: AddReviewButtonProps) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState("1");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit({ recipeId, text, rating: Number(rating) });
    setText("");
    setRating("1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={
            className ||
            "w-full text-indigo-600 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
          }
        >
          📝 Add Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-purple-700 dark:text-pink-300">
            Add your review
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your review..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
          />
          <div>
            <Label className="mb-2 block text-sm text-gray-600 dark:text-gray-300">
              Rating
            </Label>
            <RadioGroup
              value={rating}
              onValueChange={setRating}
              className="flex gap-4"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(num)} id={`rating-${num}`} />
                  <Label
                    htmlFor={`rating-${num}`}
                    className="cursor-pointer text-yellow-500"
                  >
                    {Array(num).fill("⭐").join("")}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
