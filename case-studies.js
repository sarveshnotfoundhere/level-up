const caseStudies=[
["01","JPMorgan Chase","AI in Financial Services","AI and machine learning applications across financial services, operations, analysis and risk.","AI","BANKING"],
["02","Microsoft","AI & Finance Operations","AI and automation applied to finance operations, analysis and business workflows.","AI","ACCOUNTING"],
["03","Intuit","Generative AI & Accounting","AI-powered financial assistance and automation integrated into accounting and small-business finance software.","AI","ACCOUNTING"],
["04","EY","Generative AI & Audit","Generative AI applications across audit, research and professional-services workflows.","AI","AUDIT"],
["05","Deloitte","Intelligent Automation","RPA and intelligent automation applied across finance and accounting processes.","RPA","ACCOUNTING"],
["06","PwC","Automation in Finance","Intelligent automation used to streamline repetitive finance workflows.","RPA","FINANCE"],
["07","UiPath","Accounts Payable Automation","Automation of repetitive invoice-processing and accounts-payable workflows.","RPA","ACCOUNTING"],
["08","Walmart","Blockchain Supply Chain","Blockchain used to improve traceability and information sharing across supply-chain processes.","BLOCKCHAIN","SUPPLY CHAIN"],
["09","Maersk","Blockchain & Global Trade","Distributed-ledger technology applied to trade documentation and logistics.","BLOCKCHAIN","FINTECH"],
["10","JPMorgan","Blockchain Financial Infrastructure","Blockchain-based infrastructure explored for institutional financial transactions.","BLOCKCHAIN","BANKING"],
["11","Xero","Cloud Accounting","Cloud accounting enabling real-time access, collaboration and integrations.","CLOUD","ACCOUNTING"],
["12","Intuit QuickBooks","Cloud Finance","Cloud-based accounting connecting bookkeeping, reporting and business workflows.","CLOUD","ACCOUNTING"],
["13","SAP","Cloud ERP & Finance","Cloud financial-management systems integrating accounting with enterprise operations.","CLOUD","ERP"],
["14","Oracle","Cloud Financial Management","Cloud-based financial management, reporting and enterprise accounting capabilities.","CLOUD","ERP"],
["15","UPI","India's Digital Payments Ecosystem","Interoperable instant-payment infrastructure and its impact on digital transactions.","FINTECH","PAYMENTS"],
["16","PhonePe","Digital Payments","Digital-payments platform built around India's expanding payments infrastructure.","FINTECH","PAYMENTS"],
["17","Razorpay","Payment Infrastructure","Financial infrastructure connecting businesses with digital payment collection and transaction tools.","FINTECH","PAYMENTS"],
["18","Stripe","Payments Infrastructure","APIs and financial infrastructure enabling online businesses to accept and manage payments.","FINTECH","PAYMENTS"],
["19","Revolut","Digital Banking","Technology-led banking services combining payments, accounts and financial products.","BANKING","FINTECH"],
["20","Nubank","Digital-First Banking","Digital-first banking model built around mobile technology and scalable financial services.","BANKING","FINTECH"],
["21","Morgan Stanley","AI & Wealth Management","AI-assisted tools explored for research, productivity and wealth-management workflows.","AI","WEALTHTECH"],
["22","DBS Bank","Digital Transformation","Technology-led transformation of banking operations and customer experiences.","BANKING","DIGITAL"],
["23","ICICI Bank","Digital Banking","Digital channels and technology used to transform customer banking services.","BANKING","INDIA"],
["24","Goldman Sachs","AI in Finance","AI applications across research, software development and financial workflows.","AI","BANKING"],
["25","Deloitte","Blockchain & Audit","Distributed-ledger technology explored for audit and assurance applications.","BLOCKCHAIN","AUDIT"],
["26","KPMG","Automation & Audit","Automation and analytics applied to audit and finance processes.","RPA","AUDIT"],
["27","Siemens","Finance Process Automation","Automation used to improve finance-process efficiency at enterprise scale.","RPA","FINANCE"],
["28","Microsoft Dynamics","Cloud Finance","Cloud financial-management tools connecting accounting, ERP and business analytics.","CLOUD","ERP"],
["29","Razorpay","Embedded Finance","Financial capabilities embedded into digital business workflows and platforms.","FINTECH","PAYMENTS"],
["30","Stripe","Embedded Financial Services","Financial infrastructure APIs extending payment capabilities into broader software ecosystems.","FINTECH","PAYMENTS"],
["31","BlackLine","Governed AI for Reconciliation","Multi-agent AI used to prepare reconciliations with transparency, auditability and human oversight.","AI","ACCOUNTING"],
["32","Pilot","AI Month-End Close","AI accounting platform designed to automate month-end close work and return review-ready financials.","AI","ACCOUNTING"],
["33","Karbon Business","AI Accounting for SMEs","AI-powered accounting platform offering bookkeeping, reconciliation, GST and financial-visibility tools.","AI","ACCOUNTING"],
["34","Ramp","AI Accounting Operations","AI-first financial-management software expanding into accounting and automating basic finance tasks.","AI","FINTECH"],
["35","NPCI / UPI","Agentic Payments","Emerging framework work around identifying and monitoring AI agents that conduct UPI transactions.","AI","PAYMENTS"]
];

