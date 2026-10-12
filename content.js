// CollabFox - Isolated World Controller
// Bridges browser.storage preferences with main-world shim execution and sessionStorage state.
browser.storage.local.get({ enabled: true }).then(({ enabled }) => {
  try {
    if (!enabled) {
      sessionStorage.setItem("__collabfox_disabled__", "1");
      window.dispatchEvent(new CustomEvent("__collabfox_revert__"));
    } else {
      sessionStorage.removeItem("__collabfox_disabled__");
    }
  } catch (e) {}
});
