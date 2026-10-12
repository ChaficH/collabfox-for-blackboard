<div align="center">
  <img src="icons/icon-128.png" width="96" height="96" alt="CollabFox Logo" />
  <h1>CollabFox</h1>
  <p><strong>Restores native Firefox compatibility for Blackboard Collaborate by handling client-side capability probing and browser gating.</strong></p>

  <p>
    <a href="https://addons.mozilla.org/firefox/addon/collabfox-for-blackboard/"><img src="https://img.shields.io/badge/Firefox-Add--on-orange?logo=firefox-browser" alt="Firefox Add-on" /></a>
    <a href="https://addons.mozilla.org/firefox/addon/collabfox-for-blackboard/"><img src="https://img.shields.io/badge/Platform-Desktop_%26_Android-blue" alt="Platform" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg" alt="License: MPL 2.0" /></a>
    <a href="https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions"><img src="https://img.shields.io/badge/Manifest-V3-purple.svg" alt="Manifest V3" /></a>
  </p>
</div>

---

## 📖 Overview & Origin

**CollabFox** was built out of necessity for students and educators because standard User-Agent switchers fail Blackboard Collaborate's dual-layer script environment checks.

When joining a session on Blackboard Collaborate (`eu.bbcollab.com`, `*.class.com`, etc.) in modern Firefox, users are blocked by an artificial barrier:

> *"Uh-oh. Firefox isn't supported. Blackboard Collaborate works best on Google Chrome..."*

Even though Firefox natively supports all necessary WebRTC, MediaStream, and screen-sharing standards, Collaborate's client bundle (`device-detect.ts`) enforces two arbitrary barriers:
1. It specifically detects Gecko by probing `CSS.supports("-moz-appearance", "none")`, overriding standard User-Agent spoofers back to `"Firefox"`.
2. It requires a Chromium User-Agent with version `Chrome >= 138.0.0`.

CollabFox neutralizes both barriers seamlessly with near-zero runtime overhead.

---

## ⚙️ How It Works

CollabFox executes synchronously at `document_start` before Collaborate's scripts initialize:

* **`CSS.supports` Interception:** Stubs `CSS.supports("-moz-appearance", ...)` to return `false` on Collaborate domains while preserving native Gecko behavior for every other CSS property.
* **Client Identity Alignment:** Synchronously overrides `navigator.userAgent`, `navigator.appVersion`, and `navigator.vendor` with modern Chrome equivalents matching your platform (Windows, macOS, Linux, or Android).
* **Untouched WebRTC Integrity:** Leaves all native `RTCPeerConnection`, `MediaStream`, microphone, camera, and screen sharing APIs 100% native and untampered.
* **Zero-Resource Footprint:** 100% event-driven with zero background service workers, zero alarms, and zero polling. Injects in $<0.05\text{ms}$ and disposes of its temporary DOM node immediately.

---

## 📦 Installation

### Option 1: Firefox Add-ons (Recommended)
Install directly from [Mozilla Add-ons (AMO)](https://addons.mozilla.org/firefox/addon/collabfox-for-blackboard/).

### Option 2: Temporary Add-on (For Developers)
1. Clone or download this repository.
2. In Firefox, navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select `manifest.json` from the root of this folder.

---

## 🔒 Permissions & Privacy

CollabFox operates under a strict principle of least privilege:

| Permission | Purpose |
| :--- | :--- |
| `storage` | Stores your on/off toggle state locally in your browser profile. |
| `activeTab` | Allows the popup to detect if the current active tab is a Collaborate room and reload it when toggled. |
| `*://*.bbcollab.com/*`<br>`*://*.class.com/*`<br>`*://*.blackboard.com/*` | Scopes script execution exclusively to Collaborate domains. |

* **Zero Tracking:** No analytics, telemetry, or remote dependencies.
* **100% Offline:** Runs entirely within your local browser sandbox.

---

## 🐛 Upstream Bug Tracking

This issue has been formally diagnosed, reported, and submitted with a patch to Mozilla:
* **Mozilla Bugzilla:** [Bug 2033777](https://bugzilla.mozilla.org/show_bug.cgi?id=2033777)
* **Webcompat Tracker:** [webcompat/web-bugs#237376](https://github.com/webcompat/web-bugs/issues/237376)
* **Gecko Intervention Patch:** Included in [`patches/firefox-webcompat-bug2033777.patch`](patches/firefox-webcompat-bug2033777.patch).

---

## 📄 License

This project is open-source and licensed under the [Mozilla Public License 2.0 (MPL-2.0)](LICENSE).
