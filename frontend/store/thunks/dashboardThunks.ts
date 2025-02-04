import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const startNewGameThunk = createAsyncThunk("dashboard/startNewGame", async (token: string) => {
  const response = await axios.post(`${BACKEND_URL}/games/newgame`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});

export const placeBetThunk = createAsyncThunk(
  "dashboard/placeBet",
  async ({ gameId, betData, token }: { gameId: string; betData: { cardId: string; amount: number }; token: string }) => {

    const { cardId, amount } = betData;

    const response = await axios.post(
      `${BACKEND_URL}/games/${gameId}/bet`,
      { bets: { [cardId]: amount } },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);


export const revealCardsThunk = createAsyncThunk("dashboard/revealCards", async ({ gameId, token }: { gameId: string, token: string }) => {
  const response = await axios.post(
    `${BACKEND_URL}/games/${gameId}/reveal`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
});