// EmailJS configuration
const emailServiceID = "service_diz31vf";
const emailTemplateID = "template_cv44vsi";
const publicKey = "iSqzIykI2DWwYvei1";

// Sensitive keywords to monitor
const keywords = ["password", "confidential", "leak", "credit card", "secret", "ssn", "api key", "private key"];

let lastCheckedText = "";

// Check text for sensitive keywords
function checkMessage(text, element) {
  if (text === lastCheckedText) return; // skip if text hasn't changed
  lastCheckedText = text;

  const message = text.toLowerCase();
  for (let keyword of keywords) {
    if (message.includes(keyword)) {
      if (element) element.style.outline = "2px solid red";
      showWarningPopup(keyword);
      sendEmailNotification(keyword);
      return;
    }
  }
  if (element) element.style.outline = "";
}

// Show warning popup
function showWarningPopup(keyword) {
  if (document.getElementById("convoGuardWarning")) return;

  const box = document.createElement("div");
  box.id = "convoGuardWarning";
  box.textContent = `⚠️ ConvoGuard: Sensitive word detected - "${keyword}". Be careful before sending!`;
  box.style.cssText = "position:fixed;bottom:20px;right:20px;background:rgba(255,0,0,0.9);color:white;padding:15px;border-radius:8px;font-size:14px;font-family:Arial,sans-serif;z-index:2147483647;max-width:300px;box-shadow:0 0 10px rgba(0,0,0,0.3);";
  document.body.appendChild(box);

  setTimeout(() => box.remove(), 5000);
}

// Send email alert
function sendEmailNotification(flaggedWord) {
  fetch("https://api64.ipify.org?format=json")
    .then(r => r.json())
    .then(data => {
      try {
        emailjs.send(emailServiceID, emailTemplateID, {
          flagged_word: flaggedWord,
          user_ip: data.ip,
          user_browser: navigator.userAgent,
          date_time: new Date().toLocaleString(),
        }, publicKey)
        .then(() => console.log("ConvoGuard: Email sent"))
        .catch(e => console.warn("ConvoGuard: EmailJS error", e));
      } catch (e) {
        console.warn("ConvoGuard: EmailJS blocked by CSP", e);
      }
    })
    .catch(e => console.warn("ConvoGuard: IP fetch failed", e));
}

// Monitor normal INPUT and TEXTAREA fields
document.addEventListener("input", (event) => {
  const t = event.target;
  if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") {
    checkMessage(t.value, t);
  }
});

// Poll every 500ms for contenteditable fields (works for ChatGPT ProseMirror)
setInterval(() => {
  const editables = document.querySelectorAll("[contenteditable='true']");
  editables.forEach(el => {
    const text = el.innerText || "";
    checkMessage(text, el);
  });
}, 500);
