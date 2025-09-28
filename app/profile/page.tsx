"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { SessionWrapper } from "@/components/session-wrapper";
import { Loading } from "@/components/loading";
import { ErrorDisplay } from "@/components/error-display";
import { PasswordChangeModal } from "@/components/password-change-modal";
import { EmailSettingsModal } from "@/components/email-settings-modal";
import { FadeIn } from "@/components/animations";
import { FiUser, FiMail, FiCalendar, FiEdit, FiCheck, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";

function ProfileContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      setName(session?.user?.name || "");
      setEmail(session?.user?.email || "");
      setLoading(false);
    }
  }, [status, router, session]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      console.log("Updating profile with data:", { name, email });
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const data = await response.json();
      console.log("Profile update response:", data);

      // 更新会话信息
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          email,
        },
      });

      setSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Loading text="Loading profile..." />
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <FadeIn>
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card">
            <div className="card-header flex justify-between items-start">
              <div>
                <h2 className="card-title">Account Information</h2>
                <p className="card-description">Your personal information</p>
              </div>
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiEdit className="h-4 w-4" /> Edit
                </motion.button>
              )}
            </div>
            <div className="card-content space-y-4">
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-200 mb-4"
                >
                  <FiCheck className="h-4 w-4" />
                  <p>Profile updated successfully!</p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-200 mb-4"
                >
                  <FiAlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </motion.div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input w-full"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="input w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      className="btn-primary flex items-center gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : (
                        <>
                          <FiCheck className="h-4 w-4" /> Save Changes
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setName(session?.user?.name || "");
                        setEmail(session?.user?.email || "");
                        setError("");
                      }}
                      className="btn-outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiUser className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{session?.user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiMail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{session?.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiCalendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{session?.user?.role?.toLowerCase() || "Member"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Account Settings</h2>
              <p className="card-description">Manage your account preferences</p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your password</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-outline"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change
                  </motion.button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Manage email preferences</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-outline"
                    onClick={() => setShowEmailSettingsModal(true)}
                  >
                    Settings
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Email Settings Modal */}
      <EmailSettingsModal
        isOpen={showEmailSettingsModal}
        onClose={() => setShowEmailSettingsModal(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <SessionWrapper>
      <LayoutWrapper>
        <ProfileContent />
      </LayoutWrapper>
    </SessionWrapper>
  );
}