<div align="center">

<img src="BoltType.png" alt="BoltType Logo" width="80" height="80" style="border-radius:16px"/>

# ⚡ BoltType

**A lightning-fast, mobile-first typing speed test — built as a Progressive Web App**

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-mananmadani.github.io%2FBoltType-4df0d4?style=for-the-badge&labelColor=0d0f1a)](https://mananmadani.github.io/BoltType)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-836fff?style=for-the-badge&logo=pwa&logoColor=white&labelColor=0d0f1a)](https://mananmadani.github.io/BoltType)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black&labelColor=0d0f1a)](https://github.com/mananmadani/BoltType/blob/main/app.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-ff6fba?style=for-the-badge&labelColor=0d0f1a)](LICENSE)

---

*How fast can you type? Find out in 60 seconds.*

</div>

---

## ✨ Features

- **⚡ Real-time WPM** — Words Per Minute updates live as you type
- **🎯 Accuracy Tracking** — Per-character correct/incorrect highlighting with accuracy bar
- **⏱ 60-Second Timer** — Classic timed mode, starts on your first keypress
- **🏆 High Score** — Persisted locally via `localStorage`, survives app restarts
- **📱 Mobile-First** — Built for thumbs: large tap targets, keyboard-aware layout
- **🌐 Works Offline** — Full PWA with Service Worker caching — zero network needed
- **💾 Installable** — Add to Home Screen on iOS & Android for a native app feel
- **🎨 Dark Aesthetic** — Gemini-inspired deep navy + electric cyan/violet palette
- **✨ Particle Background** — Animated canvas particles for atmosphere
- **🔤 Smooth Scroll** — Text window scrolls line-by-line as you type, always keeping context visible

---

## 🚀 Live Demo

**👉 [mananmadani.github.io/BoltType](https://mananmadani.github.io/BoltType)**

---

## 📸 Preview

| Idle Screen | Typing Mode | Results |
|:-----------:|:-----------:|:-------:|
| Start screen with animated bolt | Live WPM + character highlighting | Score card with accuracy & WPM |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic, mobile-viewport) |
| Styles | CSS3 — custom properties, `dvh` units, `scroll-behavior` |
| Logic | Vanilla JavaScript (ES6+, zero dependencies) |
| Fonts | [Space Mono](https://fonts.google.com/specimen/Space+Mono) + [Syne](https://fonts.google.com/specimen/Syne) via Google Fonts |
| Offline | Service Worker (Cache-First strategy) |
| PWA | Web App Manifest (`standalone` display mode) |

---

## 📂 Project Structure

```
BoltType/
├── index.html          # App shell — layout, stats bar, typing card
├── style.css           # Dark theme, animations, mobile UX
├── app.js              # Typing engine, timer, WPM, scroll logic
├── manifest.json       # PWA metadata (name, icons, display mode)
├── service-worker.js   # Offline caching (Cache-First)
└── BoltType.png        # App icon
```

---

## ⚙️ How It Works

1. **Tap "Start Game"** — 100 random words are generated and displayed
2. **Type freely** — each character is highlighted green (correct) or red (wrong) in real time
3. **Timer starts** on your first keypress — 60 seconds on the clock
4. **Text scrolls up** automatically every time you complete a line, keeping 5 lines always visible
5. **Round ends** when the timer hits zero — your WPM and accuracy are shown
6. **High score** is saved automatically if you beat your personal best

---

## 📲 Install as App (PWA)

### Android (Chrome)
1. Open the [live demo](https://mananmadani.github.io/BoltType) in Chrome
2. Tap the **⋮ menu → "Add to Home screen"**
3. Tap **Add** — BoltType appears as a standalone app icon

### iOS (Safari)
1. Open the [live demo](https://mananmadani.github.io/BoltType) in Safari
2. Tap the **Share button → "Add to Home Screen"**
3. Tap **Add** — launches fullscreen, no browser chrome

---

## 🏃 Run Locally

No build step, no dependencies — just open it:

```bash
git clone https://github.com/mananmadani/BoltType.git
cd BoltType

# Serve with any static server (required for Service Worker)
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

> **Note:** Service Workers require HTTPS or `localhost`. Opening `index.html` directly via `file://` will disable offline caching.

---

## 🧮 WPM Formula

```
WPM = (correct characters ÷ 5) ÷ minutes elapsed
```

The standard "5 characters = 1 word" formula is used — the same method as Monkeytype, TypeRacer, and most professional typing tests.

---

## 📄 License

MIT © [mananmadani](https://github.com/mananmadani)

Feel free to fork, remix, and build on this. A star ⭐ is appreciated if you found it useful!

---

<div align="center">

Built with ⚡ and zero frameworks · Hosted on GitHub Pages

</div>
