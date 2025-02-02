"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const gameRouter_1 = __importDefault(require("./routes/gameRouter"));
const walletRouter_1 = __importDefault(require("./routes/walletRouter"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const allowedOrigins = process.env.FRONTEND_URL;
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));
app.use(body_parser_1.default.json());
if (process.env.NODE_ENV === 'production') {
    app.use((0, morgan_1.default)('combined'));
}
else {
    app.use((0, morgan_1.default)('dev'));
}
app.use('/api/games', gameRouter_1.default);
app.use('/api/wallet', walletRouter_1.default);
app.use('/api', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
