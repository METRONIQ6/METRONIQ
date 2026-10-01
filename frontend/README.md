# ⚖️ MetronIQ — Frontend

Next.js 16 (React 19, TypeScript, TailwindCSS) user interface for the MetronIQ Legal Metrology compliance and inspection system.

## 💻 Local Setup & Development

### 1. Install Dependencies
```powershell
npm install
```

### 2. Environment Configuration
Ensure `frontend/.env.local` is configured with the local FastAPI backend endpoint:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Run Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build for Production
```powershell
npm run build
npm run start
```
