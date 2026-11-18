import { create } from 'zustand';
import { notificationService } from '../api/notificationService';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  
  // Fetch unread count initially
  fetchUnreadCount: async () => {
    try {
      // Just fetch 1 item to get the unreadCount meta from the response
      const response = await notificationService.getNotifications({ limit: 1 });
      if (response.success && response.unreadCount !== undefined) {
        set({ unreadCount: response.unreadCount });
      }
    } catch (error) {
      console.error('Failed to fetch unread notification count', error);
    }
  },

  // Set count explicitly
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Decrement by 1 (when a single notification is read)
  decrementUnreadCount: () => set((state) => ({ 
    unreadCount: Math.max(0, state.unreadCount - 1) 
  })),

  // Reset to 0 (when all are read)
  resetUnreadCount: () => set({ unreadCount: 0 }),
}));
