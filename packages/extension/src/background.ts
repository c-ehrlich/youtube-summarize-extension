console.log("Background script loaded!");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated!");
  // Check if the config is already set
  chrome.storage.local.get("configSet", (result) => {
    console.log("Checking configSet value:", result);
    if (!result.configSet) {
      // If not set, open the configuration page
      chrome.tabs.create({ url: chrome.runtime.getURL("config.html") });
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Browser started!");
  // Check again on browser startup
  chrome.storage.local.get("configSet", (result) => {
    console.log("Checking configSet value on startup:", result);
    if (!result.configSet) {
      // Open the configuration page if still not set
      chrome.tabs.create({ url: chrome.runtime.getURL("config.html") });
    }
  });
});
