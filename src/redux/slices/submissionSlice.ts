import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import type { Ingredient, Tag, Cuisine, Category, Instruction, IngredientWithDetails } from "./recipeSlice";

// ==== Types ====
export interface Submission {
    _id: string;
    name: string;
    short: string;
    difficulty: string;
    time: number;
    size: number;
    calories: number;
    image: string;
    video?: string;
    ingredients: Ingredient[];
    ingredientsWithDetails: IngredientWithDetails[];
    tags: Tag[];
    cuisine: Cuisine;
    category: Category;
    instructions: Instruction[];
    status: "pending" | "approved" | "rejected";
    submittedBy: string;
    submittedByName: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    recipeId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubmissionPayload {
    name: string;
    short: string;
    difficulty: string;
    time: number;
    size: number;
    calories: number;
    image: string;
    video?: string;
    ingredients: string[];
    tags: string[];
    cuisine: string;
    category: string;
    ingredientsWithDetails: Array<{
        id: string;
        quantity: number;
        unit: string;
    }>;
    instructions: Instruction[];
}

// ==== State ====
interface SubmissionState {
    mySubmissions: Submission[];
    allSubmissions: Submission[];
    currentSubmission: Submission | null;
    pendingCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: SubmissionState = {
    mySubmissions: [],
    allSubmissions: [],
    currentSubmission: null,
    pendingCount: 0,
    loading: false,
    error: null,
};

// ==== Async Thunks ====

// User - Tạo đề xuất
export const createSubmission = createAsyncThunk(
    "submissions/create",
    async (payload: CreateSubmissionPayload, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/submissions", payload);
            return response.data.submission;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi tạo đề xuất");
        }
    }
);

// User - Lấy đề xuất của mình
export const fetchMySubmissions = createAsyncThunk(
    "submissions/fetchMy",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/submissions/my-submissions");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi lấy đề xuất");
        }
    }
);

// User/Admin - Xem chi tiết đề xuất
export const fetchSubmissionById = createAsyncThunk(
    "submissions/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/submissions/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi lấy chi tiết");
        }
    }
);

// User - Xóa đề xuất
export const deleteSubmission = createAsyncThunk(
    "submissions/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/submissions/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi xóa đề xuất");
        }
    }
);

// Admin - Lấy tất cả đề xuất
export const fetchAllSubmissions = createAsyncThunk(
    "submissions/fetchAll",
    async (status: "pending" | "approved" | "rejected" | undefined, { rejectWithValue }) => {
        try {
            const url = status ? `/submissions?status=${status}` : "/submissions";
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi lấy đề xuất");
        }
    }
);

// Admin - Đếm số đề xuất chờ duyệt
export const fetchPendingCount = createAsyncThunk(
    "submissions/fetchPendingCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/submissions/pending-count");
            return response.data.count;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi đếm đề xuất");
        }
    }
);

// Admin - Duyệt đề xuất
export const approveSubmission = createAsyncThunk(
    "submissions/approve",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/submissions/${id}/approve`);
            return response.data.submission;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi duyệt đề xuất");
        }
    }
);

// Admin - Từ chối đề xuất
export const rejectSubmission = createAsyncThunk(
    "submissions/reject",
    async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/submissions/${id}/reject`, { reason });
            return response.data.submission;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Lỗi khi từ chối đề xuất");
        }
    }
);

// ==== Slice ====
const submissionSlice = createSlice({
    name: "submissions",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentSubmission: (state) => {
            state.currentSubmission = null;
        },
    },
    extraReducers: (builder) => {
        // Create submission
        builder
            .addCase(createSubmission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSubmission.fulfilled, (state, action) => {
                state.loading = false;
                state.mySubmissions.unshift(action.payload);
            })
            .addCase(createSubmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch my submissions
        builder
            .addCase(fetchMySubmissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMySubmissions.fulfilled, (state, action) => {
                state.loading = false;
                state.mySubmissions = action.payload;
            })
            .addCase(fetchMySubmissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch submission by ID
        builder
            .addCase(fetchSubmissionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubmissionById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSubmission = action.payload;
            })
            .addCase(fetchSubmissionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete submission
        builder
            .addCase(deleteSubmission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSubmission.fulfilled, (state, action) => {
                state.loading = false;
                state.mySubmissions = state.mySubmissions.filter(
                    (sub) => sub._id !== action.payload
                );
            })
            .addCase(deleteSubmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch all submissions (Admin)
        builder
            .addCase(fetchAllSubmissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSubmissions.fulfilled, (state, action) => {
                state.loading = false;
                state.allSubmissions = action.payload;
            })
            .addCase(fetchAllSubmissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch pending count
        builder
            .addCase(fetchPendingCount.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchPendingCount.fulfilled, (state, action: PayloadAction<number>) => {
                state.pendingCount = action.payload;
            })
            .addCase(fetchPendingCount.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Approve submission
        builder
            .addCase(approveSubmission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveSubmission.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.allSubmissions.findIndex(
                    (sub) => sub._id === action.payload._id
                );
                if (index !== -1) {
                    state.allSubmissions[index] = action.payload;
                }
                state.pendingCount = Math.max(0, state.pendingCount - 1);
            })
            .addCase(approveSubmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Reject submission
        builder
            .addCase(rejectSubmission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectSubmission.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.allSubmissions.findIndex(
                    (sub) => sub._id === action.payload._id
                );
                if (index !== -1) {
                    state.allSubmissions[index] = action.payload;
                }
                state.pendingCount = Math.max(0, state.pendingCount - 1);
            })
            .addCase(rejectSubmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearCurrentSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;
