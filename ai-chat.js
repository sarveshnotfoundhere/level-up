const aiForm=document.getElementById("aiChatForm");
const aiInput=document.getElementById("aiChatInput");
const aiMessages=document.getElementById("aiChatMessages");
const aiPanel=document.getElementById("aiChatPanel");
const aiPipClose=document.getElementById("aiChatPipClose");
const aiChatAnchor=aiPanel?.parentElement;
let pipActive=false;

function addAiMessage(role,text){
  const el=document.createElement("div");
  el.className="ai-message "+(role==="user"?"ai-message-user":"ai-message-bot");
  const label=document.createElement("span");
  label.className="ai-message-label";
  label.textContent=role==="user"?"YOU":"LEVEL UP AI";
  const p=document.createElement("p");
  p.textContent=text;
  el.append(label,p);
  aiMessages.appendChild(el);
  aiMessages.scrollTop=aiMessages.scrollHeight;
  return el;
}

function enterAiPip(){
  if(!aiPanel||pipActive)return;
  aiPanel.classList.add("chat-pip");
  pipActive=true;
}

function exitAiPip(){
  if(!aiPanel)return;
  aiPanel.classList.remove("chat-pip");
  pipActive=false;
}

async function askCommerceAI(message){
  const res=await fetch("/api/ai",{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({message})
  });
  const raw=await res.text();
  let data={};
  try{data=raw?JSON.parse(raw):{};}catch(_){}
  if(!res.ok)throw new Error(data.error||`AI service returned HTTP ${res.status}`);
  return data.answer||"The AI returned no answer. Please try again.";
}

aiInput?.addEventListener("focus",enterAiPip);
aiInput?.addEventListener("input",()=>{if(aiInput.value.trim())enterAiPip();});
aiPipClose?.addEventListener("click",exitAiPip);

aiForm?.addEventListener("submit",async e=>{
  e.preventDefault();
  const message=aiInput.value.trim();
  if(!message)return;

  enterAiPip();
  addAiMessage("user",message);
  aiInput.value="";
  aiInput.disabled=true;

  const button=aiForm.querySelector("button");
  button.disabled=true;

  const loading=addAiMessage("assistant","Thinking…");
  loading.classList.add("ai-message-loading");

  try{
    const answer=await askCommerceAI(message);
    loading.remove();
    addAiMessage("assistant",answer);
  }catch(err){
    loading.remove();
    addAiMessage("assistant",err.message||"Something went wrong. Please try again.");
  }finally{
    aiInput.disabled=false;
    button.disabled=false;
    aiInput.focus();
  }
});
