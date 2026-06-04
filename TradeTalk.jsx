import { useState, useEffect, useRef, useCallback } from "react";

// NOTE: For full wagmi integration in production, install:
// npm install wagmi viem @tanstack/react-query
// Then wrap your app with WagmiProvider + QueryClientProvider
// This version has beautiful UI-ready wallet connect + clear instructions for real wagmi

// ── CANDLESTICK CHART ──
function CandlestickChart({ height = 180, candles }) {
  const allPrices = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allPrices), maxP = Math.max(...allPrices);
  const range = maxP - minP || 1;
  const pad = 16, chartH = height - pad * 2;
  const candleW = 100 / candles.length;
  const toY = p => pad + chartH - ((p - minP) / range) * chartH;
  const toX = i => (i / candles.length) * 100;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      {[0,.25,.5,.75,1].map((t,i) => (
        <line key={i} x1="0" x2="100" y1={pad+chartH*t} y2={pad+chartH*t} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3"/>
      ))}
      {candles.map((c,i) => {
        const x = toX(i)+candleW*0.15, w = candleW*0.7, cx = toX(i)+candleW/2;
        const oY = toY(c.o), cY = toY(c.c), hY = toY(c.h), lY = toY(c.l);
        const col = c.bull ? "#10b981" : "#ef4444";
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={hY} y2={lY} stroke={col} strokeWidth="0.3"/>
            <rect x={x} y={Math.min(oY,cY)} width={w} height={Math.abs(oY-cY)||0.3} fill={col} opacity="0.9" rx="0.2"/>
          </g>
        );
      })}
    </svg>
  );
}

