import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "@/lib/utils";

export const startNewGameThunk = createAsyncThunk("dashboard/startNewGame", async (token: string) => {
  const response = await axios.post(`${BACKEND_URL}/games/newgame`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});
