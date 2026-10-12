document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("enableToggle");
  const statusBar = document.getElementById("statusBar");
  const statusText = document.getElementById("statusText");
  const platform = document.getElementById("platform");
  const currentSite = document.getElementById("currentSite");
  const reloadBtn = document.getElementById("reloadBtn");

  const ua = navigator.userAgent;
  platform.textContent = /Android/i.test(ua) ? "Android" : /Windows/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "macOS" : "Linux";

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

  toggle.checked = enabled;

  let hostname = "";
  let isCollab = false;

  if (activeTab?.url) {
    try {
      const url = new URL(activeTab.url);
      if (url.protocol.startsWith("http")) {
        hostname = url.hostname;
        isCollab = /bbcollab\.com|class\.com|blackboard\.com/i.test(hostname);
      } else {
        hostname = url.protocol.replace(":", "");
      }
    } catch (e) {}
  }

  currentSite.textContent = hostname || "—";
  currentSite.title = hostname || "";

  function setStatus(on) {
    if (!on) {
      statusBar.dataset.s = "off";
      statusText.textContent = "Disabled";
    } else if (isCollab) {
      statusBar.dataset.s = "active";
      statusText.textContent = "Active on this tab";
    } else {
      statusBar.dataset.s = "standby";
      statusText.textContent = "Inactive on this tab";
    }
  }

  setStatus(enabled);

  toggle.addEventListener("change", async () => {
    const on = toggle.checked;
    await browser.storage.local.set({ enabled: on });
    setStatus(on);
    if (activeTab?.id && isCollab) {
      try { await browser.tabs.reload(activeTab.id); } catch (e) {}
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
