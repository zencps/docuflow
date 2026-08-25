/**
 * Escapes HTML characters for safe template interpolation.
 * 
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Derives a sanitized kebab-case filename from the document's first H1 title,
 * falling back to 'sop-document.<ext>' if no title is present.
 * 
 * @param {string} markdownText 
 * @param {string} [extension='md']
 * @returns {string} Sanitized filename
 */
export function deriveFilename(markdownText, extension = 'md') {
  let ext = extension.startsWith('.') ? extension.slice(1) : extension;
  // Ensure CSV never defaults or falls back to an .xls extension
  if (ext.toLowerCase() === 'xls' || ext.toLowerCase() === 'xlsx') {
    ext = 'csv';
  }
  if (!markdownText) return `sop-document.${ext}`;

  const match = markdownText.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    const slug = match[1]
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (slug) {
      return `${slug}.${ext}`;
    }
  }

  return `sop-document.${ext}`;
}

/**
 * Shared utility to trigger a browser download for a Blob of arbitrary MIME type.
 * 
 * @param {BlobPart} content 
 * @param {string} mimeType 
 * @param {string} filename 
 */
export function downloadBlob(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(downloadUrl);
}

/**
 * Displays temporary success feedback on a trigger button.
 * 
 * @param {HTMLElement} [button] 
 * @param {string} message 
 */
function showFeedback(button, message) {
  if (!button) return;
  const label = button.querySelector('.btn-text');
  if (label) {
    const originalText = label.textContent;
    label.textContent = message;
    button.style.borderColor = 'var(--accent-success)';
    setTimeout(() => {
      label.textContent = originalText;
      button.style.borderColor = '';
    }, 1800);
  }
}

/**
 * Exports raw Markdown (.md) file.
 * 
 * @param {string} markdownText 
 * @param {HTMLElement} [button] 
 */
export function exportMarkdown(markdownText, button) {
  const content = markdownText || '';
  const filename = deriveFilename(content, 'md');
  downloadBlob(content, 'text/markdown;charset=utf-8', filename);
  showFeedback(button, 'Saved .MD!');
}

export function downloadMarkdownFile(textarea, button) {
  const text = textarea ? textarea.value : '';
  exportMarkdown(text, button);
}

/**
 * Exports standalone, styled HTML document (.html).
 * 
 * @param {string} markdownText 
 * @param {HTMLElement} [previewContainer] 
 * @param {HTMLElement} [button] 
 */
