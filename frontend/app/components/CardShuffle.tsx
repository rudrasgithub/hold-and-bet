import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// CardDeck Component to fetch random cards and display them
const CardDeck = () => {
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null); // Track the held card index
  const [revealIndex, setRevealIndex] = useState(0); // Track the card to reveal sequentially

  // Initialize deck on component mount
  useEffect(() => {
    const createDeck = async () => {
      const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/");
      const data = await response.json();
      setDeckId(data.deck_id); // Save the deck ID
    };

    createDeck();
  }, []);

  // Function to draw 4 random cards from the shuffled deck
  const drawCards = async () => {
    if (deckId) {
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`
      );
      const data = await response.json();
      setCards(data.cards); // Set the drawn cards
    }
  };

  // Function to reveal cards sequentially
  const revealCards = () => {
    if (revealIndex < cards.length) {
      setRevealIndex(revealIndex + 1); // Reveal the next card
    }
  };

  // Function to highlight the deck (user holding a card)
  const highlightCard = (index: number) => {
    setHighlighted(index); // Set the held card's index
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-6">
      {/* "Start Math" Button */}
      <button
        onClick={drawCards} // Draw 4 cards when clicked
        className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
      >
        Start Math
      </button>

      <div
        className="relative w-full h-[500px] flex justify-center items-center space-x-6"
      >
        {/* Display 4 drawn cards side by side */}
        {cards.map((card, index) => (
          <motion.div
            key={card.code}
            className={`w-[150px] h-[205px] bg-white border-0 shadow-none rounded-xl flex items-center justify-center ${
              highlighted === index ? "border-4 border-yellow-500 shadow-lg" : ""
            }`} // Highlight the held card
            initial={{ x: index * -200, y: 20 }}
            animate={{
              x: flipped ? index * 20 : 0, // Spread cards horizontally if not flipped
              y: 0,
              rotateY: flipped ? 180 : 0, // Flip the card 180 degrees on reveal
            }}
            transition={{ duration: 1 }} // Adjusted for smoother flip
            style={{ perspective: 1000 }} // Add perspective for better 3D flip effect
            onClick={() => highlightCard(index)} // Highlight the card when clicked
          >
            <motion.div
              className="w-full h-full flex justify-center items-center"
              style={{
                transformStyle: "preserve-3d", // Allow flipping
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", // Rotate 180 degrees on reveal
                transition: "transform 0.8s", // Flip animation duration
              }}
            >
              {/* Front side of the card (card face) */}
              <div className="w-full h-full flex justify-center items-center">
                {flipped ? (
                  <img
                    src={card.image}
                    alt={`${card.value} of ${card.suit}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex justify-center items-center bg-gray-800 rounded-xl"
                    style={{
                      backgroundImage:
                        "url('https://c8.alamy.com/comp/G2J706/playing-card-back-red-abstract-floral-pattern-closeup-G2J706.jpg')",
                      backgroundSize: "cover",
                    }}
                  >
                    <span className="text-4xl font-bold text-white">?</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Reveal Cards Button */}
      <div className="space-x-4">
        <button
          onClick={revealCards} // Reveal cards sequentially
          className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
        >
          Reveal Cards
        </button>
      </div>
    </div>
  );
};

export default CardDeck;
