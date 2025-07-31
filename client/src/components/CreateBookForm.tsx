import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";

// סכמת ולידציה לספר חדש
const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author ID is required"),
  publishedYear: z
    .string()
    .regex(/^\d{4}$/, "Published year must be a valid year (e.g. 2023)"),
  genres: z.string().min(1, "Genres are required (comma-separated)"),
});

type CreateBookFormData = z.infer<typeof createBookSchema>;

export function CreateBookForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreateBookFormData>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      title: "",
      author: "",
      publishedYear: "",
      genres: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateBookFormData) => {
      const res = await fetch("http://localhost:3001/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: data.title,
          author: data.author,
          publishedYear: Number(data.publishedYear),
          genres: data.genres.split(",").map((g) => g.trim()),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create book");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      form.reset();
      setSuccessMessage("✅ Book created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      setSuccessMessage(null);
      form.setError("title", { type: "manual", message: error.message });
    },
  });

  const onSubmit = (data: CreateBookFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-10 rounded-3xl shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Sparkles className="text-indigo-500 dark:text-pink-400" />
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center">
          Add a New Book
        </h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 transition-all"
        >
          <FormFieldWrapper
            control={form.control}
            name="title"
            label="Title"
            type="text"
            placeholder="Book title"
          />
          <FormFieldWrapper
            control={form.control}
            name="author"
            label="Author ID"
            type="text"
            placeholder="Author ID (MongoDB ObjectId)"
          />
          <FormFieldWrapper
            control={form.control}
            name="publishedYear"
            label="Published Year"
            type="text"
            placeholder="2023"
          />
          <FormFieldWrapper
            control={form.control}
            name="genres"
            label="Genres"
            type="text"
            placeholder="comma,separated,genres"
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full text-base font-semibold tracking-wide py-3 rounded-full"
          >
            {mutation.isPending ? "Adding..." : "Add Book 📚"}
          </Button>

          {successMessage && (
            <div className="text-center text-green-600 dark:text-green-400 font-medium mt-4 animate-pulse">
              {successMessage}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
