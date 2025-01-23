# Hold & Bet: Card Clash 🎴💰

**Hold & Bet: Card Clash** is a multiplayer card game where players strategically hold one card and place bets on three decks, competing for rewards based on game outcomes. It features real-time updates, secure wallet transactions, and dynamic animations for an immersive gaming experience.

---

## 🚀 **Features**

- **Strategic Gameplay**: Hold one card and place bets on three decks.
- **Integrated Wallet**: Secure transactions via Stripe/PayPal for deposits, withdrawals, and betting.
- **Real-Time Updates**: WebSocket-based gameplay for live updates on wins and losses.
- **Dynamic Animations**: Immersive animations for shuffling, deck displays, and live results.
- **Secure Data Handling**: 
  - PostgreSQL database with Prisma ORM for complex relationships.
  - JWT-based authentication for user security.

---

## 🛠️ **Tech Stack**

- **Frontend**: [React.js](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT, OAuth
- **Real-Time Communication**: WebSockets, Redis
- **Payment Integration**: Stripe

---

## 🔗 **How to Run the Project**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rudrasgithub/hold-and-bet.git
   cd hold-and-bet
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```

4. **Run the Development Server**
   ```bash
   pnpm run dev
   ```

5. **Access the Game**
   Open your browser and go to [http://localhost:3000](http://localhost:3000).

---

## 🎨 **Screenshots**

1. **Home Screen**
   ![Home Screen](./screenshots/home.png)

2. **Gameplay**
   ![Gameplay](./screenshots/gameplay.png)

---

## 💃 **Folder Structure**

```
hold-and-bet/
├── frontend/
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── services/
  │   ├── utils/
  ├── .env
  ├── package.json
└── README.md
├── backend/
```

---

## 🛡️ **Security Features**

- Encrypted wallet transactions via Stripe.
- JWT-based authentication for secure user access.
- Data integrity ensured with PostgreSQL and Prisma ORM.

---

## 🛠️ **Development Tools**

- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git, GitHub

---

## 📝 **License**

This project is licensed under the [MIT License](LICENSE).

---

## 📧 **Contact**

For any queries or contributions, reach out to:  
**Your Name**: [Email](mailto:rudramanaidu99@gmail.com)  
GitHub: [](https://github.com/rudrasgithub)
