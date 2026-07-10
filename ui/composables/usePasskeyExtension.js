// Shared, app-wide detection of the WAHA Passkey extension (bergpinheiro/waha-passkey-extension
// on Chrome, bergpinheiro/waha-passkey-extension-firefox on Firefox). Split out of
// PasskeySteps.vue so the ping can run as soon as the dashboard loads (e.g. for a global
// "install the extension" banner) instead of only once a session actually hits
// PASSKEY_REQUIRED — by then the operator is mid-login and installing costs them time.
//
// The Chrome extension ID and the Firefox install URL are configurable per WAHA instance:
// set WAHA_DASHBOARD_PASSKEY_EXTENSION_ID / WAHA_DASHBOARD_PASSKEY_EXTENSION_FIREFOX_URL in
// the WAHA stack and the dashboard reads them at runtime from GET /api/server/environment
// (so a custom-published extension is detected without rebuilding the static dashboard).
// When no serverId is available (app-wide banner) or the env var is unset, the defaults
// below are used. Reading the env needs the server "manage" permission; on 403 we fall back
// to the defaults quietly.
const DEFAULT_EXTENSION_ID = "ghpdcgnjffaaekflfpcgkgpbafmjldcp"; // Chrome — published (unlisted) on the CWS
// Locale-neutral AMO URL; addons.mozilla.org redirects to the visitor's language.
const DEFAULT_FIREFOX_URL = "https://addons.mozilla.org/firefox/addon/whatsapp-browser-extension/";
const ENV_EXTENSION_ID = "WAHA_DASHBOARD_PASSKEY_EXTENSION_ID";
const ENV_FIREFOX_URL = "WAHA_DASHBOARD_PASSKEY_EXTENSION_FIREFOX_URL";
const PING_TIMEOUT_MS = 300;

function chromeStoreUrl(extensionId) {
  return `https://chromewebstore.google.com/detail/${extensionId}`;
}

// Detect the browser FAMILY (to pick the install prompt + messaging bridge), which is
// separate from whether the extension is actually reachable. Firefox exposes window.chrome
// too, so `!!window.chrome` alone is not a reliable "is Chromium" test — key off the user
// agent. Firefox talks to its extension via a postMessage content-script bridge (no ID);
// Chromium messages it by ID via chrome.runtime.sendMessage.
//
// Note: on Chromium WITHOUT the extension, window.chrome.runtime can be undefined (it only
// appears once an externally_connectable extension is installed), so we must NOT require
// chrome.runtime here — otherwise the "install the extension" prompt would never show on a
// clean Chrome. pingViaChrome guards the missing runtime itself.
function detectFirefox() {
  return process.client && /firefox/i.test(navigator.userAgent);
}
function detectChromium() {
  return process.client && !detectFirefox() && !!window.chrome;
}

function pingViaChrome(extensionId) {
  return new Promise((resolve) => {
    if (!(window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage)) {
      // Chromium with no externally_connectable extension installed → not reachable.
      resolve(false);
      return;
    }
    const timer = setTimeout(() => resolve(false), PING_TIMEOUT_MS);
    try {
      chrome.runtime.sendMessage(extensionId, { type: "waha-passkey-ping" }, (resp) => {
        clearTimeout(timer);
        resolve(!chrome.runtime.lastError && resp?.ok === true);
      });
    } catch (e) {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

// Firefox: no direct chrome.runtime to an external ID — use the content-script bridge (see
// PasskeySteps.vue's callFirefoxExtension for the full contract; this is a standalone
// ping-only copy so this composable has no dependency on that component).
function pingViaFirefox() {
  return new Promise((resolve) => {
    const requestId = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random());
    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, PING_TIMEOUT_MS);
    function onMessage(event) {
      if (event.source !== window) return;
      const data = event.data;
      if (data?.source !== "waha-passkey-extension" || data.requestId !== requestId) return;
      cleanup();
      resolve(!!data.ok);
    }
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
    }
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "waha-passkey-page", requestId, type: "waha-passkey-ping" }, window.location.origin);
  });
}

// Resolve the per-instance config (extension ID + Firefox URL) from the server env once and
// cache it by serverId. serverId=null → defaults (no server context, e.g. the app-wide banner).
const configCache = new Map();
async function resolveConfig(serverId) {
  const cacheKey = serverId == null ? "__default__" : serverId;
  if (configCache.has(cacheKey)) return configCache.get(cacheKey);
  let cfg = { extensionId: DEFAULT_EXTENSION_ID, firefoxUrl: DEFAULT_FIREFOX_URL };
  if (serverId != null) {
    try {
      const env = await useServerStore().getServerEnvironment(serverId, false);
      cfg = {
        extensionId: env?.[ENV_EXTENSION_ID] || DEFAULT_EXTENSION_ID,
        firefoxUrl: env?.[ENV_FIREFOX_URL] || DEFAULT_FIREFOX_URL,
      };
    } catch (e) {
      // Reading the env needs "manage" permission — fall back to defaults quietly.
    }
  }
  configCache.set(cacheKey, cfg);
  return cfg;
}

export function usePasskeyExtension(serverId = null) {
  const isFirefox = detectFirefox();
  // Chromium family (Chrome/Edge/Brave/…) — used for template branching / the Chrome-store
  // install path. Independent of whether the extension is actually installed.
  const isChrome = detectChromium();

  // useState shares these across every component instance for the same server, so the config
  // fetch + ping only run once per (server, page load) regardless of how many components ask.
  const key = serverId == null ? "default" : String(serverId);
  const available = useState(`passkeyExtAvailable:${key}`, () => null); // null = not checked yet
  const checking = useState(`passkeyExtChecking:${key}`, () => false);
  const extensionId = useState(`passkeyExtId:${key}`, () => DEFAULT_EXTENSION_ID);
  const chromeUrl = useState(`passkeyExtChromeUrl:${key}`, () => chromeStoreUrl(DEFAULT_EXTENSION_ID));
  const firefoxUrl = useState(`passkeyExtFirefoxUrl:${key}`, () => DEFAULT_FIREFOX_URL);

  async function check() {
    if (available.value !== null || checking.value) return available.value;
    checking.value = true;
    try {
      const cfg = await resolveConfig(serverId);
      extensionId.value = cfg.extensionId;
      chromeUrl.value = chromeStoreUrl(cfg.extensionId);
      firefoxUrl.value = cfg.firefoxUrl;
      if (isFirefox) {
        available.value = await pingViaFirefox();
      } else if (isChrome) {
        available.value = await pingViaChrome(cfg.extensionId);
      } else {
        available.value = false;
      }
    } finally {
      checking.value = false;
    }
    return available.value;
  }

  // EXTENSION_ID / CHROME_STORE_URL kept as names for existing callers; now reactive refs
  // resolved from the server env.
  return {
    isChrome,
    isFirefox,
    available,
    check,
    EXTENSION_ID: extensionId,
    CHROME_STORE_URL: chromeUrl,
    FIREFOX_STORE_URL: firefoxUrl,
  };
}
