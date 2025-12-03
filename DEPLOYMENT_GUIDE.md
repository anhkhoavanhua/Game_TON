# 🚀 HƯỚNG DẪN DEPLOY & KIẾM TIỀN TỪ NEON BRICK BREAKER

## 📋 MỤC LỤC
1. [Tổng quan chiến lược](#-tổng-quan-chiến-lược)
2. [Phase 1: Deploy Game lên Telegram](#-phase-1-deploy-game-lên-telegram-chi-phí-0)
3. [Phase 2: Setup Backend](#-phase-2-setup-backend-free)
4. [Phase 3: Scale & Marketing](#-phase-3-scale--marketing)
5. [Phase 4: Monetize (Kiếm tiền)](#-phase-4-monetize-kiếm-tiền)
6. [Chi phí & Timeline](#-chi-phí--timeline)
7. [Checklist](#-checklist-tổng-hợp)

---

## 🎯 TỔNG QUAN CHIẾN LƯỢC

### Nguyên tắc: FREE FIRST, MONETIZE LATER

```
┌─────────────────────────────────────────────────────────────┐
│  User < 10K   →  FREE hoàn toàn, focus tăng user           │
│  User 10K-50K →  Thêm Ads nhẹ (không ép buộc)              │
│  User > 50K   →  Monetize mạnh (Ads, IAP, Token)           │
└─────────────────────────────────────────────────────────────┘
```

### Chi phí ban đầu: $0

| Hạng mục | Chi phí | Giải pháp |
|----------|---------|-----------|
| Hosting Game | $0 | GitHub Pages |
| Database | $0 | Supabase Free (50K users) |
| Backend API | $0 | Supabase / Vercel Free |
| Telegram Bot | $0 | Free |
| Domain | $0 | Dùng github.io |

---

## 📱 PHASE 1: DEPLOY GAME LÊN TELEGRAM (Chi phí: $0)

### Bước 1.1: Bật GitHub Pages

1. Vào repo: https://github.com/anhkhoavanhua/Game_TON
2. Click **Settings** → **Pages** (menu bên trái)
3. **Source**: Deploy from a branch
4. **Branch**: chọn `Anh_tester1` → folder `/ (root)`
5. Click **Save**
6. Đợi 2-5 phút

**URL Game sau khi deploy:**
```
https://anhkhoavanhua.github.io/Game_TON/NeonBrick.html
```

### Bước 1.2: Tạo Bot Telegram

1. Mở Telegram, tìm **@BotFather**
2. Gửi: `/newbot`
3. Nhập tên bot: `Neon Brick Game`
4. Nhập username: `NeonBrickGameBot` (phải unique, có đuôi Bot)
5. **LƯU LẠI BOT TOKEN** (dạng: `123456789:ABCdefGHI...`)

### Bước 1.3: Tạo Mini App

1. Gửi cho **@BotFather**: `/newapp`
2. Chọn bot vừa tạo
3. Điền thông tin:

```
Title:        Neon Brick Breaker
Description:  Play-to-Earn Brick Breaker Game on TON
Photo:        Upload ảnh 640x360px (game screenshot)
GIF:          Gửi /empty để skip
Web App URL:  https://anhkhoavanhua.github.io/Game_TON/NeonBrick.html
Short name:   play
```

### Bước 1.4: Thêm Menu Button

1. Gửi **@BotFather**: `/setmenubutton`
2. Chọn bot của bạn
3. Nhập URL: `https://anhkhoavanhua.github.io/Game_TON/NeonBrick.html`
4. Nhập text: `🎮 Play Game`

### Bước 1.5: Tạo icon.png cho TON Connect

Cần tạo file `icon.png` (192x192px) và push lên repo.

**Cách tạo nhanh:**
- Dùng Canva.com (free)
- Hoặc AI generate (DALL-E, Midjourney)
- Hoặc dùng emoji làm icon tạm

### Bước 1.6: Test Game

1. Mở Telegram
2. Tìm bot: `@NeonBrickGameBot` (hoặc username bạn đặt)
3. Bấm **Start** hoặc **🎮 Play Game**
4. Game sẽ mở trong Telegram!

---

## 🗄️ PHASE 2: SETUP BACKEND (FREE)

### Option A: Supabase (RECOMMENDED)

**Tại sao chọn Supabase?**
- Free tier: 50,000 users, 500MB database
- Setup nhanh (15 phút)
- Có sẵn Auth, Database, Realtime API
- Dashboard quản lý dễ dùng
- Không cần maintain server

#### Bước 2.1: Tạo tài khoản Supabase

1. Vào https://supabase.com
2. Sign up bằng GitHub
3. Click **New Project**
4. Điền thông tin:
   - Name: `neon-brick-game`
   - Database Password: (tạo password mạnh, LƯU LẠI)
   - Region: `Southeast Asia (Singapore)`
5. Click **Create Project** (đợi 2 phút)

#### Bước 2.2: Tạo Database Tables

Vào **SQL Editor** → chạy script sau:

```sql
-- Bảng Users
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    coins INTEGER DEFAULT 0,
    high_score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_games_played INTEGER DEFAULT 0,
    total_bricks_destroyed INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    max_lives INTEGER DEFAULT 3,
    paddle_level INTEGER DEFAULT 0,
    speed_level INTEGER DEFAULT 0,
    multi_level INTEGER DEFAULT 0,
    bombs INTEGER DEFAULT 0,
    shields INTEGER DEFAULT 0,
    doubles INTEGER DEFAULT 0,
    current_skin VARCHAR(50) DEFAULT 'neon',
    unlocked_skins TEXT[] DEFAULT ARRAY['neon'],
    wallet_address VARCHAR(255),
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(20),
    daily_streak INTEGER DEFAULT 0,
    last_daily_claim DATE,
    tasks_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Scores (Leaderboard)
CREATE TABLE scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    telegram_id BIGINT NOT NULL,
    username VARCHAR(255),
    score INTEGER NOT NULL,
    bricks_destroyed INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Referrals
CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index để query nhanh
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_scores_score ON scores(score DESC);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);

-- Function tự động update updated_at
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

-- Row Level Security (bảo mật)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy cho phép đọc public (leaderboard)
CREATE POLICY "Scores are viewable by everyone" ON scores
    FOR SELECT USING (true);

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true);
```

#### Bước 2.3: Lấy API Keys

1. Vào **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (dài)

#### Bước 2.4: Tích hợp vào Game

Thêm vào file `NeonBrick.html`:

```html
<!-- Supabase SDK -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>

<script>
// === SUPABASE CONFIG ===
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === DATABASE FUNCTIONS ===

// Lấy hoặc tạo user
async function getOrCreateUser(telegramUser) {
    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

    if (existingUser) {
        return existingUser;
    }

    // Tạo user mới
    const referralCode = 'NB' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            referral_code: referralCode
        })
        .select()
        .single();

    return newUser;
}

// Sync data lên server
async function syncToServer() {
    if (!currentUser) return;

    const { error } = await supabase
        .from('users')
        .update({
            coins: playerData.coins,
            high_score: playerData.highScore,
            level: playerData.level,
            total_games_played: playerData.totalGamesPlayed,
            total_bricks_destroyed: playerData.totalBricksDestroyed,
            max_combo: playerData.maxCombo,
            max_lives: playerData.maxLives,
            paddle_level: playerData.paddleLevel,
            speed_level: playerData.speedLevel,
            multi_level: playerData.multiLevel,
            bombs: playerData.bombs,
            shields: playerData.shields,
            doubles: playerData.doubles,
            current_skin: playerData.currentSkin,
            unlocked_skins: playerData.unlockedSkins,
            daily_streak: playerData.dailyStreak,
            tasks_completed: playerData.tasksCompleted
        })
        .eq('telegram_id', currentUser.telegram_id);

    if (error) console.error('Sync error:', error);
}

// Submit score
async function submitScore(score, gameData) {
    if (!currentUser) return;

    const { error } = await supabase
        .from('scores')
        .insert({
            user_id: currentUser.id,
            telegram_id: currentUser.telegram_id,
            username: currentUser.username,
            score: score,
            bricks_destroyed: gameData.bricksDestroyed,
            max_combo: gameData.maxCombo,
            level: gameData.level
        });

    if (error) console.error('Score submit error:', error);
}

// Lấy leaderboard
async function getLeaderboard(type = 'all') {
    let query = supabase
        .from('scores')
        .select('username, score, max_combo, created_at')
        .order('score', { ascending: false })
        .limit(100);

    if (type === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
    } else if (type === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
    }

    const { data, error } = await query;
    return data || [];
}

// Xử lý referral
async function handleReferral(referralCode) {
    if (!currentUser || currentUser.referred_by) return;

    // Tìm người giới thiệu
    const { data: referrer } = await supabase
        .from('users')
        .select('id, telegram_id')
        .eq('referral_code', referralCode)
        .single();

    if (!referrer || referrer.telegram_id === currentUser.telegram_id) return;

    // Cập nhật referred_by
    await supabase
        .from('users')
        .update({ referred_by: referralCode })
        .eq('telegram_id', currentUser.telegram_id);

    // Tạo referral record
    await supabase
        .from('referrals')
        .insert({
            referrer_id: referrer.id,
            referred_id: currentUser.id
        });

    // Thưởng cho cả 2
    await supabase.rpc('add_referral_bonus', {
        referrer_telegram_id: referrer.telegram_id,
        referred_telegram_id: currentUser.telegram_id,
        bonus: 1000
    });
}
</script>
```

#### Bước 2.5: Tạo Stored Procedure cho Referral Bonus

Chạy SQL này trong Supabase:

```sql
CREATE OR REPLACE FUNCTION add_referral_bonus(
    referrer_telegram_id BIGINT,
    referred_telegram_id BIGINT,
    bonus INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Cộng bonus cho người giới thiệu
    UPDATE users SET coins = coins + bonus
    WHERE telegram_id = referrer_telegram_id;

    -- Cộng bonus cho người được giới thiệu
    UPDATE users SET coins = coins + bonus
    WHERE telegram_id = referred_telegram_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Option B: Railway (Dùng Backend có sẵn)

Nếu muốn dùng backend Node.js trong folder `/backend`:

1. Vào https://railway.app
2. Sign up bằng GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Chọn repo `Game_TON`, folder `backend`
5. Thêm **PostgreSQL** database
6. Set environment variables:
   ```
   DATABASE_URL=<auto từ Railway>
   PORT=3000
   NODE_ENV=production
   ```
7. Deploy!

**Free tier**: $5 credit/tháng (đủ cho ~10K users)

---

## 📈 PHASE 3: SCALE & MARKETING

### Kênh Marketing (Free)

| Kênh | Cách làm | Kỳ vọng |
|------|----------|---------|
| **Telegram Groups** | Post vào các group gaming/crypto | 100-500 users/ngày |
| **Twitter/X** | Tweet daily, hashtags #TON #P2E #TelegramGames | 50-200 users/ngày |
| **TikTok** | Video gameplay ngắn | 500-2000 users/video viral |
| **Reddit** | Post r/TON, r/CryptoGaming | 100-300 users/post |
| **Discord** | Tạo server, collab với projects khác | Community building |

### Chiến lược Viral

1. **Referral System** (đã có trong game)
   - User invite bạn → cả 2 được 1000 coins
   - Tạo động lực chia sẻ

2. **Leaderboard Competition**
   - Weekly tournament
   - Top 10 được prize (coins bonus)

3. **Social Tasks**
   - Follow Twitter → +300 coins
   - Join Telegram Channel → +500 coins
   - Share game → +200 coins

### Tạo Social Channels

1. **Telegram Channel**: `@NeonBrickGame`
   - Post updates, events, tips

2. **Telegram Group**: `@NeonBrickChat`
   - Community chat, support

3. **Twitter**: `@NeonBrickGame`
   - Daily posts, memes, updates

---

## 💰 PHASE 4: MONETIZE (Kiếm tiền)

### Khi nào bắt đầu monetize?

```
✅ User > 10,000 → Bắt đầu xem xét
✅ User > 50,000 → Monetize mạnh
✅ User > 100,000 → Launch Token
```

### Các nguồn thu

#### 1. Quảng cáo (Adsgram) - Dễ nhất

```javascript
// Khi có đủ user, thêm vào game:
// User xem ad để nhận extra life hoặc coins

const AdController = window.Adsgram?.init({ blockId: "your-block-id" });

function watchAdForReward() {
    AdController?.show().then(() => {
        playerData.coins += 500;
        saveData();
        showToast('+500 Coins từ quảng cáo!', 'success');
    }).catch(() => {
        showToast('Không có quảng cáo, thử lại sau!', 'warning');
    });
}
```

**Thu nhập ước tính:**
- 10K users: $50-200/tháng
- 100K users: $500-2000/tháng
- 1M users: $5000-20000/tháng

#### 2. In-App Purchase (TON/Stars)

```javascript
// Mua coins bằng TON
const PACKAGES = [
    { coins: 10000, price: 0.5, label: '10K Coins' },
    { coins: 50000, price: 2, label: '50K Coins' },
    { coins: 200000, price: 5, label: '200K Coins' },
];

async function buyCoins(packageIndex) {
    const pkg = PACKAGES[packageIndex];

    // Gửi transaction qua TON Connect
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
            address: "YOUR_WALLET_ADDRESS",
            amount: (pkg.price * 1e9).toString() // TON to nanoTON
        }]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
        playerData.coins += pkg.coins;
        saveData();
        syncToServer();
        showToast(`+${pkg.coins} Coins!`, 'success');
    } catch (e) {
        showToast('Giao dịch thất bại!', 'error');
    }
}
```

#### 3. Token Launch (Advanced)

Khi có >100K users:

1. **Tạo Token $NEON trên TON**
2. **Tokenomics:**
   ```
   Total Supply: 1,000,000,000 $NEON

   40% - Play-to-Earn Rewards
   20% - Team (vesting 2 năm)
   20% - Marketing & Partnerships
   15% - Liquidity Pool
   5%  - Advisors
   ```

3. **List trên DEX**: STON.fi, DeDust
4. **Airdrop**: Cho early users dựa trên coins họ có

---

## 💵 CHI PHÍ & TIMELINE

### Chi phí theo Phase

| Phase | Thời gian | Chi phí | Mục tiêu |
|-------|-----------|---------|----------|
| **Phase 1** | Tuần 1 | $0 | Deploy game, 100 users test |
| **Phase 2** | Tuần 2-3 | $0 | Backend, 1000 users |
| **Phase 3** | Tháng 1-2 | $0-50 | Marketing, 10K users |
| **Phase 4** | Tháng 3+ | $100-500 | Monetize, 50K+ users |

### Khi nào cần chi tiền?

| Hạng mục | Khi nào | Chi phí |
|----------|---------|---------|
| Domain (.com) | User > 5K | $10-15/năm |
| Hosting nâng cấp | User > 50K | $20-50/tháng |
| Marketing ads | Khi cần scale nhanh | $100-1000 |
| Token launch | User > 100K | $500-2000 |

---

## ✅ CHECKLIST TỔNG HỢP

### Phase 1: Deploy (Tuần 1)
```
[ ] Bật GitHub Pages cho branch Anh_tester1
[ ] Test URL: anhkhoavanhua.github.io/Game_TON/NeonBrick.html
[ ] Tạo Bot Telegram với @BotFather
[ ] Tạo Mini App (/newapp)
[ ] Set Menu Button (/setmenubutton)
[ ] Test game trên Telegram mobile
[ ] Tạo icon.png (192x192) cho TON Connect
[ ] Push icon.png lên repo
```

### Phase 2: Backend (Tuần 2)
```
[ ] Tạo tài khoản Supabase
[ ] Tạo database tables (chạy SQL)
[ ] Lấy API keys
[ ] Tích hợp Supabase vào game
[ ] Test sync data
[ ] Test leaderboard
[ ] Test referral system
```

### Phase 3: Marketing (Tháng 1-2)
```
[ ] Tạo Telegram Channel @NeonBrickGame
[ ] Tạo Telegram Group @NeonBrickChat
[ ] Tạo Twitter @NeonBrickGame
[ ] Post đầu tiên trên các kênh
[ ] Invite bạn bè test (50-100 người)
[ ] Post vào các Telegram groups gaming
[ ] Tạo video TikTok gameplay
[ ] Theo dõi số user hàng ngày
```

### Phase 4: Monetize (Khi có 10K+ users)
```
[ ] Đăng ký Adsgram
[ ] Tích hợp ads vào game
[ ] Setup TON payment
[ ] Tạo packages mua coins
[ ] (Optional) Chuẩn bị token launch
```

---

## 📞 LIÊN HỆ & RESOURCES

### Links hữu ích
- Supabase Docs: https://supabase.com/docs
- TON Docs: https://docs.ton.org
- Telegram Bot API: https://core.telegram.org/bots/api
- Adsgram: https://adsgram.ai
- STON.fi (DEX): https://ston.fi

### Tools
- Canva (tạo graphics): https://canva.com
- TonViewer (xem transactions): https://tonviewer.com
- Telegram Bot Analytics: @BotAnalyticsBot

---

## 🎉 GOOD LUCK!

Bắt đầu từ Phase 1, làm từng bước một.
Khi có 10K users, quay lại đọc Phase 4 để monetize!

**Tip**: Focus vào việc tạo game hay, user sẽ tự viral.
Đừng vội monetize khi chưa có đủ users.
