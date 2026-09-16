const cases = [
["01","JPMorgan Chase","AI & Banking","Applications of machine learning and AI across financial services, operations and risk.","AI","BANKING"],
["02","Microsoft","AI & Finance","AI and automation applied to finance operations, analysis and business workflows.","AI","AUTOMATION"],
["03","Intuit","GenAI & Accounting","AI-powered financial assistance and automation within accounting and small-business finance software.","AI","ACCOUNTING"],
["04","EY","GenAI & Audit","Exploring generative AI across audit and professional-services workflows.","AI","AUDIT"],
["05","Deloitte","Intelligent Automation","RPA and intelligent automation applications across finance and accounting processes.","RPA","ACCOUNTING"],
["06","PwC","Automation in Finance","Intelligent automation used to streamline repetitive finance workflows.","RPA","FINANCE"],
["07","UiPath","Accounts Payable","Automation of repetitive invoice and accounts-payable processes.","RPA","ACCOUNTING"],
["08","Walmart","Blockchain Supply Chain","Blockchain used to improve traceability and information sharing in supply-chain processes.","BLOCKCHAIN","SUPPLY CHAIN"],
["09","Maersk","Blockchain & Trade","Distributed-ledger technology applied to global trade documentation and logistics.","BLOCKCHAIN","FINTECH"],
["10","JPMorgan","Blockchain Infrastructure","Blockchain-based infrastructure explored for financial transactions and institutional finance.","BLOCKCHAIN","BANKING"],
["11","Xero","Cloud Accounting","Cloud accounting enabling real-time access, collaboration and integrations for businesses.","CLOUD","ACCOUNTING"],
["12","Intuit QuickBooks","Cloud Finance","Cloud-based accounting tools connecting bookkeeping, reporting and business workflows.","CLOUD","ACCOUNTING"],
["13","SAP","Cloud ERP","Cloud financial-management systems integrating accounting and enterprise operations.","CLOUD","ERP"],
["14","Oracle","Cloud Financials","Cloud-based financial management, reporting and enterprise accounting capabilities.","CLOUD","ERP"],
["15","UPI","Digital Payments","India's interoperable instant-payment infrastructure and its impact on digital transactions.","PAYMENTS","INDIA"],
["16","PhonePe","Digital Payments","A major digital-payments platform built around India's expanding payments ecosystem.","PAYMENTS","INDIA"],
["17","Razorpay","Payment Infrastructure","Payment infrastructure connecting businesses with digital collection and transaction tools.","PAYMENTS","FINTECH"],
["18","Stripe","Payments Infrastructure","APIs and financial infrastructure enabling online businesses to accept and manage payments.","PAYMENTS","FINTECH"],
["19","Revolut","Digital Banking","Technology-led banking services combining payments, accounts and financial products.","BANKING","FINTECH"],
["20","Nubank","Digital Banking","Digital-first banking model built around mobile technology and scalable financial services.","BANKING","FINTECH"],
["21","Morgan Stanley","AI & Wealth Management","AI-assisted tools explored for research, productivity and wealth-management workflows.","AI","WEALTHTECH"],
["22","DBS Bank","Digital Transformation","Technology-led transformation of banking operations and customer experiences.","BANKING","DIGITAL"],
["23","ICICI Bank","Digital Banking","Digital channels and technology used to transform customer banking services.","BANKING","INDIA"],
["24","Goldman Sachs","AI in Finance","AI applications across research, software development and financial workflows.","AI","BANKING"],
["25","Deloitte","Blockchain & Audit","Exploration of distributed-ledger technology and implications for audit and assurance.","BLOCKCHAIN","AUDIT"],
["26","KPMG","Automation & Audit","Automation and analytics applied to audit and finance processes.","RPA","AUDIT"],
["27","Siemens","Finance Automation","Automation used to improve finance-process efficiency at enterprise scale.","RPA","FINANCE"],
["28","Microsoft Dynamics","Cloud Finance","Cloud financial-management tools connecting accounting, ERP and business analytics.","CLOUD","ERP"],
["29","Razorpay","Embedded Finance","Financial capabilities embedded into digital business workflows and platforms.","FINTECH","PAYMENTS"],
["30","Stripe","Embedded Finance","Financial infrastructure APIs extending payments into broader software ecosystems.","FINTECH","PAYMENTS"]
];

