"use client";

import { useState, useEffect, ReactNode } from "react";

interface SiteContent {
  id: string;
  key: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  updatedAt: string;
}

interface HomeContentProps {
  contentKey: string;
  children: (content: { 
    title: string | null; 
    content: string | null; 
    imageUrl: string | null; 
  }) => ReactNode;
  defaultTitle?: string;
  defaultContent?: string;
  defaultImageUrl?: string;
}

export function HomeContent({
  contentKey,
  children,
  defaultTitle,
  defaultContent,
  defaultImageUrl
}: HomeContentProps) {
  const [content, setContent] = useState<{
    title: string | null;
    content: string | null;
    imageUrl: string | null;
  }>({
    title: defaultTitle || null,
    content: defaultContent || null,
    imageUrl: defaultImageUrl || null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log(`Fetching content for key: ${contentKey}`);
        
        // 先尝试从 API 获取内容
        const response = await fetch(`/api/site-content/${contentKey}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log(`Content API response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Content data received:`, data.content);
          
          if (data.content) {
            setContent({
              title: data.content.title || defaultTitle || null,
              content: data.content.content || defaultContent || null,
              imageUrl: data.content.imageUrl || defaultImageUrl || null
            });
          }
        } else {
          // 如果获取失败，尝试创建内容
          console.log(`Content not found for key: ${contentKey}, trying to initialize`);
          
          if (defaultTitle || defaultContent || defaultImageUrl) {
            const createResponse = await fetch(`/api/site-content/${contentKey}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: defaultTitle || null,
                content: defaultContent || null,
                imageUrl: defaultImageUrl || null
              })
            });
            
            if (createResponse.ok) {
              const data = await createResponse.json();
              console.log(`Content created:`, data.content);
              
              if (data.content) {
                setContent({
                  title: data.content.title || defaultTitle || null,
                  content: data.content.content || defaultContent || null,
                  imageUrl: data.content.imageUrl || defaultImageUrl || null
                });
              }
            } else {
              // 如果创建也失败，使用默认值
              console.log(`Failed to create content, using defaults`);
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching content for ${contentKey}:`, err);
        setError(`Failed to fetch content: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentKey, defaultTitle, defaultContent, defaultImageUrl]);

  if (loading) {
    return <div className="p-4 text-center">Loading content...</div>;
  }

  if (error) {
    console.warn(`Error in HomeContent component:`, error);
    // 出错时仍然使用默认值渲染
  }

  return <>{children(content)}</>;
}