-- =====================================================
-- NEON BRICK BREAKER - SUPABASE DATABASE SETUP
-- =====================================================
-- Chạy script này trong Supabase SQL Editor
-- URL: https://darzwbsnqyxmkkpqffqg.supabase.co
-- =====================================================

-- Drop tables nếu đã tồn tại (để chạy lại script)
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 1. BẢNG USERS
-- =====================================================
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),

    -- Economy
    coins INTEGER DEFAULT 0 CHECK (coins >= 0),

    -- Progression
    high_score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,

    -- Stats
    total_games_played INTEGER DEFAULT 0,
    total_bricks_destroyed INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,

    -- Upgrades
    max_lives INTEGER DEFAULT 3,
    paddle_level INTEGER DEFAULT 0,
    speed_level INTEGER DEFAULT 0,
    multi_level INTEGER DEFAULT 0,

    -- Power-up Inventory
    bombs INTEGER DEFAULT 0,
    shields INTEGER DEFAULT 0,
    doubles INTEGER DEFAULT 0,

    -- Cosmetics
    current_skin VARCHAR(50) DEFAULT 'neon',
    unlocked_skins TEXT[] DEFAULT ARRAY['neon'],

    -- Blockchain
    wallet_address VARCHAR(255),
    wallet_connected BOOLEAN DEFAULT FALSE,

    -- Referral System
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by VARCHAR(20),

    -- Daily Activity
    daily_streak INTEGER DEFAULT 0,
    last_daily_claim DATE,
    last_play_date DATE,
    games_played_today INTEGER DEFAULT 0,

    -- Tasks
    tasks_completed TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. BẢNG SCORES (Leaderboard)
-- =====================================================
CREATE TABLE scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    username VARCHAR(255),

    -- Score Data
    score INTEGER NOT NULL CHECK (score >= 0),
    bricks_destroyed INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    time_elapsed INTEGER DEFAULT 0,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BẢNG REFERRALS
-- =====================================================
CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Reward tracking
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_amount INTEGER DEFAULT 1000,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint: một user chỉ được refer bởi 1 người
    UNIQUE(referred_id)
);

-- =====================================================
-- 4. INDEXES (Tăng tốc query)
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_high_score ON users(high_score DESC);
CREATE INDEX idx_users_coins ON users(coins DESC);

-- Scores indexes
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_scores_telegram_id ON scores(telegram_id);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_user_id ON scores(user_id);

-- Referrals indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 6. STORED PROCEDURES
-- =====================================================

-- Add referral bonus to both users
CREATE OR REPLACE FUNCTION add_referral_bonus(
    referrer_telegram_id BIGINT,
    referred_telegram_id BIGINT,
    bonus INTEGER DEFAULT 1000
)
RETURNS VOID AS $$
BEGIN
    -- Cộng bonus cho người giới thiệu
    UPDATE users
    SET coins = coins + bonus
    WHERE telegram_id = referrer_telegram_id;

    -- Cộng bonus cho người được giới thiệu
    UPDATE users
    SET coins = coins + bonus
    WHERE telegram_id = referred_telegram_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user rank
CREATE OR REPLACE FUNCTION get_user_rank(user_telegram_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO user_rank
    FROM users
    WHERE high_score > (
        SELECT high_score
        FROM users
        WHERE telegram_id = user_telegram_id
    );

    RETURN user_rank;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (true);

-- Scores policies
CREATE POLICY "Scores are viewable by everyone"
    ON scores FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert scores"
    ON scores FOR INSERT
    WITH CHECK (true);

-- Referrals policies
CREATE POLICY "Referrals are viewable by everyone"
    ON referrals FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert referrals"
    ON referrals FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 8. TEST DATA (Optional - để test)
-- =====================================================

-- Insert test user
INSERT INTO users (
    telegram_id,
    username,
    first_name,
    coins,
    high_score,
    referral_code
) VALUES (
    123456789,
    'test_player',
    'Test Player',
    5000,
    10000,
    'NBTEST01'
) ON CONFLICT (telegram_id) DO NOTHING;

-- Insert test scores
INSERT INTO scores (
    telegram_id,
    username,
    score,
    bricks_destroyed,
    max_combo,
    level
) VALUES
    (123456789, 'test_player', 10000, 150, 45, 5),
    (123456789, 'test_player', 8500, 120, 38, 4),
    (123456789, 'test_player', 7200, 100, 32, 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. VIEWS (Optional - để query dễ hơn)
-- =====================================================

-- View: Top players
CREATE OR REPLACE VIEW top_players AS
SELECT
    username,
    high_score,
    level,
    coins,
    total_games_played,
    created_at
FROM users
ORDER BY high_score DESC
LIMIT 100;

-- View: Recent scores
CREATE OR REPLACE VIEW recent_scores AS
SELECT
    s.username,
    s.score,
    s.bricks_destroyed,
    s.max_combo,
    s.level,
    s.created_at
FROM scores s
ORDER BY s.created_at DESC
LIMIT 100;

-- View: Leaderboard với rank
CREATE OR REPLACE VIEW leaderboard AS
SELECT
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
    username,
    score,
    max_combo,
    level,
    created_at
FROM scores
ORDER BY score DESC;

-- =====================================================
-- DONE!
-- =====================================================
-- Database đã sẵn sàng sử dụng!
-- Kiểm tra bằng cách chạy:
-- SELECT * FROM users;
-- SELECT * FROM scores;
-- SELECT * FROM referrals;
-- =====================================================
