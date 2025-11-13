import axiosInstance from './axiosInstance';
import { NotificationCategory } from '../types/notification.types';

export const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async (params: {
    category?: NotificationCategory;
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  // Lấy số thông báo chưa đọc
  getUnreadCount: async (category?: NotificationCategory) => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/notifications/unread-count', {
      params,
    });
    return response.data;
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId: string) => {
    const response = await axiosInstance.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (category?: NotificationCategory) => {
    const params = category ? { category } : {};
    const response = await axiosInstance.put(
      '/notifications/mark-all-read',
      {},
      { params }
    );
    return response.data;
  },

  // Xóa thông báo
  deleteNotification: async (notificationId: string) => {
    const response = await axiosInstance.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  },
};
