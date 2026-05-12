require('dotenv').config();
const express = require('express');
const TradingBot = require('./bot/tradingBot');

const app = express();
app.use(express.json());

let tradingBot = null;

// Initialize bot
app.post('/connect', async (req, res) => {
    try {
        const apiToken = process.env.DERIV_API_TOKEN;
        if (!apiToken) {
            return res.status(400).json({ error: 'DERIV_API_TOKEN not set in .env' });
        }

        tradingBot = new TradingBot(apiToken);
        await tradingBot.connect();
        res.json({ message: 'Connected to Deriv', status: 'connected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start trading
app.post('/start-trading', async (req, res) => {
    try {
        if (!tradingBot) {
            return res.status(400).json({ error: 'Bot not connected. Call /connect first' });
        }
        tradingBot.startTrading();
        res.json({ message: 'Trading started', status: 'running' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stop trading
app.post('/stop-trading', (req, res) => {
    try {
        if (!tradingBot) {
            return res.status(400).json({ error: 'Bot not connected' });
        }
        tradingBot.stopTrading();
        res.json({ message: 'Trading stopped', status: 'stopped' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get bot status
app.get('/status', (req, res) => {
    if (!tradingBot) {
        return res.json({ status: 'disconnected' });
    }
    res.json({
        status: tradingBot.isRunning ? 'running' : 'stopped',
        balance: tradingBot.balance,
        totalTrades: tradingBot.tradeCount,
        wins: tradingBot.wins,
        losses: tradingBot.losses,
        winRate: tradingBot.getWinRate()
    });
});

// Get trade history
app.get('/trades', (req, res) => {
    if (!tradingBot) {
        return res.json({ trades: [] });
    }
    res.json({
        trades: tradingBot.tradeHistory,
        totalTrades: tradingBot.tradeCount
    });
});

// Get account balance
app.get('/balance', (req, res) => {
    if (!tradingBot) {
        return res.status(400).json({ error: 'Bot not connected' });
    }
    res.json({
        balance: tradingBot.balance,
        currency: tradingBot.currency
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Deriv Trading Bot API 🚀',
        endpoints: {
            'POST /connect': 'Connect to Deriv API',
            'POST /start-trading': 'Start trading',
            'POST /stop-trading': 'Stop trading',
            'GET /status': 'Get bot status',
            'GET /trades': 'Get trade history',
            'GET /balance': 'Get account balance'
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Deriv Trading Bot API running on port ${PORT}`);
});
