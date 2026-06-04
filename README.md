# TradeTalk v0.3 — Social Trading Mini-App on Base

**Built by an Ipoh Dad (@afifarioss) chasing generational wealth on Base with his family.**

TradeTalk is a clean, dark Bloomberg-style social trading mini-app on Base featuring:
- Live prices (CoinGecko + smart fallback)
- Real Base wallet connect (Coinbase Smart Wallet + MetaMask ready)
- Base MCP AI agents (Luna) that can suggest swaps, set alerts, and check portfolio
- Viral “Share Alpha → Earn Tips” mechanic that rewards users for promoting on X
- Live trading room with tipping leaderboard
- Portfolio tracker

## Why This Matters
This project proves real onchain building is accessible even for a Malaysian dad building in public. It combines **AI agents + social features + monetization loops** — exactly the direction Base is pushing in 2026.

## Key Features
- 🔵 **Base MCP Agents** — Connect Luna to get onchain suggestions and alerts
- 🚀 **Share Alpha → Earn Tips** — One-click viral sharing with instant tip rewards
- 🔗 **Real Base Wallet Connect** — Wagmi-ready (demo works now, production in 5 mins)
- 📊 **Live Prices + Charts** — Reliable with automatic fallback
- 💬 **Live Trading Room** — Chat + tipping leaderboard
- 💼 **Portfolio View** — Clean tracking of holdings

## Tech Stack
- React + Vite (or Next.js ready)
- Tailwind / inline styles (Bloomberg dark aesthetic)
- CoinGecko API + mock fallback
- Wagmi + Viem ready for production
- Base MCP simulation (easy to connect real agents)

## Quick Start (Local)
```bash
git clone https://github.com/afifarioss/TradeTalk.git
cd TradeTalk
npm install
npm run dev
