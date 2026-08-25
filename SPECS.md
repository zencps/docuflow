# Technical Specification: DocuFlow (Documentation & SOP Builder)

**Author:** Zen  
**Project Type:** Interactive Markdown Previewer & SOP Authoring Tool  
**Version:** 1.0.0  
**Status:** Specification & Design (SDLC Phase 1–3)  

---

## 1. Project Overview

### 1.1 Purpose
**DocuFlow** is a lightweight, client-side Markdown editor and live previewer engineered specifically for creating Standard Operating Procedures (SOPs), client onboarding guides, and technical documentation. It provides real-time HTML rendering alongside live document telemetry (word count, character count, and estimated reading time) and pre-configured operational templates.

### 1.2 Target Audience & Use Cases
* **Operations & Virtual Assistants:** Drafting standardized step-by-step workflows, client handoff guides, and escalation procedures.
* **Software Developers & QA Engineers:** Authoring technical READMEs, API guides, and bug reproduction steps.
* **Students & Technical Writers:** Producing clean, structured documentation that can be exported directly to Markdown (`.md`) or clean HTML.

---

## 2. Phase 1: Requirements Analysis

### 2.1 Functional Requirements (FR)

#### Core Engine & Security
* **FR-01 (Real-Time Parsing):** The system shall listen to user input events inside the Markdown editor pane and render formatted HTML in the preview pane in real time using `Marked.js`.
* **FR-02 (XSS Sanitization):** All parsed HTML output must pass through `DOMPurify.sanitize()` prior to DOM injection to prevent Cross-Site Scripting (XSS) vulnerabilities.

#### Document Telemetry (SOP Metrics)
* **FR-03 (Word & Character Counter):** The status bar shall dynamically calculate and display the total word count (excluding pure Markdown syntax symbols where possible or via clean whitespace splitting) and total character count.
* **FR-04 (Reading Time Estimator):** The status bar shall calculate and display the estimated reading time based on a standard technical reading speed of **200 words per minute (WPM)**, rounded up to the nearest minute.

#### SOP Productivity Features
* **FR-05 (Starter SOP Templates):** Users shall be able to select from a dropdown menu of pre-built templates:
  1. *Standard Operating Procedure (SOP)* (Includes Objective, Prerequisites, Step-by-Step Procedure, Troubleshooting).
  2. *Client Onboarding / Knowledge Base Guide* (Includes Overview, Account Setup, FAQ, Support Contacts).
  3. *Technical Bug Report / Runbook* (Includes Environment, Steps to Reproduce, Expected vs. Actual Output).
* **FR-06 (Quick-Insert Formatting Toolbar):** A top toolbar shall allow single-click insertion of common SOP Markdown patterns at the current cursor position: Headings (`H1`–`H3`), Bold, Italic, Task Checklists (`- [ ]`), Tables, Callout Blockquotes (`> **Note:**`), and Code Blocks.
* **FR-07 (Local Persistence):** The editor state (current Markdown text and selected theme) shall automatically save to `window.localStorage` on every input change and restore automatically upon page reload.
* **FR-08 (Document Export):** Users shall be able to:
  * Download the raw text as a `.md` file (`sop-document.md`).
  * Copy the rendered, sanitized HTML string directly to the system clipboard.
  * Trigger a clean browser print/PDF view (`window.print()`) that hides the editor UI and prints only the formatted SOP preview.

### 2.2 Non-Functional Requirements (NFR)
* **NFR-01 (Performance):** Keystroke-to-preview rendering latency must remain under 16ms (60fps) for documents up to 5,000 words.
* **NFR-02 (Zero Backend Dependency):** The application must run 100% client-side in any modern web browser without requiring a database or server runtime.
* **NFR-03 (Responsive Layout):** 
  * *Desktop (> 768px):* 50/50 side-by-side split-screen layout with independent scrolling panes.
  * *Mobile/Tablet (<= 768px):* Stacked or tabbed view allowing seamless switching between "Edit" and "Preview" modes.
* **NFR-04 (Accessibility & Themeability):** Support high-contrast Light and Dark themes via CSS custom properties, with semantic HTML5 landmarks and keyboard-accessible toolbar buttons (`aria-label`).

---

## 3. Phase 2: Planning

### 3.1 Technology Stack
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic structure (`<header>`, `<main>`, `<section>`, `<footer>`). |
| **Styling** | Vanilla CSS3 | Custom Properties (variables), CSS Grid/Flexbox, and `@media print` rules for clean PDF exporting. |
| **Scripting** | Vanilla JavaScript (ES6+) | Modular architecture (`type="module"`), native DOM APIs, `Blob` API for file downloads. |
| **Markdown Parser** | `Marked.js` (via CDN) | Lightweight, fast, and supports GitHub Flavored Markdown (GFM) tables and task lists. |
| **Security** | `DOMPurify` (via CDN) | Industry-standard HTML sanitizer to strip malicious scripts or inline event handlers. |

### 3.2 Implementation Roadmap (Sprints)
* **Sprint 1: Layout & Theme Architecture**
  * Build the HTML5 shell, top toolbar, split-pane main container, and bottom telemetry bar.
  * Configure CSS variables for Light/Dark mode and responsive breakpoints.
* **Sprint 2: Core Parsing & Sanitization Pipeline**
  * Connect `Marked.js` and `DOMPurify`.
  * Bind the `input` event listener on `#editor-textarea` to update `#preview-container`.
* **Sprint 3: Telemetry & LocalStorage Engine**
  * Implement the word counter, character counter, and 200 WPM reading-time calculator.
  * Build auto-save and state hydration using `localStorage`.
* **Sprint 4: SOP Templates, Toolbar & Export Actions**
  * Create the template dictionary (`templates.js`).
  * Program cursor-aware syntax insertion for the toolbar buttons.
  * Add `.md` file download, Copy HTML, and `@media print` stylesheet rules.

---

## 4. Phase 3: System Design

### 4.1 UI Wireframe (Desktop Split-Screen)

```text
+-----------------------------------------------------------------------------------+
| [DocuFlow]  | [H1][H2][H3] [B] [I] [List] [Table] [Callout] [Code] | [Tmpl] [Export]|
+-----------------------------------------+-----------------------------------------+
| EDITOR (Markdown Input)                 | LIVE PREVIEW (Rendered SOP)             |
| --------------------------------------- | --------------------------------------- |
| # SOP-01: Daily Order Reconciliation    | SOP-01: Daily Order Reconciliation      |
|                                         | ==================================      |
| > **Objective:** Standardize daily...   | | Objective: Standardize daily...       |
|                                         |                                         |
| ## 1. Prerequisites                     | 1. Prerequisites                        |
| - [x] Admin portal access               | [x] Admin portal access                 |
| - [ ] Daily CSV export downloaded       | [ ] Daily CSV export downloaded         |
|                                         |                                         |
+-----------------------------------------+-----------------------------------------+
| Words: 248  |  Characters: 1,540  |  Est. Read Time: ~2 min        [Status: Saved]|
+-----------------------------------------------------------------------------------+
```
