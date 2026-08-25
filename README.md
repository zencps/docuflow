# DocuFlow — Documentation & SOP Builder

<p align="center">
  <strong>A high-productivity, distraction-free Markdown previewer and Standard Operating Procedure (SOP) authoring tool.</strong><br>
  Built with Swiss Grid technical minimalism, live document telemetry, XSS sanitization, and zero backend dependencies.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Vanilla_ES6+-0F172A?style=flat-square" alt="Vanilla ES6+">
  <img src="https://img.shields.io/badge/Security-DOMPurify_Sanitized-059669?style=flat-square" alt="DOMPurify Sanitized">
  <img src="https://img.shields.io/badge/Markdown-Marked.js_GFM-2563EB?style=flat-square" alt="Marked.js GFM">
  <img src="https://img.shields.io/badge/Accessibility-WCAG_2.2_AAA-3B82F6?style=flat-square" alt="WCAG 2.2 AAA">
  <img src="https://img.shields.io/badge/Runtime-100%25_Client--Side-78716C?style=flat-square" alt="100% Client-Side">
  <img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License">
</p>

---

## 📌 Overview

**DocuFlow** is a client-side Markdown authoring environment engineered specifically for operations leads, technical writers, site reliability engineers (SREs), and virtual assistants. It bridges the gap between raw text editing and publication-ready Standard Operating Procedures (SOPs), knowledge base guides, and incident runbooks.

Unlike generic note-taking apps, DocuFlow emphasizes:
* **Zero-Distraction Technical Focus:** No arbitrary AI gradients, heavy frameworks, or bloated build pipelines.
* **Typographical Dual-Hierarchy:** Precision monospaced editing alongside Swiss neo-grotesque rendered documentation.
* **Hardened Security:** Continuous real-time DOM sanitization preventing Cross-Site Scripting (XSS).
* **Live Telemetry & State Persistence:** Automatic metrics calculation and non-volatile browser storage.

---

## ⚡ Key Features

### 1. Real-Time Markdown Parsing & Hardened Security
* **Sub-16ms Parsing Pipeline:** Powered by `Marked.js` configured with GitHub Flavored Markdown (GFM), table generation, task lists, and natural line-breaks.
* **XSS Sanitization:** All parsed HTML passes through `DOMPurify.sanitize()` prior to DOM insertion, neutralizing malicious attack vectors (`<img src=x onerror=...>`, `<script>`, `<iframe src="javascript:...">`, etc.) while safeguarding interactive checkboxes.

### 2. Live Document Telemetry Engine
* **Clean Word Counter:** Dynamically strips Markdown syntax delimiters (heading `#`, list bullets `- [ ]` / `*`, blockquote `>`, code fences, and table `|` pipes) so structural markup does not artificially inflate document metrics.
* **Character Counter:** Real-time UTF-8 string length counter.
* **Estimated Reading Time:** Calculated against the technical reading benchmark of **200 Words Per Minute (WPM)**, rounded up to the nearest minute.

### 3. Cursor-Aware Quick-Insert Formatting Toolbar
* **History Controls (Undo & Redo):** Dedicated toolbar buttons wired up to native browser history and an internal snapshot stack (`Ctrl+Z` / `Ctrl+Y`) for seamless reversion and reapplication of editing and formatting actions.
* **Single-Click Insertion:** Inserts Headings (`H1`, `H2`, `H3`), Bold, Italic, Task Checklists (`- [ ]`), Tables, Callouts (`> **Note:**`), and Fenced Code Blocks.
* **Selection-Aware Wrapping:** Wraps active selections with markdown syntax (e.g., selected text becomes `**selected text**` or multi-line `- [ ] ` checklist items).
* **History Preservation:** Utilizes `document.execCommand('insertText')` and `setRangeText()` to preserve native undo/redo stacks.

