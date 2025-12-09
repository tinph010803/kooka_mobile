import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../utils/axiosInstance";

// =====================
// ERROR TRANSLATOR
// =====================

const translateErrorMessage = (message: string): string => {
  const errorMap: { [key: string]: string } = {
    // Login/Auth errors
    "Invalid credentials": "Email hoặc mật khẩu không đúng",
    "Invalid email or password": "Email hoặc mật khẩu không đúng",
    "User not found": "Người dùng không tồn tại",
    "Email not found": "Email không tồn tại",
    "Incorrect password": "Mật khẩu không đúng",
    "Invalid password": "Mật khẩu không đúng",
    "Password is incorrect": "Mật khẩu không đúng",
    "Email not verified": "Email chưa được xác thực",
    "Please verify your email": "Vui lòng xác thực email của bạn",
    
    // Registration errors
    "Email already exists": "Email đã tồn tại",
    "User already exists": "Người dùng đã tồn tại",
    "Username already taken": "Tên đăng nhập đã được sử dụng",
    "Passwords do not match": "Mật khẩu không khớp",
    
    // Token errors
    "Invalid token": "Token không hợp lệ",
    "Token expired": "Token đã hết hạn",
    "No token provided": "Không có token",
    "Unauthorized": "Không có quyền truy cập",
    
    // Password reset errors
    "Reset token is invalid or has expired": "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
    "Token is invalid or has expired": "Token không hợp lệ hoặc đã hết hạn",
    "User with that email does not exist": "Email không tồn tại trong hệ thống",
    
    // Network errors
    "Network Error": "Lỗi kết nối mạng",
    "Request failed": "Yêu cầu thất bại",
    "timeout": "Hết thời gian chờ",
  };

  // Check exact match
  if (errorMap[message]) {
    return errorMap[message];
  }

  // Check partial match (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(errorMap)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return original if no match
  return message;
};

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

interface RegisterResponse {
  message: string;
  user: AuthUser;
  needVerification?: boolean;
  token?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isVerified?: boolean;
  pendingVerificationEmail?: string;
}

// =====================
// INITIAL STATE
// =====================

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
  isVerified: undefined,
  pendingVerificationEmail: undefined,
};

// =====================
// API CALLS
// =====================

// Login
export const login = createAsyncThunk<
  AuthResponse,
  { usernameOrEmail: string; password: string },
  { rejectValue: string | { message: string; isVerified?: boolean; email?: string } }
>("auth/login", async ({ usernameOrEmail, password }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/auth/login", {
      usernameOrEmail,
      password,
    });
    await AsyncStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err: any) {
    // Nếu backend trả về isVerified = false, có nghĩa là email chưa verify
    if (err.response?.data?.isVerified === false) {
      const message = translateErrorMessage(err.response?.data?.message || "Email chưa được xác thực");
      const email = err.response?.data?.email || usernameOrEmail;
      return rejectWithValue({ message, isVerified: false, email });
    }
    // Get error message from backend response
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Đăng nhập thất bại";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
  }
});

// Register
export const registerUser = createAsyncThunk<
  RegisterResponse,
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
    // Chỉ lưu token nếu không cần verify (Google OAuth)
    if (res.data.token && !res.data.needVerification) {
      await AsyncStorage.setItem("token", res.data.token);
    }
    return res.data as RegisterResponse;
  } catch (err: any) {
    // Get error message from backend response
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Đăng ký thất bại";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
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
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tải thông tin người dùng";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
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
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Xác thực token thất bại";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
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
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể gửi email đặt lại mật khẩu";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
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
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể đặt lại mật khẩu";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
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
    const backendError = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể đổi mật khẩu";
    const translatedError = translateErrorMessage(backendError);
    return rejectWithValue(translatedError);
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
      state.isVerified = undefined;
      state.pendingVerificationEmail = undefined;
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
      state.isVerified = undefined;
      state.pendingVerificationEmail = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isVerified = undefined;
        state.pendingVerificationEmail = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        state.isVerified = undefined;
        state.pendingVerificationEmail = undefined;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        
        // Handle verification error
        if (action.payload && typeof action.payload === "object") {
          state.error = action.payload.message || "Đăng nhập thất bại";
          state.isVerified = action.payload.isVerified;
          state.pendingVerificationEmail = action.payload.email;
        } else {
          state.error = action.payload || "Đăng nhập thất bại";
          state.isVerified = undefined;
          state.pendingVerificationEmail = undefined;
        }
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Chỉ set token và user nếu không cần verify (đăng ký qua Google)
        if (!action.payload.needVerification && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        // Nếu cần verify, KHÔNG set token và user vào state
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng ký thất bại";
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
        state.error = action.payload || "Không thể tải thông tin người dùng";
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
        state.error = action.payload || "Xác thực token thất bại";
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
        state.error = action.payload || "Không thể gửi email đặt lại mật khẩu";
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
        state.error = action.payload || "Không thể đặt lại mật khẩu";
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
        state.error = action.payload || "Không thể đổi mật khẩu";
      });
  },
});

export const { logout, setToken, setAuthData, clearError } = authSlice.actions;
export default authSlice.reducer;
