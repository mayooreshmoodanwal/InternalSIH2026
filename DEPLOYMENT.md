# 🚀 V.A.N.A Production Deployment Guide

Complete step-by-step instructions for deploying the **V.A.N.A** Smart Tourist Safety & Incident Response System.

---

## 🏗️ Architecture Overview

| Component | Tech Stack | Recommended Host | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Next.js 16 (App Router) | **Vercel** | ✅ Yes |
| **Backend API + WebSockets** | Express 5, Socket.IO, TypeScript | **Render** / **Railway** / **Fly.io** | ✅ Yes |
| **Primary Database** | PostgreSQL 16 + PostGIS | **Neon** | ✅ Yes |
| **Cache & Real-time Store** | Redis (Sessions, OTP, Rate Limits) | **Upstash** | ✅ Yes |
| **Telemetry & Raw Logs** | MongoDB (Raw SMS / BLE logs) | **MongoDB Atlas** | ✅ Yes |

---

## 📋 Pre-Deployment Secrets Checklist

Generate random 64-character hex strings for secrets using your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Environment Variable | Description | Where it goes | Example Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Neon Postgres Connection String (pooled) | Backend | `postgresql://user:pass@ep-xyz.neon.tech/vana_prod?sslmode=require` |
| `REDIS_URL` | Upstash Redis connection URI | Backend | `rediss://default:token@xyz.upstash.io:6379` |
| `MONGODB_URI` | MongoDB Atlas cluster connection | Backend | `mongodb+srv://user:pass@cluster.mongodb.net/vana_prod` |
| `JWT_ACCESS_SECRET` | 32+ char secret for access tokens | Backend | `64-char-hex-generated-above` |
| `JWT_REFRESH_SECRET` | 32+ char secret for refresh tokens | Backend | `64-char-hex-generated-above` |
| `SERVER_ENCRYPTION_SEED` | 64-char hex seed for X25519 SOS encryption | Backend | `64-char-hex-generated-above` |
| `CORS_ORIGIN` | URL of your deployed Frontend | Backend | `https://vana-web.vercel.app` |
| `RESEND_API_KEY` | Resend API Key for Email OTP | Backend | `re_...` |
| `SMTP_USER` & `SMTP_PASS` | Gmail SMTP Fallback (App Password) | Backend | `email@gmail.com` / `16-char-app-pw` |
| `MSG91_AUTH_KEY` | MSG91 OTP API Key for India SMS | Backend | `...` |
| `TWILIO_ACCOUNT_SID` | Twilio SID for International SMS | Backend | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Backend | `...` |
| `TWILIO_PHONE_NUMBER` | Twilio verified sender phone | Backend | `+1234567890` |
| `GEMINI_API_KEY` | Google Gemini 1.5 Flash AI Key | Backend | `AIzaSy...` |
| `MAPBOX_ACCESS_TOKEN` | Mapbox Vector Tiles Access Token | Backend / Web | `pk.ey...` |
| `NEXT_PUBLIC_API_URL` | Public URL of your deployed Backend API | Frontend | `https://vana-api.onrender.com` |

---

## 🌐 Method 1: Cloud Platform Deployment (Recommended & Easiest)

### Step 1: Set Up Cloud Databases (100% Free Tiers)

