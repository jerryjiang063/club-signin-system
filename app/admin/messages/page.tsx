"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Loading } from "@/components/loading";
import { FiMail, FiTrash2, FiAlertCircle, FiCheck, FiX, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    // 模拟从API获取消息
    const fetchMessages = async () => {
      try {
        // 这里应该是实际的API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        const mockMessages: Message[] = [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            subject: "Question about joining the club",
            message: "Hello, I'm interested in joining the gardening club. Could you please provide more information about the membership process and any requirements?",
            date: "2025-09-27T14:30:00Z",
            read: false
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            subject: "Plant donation inquiry",
            message: "Hi there, I have several indoor plants that I'd like to donate to your club. Please let me know if you're accepting donations and how I can arrange for a drop-off.",
            date: "2025-09-26T09:15:00Z",
            read: false
          },
          {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
            subject: "Volunteer opportunities",
            message: "Hello, I'm a parent of one of the students in your school. I have experience with gardening and would love to volunteer some time to help with your club activities. What opportunities are available for parent volunteers?",
            date: "2025-09-25T16:45:00Z",
            read: true
          }
        ];
        
        setMessages(mockMessages);
        
        // 检查URL中是否有messageId参数，如果有则选中对应的消息
        const searchParams = new URLSearchParams(window.location.search);
        const messageId = searchParams.get('messageId');
        if (messageId) {
          const message = mockMessages.find(m => m.id === messageId);
          if (message) {
            setSelectedMessage(message);
            // 标记为已读
            setMessages(mockMessages.map(m => 
              m.id === messageId ? { ...m, read: true } : m
            ));
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [status, session, router]);

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // 标记为已读
    if (!message.read) {
      const updatedMessages = messages.map(m => 
        m.id === message.id ? { ...m, read: true } : m
      );
      setMessages(updatedMessages);
      
      // 同步更新通知状态
      if (typeof window !== 'undefined') {
        try {
          const savedNotifications = localStorage.getItem('notifications');
          if (savedNotifications) {
            const notifications = JSON.parse(savedNotifications);
            const updatedNotifications = notifications.map((n: any) => 
              n.id === message.id ? { ...n, read: true } : n
            );
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          }
        } catch (error) {
          console.error("Error updating notifications in localStorage:", error);
        }
      }
    }
  };

  const handleDeleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm("Are you sure you want to delete this message?")) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleMarkAsRead = (id: string, read: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedMessages = messages.map(m => 
      m.id === id ? { ...m, read } : m
    );
    setMessages(updatedMessages);
    
    // 同步更新通知状态
    if (typeof window !== 'undefined') {
      try {
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
          const notifications = JSON.parse(savedNotifications);
          const updatedNotifications = notifications.map((n: any) => 
            n.id === id ? { ...n, read } : n
          );
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        }
      } catch (error) {
        console.error("Error updating notifications in localStorage:", error);
      }
    }
  };

  const filteredMessages = messages.filter(message => 
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-12">
          <Loading text="Loading messages..." />
        </div>
      </LayoutWrapper>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    });
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Message Center</h1>
          <p className="text-muted-foreground mb-6">
            Manage contact messages from website visitors
          </p>

          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search messages..."
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="card p-12 text-center">
              <FiMail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No messages found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? "No messages match your search criteria" : "You have no messages yet"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="card overflow-hidden">
                  <div className="p-4 border-b bg-muted/30">
                    <h2 className="font-medium">Messages ({filteredMessages.length})</h2>
                  </div>
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {filteredMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => handleSelectMessage(message)}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedMessage?.id === message.id ? "bg-muted/50" : ""
                        } ${!message.read ? "font-medium" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="truncate flex-1">{message.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.date).split(",")[0]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                          <div className="flex gap-1">
                            {message.read ? (
                              <button
                                onClick={(e) => handleMarkAsRead(message.id, false, e)}
                                className="p-1 text-muted-foreground hover:text-primary"
                                title="Mark as unread"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleMarkAsRead(message.id, true, e)}
                                className="p-1 text-muted-foreground hover:text-primary"
                                title="Mark as read"
                              >
                                <FiCheck className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteMessage(message.id, e)}
                              className="p-1 text-muted-foreground hover:text-red-500"
                              title="Delete message"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                {selectedMessage ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card h-full"
                  >
                    <div className="p-6 border-b">
                      <h2 className="text-2xl font-semibold mb-1">{selectedMessage.subject}</h2>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-muted-foreground">
                            From: <span className="font-medium">{selectedMessage.name}</span> &lt;{selectedMessage.email}&gt;
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(selectedMessage.date)}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                    <div className="p-6 border-t flex justify-between">
                      <button
                        onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                        className="btn-primary"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id, {stopPropagation: () => {}} as React.MouseEvent)}
                        className="btn-outline text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="card h-full flex items-center justify-center p-12">
                    <div className="text-center">
                      <FiMail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No message selected</h3>
                      <p className="mt-2 text-muted-foreground">
                        Select a message from the list to view its contents
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
