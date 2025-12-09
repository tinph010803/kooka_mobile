import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// TYPES
interface Message {
    _id?: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date | string;
    metadata?: {
        recipes?: any[];
        images?: string[];
        mealPlan?: any;
    };
}

interface Conversation {
    _id: string;
    userId: string;
    sessionId: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    loading: boolean;
    error: string | null;
}

// INITIAL STATE
const initialState: ChatState = {
    conversations: [],
    currentConversation: null,
    loading: false,
    error: null,
};

// API CALLS

// Fetch all conversations for a user from database
export const fetchConversations = createAsyncThunk<
    Conversation[],
    string, // userId
    { rejectValue: string }
>(
    'chat/fetchConversations',
    async (userId, { rejectWithValue }) => {
        try {
            // Fetch all conversations from MongoDB by userId
            const response = await axiosInstance.get(`/chatbot/conversations?userId=${userId}`);
            
            // Backend should return array of conversations
            const conversations = response.data.conversations || response.data || [];
            
            // Sort by updatedAt descending (newest first)
            return conversations.sort((a: any, b: any) => {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversations');
        }
    }
);

// Fetch a specific conversation by sessionId
export const fetchConversation = createAsyncThunk<
    Conversation,
    { sessionId: string; userId: string },
    { rejectValue: string }
>(
    'chat/fetchConversation',
    async ({ sessionId, userId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/chatbot/history/${sessionId}`);
            
            return {
                _id: sessionId,
                userId,
                sessionId,
                messages: response.data.history || [],
                createdAt: response.data.createdAt || new Date().toISOString(),
                updatedAt: response.data.updatedAt || new Date().toISOString()
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversation');
        }
    }
);

// Delete a conversation
export const deleteConversation = createAsyncThunk<
    string,
    { sessionId: string; userId: string },
    { rejectValue: string }
>(
    'chat/deleteConversation',
    async ({ sessionId }, { rejectWithValue }) => {
        try {
            // Delete from backend
            await axiosInstance.delete(`/chatbot/history/${sessionId}`);
            
            return sessionId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete conversation');
        }
    }
);

// SLICE
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
            state.currentConversation = action.payload;
        },
        clearCurrentConversation: (state) => {
            state.currentConversation = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch conversations
        builder.addCase(fetchConversations.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchConversations.fulfilled, (state, action) => {
            state.loading = false;
            state.conversations = action.payload;
        });
        builder.addCase(fetchConversations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'An error occurred';
        });

        // Fetch conversation
        builder.addCase(fetchConversation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchConversation.fulfilled, (state, action) => {
            state.loading = false;
            state.currentConversation = action.payload;
        });
        builder.addCase(fetchConversation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'An error occurred';
        });

        // Delete conversation
        builder.addCase(deleteConversation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteConversation.fulfilled, (state, action) => {
            state.loading = false;
            state.conversations = state.conversations.filter(
                conv => conv.sessionId !== action.payload
            );
            if (state.currentConversation?.sessionId === action.payload) {
                state.currentConversation = null;
            }
        });
        builder.addCase(deleteConversation.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'An error occurred';
        });
    },
});

export const { setCurrentConversation, clearCurrentConversation, clearError } = chatSlice.actions;
export default chatSlice.reducer;