export function exportHtml(markdownText, previewContainer, button) {
  const text = markdownText || '';
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'DocuFlow Document';
  const filename = deriveFilename(text, 'html');

  let bodyHtml = '';
  if (previewContainer) {
    const clone = previewContainer.cloneNode(true);
    const placeholder = clone.querySelector('.preview-placeholder');
    if (placeholder) placeholder.remove();
    bodyHtml = clone.innerHTML.trim();
  } else if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
    bodyHtml = DOMPurify.sanitize(marked.parse(text));
  } else {
    bodyHtml = escapeHtml(text);
  }

  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #FFFFFF;
      --text: #0F172A;
      --text-secondary: #334155;
      --border: #CBD5E1;
      --accent: #2563EB;
      --code-bg: #F1F5F9;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0F172A;
        --text: #F8FAFC;
        --text-secondary: #CBD5E1;
        --border: #334155;
        --accent: #38BDF8;
        --code-bg: #1E293B;
      }
    }
    body {
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text);
      background-color: var(--bg);
    }
    h1, h2, h3, h4 { color: var(--text); font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2rem; border-bottom: 2px solid var(--border); padding-bottom: 8px; }
    h2 { font-size: 1.4rem; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
    h3 { font-size: 1.15rem; }
    p { margin: 0.8em 0; }
    blockquote { border-left: 4px solid var(--accent); padding: 8px 16px; margin: 16px 0; background: var(--code-bg); border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
    th { background: var(--code-bg); font-weight: 600; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: var(--code-bg); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: var(--code-bg); padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { padding: 0; background: transparent; }
    ul.task-list { list-style: none; padding-left: 0; }
    li.task-list-item { list-style: none; display: flex; align-items: center; gap: 8px; margin: 4px 0; }
    @media print {
      body { max-width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
  <article class="docuflow-document">
    ${bodyHtml}
  </article>
</body>
</html>`;

  downloadBlob(standaloneHtml, 'text/html;charset=utf-8', filename);
  showFeedback(button, 'Saved .HTML!');
}

/**
 * Converts Markdown structure to a valid Rich Text Format (.rtf) string.
 * 
 * @param {string} markdownText 
 * @returns {string} RTF document string
 */
export function convertMarkdownToRtf(markdownText) {
  const lines = (markdownText || '').split(/\r?\n/);
  let rtfBody = '';

  const escapeRtf = (str) => {
    return (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/[^\x00-\x7F]/g, c => `\\u${c.charCodeAt(0)}?`);
  };

  const formatInline = (str) => {
    let s = escapeRtf(str);
    s = s.replace(/\*\*(.*?)\*\*/g, '{\\b $1}');
    s = s.replace(/\*(.*?)\*/g, '{\\i $1}');
    s = s.replace(/`([^`]+)`/g, '{\\f1 $1}');
    return s;
  };

  for (let line of lines) {
    if (/^#\s+(.+)$/.test(line)) {
      const text = line.replace(/^#\s+/, '');
      rtfBody += `{\\fs36\\b\\cf2 ${formatInline(text)}\\cf1\\b0}\\par\\par\n`;
    } else if (/^##\s+(.+)$/.test(line)) {
      const text = line.replace(/^##\s+/, '');
      rtfBody += `{\\fs28\\b\\cf2 ${formatInline(text)}\\cf1\\b0}\\par\\par\n`;
    } else if (/^###\s+(.+)$/.test(line)) {
      const text = line.replace(/^###\s+/, '');
      rtfBody += `{\\fs24\\b ${formatInline(text)}\\b0}\\par\\par\n`;
    } else if (/^>\s*(.+)$/.test(line)) {
      const text = line.replace(/^>\s*/, '');
      rtfBody += `{\\li720\\i\\cf3 ${formatInline(text)}\\cf1\\i0}\\par\\par\n`;
    } else if (/^[-*]\s+\[([ xX])\]\s*(.+)$/.test(line)) {
      const match = line.match(/^[-*]\s+\[([ xX])\]\s*(.+)$/);
      const isChecked = match[1].toLowerCase() === 'x';
      const mark = isChecked ? '[X]' : '[  ]';
      rtfBody += `{\\f1 ${mark}} ${formatInline(match[2])}\\par\n`;
    } else if (/^[-*]\s+(.+)$/.test(line)) {
      const text = line.replace(/^[-*]\s+/, '');
      rtfBody += `\\bullet  ${formatInline(text)}\\par\n`;
    } else if (/^\d+\.\s+(.+)$/.test(line)) {
      const match = line.match(/^(\d+\.)\s+(.+)$/);
      rtfBody += `{\\b ${match[1]}} ${formatInline(match[2])}\\par\n`;
    } else if (/^---+$/.test(line.trim())) {
      rtfBody += `{\\strike--------------------------------------------------}\\par\\par\n`;
    } else if (/^\|(.+)\|$/.test(line.trim())) {
      if (/^\|[\s:\-|]+\|$/.test(line.trim())) continue;
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      const rowText = cells.map(c => formatInline(c)).join('   |   ');
      rtfBody += `{\\f1 ${rowText}}\\par\n`;
    } else if (line.trim() === '') {
      rtfBody += `\\par\n`;
    } else {
      rtfBody += `${formatInline(line)}\\par\n`;
    }
  }

  const rtfHeader = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat
{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}{\\f1\\fnil\\fcharset0 Consolas;}}
{\\colortbl ;\\red15\\green23\\blue42;\\red37\\green99\\blue235;\\red71\\green85\\blue105;}
\\viewkind4\\uc1\\pard\\cf1\\f0\\fs22\\sl280\\slmult1
`;

  return rtfHeader + rtfBody + '}';
}

/**
 * Exports document as Rich Text Format (.rtf).
 * 
 * @param {string} markdownText 
 * @param {HTMLElement} [button] 
 */
export function exportRtf(markdownText, button) {
  const rtfContent = convertMarkdownToRtf(markdownText);
  const filename = deriveFilename(markdownText, 'rtf');
  downloadBlob(rtfContent, 'application/rtf;charset=utf-8', filename);
  showFeedback(button, 'Saved .RTF!');
}

/**
 * Parses Markdown document into structured JSON representation.
 * 
 * @param {string} markdownText 
 * @returns {Object} Structured AST document object
 */
export function parseMarkdownToJson(markdownText) {
  const text = markdownText || '';
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'DocuFlow Document';
  const slug = deriveFilename(text, 'json').replace(/\.json$/, '');

  const sections = [];
  const lines = text.split(/\r?\n/);
  let currentSection = { level: 1, title: title, content: [] };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection.content.length > 0 || currentSection.title !== title) {
        sections.push({
          level: currentSection.level,
          title: currentSection.title,
          content: currentSection.content.join('\n').trim()
        });
      }
      currentSection = {
        level: headingMatch[1].length,
        title: headingMatch[2].trim(),
        content: []
      };
    } else {
      currentSection.content.push(line);
    }
  }
  if (currentSection.content.length > 0 || currentSection.title !== title) {
    sections.push({
      level: currentSection.level,
      title: currentSection.title,
      content: currentSection.content.join('\n').trim()
    });
  }

  const tasks = [];
  const taskRegex = /^[-*]\s+\[([ xX])\]\s*(.+)$/gm;
  let taskMatch;
  while ((taskMatch = taskRegex.exec(text)) !== null) {
    tasks.push({
      item: taskMatch[2].trim(),
      completed: taskMatch[1].toLowerCase() === 'x'
    });
  }

  const tables = [];
  let currentTable = [];
  for (const l of lines) {
    const trimmed = l.trim();
    if (/^\|.*\|$/.test(trimmed)) {
      if (!/^\|[\s:\-|]+\|$/.test(trimmed)) {
        const cells = trimmed.slice(1, -1).split('|').map(c => c.trim().replace(/\*\*/g, ''));
        currentTable.push(cells);
      }
    } else {
      if (currentTable.length > 0) {
        if (currentTable.length >= 2) {
          tables.push({
            headers: currentTable[0],
            rows: currentTable.slice(1)
          });
        }
        currentTable = [];
      }
    }
  }
  if (currentTable.length >= 2) {
    tables.push({
      headers: currentTable[0],
      rows: currentTable.slice(1)
    });
  }

  const cleanWords = text.replace(/[#*`_~>\-+|]/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  return {
    metadata: {
      title,
      slug,
      exportedAt: new Date().toISOString(),
      generator: 'DocuFlow SOP Engine v1.0.0',
      telemetry: {
        wordCount: cleanWords,
        charCount: text.length,
        estimatedReadingMinutes: Math.ceil(cleanWords / 200) || 1
      }
    },
    sections,
    tasks,
    tables,
    rawMarkdown: text
  };
}

/**
 * Exports document as structured JSON (.json).
 * 
 * @param {string} markdownText 
 * @param {HTMLElement} [button] 
 */
export function exportJson(markdownText, button) {
  const jsonObj = parseMarkdownToJson(markdownText);
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  const filename = deriveFilename(markdownText, 'json');
  downloadBlob(jsonStr, 'application/json;charset=utf-8', filename);
  showFeedback(button, 'Saved .JSON!');
}

/**
 * Converts Markdown tables and operational checklists to RFC 4180 CSV string with Excel UTF-8 BOM.
 * 
 * @param {string} markdownText 
 * @returns {string} CSV spreadsheet string
 */
export function convertMarkdownToCsv(markdownText) {
  const text = markdownText || '';
  const lines = text.split(/\r?\n/);

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const tables = [];
  let currentTable = [];
  for (const l of lines) {
    const trimmed = l.trim();
    if (/^\|.*\|$/.test(trimmed)) {
      if (!/^\|[\s:\-|]+\|$/.test(trimmed)) {
        const cells = trimmed.slice(1, -1).split('|').map(c => c.trim().replace(/\*\*/g, ''));
        currentTable.push(cells);
      }
    } else {
      if (currentTable.length > 0) {
        tables.push(currentTable);
        currentTable = [];
      }
    }
  }
  if (currentTable.length > 0) tables.push(currentTable);

  const taskRows = [];
  let currentSection = 'General';
  for (let l of lines) {
    const heading = l.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      currentSection = heading[1].trim();
    }
    const task = l.match(/^[-*]\s+\[([ xX])\]\s*(.+)$/);
    if (task) {
      taskRows.push([
        currentSection,
        'Checklist',
        task[2].trim().replace(/\*\*/g, ''),
        task[1].toLowerCase() === 'x' ? 'Completed' : 'Pending'
      ]);
    }
  }

  let csvContent = '\uFEFF'; 

  if (tables.length > 0) {
    tables.forEach((tbl, idx) => {
      if (idx > 0) csvContent += '\r\n\r\n';
      tbl.forEach(row => {
        csvContent += row.map(escapeCsv).join(',') + '\r\n';
      });
    });

    if (taskRows.length > 0) {
      csvContent += '\r\n\r\n"--- CHECKLIST & AUDIT ITEMS ---",,,\r\n';
      csvContent += ['Section', 'Type', 'Item / Action', 'Status'].map(escapeCsv).join(',') + '\r\n';
      taskRows.forEach(row => {
        csvContent += row.map(escapeCsv).join(',') + '\r\n';
      });
    }
  } else if (taskRows.length > 0) {
    csvContent += ['Section', 'Type', 'Item / Action', 'Status'].map(escapeCsv).join(',') + '\r\n';
    taskRows.forEach(row => {
      csvContent += row.map(escapeCsv).join(',') + '\r\n';
    });
  } else {
    csvContent += ['Heading Level', 'Section Title', 'Content'].map(escapeCsv).join(',') + '\r\n';
    const sections = [];
    let cur = { level: 'Title', title: 'Document', content: [] };
    for (let l of lines) {
      const h = l.match(/^(#{1,6})\s+(.+)$/);
      if (h) {
        if (cur.content.length > 0 || cur.title !== 'Document') {
          sections.push([cur.level, cur.title, cur.content.join(' ').trim()]);
        }
        cur = { level: `H${h[1].length}`, title: h[2].trim(), content: [] };
      } else {
        if (l.trim()) cur.content.push(l.trim());
      }
    }
    if (cur.content.length > 0 || cur.title !== 'Document') {
      sections.push([cur.level, cur.title, cur.content.join(' ').trim()]);
    }
    sections.forEach(s => {
      csvContent += s.map(escapeCsv).join(',') + '\r\n';
    });
  }

  return csvContent;
}

/**
 * Exports document as spreadsheet / audit CSV (.csv).
 * Explicitly sets MIME type to text/csv;charset=utf-8; and ensures .csv file extension.
 * 
 * @param {string} markdownText 
 * @param {HTMLElement} [button] 
 */
export function exportCsv(markdownText, button) {
  const csvContent = convertMarkdownToCsv(markdownText);
  let filename = deriveFilename(markdownText, 'csv');
  // Explicitly ensure filename ends with .csv and never falls back to .xls
  if (!filename.toLowerCase().endsWith('.csv')) {
    filename = `${filename.replace(/\.[^/.]+$/, '')}.csv`;
  }
  downloadBlob(csvContent, 'text/csv;charset=utf-8;', filename);
  showFeedback(button, 'Saved .CSV!');
}

/**
 * Copies the rendered, sanitized HTML string directly to the clipboard.
 * 
 * @param {HTMLElement} previewContainer 
 * @param {HTMLElement} [button] 
 */
export async function copyRenderedHtml(previewContainer, button) {
  if (!previewContainer) return;

  const clone = previewContainer.cloneNode(true);
  const placeholder = clone.querySelector('.preview-placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  const htmlContent = clone.innerHTML.trim();
  if (!htmlContent) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(htmlContent);
    } else {
      const dummy = document.createElement('textarea');
      dummy.value = htmlContent;
      dummy.style.position = 'fixed';
      dummy.style.opacity = '0';
      document.body.appendChild(dummy);
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
    }

    showFeedback(button, 'Copied!');
  } catch (error) {
    console.error('Failed to copy HTML to clipboard:', error);
  }
}

export function printDocument() {
  window.print();
}

/**
 * Binds multi-format export dropdown and toolbar actions.
 * 
 * @param {Object} options
 * @param {HTMLTextAreaElement} options.editorTextarea
 * @param {HTMLElement} options.previewContainer
 */
export function setupExportActions({ editorTextarea, previewContainer }) {
  const exportDropdownBtn = document.getElementById('btn-export-dropdown');
  const exportMenu = document.getElementById('export-dropdown-menu');
  const copyHtmlBtn = document.getElementById('btn-copy-html');
  const printBtn = document.getElementById('btn-print-doc');

  if (exportDropdownBtn && exportMenu) {
    exportDropdownBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isExpanded = exportDropdownBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        exportMenu.setAttribute('hidden', '');
        exportDropdownBtn.setAttribute('aria-expanded', 'false');
      } else {
        exportMenu.removeAttribute('hidden');
        exportDropdownBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (event) => {
      if (!exportDropdownBtn.contains(event.target) && !exportMenu.contains(event.target)) {
        exportMenu.setAttribute('hidden', '');
        exportDropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !exportMenu.hasAttribute('hidden')) {
        exportMenu.setAttribute('hidden', '');
        exportDropdownBtn.setAttribute('aria-expanded', 'false');
        exportDropdownBtn.focus();
      }
    });

    const menuItems = exportMenu.querySelectorAll('.export-menu-item');
    menuItems.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        const format = item.dataset.format;
        const text = editorTextarea ? editorTextarea.value : '';

        switch (format) {
          case 'md':
            exportMarkdown(text, exportDropdownBtn);
            break;
          case 'html':
            exportHtml(text, previewContainer, exportDropdownBtn);
            break;
          case 'rtf':
            exportRtf(text, exportDropdownBtn);
            break;
          case 'json':
            exportJson(text, exportDropdownBtn);
            break;
          case 'csv':
            exportCsv(text, exportDropdownBtn);
            break;
          default:
            exportMarkdown(text, exportDropdownBtn);
            break;
        }

        exportMenu.setAttribute('hidden', '');
        exportDropdownBtn.setAttribute('aria-expanded', 'false');
        exportDropdownBtn.focus();
      });
    });
  }

  if (copyHtmlBtn) {
    copyHtmlBtn.addEventListener('click', () => {
      copyRenderedHtml(previewContainer, copyHtmlBtn);
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      printDocument();
    });
  }
}
