// EmailJS configuration
const emailServiceID = "service_diz31vf";
const emailTemplateID = "template_cv44vsi";
const publicKey = "iSqzIykI2DWwYvei1";

// Sensitive keywords to monitor
const keywords = ["password", "confidential", "leak", "credit card", "secret", "ssn", "api key", "private key"];

// Check text for sensitive keywords
function checkMessage(text, element) {
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

// Monitor normal input/textarea fields
document.addEventListener("input", (event) => {
  const t = event.target;
  if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") {
    checkMessage(t.value, t);
  }
});

// Monitor contenteditable divs (ChatGPT, etc.) using MutationObserver
const observer = new MutationObserver(() => {
  const editables = document.querySelectorAll("[contenteditable='true']");
  editables.forEach(el => {
    const text = el.innerText || el.textContent || "";
    checkMessage(text, el);
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
