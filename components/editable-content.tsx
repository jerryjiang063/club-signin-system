"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SiteContent {
  id: string;
  key: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  updatedAt: string;
}

interface EditableContentProps {
  contentKey: string;
  defaultTitle?: string;
  defaultContent?: string;
  defaultImageUrl?: string;
  onUpdate?: (content: SiteContent) => void;
}

export function EditableContent({
  contentKey,
  defaultTitle = "",
  defaultContent = "",
  defaultImageUrl = "",
  onUpdate
}: EditableContentProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/site-content/${contentKey}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
        } else {
          // If content doesn't exist yet, use defaults
          setContent({
            id: "",
            key: contentKey,
            title: defaultTitle,
            content: defaultContent,
            imageUrl: defaultImageUrl,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error fetching content for ${contentKey}:`, error);
        // Use defaults on error
        setContent({
          id: "",
          key: contentKey,
          title: defaultTitle,
          content: defaultContent,
          imageUrl: defaultImageUrl,
          updatedAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentKey, defaultTitle, defaultContent, defaultImageUrl]);

  const handleSave = async () => {
    if (!isAdmin || !content) return;
    
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/site-content/${contentKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: content.title,
          content: content.content,
          imageUrl: content.imageUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update content');
      }

      const data = await response.json();
      setContent(data.content);
      setSuccess(true);
      
      if (onUpdate) {
        onUpdate(data.content);
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: 'title' | 'content' | 'imageUrl', value: string) => {
    if (!content) return;
    
    setContent({
      ...content,
      [field]: value
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {content && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{contentKey.replace(/_/g, ' ')}</h3>
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input w-full"
                placeholder="Title"
                disabled={!isAdmin}
              />
              <textarea
                value={content.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                className="input w-full min-h-[100px]"
                placeholder="Content"
                disabled={!isAdmin}
              />
              {content.imageUrl !== null && (
                <input
                  type="text"
                  value={content.imageUrl || ''}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  className="input w-full"
                  placeholder="Image URL"
                  disabled={!isAdmin}
                />
              )}
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-500">Content updated successfully!</p>}
        </>
      )}
    </div>
  );
}
