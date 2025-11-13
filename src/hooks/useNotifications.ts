import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../redux/slices/notificationSlice';
import { NotificationCategory } from '../types/notification.types';

interface UseNotificationsParams {
  category?: NotificationCategory;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export const useNotifications = ({
  category,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: UseNotificationsParams = {}) => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Select appropriate notifications based on category
  const notifications = useAppSelector((state) => {
    if (category === 'RECIPE') return state.notifications.recipeNotifications;
    if (category === 'COMMUNITY') return state.notifications.communityNotifications;
    return state.notifications.notifications;
  });

  const unreadCount = useAppSelector((state) => {
    if (category === 'RECIPE') return state.notifications.recipeUnreadCount;
    if (category === 'COMMUNITY') return state.notifications.communityUnreadCount;
    return state.notifications.unreadCount;
  });

  const pagination = useAppSelector((state) => state.notifications.pagination);
  const loading = useAppSelector((state) => state.notifications.loading);
  const error = useAppSelector((state) => state.notifications.error);

  // Calculate hasMore
  const hasMore = pagination 
    ? pagination.page < pagination.totalPages 
    : false;

  // Fetch notifications
  const refresh = useCallback(
    (page = 1) => {
      dispatch(fetchNotifications({ category, page, limit: 20 }));
    },
    [dispatch, category]
  );

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore && pagination) {
      dispatch(fetchNotifications({ 
        category, 
        page: pagination.page + 1, 
        limit: 20 
      }));
    }
  }, [dispatch, category, loading, hasMore, pagination]);

  // Mark single notification as read
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await dispatch(markAsRead(notificationId)).unwrap();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [dispatch]
  );

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await dispatch(markAllAsRead(category)).unwrap();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [dispatch, category]);

  // Delete notification
  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await dispatch(deleteNotification(notificationId)).unwrap();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    [dispatch]
  );

  // Fetch unread count only
  const refreshUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount(category));
  }, [dispatch, category]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto refresh unread count
  useEffect(() => {
    if (autoRefresh) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        refreshUnreadCount();
      }, refreshInterval);

      // Cleanup on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    pagination,
    refresh,
    loadMore,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    refreshUnreadCount,
  };
};
