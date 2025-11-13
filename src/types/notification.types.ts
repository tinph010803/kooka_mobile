// Notification Types
export type NotificationCategory = 'RECIPE' | 'COMMUNITY';

export type NotificationType = 
  | 'RECIPE_UPDATE'
  | 'RECIPE_NEW_VIDEO'
  | 'RECIPE_INGREDIENTS'
  | 'REVIEW_LIKED'
  | 'REVIEW_REPLIED'
  | 'COMMENT_LIKED'
  | 'COMMENT_REPLIED';

export interface RelatedRecipe {
  recipeId: string;
  recipeName: string;
  recipeImage: string;
}

export interface RelatedUser {
  userId: string;
  userName: string;
  userAvatar: string;
}

export interface RelatedComment {
  commentId: string;
  content: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  relatedRecipe?: RelatedRecipe;
  relatedUser?: RelatedUser;
  relatedComment?: RelatedComment;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface NotificationState {
  notifications: Notification[];
  recipeNotifications: Notification[];
  communityNotifications: Notification[];
  unreadCount: number;
  recipeUnreadCount: number;
  communityUnreadCount: number;
  pagination: NotificationPagination | null;
  loading: boolean;
  error: string | null;
}
