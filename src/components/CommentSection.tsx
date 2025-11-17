import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { ThumbsUp, ThumbsUpIcon } from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  getCommentsByRecipeId,
  createComment,
  deleteComment,
  updateComment,
  createReply,
  checkUserReview,
  updateCommentLikes,
  type Comment,
} from "../redux/slices/commentSlice";
import { toggleLike, getUserLikes } from "../redux/slices/likeSlice";
import { getRecipeById } from "../redux/slices/recipeSlice";
import { useNavigation } from "@react-navigation/native";

interface CommentSectionProps {
  recipeId: string;
}

export default function CommentSection({ recipeId }: CommentSectionProps) {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyToUser, setReplyToUser] = useState<string>("");

  // Redux selectors
  const comments = useAppSelector((state) => state.comments.comments);
  const loading = useAppSelector((state) => state.comments.loading);
  const totalComments = useAppSelector((state) => state.comments.totalComments);
  const userHasReviewed = useAppSelector((state) => state.comments.userHasReviewed);
  const userRating = useAppSelector((state) => state.comments.userRating);
  const user = useAppSelector((state) => state.auth.user);
  const userProfile = useAppSelector((state) => state.user.profile);
  const likedComments = useAppSelector((state) => state.likes.likedComments);

  const userAvatar = userProfile?.avatar || user?.avatar;

  // Check if current user has already commented (fallback)
  const userComment = comments.find(
    (c) => user && c.userId === user._id && c.ratingRecipe !== null && c.ratingRecipe !== undefined
  );
  const hasReviewedFallback = userHasReviewed || !!userComment;
  const ratingFallback = userRating || userComment?.ratingRecipe || null;

  // Debug log (uncomment if needed)
  // useEffect(() => {
  //   console.log('🔍 CommentSection Debug:');
  //   console.log('  - recipeId:', recipeId);
  //   console.log('  - user:', user?._id);
  //   console.log('  - userHasReviewed (from Redux):', userHasReviewed);
  //   console.log('  - userComment found:', !!userComment);
  //   console.log('  - hasReviewedFallback:', hasReviewedFallback);
  //   console.log('  - userRating:', userRating);
  //   console.log('  - ratingFallback:', ratingFallback);
  //   console.log('  - totalComments:', totalComments);
  // }, [recipeId, user, userHasReviewed, userRating, totalComments, userComment]);

  useEffect(() => {
    if (recipeId) {
      dispatch(getCommentsByRecipeId(recipeId));
    }
  }, [dispatch, recipeId]);

  useEffect(() => {
    if (recipeId && user) {
      // Gọi API nhưng không quan trọng vì có fallback
      dispatch(checkUserReview(recipeId)).catch(() => {
        // Silent catch - fallback logic sẽ xử lý
      });
    }
  }, [dispatch, recipeId, user]);

  useEffect(() => {
    if (recipeId && user) {
      dispatch(getUserLikes(recipeId));
    }
  }, [dispatch, recipeId, user]);

  // Handle submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    if (!rating || rating < 1 || rating > 5) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn đánh giá từ 1-5 sao",
      });
      return;
    }

    try {
      await dispatch(createComment({ recipeId, content: newComment, rating })).unwrap();
      setNewComment("");
      setRating(0);
      dispatch(getRecipeById(recipeId));
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã thêm bình luận",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể thêm bình luận",
      });
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      await dispatch(updateComment({ commentId, content: editingContent })).unwrap();
      setEditingCommentId(null);
      setEditingContent("");
      Toast.show({
        type: "success",
        text1: "Đã cập nhật bình luận",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật bình luận",
      });
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    Toast.show({
      type: "info",
      text1: "⚠️ Xác nhận xóa",
      text2: "Nhấn và giữ để xác nhận xóa bình luận",
      visibilityTime: 3000,
      onPress: async () => {
        try {
          await dispatch(deleteComment(commentId)).unwrap();
          Toast.show({
            type: "success",
            text1: "✅ Đã xóa bình luận",
            text2: "Bình luận đã được xóa thành công",
          });
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "❌ Lỗi",
            text2: "Không thể xóa bình luận",
          });
        }
      },
    });
  };

  // Handle like/unlike comment
  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Cần đăng nhập",
        text2: "Vui lòng đăng nhập để thích bình luận",
      });
      return;
    }

    let currentComment = comments.find((c) => c._id === commentId);
    if (!currentComment) {
      for (const comment of comments) {
        if (comment.replies) {
          const reply = comment.replies.find((r) => r._id === commentId);
          if (reply) {
            currentComment = reply;
            break;
          }
        }
      }
    }

    const currentLikes = currentComment?.likes || 0;
    const isCurrentlyLiked = likedComments.includes(commentId);
    const newLikes = isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1;

    // Optimistic update
    dispatch(updateCommentLikes({ commentId, likes: newLikes }));

    try {
      const result = await dispatch(toggleLike(commentId)).unwrap();
      dispatch(updateCommentLikes({ commentId, likes: result.likes }));
    } catch (error: any) {
      // Rollback
      dispatch(updateCommentLikes({ commentId, likes: currentLikes }));
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message || "Không thể thích/bỏ thích",
      });
    }
  };

  // Start editing
  const startEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // Start reply
  const startReply = (commentId: string, userName?: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
    setReplyToUser(userName || "");
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
    setReplyToUser("");
  };

  // Submit reply
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      await dispatch(
        createReply({
          parentCommentId,
          content: replyContent,
          recipeId,
        })
      ).unwrap();
      cancelReply();
      Toast.show({
        type: "success",
        text1: "Đã trả lời",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể gửi trả lời",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString("vi-VN");
    } else if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return "Vừa xong";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden mt-6">
        {/* Header */}
        <View className="p-4" style={{ backgroundColor: "#F97316" }}>
          <View className="flex-row items-center gap-2">
            <View className="bg-white p-2 rounded-lg">
              <Ionicons name="chatbubbles" size={20} color="#F97316" />
            </View>
            <Text className="text-white text-lg font-bold">
              Bình luận ({totalComments})
            </Text>
          </View>
        </View>

        {/* Comment Input - CHỈ HIỆN KHI USER CHƯA REVIEW */}
        {user && !hasReviewedFallback && (
          <View className="p-4 border-b border-gray-200">
            <View>
              <View className="flex-row items-center gap-3 mb-3">
                {userAvatar ? (
                  <Image
                    source={{ uri: userAvatar }}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                    <Ionicons name="person" size={20} color="#F97316" />
                  </View>
                )}

                {/* Rating Stars */}
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Đánh giá của bạn <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="flex-row gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Ionicons
                          name={star <= rating ? "star" : "star-outline"}
                          size={28}
                          color={star <= rating ? "#FBBF24" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                    {rating > 0 && (
                      <Text className="ml-2 text-sm text-gray-600 self-center">
                        {rating} sao
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Chia sẻ suy nghĩ của bạn về công thức này..."
                placeholderTextColor="#9CA3AF"
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900 mb-2"
                multiline
                maxLength={500}
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || !rating || loading}
                className={`bg-orange-500 rounded-lg py-2 items-center flex-row justify-center gap-2 ${
                  !newComment.trim() || !rating || loading ? "opacity-50" : ""
                }`}
              >
                <Ionicons name="send" size={16} color="#FFF" />
                <Text className="text-white font-semibold">Đăng bình luận</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Nút đăng nhập - CHỈ HIỆN KHI CHƯA ĐĂNG NHẬP */}
        {!user && (
          <View className="p-4 border-b border-gray-200">
            <View className="p-4 bg-orange-50 border border-orange-200 rounded-lg items-center">
              <Text className="text-orange-700">
                Vui lòng{" "}
                <Text
                  className="font-semibold underline"
                  onPress={() => navigation.navigate("Login" as never)}
                >
                  đăng nhập
                </Text>{" "}
                để bình luận
              </Text>
            </View>
          </View>
        )}

        {/* Thông báo đã review - CHỈ HIỆN KHI ĐÃ REVIEW */}
        {user && hasReviewedFallback && (
          <View className="px-4 pt-4 pb-2">
            <View className="p-5 bg-green-50 border-2 border-green-200 rounded-xl">
              <View className="flex-row items-start gap-3">
                <View className="mt-0.5">
                  <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-green-800 mb-2">
                    Bạn đã đánh giá công thức này
                  </Text>
                  <Text className="text-sm text-green-700 leading-relaxed mb-3">
                    Cảm ơn phản hồi của bạn! Đánh giá của bạn giúp người khác khám phá những công thức tuyệt vời.
                  </Text>
                  {ratingFallback && (
                    <View className="bg-white rounded-lg px-4 py-3 border border-green-200">
                      <Text className="text-xs text-gray-600 mb-1.5 font-medium">
                        Đánh giá của bạn:
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= ratingFallback! ? "star" : "star-outline"}
                              size={20}
                              color={star <= ratingFallback! ? "#FBBF24" : "#D1D5DB"}
                            />
                          ))}
                        </View>
                        <Text className="text-base font-bold text-gray-800 ml-1">
                          ({ratingFallback}/5)
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Comments List */}
        <View className="p-4">
          {loading && comments.length === 0 ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          ) : comments.length === 0 ? (
            <View className="py-8 items-center">
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">Chưa có bình luận nào</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Hãy là người đầu tiên bình luận!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View
                key={comment._id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4"
              >
                {/* Comment Header */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center gap-3 flex-1">
                    {comment.userAvatar ? (
                      <Image
                        source={{ uri: comment.userAvatar }}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                        <Ionicons name="person" size={20} color="#F97316" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {comment.firstName} {comment.lastName}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </Text>
                      {/* Rating */}
                      {comment.ratingRecipe && (
                        <View className="flex-row items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= comment.ratingRecipe! ? "star" : "star-outline"}
                              size={14}
                              color={star <= comment.ratingRecipe! ? "#FBBF24" : "#D1D5DB"}
                            />
                          ))}
                          <Text className="text-xs text-gray-600 ml-1">
                            ({comment.ratingRecipe}/5)
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Edit/Delete */}
                  {user?._id === comment.userId && (
                    <View className="flex-row gap-2">
                      {editingCommentId !== comment._id && (
                        <>
                          <TouchableOpacity
                            onPress={() => startEdit(comment._id, comment.content)}
                          >
                            <Ionicons name="create-outline" size={18} color="#F97316" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(comment._id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>

                {/* Edit Mode */}
                {editingCommentId === comment._id ? (
                  <View>
                    <TextInput
                      value={editingContent}
                      onChangeText={setEditingContent}
                      className="bg-white rounded-lg p-3 border border-gray-300 text-gray-900 mb-2"
                      multiline
                      maxLength={500}
                      autoFocus
                    />
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleEditComment(comment._id)}
                        className="flex-1 bg-orange-500 rounded-lg py-2 items-center"
                      >
                        <Text className="text-white font-semibold">Lưu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={cancelEdit}
                        className="flex-1 bg-gray-300 rounded-lg py-2 items-center"
                      >
                        <Text className="text-gray-700 font-semibold">Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text className="text-gray-700 leading-relaxed">
                    {comment.content}
                  </Text>
                )}

                {/* Actions: Like, Reply */}
                <View className="flex-row items-center gap-6 mt-3">
                  {/* Like */}
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => handleToggleLike(comment._id)}
                      disabled={!user}
                      className={`${!user ? "opacity-50" : ""}`}
                    >
                      {likedComments.includes(comment._id) ? (
                        <ThumbsUp color="#3B82F6" size={18} />
                      ) : (
                        <ThumbsUpIcon color="#6B7280" size={18} />
                      )}
                    </TouchableOpacity>
                    {comment.likes > 0 && (
                      <Text
                        className={`text-sm font-medium ${
                          likedComments.includes(comment._id) ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {comment.likes}
                      </Text>
                    )}
                  </View>

                  {/* Reply */}
                  <TouchableOpacity
                    onPress={() => startReply(comment._id)}
                    disabled={!user}
                    className={`flex-row items-center gap-1 ${!user ? "opacity-50" : ""}`}
                  >
                    <Ionicons name="arrow-undo-outline" size={18} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-600">Trả lời</Text>
                  </TouchableOpacity>
                </View>

                {/* Reply Form */}
                {replyingTo === comment._id && !replyToUser && (
                  <View className="mt-4 pl-4 border-l-2 border-orange-200">
                    <Text className="text-xs text-gray-500 mb-1">
                      Trả lời{" "}
                      <Text className="font-semibold text-orange-600">
                        @{comment.firstName} {comment.lastName}
                      </Text>
                    </Text>
                    <TextInput
                      value={replyContent}
                      onChangeText={setReplyContent}
                      placeholder={`Trả lời ${comment.firstName}...`}
                      placeholderTextColor="#9CA3AF"
                      className="bg-white rounded-lg p-3 border border-gray-300 text-gray-900 mb-2"
                      multiline
                      maxLength={500}
                      autoFocus
                    />
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={cancelReply}
                        className="flex-1 bg-gray-300 rounded-lg py-2 items-center"
                      >
                        <Text className="text-gray-700 font-semibold">Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleSubmitReply(comment._id)}
                        disabled={!replyContent.trim()}
                        className={`flex-1 bg-orange-500 rounded-lg py-2 items-center ${
                          !replyContent.trim() ? "opacity-50" : ""
                        }`}
                      >
                        <Text className="text-white font-semibold">Trả lời</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Replies List */}
                {comment.replies && comment.replies.length > 0 && (
                  <View className="mt-4 pl-4 border-l-2 border-gray-200">
                    {comment.replies.map((reply) => (
                      <View key={reply._id} className="mb-3">
                        <View className="flex-row gap-3">
                          {reply.userAvatar ? (
                            <Image
                              source={{ uri: reply.userAvatar }}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
                              <Ionicons name="person" size={16} color="#F97316" />
                            </View>
                          )}

                          <View className="flex-1">
                            <View className="bg-white rounded-lg p-3">
                              <View className="flex-row justify-between items-start mb-1">
                                <View>
                                  <Text className="font-semibold text-gray-900 text-sm">
                                    {reply.firstName} {reply.lastName}
                                  </Text>
                                  <Text className="text-xs text-gray-500">
                                    {formatDate(reply.createdAt)}
                                  </Text>
                                </View>

                                {user?._id === reply.userId && (
                                  <View className="flex-row gap-2">
                                    <TouchableOpacity
                                      onPress={() => startEdit(reply._id, reply.content)}
                                    >
                                      <Ionicons
                                        name="create-outline"
                                        size={16}
                                        color="#F97316"
                                      />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => handleDeleteComment(reply._id)}
                                    >
                                      <Ionicons
                                        name="trash-outline"
                                        size={16}
                                        color="#EF4444"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>

                              {editingCommentId === reply._id ? (
                                <View>
                                  <TextInput
                                    value={editingContent}
                                    onChangeText={setEditingContent}
                                    className="bg-gray-50 rounded-lg p-2 border border-gray-300 text-gray-900 text-sm mb-2"
                                    multiline
                                    maxLength={500}
                                  />
                                  <View className="flex-row gap-2">
                                    <TouchableOpacity
                                      onPress={() => handleEditComment(reply._id)}
                                      className="flex-1 bg-orange-500 rounded-lg py-1 items-center"
                                    >
                                      <Text className="text-white font-semibold text-xs">
                                        Lưu
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={cancelEdit}
                                      className="flex-1 bg-gray-300 rounded-lg py-1 items-center"
                                    >
                                      <Text className="text-gray-700 font-semibold text-xs">
                                        Hủy
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ) : (
                                <Text className="text-gray-700 text-sm leading-relaxed">
                                  {reply.content}
                                </Text>
                              )}
                            </View>

                            {/* Reply Actions */}
                            <View className="flex-row items-center gap-4 mt-2">
                              <View className="flex-row items-center gap-1.5">
                                <TouchableOpacity
                                  onPress={() => handleToggleLike(reply._id)}
                                  disabled={!user}
                                  className={`${!user ? "opacity-50" : ""}`}
                                >
                                  {likedComments.includes(reply._id) ? (
                                    <ThumbsUp color="#3B82F6" size={14} />
                                  ) : (
                                    <ThumbsUpIcon color="#6B7280" size={14} />
                                  )}
                                </TouchableOpacity>
                                {reply.likes > 0 && (
                                  <Text
                                    className={`text-xs font-medium ${
                                      likedComments.includes(reply._id)
                                        ? "text-blue-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {reply.likes}
                                  </Text>
                                )}
                              </View>

                              <TouchableOpacity
                                onPress={() =>
                                  startReply(comment._id, `${reply.firstName} ${reply.lastName}`)
                                }
                                disabled={!user}
                                className={`flex-row items-center gap-1 ${
                                  !user ? "opacity-50" : ""
                                }`}
                              >
                                <Ionicons name="arrow-undo-outline" size={14} color="#6B7280" />
                                <Text className="text-xs font-medium text-gray-600">
                                  Trả lời
                                </Text>
                              </TouchableOpacity>
                            </View>

                            {/* Reply to Reply Form */}
                            {replyingTo === comment._id &&
                              replyToUser === `${reply.firstName} ${reply.lastName}` && (
                                <View className="mt-3">
                                  <Text className="text-xs text-gray-500 mb-1">
                                    Trả lời{" "}
                                    <Text className="font-semibold text-orange-600">
                                      @{reply.firstName} {reply.lastName}
                                    </Text>
                                  </Text>
                                  <TextInput
                                    value={replyContent}
                                    onChangeText={setReplyContent}
                                    placeholder={`Trả lời ${reply.firstName}...`}
                                    placeholderTextColor="#9CA3AF"
                                    className="bg-gray-50 rounded-lg p-2 border border-gray-300 text-gray-900 text-sm mb-2"
                                    multiline
                                    maxLength={500}
                                    autoFocus
                                  />
                                  <View className="flex-row gap-2">
                                    <TouchableOpacity
                                      onPress={cancelReply}
                                      className="flex-1 bg-gray-300 rounded-lg py-1 items-center"
                                    >
                                      <Text className="text-gray-700 font-semibold text-xs">
                                        Hủy
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() => handleSubmitReply(comment._id)}
                                      disabled={!replyContent.trim()}
                                      className={`flex-1 bg-orange-500 rounded-lg py-1 items-center ${
                                        !replyContent.trim() ? "opacity-50" : ""
                                      }`}
                                    >
                                      <Text className="text-white font-semibold text-xs">
                                        Trả lời
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
