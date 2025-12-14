"use client";

import { useState, useEffect } from "react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiUsers, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { GiPlantRoots } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  imageUrl: string | null;
}

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch("/api/plants");
        const data = await response.json();
        const plantsWithImages = data.plants.filter((p: Plant) => p.imageUrl);
        setPlants(plantsWithImages);
      } catch (error) {
        console.error("Error fetching plants:", error);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    if (plants.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % plants.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [plants.length]);

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % plants.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + plants.length) % plants.length);
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };
  return (
    <LayoutWrapper>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="container mx-auto flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
          <FadeIn className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block">Growing Together,</span>
              <span className="block text-primary">Blooming Knowledge</span>
            </h1>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground lg:mx-0">
              Welcome to our In-Class Gardening Club platform. Track plant care, share your gardening journey, and learn together in our green community.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link href="/register" className="btn-primary">
                Join the Club
              </Link>
              <Link href="/plants" className="btn-outline">
                Explore Plants
              </Link>
              <Link href="/activity" className="btn-outline">
                Recent Activity
              </Link>
            </div>
          </FadeIn>
          <FadeIn className="flex-1" delay={0.2}>
            <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80 lg:h-96 group">
              {/* 渐变覆盖层 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 rounded-lg z-10 pointer-events-none"></div>
              
              {/* 图片轮播 */}
              {plants.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={plants[currentImageIndex]?.imageUrl || ""}
                        alt={plants[currentImageIndex]?.name || "Plant"}
                        fill
                        className="object-cover"
                        priority={currentImageIndex === 0}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* 左箭头 */}
                  {plants.length > 1 && (
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft className="h-6 w-6 text-foreground" />
                    </button>
                  )}

                  {/* 右箭头 */}
                  {plants.length > 1 && (
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <FiChevronRight className="h-6 w-6 text-foreground" />
                    </button>
                  )}

                  {/* 小圆点指示器 */}
                  {plants.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {plants.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`transition-all ${
                            index === currentImageIndex
                              ? "w-8 bg-white"
                              : "w-2 bg-white/50 hover:bg-white/75"
                          } h-2 rounded-full`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* 植物名称标签 */}
                  <div className="absolute bottom-16 left-4 z-20 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium">{plants[currentImageIndex]?.name}</p>
                  </div>
                </>
              ) : (
                <Image
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80"
                  alt="Plants in a garden"
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <FadeIn className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How Our Club Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple and effective way to manage plant care in our community
            </p>
          </FadeIn>
          <StaggerContainer className="grid gap-8 md:grid-cols-3">
            <StaggerItem>
              <div className="card h-full">
                <div className="card-header">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiUsers className="h-6 w-6" />
                  </div>
                  <h3 className="card-title">Member Check-ins</h3>
                </div>
                <div className="card-content">
                  <p className="text-muted-foreground">
                    Club members log in daily to check on their assigned plants, water them, and record their progress with notes and photos.
                  </p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="card h-full">
                <div className="card-header">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GiPlantRoots className="h-6 w-6" />
                  </div>
                  <h3 className="card-title">Plant Management</h3>
                </div>
                <div className="card-content">
                  <p className="text-muted-foreground">
                    Administrators assign specific plants to members, track care history, and ensure all plants receive proper attention.
                  </p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="card h-full">
                <div className="card-header">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiCalendar className="h-6 w-6" />
                  </div>
                  <h3 className="card-title">Care Reminders</h3>
                </div>
                <div className="card-content">
                  <p className="text-muted-foreground">
                    Automatic email reminders ensure members never forget their plant care responsibilities, sent a day before and on the scheduled day.
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-secondary/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <FadeIn className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Benefits of Our Platform</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Why our gardening club platform makes plant care easier and more enjoyable
            </p>
          </FadeIn>
          <div className="max-w-4xl mx-auto">
            <StaggerContainer className="grid gap-6 md:grid-cols-2">
              {[
                "Track plant growth and health over time",
                "Share knowledge and tips with fellow gardeners",
                "Never forget to water with timely reminders",
                "Build a visual record of your gardening journey",
                "Learn about different plant species and care techniques",
                "Contribute to our classroom's green environment",
              ].map((benefit, index) => (
                <StaggerItem key={index}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <FiCheck className="h-3 w-3" />
                    </div>
                    <p>{benefit}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16 text-primary-foreground sm:px-6 lg:px-8">
        <FadeIn className="container mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Join Our Gardening Community?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Sign up today and start your plant care journey with our in-class gardening club.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-white/90">
              Get Started
              <FiArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10">
              Learn More
            </Link>
          </div>
        </FadeIn>
      </section>
    </LayoutWrapper>
  );
}