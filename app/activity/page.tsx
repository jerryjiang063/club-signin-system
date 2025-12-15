"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn } from "@/components/animations";
import { ImageUploadCrop } from "@/components/image-upload-crop";
import { FiHeart, FiSend, FiImage, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
  userId?: string;
  userName?: string;
}

export default function ActivityPage() {
  // SINGLE SOURCE OF TRUTH: useSession() ONLY
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [error, setError] = useState("");

  // Auth state - derived ONLY from useSession()
  const isAuthenticated = status === "authenticated" && session?.user;

  // Load posts from database API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/activity");
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle like toggle
  const handleLike = async (postId: string) => {
    // PERMISSION CHECK: Must be authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/activity/${postId}/like`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update post in state
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
    
    // PERMISSION CHECK #1 (UI layer): Must be authenticated
    if (!isAuthenticated) {
      setError("You must be logged in to post");
      router.push("/login");
      return;
    }

    // PERMISSION CHECK #2 (Action layer): Re-check authentication
    if (status !== "authenticated" || !session?.user) {
      setError("Session expired. Please log in again");
      router.push("/login");
      return;
    }

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
      const newPost = data.post;
      
      // Add to state (newest first)
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      
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

  // Handle post deletion - STRICT PERMISSION CHECKS IN TWO LAYERS
  const handleDelete = async (postId: string) => {
    // LAYER 1: PERMISSION CHECK #1 - Must be authenticated
    if (!isAuthenticated) {
      console.warn("Delete blocked: Not authenticated");
      return;
    }

    // LAYER 1: PERMISSION CHECK #2 - Re-check session
    if (status !== "authenticated" || !session?.user) {
      console.warn("Delete blocked: Session invalid");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      console.warn("Delete blocked: Post not found", { postId });
      return;
    }

    // LAYER 1: PERMISSION CHECK #3 - Get current user identifier
    const currentUserId = session.user.id;
    
    // LAYER 1: PERMISSION CHECK #4 - Check if user is admin
    const isAdmin = session.user.role === "ADMIN";
    
    // LAYER 1: PERMISSION CHECK #5 - Check if user is the author
    const isAuthor = post.userId && post.userId === currentUserId;
    
    // LAYER 1: PERMISSION CHECK #6 - Must be admin OR author
    if (!isAdmin && !isAuthor) {
      console.warn("Delete blocked: Not authorized", { 
        isAdmin, 
        isAuthor, 
        postUserId: post.userId, 
        currentUserId 
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm("Delete this post? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      // LAYER 2: Backend API will also check permissions
      const response = await fetch(`/api/activity/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete post");
      }

      // Remove from state (backend confirmed deletion)
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    } catch (err: any) {
      console.error("Error deleting post:", err);
      alert(err.message || "Failed to delete post");
    }
  };

  // LAYER 2: Check if user can delete a post (for rendering delete button)
  // STRICT PERMISSION CHECK: Must verify ALL conditions
  const canDeletePost = (post: ActivityPost): boolean => {
    // PERMISSION CHECK #1: Must be authenticated
    if (!isAuthenticated) {
      return false;
    }
    
    // PERMISSION CHECK #2: Session must exist and have user
    if (!session || !session.user) {
      return false;
    }
    
    // PERMISSION CHECK #3: Get current user identifier
    const currentUserId = session.user.id;
    
    // PERMISSION CHECK #4: Check if user is admin
    const isAdmin = session.user.role === "ADMIN";
    
    // PERMISSION CHECK #5: Check if user is the author
    const isAuthor = post.userId && post.userId === currentUserId;
    
    // PERMISSION CHECK #6: Must be admin OR author
    return isAdmin || isAuthor;
  };

  // Check if post is liked
  const isLiked = (post: ActivityPost): boolean => {
    if (!isAuthenticated || !session?.user?.id) return false;
    return post.likedBy.includes(session.user.id);
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

          {/* Create Post Form - STRICT AUTHENTICATION CHECK */}
          <FadeIn className="mb-8" delay={0.1}>
            <div className="card">
              {status === "loading" ? (
                // Handle loading state explicitly
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : !isAuthenticated ? (
                // NOT AUTHENTICATED - Show message only, NO input form
                <div className="p-6 text-center space-y-4">
                  <p className="text-muted-foreground">Please sign in to post.</p>
                  <Link href="/login" className="btn-primary inline-flex items-center">
                    Sign in
                  </Link>
                </div>
              ) : !showCreateForm ? (
                // AUTHENTICATED - Show post input trigger
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
                // AUTHENTICATED - Show post composer
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

          {/* Posts Feed - Anyone can view */}
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

                        <div className="flex items-center gap-3">
                          {/* Delete button - LAYER 2: ONLY renders if canDeletePost returns true */}
                          {canDeletePost(post) && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-muted-foreground hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete post"
                              aria-label="Delete post"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
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
