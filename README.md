# 🚀 Motionreis Master Suite

An elite, all-in-one After Effects integration panel designed for professional motion designers, animators, and pipeline engineers. Motionreis unifies asset organization, timeline management, character rigging, custom easing, wiggle generators, and rendering tools into a single, high-performance panel.

---

> [!WARNING]
> ### ⚖️ OPEN-SOURCE LICENSE & ETHICS
> This is an **OPEN-SOURCE** repository. 
> * **NO SELLING:** Selling this software or any of its components is strictly prohibited.
> * **NO MALICIOUS MODS:** Modifying the code for malicious purposes, including but not limited to injecting backdoors, trackers, or unauthorized data collection, is a violation of this project's ethics.
> * Always respect the work of the community and keep this tool free and safe for everyone.

> [!CAUTION]
> ### ⚠️ IMPORTANT: SECURITY WARNING
> **NEVER** download or install **Motionreis Master Suite** from any source other than this official GitHub repository.
> * Third-party websites, "cracked" versions, or unofficial mirrors may contain **malware**, **keyloggers**, or **backdoors** that can compromise your professional workstation and Adobe account security.
> * We do not provide support or guarantee the integrity of files obtained from external sources.

---

## ✨ Key Features & Technical Modules

### 🎛️ 1. Rigging & Motion Engine
* **Anchor Point Engine:** Native 3x3 geometric matrix snapping to reposition anchor points with zero layer displacement.
* **Smart Null Generator:** Automatically calculates selection limits in the timeline to instantiate 2D/3D Nulls that wrap layers perfectly within their `inPoint` and `outPoint`.
* **Path & Character Rigging:** Specialized tools for advanced path manipulation and automated rigging workflows.

### 📈 2. Kinetics & Keyframe Intelligence
* **Keyframe Wingman:** Premium bezier slider interface providing a visual graph to adjust keyframe velocities and influences dynamically.
* **My Ease Library:** A catalog system to save, rename, and instantly apply custom-made easing presets across projects.
* **Wiggle Pro:** Mathematical loopable wiggle generator featuring real-time waveform visualizers for precision previews.

### 🎨 3. Design & Text Automation
* **Smart Text Tools:** Includes auto-typewriting expressions, handheld shake presets, and parallax camera modules.
* **Quick Layers:** One-click spawning for Solids, Adjustment layers, Shapes, and Cameras with pre-defined professional settings.

### ⚙️ 4. Pipeline & Macro Utilities
* **Power Precomp:** Scans targeted layers, calculates exact bounds, and trims the resulting pre-composition to match the frame bounds cleanly.
* **Auto Prism:** Intelligent layer grouping and color-coding system for complex timeline organization.
* **Render Pipeline:** Automated Adobe Render Queue additions and RAM purging utilities to maintain peak performance in high-intensity environments.

### 💎 5. Smart UI Design System
* **Smart Panel Mode:** Uses an internal Event Metrics Tracker to identify your Top 5 most used buttons, highlighting them with a clean 2px solid border for rapid access.
* **High-Contrast Aesthetics:** A dark-mode palette (`#151518`) using Violet and Amber accents, strictly avoiding generic green/teal colors to maintain professional visual clarity.
* **Theme Sync:** Native inheritance of After Effects accent colors across all extension cards and utility buttons.

---

## 📂 Project Structure

```text
Motionreis PLUGIN/
├── CSXS/
│   └── manifest.xml           # CEP Extension Manifest (ID, Size, Config)
├── panels/
│   └── master/
│       ├── index.html         # UI and Navigation Logic (Rigging, Kinetics, Scene modules)
│       ├── build_master.py    # Production compiler scripts
├── jsx/                       # ExtendScript Backend Engine
│   ├── motion.jsx             # Anchor snapping and Null generation logic
│   ├── layers.jsx             # Smart precomping and shape layer management
│   ├── creative.jsx           # Text animations and dynamic rigging
│   └── pipeline.jsx           # Render queue and asset organization
├── shared/
│   ├── theme.css              # Design Tokens and Layout System (HSL Palette)
│   ├── csinterface.js         # Adobe CEP Javascript Interface API
│   └── bridge.js              # ExtendScript execution bridge
├── INSTALL MAC.command        # Automated macOS deployment
└── INSTALL WINDOWS.bat        # Automated Windows deployment