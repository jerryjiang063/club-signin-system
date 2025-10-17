"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import Image from "next/image";
import { FiUsers, FiHeart, FiEdit2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { GiSprout } from "react-icons/gi";
import { motion } from "framer-motion";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  // 编辑状态
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isSavingMission, setIsSavingMission] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  
  // 内容状态
  const [missionContent, setMissionContent] = useState({
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    text1: "The In-Class Gardening Club aims to bring nature into our learning space — turning our classroom into a place of growth, creativity, and calm. We believe that caring for plants helps us care for ourselves and our community. Through hands-on gardening, we learn responsibility, teamwork, and environmental awareness while making our classroom greener and more inspiring every day."
  });
  
  const [historyContent, setHistoryContent] = useState({
    imageUrl: "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2671&q=80",
    text1: "The In-Class Gardening Club was founded in 2025 as a brand-new student initiative. Although we're just getting started, our goal is clear — to create a small indoor garden that brings life, color, and calmness into our classroom. This is our first year, and we're excited to grow together — both our plants and our community."
  });

  // 加载数据
  useEffect(() => {
    const loadAboutData = async () => {
      try {
        // 加载使命内容
        const missionResponse = await fetch("/api/site-content/about_mission");
        if (missionResponse.ok) {
          const data = await missionResponse.json();
          if (data.content && data.content.content) {
            try {
              const parsed = JSON.parse(data.content.content);
              setMissionContent(parsed);
            } catch (e) {
              // 如果不是JSON，使用默认值
            }
          }
        }

        // 加载历史内容
        const historyResponse = await fetch("/api/site-content/about_history");
        if (historyResponse.ok) {
          const data = await historyResponse.json();
          if (data.content && data.content.content) {
            try {
              const parsed = JSON.parse(data.content.content);
              setHistoryContent(parsed);
            } catch (e) {
              // 如果不是JSON，使用默认值
            }
          }
        }
      } catch (error) {
        console.error("Error loading about data:", error);
      }
    };

    loadAboutData();
  }, []);
  
  // 保存使命内容
  const saveMissionContent = async () => {
    setIsSavingMission(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/site-content/about_mission", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Our Mission",
          content: JSON.stringify(missionContent),
          imageUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mission content");
      }

      setSaveMessage({ type: "success", text: "Mission content saved successfully!" });
      setIsEditingMission(false);
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving mission content:", error);
      setSaveMessage({ type: "error", text: "Failed to save mission content" });
    } finally {
      setIsSavingMission(false);
    }
  };
  
  // 保存历史内容
  const saveHistoryContent = async () => {
    setIsSavingHistory(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/site-content/about_history", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Our History",
          content: JSON.stringify(historyContent),
          imageUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save history content");
      }

      setSaveMessage({ type: "success", text: "History content saved successfully!" });
      setIsEditingHistory(false);
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving history content:", error);
      setSaveMessage({ type: "error", text: "Failed to save history content" });
    } finally {
      setIsSavingHistory(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-12">
        <FadeIn className="mb-12 text-center">
          <h1 className="text-4xl font-bold">About Our Gardening Club</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn more about our mission, history, and the people behind our in-class gardening initiative.
          </p>
        </FadeIn>

        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 flex items-center gap-2 rounded-md p-4 text-sm ${
              saveMessage.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {saveMessage.type === "success" ? (
              <FiCheckCircle className="h-4 w-4" />
            ) : (
              <FiAlertCircle className="h-4 w-4" />
            )}
            <p>{saveMessage.text}</p>
          </motion.div>
        )}

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <FadeIn delay={0.1}>
              <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80">
                {isEditingMission ? (
                  <div className="h-full flex flex-col justify-center items-center border-2 border-dashed border-primary/50 rounded-lg p-4">
                    <input
                      type="text"
                      className="input w-full mb-2"
                      value={missionContent.imageUrl}
                      onChange={(e) => setMissionContent({...missionContent, imageUrl: e.target.value})}
                      placeholder="Image URL"
                    />
                    <p className="text-xs text-muted-foreground">Enter URL for mission image</p>
                  </div>
                ) : (
                  <Image
                    src={missionContent.imageUrl}
                    alt="Students gardening together"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Our Mission</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingMission(!isEditingMission)}
                    className="btn-outline p-2 flex items-center gap-1 text-sm"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    {isEditingMission ? "Cancel" : "Edit"}
                  </button>
                )}
              </div>
              
              {isEditingMission ? (
                <div className="space-y-4">
                  <textarea
                    className="input w-full min-h-[100px]"
                    value={missionContent.text1}
                    onChange={(e) => setMissionContent({...missionContent, text1: e.target.value})}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={saveMissionContent}
                      className="btn-primary"
                      disabled={isSavingMission}
                    >
                      {isSavingMission ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {missionContent.text1}
                </p>
              )}
            </FadeIn>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <FadeIn className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Our Values</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              The core principles that guide our gardening community
            </p>
          </FadeIn>

          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            <StaggerItem>
              <div className="card h-full">
                <div className="card-header">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GiSprout className="h-6 w-6" />
                  </div>
                  <h3 className="card-title">Growth</h3>
                </div>
                <div className="card-content">
                  <p className="text-muted-foreground">
                    We nurture growth in both our plants and our members, fostering development and learning through hands-on experience.
                  </p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="card h-full">
                <div className="card-header">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiUsers className="h-6 w-6" />
                  </div>
                  <h3 className="card-title">Community</h3>
                </div>
                <div className="card-content">
                  <p className="text-muted-foreground">
                    We build connections between students through shared responsibilities and collaborative care for our classroom plants.
                  </p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="card h-full">
                <div className="card-header">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiHeart className="h-6 w-6" />
                  </div>
                  <h3 className="card-title">Responsibility</h3>
                </div>
                <div className="card-content">
                  <p className="text-muted-foreground">
                    We encourage accountability and commitment through regular plant care duties and check-ins.
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* History Section */}
        <section className="mb-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <FadeIn delay={0.1} className="order-2 md:order-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Our History</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingHistory(!isEditingHistory)}
                    className="btn-outline p-2 flex items-center gap-1 text-sm"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    {isEditingHistory ? "Cancel" : "Edit"}
                  </button>
                )}
              </div>
              
              {isEditingHistory ? (
                <div className="space-y-4">
                  <textarea
                    className="input w-full min-h-[100px]"
                    value={historyContent.text1}
                    onChange={(e) => setHistoryContent({...historyContent, text1: e.target.value})}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={saveHistoryContent}
                      className="btn-primary"
                      disabled={isSavingHistory}
                    >
                      {isSavingHistory ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {historyContent.text1}
                </p>
              )}
            </FadeIn>
            <FadeIn delay={0.2} className="order-1 md:order-2">
              <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80">
                {isEditingHistory ? (
                  <div className="h-full flex flex-col justify-center items-center border-2 border-dashed border-primary/50 rounded-lg p-4">
                    <input
                      type="text"
                      className="input w-full mb-2"
                      value={historyContent.imageUrl}
                      onChange={(e) => setHistoryContent({...historyContent, imageUrl: e.target.value})}
                      placeholder="Image URL"
                    />
                    <p className="text-xs text-muted-foreground">Enter URL for history image</p>
                  </div>
                ) : (
                  <Image
                    src={historyContent.imageUrl}
                    alt="Plants growing in classroom"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="bg-secondary/30 rounded-lg p-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Become a part of our gardening club and help nurture our classroom plants while developing valuable skills and connections.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/register" className="btn-primary">
                Become a Member
              </a>
              <a href="/contact" className="btn-outline">
                Contact Us
              </a>
            </div>
          </FadeIn>
        </section>
      </div>
    </LayoutWrapper>
  );
}