// ── SPARKLINE ──
function Sparkline({ data, color, width=70, height=28 }) {
  const min = Math.min(...data), max = Math.max(...data), range = max-min||1;
  const pts = data.map((v,i) => `\( {(i/(data.length-1))*100}, \){100-((v-min)/range)*100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width, height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── CONSTANTS ──
const CANDLES = [
  {o:2420,h:2460,l:2400,c:2445,bull:true},{o:2445,h:2490,l:2430,c:2487,bull:true},
  {o:2487,h:2510,l:2460,c:2470,bull:false},{o:2470,h:2495,l:2455,c:2488,bull:true},
  {o:2488,h:2520,l:2475,c:2505,bull:true},{o:2505,h:2530,l:2490,c:2498,bull:false},
  {o:2498,h:2525,l:2480,c:2515,bull:true},{o:2515,h:2545,l:2505,c:2530,bull:true},
  {o:2530,h:2555,l:2515,c:2520,bull:false},{o:2520,h:2540,l:2500,c:2535,bull:true},
  {o:2535,h:2560,l:2525,c:2548,bull:true},{o:2548,h:2570,l:2535,c:2542,bull:false},
  {o:2542,h:2565,l:2530,c:2558,bull:true},{o:2558,h:2580,l:2548,c:2487,bull:false},
];

const INIT_MSGS = [
  {id:1,username:"afifarios.base",avatar:"🦁",text:"ETH looking strong today frens 🔥"},
  {id:2,username:"trader.base",avatar:"🐻",text:"AERO breakout incoming? volume spiking 👀"},
  {id:3,username:"0xvault.base",avatar:"🦅",text:"Adding more ETH below $2500, DCA szn"},
  {id:4,username:"brett.base",avatar:"🐸",text:"BRETT holding 0.12 support, looking healthy"},
];

const AI_LINES = [
  "📊 ETH 4H forming bullish pennant. Watch $2,520 resistance.",
  "⚠️ AERO volume +34% vs 7-day avg. Continuation play forming.",
  "💡 Fear & Greed: 72 (Greed). Mind your leverage fren.",
  "🔵 Base TVL crossed $3.2B. Ecosystem momentum strong.",
  "📈 ETH/BTC showing strength — alt season signal building.",
  "🛡️ DEGEN key support at $0.0014. Watch closely.",
  "🐸 BRETT consolidating after 12% move. Could retest highs.",
  "₿ cbBTC premium to spot BTC tightening — accumulation zone.",
];

const TOKEN_META = {
  ETH:   { name:"Ethereum",     color:"#06b6d4", avatar:"⟠", portfolioQty: 0.42  },
  AERO:  { name:"Aerodrome",    color:"#10b981", avatar:"💨", portfolioQty: 120   },
  DEGEN: { name:"Degen",        color:"#a855f7", avatar:"🎩", portfolioQty: 4800  },
  cbBTC: { name:"Coinbase BTC", color:"#f59e0b",avatar:"₿", portfolioQty: 0.003 },
  BRETT: { name:"Brett",        color:"#ec4899", avatar:"🐸", portfolioQty: 9500  },
  USDC:  { name:"USD Coin",     color:"#3b82f6", avatar:"💵", portfolioQty: 48.33 },
};

const MOCK_PRICES = {
  ETH:   { usd: 2487.45, change24h: 1.23, vol: 28500000000 },
  AERO:  { usd: 1.28, change24h: 3.45, vol: 124000000 },
  DEGEN: { usd: 0.00145, change24h: -2.1, vol: 45000000 },
  cbBTC: { usd: 97250, change24h: 0.85, vol: 890000000 },
  BRETT: { usd: 0.118, change24h: 4.67, vol: 67000000 },
  USDC:  { usd: 1.00, change24h: 0.00, vol: 1200000000 },
};

const COINGECKO_IDS = "ethereum,aerodrome-finance,degen-base,coinbase-wrapped-btc,brett,usd-coin";

// ── MAIN COMPONENT ──
export default function TradeTalk() {
  const [prices, setPrices] = useState(MOCK_PRICES);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [usingMock, setUsingMock] = useState(true);
  const [sparks, setSparks] = useState({
    ETH: [2380,2420,2395,2445,2430,2475,2460,2487],
    AERO: [1.12,1.18,1.15,1.22,1.19,1.28,1.25,1.31],
    DEGEN: [0.0012,0.0013,0.00125,0.0014,0.00135,0.00145,0.0014,0.00148],
    cbBTC: [95200,96100,95800,97200,96500,97800,97100,98200],
    BRETT: [0.105,0.112,0.108,0.118,0.115,0.122,0.119,0.124],
    USDC: [1,1,1,1,1,1,1,1],
  });
  const [messages, setMessages] = useState(INIT_MSGS);
  const [leaders, setLeaders] = useState([]);
  const [input, setInput] = useState("");
  const [tipAmount, setTipAmount] = useState("0.001");
  const [showTipModal, setShowTipModal] = useState(null);
  const [isTipping, setIsTipping] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [tab, setTab] = useState("chart");
  const [mainPanel, setMainPanel] = useState("trade");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [walletState, setWalletState] = useState("disconnected");
  const [walletAddress, setWalletAddress] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mcpConnected, setMcpConnected] = useState(false);
  const [mcpActions, setMcpActions] = useState([]);
  const chatRef = useRef(null);
  const aiIdx = useRef(0);

  // ── REAL API + FALLBACK WITH ERROR HANDLING ──
  const fetchPrices = useCallback(async (useFallback = false) => {
    if (useFallback) {
      setPrices(MOCK_PRICES);
      setUsingMock(true);
      setPriceError(false);
      setPriceLoading(false);
      return;
    }
    setPriceLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapped = {};
      Object.entries(TOKEN_META).forEach(([sym, meta]) => {
        const cg = data[meta.cgId];
        if (cg) mapped[sym] = { 
          usd: cg.usd, 
          change24h: cg.usd_24h_change?.toFixed(2) ?? "0.00", 
          vol: cg.usd_24hr_vol 
        };
      });
      setPrices(mapped);
      setUsingMock(false);
      setPriceError(false);
      setSparks(prev => {
        const next = { ...prev };
        Object.entries(mapped).forEach(([sym, p]) => {
          if (next[sym]) next[sym] = [...next[sym].slice(1), p.usd];
        });
        return next;
      });
    } catch (err) {
      console.warn("CoinGecko failed → using mock prices:", err.message);
      setPrices(MOCK_PRICES);
      setUsingMock(true);
      setPriceError(true);
    } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const t = setInterval(() => fetchPrices(), 45000);
    return () => clearInterval(t);
  }, [fetchPrices]);

  // Live mock updater (when fallback is active)
  useEffect(() => {
    if (!usingMock) return;
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = {...prev};
        Object.keys(next).forEach(sym => {
          if (sym !== "USDC") {
            const change = (Math.random() - 0.5) * 0.6;
            next[sym] = {
              ...next[sym],
              usd: parseFloat((next[sym].usd * (1 + change/100)).toFixed(sym === "ETH" || sym === "cbBTC" ? 2 : 5)),
              change24h: (parseFloat(next[sym].change24h) * 0.9 + change).toFixed(2)
            };
          }
        });
        return next;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [usingMock]);

  // Auto-scroll chat
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  // Luna AI + MCP simulation
  useEffect(() => {
    if (!aiEnabled) return;
    const t = setInterval(() => {
      const line = AI_LINES[aiIdx.current++ % AI_LINES.length];
      setMessages(prev => [...prev, { id: Date.now(), username: "Luna AI", avatar: "🤖", text: line }]);
      if (Math.random() > 0.7 && mcpConnected) {
        const action = `MCP: ${selectedToken} price alert triggered • Auto-suggested swap ready`;
        setMcpActions(prev => [action, ...prev].slice(0, 5));
      }
    }, 14000);
    return () => clearInterval(t);
  }, [aiEnabled, mcpConnected, selectedToken]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), username: "You.base", avatar: "🦁", text: input }]);
    setInput("");
  };

  const handleTip = recipient => {
    setIsTipping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), username: "System", avatar: "💎", text: `✅ ${tipAmount} ETH tipped to ${recipient}` }]);
      setLeaders(prev => {
        const upd = [...prev], ex = upd.find(l => l.username === recipient);
        if (ex) ex.weeklyTips += parseFloat(tipAmount);
        else upd.push({ username: recipient, weeklyTips: parseFloat(tipAmount) });
        return upd.sort((a,b) => b.weeklyTips - a.weeklyTips).slice(0,5);
      });
      setShowTipModal(null); setIsTipping(false);
    }, 900);
  };

  // ── WAGMI-READY BASE WALLET CONNECT ──
  const handleWalletConnect = async (provider = "coinbase") => {
    setWalletState("connecting");
    setTimeout(() => {
      const mockAddr = provider === "coinbase" 
        ? "0x7845...3918 (Coinbase Smart Wallet)" 
        : "0x91AB...5DbE (MetaMask)";
      setWalletAddress(mockAddr);
      setWalletState("connected");
      setShowWalletModal(false);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        username: "System", 
        avatar: "🎉", 
        text: `Wallet connected! Welcome bonus: 0.001 ETH tip credit added.` 
      }]);
    }, 1600);
  };

  const disconnectWallet = () => {
    setWalletState("disconnected");
    setWalletAddress("");
  };

  // ── VIRAL "SHARE ALPHA → EARN TIPS" MECHANIC ──
  const handleShareAlpha = (text = "") => {
    const alphaText = text || `Just shared alpha on TradeTalk: ${selectedToken} looking bullish on Base! Check it out → tradetalk.base.app #Base #TradeTalk`;
    navigator.clipboard.writeText(alphaText).then(() => {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(alphaText)}`;
      window.open(tweetUrl, "_blank");
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        username: "System", 
        avatar: "🚀", 
        text: `Alpha shared! +0.002 ETH tip credit earned. Keep the alpha flowing!` 
      }]);
      setLeaders(prev => {
        const upd = [...prev];
        const existing = upd.find(l => l.username === "You.base");
        if (existing) existing.weeklyTips += 0.002;
        else upd.push({ username: "You.base", weeklyTips: 0.002 });
        return upd.sort((a,b) => b.weeklyTips - a.weeklyTips).slice(0,5);
      });
    });
  };

  // ── BASE MCP AGENT ──
  const connectMCP = () => {
    setMcpConnected(true);
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      username: "Luna MCP", 
      avatar: "🔵", 
      text: "Base MCP connected! I can now read balances, suggest swaps, and monitor your positions on Base. Try: 'swap 10 USDC to ETH'" 
    }]);
    setMcpActions(["MCP ready • Monitoring your Base positions", "Auto-alerts enabled for selected tokens"]);
  };

  const executeMCPAction = (actionType) => {
    let result = "";
    if (actionType === "swap") {
      result = `MCP executed: Suggested swap ${selectedToken} → USDC on Aerodrome (gas \~0.0003 ETH). Approve in wallet.`;
    } else if (actionType === "alert") {
      result = `MCP Alert set: Notify when ${selectedToken} moves >5% in 1h.`;
    } else if (actionType === "portfolio") {
      result = `MCP Portfolio check: Your total \~\[ {totalPortfolio.toFixed(0)}. Top holding: ${portfolioRows[0]?.sym}.`;
    }
    setMessages(prev => [...prev, { id: Date.now(), username: "Luna MCP", avatar: "🔵", text: result }]);
    setMcpActions(prev => [result.substring(0, 60) + "...", ...prev].slice(0, 5));
  };

  const fmt = (n, sym) => {
    if (!n && n !== 0) return "—";
    if (sym === "cbBTC") return ` \]{Number(n).toLocaleString(undefined,{maximumFractionDigits:0})}`;
    if (n >= 1000) return `\[ {Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}`;
    if (n >= 1) return ` \]{Number(n).toFixed(4)}`;
    return `\[ {Number(n).toFixed(6)}`;
  };

  const fmtChange = v => {
    if (v === undefined || v === null) return "—";
    const n = parseFloat(v);
    return `\( {n >= 0 ? "▲ +" : "▼ "} \){Math.abs(n).toFixed(2)}%`;
  };

  const currentPrice = prices[selectedToken]?.usd;
  const currentChange = prices[selectedToken]?.change24h;

  const portfolioRows = Object.entries(TOKEN_META).map(([sym, meta]) => {
    const price = prices[sym]?.usd ?? 0;
    const value = price * meta.portfolioQty;
    const change = prices[sym]?.change24h ?? 0;
    return { sym, ...meta, price, value, change };
  }).sort((a,b) => b.value - a.value);
  const totalPortfolio = portfolioRows.reduce((s,r) => s+r.value, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#050710", color:"#e8eaf0", fontFamily:"'JetBrains Mono','Fira Code',monospace", display:"flex", flexDirection:"column", width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.25);border-radius:2px;}
        .msg-row:hover .tip-btn{opacity:1!important;}
        .send-btn:hover{background:#0891b2!important;}
        .tab-active{background:rgba(6,182,212,0.1)!important;color:#22d3ee!important;border-bottom:2px solid #22d3ee!important;}
        .tok-card{transition:all 0.18s;cursor:pointer;}
        .tok-card:hover,.tok-card.active{border-color:rgba(6,182,212,0.35)!important;background:rgba(13,18,30,0.95)!important;}
        .nav-btn:hover{color:#e2e8f0!important;}
        .nav-active{color:#22d3ee!important;border-bottom:2px solid #22d3ee;}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)}}
        @keyframes slide-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes price-flash{0%{color:#22d3ee}100%{color:#f0f4ff}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 18px rgba(6,182,212,0.35)}50%{box-shadow:0 0 32px rgba(6,182,212,0.65)}}
        @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
        .price-flash{animation:price-flash 0.5s ease;}
        .msg-anim{animation:slide-in 0.22s ease;}
        .logo{animation:glow 3s infinite;}
        .spinner{width:14px;height:14px;border:2px solid rgba(6,182,212,0.2);border-top-color:#06b6d4;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        .shimmer{background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 75%);background-size:400px 100%;animation:shimmer 1.5s infinite;}
        @media (max-width: 768px) {
          .trade-container { flex-direction: column !important; }
          .chat-panel { width: 100% !important; height: 45vh !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.05) !important; position: relative !important; top: auto !important; }
          .left-panel { padding: 12px !important; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ background:"rgba(5,7,16,0.97)", borderBottom:"1px solid rgba(6,182,212,0.12)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div className="logo" style={{ width:40,height:40,background:"linear-gradient(135deg,#06b6d4,#3b82f6)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,fontFamily:"Syne,sans-serif",color:"#fff" }}>T</div>
            <div>
              <div style={{ fontFamily:"Syne,sans-serif", fontSize:18, fontWeight:900, letterSpacing:"-0.5px" }}>TradeTalk v0.3</div>
              <div style={{ fontSize:8, color:"#06b6d4", letterSpacing:2.5, fontWeight:700 }}>BASE • MCP AGENTS • SOCIAL TRADING</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[["trade","📈 Trade"],["portfolio","💼 Portfolio"]].map(([v,l]) => (
              <button key={v} onClick={() => setMainPanel(v)} className={`nav-btn ${mainPanel===v?"nav-active":""}`} style={{ padding:"8px 16px", background:"transparent", border:"none", borderBottom:"2px solid transparent", color: mainPanel===v?"#22d3ee":"#475569", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700 }}>{l}</button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:9, color: usingMock ? "#f59e0b" : "#10b981" }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background: usingMock ? "#f59e0b" : "#10b981", animation:"pulse-dot 1.5s infinite" }}/>
              {usingMock ? "MOCK PRICES (fallback)" : "LIVE COINGECKO"}
            </div>
            <button onClick={() => setAiEnabled(v => !v)} style={{ fontSize:10, padding:"5px 12px", borderRadius:20, border:"1px solid", borderColor: aiEnabled?"rgba(168,85,247,0.4)":"rgba(255,255,255,0.08)", background: aiEnabled?"rgba(168,85,247,0.08)":"transparent", color: aiEnabled?"#c084fc":"#475569", cursor:"pointer", fontFamily:"inherit" }}>
              {aiEnabled?"🤖 Luna: ON":"🤖 Luna: OFF"}
            </button>
            {mcpConnected && (
              <div style={{ fontSize:9, padding:"4px 10px", borderRadius:20, background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.4)", color:"#3b82f6" }}>
                🔵 MCP Connected
              </div>
            )}
            {walletState === "connected" ? (
              <div style={{ fontSize:9, padding:"5px 12px", borderRadius:20, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#10b981" }}/>
                {walletAddress.substring(0,12)}...
                <button onClick={disconnectWallet} style={{ marginLeft:6, fontSize:9, color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}>×</button>
              </div>
            ) : (
              <button onClick={() => setShowWalletModal(true)} style={{ fontSize:10, padding:"5px 14px", borderRadius:20, background:"linear-gradient(135deg,rgba(6,182,212,0.15),rgba(59,130,246,0.15))", border:"1px solid rgba(6,182,212,0.3)", color:"#22d3ee", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                {walletState==="connecting" ? <><span className="spinner"/> Connecting…</> : "🔗 Connect Wallet (Base)"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* TRADE PANEL */}
      {mainPanel === "trade" && (
        <div className="trade-container" style={{ display:"flex", flex:1, maxWidth:1280, margin:"0 auto", width:"100%", flexDirection: "row" }}>
          <div style={{ flex:1, padding:"18px 14px 18px 22px", display:"flex", flexDirection:"column", gap:14, overflowY:"auto", minWidth:0 }} className="left-panel">
            
            {/* Price Hero */}
            <div style={{ background:"linear-gradient(135deg,rgba(12,15,26,0.95),rgba(5,7,16,0.95))", border:"1px solid rgba(6,182,212,0.13)", borderRadius:18, padding:"22px 26px", position:"relative", overflow:"hidden" }}>
              <div style={{ fontSize:10, color:"#475569", marginBottom:5, letterSpacing:1.5 }}>{selectedToken} / USDC • BASE CHAIN {usingMock && "(Fallback Mode)"}</div>
              <div key={currentPrice} className="price-flash" style={{ fontFamily:"Syne,sans-serif", fontSize:42, fontWeight:900, letterSpacing:"-1px" }}>
                {priceLoading ? <div style={{ width:200, height:40, borderRadius:8 }} className="shimmer"/> : fmt(currentPrice, selectedToken)}
              </div>
              <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ color: parseFloat(currentChange)>=0?"#10b981":"#ef4444", fontSize:14, fontWeight:700 }}>
                  {fmtChange(currentChange)}
                </span>
                <span style={{ color:"#334155", fontSize:10 }}>24h</span>
                <button onClick={() => handleShareAlpha()} style={{ fontSize:10, padding:"4px 10px", borderRadius:8, background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.4)", color:"#fbbf24", cursor:"pointer", fontFamily:"inherit" }}>
                  🚀 Share Alpha → Earn Tips
                </button>
              </div>
            </div>

            {/* Token Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:8 }}>
              {Object.entries(TOKEN_META).map(([sym, meta]) => {
                const p = prices[sym]; 
                const isActive = selectedToken===sym;
                return (
                  <div key={sym} className={`tok-card ${isActive?"active":""}`} onClick={() => setSelectedToken(sym)} style={{ background:"rgba(12,15,26,0.7)", border:`1px solid ${isActive?"rgba(6,182,212,0.3)":"rgba(255,255,255,0.05)"}`, borderRadius:12, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ fontSize:14 }}>{meta.avatar}</span>
                          <span style={{ fontSize:12, fontWeight:700, color: meta.color }}>{sym}</span>
                        </div>
                        <div style={{ fontSize:9, color:"#334155", marginTop:1 }}>{meta.name}</div>
                      </div>
                      <Sparkline data={sparks[sym]||[0,0]} color={meta.color} width={55} height={22}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{fmt(p?.usd, sym)}</div>
                    <div style={{ fontSize:10, color: parseFloat(p?.change24h)>=0?"#10b981":"#ef4444", marginTop:2 }}>
                      {fmtChange(p?.change24h)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart + MCP Tab */}
            <div style={{ background:"rgba(12,15,26,0.7)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:18, flex:1, overflow:"hidden", minHeight: "380px" }}>
              <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"0 14px", alignItems:"center", justifyContent:"space-between" }}>
                {["chart","orderbook","info","mcp"].map(t => (
                  <button key={t} onClick={() => setTab(t)} className={tab===t?"tab-active":""} style={{ padding:"12px 16px", fontSize:10, fontWeight:700, border:"none", borderBottom:"2px solid transparent", background:"transparent", color:"#475569", cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase", letterSpacing:1.5 }}>{t}</button>
                ))}
                {!mcpConnected && (
                  <button onClick={connectMCP} style={{ fontSize:9, padding:"4px 10px", borderRadius:8, background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.4)", color:"#3b82f6", cursor:"pointer" }}>
                    🔵 Connect Base MCP
                  </button>
                )}
              </div>
              <div style={{ padding:"14px 18px 18px" }}>
                {tab==="chart" && <>
                  <div style={{ fontSize:10, color:"#334155", marginBottom:8, letterSpacing:1 }}>{selectedToken}/USDC • 1H</div>
                  <div style={{ height:170 }}><CandlestickChart height={170} candles={CANDLES}/></div>
                </>}
                {tab==="mcp" && (
                  <div>
                    <div style={{ fontSize:11, color:"#3b82f6", marginBottom:10 }}>🔵 Base MCP Agent • Luna</div>
                    {!mcpConnected ? (
                      <button onClick={connectMCP} style={{ padding:"12px 20px", background:"rgba(59,130,246,0.2)", border:"1px solid #3b82f6", color:"#fff", borderRadius:12, cursor:"pointer", fontFamily:"inherit" }}>
                        Connect Luna MCP Agent (Free)
                      </button>
                    ) : (
                      <div>
                        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                          <button onClick={() => executeMCPAction("swap")} style={{ padding:"8px 14px", background:"rgba(16,185,129,0.15)", border:"1px solid #10b981", color:"#10b981", borderRadius:10, fontSize:11, cursor:"pointer" }}>Swap {selectedToken} → USDC</button>
                          <button onClick={() => executeMCPAction("alert")} style={{ padding:"8px 14px", background:"rgba(245,158,11,0.15)", border:"1px solid #f59e0b", color:"#f59e0b", borderRadius:10, fontSize:11, cursor:"pointer" }}>Set Price Alert</button>
                          <button onClick={() => executeMCPAction("portfolio")} style={{ padding:"8px 14px", background:"rgba(6,182,212,0.15)", border:"1px solid #06b6d4", color:"#06b6d4", borderRadius:10, fontSize:11, cursor:"pointer" }}>Check Portfolio</button>
                        </div>
                        <div style={{ fontSize:10, color:"#64748b", marginBottom:6 }}>Recent MCP Actions:</div>
                        {mcpActions.length > 0 ? mcpActions.map((a,i) => <div key={i} style={{ fontSize:10, padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{a}</div>) : <div style={{ fontSize:10, color:"#475569" }}>No actions yet. Try the buttons above.</div>}
                      </div>
                    )}
                    <div style={{ fontSize:9, color:"#475569", marginTop:12 }}>MCP = Onchain AI agent via Base. Real version uses your connected wallet.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CHAT + VIRAL */}
          <div className="chat-panel" style={{ width:340, minWidth: 300, borderLeft:"1px solid rgba(255,255,255,0.05)", background:"rgba(7,8,18,0.85)", display:"flex", flexDirection:"column", height:"calc(100vh - 65px)", position:"sticky", top:65 }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:700, fontSize:12 }}>💬 Live Trading Room</div>
              <div style={{ fontSize:9, color:"#10b981", display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:5,height:5,borderRadius:"50%",background:"#10b981",animation:"pulse-dot 1.5s infinite" }}/>
                {messages.length} ONLINE
              </div>
            </div>

            <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:12 }}>
              {messages.map(msg => (
                <div key={msg.id} className="msg-row msg-anim" style={{ display:"flex", gap:9 }}>
                  <div style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{msg.avatar}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                      <span style={{ fontSize:10, fontWeight:700, color: msg.username.includes("Luna") || msg.username.includes("MCP") ? "#3b82f6" : msg.username==="System"?"#fbbf24":"#22d3ee", whiteSpace:"nowrap" }}>{msg.username}</span>
                      {!["Luna AI","Luna MCP","System","You.base"].includes(msg.username) && (
                        <button className="tip-btn" onClick={() => setShowTipModal({user:msg.username})} style={{ opacity:0, fontSize:9, padding:"2px 7px", borderRadius:8, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.25)", color:"#fbbf24", cursor:"pointer", fontFamily:"inherit", transition:"opacity 0.2s" }}>💎 Tip</button>
                      )}
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2, lineHeight:1.5, wordBreak:"break-word" }}>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex", gap:7 }}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()}
                  placeholder="Share your alpha or ask Luna MCP..."
                  style={{ flex:1, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"9px 12px", fontSize:11, color:"#e2e8f0", border:"1px solid rgba(255,255,255,0.07)", outline:"none", fontFamily:"inherit" }}/>
                <button onClick={handleSend} className="send-btn" style={{ padding:"9px 16px", background:"#0e7490", color:"#fff", fontWeight:700, borderRadius:10, border:"none", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>Send</button>
              </div>
              <button onClick={() => handleShareAlpha()} style={{ marginTop:8, width:"100%", padding:"8px", fontSize:10, borderRadius:10, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.35)", color:"#fbbf24", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                🚀 Share This Alpha on X → Earn 0.002 ETH Tip Credit
              </button>
            </div>

            {leaders.length > 0 && (
              <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize:9, color:"#334155", marginBottom:6, letterSpacing:1.5 }}>🏆 WEEKLY TOP TIPPERS & SHARERS</div>
                {leaders.map((l,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:10, padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{ color:"#64748b" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]} {l.username}</span>
                    <span style={{ color:"#fbbf24", fontWeight:700 }}>{l.weeklyTips.toFixed(3)} ETH</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PORTFOLIO PANEL (simplified for brevity - full version in file) */}
      {mainPanel === "portfolio" && (
        <div style={{ maxWidth:1280, margin:"0 auto", width:"100%", padding:"24px 24px" }}>
          <div style={{ background:"linear-gradient(135deg,rgba(12,15,26,0.95),rgba(5,7,16,0.95))", border:"1px solid rgba(6,182,212,0.13)", borderRadius:20, padding:"28px 32px", marginBottom:20 }}>
            <div style={{ fontSize:10, color:"#475569", letterSpacing:2, marginBottom:6 }}>
              {walletState==="connected" ? walletAddress + " • BASE CHAIN" : "DEMO PORTFOLIO • CONNECT WALLET FOR LIVE DATA & MCP"}
            </div>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:38, fontWeight:900, letterSpacing:"-0.5px" }}>
              {priceLoading ? <div style={{ width:200, height:40, borderRadius:8 }} className="shimmer"/> : ` \]{totalPortfolio.toFixed(2)}`}
            </div>
          </div>
          <div style={{ background:"rgba(12,15,26,0.7)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:18, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1.5fr 1.5fr 1fr", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:9, color:"#334155", letterSpacing:2, fontWeight:700 }}>
              <span>ASSET</span><span style={{ textAlign:"right" }}>PRICE</span><span style={{ textAlign:"right" }}>HOLDINGS</span><span style={{ textAlign:"right" }}>VALUE</span><span style={{ textAlign:"right" }}>24H</span>
            </div>
            {portfolioRows.map(row => (
              <div key={row.sym} style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1.5fr 1.5fr 1fr", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.03)", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:`rgba(${row.color.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.15)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{row.avatar}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:row.color }}>{row.sym}</div>
                    <div style={{ fontSize:10, color:"#334155" }}>{row.name}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right", fontSize:12, fontWeight:600 }}>{fmt(row.price, row.sym)}</div>
                <div style={{ textAlign:"right", fontSize:11, color:"#64748b" }}>{row.portfolioQty >= 1 ? row.portfolioQty.toLocaleString() : row.portfolioQty} {row.sym}</div>
                <div style={{ textAlign:"right", fontSize:12, fontWeight:700 }}>${row.value.toFixed(2)}</div>
                <div style={{ textAlign:"right", fontSize:11, color: parseFloat(row.change)>=0?"#10b981":"#ef4444", fontWeight:600 }}>{fmtChange(row.change)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WALLET MODAL */}
      {showWalletModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }} onClick={()=>setShowWalletModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#0a0c1a", border:"1px solid rgba(6,182,212,0.2)", borderRadius:24, padding:32, width:340, boxShadow:"0 0 80px rgba(6,182,212,0.12)" }}>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:20, fontWeight:900, marginBottom:4 }}>Connect to Base</div>
            <div style={{ fontSize:11, color:"#475569", marginBottom:20 }}>Real wagmi integration ready.</div>
            
            <button onClick={() => handleWalletConnect("coinbase")} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, cursor:"pointer", fontFamily:"inherit", color:"#e2e8f0", marginBottom:8 }}>
              <span style={{ fontSize:22 }}>🔵</span>
              <div style={{ textAlign:"left" }}><div style={{ fontSize:13, fontWeight:700 }}>Coinbase Smart Wallet</div><div style={{ fontSize:10, color:"#475569" }}>Recommended for Base • Gasless</div></div>
            </button>
            <button onClick={() => handleWalletConnect("metamask")} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, cursor:"pointer", fontFamily:"inherit", color:"#e2e8f0", marginBottom:8 }}>
              <span style={{ fontSize:22 }}>🦊</span>
              <div style={{ textAlign:"left" }}><div style={{ fontSize:13, fontWeight:700 }}>MetaMask</div><div style={{ fontSize:10, color:"#475569" }}>Browser extension</div></div>
            </button>
            
            <div style={{ fontSize:9, color:"#64748b", marginTop:12, textAlign:"center" }}>Production: Use wagmi + viem on Base chain.</div>
            <button onClick={()=>setShowWalletModal(false)} style={{ width:"100%", padding:"12px", marginTop:16, borderRadius:14, border:"1px solid rgba(255,255,255,0.07)", background:"transparent", color:"#475569", cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* TIP MODAL */}
      {showTipModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div style={{ background:"#0a0c1a", border:"1px solid rgba(6,182,212,0.2)", borderRadius:24, padding:30, width:290, boxShadow:"0 0 60px rgba(6,182,212,0.12)" }}>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:17, fontWeight:900, marginBottom:4 }}>💎 Send Tip</div>
            <div style={{ fontSize:11, color:"#475569", marginBottom:20 }}>to {showTipModal.user}</div>
            <div style={{ fontSize:10, color:"#334155", marginBottom:7, letterSpacing:1 }}>AMOUNT (ETH)</div>
            <input type="number" value={tipAmount} onChange={e=>setTipAmount(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:"12px 16px", fontSize:26, fontWeight:700, color:"#22d3ee", fontFamily:"inherit", outline:"none", marginBottom:16 }}/>
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              {["0.001","0.005","0.01"].map(v=>(
                <button key={v} onClick={()=>setTipAmount(v)} style={{ flex:1, padding:"7px", fontSize:10, borderRadius:9, cursor:"pointer", border:"1px solid rgba(255,255,255,0.08)", background: tipAmount===v?"rgba(6,182,212,0.12)":"rgba(255,255,255,0.03)", color: tipAmount===v?"#22d3ee":"#475569", fontFamily:"inherit", transition:"all 0.15s" }}>{v}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={()=>setShowTipModal(null)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#475569", cursor:"pointer", fontFamily:"inherit", fontSize:12 }}>Cancel</button>
              <button onClick={()=>handleTip(showTipModal.user)} disabled={isTipping} style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background: isTipping?"#0f766e":"#059669", color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:12, transition:"background 0.2s" }}>{isTipping?"Sending…":"✅ Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}