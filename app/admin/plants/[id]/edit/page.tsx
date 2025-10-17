"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Loading } from "@/components/loading";
import { ImageUploadCrop } from "@/components/image-upload-crop";
import Link from "next/link";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiSave } from "react-icons/fi";
import { motion } from "framer-motion";

export default function EditPlantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const plantId = params?.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [waterAmount, setWaterAmount] = useState("");
  const [waterSchedule, setWaterSchedule] = useState("");
  const [careNotes, setCareNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    const fetchPlant = async () => {
      try {
        const response = await fetch(`/api/plants/${plantId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch plant data");
        }
        
        const data = await response.json();
        const plant = data.plant;
        
        setName(plant.name || "");
        setDescription(plant.description || "");
        setWaterAmount(plant.waterAmount || "");
        setWaterSchedule(plant.waterSchedule || "");
        setCareNotes(plant.careNotes || "");
        setImageUrl(plant.imageUrl || "");
      } catch (err: any) {
        console.error("Error fetching plant:", err);
        setError(err.message || "An error occurred while fetching plant data");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && plantId) {
      fetchPlant();
    }
  }, [status, session, router, plantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!name.trim()) {
      setError("Plant name is required");
      setSubmitting(false);
      return;
    }

    const plantData = {
      name: name.trim(),
      description: description.trim() || null,
      waterAmount: waterAmount.trim() || null,
      waterSchedule: waterSchedule.trim() || null,
      careNotes: careNotes.trim() || null,
      imageUrl
    };

    console.log("Sending plant update request with data:", plantData);

    try {
      const response = await fetch(`/api/plants/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plantData)
      });

      console.log("Plant update response status:", response.status);
      
      // 检查Content-Type是否为JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON, content-type:", contentType);
        const text = await response.text();
        console.error("Response text:", text.substring(0, 200));
        throw new Error("Server returned an invalid response. Please make sure you're logged in as admin.");
      }
      
      // 获取响应数据
      const responseData = await response.json();
      console.log("Plant update response data:", responseData);
      
      // 检查响应状态
      if (!response.ok) {
        setError(responseData.error || "Failed to update plant");
        setSubmitting(false);
        return;
      }
      
      // 成功处理
      console.log("Plant updated successfully:", responseData.plant);
      setSuccess(true);
      
      // 显示成功消息3秒后返回列表页
      setTimeout(() => {
        router.push("/admin/plants");
      }, 3000);
    } catch (err: any) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "An error occurred while updating the plant");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-12 flex justify-center items-center">
          <Loading text="Loading plant data..." />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Link
              href="/admin/plants"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <FiArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit Plant</h1>
              <p className="text-muted-foreground">
                Update plant information
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-200"
              >
                <FiCheckCircle className="h-4 w-4" />
                <p>Plant updated successfully! Redirecting...</p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-200"
              >
                <FiAlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium leading-none"
                  >
                    Plant Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input w-full"
                    placeholder="e.g. Monstera Deliciosa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium leading-none"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="input min-h-[120px] w-full"
                    placeholder="Describe the plant and its care requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="waterAmount"
                      className="text-sm font-medium leading-none"
                    >
                      Water Amount
                    </label>
                    <input
                      id="waterAmount"
                      type="text"
                      className="input w-full"
                      placeholder="e.g. 200ml"
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="waterSchedule"
                      className="text-sm font-medium leading-none"
                    >
                      Watering Schedule
                    </label>
                    <input
                      id="waterSchedule"
                      type="text"
                      className="input w-full"
                      placeholder="e.g. Every 3 days"
                      value={waterSchedule}
                      onChange={(e) => setWaterSchedule(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="careNotes"
                    className="text-sm font-medium leading-none"
                  >
                    Care Notes
                  </label>
                  <textarea
                    id="careNotes"
                    className="input min-h-[80px] w-full"
                    placeholder="Special care instructions or notes..."
                    value={careNotes}
                    onChange={(e) => setCareNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Plant Image
                  </label>
                  <ImageUploadCrop
                    value={imageUrl}
                    onChange={setImageUrl}
                    aspectRatio={4 / 3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a photo of your plant. You can crop and rotate it before saving.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Link
                    href="/admin/plants"
                    className="btn-outline"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                    disabled={submitting}
                  >
                    <FiSave className="h-4 w-4" />
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}