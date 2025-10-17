"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn } from "@/components/animations";
import { FiSend, FiMapPin, FiMail, FiAlertCircle, FiCheckCircle, FiEdit2 } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ContactPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(null);
  
  // 编辑状态
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  
  // 联系信息
  const [contactInfo, setContactInfo] = useState({
    address: "Room 320",
    email: "inclassgardening@outlook.com"
  });
  
  // 开放时间
  const [clubHours, setClubHours] = useState("Friday Lunch Break");

  // 加载数据
  useEffect(() => {
    const loadContactData = async () => {
      try {
        // 加载联系信息
        const contactResponse = await fetch("/api/site-content/contact_info");
        if (contactResponse.ok) {
          const data = await contactResponse.json();
          if (data.content && data.content.content) {
            try {
              const parsed = JSON.parse(data.content.content);
              setContactInfo(parsed);
            } catch (e) {
              // 如果不是JSON，使用默认值
            }
          }
        }

        // 加载开放时间
        const hoursResponse = await fetch("/api/site-content/club_hours");
        if (hoursResponse.ok) {
          const data = await hoursResponse.json();
          if (data.content && data.content.content) {
            setClubHours(data.content.content);
          }
        }
      } catch (error) {
        console.error("Error loading contact data:", error);
      }
    };

    loadContactData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // 模拟表单提交
    try {
      // 这里应该是实际的表单提交逻辑
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      
      // 如果是管理员，发送通知
      if (isAdmin) {
        console.log("New contact message received");
        // 这里可以添加通知逻辑
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 保存联系信息
  const saveContactInfo = async () => {
    setIsSavingContact(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/site-content/contact_info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Contact Information",
          content: JSON.stringify(contactInfo),
          imageUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save contact information");
      }

      setSaveMessage({ type: "success", text: "Contact information saved successfully!" });
      setIsEditingContact(false);
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving contact info:", error);
      setSaveMessage({ type: "error", text: "Failed to save contact information" });
    } finally {
      setIsSavingContact(false);
    }
  };
  
  // 保存开放时间
  const saveClubHours = async () => {
    setIsSavingHours(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/site-content/club_hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Club Hours",
          content: clubHours,
          imageUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save club hours");
      }

      setSaveMessage({ type: "success", text: "Club hours saved successfully!" });
      setIsEditingHours(false);
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving club hours:", error);
      setSaveMessage({ type: "error", text: "Failed to save club hours" });
    } finally {
      setIsSavingHours(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-12">
        <FadeIn className="mb-12 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our gardening club? We're here to help! Send us a message and we'll get back to you as soon as possible.
          </p>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Form */}
          <FadeIn delay={0.1} className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>

            {submitStatus === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300 mb-6"
              >
                <FiCheckCircle className="h-4 w-4" />
                <p>Your message has been sent successfully! We'll get back to you soon.</p>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 mb-6"
              >
                <FiAlertCircle className="h-4 w-4" />
                <p>There was an error sending your message. Please try again later.</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="input w-full"
                    placeholder="Please enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input w-full"
                    placeholder="Please enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="input w-full"
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  className="input w-full min-h-[150px]"
                  placeholder="Tell us what you need help with..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <FiSend className="h-4 w-4" />
              </motion.button>
            </form>
          </FadeIn>

          {/* Contact Information */}
          <FadeIn delay={0.2}>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex items-center gap-2 rounded-md p-4 text-sm ${
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
            
            <div className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Contact Information</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingContact(!isEditingContact)}
                    className="btn-outline p-2 flex items-center gap-1 text-sm"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    {isEditingContact ? "Cancel" : "Edit"}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiMapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Address</h3>
                    {isEditingContact ? (
                      <input
                        type="text"
                        className="input w-full mt-1"
                        value={contactInfo.address}
                        onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {contactInfo.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiMail className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Email</h3>
                    {isEditingContact ? (
                      <input
                        type="email"
                        className="input w-full mt-1"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {contactInfo.email}
                      </p>
                    )}
                  </div>
                </div>
                
                {isEditingContact && (
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={saveContactInfo}
                      className="btn-primary"
                      disabled={isSavingContact}
                    >
                      {isSavingContact ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Club Hours</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingHours(!isEditingHours)}
                    className="btn-outline p-2 flex items-center gap-1 text-sm"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    {isEditingHours ? "Cancel" : "Edit"}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {isEditingHours ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      className="input w-full"
                      value={clubHours}
                      onChange={(e) => setClubHours(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                      <button 
                        onClick={saveClubHours}
                        className="btn-primary"
                        disabled={isSavingHours}
                      >
                        {isSavingHours ? "Saving..." : "Save Hours"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {clubHours}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </LayoutWrapper>
  );
}
