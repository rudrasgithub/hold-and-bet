// walletSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  updatedAt: string;
  type: string;
  amount: number;
  status: string;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletData(state, action: PayloadAction<{ balance: number; transactions: Transaction[] }>) {
      state.balance = action.payload.balance;
      state.transactions = action.payload.transactions;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions = [action.payload, ...state.transactions]; // Add new transaction to the top
    },
    updateBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
  },
});

export const { setWalletData, addTransaction, updateBalance } = walletSlice.actions;

export default walletSlice.reducer;
