import { ProfileState } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { fetchUserProfile } from "../thunks/profileThunks";

const initialState: ProfileState = {
  userData: null,
  loading: false,
  error: null,
};


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