const news = [
["AI","AI adoption is reshaping finance-team workflows","AI in finance is moving beyond experimentation into document processing, analysis, workflow automation and decision support.","LEVEL UP"],
["FINTECH","Digital payments continue to expand financial infrastructure","Payment platforms are increasingly becoming programmable infrastructure for businesses and consumers.","LEVEL UP"],
["ACCOUNTING","Cloud accounting is becoming an integrated data layer","Modern accounting platforms connect transactions, reporting, payroll, payments and analytics.","LEVEL UP"],
["BLOCKCHAIN","Distributed ledgers remain relevant to financial infrastructure","Institutional experiments continue around tokenisation, settlement, trade and digital assets.","LEVEL UP"],
["REGTECH","Compliance technology is becoming increasingly data-driven","KYC, AML, monitoring and regulatory reporting are increasingly supported by automation and analytics.","LEVEL UP"],
["AI","The next finance interface may be conversational","AI assistants can help users query financial information, explain variances and accelerate routine analysis.","LEVEL UP"]
];

const tickerItems = [
"AI IN ACCOUNTING","FINTECH DEVELOPMENTS","DIGITAL PAYMENTS","RPA & AUTOMATION",
"BLOCKCHAIN","CLOUD ACCOUNTING","GENERATIVE AI","FINANCIAL TECHNOLOGY"
];
document.getElementById("tickerTrack").innerHTML = [...tickerItems,...tickerItems].map(x=>`<span>${x}</span>`).join("");

const grid = document.getElementById("caseGrid");
const filters = document.getElementById("filters");
const categories = ["ALL",...new Set(cases.map(c=>c[4]))];
filters.innerHTML = categories.map(c=>`<button class="filter ${c==="ALL"?"active":""}" data-filter="${c}">${c}</button>`).join("");

let activeFilter="ALL";
function renderCases(){
  const q=(document.getElementById("caseSearch").value||"").toLowerCase();
  const visible=cases.filter(c=>(activeFilter==="ALL"||c[4]===activeFilter)&&c.slice(1).join(" ").toLowerCase().includes(q));
  grid.innerHTML=visible.map(c=>`
    <article class="case-card" onclick="window.location.href='case-study.html?id=${encodeURIComponent(c[0])}'">
      <span class="index">${c[0]} / ${c[4]}</span>
      <h3>${c[1]}</h3>
      <div class="tag">${c[2]}</div>
      <p>${c[3]}</p>
      <div class="chips"><span class="chip">${c[4]}</span><span class="chip">${c[5]}</span></div>
    </article>`).join("") || `<p style="padding:30px;color:#777">No case studies found.</p>`;
}
filters.addEventListener("click",e=>{
  if(!e.target.matches(".filter")) return;
  activeFilter=e.target.dataset.filter;
  document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===e.target));
  renderCases();
});
document.getElementById("caseSearch").addEventListener("input",renderCases);
renderCases();

document.getElementById("newsGrid").innerHTML=news.map(n=>`
<article class="news-card"><div class="tag">${n[0]}</div><h3>${n[1]}</h3><p>${n[2]}</p><small>${n[3]}</small></article>`).join("");

const dialog=document.getElementById("searchDialog");
document.getElementById("openSearch").onclick=()=>dialog.showModal();
document.getElementById("closeSearch").onclick=()=>dialog.close();
const globalSearch=document.getElementById("globalSearch");
globalSearch.addEventListener("input",()=>{
  const q=globalSearch.value.toLowerCase().trim();
  const result=document.getElementById("searchResults");
  if(!q){result.innerHTML="";return}
  const hits=cases.filter(c=>c.slice(1).join(" ").toLowerCase().includes(q)).slice(0,8);
  result.innerHTML=hits.map(c=>`<div class="result"><strong>${c[1]}</strong><small>${c[2]} · ${c[4]} · ${c[5]}</small></div>`).join("") || `<p style="color:#777">No results.</p>`;
});

const revealTargets = document.querySelectorAll(".section,.dark-section,.case-section,.news-section,.market-section,.insights,.feature");
revealTargets.forEach(el=>el.classList.add("reveal"));
const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}})
},{threshold:.08});
revealTargets.forEach(el=>revealObserver.observe(el));

document.querySelectorAll("#newsGrid .news-card").forEach(card=>card.addEventListener("click",()=>window.location.href="news.html"));