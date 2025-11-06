import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  birthDate?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

// ==================== ASYNC THUNKS ==================== //

// Lấy profile theo userId
export const fetchProfile = createAsyncThunk<Profile, string, { rejectValue: string }>(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/user/profile/${userId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// Cập nhật profile
export const updateProfile = createAsyncThunk<
  Profile,
  { userId: string; data: Partial<Profile> },
  { rejectValue: string }
>("user/updateProfile", async ({ userId, data }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/user/profile/${userId}`, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to update profile");
  }
});

// Lấy profile của user hiện tại (từ token)
export const fetchCurrentProfile = createAsyncThunk<Profile, void, { rejectValue: string }>(
  "user/fetchCurrentProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/user/profile");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch current profile");
    }
  }
);

// ==================== SLICE ==================== //
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching profile";
      })

      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error updating profile";
      })

      // fetchCurrentProfile
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCurrentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching current profile";
      });
  },
});

export const { clearProfile, clearError } = userSlice.actions;
export default userSlice.reducer;
