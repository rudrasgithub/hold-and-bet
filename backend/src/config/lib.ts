export const validHoldValues = ['Card1', 'Card2', 'Card3', 'Card4', 'None'];

export const cardRecord: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  Jack: 11,
  Queen: 12,
  King: 13,
  Ace: 14,
};

const cardSuits = ['Hearts', 'Spades', 'Diamonds', 'Clubs'];
const cardValues = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Jack',
  'Queen',
  'King',
  'Ace',
];

function getRandomCard() {
  const suit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
  const value = cardValues[Math.floor(Math.random() * cardValues.length)];
  return { suit, value };
}

export function generateRandomCards() {
  const cards: Record<string, { suit: string; value: string }> = {};

  for (let i = 1; i <= 4; i++) {
    cards[`Card${i}`] = getRandomCard();
  }

  return cards;
}
