import { Card } from "@/types";
import { motion } from "framer-motion";
import type { FC } from "react";

interface PlayingCardProps {
  card: Card;
  isRevealed: boolean;
  isHeld: boolean;
  onClick: () => void;
  disabled: boolean;
  cardLoading: boolean;
}

const suitSymbols: { [key: string]: string } = {
  Hearts: "❤️",
  Diamonds: "♦️",
  Clubs: "♣️",
  Spades: "♠️",
};

const PlayingCard: FC<PlayingCardProps> = ({ card, isRevealed, isHeld, onClick, disabled, cardLoading }) => {
  const cardClass = isHeld
    ? "transform scale-110 shadow-xl ring-4 ring-purple-400 animate-pulse"
    : "transform scale-100";

    const cardStyles = disabled || isHeld || cardLoading
    ? "pointer-events-none cursor-not-allowed"
    : "cursor-pointer";

  const suitColor = card.suit === "Hearts" || card.suit === "Diamonds" ? "text-red-600" : "text-black";

  return (
    <motion.div
      className={`relative w-32 h-48 rounded-xl bg-white border-2 border-gray-300 shadow-lg transition-all ${cardClass} ${cardStyles}`}
      onClick={onClick}
      whileHover={!isHeld && !disabled && !cardLoading ? { scale: 1.05 } : {}} // Disable hover effect if loading
      animate={{
        rotateY: isRevealed ? 0 : 180,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
      }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className={`absolute inset-0 flex flex-col justify-between p-4 bg-white rounded-xl ${suitColor}`}
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="flex justify-between text-xl font-bold">
          <span>{suitSymbols[card.suit]}</span>
          <span>{suitSymbols[card.suit]}</span>
        </div>

        <div className="flex items-center justify-center text-4xl font-bold">
          <span>{card.value}</span>
        </div>

        <div className="flex justify-between text-xl font-bold">
          <span>{suitSymbols[card.suit]}</span>
          <span>{suitSymbols[card.suit]}</span>
        </div>
      </motion.div>

      {!isRevealed && (
        <motion.div
          className="absolute inset-0 flex justify-center items-center bg-gradient-to-r from-purple-500 via-purple-700 to-purple-900 text-white text-2xl font-bold rounded-xl"
          style={{
            backfaceVisibility: "visible",
            transform: "rotateY(180deg)",
          }}
        >
          ?
        </motion.div>
      )}

      <div className="absolute inset-0 bg-transparent shadow-lg rounded-xl"></div>
    </motion.div>
  );
};

export default PlayingCard;