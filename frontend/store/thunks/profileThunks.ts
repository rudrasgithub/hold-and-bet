import { createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export const fetchUserProfile = createAsyncThunk(
    "profile/fetchUserProfile",
    async (token: string, { rejectWithValue }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user profile');
        }
        const data = await response.json();
        return data.profile;
      } catch (error: unknown) {
        const err = error as Error;
        return rejectWithValue(err.message || "Failed to fetch user profile");
      }
    }
  );
  