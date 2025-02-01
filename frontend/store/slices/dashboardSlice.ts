import { CardType, RevealedCardResult } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  gameStarted: boolean;
  gameId: string | null;
  cards: Record<string, CardType>;
  revealedCards: boolean[];
  heldCardIndex: number | null;
  bets: Record<string, number>;
  selectedBetAmount: number;
  greeting: string;
  gameRevealed: boolean;
  resultAmount: number;
  loadingCards: boolean;
  revealedCardResults: RevealedCardResult | null; // ✅ Corrected type
}

const initialState: DashboardState = {
  gameStarted: false,
  gameId: null,
  cards: {},
  revealedCards: [false, false, false, false],
  heldCardIndex: null,
  bets: {},
  selectedBetAmount: 100,
  greeting: "",
  gameRevealed: false,
  resultAmount: 0,
  loadingCards: false,
  revealedCardResults: null, // ✅ Corrected default state
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setGameStarted: (state, action: PayloadAction<boolean>) => {
      state.gameStarted = action.payload;
    },
    setGameId: (state, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    },
    setCards: (state, action: PayloadAction<Record<string, CardType>>) => {
      state.cards = action.payload;
    },
    setRevealedCards: (state, action: PayloadAction<boolean[]>) => {
      state.revealedCards = action.payload;
    },
    setHeldCardIndex: (state, action: PayloadAction<number | null>) => {
      state.heldCardIndex = action.payload;
    },
    setBets: (state, action: PayloadAction<Record<string, number>>) => {
      state.bets = action.payload;
    },
    setSelectedBetAmount: (state, action: PayloadAction<number>) => {
      state.selectedBetAmount = action.payload;
    },
    setGreeting: (state, action: PayloadAction<string>) => {
      state.greeting = action.payload;
    },
    setGameRevealed: (state, action: PayloadAction<boolean>) => {
      state.gameRevealed = action.payload;
    },
    setResultAmount: (state, action: PayloadAction<number>) => {
      state.resultAmount = action.payload;
    },
    setLoadingCards: (state, action: PayloadAction<boolean>) => {
      state.loadingCards = action.payload;
    },
    setRevealedCardResults: (state, action: PayloadAction<RevealedCardResult | null>) => {
      state.revealedCardResults = action.payload;
    },
  },
});

export const {
  setGameStarted,
  setGameId,
  setCards,
  setRevealedCards,
  setHeldCardIndex,
  setBets,
  setSelectedBetAmount,
  setGreeting,
  setGameRevealed,
  setResultAmount,
  setLoadingCards,
  setRevealedCardResults,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
