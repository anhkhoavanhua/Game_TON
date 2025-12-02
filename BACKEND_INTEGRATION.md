# 🔌 Backend Integration Guide

Hướng dẫn tích hợp backend API vào Neon Brick Breaker game.

---

## 📋 Quick Summary

Bạn có 2 options:

1. **LocalStorage Only** (Hiện tại) - Không cần backend, mỗi người độc lập
2. **Backend Integration** (Recommended) - Real leaderboard, sync data, anti-cheat

---

## 🚀 Option 1: Keep LocalStorage (No Changes)

**Pros:**
- ✅ Miễn phí hoàn toàn
- ✅ Deploy ngay GitHub Pages
- ✅ Không cần maintain server

**Cons:**
- ❌ Leaderboard giả
- ❌ Dễ cheat
- ❌ Không có coin economy thật

**Use case:** Beta testing, demo, portfolio

---

## 💎 Option 2: Integrate Backend (Recommended)

### Step 1: Add API Client vào HTML

Mở `NeonBrick.html`, thêm **TRƯỚC thẻ `</body>`**:

```html
<!-- API Client -->
<script src="api-client.js"></script>
<script>
    // Initialize API
    const api = new NeonBrickAPI('http://localhost:3000'); // Đổi URL khi deploy

    // Initialize with Telegram user
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        api.init(tg.initDataUnsafe.user);
    }
</script>
```

### Step 2: Sync Data Khi Game Load

Thêm vào function `loadData()` (tìm dòng ~1350):

```javascript
// Existing loadData function
function loadData() {
    const saved = localStorage.getItem('neon_breaker_v2');
    // ... existing code ...

    // ===== THÊM ĐOẠN NÀY =====
    // Sync with backend if available
    if (typeof api !== 'undefined' && api.telegramId) {
        api.syncData(playerData).then(result => {
            if (result.success && result.mergedData) {
                // Update with merged data from server
                Object.assign(playerData, result.mergedData);
                saveData();
                updateAllUI();
                console.log('✅ Data synced with server');
            }
        }).catch(err => {
            console.log('⚠️ Backend not available, using localStorage');
        });
    }
    // ===== KẾT THÚC =====
}
```

### Step 3: Submit Score Khi Game Over

Thêm vào function `gameOver()` (tìm dòng ~800):

```javascript
function gameOver() {
    gameState = 'gameover';
    playSound('lose');

    // ... existing code ...

    // ===== THÊM ĐOẠN NÀY =====
    // Submit score to backend
    if (typeof api !== 'undefined' && api.telegramId) {
        api.submitScore(score, {
            bricksDestroyed: playerData.totalBricksDestroyed,
            timeElapsed: Math.floor((Date.now() - gameStartTime) / 1000),
            maxCombo: playerData.maxCombo,
            level: playerData.level
        }).then(result => {
            if (result.success) {
                console.log('✅ Score submitted to leaderboard');
            }
        });
    }
    // ===== KẾT THÚC =====
}

// Thêm biến global (ở đầu file)
let gameStartTime = Date.now();

// Update khi start game
function startGame() {
    gameStartTime = Date.now(); // Track game start time
    // ... rest of existing code ...
}
```

### Step 4: Load Real Leaderboard

Thay thế function `switchLeaderboard()` (tìm dòng ~2000):

```javascript
function switchLeaderboard(tab) {
    leaderboardTab = tab;
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.lb-tab[onclick*="${tab}"]`).classList.add('active');

    // ===== THAY THẾ ĐOẠN NÀY =====
    // Load from backend if available
    if (typeof api !== 'undefined' && api.telegramId) {
        const period = tab === 'weekly' ? 'weekly' : 'all';

        api.getLeaderboard(period, 100).then(result => {
            if (result.success && result.leaderboard) {
                displayLeaderboard(result.leaderboard);

                // Get user rank
                api.getUserRank().then(rankResult => {
                    if (rankResult.success) {
                        displayUserRank(rankResult.rank, rankResult.score);
                    }
                });
            } else {
                // Fallback to mock data
                displayLeaderboard(mockLeaderboardData);
            }
        });
    } else {
        // No backend, use mock data
        displayLeaderboard(mockLeaderboardData);
    }
    // ===== KẾT THÚC =====
}

// Helper function to display leaderboard
function displayLeaderboard(data) {
    const container = document.querySelector('.leaderboard-list');
    container.innerHTML = '';

    data.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'lb-item';
        if (entry.rank <= 3) item.classList.add('top-3');

        item.innerHTML = `
            <div class="lb-rank ${entry.rank <= 3 ? 'rank-' + entry.rank : ''}">${entry.rank}</div>
            <div class="lb-avatar">${entry.avatar || getAvatarEmoji(entry.username)}</div>
            <div class="lb-info">
                <div class="lb-name">${entry.username}</div>
            </div>
            <div class="lb-score">${entry.score.toLocaleString()}</div>
        `;
        container.appendChild(item);
    });
}

