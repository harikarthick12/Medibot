const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearChat = document.getElementById("clearChat");

function addMessage(message, isBot=false){
    const msgDiv = document.createElement("div");
    msgDiv.className = isBot ? "bot-msg" : "user-msg";
    if(isBot && message.includes("🤒 Possible Conditions")){
        msgDiv.innerHTML = formatBotCard(message);
    } else { msgDiv.innerHTML = message; }
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Clear chat
clearChat.addEventListener("click",()=>{
    chatBox.innerHTML='<div class="bot-msg">Hello! I’m <b>MediBot</b>. Describe your symptoms and I’ll help you 🩺</div>';
});

// Send message
sendBtn.addEventListener("click",sendMessage);
userInput.addEventListener("keypress",e=>{if(e.key==="Enter") sendMessage();});

// Mobile keyboard fix
userInput.addEventListener("focus", () => { setTimeout(()=>{ userInput.scrollIntoView({behavior:"smooth", block:"center"}); },300); });

async function sendMessage(){
    const message = userInput.value.trim();
    if(!message) return;
    addMessage(message,false);
    userInput.value="";
    try{
        const res = await fetch("/api/chat",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message}) });
        const data = await res.json();
        addMessage(data.response,true);
    }catch(err){
        addMessage("⚠️ Server error. Please try again.",true);
    }
}

// Format AI card
function formatBotCard(text){
    const conditions = extractSection(text,"🤒 Possible Conditions:");
    const remedies = extractSection(text,"💊 Home Remedies:");
    const tablets = extractSection(text,"💊 Recommended Tablets");
    const dos = extractSection(text,"✅ Things to Do:");
    const donts = extractSection(text,"❌ Things to Avoid:");

    return `
    <div class="bot-card">
      ${conditions?`<p><b>🤒 Possible Conditions:</b><br>${conditions}</p>`:""}
      ${remedies?`<p><b>💊 Home Remedies:</b><br>${remedies}</p>`:""}
      ${tablets?`<p><b>💊 Recommended Tablets:</b><br>${tablets}</p>`:""}
      ${dos?`<p><b>✅ Things to Do:</b><br>${dos}</p>`:""}
      ${donts?`<p><b>❌ Things to Avoid:</b><br>${donts}</p>`:""}
      <p style="font-size:0.75em; opacity:0.7;">⚠️ Disclaimer: This information is for educational purposes only. Consult a doctor before taking any medication.</p>
    </div>
    `;
}

function extractSection(text,label){
    const start = text.indexOf(label);
    if(start===-1) return "";
    const remaining = text.slice(start + label.length);
    const nextEmoji = remaining.search(/🤒|💊|✅|❌|⚠️/);
    return (nextEmoji===-1?remaining:remaining.slice(0,nextEmoji)).trim();
}
