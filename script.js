// Paste your brand-new Google AI Studio API key here!
const API_KEY = "AQ.Ab8RN6LLSCE3uLX4Tmr3SIxazypgXtMLrTX30E4-M-6VMg-jAg"; 
const MODEL = "models/gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_INSTRUCTION = "You are a creative story generator AI. Your only function is to generate " +
  "engaging, creative stories based on user prompts. If the user asks for anything other than a story, " +
  "politely respond that you can only generate stories. Always respond with a complete story when given " +
  "a genre, theme, or story idea.";

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
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `Write a complete, detailed story based on this idea/premise: ${message}` }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 1200
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "API Error");
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
  if (window.speechSynthesis.speaking) {
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