window.caseStudies=caseStudies;

const grid=document.getElementById("caseLibraryGrid");
const searchInput=document.getElementById("caseSearch");
const filterBox=document.getElementById("caseFilters");
const categories=["ALL","AI","ACCOUNTING","RPA","BLOCKCHAIN","CLOUD","FINTECH","BANKING"];
filterBox.innerHTML=categories.map(c=>`<button class="case-filter ${c==="ALL"?"active":""}" data-filter="${c}">${c}</button>`).join("");
let activeFilter="ALL";

function render(){
 const q=searchInput.value.toLowerCase().trim();
 const rows=caseStudies.filter(c=>{
   const matchesFilter=activeFilter==="ALL"||c[4]===activeFilter||c[5]===activeFilter;
   const text=c.slice(1).join(" ").toLowerCase();
   return matchesFilter&&text.includes(q);
 });
 document.getElementById("caseCount").textContent=rows.length;
 grid.innerHTML=rows.map(c=>`
 <a class="library-card" href="case-study.html?id=${c[0]}">
   <span class="library-card-number">${c[0]} / LEVEL UP</span>
   <h3>${c[1]}</h3>
   <span class="category">${c[2]}</span>
   <p>${c[3]}</p>
   <div class="library-card-footer">
     <div class="library-card-tags"><span>${c[4]}</span><span>${c[5]}</span></div>
     <span class="read-case">RESEARCH ↗</span>
   </div>
 </a>`).join("");
 if(!rows.length) grid.innerHTML=`<div style="grid-column:1/-1;padding:70px;text-align:center;color:#777;background:#080808">NO CASE STUDIES FOUND.</div>`;
}
filterBox.addEventListener("click",e=>{
 if(!e.target.matches(".case-filter"))return;
 activeFilter=e.target.dataset.filter;
 document.querySelectorAll(".case-filter").forEach(b=>b.classList.remove("active"));
 e.target.classList.add("active");
 render();
});
searchInput.addEventListener("input",render);
render();

const tickerItems=["AI IN ACCOUNTING","FINTECH DEVELOPMENTS","DIGITAL PAYMENTS","RPA & AUTOMATION","BLOCKCHAIN","CLOUD ACCOUNTING","GENERATIVE AI","FINANCIAL TECHNOLOGY"];
document.getElementById("tickerTrack").innerHTML=[...tickerItems,...tickerItems].map(x=>`<span>${x}</span>`).join("");

const dialog=document.getElementById("searchDialog");
document.getElementById("openSearch").onclick=()=>dialog.showModal();
document.getElementById("closeSearch").onclick=()=>dialog.close();
const globalSearch=document.getElementById("globalSearch");
globalSearch.addEventListener("input",()=>{
 const q=globalSearch.value.toLowerCase().trim();
 const box=document.getElementById("searchResults");
 if(!q){box.innerHTML="";return}
 const hits=caseStudies.filter(c=>c.slice(1).join(" ").toLowerCase().includes(q)).slice(0,8);
 box.innerHTML=hits.map(c=>`<div class="result"><strong>${c[1]}</strong><small>${c[2]} · ${c[4]} · ${c[5]}</small></div>`).join("")||`<p style="color:#777">No results.</p>`;
});