### 4. Enterprise Starter Templates
Pre-loaded with four production-grade operational workflows:
1. **Standard Operating Procedure (SOP):** Full reference procedure with Document Scope & Revision History table, Pre-Flight Checklist, Canary Deployment, Troubleshooting & Escalation runbook, and Rollback syntax.
2. **Blank Standard Operating Procedure (SOP):** Clean, standardized structural scaffold ready for rapid procedure drafting (Scope, Ownership, Prerequisites, Phased Execution, Escalation Matrix, and Sign-Off Checklist).
3. **Client Onboarding / Knowledge Base Guide:** Onboarding Timeline matrix, Identity Provider (SAML 2.0 / SSO) setup, API Bearer authentication quickstart, FAQ, and Support SLA Tiers.
4. **Technical Bug Report / Incident Runbook:** Severity 2 Incident overview, Environment Attributes, Curl Steps to Reproduce, Expected vs. Actual behavior, Database Lock resolution commands, and Retrospective checklist.
* **Non-Destructive Template Switching:** Features a sleek, theme-matched modal popup that protects unsaved author changes, eliminating disruptive native browser dialogs.

### 5. Multi-Format Export Suite
DocuFlow features an accessible dropdown menu providing instant, zero-dependency client-side file downloads:
* **Text & Editable Formats:**
  * **Markdown (`.md`):** Raw GitHub-flavored markdown with clean delimiter formatting.
  * **HTML Document (`.html`):** Standalone web page with embedded Swiss technical typography, dark/light theme awareness, and responsive table styling.
  * **Rich Text Format (`.rtf`):** Formatted for direct editing in Microsoft Word, Google Docs, Apple Pages, and WordPad.
* **Specialized Operational Formats:**
  * **Structured Data (`.json`):** Full document AST breakdown including metadata, section hierarchy, checklist tasks, tables, and telemetry metrics for CI/CD and API automation.
  * **Spreadsheet & Audit Matrix (`.csv`):** Excel-compatible UTF-8 BOM CSV extracting operational procedure tables and checklist items (`Section, Type, Item, Status`).
* **Instant Actions:**
  * **Copy Sanitized HTML:** One-click clipboard copy of clean, XSS-sanitized HTML.
  * **Print & PDF Engine:** Integrated `@media print` stylesheet (`css/print.css`) that strips all UI chrome, formatting only the documentation preview for A4/Letter PDF generation.

### 6. Local Persistence, Clean URLs & High-Contrast Theming
* **Auto-Save Pipeline:** Every keystroke synchronizes instantly to `window.localStorage` with visual save status feedback (`Draft Ready` → `Saving...` → `Saved to Storage`).
* **Dual-Theme Engine:** High-contrast Light Mode (14.5:1 text contrast) and Midnight Dark Mode (15.2:1 text contrast) with persistent preference storage and OS `prefers-color-scheme` synchronization.
* **Dismissible Info Banner:** Sleek technical introduction banner explaining application core capabilities with persistent dismissal state (`docuflow_banner_dismissed`).
* **Clean URL Management:** Normalizes browser address bar automatically (`/index.html` → `/`) and uses clean relative internal navigation paths with zero URL hash pollution.

---

## 🏛️ System Architecture

```
docuflow/
├── index.html                   # Semantic HTML5 shell & accessible landmarks
├── SPECS.md                     # Technical requirements & SDLC roadmap
├── README.md                    # Project documentation & architecture manual
├── css/
│   ├── styles.css               # Core design system, variables & Swiss grid
│   └── print.css                # Dedicated @media print / PDF styling rules
├── js/
│   ├── app.js                   # Main application entry & parsing coordinator
│   ├── telemetry.js             # Word count, char count & 200 WPM estimator
│   ├── toolbar.js               # Cursor-aware formatting syntax insertion
│   ├── storage-export.js        # File download, clipboard & print actions
│   └── templates.js             # Operational SOP, onboarding & runbook templates
└── design-system/
    └── docuflow/
        └── MASTER.md            # Design system source of truth (colors, typography)
```

### Module Flow & Data Pipeline

```text
[ User Input in #editor-textarea ]
                │
                ├───► [ js/telemetry.js ] ───► Update Status Bar (Words, Chars, Read Time)
                │
                ├───► [ localStorage ] ──────► Persist Content (docuflow_content)
                │
                └───► [ Marked.js (GFM) ]
                            │
                            ▼
                    [ Raw HTML Output ]
                            │
                            ▼
                    [ DOMPurify.sanitize() ]
                            │
                            ▼
                [ #preview-container Injection ]
                            │
                            ├───► Task List Post-Processing (Remove Bullet Discs)
                            └───► Table Responsive Wrapper (.table-responsive)
```

