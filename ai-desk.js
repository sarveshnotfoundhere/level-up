/*
LEVEL UP AI DESK
Demo mode works locally. To enable generated answers, set:
LIVE_AI.enabled = true
and point endpoint at your secure server/serverless route.
The browser must never contain a private model API key.
*/
const LIVE_AI = {
  enabled:false,
  endpoint:"/api/ai"
};

const demoAnswers = [
  {
    keys:["blockchain","accounting"],
    answer:"Blockchain in accounting means recording transactions on a shared distributed ledger where approved participants can verify the same history. In practice, it can improve traceability and reduce reconciliation between separate records. A simple example is a supply-chain transaction where ownership and payment events are recorded on a shared ledger. The important limitations are governance, integration, privacy and the quality of the data entered into the system."
  },
  {
    keys:["rpa","ai"],
    answer:"RPA follows predefined rules and is strongest at repetitive, structured tasks such as moving invoice data between systems. AI can work with less-structured information, identify patterns and generate or classify content. In finance, the two can work together: AI interprets an invoice, while RPA carries the validated data into the accounting system. RPA is therefore mainly automation of repeatable steps; AI adds prediction, interpretation or generation."
  },
  {
    keys:["upi","payment"],
    answer:"UPI is India's interoperable instant-payment infrastructure. It lets users connect bank accounts to payment applications and authorize transactions through a common interface. Its significance for finance is that payment initiation, confirmation and reconciliation can become highly digital and near real-time. For a case study, examine interoperability, merchant adoption, transaction scale, fraud controls and the evolving economics of digital payments."
  },
  {
    keys:["generative ai","audit"],
    answer:"Generative AI can support audit by helping summarize documents, search large information sets, draft working-paper language and assist with research. It does not remove the need for professional judgment. Audit teams still need evidence, review controls, confidentiality safeguards and human verification because generated output can be incomplete or incorrect."
  },
  {
    keys:["cloud","accounting"],
    answer:"Cloud accounting stores accounting functionality and data in internet-accessible systems rather than relying on a locally installed application. Benefits can include easier collaboration, automatic updates, integrations and access from multiple locations. The trade-offs include cybersecurity, vendor dependence, connectivity and data-governance considerations."
  },
  {
    keys:["embedded finance"],
    answer:"Embedded finance places financial services inside a non-financial product or workflow. A marketplace might offer payments, a business platform might provide accounts or lending, or a software product might embed card issuing. The accounting angle is important because more financial events are created inside operational software, increasing the need for clean APIs, reconciliation and controls."
  }
];

function fallbackAnswer(q){
  const text=q.toLowerCase();
  const hit=demoAnswers.find(x=>x.keys.some(k=>text.includes(k)));
  if(hit) return hit.answer;
  return "A useful way to approach this topic is to define the technology, identify the finance process it changes, explain how implementation works, then evaluate the accounting or financial impact and its limitations. If you give me a company, technology or specific question, I can structure it as a short academic explanation, comparison or case-study framework.";
}

async function askAI(q){
  if(!LIVE_AI.enabled) return fallbackAnswer(q);
  const res=await fetch(LIVE_AI.endpoint,{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({message:q})
  });
  if(!res.ok) throw new Error("AI endpoint unavailable");
  const data=await res.json();
  return data.answer || data.message || "No answer returned.";
}

const messages=document.getElementById("messages");
const question=document.getElementById("question");
const form=document.getElementById("chatForm");
const status=document.getElementById("status");

if(LIVE_AI.enabled) status.textContent="LIVE AI";

function addMessage(role,text){
  const div=document.createElement("div");
  div.className=`message ${role}`;
  const label=role==="user"?"YOU":"LEVEL UP AI";
  div.innerHTML=`<span class="msg-label">${label}</span><div class="bubble"></div>`;
  div.querySelector(".bubble").textContent=text;
  messages.appendChild(div);
  messages.scrollTop=messages.scrollHeight;
}

async function submitQuestion(q){
  if(!q.trim()) return;
  addMessage("user",q.trim());
  question.value="";
  const btn=form.querySelector("button");
  btn.disabled=true;
  try{
    const answer=await askAI(q.trim());
    addMessage("assistant",answer);
  }catch(e){
    addMessage("assistant","The live AI connection is unavailable right now. Demo knowledge remains available if you switch LIVE_AI.enabled to false.");
  }finally{
    btn.disabled=false;
    question.focus();
  }
}

form.addEventListener("submit",e=>{e.preventDefault();submitQuestion(question.value)});
document.querySelectorAll(".prompt").forEach(btn=>btn.addEventListener("click",()=>{question.value=btn.dataset.prompt;question.focus()}));
question.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});