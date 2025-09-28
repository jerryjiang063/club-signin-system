"use client";

import { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface NotificationIconProps {
  count?: number;
}

interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

export function NotificationIcon({ count = 0 }: NotificationIconProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(count);
  
  useEffect(() => {
    // 从localStorage获取通知状态
    const loadNotifications = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedNotifications = localStorage.getItem('notifications');
          if (savedNotifications) {
            const parsedNotifications = JSON.parse(savedNotifications);
            setNotifications(parsedNotifications);
            setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
            return;
          }
        } catch (error) {
          console.error("Error loading notifications from localStorage:", error);
        }
      }
      
      // 如果没有保存的通知或出错，使用默认通知
      const defaultNotifications = [
        {
          id: "1",
          message: "New contact message from John Doe",
          date: "Just now",
          read: false
        },
        {
          id: "2",
          message: "New contact message from Jane Smith",
          date: "2 hours ago",
          read: false
        }
      ];
      
      setNotifications(defaultNotifications);
      setUnreadCount(defaultNotifications.filter(n => !n.read).length);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
      }
    };
    
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    // 关闭通知面板
    setIsOpen(false);
    
    // 标记该通知为已读
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    );
    
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    
    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
    
    // 跳转到消息中心并聚焦到特定消息
    router.push(`/admin/messages?messageId=${notificationId}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 transition-colors hover:bg-secondary"
        aria-label="Notifications"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 rounded-md border bg-card shadow-lg z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Notifications</h3>
                {notifications.some(n => !n.read) && (
                  <button 
                    className="text-xs text-primary hover:underline"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${!notification.read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <FiBell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 border-t pt-2 text-center">
                <a 
                  href="/admin/messages" 
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    router.push('/admin/messages');
                  }}
                >
                  View all messages
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
