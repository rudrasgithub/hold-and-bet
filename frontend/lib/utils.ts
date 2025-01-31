import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const BACKEND_URL = 'http://localhost:5000/api';

export const paymentLink = 'https://buy.stripe.com/test_14k14faez39Pa2I5km';

// types/card.ts
export interface Card {
  suit: string;
  rank: string;
  value: number;
}
