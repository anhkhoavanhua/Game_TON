# Neon Brick Breaker - Backend API

Minimal backend API cho Neon Brick Breaker game.

## Features

- ✅ User management (Telegram auth)
- ✅ Score tracking & leaderboard
- ✅ Task verification
- ✅ Referral system
- ✅ Wallet connection bonus
- ✅ Basic anti-cheat
- ✅ In-memory database (MVP)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start Server

```bash
# Development
npm start

# Production
NODE_ENV=production npm start
```

### 3. Test API

```bash
# Health check
curl http://localhost:3000/health

# Create user
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"telegramId": "12345", "username": "TestUser"}'
```

## API Endpoints

### Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/stats` | Global stats |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user` | Get or create user |
| POST | `/api/user/update` | Update user data |

### Scores & Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scores/submit` | Submit game score |
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/leaderboard/rank/:telegramId` | Get user rank |

**Query params for leaderboard:**
- `period`: `all` (default), `weekly`, `daily`
- `limit`: Number of entries (default 100)

### Tasks & Rewards

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/verify` | Verify task completion |
| POST | `/api/referral` | Track referral |
| POST | `/api/wallet/connect` | Wallet connection bonus |

## Environment Variables

Create `.env` file:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

## Data Structure

### User Object

```javascript
{
  telegramId: string,
  username: string,
  coins: number,
  highScore: number,
  level: number,
  totalGamesPlayed: number,
  totalBricksDestroyed: number,
  maxCombo: number,
  walletAddress: string | null,
  completedTasks: string[],
  referrals: string[],
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### Score Object

```javascript
{
  telegramId: string,
  username: string,
  score: number,
  timestamp: number,
  gameData: {
    bricksDestroyed: number,
    timeElapsed: number,
    maxCombo: number
  }
}
```

## Migration to PostgreSQL

### Create Database

```sql
CREATE DATABASE neon_bricks;

CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(100),
    coins BIGINT DEFAULT 0,
    high_score INT DEFAULT 0,
    level INT DEFAULT 1,
    total_games_played INT DEFAULT 0,
    total_bricks_destroyed INT DEFAULT 0,
    max_combo INT DEFAULT 0,
    wallet_address VARCHAR(100),
    completed_tasks TEXT[],
    referrals BIGINT[],
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    score INT NOT NULL,
    game_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_users_high_score ON users(high_score DESC);
```

### Update .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neon_bricks
DB_USER=postgres
DB_PASSWORD=your_password
```

### Migrate Code

Replace in-memory `Map()` with PostgreSQL queries using `pg` library.

## Deployment

### Option 1: Railway.app (Free Tier)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Option 2: Render.com

1. Push to GitHub
2. Connect Render to repo
3. Add environment variables
4. Deploy

### Option 3: DigitalOcean

```bash
# SSH to droplet
ssh root@your_droplet_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clone repo
git clone https://github.com/anhkhoavanhua/neon-brick-game.git
cd neon-brick-game/backend

# Install dependencies
npm install

# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name neon-api

# Setup autostart
pm2 startup
pm2 save
```

## Cost Estimate

### Development (Local)

- Cost: **$0/month**
- Supports: Testing & development

### Production (1K-10K users)

**Railway.app / Render.com:**
- Free tier: **$0/month**
- Paid tier: **$5-10/month**

**DigitalOcean Droplet:**
- 1 vCPU, 1GB RAM: **$6/month**
- 2 vCPU, 2GB RAM: **$12/month**

**Managed PostgreSQL:**
- Render.com: **$7/month**
- DigitalOcean: **$15/month**

**Total:** $10-30/month cho 10K users

### Scale (100K+ users)

- Server: $50-200/month
- Database: $25-100/month
- CDN: $0-50/month
- **Total:** $75-350/month

## TODO

- [ ] Implement real Telegram auth verification
- [ ] Migrate to PostgreSQL
- [ ] Add rate limiting
- [ ] Implement task verification (check channel membership)
- [ ] Add caching (Redis)
- [ ] Setup monitoring (Sentry)
- [ ] Add tests
- [ ] CI/CD pipeline

## Support

Issues: https://github.com/anhkhoavanhua/neon-brick-game/issues
