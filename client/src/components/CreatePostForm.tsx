import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export function CreatePostForm() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", content: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      const res = await fetch("http://localhost:3001/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      form.reset();
      setSuccessMessage("✅ Post created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      setSuccessMessage(null);
      form.setError("title", { type: "manual", message: error.message });
      form.setError("content", { type: "manual", message: error.message });
    },
  });

  const onSubmit = async (data: CreatePostFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-10 rounded-3xl shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Sparkles className="text-indigo-500 dark:text-pink-400" />
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center">
          Share Something New
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
            placeholder="Give your post a catchy title"
          />
          <FormFieldWrapper
            control={form.control}
            name="content"
            label="Content"
            type="textarea"
            placeholder="Write your thoughts here..."
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full text-base font-semibold tracking-wide py-3 rounded-full"
          >
            {mutation.isPending ? "Publishing..." : "Publish Post 🚀"}
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
