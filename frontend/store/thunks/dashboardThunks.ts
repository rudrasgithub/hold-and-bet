import { createAsyncThunk } from "@reduxjs/toolkit";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export const startNewGameThunk = createAsyncThunk("dashboard/startNewGame", async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/games/newgame`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('Failed to start new game');
  return response.json();
});

export const placeBetThunk = createAsyncThunk(
  "dashboard/placeBet",
  async ({ gameId, betData, token }: { gameId: string; betData: { cardId: string; amount: number }; token: string }) => {
    const { cardId, amount } = betData;

    const response = await fetch(`${BACKEND_URL}/games/${gameId}/bet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bets: { [cardId]: amount } }),
    });
    if (!response.ok) throw new Error('Failed to place bet');
    return response.json();
  }
);

export const revealCardsThunk = createAsyncThunk("dashboard/revealCards", async ({ gameId, token }: { gameId: string, token: string }) => {
  const response = await fetch(`${BACKEND_URL}/games/${gameId}/reveal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error('Failed to reveal cards');
  return response.json();
});