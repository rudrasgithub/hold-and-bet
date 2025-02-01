export default function GameRules() {
    return (
      <div className="bg-gray-900 text-white flex flex-col items-center justify-center mt-2 rounded-md">
        <div className="max-w-screen-2xl bg-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-6">
            How Results are Calculated?
          </h2>
  
          <div className="space-y-6 text-lg">
            {/* Theme */}
            <h3 className="text-2xl font-semibold text-purple-300">1. Game Theme</h3>
            <p>
              Hold & Bet is a strategic card game where players **hold a card**, place bets, and reveal cards to win based on the lowest value.
            </p>
  
            {/* How to Play */}
            <h3 className="text-2xl font-semibold text-purple-300">2. How to Play</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Step 1:</strong> Start the game and **hold one card** before betting.</li>
              <li><strong>Step 2:</strong> Choose a **bet amount** and place bets on the remaining cards.</li>
              <li><strong>Step 3:</strong> Click **"Reveal Cards"** to see if your **held card is the lowest**.</li>
              <li><strong>Step 4:</strong> If your **held card is lower** than the bet card, **you win the bet**!</li>
            </ul>
  
            {/* Card Values */}
            <h3 className="text-2xl font-semibold text-purple-300">3. Card Values & Symbols</h3>
            <div className="grid grid-cols-5 gap-4 bg-gray-900 p-4 rounded-lg">
              {[
                { name: "2 - 10", value: "2-10", symbol: "🃏" },
                { name: "Jack", value: "11", symbol: "♠" },
                { name: "Queen", value: "12", symbol: "♥" },
                { name: "King", value: "13", symbol: "♦" },
                { name: "Ace", value: "14", symbol: "♣" },
              ].map((card, index) => (
                <div key={index} className="bg-gray-600 p-4 rounded-lg text-center">
                  <p className="text-2xl">{card.symbol}</p>
                  <p className="text-lg font-bold">{card.name}</p>
                  <p className="text-sm text-gray-300">Value: {card.value}</p>
                </div>
              ))}
            </div>
  
            {/* Betting Rules */}
            <h3 className="text-2xl font-semibold text-purple-300">4. Betting Rules</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Minimum bet amount: <strong>₹5</strong></li>
              <li>Maximum bet amount: <strong>Based on your balance</strong></li>
              <li>You **cannot** place bets on the card you are holding.</li>
            </ul>
  
            {/* Winning Logic */}
            <h3 className="text-2xl font-semibold text-purple-300">5. Winning Logic</h3>
            <p>Results are calculated based on the **comparison between the held card and the bet card**.</p>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-xl font-semibold text-green-400">Example:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Held Card:</strong> 10</li>
                <li><strong>Bet Card:</strong> 5</li>
                <li className="text-red-400"><strong>Result:</strong> Held card (10) is higher than bet card (5) → <strong>Loss</strong> ❌</li>
              </ul>
              <hr className="my-2 border-gray-500" />
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Held Card:</strong> 4</li>
                <li><strong>Bet Card:</strong> 9</li>
                <li className="text-green-400"><strong>Result:</strong> Held card (4) is lower than bet card (9) → <strong>Win</strong> ✅</li>
              </ul>
            </div>
  
            {/* Payouts */}
            <h3 className="text-2xl font-semibold text-purple-300">6. Winning & Payouts</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>If your **held card is the lowest**, you receive **double** your bet amount.</li>
              <li>If you lose, your **bet amount is deducted** from your balance.</li>
              <li>Payouts are calculated using **Random Number Generation (RNG)** for fairness.</li>
            </ul>
  
            {/* Fair Play */}
            <h3 className="text-2xl font-semibold text-purple-300">7. Fair Play</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>The game maintains **fair play with no backend manipulation or bots**.</li>
              <li>Hold & Bet is **for entertainment purposes only** – gambling is not allowed.</li>
            </ul>
  
            <div className="text-center mt-6">
              <p className="text-lg font-semibold text-green-400">
                Play smart, have fun, and test your strategy!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  