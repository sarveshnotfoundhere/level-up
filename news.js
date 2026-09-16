/*
LEVEL UP V5 — LIVE DATA LAYER
Set LIVE_CONFIG.enabled = true and point endpoint to your own secure
server/serverless endpoint. Keep provider API keys on the server, never here.
*/
const LIVE_CONFIG = {
  enabled: false,
  endpoint: "/api/market-news",
  refreshMs: 60000
};

const newsStories = [
  {
    tag:"FINTECH", source:"REUTERS", time:"SEP 15, 2026",
    title:"India's UPI prepares for a new merchant-fee era",
    summary:"NPCI announced a 0.4% merchant discount rate on UPI transactions above ₹2,000 from October 15, with exemptions for smaller QR merchants and selected categories.",
    url:"https://www.reuters.com/world/india/india-payments-authority-sets-04-fee-upi-merchant-payments-above-2000-rupees-2026-09-15/"
  },
  {
    tag:"MARKETS", source:"REUTERS", time:"SEP 15, 2026",
    title:"Rupee and bonds watch oil and the Federal Reserve",
    summary:"The rupee and Indian bonds are being watched against high oil prices, inflation expectations and the U.S. Federal Reserve rate outlook.",
    url:"https://www.reuters.com/world/india/indian-rupee-bonds-eye-fed-decision-rate-outlook-2026-09-15/"
  },
  {
    tag:"AI", source:"REUTERS", time:"SEP 10, 2026",
    title:"India plans a registry for AI agents using UPI",
    summary:"NPCI is developing a registry intended to verify and monitor AI agents that make payments on behalf of users as agentic payments are developed.",
    url:"https://www.reuters.com/world/india/india-plans-ai-registry-it-looks-roll-out-agentic-payments-sources-say-2026-09-10/"
  },
  {
    tag:"AI", source:"FINANCIAL TIMES", time:"2026",
    title:"AI changes the work of audit",
    summary:"Audit firms are applying AI to transaction review, anomaly detection and research while retaining human oversight for professional judgment.",
    url:"https://www.ft.com/"
  },
  {
    tag:"AI", source:"BIS", time:"JUL 30, 2026",
    title:"AI agents push financial innovation forward",
    summary:"The growth of AI agents creates new opportunities in finance alongside questions around governance, accountability and operational risk.",
    url:"https://www.bis.org/"
  },
  {
    tag:"ACCOUNTING", source:"BLACKLINE", time:"JUL 27, 2026",
    title:"Governed AI enters financial reconciliation",
    summary:"Accounting platforms are moving toward AI-assisted reconciliation with traceability, controls and human oversight built into workflows.",
    url:"https://www.blackline.com/"
  },
  {
    tag:"ACCOUNTING", source:"PILOT", time:"JUN 16, 2026",
    title:"AI targets the month-end close",
    summary:"Accounting technology providers are moving from individual automations toward broader AI-assisted close and bookkeeping workflows.",
    url:"https://pilot.com/"
  },
  {
    tag:"ACCOUNTING", source:"KARBON", time:"MAY 20, 2026",
    title:"AI accounting tools target Indian SMEs",
    summary:"AI bookkeeping and reconciliation products are increasingly being designed around local compliance and small-business finance needs.",
    url:"https://www.karbonhq.com/"
  }
];

const marketData = [
  ["NIFTY 50","23,118.60","-279.50","-1.19%","down"],
  ["SENSEX","74,003.82","-777.94","-1.04%","down"],
  ["NIFTY BANK","55,794.75","-811.80","-1.43%","down"],
  ["NIFTY IT","29,555.30","+633.80","+2.19%","up"],
  ["GOLD","—","—","—","flat"],
  ["USD / INR","95.55","—","—","flat"]
];

const grid=document.getElementById("newsGrid");
const count=document.getElementById("storyCount");
const input=document.getElementById("newsSearch");
const market=document.getElementById("marketPulse");
let active="ALL";

function renderNews(){
  const q=input.value.toLowerCase().trim();
  const rows=newsStories.filter(s=>
    (active==="ALL"||s.tag===active) &&
    `${s.tag} ${s.source} ${s.title} ${s.summary}`.toLowerCase().includes(q)
  );
  count.textContent=`${rows.length} STORIES`;
  grid.innerHTML=rows.length ? rows.map(s=>`
    <article class="news-card" onclick="window.open('${s.url}','_blank','noopener')">
      <div class="meta"><span class="tag">${s.tag}</span><span>${s.source} · ${s.time}</span></div>
      <h3>${s.title}</h3>
      <p>${s.summary}</p>
      <span class="story-link">READ SOURCE ↗</span>
    </article>`).join("") :
    `<div style="padding:60px 0;color:#777">NO STORIES FOUND.</div>`;
}

function renderMarket(rows){
  market.innerHTML=rows.map(x=>`
    <div class="market-item">
      <div><strong>${x[0]}</strong><br><span>${x[1]} ${x[2] || ""}</span></div>
      <b class="${x[4]}">${x[3]}</b>
    </div>`).join("");
}

async function loadLiveData(){
  if(!LIVE_CONFIG.enabled) return;
  try{
    const res=await fetch(LIVE_CONFIG.endpoint,{headers:{Accept:"application/json"}});
    if(!res.ok) throw new Error("Live endpoint unavailable");
    const data=await res.json();
    if(Array.isArray(data.news)) newsStories.splice(0,newsStories.length,...data.news);
    if(Array.isArray(data.markets)) renderMarket(data.markets);
    renderNews();
    document.body.classList.add("live-connected");
  }catch(err){
    console.warn("LEVEL UP live data fallback:",err.message);
  }
}

document.querySelectorAll("#newsFilters button").forEach(b=>b.onclick=()=>{
  active=b.dataset.filter;
  document.querySelectorAll("#newsFilters button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  renderNews();
});
input.oninput=renderNews;

renderMarket(marketData);
renderNews();
loadLiveData();
if(LIVE_CONFIG.enabled) setInterval(loadLiveData,LIVE_CONFIG.refreshMs);

const dialog=document.getElementById("searchDialog");
document.getElementById("openSearch").onclick=()=>dialog.showModal();
document.getElementById("closeSearch").onclick=()=>dialog.close();
document.getElementById("globalSearch").oninput=e=>{
  const q=e.target.value.toLowerCase().trim(), box=document.getElementById("searchResults");
  if(!q){box.innerHTML="";return}
  const matches=newsStories.filter(s=>`${s.tag} ${s.source} ${s.title} ${s.summary}`.toLowerCase().includes(q)).slice(0,8);
  box.innerHTML=matches.map(s=>`<div class="result"><strong>${s.title}</strong><small>${s.tag} · ${s.source}</small></div>`).join("")||`<p style="color:#777">No results found.</p>`;
};