function displayUserRank(rank, score) {
    const container = document.querySelector('.current-player');
    if (container) {
        container.innerHTML = `
            <div class="lb-rank">${rank || '--'}</div>
            <div class="lb-avatar">${tg?.initDataUnsafe?.user?.first_name?.[0] || 'Y'}</div>
            <div class="lb-info">
                <div class="lb-name">You</div>
            </div>
            <div class="lb-score">${score?.toLocaleString() || '0'}</div>
        `;
    }
}

function getAvatarEmoji(username) {
    const emojis = ['👑', '⚡', '🔥', '💎', '🚀', '⭐', '💫', '🎮'];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
}
```

### Step 5: Task Verification với Backend

Update function `completeTask()` (tìm dòng ~2200):

```javascript
function completeTask(task) {
    // ... existing code để open links ...

    // ===== THAY THẾ setTimeout() BẰNG ĐOẠN NÀY =====
    // Verify with backend
    if (typeof api !== 'undefined' && api.telegramId) {
        // Wait 2 seconds (user has time to join)
        setTimeout(async () => {
            const result = await api.verifyTask(task);

            if (result.success) {
                showToast(`+${result.reward} Coins!`, 'success');
                playerData.coins = result.totalCoins;
                saveData();
                updateAllUI();
            } else if (result.error === 'Task already completed') {
                showToast('Task đã hoàn thành rồi!', 'warning');
            }
        }, 2000);
    } else {
        // Fallback: local only
        setTimeout(() => {
            if (!playerData.tasksCompleted.includes(task)) {
                const rewards = { 'channel': 500, 'twitter': 300 };
                const reward = rewards[task] || 0;

                playerData.tasksCompleted.push(task);
                playerData.coins += reward;
                saveData();
                showToast(`+${reward} Coins!`, 'success');
                updateAllUI();
            }
        }, 2000);
    }
    // ===== KẾT THÚC =====
}
```

### Step 6: Wallet Connection Bonus

Update TON Connect callback (tìm dòng ~2280):

```javascript
tonConnectUI.onStatusChange(async wallet => {
    if (wallet) {
        const address = wallet.account.address;
        playerData.walletConnected = true;
        playerData.walletAddress = address;

        // ===== THÊM ĐOẠN NÀY =====
        // Backend bonus (only once)
        if (typeof api !== 'undefined' && api.telegramId) {
            const result = await api.connectWallet(address);
            if (result.success) {
                playerData.coins = result.totalCoins;
                showToast('Wallet connected! +1000 Coins', 'success');
            } else if (result.error === 'Wallet already connected') {
                showToast('Wallet already connected!', 'warning');
            }
        } else {
            // Fallback: local bonus
            playerData.coins += 1000;
            showToast('Wallet connected! +1000 Coins', 'success');
        }
        // ===== KẾT THÚC =====

        saveData();
        updateAllUI();
    }
});
```

---

## 🔄 Data Flow

### With Backend:

```
Game Start
    ↓
Load LocalStorage
    ↓
Sync with Backend (merge data)
    ↓
Use merged data
    ↓
Game Play
    ↓
Submit score to Backend
    ↓
Update LocalStorage + Backend
```

### Merge Logic:

```javascript
// Always keep HIGHER values
coins: max(local, server)
highScore: max(local, server)
level: max(local, server)
```

**Benefit:** Người dùng không mất data khi switch devices!

---

## 🚀 Deployment

### 1. Deploy Backend

**Option A: Railway.app (Easiest)**

```bash
cd backend

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Get URL
railway status
# => https://neon-brick-backend-production.up.railway.app
```

**Option B: Render.com**

1. Push backend to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service
4. Connect repo
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Deploy

### 2. Update Game với Production URL

Sửa file `NeonBrick.html`:

```html
<script>
    // PRODUCTION URL (thay YOUR_BACKEND_URL)
    const api = new NeonBrickAPI('https://YOUR_BACKEND_URL');

    // DEV URL (comment out sau khi deploy)
    // const api = new NeonBrickAPI('http://localhost:3000');
</script>
```

### 3. Enable CORS trên Backend

Update `backend/.env`:

```env
# Allow game domain
CORS_ORIGIN=https://anhkhoavanhua.github.io
```

Update `backend/server.js`:

```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
```

### 4. Deploy Game lên GitHub Pages

```bash
# Commit changes
git add .
git commit -m "feat: Integrate backend API"
git push origin main

