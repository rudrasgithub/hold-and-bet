export interface Card {
    suit: string;
    value: string;
}

export interface CardResults {
    [key: string]: {
        gain?: number;
        loss?: number;
    };
}
export interface CardType {
    suit: "Hearts" | "Diamonds" | "Clubs" | "Spades";
    value: string;
}

export interface RevealedCardResult {
    [key: string]: {
        gain?: number;
        loss?: number;
    };
}

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

export interface UserProfile {
    name: string;
    image: string;
    totalMatches: number;
    totalWins: number;
    totalProfit: number;
    winningRate: number;
}

export interface ProfileState {
    userData: UserProfile | null;
    loading: boolean;
    error: string | null;
}