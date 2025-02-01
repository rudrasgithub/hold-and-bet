import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  