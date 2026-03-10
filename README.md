## Ingliz Tili Kursi — Speaking Hub (Teacher Shahlo)

Frontend: `index.html`, `admin.html`  
Backend: `backend/` (Fastify + PostgreSQL)

### 1) GitHub'ga to'g'ri push qilish (faqat shu papka)

**Muhim**: repozitoriy faqat `Desktop\ingliz` ichida bo'lsin, `C:\Users\User` emas.

PowerShell:

```powershell
cd "C:\Users\User\Desktop\ingliz"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/BORETS2002/Ingliz-TIli-kursi.git
git push -u origin main
```

### 2) Backendni lokal ishga tushirish

1) `.env` yarating:
- `.env.example` → `.env`
- `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` ni o'zgartiring

2) DB:

```powershell
docker compose up -d
```

3) Backend:

```powershell
npm install
npm run dev
```

### 3) Deploy (tavsiya: Frontend GitHub Pages + Backend Render + DB Neon)

Bu qadamlar keyingi sozlashlarda beriladi (CORS, env, domain).

