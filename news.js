const LIVE_CONFIG = {
  enabled: true,
  endpoint: "/api/market-news",
  refreshMs: 1800000
};

const newsStories = [
  {tag:"FINTECH", source:"LEVEL UP", time:"LATEST", title:"Loading the latest finance developments…", summary:"Fetching recent reporting across accounting, AI, fintech, banking and digital finance.", url:"#"}
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
  grid.innerHTML=rows.length?rows.map(s=>`
    <article class="news-card" onclick="window.open('${s.url}','_blank','noopener')">
      <div class="meta"><span class="tag">${s.tag}</span><span>${s.source} · ${s.time}</span></div>
      <h3>${s.title}</h3>
      <p>${s.summary}</p>
      <span class="story-link">READ SOURCE ↗</span>
    </article>`).join(""):`<div style="padding:60px 0;color:#777">NO STORIES FOUND.</div>`;
}

function renderMarket(rows){
  if(!market)return;
  market.innerHTML=rows?.length?rows.map(x=>`
    <div class="market-item"><div><strong>${x[0]}</strong><br><span>${x[1]} ${x[2]||""}</span></div><b class="${x[4]}">${x[3]}</b></div>`).join(""):"";
}

async function loadLiveData(){
  try{
    const res=await fetch(`${LIVE_CONFIG.endpoint}?t=${Date.now()}`,{
      headers:{Accept:"application/json"},
      cache:"no-store"
    });
    if(!res.ok)throw new Error("News endpoint unavailable");
    const data=await res.json();
    if(Array.isArray(data.news)&&data.news.length){
      newsStories.splice(0,newsStories.length,...data.news);
      renderNews();
    }
    if(Array.isArray(data.markets))renderMarket(data.markets);
  }catch(err){
    console.warn("LEVEL UP newsroom connection:",err.message);
  }
}

document.querySelectorAll("#newsFilters button").forEach(b=>b.onclick=()=>{
  active=b.dataset.filter;
  document.querySelectorAll("#newsFilters button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  renderNews();
});
input.oninput=renderNews;
renderMarket([]);
renderNews();
loadLiveData();
setInterval(loadLiveData,LIVE_CONFIG.refreshMs);

const dialog=document.getElementById("searchDialog");
document.getElementById("openSearch").onclick=()=>dialog.showModal();
document.getElementById("closeSearch").onclick=()=>dialog.close();
document.getElementById("globalSearch").oninput=e=>{
  const q=e.target.value.toLowerCase().trim(),box=document.getElementById("searchResults");
  if(!q){box.innerHTML="";return}
  const matches=newsStories.filter(s=>`${s.tag} ${s.source} ${s.title} ${s.summary}`.toLowerCase().includes(q)).slice(0,8);
  box.innerHTML=matches.map(s=>`<a class="result" href="${s.url}" target="_blank" rel="noopener"><strong>${s.title}</strong><small>${s.tag} · ${s.source}</small></a>`).join("")||`<p style="color:#777">No results found.</p>`;
};