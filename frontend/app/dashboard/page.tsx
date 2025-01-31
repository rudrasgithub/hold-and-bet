"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PlayingCard from "../components/PlayingCard";
import { BACKEND_URL } from "@/lib/utils";
import axios from "axios";
import { useSession } from "next-auth/react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import {
  setGameStarted,
  setCards,
  setRevealedCards,
  setHeldCardIndex,
  setBets,
  setSelectedBetAmount,
  setGreeting,
  setGameId,
  setLoadingCards,
  setGameRevealed,
  setResultMessage,
  setResultAmount,
  setRevealedCardResults
} from "@/store/slices/dashboardSlice";
import { RootState } from "@/store";
import { updateBalance } from "@/store/slices/walletSlice";
import { startNewGameThunk } from "@/store/slices/dashboardThunks"; 

export default function Dashboard() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const balance = useSelector((state: RootState) => state.wallet.balance);
  const {
    gameStarted,
    cards,
    revealedCards,
    heldCardIndex,
    bets,
    selectedBetAmount,
    greeting,
    gameId,
    loadingCards,
    gameRevealed,
    resultMessage,
    resultAmount,
    revealedCardResults
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) dispatch(setGreeting("Good Morning"));
    else if (hour < 18) dispatch(setGreeting("Good Afternoon"));
    else dispatch(setGreeting("Good Evening"));

    if (session?.user.token) {
      const fetchBalance = async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/wallet/balance`, {
            headers: {
              Authorization: `Bearer ${session.user.token}`,
            },
          });
          dispatch(updateBalance(response.data.balance));
        } catch (error) {
          toast.error("Failed to fetch wallet balance");
        }
      };

      fetchBalance();
    }
  }, [session?.user.token, dispatch]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  const startGame = async () => {
    if (Number(balance) === 0) {
      toast.error("Add more funds to start a game.");
      return;
    }

    dispatch(setGameStarted(true));
    dispatch(setRevealedCards(new Array(4).fill(false)));
    dispatch(setHeldCardIndex(null));
    dispatch(setBets({})); // reset bets as object
    dispatch(setGameRevealed(false));
    dispatch(setResultAmount(null));
    dispatch(setResultMessage(null));
    dispatch(setCards([]));

    // Call the async thunk for starting a new game
    dispatch(startNewGameThunk({ token: session?.user.token }));
  };

  const holdCard = async (index: number) => {
    if (heldCardIndex !== null || revealedCards[index]) return;

    try {
      await axios.post(`${BACKEND_URL}/games/${gameId}/hold`, { hold: `Card${index + 1}` }, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      dispatch(setHeldCardIndex(index));
      toast.success(`Card ${index + 1} is now held.`);
    } catch (error) {
      toast.error("Failed to hold card.");
    }
  };

  const placeBet = async (cardIndex: number, amount: number) => {
    if (heldCardIndex === cardIndex) {
      toast.error("You cannot bet on the held card.");
      return;
    }
    if (amount < 5) return;

    const totalBets = Object.values(bets).reduce((sum, betAmount) => sum + betAmount, 0) + amount;

    if (totalBets > balance) {
      toast.error("You don't have enough balance for this bet.");
      return;
    }

    const combinedBets = { ...bets };
    const cardKey = `Card${cardIndex + 1}`;
    if (combinedBets[cardKey]) {
      combinedBets[cardKey] += amount;
    } else {
      combinedBets[cardKey] = amount;
    }
    dispatch(setBets(combinedBets));

    // Call the async thunk for placing a bet
    dispatch(placeBetThunk(gameId, session?.user.token));
  };

  const handleCardClick = (index: number) => {
    if (heldCardIndex === null) {
      holdCard(index);
      return;
    }
    placeBet(index, selectedBetAmount || 0);
  };

  const revealCards = async () => {
    if (heldCardIndex === null) {
      toast.error("You must hold a card before revealing.");
      return;
    }
    dispatch(setRevealedCards(new Array(4).fill(true)));
    dispatch(setLoadingCards(true));

    // Call the async thunk for revealing cards
    dispatch(revealCardsThunk(gameId, session?.user.token));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            {greeting}, Player!
          </h1>
          <p className="text-gray-400 text-lg">
            Your Balance:
            <span className="font-bold ml-2 text-purple-400">₹{balance}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {!gameStarted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <Button
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-purple-600/20 transition-all"
                >
                  Start Game
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {cards.length > 0
                    ? cards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-center">
                          <PlayingCard
                            card={card}
                            isRevealed={revealedCards[index]}
                            isHeld={heldCardIndex === index}
                            onClick={() => handleCardClick(index)}
                            disabled={heldCardIndex !== null && (heldCardIndex === index || revealedCards[index])}
                          />
                          {heldCardIndex !== null && revealedCards[index] && (
                            <p className="mt-3 text-semibold text-gray-300">
                              {bets[`Card${index + 1}`] ? `Bet: ₹${bets[`Card${index + 1}`]}` : ""}
                            </p>
                          )}
                          {!revealedCards[index] && !heldCardIndex && revealedCardResults && revealedCardResults[index] && (
                            <p
                              className={`mt-2 text-sm ${resultMessage === "You Won" ? "text-green-500" : "text-red-500"}`}
                            >
                              {revealedCardResults[index].bet
                                ? `Gain: ₹${revealedCardResults[index].gain}`
                                : `Loss: ₹${revealedCardResults[index].loss}`}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                    : [1, 2, 3, 4].map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-center">
                          <PlayingCard
                            card={{ suit: "Spades", rank: "?", value: 6 }}
                            isRevealed={false}
                            isHeld={false}
                            onClick={() => handleCardClick(index)}
                            disabled={false}
                          />
                        </div>
                      </motion.div>
                    ))}
                </div>

                <div className="pt-10 flex justify-center gap-4">
                  <Button
                    onClick={revealCards}
                    disabled={Object.keys(bets).length === 0 || heldCardIndex === null || gameRevealed}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                  >
                    Reveal Cards
                  </Button>
                  <Button
                    onClick={startGame}
                    variant="outline"
                    className="border-purple-600/50 hover:bg-purple-600/20 text-white px-8 py-6 text-lg"
                  >
                    New Game
                  </Button>
                </div>
                {resultMessage && resultAmount !== null && (
                  <div
                    className={`mt-6 text-lg font-bold text-center ${resultMessage === "You Won" ? "text-green-500" : "text-red-500"}`}
                  >
                    {resultMessage}: ₹{resultAmount}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 bg-gray-800 p-4 rounded-xl shadow-xl">
            <h3 className="text-2xl font-semibold text-center text-white mb-3">Quick Info</h3>
            <div className="mt-6 text-white space-y-2">
              <h4 className="text-xl font-bold">How to Play:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Hold a card, must hold one card before betting</li>
                <li>Choose bet amount, click on a card to place a bet</li>
                <li>Click "Reveal Cards" to see the results!</li>
              </ul>
              <hr />
            </div>
            <p className="text-lg text-white">Bet Amount: ₹{selectedBetAmount}</p>
            <p className="text-lg text-white">
              Total Bets: ₹{Object.values(bets).reduce((sum, betAmount) => sum + betAmount, 0)}
            </p>

            <div className="flex gap-2 justify-center mt-6">
              {[5, 10, 20, 50, 100, 200, 500].map((amount) => (
                <Button
                  key={amount}
                  defaultChecked
                  onClick={() => dispatch(setSelectedBetAmount(amount))}
                  className={`w-12 h-12 rounded-full ${selectedBetAmount === amount ? "bg-purple-600" : "bg-purple-400"
                    } text-white`}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
