import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateBookForm } from "./CreateBookForm";

import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
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

type Book = {
  _id: string;
  title: string;
  author: {
    _id: string;
    name: string;
  };
  publishedYear: number;
  genres: string[];
};

export function BooksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("http://localhost:3001/api/books/all", {
        credentials: "include",
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to fetch books");

      const json = await res.json();
      return Array.isArray(json.books) ? json.books : [];
    },
    enabled: !!user,
  });

  const handleDelete = async () => {
    if (!user || !bookToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/books/${bookToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "Failed to delete book");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setBookToDelete(null);
    } catch (err: any) {
      alert(`Error deleting book: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-black text-purple-700 dark:text-pink-300">📚 Library</h1>
        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full shadow">
                <Plus className="w-4 h-4" /> New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add a New Book</DialogTitle>
              </DialogHeader>
              <CreateBookForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!user && (
        <div className="text-center text-lg text-yellow-700 dark:text-yellow-300 mb-8">
          Please log in to view books.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : isError ? (
        <div className="text-center py-20 text-red-600">
          {error?.message || "Something went wrong."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {books?.map((book) => (
            <div
              key={book._id}
              className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 border shadow-xl p-6 hover:shadow-2xl"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-purple-800 dark:text-pink-300 mb-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✍️{" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {book.author.name}
                  </span>{" "}
                  · {book.publishedYear}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                  Genres: {book.genres.join(", ")}
                </p>
              </div>

              {user?.role === "admin" && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => setBookToDelete(book._id)}
                        className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-full p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Book</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this book? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBookToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
