// DOM Elements
const monitorToggle = document.getElementById("monitorToggle");
const customKeywordInput = document.getElementById("customKeyword");
const addKeywordBtn = document.getElementById("addKeyword");
const keywordList = document.getElementById("keywordList");
const clearKeywordsBtn = document.getElementById("clearKeywords");

// Load saved settings
chrome.storage.sync.get(["monitoring", "keywords"], (data) => {
  monitorToggle.checked = data.monitoring !== false; // Default is ON
  if (data.keywords) {
    data.keywords.forEach(addKeywordToList);
  }
});

// Toggle monitoring
monitorToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ monitoring: monitorToggle.checked });
});

// Add custom keyword
addKeywordBtn.addEventListener("click", () => {
  const keyword = customKeywordInput.value.trim().toLowerCase();
  if (keyword) {
    chrome.storage.sync.get("keywords", (data) => {
      let keywords = data.keywords || [];
      if (!keywords.includes(keyword)) {
        keywords.push(keyword);
        chrome.storage.sync.set({ keywords });
        addKeywordToList(keyword);
      }
    });
    customKeywordInput.value = "";
  }
});

// Function to add keyword to list
function addKeywordToList(keyword) {
  const li = document.createElement("li");
  li.textContent = keyword;
  keywordList.appendChild(li);
}

// Clear all custom keywords
clearKeywordsBtn.addEventListener("click", () => {
  chrome.storage.sync.set({ keywords: [] });
  keywordList.innerHTML = "";
});
