const MARKET_CONFIG={refreshMs:60000};

const QUOTES=[
  ["GC=F","GOLD","COMMODITY","USD / TROY OZ"],
  ["CL=F","WTI OIL","COMMODITY","USD / BARREL"],
  ["BZ=F","BRENT OIL","COMMODITY","USD / BARREL"],
  ["^GSPC","S&P 500","INDEX","INDEX"],
  ["^IXIC","NASDAQ","INDEX","INDEX"],
  ["^DJI","DOW JONES","INDEX","INDEX"],
  ["^FTSE","FTSE 100","INDEX","INDEX"],
  ["^N225","NIKKEI 225","INDEX","INDEX"],
  ["BTC-USD","BITCOIN","DIGITAL ASSET","USD"],
  ["EURUSD=X","EUR / USD","FX","RATE"],
  ["JPY=X","USD / JPY","FX","RATE"],
  ["INR=X","USD / INR","FX","RATE"]
];

const CURRENCIES=[
  ["USD","US DOLLAR","United States"],
  ["EUR","EURO","Euro Area"],
  ["JPY","JAPANESE YEN","Japan"],
  ["GBP","POUND STERLING","United Kingdom"],
  ["CNY","YUAN","China"],
  ["CHF","SWISS FRANC","Switzerland"],
  ["INR","INDIAN RUPEE","India"],
  ["KRW","SOUTH KOREAN WON","South Korea"],
  ["CAD","CANADIAN DOLLAR","Canada"],
  ["AUD","AUSTRALIAN DOLLAR","Australia"]
];

const moneyGrid=document.getElementById("moneyGrid");
const marketGrid=document.getElementById("globalMarketGrid");

function marketClass(change){return change>0?"up":change<0?"down":"flat"}

function render(data){
  moneyGrid.innerHTML=(data.currencies||[]).map((x,i)=>`<article class="money-card ${marketClass(x.changePct)}">
    <div class="money-top"><span class="currency-name">${i+1}. ${x.name}</span><span class="currency-rank">${x.country}</span></div>
    <div><h3>${x.code}</h3><div class="money-value">${x.rate}</div><div class="money-change">${x.changePct>0?"▲":x.changePct<0?"▼":"—"} ${Math.abs(x.changePct).toFixed(2)}% VS PREVIOUS CLOSE</div></div>
  </article>`).join("");

  marketGrid.innerHTML=(data.markets||[]).map(x=>`<article class="global-market-card ${marketClass(x.changePct)}">
    <span class="market-type">${x.type}</span>
    <h3>${x.name}</h3>
    <div class="market-price">${x.price} <small>${x.suffix}</small></div>
    <div class="market-change">${x.changePct>0?"▲":x.changePct<0?"▼":"—"} ${Math.abs(x.changePct).toFixed(2)}%</div>
    <div class="market-time">${x.time}</div>
  </article>`).join("");

  const stamp=data.updatedAt?new Date(data.updatedAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Asia/Kolkata"}):"—";
  document.getElementById("moneyUpdated").textContent="UPDATED "+stamp;
  document.getElementById("marketsUpdated").textContent="UPDATED "+stamp;
}

async function loadMarkets(){
  try{
    const res=await fetch("/api/market-data?t="+Date.now(),{cache:"no-store",headers:{Accept:"application/json"}});
    if(!res.ok)throw new Error("Market data unavailable");
    render(await res.json());
  }catch(e){
    console.warn("LEVEL UP markets:",e.message);
    document.getElementById("moneyUpdated").textContent="DATA UNAVAILABLE";
    document.getElementById("marketsUpdated").textContent="DATA UNAVAILABLE";
  }
}
loadMarkets();
setInterval(loadMarkets,MARKET_CONFIG.refreshMs);
