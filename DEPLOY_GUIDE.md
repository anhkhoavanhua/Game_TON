# 🚀 Hướng Dẫn Deploy Neon Brick Breaker

Hướng dẫn chi tiết để deploy game lên GitHub Pages và cấu hình Telegram Bot.

---

## 📋 Checklist Trước Khi Deploy

- [ ] Đã có GitHub account
- [ ] Đã có Telegram account
- [ ] Đã cài Git trên máy
- [ ] Đã tạo icon.png (192×192px)
- [ ] Đã kiểm tra game chạy local

---

## 🎨 Bước 1: Tạo Icon Game

### Yêu Cầu Kỹ Thuật

- **Kích thước**: 192×192 pixels (bắt buộc)
- **Format**: PNG
- **Background**: Trong suốt (recommended)
- **Design**: Logo/icon đại diện cho game

### Option 1: Dùng Canva (Dễ nhất)

1. Truy cập [Canva.com](https://www.canva.com)
2. Tạo design custom 192×192px
3. Template đề xuất: Gaming Logo
4. Elements để dùng:
   - 🎮 Game controller icon
   - 🟦 Neon brick shapes
   - ⚡ Lightning effects
   - Gradient: Cyan (#00ffc4) → Magenta (#ff00e6)
5. Download dạng PNG (transparent)
6. Đổi tên thành `icon.png`

### Option 2: Dùng AI (DALL-E, Midjourney)

**Prompt đề xuất:**
```
Create a 192x192px neon game icon for a brick breaker game.
Cyberpunk style with glowing cyan and magenta colors.
Include a paddle and glowing bricks.
Transparent background. High contrast. Gaming logo style.
```

### Option 3: Dùng Emoji (Nhanh nhất)

1. Truy cập [Emojipedia](https://emojipedia.org)
2. Tìm emoji: 🎮 hoặc 🟦
3. Download PNG version
4. Resize về 192×192px bằng:
   - [ResizeImage.net](https://resizeimage.net)
   - Photoshop
   - Preview (Mac): Tools → Adjust Size

### Option 4: Photoshop/Figma (Professional)

**Figma Steps:**
1. New file → 192×192px frame
2. Add gradient rectangle (Cyan → Magenta)
3. Add text: "NB" (Neon Brick)
4. Font: Orbitron Bold
5. Effects: Outer glow (cyan), Drop shadow
6. Export → PNG → Transparent

---

## 📁 Bước 2: Chuẩn Bị Files

### File Structure

Đảm bảo folder có cấu trúc:

```
neon-brick-game/
├── NeonBrick.html           (Main game file)
├── tonconnect-manifest.json (TON Connect config)
├── icon.png                 (192×192px icon) ⚠️ CẦN TẠO
├── README.md                (Documentation)
└── DEPLOY_GUIDE.md          (This file)
```

### Kiểm Tra Files

```bash
# Navigate to project folder
cd "/Users/huavananhkhoa/Desktop/Neon Bricks"

# List files
ls -la

# Kiểm tra icon size
file icon.png
# Output should show: PNG image data, 192 x 192
```

---

## 🔧 Bước 3: Push Code Lên GitHub

### A. Cấu Hình Git (Lần Đầu)

```bash
# Set username
git config --global user.name "Your Name"

# Set email
git config --global user.email "your.email@example.com"
```

### B. Initialize Repository

```bash
# Navigate to project
cd "/Users/huavananhkhoa/Desktop/Neon Bricks"

# Initialize git (if not done)
git init

# Check remote
git remote -v

# If no remote, add it:
git remote add origin https://github.com/anhkhoavanhua/neon-brick-game.git
```

### C. Commit & Push

```bash
# Check status
git status

# Stage all files
git add .

# Commit
git commit -m "feat: Deploy Neon Brick Breaker with TON Connect"

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### Xử Lý Lỗi Thường Gặp

**Lỗi 1: Permission denied**
```bash
# Solution: Authenticate with GitHub
gh auth login
# Hoặc dùng Personal Access Token
```

**Lỗi 2: Rejected (non-fast-forward)**
```bash
# Solution: Pull trước khi push
git pull origin main --rebase
git push -u origin main
```

**Lỗi 3: Large file warning**
```bash
# Solution: Add to .gitignore
echo "*.mp4" >> .gitignore
echo "*.mov" >> .gitignore
git rm --cached large-file.mp4
git commit -m "Remove large files"
```

---

## 🌐 Bước 4: Enable GitHub Pages

### Web Interface

1. **Mở Repository**
   - URL: `https://github.com/anhkhoavanhua/neon-brick-game`

2. **Settings Tab**
   - Click tab "Settings" ở trên

3. **Pages Section**
   - Sidebar bên trái → Click "Pages"

4. **Configure Source**
   - Source: **Deploy from a branch**
   - Branch: **main** (không phải master)
   - Folder: **/ (root)**
   - Click **Save**

5. **Wait for Deployment**
   - GitHub sẽ build tự động
   - Thời gian: 1-3 phút
   - Refresh page để xem status

6. **Verify Deployment**
   - Khi xong, sẽ hiện message:
     ```
     Your site is live at https://anhkhoavanhua.github.io/neon-brick-game/
     ```

### Command Line (Alternative)

```bash
# Enable Pages via GitHub CLI
gh repo edit --enable-pages --pages-branch main --pages-path /

# Check status
gh repo view --web
```

---

## 🔍 Bước 5: Verify URLs

### Test Manifest

1. **TON Connect Manifest**
   ```
   URL: https://anhkhoavanhua.github.io/neon-brick-game/tonconnect-manifest.json

   Expected JSON:
   {
     "url": "https://anhkhoavanhua.github.io/neon-brick-game",
     "name": "Neon Brick Breaker",
     "iconUrl": "https://anhkhoavanhua.github.io/neon-brick-game/icon.png"
   }
   ```

2. **Icon File**
   ```
   URL: https://anhkhoavanhua.github.io/neon-brick-game/icon.png

   Check: Icon hiển thị đúng, 192×192px
   ```

3. **Game File**
   ```
   URL: https://anhkhoavanhua.github.io/neon-brick-game/NeonBrick.html

   Check: Game load và chạy bình thường
   ```

### Browser DevTools Test

```javascript
// Open game page → F12 → Console
fetch('https://anhkhoavanhua.github.io/neon-brick-game/tonconnect-manifest.json')
  .then(r => r.json())
  .then(console.log)

// Should log manifest JSON
```

---

## 🤖 Bước 6: Cấu Hình Telegram Bot

### A. Tạo Bot với BotFather

1. **Mở Telegram**
   - Desktop: [web.telegram.org](https://web.telegram.org)
   - Mobile: Telegram app

2. **Tìm BotFather**
   - Search: `@BotFather`
   - Official bot (verified blue checkmark)

3. **Tạo Bot Mới**
   ```
   You: /newbot

   BotFather: Alright, a new bot. How are we going to call it?
   You: Neon Brick Breaker

   BotFather: Good. Now let's choose a username for your bot.
   You: NeonBrickGameBot

   BotFather: Done! Congratulations on your new bot.
   ```

4. **Lưu Bot Token**
   ```
   Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz

   ⚠️ QUAN TRỌNG: Không share token này!
   ```

### B. Configure Bot Settings

```
/setdescription NeonBrickGameBot
Description:
🎮 Play classic brick breaker with neon cyberpunk style!
💎 Earn coins, upgrade your paddle, unlock skins
🪙 Connect TON wallet and earn rewards
🚀 Play-to-Earn on Telegram
```

```
/setabouttext NeonBrickGameBot
About:
Neon Brick Breaker - A modern take on the classic brick breaker game with blockchain integration.
```

```
/setuserpic NeonBrickGameBot
(Upload icon.png as bot profile picture)
```

### C. Tạo Mini App

1. **Create Web App**
   ```
   You: /newapp

   BotFather: Choose a bot to create a Web App for
   You: @NeonBrickGameBot
   ```

2. **App Details**
   ```
   Title: Neon Brick Breaker

   Description:
   🎮 Play classic brick breaker with neon style!
   💎 Earn coins, upgrade skills, connect TON wallet
   🚀 Play-to-Earn on Telegram

   Photo: (Upload game screenshot 1280×640px)

   Demo GIF: (Optional - Gameplay GIF)

   Short name: Play

   Web App URL: https://anhkhoavanhua.github.io/neon-brick-game/NeonBrick.html
   ```

3. **Verify Creation**
   ```
   BotFather: Done! Your Web App is ready.
   Link: https://t.me/NeonBrickGameBot/Play
   ```

### D. Test Bot

1. **Open Bot**
   - Click link: `https://t.me/NeonBrickGameBot/Play`
   - Or search: `@NeonBrickGameBot` → "Play" button

2. **Check Features**
   - [ ] Game loads trong Telegram
   - [ ] Touch controls work
   - [ ] Full screen mode active
   - [ ] TON Connect button visible
   - [ ] Telegram user name hiển thị

---

## 💎 Bước 7: Test TON Connect

### A. Install TON Wallet

**Option 1: Tonkeeper (Recommended)**
- iOS: [App Store](https://apps.apple.com/app/tonkeeper/id1587742107)
- Android: [Google Play](https://play.google.com/store/apps/details?id=com.ton_keeper)
- Chrome: [Extension](https://chrome.google.com/webstore/detail/tonkeeper/opeckldhdcoibefpnaakfiieekpdfaoi)

**Option 2: TON Wallet**
- [Chrome Extension](https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd)

### B. Get Test TON

1. **Switch to Testnet**
   - Tonkeeper: Settings → Dev Menu → Switch to Testnet

2. **Get Free Testnet TON**
   - [TON Testnet Faucet](https://testnet.tonscan.org/faucet)
   - Paste wallet address
   - Claim 5 testnet TON

### C. Test Connection

1. **Open Game**
   ```
   https://t.me/NeonBrickGameBot/Play
   ```

2. **Click "Connect Wallet"**
   - Tonkeeper modal appears
   - Click "Connect"
   - Approve connection

3. **Verify Success**
   - Wallet address shows: `UQ...abc`
   - Receive 1,000 bonus coins
   - Green success toast notification

### D. Test Manifest

```bash
# Verify manifest loads
curl https://anhkhoavanhua.github.io/neon-brick-game/tonconnect-manifest.json

# Should return valid JSON
```

---

## ✅ Bước 8: Final Checklist

### Pre-Launch Verification

- [ ] **GitHub Pages**
  - [ ] Site is live
  - [ ] NeonBrick.html loads
  - [ ] No 404 errors
  - [ ] HTTPS enabled (automatic)

- [ ] **TON Connect**
  - [ ] Manifest URL accessible
  - [ ] Icon URL loads
  - [ ] Wallet connection works
  - [ ] Bonus coins granted

- [ ] **Telegram Bot**
  - [ ] Bot responds to commands
  - [ ] Mini App launches
  - [ ] Full screen mode works
  - [ ] User name displays

- [ ] **Game Functionality**
  - [ ] Gameplay smooth
  - [ ] Touch controls work
  - [ ] Sound effects play
  - [ ] Power-ups work
  - [ ] Shop purchases work
  - [ ] Data persists (localStorage)

- [ ] **Social Features**
  - [ ] Daily rewards claimable
  - [ ] Tasks completable
  - [ ] Referral link works
  - [ ] Channel/Twitter links open

---

## 🐛 Troubleshooting

### Issue 1: GitHub Pages 404

**Symptoms:**
- Truy cập URL hiện "404 Not Found"

**Solutions:**
```bash
# 1. Check branch name
git branch
# Should show: * main

# 2. Verify files in root
ls -la

# 3. Re-enable Pages
gh repo edit --enable-pages --pages-branch main --pages-path /

# 4. Wait 2-3 minutes, hard refresh (Cmd+Shift+R)
```

### Issue 2: TON Connect Manifest Error

**Symptoms:**
- "Manifest not found" error

**Solutions:**
```bash
# 1. Verify file exists
ls tonconnect-manifest.json

# 2. Check JSON validity
cat tonconnect-manifest.json | jq .

# 3. Test URL
curl https://anhkhoavanhua.github.io/neon-brick-game/tonconnect-manifest.json

# 4. Clear cache
# In browser: Shift + Reload
```

### Issue 3: Icon Not Loading

**Symptoms:**
- Wallet shows broken image

**Solutions:**
```bash
# 1. Check file size
file icon.png
# Should be: PNG image data, 192 x 192

# 2. Verify upload
git ls-files | grep icon.png

# 3. Re-add and push
git add icon.png
git commit -m "fix: Update icon"
git push

# 4. Wait for Pages rebuild (2-3 mins)
```

### Issue 4: Telegram Bot Not Responding

**Symptoms:**
- Bot không reply commands

**Solutions:**
1. Check bot username chính xác: `@NeonBrickGameBot`
2. Verify bot not blocked by Telegram
3. Re-create bot với BotFather nếu cần
4. Check Mini App URL đúng

### Issue 5: Game Không Load Trên Telegram

**Symptoms:**
- Blank screen hoặc loading forever

**Solutions:**
1. **Check URL:**
   ```
   Correct: https://anhkhoavanhua.github.io/neon-brick-game/NeonBrick.html
   Wrong: http://... (no HTTPS)
   Wrong: /neon-brick-game/NeonBrick.html (missing domain)
   ```

2. **Check Console Errors:**
   - Telegram Desktop → Right click → Inspect Element
   - Check Console tab for errors

3. **Test Outside Telegram:**
   - Open URL directly in browser
   - If works → Telegram config issue
   - If not → Game code issue

### Issue 6: LocalStorage Not Persisting

**Symptoms:**
- Coins/progress lost after refresh

**Solutions:**
```javascript
// Check storage available
console.log('Storage available:', !!localStorage);

// Check data
console.log(localStorage.getItem('neon_breaker_v2'));

// Clear and reset
localStorage.clear();
location.reload();
```

---

## 🔄 Cập Nhật Game Sau Deploy

### Quick Update Process

```bash
# 1. Make changes to code
# Edit NeonBrick.html or other files

# 2. Test locally
open NeonBrick.html

# 3. Commit changes
git add .
git commit -m "feat: Add new power-up system"

# 4. Push to GitHub
git push origin main

# 5. Wait for auto-deploy (2-3 minutes)

# 6. Hard refresh in browser/Telegram
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Version Tagging

```bash
# Tag a release version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# View tags
git tag -l
```

---

## 📊 Monitoring & Analytics

### GitHub Pages Traffic

1. Go to: `https://github.com/anhkhoavanhua/neon-brick-game`
2. Click "Insights" tab
3. Click "Traffic" để xem:
   - Page views
   - Unique visitors
   - Referring sites

### Add Google Analytics (Optional)

```html
<!-- Add to NeonBrick.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🚀 Next Steps After Deploy

### 1. Marketing & Promotion

- [ ] Post announcement in Telegram channel
- [ ] Tweet about launch on Twitter
- [ ] Share in Web3 gaming communities
- [ ] Post on Reddit (r/TONBlockchain, r/WebGames)
- [ ] Submit to Web3 gaming directories

### 2. Collect Feedback

- [ ] Add feedback form/link
- [ ] Monitor Telegram comments
- [ ] Track GitHub issues
- [ ] Analyze user behavior

### 3. Iterate & Improve

- [ ] Fix reported bugs
- [ ] Add requested features
- [ ] Optimize performance
- [ ] Enhance UI/UX

### 4. Scale Infrastructure

- [ ] Set up backend API
- [ ] Add database (PostgreSQL)
- [ ] Implement real leaderboards
- [ ] Add proper token economy
- [ ] Deploy smart contracts

---

## 🆘 Support

### Documentation
- Main README: [README.md](./README.md)
- GitHub Issues: [Report Bug](https://github.com/anhkhoavanhua/neon-brick-game/issues)

### Community
- Telegram: [t.me/neonbrickgame](https://t.me/neonbrickgame)
- Twitter: [@CachepStudio](https://x.com/CachepStudio)

### Developer Resources
- TON Docs: [docs.ton.org](https://docs.ton.org)
- Telegram Bot API: [core.telegram.org/bots](https://core.telegram.org/bots)
- GitHub Pages: [pages.github.com](https://pages.github.com)

---

## 🎉 Congratulations!

Bạn đã deploy thành công Neon Brick Breaker lên GitHub Pages và Telegram!

**Next:** Share game link với bạn bè và bắt đầu kiếm coins! 🚀

```
🎮 Play: https://t.me/NeonBrickGameBot/Play
📱 Channel: https://t.me/neonbrickgame
🐦 Twitter: https://x.com/CachepStudio
```

---

**Made with 💜 by Hua Van Anh Khoa**
