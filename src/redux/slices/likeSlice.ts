import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// =====================
// TYPES
// =====================

export interface Like {
  _id: string;
  commentId: string;
  userId: string;
  createdAt: string;
}

interface LikeState {
  likedComments: string[]; // Array của commentId mà user đã like
  loading: boolean;
  error: string | null;
}

// =====================
// INITIAL STATE
// =====================

const initialState: LikeState = {
  likedComments: [],
  loading: false,
  error: null,
};

// =====================
// API CALLS
// =====================

// Lấy tất cả likes của user cho các comments
export const getUserLikes = createAsyncThunk<
  string[],
  string,
  { rejectValue: string; state: { auth: { user: { _id: string } | null } } }
>("likes/getUserLikes", async (_recipeId, { getState }) => {
  try {
    const userId = getState().auth.user?._id;
    if (!userId) {
      return [];
    }
    const res = await axiosInstance.get(`/likes/user/${userId}`);
    // Trả về array của commentIds mà user đã like
    return res.data.likes?.map((like: Like) => like.commentId) || [];
  } catch (err: any) {
    // Nếu lỗi, trả về array rỗng thay vì reject để không block UI
    console.warn("Failed to load user likes:", err.response?.data?.message || err.message);
    return [];
  }
});

// Toggle like (like hoặc unlike)
export const toggleLike = createAsyncThunk<
  { commentId: string; liked: boolean; likes: number },
  string,
  { rejectValue: string }
>("likes/toggleLike", async (commentId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/likes/toggle`, { commentId });
    console.log("🔵 Backend response:", res.data);
    return {
      commentId,
      liked: res.data.liked,
      likes: res.data.likes || 0,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to toggle like");
  }
});

// Legacy: Like một comment (kept for backward compatibility)
export const likeComment = createAsyncThunk<
  { commentId: string; likes: number },
  string,
  { rejectValue: string }
>("likes/likeComment", async (commentId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/likes/toggle`, { commentId });
    return {
      commentId,
      likes: res.data.likes || 0,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to like comment");
  }
});

// Legacy: Unlike một comment (kept for backward compatibility)
export const unlikeComment = createAsyncThunk<
  { commentId: string; likes: number },
  string,
  { rejectValue: string }
>("likes/unlikeComment", async (commentId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/likes/toggle`, { commentId });
    return {
      commentId,
      likes: res.data.likes || 0,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to unlike comment");
  }
});

// =====================
// SLICE
// =====================

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    clearLikes: (state) => {
      state.likedComments = [];
      state.error = null;
    },
    clearLikeError: (state) => {
      state.error = null;
    },
    // Toggle like locally (optimistic update)
    toggleLikeLocally: (state, action: PayloadAction<string>) => {
      const commentId = action.payload;
      const index = state.likedComments.indexOf(commentId);
      if (index > -1) {
        state.likedComments.splice(index, 1);
      } else {
        state.likedComments.push(commentId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // GET USER LIKES
      .addCase(getUserLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.likedComments = action.payload;
      })
      .addCase(getUserLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load user likes";
      })

      // LIKE COMMENT (Legacy)
      .addCase(likeComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.likedComments.includes(action.payload.commentId)) {
          state.likedComments.push(action.payload.commentId);
        }
      })
      .addCase(likeComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to like comment";
      })

      // UNLIKE COMMENT (Legacy)
      .addCase(unlikeComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(unlikeComment.fulfilled, (state, action) => {
        state.loading = false;
        state.likedComments = state.likedComments.filter(
          (id) => id !== action.payload.commentId
        );
      })
      .addCase(unlikeComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to unlike comment";
      })

      // TOGGLE LIKE
      .addCase(toggleLike.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        const { commentId, liked } = action.payload;
        if (liked) {
          if (!state.likedComments.includes(commentId)) {
            state.likedComments.push(commentId);
          }
        } else {
          state.likedComments = state.likedComments.filter((id) => id !== commentId);
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle like";
      });
  },
});

export const { clearLikes, clearLikeError, toggleLikeLocally } = likeSlice.actions;
export default likeSlice.reducer;
