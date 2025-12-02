const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (temporary - will migrate to PostgreSQL later)
let users = new Map();
let scores = [];

// Telegram Web App data verification (simplified for MVP)
function verifyTelegramData(initData) {
    // TODO: Implement real verification with bot token
    // For now, accept all requests
    return true;
}

// ============ API ENDPOINTS ============

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Get or create user
app.post('/api/user', (req, res) => {
    const { telegramId, username, initData } = req.body;

    if (!telegramId) {
        return res.status(400).json({ error: 'Telegram ID required' });
    }

    // Get or create user
    if (!users.has(telegramId)) {
        users.set(telegramId, {
            telegramId,
            username: username || 'Anonymous',
            coins: 0,
            highScore: 0,
            level: 1,
            totalGamesPlayed: 0,
            totalBricksDestroyed: 0,
            maxCombo: 0,
            walletAddress: null,
            createdAt: Date.now(),
            lastLogin: Date.now()
        });
    } else {
        // Update last login
        const user = users.get(telegramId);
        user.lastLogin = Date.now();
        user.username = username || user.username;
    }

    res.json({
        success: true,
        user: users.get(telegramId)
    });
});

// Update user data
app.post('/api/user/update', (req, res) => {
    const { telegramId, data } = req.body;

    if (!telegramId || !users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users.get(telegramId);

    // Update allowed fields
    if (data.coins !== undefined) user.coins = data.coins;
    if (data.highScore !== undefined && data.highScore > user.highScore) {
        user.highScore = data.highScore;
    }
    if (data.level !== undefined) user.level = data.level;
    if (data.totalGamesPlayed !== undefined) user.totalGamesPlayed = data.totalGamesPlayed;
    if (data.totalBricksDestroyed !== undefined) user.totalBricksDestroyed = data.totalBricksDestroyed;
    if (data.maxCombo !== undefined && data.maxCombo > user.maxCombo) {
        user.maxCombo = data.maxCombo;
    }
    if (data.walletAddress) user.walletAddress = data.walletAddress;

    res.json({
        success: true,
        user
    });
});

// Submit score
app.post('/api/scores/submit', (req, res) => {
    const { telegramId, score, gameData } = req.body;

    if (!telegramId || !score) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Basic anti-cheat validation
    if (gameData) {
        const { bricksDestroyed, timeElapsed } = gameData;

        // Check if score is reasonable
        const maxPossible = (bricksDestroyed || 0) * 30;
        if (score > maxPossible * 2) {
            return res.status(400).json({ error: 'Invalid score' });
        }

        // Check time is reasonable (at least 10 seconds)
        if (timeElapsed && timeElapsed < 10) {
            return res.status(400).json({ error: 'Invalid game time' });
        }
    }

    // Save score
    scores.push({
        telegramId,
        username: users.get(telegramId).username,
        score,
        timestamp: Date.now(),
        gameData
    });

    // Update user high score
    const user = users.get(telegramId);
    if (score > user.highScore) {
        user.highScore = score;
    }
    user.totalGamesPlayed++;

    res.json({
        success: true,
        highScore: user.highScore
    });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    const { period = 'all', limit = 100 } = req.query;

    let filteredScores = [...scores];

    // Filter by period
    if (period === 'weekly') {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        filteredScores = filteredScores.filter(s => s.timestamp > weekAgo);
    } else if (period === 'daily') {
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        filteredScores = filteredScores.filter(s => s.timestamp > dayAgo);
    }

    // Get unique high scores per user
    const userHighScores = new Map();
    filteredScores.forEach(score => {
        const current = userHighScores.get(score.telegramId);
        if (!current || score.score > current.score) {
            userHighScores.set(score.telegramId, score);
        }
    });

    // Sort and limit
    const leaderboard = Array.from(userHighScores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, parseInt(limit))
        .map((entry, index) => ({
            rank: index + 1,
            username: entry.username,
            score: entry.score,
            timestamp: entry.timestamp
        }));

    res.json({
        success: true,
        leaderboard,
        total: userHighScores.size
    });
});

// Get user rank
app.get('/api/leaderboard/rank/:telegramId', (req, res) => {
    const { telegramId } = req.params;

    if (!users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users.get(telegramId);

    // Get all unique high scores
    const userHighScores = new Map();
    scores.forEach(score => {
        const current = userHighScores.get(score.telegramId);
        if (!current || score.score > current.score) {
            userHighScores.set(score.telegramId, score);
        }
    });

    // Sort by score
    const sortedScores = Array.from(userHighScores.values())
        .sort((a, b) => b.score - a.score);

    // Find user rank
    const rank = sortedScores.findIndex(s => s.telegramId === telegramId) + 1;

    res.json({
        success: true,
        rank: rank || null,
        score: user.highScore,
        total: sortedScores.length
    });
});

// Verify task completion
app.post('/api/tasks/verify', async (req, res) => {
    const { telegramId, task } = req.body;

    if (!telegramId || !users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users.get(telegramId);

    // Initialize tasks array if not exists
    if (!user.completedTasks) {
        user.completedTasks = [];
    }

    // Check if already completed
    if (user.completedTasks.includes(task)) {
        return res.json({
            success: false,
            error: 'Task already completed'
        });
    }

    // Task rewards
    const rewards = {
        'channel': 500,
        'twitter': 300,
        'invite': 1000,
        'daily_5_games': 200
    };

    const reward = rewards[task] || 0;

    // TODO: Implement real verification
    // For MVP, auto-approve after short delay (client-side)

    // Mark task as completed
    user.completedTasks.push(task);
    user.coins += reward;

    res.json({
        success: true,
        reward,
        totalCoins: user.coins
    });
});

// Track referral
app.post('/api/referral', (req, res) => {
    const { referrerId, referredId } = req.body;

    if (!referrerId || !referredId) {
        return res.status(400).json({ error: 'Missing IDs' });
    }

    if (!users.has(referrerId)) {
        return res.status(404).json({ error: 'Referrer not found' });
    }

    const referrer = users.get(referrerId);

    // Initialize referrals array
    if (!referrer.referrals) {
        referrer.referrals = [];
    }

    // Check if already referred
    if (referrer.referrals.includes(referredId)) {
        return res.json({
            success: false,
            error: 'Already referred'
        });
    }

    // Add referral
    referrer.referrals.push(referredId);
    referrer.coins += 1000;

    res.json({
        success: true,
        reward: 1000,
        totalCoins: referrer.coins,
        totalReferrals: referrer.referrals.length
    });
});

// Wallet connection bonus
app.post('/api/wallet/connect', (req, res) => {
    const { telegramId, walletAddress } = req.body;

    if (!telegramId || !users.has(telegramId)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users.get(telegramId);

    // Check if already connected
    if (user.walletAddress) {
        return res.json({
            success: false,
            error: 'Wallet already connected'
        });
    }

    // Grant connection bonus
    user.walletAddress = walletAddress;
    user.coins += 1000;

    res.json({
        success: true,
        reward: 1000,
        totalCoins: user.coins
    });
});

// Get stats
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalUsers: users.size,
            totalScores: scores.length,
            totalGames: Array.from(users.values()).reduce((sum, u) => sum + (u.totalGamesPlayed || 0), 0),
            totalBricks: Array.from(users.values()).reduce((sum, u) => sum + (u.totalBricksDestroyed || 0), 0)
        }
    });
});

// ============ START SERVER ============

app.listen(PORT, () => {
    console.log(`🚀 Neon Brick Breaker API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🎮 Ready to serve ${users.size} users`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
