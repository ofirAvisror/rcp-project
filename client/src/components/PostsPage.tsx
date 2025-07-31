import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostResponse } from "../../../server/src/types";
import { CreatePostForm } from "./CreatePostForm";

import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Plus } from "lucide-react";
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

export function PostsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery<PostResponse[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("http://localhost:3001/api/posts", {
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to fetch posts");
      return res.json();
    },
    enabled: !!user,
  });

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to like post");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (err: any) {
      alert(`Error liking post: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!user || !postToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to delete post");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPostToDelete(null);
    } catch (err: any) {
      alert(`Error deleting post: ${err.message}`);
    }
  };

  const handleEdit = (post: PostResponse) => {
    setEditingPostId(post.id);
    setEditedTitle(post.title);
    setEditedContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!user || !editingPostId) return;
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: editedTitle, content: editedContent }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to update post");
      setEditingPostId(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (err: any) {
      alert(`Error updating post: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedTitle("");
    setEditedContent("");
  };

  if (!user) return <div className="text-center py-20">Please log in.</div>;
  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (isError) return <div className="text-center py-20 text-red-600">{error?.message || "Something went wrong."}</div>;

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-black text-purple-700 dark:text-pink-300">💡 Inspiration Feed</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full shadow">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Post</DialogTitle>
            </DialogHeader>
            <CreatePostForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts?.map((post) => (
          <div key={post.id} className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 border shadow-xl p-6 hover:shadow-2xl">
            {editingPostId === post.id ? (
              <div className="flex flex-col gap-3">
                <input
                  className="bg-white dark:bg-gray-800 p-2 rounded"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <textarea
                  className="bg-white dark:bg-gray-800 p-2 rounded"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} className="bg-green-600 text-white">Save</Button>
                  <Button onClick={handleCancelEdit} variant="secondary">Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-purple-800 dark:text-pink-300 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ✍️ <span className="font-semibold text-indigo-600 dark:text-indigo-400">{post.userName}</span> · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">{post.content}</p>
                <Button
                  variant="outline"
                  className="mt-4 text-sm"
                  onClick={() => handleLike(post.id)}
                  disabled={post.likedByCurrentUser}
                >
                  ❤️ {post.likes} {post.likedByCurrentUser ? "Liked" : "Like"}
                </Button>
              </>
            )}

            {user?.userId === post.userId && editingPostId !== post.id && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleEdit(post)}
                  className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-400 rounded-full p-2"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => setPostToDelete(post.id)}
                      className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-full p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Post</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this post? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setPostToDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
