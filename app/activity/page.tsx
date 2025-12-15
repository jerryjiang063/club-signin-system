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

const STORAGE_KEY = "recentPosts";

// localStorage utilities - SINGLE SOURCE OF TRUTH for posts
function getPostsFromStorage(): ActivityPost[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
}

function savePostsToStorage(posts: ActivityPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

export default function ActivityPage() {
  // SINGLE SOURCE OF TRUTH: useSession() ONLY - NO custom auth state
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [error, setError] = useState("");

  // NO custom isLoggedIn - derive everything directly from status
  // Logged in → status === "authenticated"
  // Logged out → status === "unauthenticated"
  // Loading → status === "loading"

  // Load posts from localStorage on mount (canonical source)
  useEffect(() => {
    const loadPosts = async () => {
      // Load from localStorage first (immediate display)
      const storedPosts = getPostsFromStorage();
      if (storedPosts.length > 0) {
        // Sort by createdAt descending
        const sorted = [...storedPosts].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sorted);
        setLoading(false);
      }

      // Sync with API in background (optional sync, localStorage is source of truth)
      try {
        const response = await fetch("/api/activity");
        if (response.ok) {
          const data = await response.json();
          const apiPosts = data.posts || [];
          
          // Merge: API posts take precedence for new posts, but keep localStorage deletions
          const mergedPosts = [...apiPosts];
          storedPosts.forEach((storedPost: ActivityPost) => {
            // Only add if not in API (preserves deletions)
            if (!apiPosts.find((p: ActivityPost) => p.id === storedPost.id)) {
              // Don't add back deleted posts
            }
          });
          
          // Sort by createdAt descending
          mergedPosts.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // Only update if we got new data
          if (apiPosts.length > 0) {
            setPosts(mergedPosts);
            savePostsToStorage(mergedPosts);
          }
        }
      } catch (error) {
        console.error("Error fetching posts from API:", error);
        // If API fails, use localStorage data only
        if (storedPosts.length > 0) {
          const sorted = [...storedPosts].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPosts(sorted);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Handle like toggle
  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/activity/${postId}/like`, {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update post in state
        const updatedPosts = posts.map((post) =>
          post.id === postId
            ? { ...post, likes: data.post.likes, likedBy: data.post.likedBy }
            : post
        );
        setPosts(updatedPosts);
        // Update localStorage (source of truth)
        savePostsToStorage(updatedPosts);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle post creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // STRICT PERMISSION CHECK: Must be authenticated
    if (status !== "authenticated" || !session?.user) {
      console.warn("Post creation blocked: Not authenticated", { status });
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
          userId: session.user.id || session.user.email || undefined,
          userName: session.user.name || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create post");
      }

      const data = await response.json();
      const newPost = data.post;
      
      // Add to state
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      
      // Save to localStorage (source of truth) - CRITICAL
      savePostsToStorage(updatedPosts);
      
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

  // Handle post deletion - STRICT PERMISSION CHECKS
  const handleDelete = (postId: string) => {
    // PERMISSION CHECK #1: Must be authenticated
    if (status !== "authenticated") {
      console.warn("Delete blocked: Not authenticated", { status });
      return;
    }

    // PERMISSION CHECK #2: Session and user must exist
    if (!session || !session.user) {
      console.warn("Delete blocked: No session or user", { 
        hasSession: !!session, 
        hasUser: !!session?.user 
      });
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      console.warn("Delete blocked: Post not found", { postId });
      return;
    }

    // PERMISSION CHECK #3: Get current user identifier
    const currentUserId = session.user.id;
    const currentUserEmail = session.user.email;
    
    // PERMISSION CHECK #4: Check if user is admin
    const isAdmin = session.user.role === "ADMIN";
    
    // PERMISSION CHECK #5: Check if user is the author
    const isAuthor = post.userId && (
      post.userId === currentUserId || 
      post.userId === currentUserEmail
    );
    
    // PERMISSION CHECK #6: Must be admin OR author
    if (!isAdmin && !isAuthor) {
      console.warn("Delete blocked: Not authorized", { 
        isAdmin, 
        isAuthor, 
        postUserId: post.userId, 
        currentUserId, 
        currentUserEmail 
      });
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm("Delete this post? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    // CRITICAL: Update localStorage FIRST (source of truth)
    const updatedPosts = posts.filter((p) => p.id !== postId);
    savePostsToStorage(updatedPosts);
    
    // THEN update React state from localStorage result
    setPosts(updatedPosts);
  };

  // Check if user can delete a post (for rendering delete button)
  // STRICT PERMISSION CHECK: Must verify ALL conditions
  const canDeletePost = (post: ActivityPost): boolean => {
    // PERMISSION CHECK #1: Must be authenticated
    if (status !== "authenticated") {
      return false;
    }
    
    // PERMISSION CHECK #2: Session must exist and have user
    if (!session || !session.user) {
      return false;
    }
    
    // PERMISSION CHECK #3: Get current user identifier
    const currentUserId = session.user.id;
    const currentUserEmail = session.user.email;
    
    // PERMISSION CHECK #4: Check if user is admin
    const isAdmin = session.user.role === "ADMIN";
    
    // PERMISSION CHECK #5: Check if user is the author
    const isAuthor = post.userId && (
      post.userId === currentUserId || 
      post.userId === currentUserEmail
    );
    
    // PERMISSION CHECK #6: Must be admin OR author
    return isAdmin || isAuthor;
  };

  // Check if post is liked
  const isLiked = (post: ActivityPost): boolean => {
    return false; // Default to false
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

          {/* Create Post Form - STRICT STATUS-BASED RENDERING */}
          <FadeIn className="mb-8" delay={0.1}>
            <div className="card">
              {status === "loading" ? (
                // Handle loading state explicitly - never show "Log in to post" while loading
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : status === "unauthenticated" ? (
                // Not authenticated - show passive message, no input
                <div className="p-6 text-center space-y-4">
                  <p className="text-muted-foreground">Log in to post.</p>
                  <Link href="/login" className="btn-primary inline-flex items-center">
                    Login
                  </Link>
                </div>
              ) : status === "authenticated" && !showCreateForm ? (
                // Authenticated - show post input trigger
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-4 text-left text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-lg hover:border-primary"
                >
                  <div className="flex items-center gap-2">
                    <FiImage className="h-5 w-5" />
                    <span>Share something with the community...</span>
                  </div>
                </button>
              ) : status === "authenticated" ? (
                // Authenticated - show post composer
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
              ) : null}
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
                          {/* Delete button - ONLY renders if canDeletePost returns true */}
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
