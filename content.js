// CollabFox - Isolated World Controller
// Bridges browser.storage preferences with main-world shim execution and sessionStorage state.
function syncState(isEnabled) {
  try {
    if (isEnabled) {
      sessionStorage.removeItem("__collabfox_disabled__");
      window.dispatchEvent(new CustomEvent("__collabfox_apply__"));
    } else {
      sessionStorage.setItem("__collabfox_disabled__", "1");
      window.dispatchEvent(new CustomEvent("__collabfox_revert__"));
    }
  } catch (e) {}
}

// Initial state synchronization on page load
browser.storage.local.get({ enabled: true }).then(({ enabled }) => {
  syncState(enabled);
});

// Real-time synchronization when user toggles in popup
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "enabled" in changes) {
    syncState(changes.enabled.newValue !== false);
  }
});
