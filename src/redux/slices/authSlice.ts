import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Lấy API URL từ environment variables
const API_URL = Constants.expoConfig?.extra?.apiGatewayUrl || "https://api-gateway-6n1e.onrender.com/api";

// Tạo axios instance với interceptor
const createAxiosWithAuth = () => {
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000, // Tăng timeout lên 30s
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor - tự động thêm token
  axiosInstance.interceptors.request.use(
    async (config) => {
      console.log("🔵 Request URL:", (config.baseURL || '') + (config.url || ''));
      console.log("🔵 Request Method:", config.method);
      console.log("🔵 Request Data:", config.data);
      
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - xử lý lỗi middleware
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log("✅ Response:", response.status, response.data);
      return response;
    },
    async (error) => {
      console.error("❌ Response Error:", error.message);
      console.error("❌ Error Details:", error.response?.data);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          // Token hết hạn hoặc không hợp lệ
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("persist:root");
        }
        
        return Promise.reject(new Error(data?.message || "Request failed"));
      }
      
      // Network error hoặc timeout
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error("Request timeout. Please try again."));
      }
      
      return Promise.reject(new Error(error.message || "Network error. Please check your connection."));
    }
  );

  return axiosInstance;
};

const apiClient = createAxiosWithAuth();

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
    const res = await apiClient.post("/auth/login", {
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
    const res = await apiClient.post("/auth/register", formData);
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
    const res = await apiClient.get("/auth/me");
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
    await apiClient.get("/auth/verify");
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
    const res = await apiClient.post("/auth/forgot-password", { email });
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
    const res = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to reset password");
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
      });
  },
});

export const { logout, setToken, setAuthData, clearError } = authSlice.actions;
export default authSlice.reducer;

// Export apiClient để sử dụng ở các slice khác
export { apiClient };
