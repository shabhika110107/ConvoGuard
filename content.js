// EmailJS configuration with your credentials
const emailServiceID = "service_diz31vf";  
const emailTemplateID = "template_cv44vsi";  
const publicKey = "iSqzIykI2DWwYvei1";  

// List of sensitive words to monitor
const keywords = ["password", "confidential", "leak", "credit card", "secret", "ssn", "api key", "private key"];

// Function to monitor chat input fields
function monitorChats() {
  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target && (
      target.tagName === "TEXTAREA" ||
      target.tagName === "INPUT" ||
      target.contentEditable === "true"
    )) {
      checkMessage(target);
    }
  });
}

// Function to check if a message contains sensitive words
function checkMessage(inputField) {
  const message = (inputField.value || inputField.textContent || "").toLowerCase();
  
  for (let keyword of keywords) {
    if (message.includes(keyword)) {
      inputField.style.border = "2px solid red"; // Highlight input field
      showWarningPopup(keyword);
      sendEmailNotification(keyword);
      return;
    }
  }

  inputField.style.border = ""; // Reset border if no flagged words
}

// Function to display a warning popup
function showWarningPopup(keyword) {
  if (!document.getElementById("chatMonitorWarning")) {
    const warningBox = document.createElement("div");
    warningBox.id = "chatMonitorWarning";
    warningBox.textContent = `⚠️ Warning: Sensitive word detected - "${keyword}". Be careful before sending!`;

    document.body.appendChild(warningBox);

    setTimeout(() => {
      warningBox.remove();
    }, 5000);
  }
}

// Function to send email notification to admin with user's IP
function sendEmailNotification(flaggedWord) {
  fetch("https://api64.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
      const userIP = data.ip;
      try {
        emailjs.send(emailServiceID, emailTemplateID, {
          flagged_word: flaggedWord,
          user_ip: userIP,
          user_browser: navigator.userAgent,
          date_time: new Date().toLocaleString(),
        }, publicKey)
        .then(response => console.log("Email sent:", response))
        .catch(error => console.error("EmailJS error:", error));
      } catch (e) {
        console.warn("EmailJS blocked by site CSP:", e);
      }
    })
    .catch(error => console.error("Error fetching IP:", error));
}

// Start monitoring chats
monitorChats();
