"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn } from "@/components/animations";
import { FiSend, FiMapPin, FiMail, FiPhone, FiAlertCircle, FiCheckCircle, FiEdit2 } from "react-icons/fi";
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
  
  // 联系信息
  const [contactInfo, setContactInfo] = useState({
    address: "123 School Street, Vancouver, BC V6B 1A9",
    email: "gardening.club@school.edu",
    phone: "+1 (604) 555-1234"
  });
  
  // 开放时间
  const [clubHours, setClubHours] = useState({
    weekdays: "3:00 PM - 5:00 PM",
    saturday: "10:00 AM - 2:00 PM",
    sunday: "Closed"
  });

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
    // 这里应该调用API保存更新的联系信息
    console.log("Saving contact info:", contactInfo);
    setIsEditingContact(false);
  };
  
  // 保存开放时间
  const saveClubHours = async () => {
    // 这里应该调用API保存更新的开放时间
    console.log("Saving club hours:", clubHours);
    setIsEditingHours(false);
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
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
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
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FiPhone className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Phone</h3>
                    {isEditingContact ? (
                      <input
                        type="text"
                        className="input w-full mt-1"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {contactInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                {isEditingContact && (
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={saveContactInfo}
                      className="btn-primary"
                    >
                      Save Changes
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
                    <div className="flex items-center justify-between">
                      <span>Monday - Friday</span>
                      <input
                        type="text"
                        className="input w-40"
                        value={clubHours.weekdays}
                        onChange={(e) => setClubHours({...clubHours, weekdays: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Saturday</span>
                      <input
                        type="text"
                        className="input w-40"
                        value={clubHours.saturday}
                        onChange={(e) => setClubHours({...clubHours, saturday: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sunday</span>
                      <input
                        type="text"
                        className="input w-40"
                        value={clubHours.sunday}
                        onChange={(e) => setClubHours({...clubHours, sunday: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <button 
                        onClick={saveClubHours}
                        className="btn-primary"
                      >
                        Save Hours
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-medium">{clubHours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-medium">{clubHours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-medium">{clubHours.sunday}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </LayoutWrapper>
  );
}
