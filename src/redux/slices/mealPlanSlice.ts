import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// ==== Types ====
export interface Meal {
  recipeId?: string;
  recipeName?: string;
  recipeImage?: string;
}

export interface DayPlan {
  date: string; // ISO string (ex: "2025-10-20")
  morning?: Meal;
  noon?: Meal;
  evening?: Meal;
}

export interface MealPlan {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: "pending" | "completed";
  plans: DayPlan[];
  createdAt?: string;
  updatedAt?: string;
}

// ==== State ====
interface MealPlanState {
  mealPlans: MealPlan[];
  currentMealPlan: MealPlan | null;
  loading: boolean;
  error: string | null;
}

const initialState: MealPlanState = {
  mealPlans: [],
  currentMealPlan: null,
  loading: false,
  error: null,
};

// ==== Async Thunks ====

// 🥗 Lấy tất cả meal plans của user
export const fetchMealPlansByUser = createAsyncThunk(
  "mealPlans/fetchByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/mealplans/${userId}`);
      return res.data as MealPlan[];
    } catch (error: unknown) {
      const err = error as any;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch meal plans");
    }
  }
);

// 🥗 Tạo meal plan mới
export const createMealPlan = createAsyncThunk(
  "mealPlans/create",
  async (
    data: { userId: string; plans: DayPlan[]; startDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post("/mealplans", data);
      return res.data as MealPlan;
    } catch (error: unknown) {
      const err = error as any;
      return rejectWithValue(err.response?.data?.message || "Failed to create meal plan");
    }
  }
);

// 🥗 Cập nhật meal plan (chỉ cho phép chỉnh status hoặc thay đổi plan)
export const updateMealPlan = createAsyncThunk(
  "mealPlans/update",
  async (
    { id, mealPlan }: { id: string; mealPlan: Partial<MealPlan> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.put(`/mealplans/${id}`, mealPlan);
      return res.data as MealPlan;
    } catch (error: unknown) {
      const err = error as any;
      return rejectWithValue(err.response?.data?.message || "Failed to update meal plan");
    }
  }
);

// 🥗 Xóa meal plan
export const deleteMealPlan = createAsyncThunk(
  "mealPlans/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/mealplans/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as any;
      return rejectWithValue(err.response?.data?.message || "Failed to delete meal plan");
    }
  }
);

// ==== Slice ====
const mealPlanSlice = createSlice({
  name: "mealPlans",
  initialState,
  reducers: {
    clearCurrentMealPlan(state) {
      state.currentMealPlan = null;
    },
  },
  extraReducers: (builder) => {
    // 🟢 Fetch All
    builder.addCase(
      fetchMealPlansByUser.fulfilled,
      (state, action: PayloadAction<MealPlan[]>) => {
        state.mealPlans = action.payload;
        state.loading = false;
      }
    );

    // 🟢 Create
    builder.addCase(createMealPlan.fulfilled, (state, action: PayloadAction<MealPlan>) => {
      state.mealPlans.push(action.payload);
      state.loading = false;
    });

    // 🟢 Update
    builder.addCase(updateMealPlan.fulfilled, (state, action: PayloadAction<MealPlan>) => {
      const index = state.mealPlans.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.mealPlans[index] = action.payload;
      }
      state.loading = false;
    });

    // 🟢 Delete
    builder.addCase(deleteMealPlan.fulfilled, (state, action: PayloadAction<string>) => {
      state.mealPlans = state.mealPlans.filter((m) => m._id !== action.payload);
      if (state.currentMealPlan?._id === action.payload) {
        state.currentMealPlan = null;
      }
      state.loading = false;
    });

    // 🔄 Pending / Rejected
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("mealPlans/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("mealPlans/") && action.type.endsWith("/rejected"),
        (state, action: { error?: { message?: string } }) => {
          state.loading = false;
          state.error = action.error?.message || "An error occurred";
        }
      );
  },
});

export const { clearCurrentMealPlan } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;
