import { Transaction, WalletState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: WalletState = {
  walletId: "",
  balance: 0,
  transactions: []
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletData(state, action: PayloadAction<{ walletId: string, balance: number; transactions: Transaction[] }>) {
      state.walletId = action.payload.walletId;
      state.balance = action.payload.balance;
      // Sort transactions in descending order by the updatedAt field
      state.transactions = action.payload.transactions.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      // Add new transaction and sort in descending order
      state.transactions = [action.payload, ...state.transactions].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    updateBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
  },
});

export const { setWalletData, addTransaction, updateBalance } = walletSlice.actions;

export default walletSlice.reducer;
