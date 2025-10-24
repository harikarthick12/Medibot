const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearChat = document.getElementById("clearChat");

function addMessage(message, isBot=false){
    const msgDiv = document.createElement("div");
    msgDiv.className = isBot ? "bot-msg" : "user-msg";
    
    // If bot message contains "🤒 Possible Conditions", format it nicely
    if(isBot && message.includes("🤒 Possible Conditions")){
        msgDiv.innerHTML = formatBotCard(message);
    } else {
        msgDiv.innerHTML = message;
    }
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

async function sendMessage(){
    const message = userInput.value.trim();
    if(!message) return;
    addMessage(message,false);
    userInput.value="";
    try{
        const res = await fetch("/api/chat",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({message})
        });
        const data = await res.json();
        addMessage(data.response,true);
    }catch(err){
        addMessage("⚠️ Server error. Please try again.",true);
    }
}

// Format AI response as card
function formatBotCard(text) {
    // Split sections using the labels as markers
    const conditions = extractSection(text, "🤒 Possible Conditions:");
    const remedies = extractSection(text, "💊 Home Remedies:");
    const tablets = extractSection(text, "💊 Recommended Tablets");
    const dos = extractSection(text, "✅ Things to Do:");
    const donts = extractSection(text, "❌ Things to Avoid:");

    return `
    <div class="bot-card">
      ${conditions ? `<p><b>🤒 Possible Conditions:</b><br>${conditions}</p>` : ""}
      ${remedies ? `<p><b>💊 Home Remedies:</b><br>${remedies}</p>` : ""}
      ${tablets ? `<p><b>💊 Recommended Tablets:</b><br>${tablets}</p>` : ""}
      ${dos ? `<p><b>✅ Things to Do:</b><br>${dos}</p>` : ""}
      ${donts ? `<p><b>❌ Things to Avoid:</b><br>${donts}</p>` : ""}
      <p style="font-size:0.75em; opacity:0.7;">⚠️ Disclaimer: This information is for educational purposes only. Consult a doctor before taking any medication.</p>
    </div>
    `;
}

// Helper to extract section text between labels
function extractSection(text, label) {
    const startIndex = text.indexOf(label);
    if (startIndex === -1) return "";
    // End index is next emoji or end of string
    const remainingText = text.slice(startIndex + label.length);
    const nextEmojiIndex = remainingText.search(/🤒|💊|✅|❌|⚠️/);
    if (nextEmojiIndex === -1) return remainingText.trim();
    return remainingText.slice(0, nextEmojiIndex).trim();
}

userInput.addEventListener("focus", () => {
    setTimeout(() => {
        userInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300); // waits for keyboard animation
});

userInput.addEventListener("blur", () => {
    chatBox.scrollTop = chatBox.scrollHeight; // keep last message visible
});
