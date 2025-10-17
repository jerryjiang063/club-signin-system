"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownPreview } from "@/components/markdown-preview";
import { FadeIn } from "@/components/animations";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiSave, FiCheckCircle, FiAlertCircle, FiEdit } from "react-icons/fi";
import { motion } from "framer-motion";

interface SiteContent {
  id: string;
  key: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  updatedAt: string;
}

interface ContentSection {
  key: string;
  title: string;
  description: string;
  hasImage: boolean;
  hasMarkdown: boolean;
}

function ContentEditContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contentItems, setContentItems] = useState<SiteContent[]>([]);
  const [error, setError] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    imageUrl: string;
  }>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [saveStatus, setSaveStatus] = useState<{
    key: string;
    status: "idle" | "saving" | "success" | "error";
    message: string;
  } | null>(null);

  // Define content sections to edit
  const contentSections: ContentSection[] = [
    {
      key: "home_hero",
      title: "Home Hero Section",
      description: "The main hero section on the homepage",
      hasImage: true,
      hasMarkdown: false
    },
    {
      key: "features_title",
      title: "Features Section",
      description: "The features section heading and description",
      hasImage: false,
      hasMarkdown: false
    },
    {
      key: "benefits_title",
      title: "Benefits Section",
      description: "The benefits section heading and description",
      hasImage: false,
      hasMarkdown: false
    },
    {
      key: "cta_section",
      title: "Call to Action Section",
      description: "The call to action section at the bottom of the homepage",
      hasImage: false,
      hasMarkdown: false
    },
    {
      key: "about_hero",
      title: "About Page Hero",
      description: "The hero section on the about page",
      hasImage: true,
      hasMarkdown: true
    },
    {
      key: "about_content",
      title: "About Page Content",
      description: "The main content of the about page",
      hasImage: false,
      hasMarkdown: true
    },
    {
      key: "contact_info",
      title: "Contact Information",
      description: "Contact information displayed on the contact page",
      hasImage: false,
      hasMarkdown: true
    },
    {
      key: "privacy_content",
      title: "Privacy Policy",
      description: "Content for the privacy policy page",
      hasImage: false,
      hasMarkdown: true
    }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    const fetchContent = async () => {
      try {
        const response = await fetch("/api/site-content");
        if (!response.ok) {
          throw new Error("Failed to fetch site content");
        }
        const data = await response.json();
        setContentItems(data.content || []);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching content");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchContent();
    }
  }, [status, session, router]);

  const handleEdit = (key: string) => {
    const contentItem = contentItems.find(item => item.key === key);
    if (contentItem) {
      setFormData({
        title: contentItem.title || "",
        content: contentItem.content || "",
        imageUrl: contentItem.imageUrl || "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        imageUrl: "",
      });
    }
    setEditingKey(key);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setSaveStatus(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleSave = async (key: string) => {
    if (!editingKey) return;

    setSaveStatus({
      key,
      status: "saving",
      message: "Saving changes..."
    });

    try {
      const response = await fetch(`/api/site-content/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          imageUrl: formData.imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update content");
      }

      const data = await response.json();
      
      // Update the content item in the state
      setContentItems(prev => {
        const existingIndex = prev.findIndex(item => item.key === key);
        if (existingIndex >= 0) {
          // Update existing item
          const newItems = [...prev];
          newItems[existingIndex] = data.content;
          return newItems;
        } else {
          // Add new item
          return [...prev, data.content];
        }
      });

      setSaveStatus({
        key,
        status: "success",
        message: "Content updated successfully!"
      });

      // Reset after a delay
      setTimeout(() => {
        setEditingKey(null);
        setSaveStatus(null);
      }, 2000);
    } catch (err: any) {
      setSaveStatus({
        key,
        status: "error",
        message: err.message || "An error occurred while saving"
      });
      console.error(err);
    }
  };

  const getContentItem = (key: string) => {
    return contentItems.find(item => item.key === key) || null;
  };

  const getContentSection = (key: string) => {
    return contentSections.find(section => section.key === key) || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading content editor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Site Content</h1>
          <p className="text-muted-foreground">
            Update the content displayed on the website
          </p>
        </div>
      </div>

      <FadeIn className="space-y-8">
        <div className="alert alert-info bg-blue-50 p-4 rounded-md text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 mb-6">
          <p>
            <strong>Note:</strong> Changes made here will be saved to the database and will be immediately visible on the website.
            For sections with Markdown support, you can use Markdown syntax to format your content.
          </p>
        </div>

        {contentSections.map((section) => {
          const contentItem = getContentItem(section.key);
          const isEditing = editingKey === section.key;
          const status = saveStatus?.key === section.key ? saveStatus.status : "idle";

          return (
            <motion.div 
              key={section.key} 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-header flex justify-between items-start">
                <div>
                  <h2 className="card-title">{section.title}</h2>
                  <p className="card-description">{section.description}</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => handleEdit(section.key)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiEdit className="h-4 w-4" /> Edit
                  </button>
                )}
              </div>
              <div className="card-content">
                {isEditing ? (
                  <div className="space-y-4">
                    {status === "success" && (
                      <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <FiCheckCircle className="h-4 w-4" />
                        <p>{saveStatus?.message}</p>
                      </div>
                    )}
                    {status === "error" && (
                      <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <FiAlertCircle className="h-4 w-4" />
                        <p>{saveStatus?.message}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label htmlFor={`${section.key}-title`} className="text-sm font-medium">
                        Title
                      </label>
                      <input
                        id={`${section.key}-title`}
                        name="title"
                        type="text"
                        className="input w-full"
                        placeholder="Enter title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`${section.key}-content`} className="text-sm font-medium">
                        Content
                      </label>
                      {section.hasMarkdown ? (
                        <MarkdownEditor
                          value={formData.content}
                          onChange={handleContentChange}
                          placeholder="Enter content using Markdown..."
                          minHeight="200px"
                        />
                      ) : (
                        <textarea
                          id={`${section.key}-content`}
                          name="content"
                          className="input min-h-[100px] w-full"
                          placeholder="Enter content"
                          value={formData.content}
                          onChange={handleChange}
                        />
                      )}
                    </div>
                    {section.hasImage && (
                      <div className="space-y-2">
                        <label htmlFor={`${section.key}-image`} className="text-sm font-medium">
                          Image URL
                        </label>
                        <input
                          id={`${section.key}-image`}
                          name="imageUrl"
                          type="text"
                          className="input w-full"
                          placeholder="Enter image URL"
                          value={formData.imageUrl}
                          onChange={handleChange}
                        />
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">Image Preview:</p>
                          <div className="h-40 w-full bg-muted relative rounded-md overflow-hidden">
                            {formData.imageUrl ? (
                              <Image
                                src={formData.imageUrl}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-muted-foreground">No image URL provided</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button 
                        className="btn-primary flex items-center gap-2"
                        onClick={() => handleSave(section.key)}
                        disabled={status === "saving"}
                      >
                        {status === "saving" ? "Saving..." : (
                          <>
                            <FiSave className="h-4 w-4" /> Save Changes
                          </>
                        )}
                      </button>
                      <button 
                        className="btn-outline"
                        onClick={handleCancel}
                        disabled={status === "saving"}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                      <p className="text-lg font-medium">{contentItem?.title || "No title set"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Content</h3>
                      {section.hasMarkdown ? (
                        <MarkdownPreview content={contentItem?.content || ""} />
                      ) : (
                        <p className="whitespace-pre-wrap">{contentItem?.content || "No content set"}</p>
                      )}
                    </div>
                    {section.hasImage && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Image</h3>
                        <div className="h-40 w-full bg-muted relative rounded-md overflow-hidden">
                          {contentItem?.imageUrl ? (
                            <Image
                              src={contentItem.imageUrl}
                              alt={contentItem.title || "Content image"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-sm text-muted-foreground">No image set</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </FadeIn>
    </div>
  );
}

export default function ContentEditPage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <ContentEditContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}