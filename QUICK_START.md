# 🚀 QUICK START - NEON BRICK BREAKER

## 📋 CHECKLIST (Làm từng bước!)

### ✅ STEP 1: Setup Database (5 phút)

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project: `darzwbsnqyxmkkpqffqg`
3. Click **SQL Editor** (menu bên trái)
4. Click **New Query**
5. Mở file `supabase_setup.sql`
6. Copy toàn bộ nội dung
7. Paste vào SQL Editor
8. Click **Run** (hoặc Ctrl+Enter)
9. Đợi 2-3 giây
10. ✅ Thấy "Success. No rows returned" = OK!

---

### ✅ STEP 2: Test Connection (2 phút)

**Link test:** http://localhost:8000/test_supabase.html

**Kỳ vọng:**
```
✅ Supabase Client Initialized
✅ Database Connected Successfully
✅ Table "users": OK
✅ Table "scores": OK
✅ Table "referrals": OK
```

**Nếu thấy ❌ màu đỏ:**
- Mở: http://localhost:8000/FIX_ERRORS.html
- Làm theo hướng dẫn

---

### ✅ STEP 3: Play Game! (30 giây)

**Link game:** http://localhost:8000/NeonBrick.html

**Mở Console (F12):**
- Không có error màu đỏ = OK
- Thấy "Supabase initialized" = Đã kết nối backend!

---

## 🎯 SAU KHI TEST XONG

Nếu game chạy OK trên local → READY TO DEPLOY!

### Deploy lên GitHub Pages:

1. Commit code:
   ```bash
   git add .
   git commit -m "Fix: Setup Supabase backend"
   git push origin Anh_tester1
   ```

2. Enable GitHub Pages:
   - Vào: https://github.com/anhkhoavanhua/Game_TON/settings/pages
   - Source: Deploy from branch
   - Branch: `Anh_tester1` → folder `/ (root)`
   - Click **Save**

3. Đợi 2-5 phút

4. Game sẽ live tại:
   ```
   https://anhkhoavanhua.github.io/Game_TON/NeonBrick.html
   ```

---

## 🆘 NEED HELP?

**Nếu gặp lỗi:**
1. Mở: http://localhost:8000/FIX_ERRORS.html
2. Tìm lỗi tương tự
3. Làm theo hướng dẫn

**Vẫn không được?**
- Screenshot error
- Gửi cho tôi
- Tôi sẽ fix!

---

## 📂 CÁC FILE QUAN TRỌNG

| File | Mục đích |
|------|----------|
| `supabase_setup.sql` | Script tạo database |
| `test_supabase.html` | Test connection |
| `FIX_ERRORS.html` | Hướng dẫn fix lỗi |
| `NeonBrick.html` | Game chính |
| `DEPLOYMENT_GUIDE.md` | Guide deploy đầy đủ |

---

## 🎊 GOOD LUCK!

Database đã ready, chỉ cần chạy SQL script là xong!
