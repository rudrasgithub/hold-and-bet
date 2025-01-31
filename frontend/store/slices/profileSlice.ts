import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "@/lib/utils";

export interface UserProfile {
  name: string;
  image: string;
  totalMatches: number;
  totalWins: number;
  totalProfit: number;
  winningRate: number;
}

interface ProfileState {
  userData: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProfileState = {
  userData: null,
  loading: false,
  error: null,
};

// Async thunk for fetching profile data
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.profile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user profile");
    }
  }
);

// Profile slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    resetProfile: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
