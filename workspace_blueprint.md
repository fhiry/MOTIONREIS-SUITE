# 📐 Motionreis Codebase Blueprint & Structural Map

This document serves as an exhaustive structural blueprint and relationship map for the Motionreis After Effects Extension. It is designed to give any coding AI or developer an instant, comprehensive understanding of the codebase architecture, module hierarchies, and data flows to facilitate rapid improvements and flawless maintenance.

---

## 🗺️ 1. Architecture Overview

Motionreis operates on the **Adobe CEP (Common Extensibility Platform)** framework, utilizing a decoupled, asynchronous model:

```mermaid
graph TD
    A[index.html (HTML5 UI)] -->|CSS Styling| B[theme.css (Design System)]
    A -->|User Actions| C[bridge.js & csinterface.js]
    C -->|EvalScript Bridge| D[ExtendScript Backend (.jsx)]
    D -->|Adobe DOM API| E[After Effects Application]
    E -->|Success/Error Return| C
    C -->|Promises| A
```

---

## 🗂️ 2. Core Directory Blueprint

### 🎨 A. Core Design System & Configuration
* **[`shared/theme.css`](file:///Users/sebastian/Documents/Motionreis%20PLUGIN/shared/theme.css):**
  * **Design Tokens:** Defines core HSL dark mode palettes (`--bg-app: #151518`, `--bg-card: #1c1c20`, `--bg-hover: #26262b`).
  * **Accents:** Active Indigo theme primary accent (`--accent-primary: #5c6ac4`).
  * **Button Component Styles:** `.btn` (standard utility state) and `.btn-primary` (solid brand accent state).
  * **Layout Systems:** Universal `box-sizing: border-box` to prevent sizing jitter during thick flat borders (e.g., in Smart Panel focus state).

### 🖥️ B. Consolidated Frontend Application
* **[`panels/master/index.html`](file:///Users/sebastian/Documents/Motionreis%20PLUGIN/panels/master/index.html):**
  * **Modular Navigation:** Left-hand vertical sidebar utilizing `.tab-btn` elements switching active modules asynchronously.
  * **UI Cards & Grid Containers:**
    1. **Rigging Module (`#mod-rigging`):** Contains Anchor Point Snap grid (`#card-anchor`), Motion Tools suite (`#card-motiontools`), and Path Rigging (`#card-pathrigging`).
    2. **Kinetics Module (`#mod-kinetics`):** Contains Keyframe Wingman velocity curve graphs (`#card-wingman`), Presets grid (`#card-presets`), Custom Ease presets (`#card-myeaselibrary`), and Wiggle Pro generator (`#card-wigglepro`).
    3. **Design Module (`#mod-design`):** Text Animations, Auto Text Box, and Split Text.
    4. **Scene Module (`#mod-scene`):** Camera Rigging and Audio-Reactive controllers.
    5. **Layers Module (`#mod-layers`):** Auto Prism color labels and Layer Grouping.
    6. **Macro Module (`#mod-macro`):** Precomp, Crop Comp, Render pipelines, and RAM Purging.
  * **JS Preferences Manager:** Handles `localStorage` reads/writes for Smart Panel, include-icon modes, and theme variables, automatically syncing with persistent offline JSON cache configurations (`theme_config.json`).
  * **Event Metrics Tracker:** Maps exact static `.onclick` code signatures to mathematically rank the Top 5 most active buttons individually.

### ⚙️ C. ExtendScript Backend Engine (`jsx/`)
* **[`jsx/motion.jsx`](file:///Users/sebastian/Documents/Motionreis%20PLUGIN/jsx/motion.jsx):**
  * **`nullFromSelection(args)`:** Dynamically determines selected layer limits in timeline frames, instantiating a target-compensated 2D/3D Null layer and adjusting its timeline `inPoint` and `outPoint` to wrap the selection perfectly.
  * **`snapAnchor(point, compensate)`:** Native 3x3 geometric matrix snapping to reposition anchor points without layer displacement.
  * **`applyWiggle(freq, amp, loop)`:** Loops custom After Effects wiggle equations over selected layer properties.
* **[`jsx/layers.jsx`](file:///Users/sebastian/Documents/Motionreis%20PLUGIN/jsx/layers.jsx):**
  * **`preRender(args)`:** Triggers smart precompositions. It scans all targeted layers, calculates exact timeline bounds, packs them, and trims the new precomp layer in the master timeline to match the exact in/out frame bounds cleanly.
  * **`explodeShapeLayer(args)`:** Fragments Shape group layers into individual shapes.
* **[`jsx/creative.jsx`](file:///Users/sebastian/Documents/Motionreis%20PLUGIN/jsx/creative.jsx):** Text engine typewriting expressions, handheld shakes, and parallax camera modules.
* **[`jsx/pipeline.jsx`](file:///Users/sebastian/Documents/Motionreis%20PLUGIN/jsx/pipeline.jsx):** Automatic file organization, caching purges, and automated After Effects Render Queue additions.

---

## ⚡ 3. Core Technical Constraints (Rule-Guard)

If you are an AI assistant tasked with improving or rewriting files, you **must adhere to these constraints**:

| Constraint Type | File / Target | Specific Rule / Syntax |
| :--- | :--- | :--- |
| **No Green/Teal (Ijo)** | `index.html` CSS block | Never define green hex codes like `#059669` or cyan codes like `#0891b2` for default card icon themes. Use Violet `#8b5cf6` for Design and Amber `#d97706` for Create Layers. |
| **Primary Contrast** | `index.html` CSS block | Primary active buttons (`.btn-primary`) and their icons (`.btn-primary .material-symbols-rounded`) must force a solid white color (`#ffffff !important`). |
| **Anchor Point Color** | `index.html` CSS block | The `#card-anchor` buttons must have NO manual icon color overrides. They must safely follow default theme values natively. |
| **Smart Panel Border** | `index.html` CSS block | Smart panel highlights must use a clean, flat 2px solid border (`border: 2px solid var(--accent-primary) !important`) with NO glow or shadows. |
| **Box-Sizing** | `theme.css` | All buttons and containers must use `box-sizing: border-box` to prevent 2px borders from shifting layout sizes. |

---

## 🚀 4. Strategic Areas of Improvement

Developers/AIs can target the following areas for immediate improvement:

### 📈 Phase 1: Markdown & Documentation Optimization
1. **Extend README.md:** Add a detailed FAQ section addressing common CEP registry troubleshooting (e.g., setting `PlayerDebugMode` via terminal commands).
2. **Visual Assets Map:** Add placeholder links/embed paths for screenshots of each card (Wingman, Wiggle Pro, Anchor Snap, Smart Panel Settings) to show beautiful UI flows on GitHub.

### ⚙️ Phase 2: Performance & Asset Optimizations
1. **JS Event Debouncing:** Add strict debouncing on sliders inside Wiggle Pro and Keyframe Wingman to prevent flooding CEP-to-JSX execution bridges with redundant calls during mouse drags.
2. **Preferences Caching:** Implement active in-memory caching of the metrics database file (`click_metrics.json`) to minimize synchronous disk I/O when tracking button clicks during fast user interactions.
