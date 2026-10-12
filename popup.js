document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("enableToggle");
  const statusBar = document.getElementById("statusBar");
  const statusText = document.getElementById("statusText");
  const osSelect = document.getElementById("osSelect");
  const autoOption = document.getElementById("autoOption");
  const currentSite = document.getElementById("currentSite");
  const reloadBtn = document.getElementById("reloadTabBtn");

  // Detect local OS to display on Auto option
  const rawUa = navigator.userAgent;
  const detectedOsName = /Android/i.test(rawUa)
    ? "Android"
    : /Windows/i.test(rawUa)
    ? "Windows"
    : /Mac/i.test(rawUa)
    ? "macOS"
    : "Linux";
  autoOption.textContent = `Auto (${detectedOsName})`;

  // Fast parallel load
  let enabled = true;
  let spoofOs = "auto";
  let activeTab = null;

  try {
    const [storage, tabs] = await Promise.all([
      browser.storage.local.get({ enabled: true, spoofOs: "auto" }),
      browser.tabs.query({ active: true, currentWindow: true })
    ]);
    enabled = storage.enabled;
    spoofOs = storage.spoofOs || "auto";
    activeTab = tabs?.[0];
  } catch (e) {}

  toggle.checked = enabled;
  osSelect.value = spoofOs;

  let hostname = "";
  let isCollabSite = false;

  if (activeTab?.url) {
    try {
      const parsed = new URL(activeTab.url);
      if (parsed.protocol.startsWith("http")) {
        hostname = parsed.hostname;
        isCollabSite = /bbcollab\.com|class\.com|blackboard\.com/i.test(hostname);
      } else {
        hostname = parsed.protocol.replace(":", "");
      }
    } catch (e) {}
  }

  currentSite.textContent = hostname || "—";
  currentSite.title = hostname || "";

  function updateStatus(isEnabled) {
    if (!isEnabled) {
      statusBar.dataset.state = "off";
      statusText.textContent = "Disabled";
    } else if (isCollabSite) {
      statusBar.dataset.state = "active";
      statusText.textContent = "Active on this tab";
    } else {
      statusBar.dataset.state = "standby";
      statusText.textContent = "Inactive on this tab";
    }
  }

  updateStatus(enabled);

  // Toggle enable/disable
  toggle.addEventListener("change", async () => {
    const isChecked = toggle.checked;
    await browser.storage.local.set({ enabled: isChecked });
    updateStatus(isChecked);

    if (activeTab?.id && isCollabSite) {
      try {
        await browser.tabs.reload(activeTab.id);
      } catch (e) {}
    }
  });

  // OS selection change
  osSelect.addEventListener("change", async () => {
    await browser.storage.local.set({ spoofOs: osSelect.value });

    if (activeTab?.id && isCollabSite && toggle.checked) {
      try {
        await browser.tabs.reload(activeTab.id);
      } catch (e) {}
    }
  });

  // Reload button
  reloadBtn.addEventListener("click", async () => {
    if (activeTab?.id) {
      try {
        await browser.tabs.reload(activeTab.id);
        window.close();
      } catch (e) {}
    }
  });
});
