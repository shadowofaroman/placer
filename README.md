<div align="center">

  # 🖼️ Placer — Smart Image & Document Layout Studio
  
  **The ultimate browser-based utility for placing, cropping, auto-resizing, and printing ANY image or document on A4 paper.**

  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Fabric.js](https://img.shields.io/badge/Canvas-Fabric.js_v5-0D9488?style=for-the-badge)](https://fabricjs.com/)
  [![jsPDF](https://img.shields.io/badge/Export-jsPDF_Vector-E11D48?style=for-the-badge)](https://github.com/parallax/jsPDF)
  [![License](https://img.shields.io/badge/License-MIT-0F172A?style=for-the-badge)](LICENSE)
  
  *Eliminating the hassle of manual Word document image formatting, resizing, and printing.*

  [View Live Demo](#-quick-start) • [Report Bug](https://github.com/shadowofaroman/placer/issues) • [Request Feature](https://github.com/shadowofaroman/placer/issues)

</div>

---

## ⚡ The Origin Story

### ❌ The Old Way (Slow & Frustrating)
Staff at busy service centers (like **Huduma Center**) and offices spent endless hours doing repetitive manual tasks:
1. Downloading customer images (IDs, passport photos, permits, certificates, receipts).
2. Importing them one-by-one into Microsoft Word or Paint.
3. Struggling with image wrapping, margins, and manual scaling.
4. Distorting proportions or guessing print sizes.
5. Saving to PDF and printing.

> ⏱ **Time wasted:** ~3 to 5 minutes per document page.

---

###  The Placer Way (Universal & Lightning Fast)
**Placer** is an all-in-one web app designed to format **ANY image** onto an A4 paper layout instantly:
1. **Upload Anything:** IDs, passports, photos, certificates, or document scans.
2. **Auto-Fit & Aspect Lock:** Intelligent scaling that preserves image sharpness without distortion.
3. **Interactive Workspace:** Drag, rotate, crop, align, and organize images freely on a real-time A4 digital canvas.
4. **1-Click Output:** Export vector-sharp PDFs or print directly to your physical printer in seconds.

> ⏱ **Time taken:** **Under 10 seconds.**

---

## 🔥 Key Features

- ** Universal Image Support:** Works seamlessly with IDs, passport photos, permits, receipts, badges, and general picture scans (`PNG`, `JPG`, `WEBP`).
- ** Standard Physical Scaling:** Smart default presets for standard ID cards (**85.6mm × 53.98mm**) and customizable print layouts.
- ** Anti-Distortion Aspect Locking:** Guarantees uploaded pictures never become stretched, skewed, or "fat".
- ** Powerful Built-in Cropper:** Integrated cropping tool powered by [Cropper.js](https://fengyuanchen.github.io/cropperjs/) to remove messy borders or backgrounds before placing onto the sheet.
- **🎛️ Instant Alignment Presets:**
  - *Standard Stacked* (Top/Bottom auto-alignment)
  - *Side-by-Side* (Horizontal multi-image layout)
  - *4-Up Grid* (Multi-copy printing)
- ** Direct Print Engine:** Built-in CSS `@media print` layout engineered specifically for standard A4 portrait paper.
- ** High-Res Vector PDF Export:** Generates crystal-clear, high-DPI PDF documents ready for official printing.
- ** Mobile & Tablet Friendly:** Fully responsive interface supporting touch drag-and-drop on mobile devices.
- ** Zero Dependencies / No Server Needed:** Pure client-side web application—100% private with no data uploaded to external servers.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Language** | Modern Vanilla JavaScript (ES6+) |
| **Interactive Canvas Engine** | [Fabric.js v5](https://fabricjs.com/) |
| **PDF Generation Engine** | [jsPDF](https://github.com/parallax/jsPDF) |
| **Image Crop Handler** | [Cropper.js](https://fengyuanchen.github.io/cropperjs/) |
| **User Interface** | HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid) |
| **Iconography** | [FontAwesome 6](https://fontawesome.com/) |

---

## 🚀 Quick Start

Because **Placer** is built 100% with native web technology, **there are zero `npm install` or build steps required!**

### Option 1: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/shadowofaroman/placer.git
Navigate into the folder:
code
Bash
cd placer
Double-click index.html to open it directly in any web browser (Chrome, Edge, Firefox, Safari, Brave).
Option 2: Deploy in Seconds
Simply host the project folder on GitHub Pages, Vercel, Netlify, or any web server by pointing the root directory to index.html.
📖 How It Works
code
Code
┌────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ 1. Import Image(s) │ ──> │ 2. Crop, Rotate &    │ ──> │ 3. Export PDF or     │
│    (Photos/IDs)    │     │    Position on Sheet │     │    Print Directly    │
└────────────────────┘     └──────────────────────┘     └──────────────────────┘
Upload Images: Select any photo or document scan via the upload controls.
Crop & Refine: Click "Crop Selected" to remove excess background edges.
Position & Scale: Drag, rotate, or use preset buttons (Stacked, Side-by-Side) to format your layout on the A4 page.
Print / Export: Click "Export PDF" to save or "Print" for immediate printing.
👨‍💻 Author & Contributions
Created with ❤️ by Liman Elkana to streamline document processing and printing for service centers and offices.
GitHub: @shadowofaroman
Project Repo: https://github.com/shadowofaroman/placer/
Contributions, feature suggestions, and pull requests are warmly welcome!
📄 License
Distributed under the MIT License. See LICENSE for more information.
<div align="center">
<sub>Built to make daily document printing faster, easier, and accessible to everyone.</sub>
</div>
```