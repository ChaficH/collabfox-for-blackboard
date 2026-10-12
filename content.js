// CollabFox - Ultra-lightweight Blackboard compatibility shim
browser.storage.local.get({ enabled: true, spoofOs: "auto" }).then(({ enabled, spoofOs }) => {
  if (!enabled) return;

  const rawUa = navigator.userAgent || "";
  let os = spoofOs || "auto";

  if (os === "auto") {
    if (/Android/i.test(rawUa)) os = "android";
    else if (/Windows/i.test(rawUa)) os = "windows";
    else if (/Linux/i.test(rawUa)) os = "linux";
    else os = "mac";
  }

  const isTablet = /Tablet/i.test(rawUa);
  const chromeUA = os === "android"
    ? `Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 ${isTablet ? "" : "Mobile "}Safari/537.36`
    : os === "windows"
    ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
    : os === "linux"
    ? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
    : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

  const code = `(() => {
    const ua = "${chromeUA}";
    try {
      Object.defineProperty(navigator, "userAgent", { get: () => ua, configurable: true });
      Object.defineProperty(navigator, "appVersion", { get: () => ua.replace(/^Mozilla\\//, ""), configurable: true });
      Object.defineProperty(navigator, "vendor", { get: () => "Google Inc.", configurable: true });
    } catch(e) {}
    try {
      if (window.CSS && window.CSS.supports) {
        const orig = window.CSS.supports.bind(window.CSS);
        window.CSS.supports = (p, v) => (typeof p === "string" && p.includes("-moz-appearance")) ? false : orig(p, v);
      }
    } catch(e) {}
  })();`;

  const s = document.createElement("script");
  s.textContent = code;
  (document.head || document.documentElement).appendChild(s);
  s.remove();
});