1. **PostgreSQL (Neon)**:
   - Go to [neon.tech](https://neon.tech) and create a project named `vana-prod`.
   - In SQL Editor, enable PostGIS:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     ```
   - Copy the `DATABASE_URL` (Connection string with pooled connection).

2. **Redis (Upstash)**:
   - Go to [upstash.com](https://upstash.com) and create a serverless Redis database.
   - Copy the `redis://...` or `rediss://...` connection URL.

3. **MongoDB Atlas (Optional for raw logs)**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
   - Whitelist `0.0.0.0/0` in Network Access.
   - Copy the `MONGODB_URI` connection string.

---

### Step 2: Deploy Backend API on Render / Railway

> **Note:** Because V.A.N.A uses **Socket.IO WebSockets** for real-time SOS alerts, the backend must run as a persistent Node.js service (not serverless functions).

#### Option A: Using Render (Free / Web Service)
1. Go to [render.com](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `vana-api`
   - **Language**: `Node`
   - **Root Directory**: `services/api`
   - **Build Command**:
     ```bash
     pnpm install && npx prisma generate && npx tsc -p tsconfig.json
     ```
   - **Start Command**:
     ```bash
     node dist/index.js
     ```
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `4000` (or leave default for Render)
   - `DATABASE_URL` = *(Your Neon URL)*
   - `REDIS_URL` = *(Your Upstash Redis URL)*
   - `MONGODB_URI` = *(Your MongoDB Atlas URL)*
   - `JWT_ACCESS_SECRET` = *(Generated 64 hex)*
   - `JWT_REFRESH_SECRET` = *(Generated 64 hex)*
   - `SERVER_ENCRYPTION_SEED` = *(Generated 64 hex)*
   - `CORS_ORIGIN` = `https://<your-frontend>.vercel.app` (you can update this after Step 3)
   - Add your other API keys (`RESEND_API_KEY`, `GEMINI_API_KEY`, `MSG91_AUTH_KEY`, `TWILIO_*`, etc.)
5. Click **Create Web Service**.
6. Copy your deployed API URL (e.g., `https://vana-api.onrender.com`).

---

### Step 3: Run Database Schema Push & Seed

From your local machine or through Render shell:
```bash
cd services/api
# Set DATABASE_URL in .env to your Neon Production URL
npx prisma db push
npx tsx src/utils/seed.ts
```
This initializes all enum types, tables, dead zones, and the super-admin user in Neon.

---

### Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New... > Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `apps/web`.
   - **Build Command**: `next build`
   - **Install Command**: `pnpm install`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://vana-api.onrender.com` *(Your Render Backend URL)*
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g., `https://vana-safety.vercel.app`).
7. Go back to Render (Step 2) and update `CORS_ORIGIN` to match your Vercel URL!

---

## 🐳 Method 2: Single-Server VPS Deployment (Docker Compose)

Deploy everything (Postgres + PostGIS, Redis, Mongo, API, Web) on an **Ubuntu VPS (AWS EC2 / DigitalOcean / Linode / Hetzner)**.

### 1. Provision Server
SSH into your Ubuntu 22.04 / 24.04 server:
```bash
sudo apt update && sudo apt upgrade -y
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Clone & Configure
```bash
git clone <your-repo-url> /opt/vana
cd /opt/vana

# Copy and edit production environment
cp services/api/.env.example services/api/.env
nano services/api/.env
```

### 3. Launch with Docker Compose
```bash
# Build and start all containers in background
docker compose -f infra/docker/docker-compose.prod.yml up -d --build

# Run database migrations and seed
docker compose -f infra/docker/docker-compose.prod.yml exec api npx prisma db push
docker compose -f infra/docker/docker-compose.prod.yml exec api npx tsx src/utils/seed.ts
```

---

## 🔒 Production Security Checklist

- [x] **HTTPS / SSL**: Automatically provided by Vercel and Render.
- [x] **CORS Origin Restriction**: Configured via `CORS_ORIGIN` env var.
- [x] **Rate Limiting**: Express rate limiters protect `/auth/*` and `/sos/*` via Redis.
- [x] **Argon2id Password Hashing**: Active on all credential storage.
- [x] **Tamper-Proof SOS**: XChaCha20-Poly1305 AEAD validation active on SMS / BLE ingestion.
- [x] **Audit Trail**: Every authority identity reveal is written to `audit_logs` before access is granted.

---

## 🧪 Post-Deployment Verification (Smoke Test)

Run these checks once deployed:
1. **Health Check**: Visit `https://your-api-url.onrender.com/health` (should return `{ status: 'ok' }`).
2. **Super Admin Login**: Go to `https://your-web-url.vercel.app/login` and log in with your Super-Admin credentials.
3. **Authority Approval Flow**: Register a new authority at `/register` -> view approval request in `/admin/dashboard` -> approve -> verify officer redirected to `/authority/dashboard`.
4. **SOS Gateway**: Trigger test SOS on `/sos` and ensure the WebSocket alert renders on `/authority/dashboard`.
