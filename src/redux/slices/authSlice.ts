import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../utils/axiosInstance";

// =====================
// TYPES
// =====================

interface AuthUser {
  _id: string;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// =====================
// INITIAL STATE
// =====================

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

// =====================
// API CALLS
// =====================

// Login
export const login = createAsyncThunk<
  AuthResponse,
  { usernameOrEmail: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ usernameOrEmail, password }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/login", {
      usernameOrEmail,
      password,
    });
    await AsyncStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Login failed");
  }
});

// Register
export const registerUser = createAsyncThunk<
  AuthResponse,
  {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
  { rejectValue: string }
>("auth/register", async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/register", formData);
    await AsyncStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Registration failed");
  }
});

// Load user từ token (khi app khởi động)
export const loadUser = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load user");
  }
});

// Verify token
export const verifyToken = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>("auth/verifyToken", async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.get("/auth/verify");
    return true;
  } catch (err: any) {
    return rejectWithValue(err.message || "Token verification failed");
  }
});

// Forgot Password - Gửi email reset
export const forgotPassword = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/forgot-password", { email });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to send reset email");
  }
});

// Reset Password - Đặt lại mật khẩu với token từ email
export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to reset password");
  }
});

// Change Password - Đổi mật khẩu khi đã đăng nhập
export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("auth/changePassword", async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to change password");
  }
});

// =====================
// SLICE
// =====================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      // Xóa token khỏi AsyncStorage
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("persist:root");
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      AsyncStorage.setItem("token", action.payload);
    },
    setAuthData: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      AsyncStorage.setItem("token", action.payload.token);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // LOAD USER
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load user";
        state.token = null;
        state.user = null;
      })

      // VERIFY TOKEN
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Token verification failed";
        state.token = null;
        state.user = null;
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send reset email";
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to reset password";
      })

      // CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to change password";
      });
  },
});

export const { logout, setToken, setAuthData, clearError } = authSlice.actions;
export default authSlice.reducer;