---

## 🔒 Security Architecture

Client-side Markdown previewers that use `innerHTML` are inherently vulnerable to Cross-Site Scripting (XSS). DocuFlow enforces a strict defense-in-depth security model:

1. **Continuous Sanitization:** Raw HTML generated by `Marked.js` is never injected directly into the DOM. It passes through `DOMPurify.sanitize()` with an explicit whitelist:
   ```javascript
   const cleanHtml = DOMPurify.sanitize(rawHtml, {
     ADD_TAGS: ['input'],
     ADD_ATTR: ['type', 'checked', 'disabled']
   });
   ```
2. **Payload Neutralization:** Attack vectors including `<img src=x onerror=...>`, `<script>`, `<iframe src="javascript:...">`, and inline event attributes (`onclick`, `onload`) are stripped before rendering.
3. **Controlled Tag Whitelisting:** `<input type="checkbox">` elements are strictly constrained to read-only checklist presentations (`disabled`, `checked`) without executable script attributes.

---

## 🎨 Design System & Typography

DocuFlow adheres to the **Swiss Grid & Technical Documentation** design aesthetic:

| Role | Token / Value | Ratio / Mood |
| :--- | :--- | :--- |
| **Editor Font** | `JetBrains Mono`, `ui-monospace`, monospace | Strict fixed-width, ligature-suppressed for code clarity |
| **Preview Font** | `Inter`, system sans-serif | Swiss neo-grotesque, high x-height, tight optical tracking |
| **Light Surface** | `#FFFFFF` on `#F8FAFC` slate app background | Clean, glare-free readability |
| **Light Text** | `#0F172A` (Slate 900) | **14.5:1** contrast ratio (Exceeds WCAG AAA) |
| **Dark Surface** | `#0F172A` on `#090D16` midnight background | Deep technical workspace |
| **Dark Text** | `#F8FAFC` (Slate 50) | **15.2:1** contrast ratio (Exceeds WCAG AAA) |
| **Focus Rings** | `2px solid var(--border-focus); offset: 2px` | WCAG 2.2 AAA visible indicator compliance |

---

## 🚀 Getting Started

DocuFlow requires **zero compilation, zero build steps, and zero dependencies**.

### Quick Start
1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/docuflow.git
   cd docuflow
   ```
2. Open `index.html` directly in any modern browser:
   * **Chrome, Edge, Firefox, Safari, Brave** (ES6+ compatible).
3. Alternatively, serve via any lightweight static server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve .
   ```

---

## 🧪 Automated Verification Suite

DocuFlow includes an automated verification script (`verify_sprint4.js`) that connects to headless Chromium/Edge via the **Chrome DevTools Protocol (CDP)** to test all acceptance criteria:

```bash
node scratch/verify_sprint4.js
```

### Verified Acceptance Criteria (21/21 Passing)
- [x] **AC-01:** Default SOP template loaded on first visit when `localStorage` is empty.
- [x] **AC-02:** Live telemetry computed on initial load (361 words, ~2 min reading time).
- [x] **AC-03 to AC-11:** Toolbar insertion verified for H1, H2, H3, Bold, Italic, Checklist, Table, Callout, and Code Blocks.
- [x] **AC-12:** Text selection wrapping verified (e.g. `**Important Term**`).
- [x] **AC-13:** Onboarding template loaded via dropdown selector.
- [x] **AC-14:** Incident Runbook template loaded via dropdown selector.
- [x] **AC-15:** Real-time rendering active and XSS payloads (`<img onerror>`, `<script>`) neutralized.
- [x] **AC-16:** GitHub Flavored Markdown task list checkboxes rendered cleanly.
- [x] **AC-17:** "Copy HTML" writes clean rendered HTML to system clipboard.
- [x] **AC-18:** "Download .md" triggers anchor file download with slugified filename.
- [x] **AC-19:** "Print / Save PDF" triggers `window.print()`.
- [x] **AC-20:** Text content and theme preference saved to `localStorage` on input.
- [x] **AC-21:** State hydrates accurately after page reload.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
