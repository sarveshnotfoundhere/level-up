const aiForm=document.getElementById("aiChatForm");
const aiInput=document.getElementById("aiChatInput");
const aiMessages=document.getElementById("aiChatMessages");
const aiPanel=document.getElementById("aiChatPanel");
const aiPipClose=document.getElementById("aiChatPipClose");
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

async function askCommerceAI(message){
  const res=await fetch("/api/ai",{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({message})
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||"AI service unavailable");
  return data.answer||"I could not generate an answer.";
}

aiForm?.addEventListener("submit",async e=>{
  e.preventDefault();
  const message=aiInput.value.trim();
  if(!message)return;
  addAiMessage("user",message);
  aiInput.value="";
  aiInput.disabled=true;
  const button=aiForm.querySelector("button");
  button.disabled=true;
  const loading=addAiMessage("bot","Thinking…");
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
aiInput?.addEventListener("focus",enterAiPip);
aiPipClose?.addEventListener("click",exitAiPip);
