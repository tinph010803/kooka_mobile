import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "./authSlice";

// =====================
// TYPES
// =====================

interface Favorite {
  _id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
}

interface MostFavoritedRecipe {
  _id: string;
  name: string;
  image: string;
  favoriteCount: number;
  rank?: number;
}

interface FavoriteState {
  favorites: Favorite[];
  favoriteRecipeIds: string[]; // Changed from Set to Array for Redux serialization
  mostFavorited: MostFavoritedRecipe[]; // Most favorited recipes cho trang chủ
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// =====================
// INITIAL STATE
// =====================

const initialState: FavoriteState = {
  favorites: [],
  favoriteRecipeIds: [], // Changed from Set to Array
  mostFavorited: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// =====================
// API CALLS
// =====================

// Toggle favorite (add/remove)
export const toggleFavorite = createAsyncThunk<
  { favorited: boolean; message: string; favorites: number; recipeId: string },
  { recipeId: string },
  { rejectValue: string }
>("favorite/toggle", async ({ recipeId }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/favorites/toggle", { recipeId });
    return { ...res.data, recipeId };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to toggle favorite");
  }
});

// Get user's favorites
export const getUserFavorites = createAsyncThunk<
  { favorites: Favorite[]; pagination: any },
  { userId: string; page?: number; limit?: number },
  { rejectValue: string }
>("favorite/getUserFavorites", async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/favorites/user/${userId}?page=${page}&limit=${limit}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to get user favorites");
  }
});

// Check if user favorited a recipe
export const checkUserFavorited = createAsyncThunk<
  { favorited: boolean; recipeId: string; userId: string },
  { recipeId: string; userId: string },
  { rejectValue: string }
>("favorite/checkUserFavorited", async ({ recipeId, userId }, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/favorites/check/${recipeId}/${userId}`);
    return { ...res.data, recipeId, userId };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to check favorite status");
  }
});

// Check multiple recipes at once
export const checkMultipleRecipes = createAsyncThunk<
  Array<{ recipeId: string; favorited: boolean }>,
  { recipeIds: string[] },
  { rejectValue: string }
>("favorite/checkMultipleRecipes", async ({ recipeIds }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/favorites/check-multiple", { recipeIds });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to check multiple favorites");
  }
});

// Get favorite count for a recipe
export const getFavoriteCount = createAsyncThunk<
  { recipeId: string; count: number },
  { recipeId: string },
  { rejectValue: string }
>("favorite/getFavoriteCount", async ({ recipeId }, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/favorites/count/${recipeId}`);
    return { recipeId, count: res.data.count };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to get favorite count");
  }
});

// Get most favorited recipes cho trang chủ
export const fetchMostFavorited = createAsyncThunk<
  MostFavoritedRecipe[],
  void,
  { rejectValue: string }
>("favorite/fetchMostFavorited", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get("/favorites/most-favorited");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch most favorited");
  }
});

// =====================
// SLICE
// =====================

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
      state.favoriteRecipeIds = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // TOGGLE FAVORITE
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        const { recipeId, favorited } = action.payload;

        if (favorited) {
          // Add to favorites
          if (!state.favoriteRecipeIds.includes(recipeId)) {
            state.favoriteRecipeIds.push(recipeId);
          }
        } else {
          // Remove from favorites
          state.favoriteRecipeIds = state.favoriteRecipeIds.filter((id) => id !== recipeId);
          state.favorites = state.favorites.filter((fav) => fav.recipeId !== recipeId);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to toggle favorite";
      })

      // GET USER FAVORITES
      .addCase(getUserFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload.favorites;
        state.favoriteRecipeIds = action.payload.favorites.map((fav) => fav.recipeId);
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getUserFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get user favorites";
      })

      // CHECK USER FAVORITED
      .addCase(checkUserFavorited.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkUserFavorited.fulfilled, (state, action) => {
        state.loading = false;
        const { recipeId, favorited } = action.payload;
        if (favorited && !state.favoriteRecipeIds.includes(recipeId)) {
          state.favoriteRecipeIds.push(recipeId);
        } else if (!favorited) {
          state.favoriteRecipeIds = state.favoriteRecipeIds.filter((id) => id !== recipeId);
        }
      })
      .addCase(checkUserFavorited.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to check favorite status";
      })

      // CHECK MULTIPLE RECIPES
      .addCase(checkMultipleRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkMultipleRecipes.fulfilled, (state, action) => {
        state.loading = false;
        // Update favoriteRecipeIds based on response
        const favoritedRecipeIds = action.payload
          .filter((item) => item.favorited)
          .map((item) => item.recipeId);

        // Merge with existing favoriteRecipeIds
        favoritedRecipeIds.forEach((recipeId) => {
          if (!state.favoriteRecipeIds.includes(recipeId)) {
            state.favoriteRecipeIds.push(recipeId);
          }
        });
      })
      .addCase(checkMultipleRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to check multiple favorites";
      })

      // GET FAVORITE COUNT
      .addCase(getFavoriteCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFavoriteCount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getFavoriteCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get favorite count";
      })

      // FETCH MOST FAVORITED
      .addCase(fetchMostFavorited.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMostFavorited.fulfilled, (state, action) => {
        state.loading = false;
        state.mostFavorited = action.payload;
      })
      .addCase(fetchMostFavorited.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch most favorited";
      });
  },
});

export const { clearFavorites, clearError } = favoriteSlice.actions;
export default favoriteSlice.reducer;
