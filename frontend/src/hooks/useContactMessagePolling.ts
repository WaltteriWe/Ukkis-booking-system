import { useState, useEffect, useCallback } from 'react';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  repliedAt?: string;
}

export function useContactMessagePolling(
  adminToken: string | null,
  intervalMs: number = 30000
) {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const msgs = await response.json();
      setContactMessages(Array.isArray(msgs) ? msgs : []);
    } catch (error) {
      console.error('Failed to load contact messages:', error);
      setContactMessages([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      loadMessages();
    }
  }, [adminToken, loadMessages]);

  useEffect(() => {
    if (!adminToken) return;

    const interval = setInterval(() => {
      loadMessages();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [adminToken, intervalMs, loadMessages]);

  const unreadCount = contactMessages.filter(m => !m.repliedAt).length;

  return {
    contactMessages,
    loading,
    unreadCount,
    refreshMessages: loadMessages,
    setContactMessages,
  };
}