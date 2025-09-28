"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import Image from "next/image";
import { FiUsers, FiAward, FiHeart, FiEdit2 } from "react-icons/fi";
import { GiPlantRoots, GiPlantSeed, GiSprout } from "react-icons/gi";
import { motion } from "framer-motion";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  // 编辑状态
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  
  // 内容状态
  const [missionContent, setMissionContent] = useState({
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    text1: "The In-Class Gardening Club was founded with a simple but powerful mission: to connect students with nature, foster responsibility, and create a greener learning environment.",
    text2: "We believe that by caring for plants, students develop patience, responsibility, and an appreciation for the natural world. Our club provides hands-on experience with plant care while building community through shared responsibility."
  });
  
  const [historyContent, setHistoryContent] = useState({
    imageUrl: "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2671&q=80",
    text1: "The In-Class Gardening Club began in 2023 as a small initiative with just three plants in a single classroom. What started as a simple project to bring more greenery into our learning environment quickly blossomed into something much larger.",
    text2: "Today, our club manages over 30 plants across multiple classrooms, with dedicated members ensuring each plant receives the care it needs. Our digital platform has transformed how we coordinate care and track growth, making our gardening club more efficient and engaging for all members."
  });
  
  // 保存使命内容
  const saveMissionContent = async () => {
    // 这里应该调用API保存更新的内容
    console.log("Saving mission content:", missionContent);
    setIsEditingMission(false);
  };
  
  // 保存历史内容
  const saveHistoryContent = async () => {
    // 这里应该调用API保存更新的内容
    console.log("Saving history content:", historyContent);
    setIsEditingHistory(false);
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
                  <textarea
                    className="input w-full min-h-[100px]"
                    value={missionContent.text2}
                    onChange={(e) => setMissionContent({...missionContent, text2: e.target.value})}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={saveMissionContent}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    {missionContent.text1}
                  </p>
                  <p className="text-muted-foreground">
                    {missionContent.text2}
                  </p>
                </>
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
                  <textarea
                    className="input w-full min-h-[100px]"
                    value={historyContent.text2}
                    onChange={(e) => setHistoryContent({...historyContent, text2: e.target.value})}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={saveHistoryContent}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    {historyContent.text1}
                  </p>
                  <p className="text-muted-foreground">
                    {historyContent.text2}
                  </p>
                </>
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