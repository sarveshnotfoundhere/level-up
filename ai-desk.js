/*
LEVEL UP AI DESK
Live mode uses the secure /api/ai route. The browser never contains the OpenAI key.
*/
const LIVE_AI = {
  enabled:true,
  endpoint:"/api/ai"
};

function fallbackAnswer(){
  return "The AI service is temporarily unavailable. Please try again in a moment.";
}

async function askAI(q){
  if(!LIVE_AI.enabled) return fallbackAnswer(q);
  const res=await fetch(LIVE_AI.endpoint,{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({message:q})
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || "AI endpoint unavailable");
  return data.answer || data.output_text || "No answer returned.";
}

const messages=document.getElementById("messages");
const question=document.getElementById("question");
const form=document.getElementById("chatForm");
const status=document.getElementById("status");

status.textContent="LIVE AI";

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
  status.textContent="THINKING";
  try{
    const answer=await askAI(q.trim());
    addMessage("assistant",answer);
    status.textContent="LIVE AI";
  }catch(e){
    addMessage("assistant","The live AI connection is unavailable. Check the OPENAI_API_KEY environment variable in Vercel and redeploy.");
    status.textContent="CONNECTION ERROR";
  }finally{
    btn.disabled=false;
    question.focus();
  }
}

form.addEventListener("submit",e=>{e.preventDefault();submitQuestion(question.value)});
document.querySelectorAll(".prompt").forEach(btn=>btn.addEventListener("click",()=>{question.value=btn.dataset.prompt;question.focus()}));
question.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});