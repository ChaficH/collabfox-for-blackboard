// CollabFox - Ultra-lightweight Blackboard compatibility shim
browser.storage.local.get({ enabled: true }).then(({ enabled }) => {
  if (!enabled) return;

  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isTablet = /Tablet/i.test(ua);
  const isWin = /Windows/i.test(ua);
  const isLin = /Linux/i.test(ua) && !isAndroid;

  const chromeUA = isAndroid
    ? `Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 ${isTablet ? "" : "Mobile "}Safari/537.36`
    : isWin
    ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
    : isLin
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
