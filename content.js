// CollabFox - Ultra-lightweight Blackboard compatibility shim
browser.storage.local.get({ enabled: true }).then(({ enabled }) => {
  if (!enabled) return;

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

  const s = document.createElement("script");
  s.textContent = `(() => {
    const u = "${chromeUA}";
    try {
      Object.defineProperty(navigator, "userAgent", { get: () => u, configurable: true });
      Object.defineProperty(navigator, "appVersion", { get: () => u.slice(8), configurable: true });
      Object.defineProperty(navigator, "vendor", { get: () => "Google Inc.", configurable: true });
      if (!navigator.userAgentData) {
        Object.defineProperty(navigator, "userAgentData", {
          get: () => ({
            brands: [
              { brand: "Chromium", version: "${chromeMajor}" },
              { brand: "Google Chrome", version: "${chromeMajor}" },
              { brand: "Not?A_Brand", version: "24" }
            ],
            mobile: ${isAndroid},
            platform: "${platformName}",
            getHighEntropyValues: () => Promise.resolve({
              architecture: "x86",
              bitness: "64",
              model: "",
              platform: "${platformName}",
              platformVersion: "15.0.0"
            })
          }),
          configurable: true
        });
      }
    } catch(e) {}
    try {
      if (window.CSS?.supports) {
        const orig = window.CSS.supports.bind(window.CSS);
        window.CSS.supports = (p, v) => (typeof p === "string" && p.includes("-moz-appearance")) ? false : orig(p, v);
      }
    } catch(e) {}
  })();`;
  (document.head || document.documentElement).appendChild(s);
  s.remove();
});
