document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("enableToggle");
  const toggleStateText = document.getElementById("toggleStateText");
  const statusBadge = document.getElementById("statusBadge");
  const statusMain = document.getElementById("statusMain");
  const statusDetail = document.getElementById("statusDetail");
  const currentDomain = document.getElementById("currentDomain");
  const detectedPlatform = document.getElementById("detectedPlatform");
  const reloadBtn = document.getElementById("reloadTabBtn");

  // Platform detection
  const ua = navigator.userAgent;
  detectedPlatform.textContent = /Android/i.test(ua)
    ? "Android"
    : /Windows/i.test(ua)
    ? "Windows"
    : /Mac/i.test(ua)
    ? "macOS"
    : "Linux";

  // Fast parallel initialization
  let enabled = true;
  let activeTab = null;

  try {
    const [storage, tabs] = await Promise.all([
      browser.storage.local.get({ enabled: true }),
      browser.tabs.query({ active: true, currentWindow: true })
    ]);
    enabled = storage.enabled;
    activeTab = tabs?.[0];
  } catch (e) {}

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

  currentDomain.textContent = hostname || "—";
  currentDomain.title = hostname || "";

  function renderStatus(isEnabled) {
    toggle.checked = isEnabled;
    toggleStateText.textContent = isEnabled ? "Enabled" : "Disabled";

    if (!isEnabled) {
      statusBadge.dataset.status = "disabled";
      statusMain.textContent = "Disabled";
      statusDetail.textContent = "Intervention paused";
    } else if (isCollabSite) {
      statusBadge.dataset.status = "active";
      statusMain.textContent = "Active";
      statusDetail.textContent = "Fix active on this tab";
    } else {
      statusBadge.dataset.status = "standby";
      statusMain.textContent = "Standby";
      statusDetail.textContent = "Not a Collaborate page";
    }
  }

  renderStatus(enabled);

  toggle.addEventListener("change", async () => {
    const isChecked = toggle.checked;
    await browser.storage.local.set({ enabled: isChecked });
    renderStatus(isChecked);

    if (activeTab?.id && isCollabSite) {
      try {
        await browser.tabs.reload(activeTab.id);
      } catch (e) {}
    }
  });

  reloadBtn.addEventListener("click", async () => {
    if (activeTab?.id) {
      try {
        await browser.tabs.reload(activeTab.id);
        window.close();
      } catch (e) {}
    }
  });
});
