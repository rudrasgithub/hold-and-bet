"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PlayingCard from "../components/PlayingCard";
import axios from "axios";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
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
  setResultAmount,
  setRevealedCardResults
} from "@/store/slices/dashboardSlice";
import { AppDispatch, RootState } from "@/store";
import { updateBalance } from "@/store/slices/walletSlice";
import { startNewGameThunk, placeBetThunk, revealCardsThunk } from "@/store/thunks/dashboardThunks";
import GameRules from "../components/GameRules";
import useAuth from "@/lib/useAuth";

const Dashboard = () => {
  const { session, status } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const balance = useSelector((state: RootState) => state.wallet.balance);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
    resultAmount,
    revealedCardResults
  } = useSelector((state: RootState) => state.dashboard, shallowEqual);

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
          console.log(error)
          toast.error("Failed to fetch wallet balance");
        }
      };

      fetchBalance();
    }
  }, [session?.user.token, dispatch, BACKEND_URL]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  const startGame = async () => {
    if (balance === 0) {
      toast.error("Add more funds to start a game.");
      return;
    }
    toast.success("Please wait until game starts!!!")
    dispatch(setGameStarted(true));
    dispatch(setRevealedCards(new Array(4).fill(false)));
    dispatch(setHeldCardIndex(null));
    dispatch(setBets({}));
    dispatch(setGameRevealed(false));
    dispatch(setResultAmount(0));
    dispatch(setCards({}));
    dispatch(setRevealedCardResults({}));
    dispatch(setLoadingCards(false));
    
    if (session?.user.token) {
      // toast.success("Please wait until game starts!!!")
      toast.success("Game")
      try {
        const { game } = await dispatch(startNewGameThunk(session.user.token)).unwrap();
        if (game.id) {
          dispatch(setGameId(game.id));
          toast.success("Game created!");
        } else {
          toast.error("Failed to start a new game.");
        }
      } catch (error) {
        console.log(error)
        toast.error("Failed to start a new game.");
      }
    }
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
      console.log(error)
      toast.error("Please, try again.");
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
    const cardId = `Card${cardIndex + 1}`;
    const updatedBets = { ...bets, [cardId]: (bets[cardId] || 0) + amount };
    dispatch(setBets(updatedBets));
    if (session?.user.token) {
      try {
        const response = await dispatch(placeBetThunk({ gameId: gameId as string, betData: { cardId, amount }, token: session.user.token })).unwrap();
        if (response) {
          toast.success(`₹${amount} placed on ${cardId}`);
        }
      } catch (error) {
        console.log(error)
        toast.error("Failed to place bet.");
      }
    }
  };

  const handleCardClick = (index: number) => {
    if (heldCardIndex === null) {
      holdCard(index);
      return;
    }
    placeBet(index, selectedBetAmount);
  };

  const revealCards = async () => {
    if (heldCardIndex === null) {
      toast.error("You must hold a card before revealing.");
      return;
    }
    dispatch(setRevealedCards(new Array(4).fill(true)));
    dispatch(setLoadingCards(true));

    if (session?.user.token) {
      try {
        const response = await dispatch(revealCardsThunk({ gameId: gameId as string, token: session.user.token })).unwrap();
        const { totalEarnings, newBalance, generatedCards, cardResults } = response;

        dispatch(setCards(generatedCards));
        dispatch(setLoadingCards(false));
        dispatch(setRevealedCardResults(cardResults));
        dispatch(setResultAmount(totalEarnings));
        dispatch(updateBalance(newBalance));
        dispatch(setGameRevealed(true));

        if (totalEarnings > 0) {
          toast.success(`Congratulations! You won ₹${totalEarnings}.`);
        } else {
          toast.error("Better luck next time!");
        }
      } catch (error) {
        console.log(error)
        toast.error("Failed to reveal cards.");
      }
    }
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
                  {Object.keys(cards).length > 0
                    ? Object.values(cards).map((card, index) => {
                      const cardKey = `Card${index + 1}`;
                      return (
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
                              disabled={heldCardIndex === null || heldCardIndex === index || revealedCards[index]}
                            />
                            {bets[cardKey] && (
                              <div className="mt-3 text-gray-300">
                                Bet: ₹{bets[cardKey]}
                              </div>
                            )}
                            {revealedCards[index] && gameRevealed && revealedCardResults?.[cardKey] && (
                              <div className={`text-sm font-bold ${revealedCardResults[cardKey].gain ? "text-green-500" : "text-red-500"}`}>
                                {revealedCardResults[cardKey].gain
                                  ? `Gain: ₹${revealedCardResults[cardKey].gain}`
                                  : `Loss: ₹${revealedCardResults[cardKey].loss}`}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                    : [1, 2, 3, 4].map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-center">
                          <PlayingCard
                            card={{ suit: "", value: "0" }}
                            isRevealed={false}
                            isHeld={false}
                            onClick={() => handleCardClick(index)}
                            disabled={false}
                          />
                        </div>
                      </motion.div>
                    ))}
                </div>

                <div className="pt-5 flex justify-center gap-4">
                  <Button
                    onClick={revealCards}
                    disabled={Object.keys(bets).length === 0 || heldCardIndex === null || gameRevealed || loadingCards}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                  >
                    {loadingCards ? "Revealing..." : "Reveal Cards"}
                  </Button>
                  <Button
                    onClick={startGame}
                    variant="outline"
                    className="border-purple-600/50 hover:bg-purple-600/20 text-white px-8 py-6 text-lg"
                  >
                    New Game
                  </Button>
                </div>

                {resultAmount !== 0 && (
                  <div className={`mt-6 text-lg font-bold text-center ${resultAmount > 0 ? "text-green-500" : "text-red-500"}`}>
                    {resultAmount > 0 ? `You Won: ₹${resultAmount}` : `You Lost: ₹${resultAmount}`}
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
                <li>Click Reveal Cards to see the results!</li>
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
                  onClick={() => dispatch(setSelectedBetAmount(amount))}
                  className={`w-12 h-12 rounded-full ${selectedBetAmount === amount ? "bg-purple-600" : "bg-purple-400"} text-white`}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <GameRules />
      </div>
    </div>
  );
};

export default Dashboard;
