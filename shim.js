// CollabFox - Synchronous Main-World Compatibility Shim
// Runs in world: "MAIN" at document_start to beat all page scripts with zero CSP interference.
(() => {
  const rawUa = navigator.userAgent || "";
  const ffMatch = rawUa.match(/Firefox\/(\d+)/);
  const ffMajor = ffMatch ? parseInt(ffMatch[1], 10) : 142;
  const chromeMajor = Math.max(148, ffMajor + 6);
  const chromeVer = `${chromeMajor}.0.0.0`;

  const isAndroid = /Android/i.test(rawUa);
  const isWin = /Windows/i.test(rawUa);
  const isLin = /Linux/i.test(rawUa);
  const platformName = isAndroid ? "Android" : isWin ? "Windows" : isLin ? "Linux" : "macOS";

  const chromeUA = isAndroid
    ? `Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} ${/Tablet/i.test(rawUa) ? "" : "Mobile "}Safari/537.36`
    : isWin
    ? `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36`
    : isLin
    ? `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36`
    : `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36`;

  // Preserve original descriptors once at startup
  const origUA = Object.getOwnPropertyDescriptor(Navigator.prototype, "userAgent") ||
                 Object.getOwnPropertyDescriptor(navigator, "userAgent");
  const origAppVer = Object.getOwnPropertyDescriptor(Navigator.prototype, "appVersion") ||
                     Object.getOwnPropertyDescriptor(navigator, "appVersion");
  const origVendor = Object.getOwnPropertyDescriptor(Navigator.prototype, "vendor") ||
                     Object.getOwnPropertyDescriptor(navigator, "vendor");
  const origSupports = window.CSS?.supports;

  let isApplied = false;

  function applyShim() {
    if (isApplied) return;
    isApplied = true;

    try {
      Object.defineProperty(navigator, "userAgent", { get: () => chromeUA, configurable: true });
      Object.defineProperty(navigator, "appVersion", { get: () => chromeUA.slice(8), configurable: true });
      Object.defineProperty(navigator, "vendor", { get: () => "Google Inc.", configurable: true });

      if (!navigator.userAgentData) {
        Object.defineProperty(navigator, "userAgentData", {
          get: () => ({
            brands: [
              { brand: "Chromium", version: `${chromeMajor}` },
              { brand: "Google Chrome", version: `${chromeMajor}` },
              { brand: "Not?A_Brand", version: "24" }
            ],
            mobile: isAndroid,
            platform: platformName,
            getHighEntropyValues: () => Promise.resolve({
              architecture: "x86",
              bitness: "64",
              model: "",
              platform: platformName,
              platformVersion: "15.0.0"
            })
          }),
          configurable: true
        });
      }
    } catch (e) {}

    try {
      if (origSupports) {
        const boundOrig = origSupports.bind(window.CSS);
        window.CSS.supports = (prop, val) =>
          (typeof prop === "string" && prop.includes("-moz-appearance")) ? false : boundOrig(prop, val);
      }
    } catch (e) {}
  }

  function revertShim() {
    if (!isApplied) return;
    isApplied = false;

    try {
      if (origUA) Object.defineProperty(navigator, "userAgent", origUA);
      if (origAppVer) Object.defineProperty(navigator, "appVersion", origAppVer);
      if (origVendor) Object.defineProperty(navigator, "vendor", origVendor);
      delete navigator.userAgentData;
      if (origSupports) window.CSS.supports = origSupports;
    } catch (e) {}
  }

  // Register bridge listeners FIRST so signals are never dropped
  window.addEventListener("__collabfox_apply__", applyShim);
  window.addEventListener("__collabfox_revert__", revertShim);

  // Synchronously apply at document_start unless explicitly disabled in sessionStorage
  try {
    if (sessionStorage.getItem("__collabfox_disabled__") !== "1") {
      applyShim();
    }
  } catch (e) {
    applyShim();
  }
})();
