// Connected directly to your live Render proxy server
const BACKEND_URL = "https://ai-story-backend-ibvw.onrender.com/api/story"; 

let currentUtterance = null;

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const message = inputField.value.trim();
  if (!message) return;

  // Add user message to chat
  addMessage("user", message);
  inputField.value = "";
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Forward the request to your backend proxy server
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: message }) 
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || data.error);
    }

    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
               "Sorry, I couldn't generate a story right now. Please try again.";
    
    removeTypingIndicator();
    addMessage("bot", reply);
  } catch (error) {
    console.error("Error Details:", error);
    removeTypingIndicator();
    addMessage("bot", `Connection Issue: ${error.message || error}`);
  }
}

function addMessage(sender, text) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  
  const textNode = document.createElement("div");
  textNode.textContent = text;
  msg.appendChild(textNode);

  if (sender === "bot") {
    const controls = document.createElement("div");
    controls.className = "speech-controls";

    const speakBtn = document.createElement("button");
    speakBtn.className = "speech-btn";
    speakBtn.innerHTML = "🔊 Read Aloud";
    speakBtn.onclick = () => speakStory(text);
    
    const stopBtn = document.createElement("button");
    stopBtn.className = "speech-btn stop-btn";
    stopBtn.innerHTML = "🛑 Stop";
    stopBtn.onclick = () => stopSpeaking();

    controls.appendChild(speakBtn);
    controls.appendChild(stopBtn);
    msg.appendChild(controls);
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function speakStory(text) {
  stopSpeaking();
  const cleanText = text.replace(/\*/g, '');
  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance.rate = 1.0;  
  currentUtterance.pitch = 1.0; 
  window.speechSynthesis.speak(currentUtterance);
}

function stopSpeaking() {
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

function showTypingIndicator() {
  const chat = document.getElementById("chat");
  const typing = document.createElement("div");
  typing.className = "typing-indicator";
  typing.id = "typing-indicator";
  typing.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) {
    typing.remove();
  }
}