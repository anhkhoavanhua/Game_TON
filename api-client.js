/**
 * Neon Brick Breaker - API Client
 * Minimal backend integration
 */

class NeonBrickAPI {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
        this.telegramId = null;
        this.username = null;
    }

    /**
     * Initialize with Telegram user data
     */
    init(telegramUser) {
        if (telegramUser && telegramUser.id) {
            this.telegramId = telegramUser.id.toString();
            this.username = telegramUser.first_name || 'Player';
        }
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            // Return fallback response
            return { success: false, error: error.message };
        }
    }

    /**
     * Get or create user
     */
    async getUser() {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request('/api/user', {
            method: 'POST',
            body: JSON.stringify({
                telegramId: this.telegramId,
                username: this.username
            })
        });
    }

    /**
     * Update user data
     */
    async updateUser(data) {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request('/api/user/update', {
            method: 'POST',
            body: JSON.stringify({
                telegramId: this.telegramId,
                data
            })
        });
    }

    /**
     * Submit game score
     */
    async submitScore(score, gameData) {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request('/api/scores/submit', {
            method: 'POST',
            body: JSON.stringify({
                telegramId: this.telegramId,
                score,
                gameData: {
                    bricksDestroyed: gameData.bricksDestroyed || 0,
                    timeElapsed: gameData.timeElapsed || 0,
                    maxCombo: gameData.maxCombo || 0,
                    level: gameData.level || 1
                }
            })
        });
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(period = 'all', limit = 100) {
        return await this.request(`/api/leaderboard?period=${period}&limit=${limit}`);
    }

    /**
     * Get user rank
     */
    async getUserRank() {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request(`/api/leaderboard/rank/${this.telegramId}`);
    }

    /**
     * Verify task completion
     */
    async verifyTask(task) {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request('/api/tasks/verify', {
            method: 'POST',
            body: JSON.stringify({
                telegramId: this.telegramId,
                task
            })
        });
    }

    /**
     * Track referral
     */
    async trackReferral(referredId) {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request('/api/referral', {
            method: 'POST',
            body: JSON.stringify({
                referrerId: this.telegramId,
                referredId: referredId.toString()
            })
        });
    }

    /**
     * Wallet connection bonus
     */
    async connectWallet(walletAddress) {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        return await this.request('/api/wallet/connect', {
            method: 'POST',
            body: JSON.stringify({
                telegramId: this.telegramId,
                walletAddress
            })
        });
    }

    /**
     * Get global stats
     */
    async getStats() {
        return await this.request('/api/stats');
    }

    /**
     * Sync local data to server
     */
    async syncData(localData) {
        if (!this.telegramId) {
            return { success: false, error: 'No Telegram ID' };
        }

        // Get server data
        const serverResponse = await this.getUser();
        if (!serverResponse.success) {
            return serverResponse;
        }

        const serverData = serverResponse.user;

        // Merge logic: Keep higher values
        const mergedData = {
            coins: Math.max(localData.coins || 0, serverData.coins || 0),
            highScore: Math.max(localData.highScore || 0, serverData.highScore || 0),
            level: Math.max(localData.level || 1, serverData.level || 1),
            totalGamesPlayed: Math.max(localData.totalGamesPlayed || 0, serverData.totalGamesPlayed || 0),
            totalBricksDestroyed: Math.max(localData.totalBricksDestroyed || 0, serverData.totalBricksDestroyed || 0),
            maxCombo: Math.max(localData.maxCombo || 0, serverData.maxCombo || 0),
            walletAddress: localData.walletAddress || serverData.walletAddress
        };

        // Update server
        const updateResponse = await this.updateUser(mergedData);

        return {
            success: true,
            mergedData,
            serverData,
            localData
        };
    }
}

// Export for use in game
if (typeof window !== 'undefined') {
    window.NeonBrickAPI = NeonBrickAPI;
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeonBrickAPI;
}
