# CollabFox for Blackboard 🦊

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Firefox Desktop](https://img.shields.io/badge/Firefox-Desktop_&_Android-orange.svg)](https://addons.mozilla.org/firefox/addon/collabfox-for-blackboard/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions)

**CollabFox** enables Blackboard Collaborate on Firefox Desktop and Android by neutralizing artificial browser barriers.

---

## ❓ The Problem

When attempting to join a session on Blackboard Collaborate (`eu.bbcollab.com`, `*.class.com`, etc.) using modern Firefox, users are greeted with an artificial block screen:

> *"Uh-oh. Firefox isn't supported. Blackboard Collaborate works best on Google Chrome..."*

Even though Firefox supports all necessary WebRTC, MediaStream, and audio/video standards required by Collaborate, Collaborate's client bundle (`device-detect.ts`) enforces two arbitrary barriers:
1. It specifically detects Gecko by testing `CSS.supports("-moz-appearance", "none")`.
2. It requires a Chromium User-Agent with version `Chrome >= 138.0.0`.

---

## 💡 The Solution

CollabFox intercepts these checks right at `document_start` before Collaborate's scripts initialize:
- **`CSS.supports` Interception:** Shims `CSS.supports("-moz-appearance", ...)` to return `false` on Collaborate domains while preserving native behavior for all other CSS properties.
- **Client Identifier Adjustment:** Overrides `navigator.userAgent`, `navigator.appVersion`, and `navigator.vendor` with high-version Chrome identifiers suited for your device (Desktop or Android).
- **Zero-Resource Footprint:** 100% event-driven with zero background service workers, zero polling, and zero network modifications. Once injected, resource consumption is virtually zero.

---

## ✨ Features

- 🖥️ **Full Firefox Desktop Support:** Works out of the box on Windows, macOS, and Linux.
- 📱 **Firefox Android Compatible:** Seamlessly joins sessions from mobile devices.
- 🎛️ **Quick On/Off Toggle:** Built-in Proton-styled popup to disable or re-enable the fix on demand with automatic tab refresh.
- 🔒 **Privacy First:** 0 external connections, 0 analytics, and 0 data collection permissions.

---

## 🚀 Installation

### Option 1: Firefox Add-ons (Recommended)
Install directly from [Mozilla Add-ons (AMO)](https://addons.mozilla.org/firefox/addon/collabfox-for-blackboard/).

### Option 2: Temporary Add-on (Development)
1. Clone or download this repository.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select `manifest.json` from the repository folder.

---

## 🐛 Upstream Reports

This issue has been formally diagnosed and submitted to the Mozilla Web Compatibility and Gecko teams:
- **Mozilla Bugzilla:** [Bug 2033777](https://bugzilla.mozilla.org/show_bug.cgi?id=2033777)
- **Webcompat Issue:** [webcompat/web-bugs#237376](https://github.com/webcompat/web-bugs/issues/237376)

---

## 📄 License

This project is licensed under the [Mozilla Public License 2.0 (MPL-2.0)](LICENSE).
