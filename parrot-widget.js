/* ============================================================
   parrot-widget.js — floating chatbot, styled to match the
   corkboard/paper aesthetic of the rest of the site.

   Drop this one script tag near the end of <body> on every page:

     <script src="parrot-widget.js"></script>

   No other markup needed — this file injects its own CSS, HTML,
   and behavior. Update PARROT_API_URL below once your FastAPI
   backend is live on Render.
   ============================================================ */
(function () {
  "use strict";

  // ---- CONFIG: replace with your deployed Render URL ----
  var PARROT_API_URL = "https://vani-chatbot.onrender.com/chat";
  var PARROT_IMG = "assets/parrot.png"; // put the parrot PNG here
  var PARROT_2_IMG = 'assets/56.png'

  // ---------------------------------------------------------
  // Styles
  // ---------------------------------------------------------
  var style = document.createElement("style");
  style.textContent = [
    "#parrotWidget{position:fixed;right:clamp(0px,0.11vw,20px);bottom:clamp(276px,68vh,700px);z-index:80;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transform:scale(1.06)}",

    "#parrotBtn{width:clamp(106px,26vw,240px);height:auto;cursor:pointer;display:block;filter:drop-shadow(1px 2px 1px rgba(0,0,0,.75));user-select:none;-webkit-user-drag:none;}",

    "#parrotBubble{position:absolute;top:calc(100% + 10px);right:12px;width:min(94vw,460px);max-height:min(80vh,640px);background:#fdfbf4;border-radius:18px 18px 4px 18px;box-shadow:0 10px 30px rgba(0,0,0,.22);transform:translateY(-8px) scale(.56);transform-origin:top right;opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;display:flex;flex-direction:column;overflow:hidden;}",
    "#parrotBubble.open{opacity:1;pointer-events:auto;transform: translateY(0) scale(0.9);}",
    "#parrotBubble::after{content:'';position:absolute;top:-9px;right:22px;width:20px;height:20px;background:#fdfbf4;box-shadow:-3px -3px 6px rgba(0,0,0,.05);}",

    "#parrotHeader{padding:6px 8px 3px;border-bottom:1px dashed #d8d2c2;display:flex;align-items:center;justify-content:space-between;}",
    "#parrotTitle{font-family:'CoalhandLuke',cursive;font-size:1.9rem;color:#3c5c3a;}",
    "#parrotClose{background:none;border:none;font-size:1.35rem;color:#8a8577;cursor:pointer;padding:2px 8px;line-height:1;}",
    "#parrotClose:hover{color:#3c3c3c;}",

    "#parrotMessages{flex:1;overflow-y:auto;padding:18px 20px;display:flex;flex-direction:column;gap:12px;min-height:220px;}",
    ".pmsg{max-width:85%;padding:12px 16px;border-radius:16px;font-size:1.12rem;line-height:1.45;color:#3c3c3c;word-wrap:break-word;}",
    ".pmsg.bot{align-self:flex-start;background:#eef1e6;border-bottom-left-radius:4px;}",
    ".pmsg.user{align-self:flex-end;background:#e4ded0;border-bottom-right-radius:4px;}",
    ".pmsg.typing{align-self:flex-start;background:#eef1e6;border-bottom-left-radius:4px;color:#8a8577;font-style:italic;}",

    "#parrotInputRow{display:flex;gap:10px;padding:14px 16px;border-top:1px dashed #d8d2c2;background:#f7f4ea;}",
    "#parrotInput{flex:1;border:1px solid #d8d2c2;border-radius:14px;padding:12px 16px;font-size:1.08rem;font-family:inherit;outline:none;background:#fff;}",
    "#parrotInput:focus{border-color:#8fae7a;}",
    "#parrotSend{border:none;background:#5c7a52;color:#fff;border-radius:14px;padding:12px 20px;font-size:1.02rem;cursor:pointer;font-family:inherit;}",
    "#parrotSend:hover{background:#4d6845;}",
    "#parrotSend:disabled{opacity:.5;cursor:default;}",

    "@media (max-aspect-ratio:1/1){",
    "#parrotWidget{bottom:clamp(12px,3vh,40px);}",
    "#parrotBubble{right:4px;width:min(96vw,480px);top:auto;bottom:calc(100% + 10px);transform-origin:bottom right;transform:translateY(8px) scale(.56);}",
    "#parrotBubble.open{transform:translateY(0) scale(0.9);}",
    "#parrotBubble::after{top:auto;bottom:-9px;box-shadow:3px 3px 6px rgba(0,0,0,.05);}",
    "}"
  ].join("\n");
  document.head.appendChild(style);

  // ---------------------------------------------------------
  // Markup
  // ---------------------------------------------------------
  var root = document.createElement("div");
  root.id = "parrotWidget";
  root.innerHTML =
    '<div id="parrotBubble" role="dialog" aria-label="Chat with Vani\'s assistant">' +
      '<div id="parrotHeader">' +
        '<span id="parrotTitle">ask the parrot</span>' +
        '<button id="parrotClose" aria-label="Close chat">&#10005;</button>' +
      '</div>' +
      '<div id="parrotMessages"></div>' +
      '<div id="parrotInputRow">' +
        '<input id="parrotInput" type="text" placeholder="ask me anything about Vani..." autocomplete="off" />' +
        '<button id="parrotSend">Send</button>' +
      '</div>' +
    '</div>' +
    '<img id="parrotBtn" src="' + PARROT_IMG + '" alt="Chat with Vani\'s assistant" />';
  document.body.appendChild(root);

  var bubble   = document.getElementById("parrotBubble");
  var btn      = document.getElementById("parrotBtn");
  var closeBtn = document.getElementById("parrotClose");
  var messages = document.getElementById("parrotMessages");
  var input    = document.getElementById("parrotInput");
  var sendBtn  = document.getElementById("parrotSend");

  var greeted = false;

  function addMessage(text, who) {
    var el = document.createElement("div");
    el.className = "pmsg " + who;
    el.innerHTML = "<pre style='margin:0;white-space:pre-wrap;font-family:inherit;'>" + 
      escapeHtml(text) + 
      "</pre>";
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Cap the bubble's height to whatever space is actually available below
  // where it opens, so it can never run past the bottom of the viewport --
  // the message list (which already has its own overflow-y:auto) just
  // scrolls internally instead. Never pushes it anywhere else on screen.
  function fitBubble() {
    var top = bubble.getBoundingClientRect().top;
    var available = window.innerHeight - top - 16;
    var cap = Math.min(window.innerHeight * 0.8, 640);
    bubble.style.maxHeight = Math.max(180, Math.min(available, cap)) + "px";
  }

  function openBubble() {
    bubble.classList.add("open");
    if (!greeted) {
      greeted = true;
      addMessage("Hello! Ask me anything about Vani her projects, experience, or what she's up to outside of data science.", "bot");
    }
    fitBubble();
    input.focus();
  }

  window.addEventListener("resize", fitBubble);

  function closeBubble() {
    bubble.classList.remove("open");
  }

  btn.addEventListener("click", function () {
    bubble.classList.contains("open") ? closeBubble() : openBubble();
  });
  btn.addEventListener("mouseenter", function () { btn.src = PARROT_2_IMG; });
  btn.addEventListener("mouseleave", function () { btn.src = PARROT_IMG; });
  closeBtn.addEventListener("click", closeBubble);

  document.addEventListener("click", function (e) {
    if (!bubble.classList.contains("open")) return;
    if (root.contains(e.target)) return;
    closeBubble();
  });

  var conversationHistory = [];

  // Rotates through these lines, in order, one stage every 3s, picking a
  // random line within whichever stage is current. If the reply takes
  // longer than all the stages, it just keeps re-rolling the last one.
  var THINKING_STAGES = [
    ["Conducting extensive research", "Thinking really hard", "Performing a thorough investigation", "Conducting a comprehensive analysis"],
    ["Dotting the t's and crossing the i's … WAIT", "Chequing for speling misstakes", "Give me a min, I forgot what I was going to say!"],
    ["Taking a sip of water", "Blaming the Wi-Fi", "Will quickly pee and be back"],
    ["Snooping through Vani's files (professionally)", "Making Vani sound smart", "Consulting with the experts"],
    ["Deleting a few lines (I've been told that I share too much)", "Dialling down my admiration for Vani"]
  ];
  function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function sendMessage() {
  var text = input.value.trim();
  if (!text) return;
  input.value = "";
  sendBtn.disabled = true;
  addMessage(text, "user");

  var stageIdx = 0;
  var typingEl = addMessage(randomFrom(THINKING_STAGES[0]), "typing");
  var thinkingTimer = setInterval(function () {
    stageIdx = Math.min(stageIdx + 1, THINKING_STAGES.length - 1);
    typingEl.textContent = randomFrom(THINKING_STAGES[stageIdx]);
  }, 2000);

  try {
    var res = await fetch(PARROT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: conversationHistory  // send the full history
      })
    });
    if (!res.ok) throw new Error("bad response");
    var data = await res.json();
    clearInterval(thinkingTimer);
    typingEl.remove();
    var botAnswer = data.answer || "Hmm, I didn't catch that — try asking again?";
    addMessage(botAnswer, "bot");
    fitBubble();

    // Store this exchange for the next request
    conversationHistory.push({ role: "user", content: text });
    conversationHistory.push({ role: "assistant", content: botAnswer });
  } catch (err) {
    clearInterval(thinkingTimer);
    typingEl.remove();
    addMessage("Sorry, I'm having trouble connecting right now. Try again in a moment.", "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

 
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });
})();
