// src/components/AddReviewButton.tsx
/*es */
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
};

export function AddReviewButton({ recipeId, onSubmit }: AddReviewButtonProps) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState("1");

  const handleSubmit = () => {
    onSubmit({ recipeId, text, rating: Number(rating) });
    setText("");
    setRating("1");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add your review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your review..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div>
            <Label className="mb-2 block">Rating</Label>
            <RadioGroup
              value={rating}
              onValueChange={setRating}
              className="flex gap-4"
            >
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={String(num)} id={`rating-${num}`} />
                  <Label htmlFor={`rating-${num}`}>
                    {Array(num).fill("⭐").join("")}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button onClick={handleSubmit}>Add Review</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
