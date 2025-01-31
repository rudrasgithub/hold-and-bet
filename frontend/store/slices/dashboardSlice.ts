import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  gameStarted: boolean;
  gameId: string | null;
  cards: any[];
  revealedCards: boolean[];
  heldCardIndex: number | null;
  bets: Record<string, number>;
  selectedBetAmount: number;
  greeting: string;
  gameRevealed: boolean;
  resultMessage: string | null;
  resultAmount: number | null;
  loadingCards: boolean; // ✅ Add loading state
}

const initialState: DashboardState = {
  gameStarted: false,
  gameId: null,
  cards: [],
  revealedCards: [false, false, false, false],
  heldCardIndex: null,
  bets: {},
  selectedBetAmount: 10,
  greeting: "",
  gameRevealed: false,
  resultMessage: null,
  resultAmount: null,
  loadingCards: false, // ✅ Add loading state
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
    setCards: (state, action: PayloadAction<any[]>) => {
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
    setResultMessage: (state, action: PayloadAction<string | null>) => {
      state.resultMessage = action.payload;
    },
    setResultAmount: (state, action: PayloadAction<number | null>) => {
      state.resultAmount = action.payload;
    },
    setLoadingCards: (state, action: PayloadAction<boolean>) => { 
      state.loadingCards = action.payload; 
    }, // ✅ Added reducer
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
  setResultMessage,
  setResultAmount,
  setLoadingCards, // ✅ Exported
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