# Wait 2-3 minutes for GitHub Pages rebuild
```

---

## 🧪 Testing Checklist

### Local Testing:

```bash
# 1. Start backend
cd backend
npm start

# 2. Open game
open NeonBrick.html

# 3. Check console
# Should see: "✅ Data synced with server"
```

### Production Testing:

- [ ] Game loads trên Telegram bot
- [ ] User data syncs
- [ ] Leaderboard shows real data
- [ ] Score submission works
- [ ] Tasks verify properly
- [ ] Wallet bonus only once

---

## 📊 Monitoring

### Backend Health:

```bash
# Check if backend is running
curl https://YOUR_BACKEND_URL/health

# Should return:
# {"status":"ok","timestamp":1234567890}
```

### Check Stats:

```bash
curl https://YOUR_BACKEND_URL/api/stats

# Returns:
# {
#   "totalUsers": 1234,
#   "totalScores": 5678,
#   "totalGames": 9012
# }
```

---

## ⚡ Performance Tips

### 1. Debounce Updates

```javascript
// Don't sync on every coin change
// Only sync on major events:
// - Game over
// - Task complete
// - Level up
// - Upgrade purchase
```

### 2. Offline Support

```javascript
// Always save to localStorage first
saveData();

// Then sync to backend (don't wait)
api.updateUser(playerData).catch(err => {
    console.log('Will sync later');
});
```

### 3. Cache Leaderboard

```javascript
// Load from cache first, then refresh
const cached = localStorage.getItem('leaderboard_cache');
if (cached) {
    displayLeaderboard(JSON.parse(cached));
}

// Fetch fresh data in background
api.getLeaderboard().then(result => {
    localStorage.setItem('leaderboard_cache', JSON.stringify(result.leaderboard));
    displayLeaderboard(result.leaderboard);
});
```

---

## 🐛 Troubleshooting

### Issue: "API Request failed: NetworkError"

**Cause:** Backend not running hoặc CORS issue

**Solution:**
```bash
# Check backend
curl http://localhost:3000/health

# Check CORS in backend/server.js
app.use(cors({ origin: '*' })); // Allow all for testing
```

### Issue: "Invalid score" error

**Cause:** Anti-cheat validation

**Solution:** Check `gameData` values hợp lý:
```javascript
// Make sure:
bricksDestroyed > 0
timeElapsed > 10 seconds
score <= bricksDestroyed * 30 * 2
```

### Issue: Leaderboard không update

**Cause:** Caching hoặc chưa submit score

**Solution:**
```javascript
// Force refresh
api.getLeaderboard('all', 100).then(console.log);

// Check user rank
api.getUserRank().then(console.log);
```

---

## 💰 Cost Estimate

### Free Tier (0-1K users):

- Railway.app: **FREE** (500 hours/month)
- Render.com: **FREE** (750 hours/month)
- **Total: $0/month**

### Paid Tier (1K-10K users):

- Railway.app: **$5-10/month**
- Render.com: **$7/month**
- **Total: $5-10/month**

### Scale (10K-100K users):

- Server: **$20-50/month**
- Database: **$15-25/month** (PostgreSQL)
- **Total: $35-75/month**

---

## 🎯 Next Steps

### Phase 1: MVP (This Week)

- [x] ✅ Backend API created
- [x] ✅ API client created
- [ ] 🔲 Integrate vào HTML
- [ ] 🔲 Test local
- [ ] 🔲 Deploy backend
- [ ] 🔲 Update game với production URL
- [ ] 🔲 Launch!

### Phase 2: Improvements (Next Month)

- [ ] Migrate to PostgreSQL
- [ ] Add Redis caching
- [ ] Implement rate limiting
- [ ] Real task verification (check Telegram membership)
- [ ] Add analytics
- [ ] Setup monitoring

### Phase 3: Token Economy (2-3 Months)

- [ ] Create TON smart contract
- [ ] Coin → Token conversion
- [ ] Withdrawal mechanism
- [ ] Staking system

---

## 📝 Summary

### Current State (No Backend):
- ✅ Game works
- ❌ Leaderboard fake
- ❌ Easy to cheat
- ❌ No real economy

### After Integration (With Backend):
- ✅ Real leaderboard
- ✅ Anti-cheat validation
- ✅ Cross-device sync
- ✅ Real coin economy foundation
- ✅ Ready for token integration

### Effort Required:
- **Backend setup:** ✅ DONE
- **Integration:** ~1-2 hours (add ~50 lines of code)
- **Testing:** ~30 minutes
- **Deploy:** ~1 hour
- **Total:** ~3-4 hours

---

Bạn muốn tôi giúp integrate trực tiếp vào file HTML không? 😊
