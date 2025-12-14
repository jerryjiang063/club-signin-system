"use client";

import { useState, useEffect } from "react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn } from "@/components/animations";
import { ImageUploadCrop } from "@/components/image-upload-crop";
import { FiHeart, FiSend, FiImage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// Simple date formatting function
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

interface ActivityPost {
  id: string;
  text: string;
  imageUrl: string | null;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export default function ActivityPage() {
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [error, setError] = useState("");

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/activity");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle like toggle
  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/activity/${postId}/like`, {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update the post in the list
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: data.post.likes, likedBy: data.post.likedBy }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle post creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!postText.trim()) {
      setError("Text is required");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: postText.trim(),
          imageUrl: postImageUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create post");
      }

      const data = await response.json();
      
      // Add new post to the beginning of the list
      setPosts((prevPosts) => [data.post, ...prevPosts]);
      
      // Reset form
      setPostText("");
      setPostImageUrl("");
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if post is liked (using a simple approach - could be improved with session tracking)
  const isLiked = (post: ActivityPost): boolean => {
    // For simplicity, we'll check if the user's IP/session is in likedBy
    // In a real app, you'd track this per user session
    return false; // Default to false, could be enhanced with session tracking
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <FadeIn className="mb-8">
            <h1 className="text-3xl font-bold text-center">Recent Activity</h1>
            <p className="text-muted-foreground text-center">
              Share your gardening journey with the community
            </p>
          </FadeIn>

          {/* Create Post Form */}
          <FadeIn className="mb-8" delay={0.1}>
            <div className="card">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-4 text-left text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-lg hover:border-primary"
                >
                  <div className="flex items-center gap-2">
                    <FiImage className="h-5 w-5" />
                    <span>Share something with the community...</span>
                  </div>
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <textarea
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder="What's on your mind?"
                      className="input min-h-[120px] w-full resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image (optional)</label>
                    <ImageUploadCrop
                      value={postImageUrl}
                      onChange={setPostImageUrl}
                      aspectRatio={16 / 9}
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setPostText("");
                        setPostImageUrl("");
                        setError("");
                      }}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                      disabled={submitting}
                    >
                      <FiSend className="h-4 w-4" />
                      {submitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FadeIn>

          {/* Posts Feed */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="card"
                  >
                    <div className="p-6 space-y-4">
                      {/* Post Text */}
                      <p className="text-foreground whitespace-pre-wrap break-words">
                        {post.text}
                      </p>

                      {/* Post Image */}
                      {post.imageUrl && (
                        <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden border border-border">
                          <Image
                            src={post.imageUrl}
                            alt="Post image"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                            isLiked(post)
                              ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                              : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                        >
                          <FiHeart
                            className={`h-5 w-5 ${isLiked(post) ? "fill-current" : ""}`}
                          />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>

                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

