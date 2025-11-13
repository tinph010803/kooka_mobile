import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import {
  Notification,
  NotificationState,
  NotificationCategory,
  NotificationListResponse,
} from '../../types/notification.types';

const initialState: NotificationState = {
  notifications: [],
  recipeNotifications: [],
  communityNotifications: [],
  unreadCount: 0,
  recipeUnreadCount: 0,
  communityUnreadCount: 0,
  pagination: null,
  loading: false,
  error: null,
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ 
    category, 
    page = 1, 
    limit = 20, 
    isRead 
  }: { 
    category?: NotificationCategory; 
    page?: number; 
    limit?: number; 
    isRead?: boolean 
  }) => {
    const params: any = { page, limit };
    if (category) params.category = category;
    if (isRead !== undefined) params.isRead = isRead;

    const response = await axiosInstance.get('/notifications', { params });
    
    // Handle both response formats
    const responseData = response.data.data || response.data;
    
    return { 
      data: {
        notifications: Array.isArray(responseData) ? responseData : responseData.notifications || [],
        pagination: responseData.pagination || { page, limit, total: 0, totalPages: 0 },
        unreadCount: responseData.unreadCount || 0
      }, 
      category 
    };
  }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (category?: NotificationCategory) => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/notifications/unread-count', { params });
    
    const responseData = response.data.data || response.data;
    const unreadCount = responseData.unreadCount || 0;
    
    return { unreadCount, category };
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    await axiosInstance.put(`/notifications/${notificationId}/read`);
    return notificationId;
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (category?: NotificationCategory) => {
    const params = category ? { category } : {};
    await axiosInstance.put('/notifications/mark-all-read', {}, { params });
    return category;
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    await axiosInstance.delete(`/notifications/${notificationId}`);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { data, category } = action.payload;
        
        // Update appropriate array based on category
        if (category === 'RECIPE') {
          state.recipeNotifications = data.notifications;
          state.recipeUnreadCount = data.notifications.filter((n: Notification) => !n.isRead).length;
        } else if (category === 'COMMUNITY') {
          state.communityNotifications = data.notifications;
          state.communityUnreadCount = data.notifications.filter((n: Notification) => !n.isRead).length;
        } else {
          state.notifications = data.notifications;
        }
        
        state.pagination = data.pagination;
        state.unreadCount = state.recipeUnreadCount + state.communityUnreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        const { unreadCount, category } = action.payload;
        if (category === 'RECIPE') {
          state.recipeUnreadCount = unreadCount;
        } else if (category === 'COMMUNITY') {
          state.communityUnreadCount = unreadCount;
        } else {
          state.unreadCount = unreadCount;
        }
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        
        // Update in all arrays
        [state.notifications, state.recipeNotifications, state.communityNotifications].forEach((arr) => {
          const notification = arr.find((n) => n._id === notificationId);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            
            // Update unread counts
            if (notification.category === 'RECIPE') {
              state.recipeUnreadCount = Math.max(0, state.recipeUnreadCount - 1);
            } else if (notification.category === 'COMMUNITY') {
              state.communityUnreadCount = Math.max(0, state.communityUnreadCount - 1);
            }
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        const category = action.payload;
        
        if (category === 'RECIPE') {
          state.recipeNotifications = state.recipeNotifications.map((n) => ({ ...n, isRead: true }));
          state.recipeUnreadCount = 0;
        } else if (category === 'COMMUNITY') {
          state.communityNotifications = state.communityNotifications.map((n) => ({ ...n, isRead: true }));
          state.communityUnreadCount = 0;
        } else {
          state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
          state.recipeNotifications = state.recipeNotifications.map((n) => ({ ...n, isRead: true }));
          state.communityNotifications = state.communityNotifications.map((n) => ({ ...n, isRead: true }));
          state.recipeUnreadCount = 0;
          state.communityUnreadCount = 0;
        }
        
        state.unreadCount = state.recipeUnreadCount + state.communityUnreadCount;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        
        // Remove from all arrays and update counts
        [
          { arr: state.notifications, key: 'notifications' as const },
          { arr: state.recipeNotifications, key: 'recipeNotifications' as const },
          { arr: state.communityNotifications, key: 'communityNotifications' as const }
        ].forEach(({ arr, key }) => {
          const notification = arr.find((n) => n._id === notificationId);
          if (notification) {
            if (!notification.isRead) {
              if (notification.category === 'RECIPE') {
                state.recipeUnreadCount = Math.max(0, state.recipeUnreadCount - 1);
              } else if (notification.category === 'COMMUNITY') {
                state.communityUnreadCount = Math.max(0, state.communityUnreadCount - 1);
              }
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state[key] = arr.filter((n) => n._id !== notificationId);
          }
        });
      });
  },
});

export default notificationSlice.reducer;
