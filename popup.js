document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("enableToggle");
  const siteLabel = document.getElementById("siteLabel");
  const detectedPlatform = document.getElementById("detectedPlatform");
  const reloadBtn = document.getElementById("reloadTabBtn");

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isWindows = /Windows/i.test(navigator.userAgent);
  const isMac = /Mac/i.test(navigator.userAgent);
  detectedPlatform.textContent = isAndroid ? "Android" : isWindows ? "Windows" : isMac ? "macOS" : "Linux";

  const { enabled = true } = await browser.storage.local.get("enabled");
  toggle.checked = enabled;
  siteLabel.textContent = enabled ? "Enabled" : "Disabled";

  toggle.addEventListener("change", async () => {
    const isChecked = toggle.checked;
    await browser.storage.local.set({ enabled: isChecked });
    siteLabel.textContent = isChecked ? "Enabled" : "Disabled";

    // Auto-reload active tab if on Blackboard/Class
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.url && (/bbcollab\.com|class\.com|blackboard\.com/i).test(tab.url)) {
        await browser.tabs.reload(tab.id);
      }
    } catch (e) {}
  });

  reloadBtn.addEventListener("click", async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await browser.tabs.reload(tab.id);
        window.close();
      }
    } catch (e) {}
  });
});
