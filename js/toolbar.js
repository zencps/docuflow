/**
 * Computes smart markdown replacement and cursor coordinates for formatting actions.
 * 
 * @param {string} text - Full textarea content
 * @param {number} start - Current selection start index
 * @param {number} end - Current selection end index
 * @param {string} action - Formatting action type (bold, italic, code, etc.)
 * @returns {{ replacement: string, targetStart: number, targetEnd: number, cursorStart: number, cursorEnd: number }}
 */
function computeSmartReplacement(text, start, end, action) {
  const selected = text.substring(start, end);
  let replacement = '';
  let targetStart = start;
  let targetEnd = end;
  let cursorStart = start;
  let cursorEnd = end;

  const beforeCursor = text.substring(0, start);
  const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
  const leadingNewline = needsNewlineBefore ? '\n\n' : '';

  switch (action) {
    case 'bold': {
      if (selected.length > 0) {
        if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
          replacement = selected.slice(2, -2);
          cursorStart = start;
          cursorEnd = start + replacement.length;
        }
        else if (start >= 2 && end + 2 <= text.length && text.slice(start - 2, start) === '**' && text.slice(end, end + 2) === '**') {
          replacement = selected;
          targetStart = start - 2;
          targetEnd = end + 2;
          cursorStart = targetStart;
          cursorEnd = targetStart + replacement.length;
        }
        else {
          replacement = `**${selected}**`;
          cursorStart = start + 2;
          cursorEnd = start + 2 + selected.length;
        }
      } else {
        if (start >= 2 && end + 2 <= text.length && text.slice(start - 2, start) === '**' && text.slice(start, start + 2) === '**') {
          replacement = '';
          targetStart = start - 2;
          targetEnd = start + 2;
          cursorStart = targetStart;
          cursorEnd = targetStart;
        } else {
          replacement = '****';
          cursorStart = start + 2;
          cursorEnd = start + 2;
        }
      }
      break;
    }

    case 'italic': {
      if (selected.length > 0) {
        if (selected.startsWith('*') && selected.endsWith('*') && !selected.startsWith('**') && selected.length >= 2) {
          replacement = selected.slice(1, -1);
          cursorStart = start;
          cursorEnd = start + replacement.length;
        }
        else if (start >= 1 && end + 1 <= text.length && text[start - 1] === '*' && text[end] === '*' && text[start - 2] !== '*' && text[end + 1] !== '*') {
          replacement = selected;
          targetStart = start - 1;
          targetEnd = end + 1;
          cursorStart = targetStart;
          cursorEnd = targetStart + replacement.length;
        }
        else {
          replacement = `*${selected}*`;
          cursorStart = start + 1;
          cursorEnd = start + 1 + selected.length;
        }
      } else {
        if (start >= 1 && end + 1 <= text.length && text[start - 1] === '*' && text[start] === '*' && text[start - 2] !== '*' && text[start + 1] !== '*') {
          replacement = '';
          targetStart = start - 1;
          targetEnd = start + 1;
          cursorStart = targetStart;
          cursorEnd = targetStart;
        } else {
          replacement = '**';
          cursorStart = start + 1;
          cursorEnd = start + 1;
        }
      }
      break;
    }

    case 'code': {
      if (selected.length > 0) {
        if (selected.startsWith('```') && selected.endsWith('```')) {
          replacement = selected.replace(/^```[a-z0-9_-]*\n?/i, '').replace(/\n?```$/i, '');
          cursorStart = start;
          cursorEnd = start + replacement.length;
        }
        else if (selected.startsWith('`') && selected.endsWith('`') && selected.length >= 2) {
          replacement = selected.slice(1, -1);
          cursorStart = start;
          cursorEnd = start + replacement.length;
        }
        else if (start >= 1 && end + 1 <= text.length && text[start - 1] === '`' && text[end] === '`') {
          replacement = selected;
          targetStart = start - 1;
          targetEnd = end + 1;
          cursorStart = targetStart;
          cursorEnd = targetStart + replacement.length;
        }
        else {
          if (selected.includes('\n')) {
            replacement = `${leadingNewline}\`\`\`bash\n${selected}\n\`\`\`\n`;
            cursorStart = start + leadingNewline.length + 8;
            cursorEnd = cursorStart + selected.length;
          } else {
            replacement = `\`${selected}\``;
            cursorStart = start + 1;
            cursorEnd = cursorStart + selected.length;
          }
        }
      } else {
        replacement = '``';
        cursorStart = start + 1;
        cursorEnd = start + 1;
      }
      break;
    }

    case 'checklist': {
      if (selected.length > 0) {
        const lines = selected.split('\n');
        const allChecklist = lines.every(l => l.trim().length === 0 || /^\s*- \[[ xX]\] /.test(l));
        if (allChecklist) {
          replacement = lines.map(l => l.replace(/^(\s*)- \[[ xX]\] /, '$1')).join('\n');
        } else {
          replacement = lines.map(l => l.trim().length > 0 ? `- [ ] ${l}` : l).join('\n');
        }
        cursorStart = start;
        cursorEnd = start + replacement.length;
      } else {
        replacement = `${leadingNewline}- [ ] `;
        cursorStart = start + replacement.length;
        cursorEnd = cursorStart;
      }
      break;
    }

    case 'callout': {
      if (selected.length > 0) {
        if (selected.startsWith('> **Note:** ')) {
          replacement = selected.replace(/^>\s*\*\*Note:\*\*\s*/gm, '');
        } else if (selected.startsWith('> ')) {
          replacement = selected.replace(/^>\s*/gm, '');
        } else {
          replacement = `${leadingNewline}> **Note:** ${selected}\n`;
        }
        cursorStart = start + leadingNewline.length;
        cursorEnd = start + replacement.length;
      } else {
        replacement = `${leadingNewline}> **Note:** `;
        cursorStart = start + replacement.length;
        cursorEnd = cursorStart;
      }
      break;
    }

    case 'h1':
    case 'h2':
    case 'h3': {
      const hashes = action === 'h1' ? '# ' : action === 'h2' ? '## ' : '### ';
      if (selected.length > 0) {
        if (selected.startsWith(hashes)) {
          replacement = selected.slice(hashes.length);
        } else if (/^#{1,6}\s+/.test(selected)) {
          replacement = hashes + selected.replace(/^#{1,6}\s+/, '');
        } else {
          replacement = `${leadingNewline}${hashes}${selected}\n`;
        }
        cursorStart = start + leadingNewline.length;
        cursorEnd = start + replacement.length;
      } else {
        replacement = `${leadingNewline}${hashes}`;
        cursorStart = start + replacement.length;
        cursorEnd = cursorStart;
      }
      break;
    }

    case 'table': {
      replacement = `${leadingNewline}| Step | Operational Task | Owner | Status |
| :--- | :--- | :--- | :--- |
| 01 | Define procedure objective | Author | Completed |
| 02 | Execute operational checks | SRE Lead | Pending |
`;
      cursorStart = start + replacement.length;
      cursorEnd = cursorStart;
      break;
    }

    default:
      return null;
  }

  return { replacement, targetStart, targetEnd, cursorStart, cursorEnd };
}

/**
 * Inserts markdown syntax with smart toggle behavior, cursor centering on empty selection,
 * native browser undo/redo history preservation, and immediate live telemetry sync.
 * 
 * @param {HTMLTextAreaElement} textarea - Target editor textarea
 * @param {string} action - Toolbar action type
 * @param {Function} [onUpdate] - Optional callback after content change
 */
export function insertMarkdownSyntax(textarea, action, onUpdate) {
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  const plan = computeSmartReplacement(text, start, end, action);
  if (!plan) return;

  const { replacement, targetStart, targetEnd, cursorStart, cursorEnd } = plan;

  textarea.focus();
  textarea.setSelectionRange(targetStart, targetEnd);

  let executed = false;
  try {
    executed = document.execCommand('insertText', false, replacement);
  } catch (error) {
    executed = false;
  }

  if (!executed) {
    if (typeof textarea.setRangeText === 'function') {
      textarea.setRangeText(replacement, targetStart, targetEnd, 'select');
    } else {
      textarea.value = text.substring(0, targetStart) + replacement + text.substring(targetEnd);
    }
  }

  textarea.setSelectionRange(cursorStart, cursorEnd);

  textarea.dispatchEvent(new Event('input', { bubbles: true }));

  if (typeof onUpdate === 'function') {
    onUpdate(textarea.value);
  }
}

export class HistoryManager {
  constructor(textarea, maxHistory = 100) {
    this.textarea = textarea;
    this.maxHistory = maxHistory;
    this.undoStack = [];
    this.redoStack = [];
    this.timer = null;
    this.isApplying = false;

    if (this.textarea) {
      this.pushSnapshot(this.textarea.value, this.textarea.selectionStart, this.textarea.selectionEnd);

      this.textarea.addEventListener('input', (e) => {
        if (this.isApplying) return;
        clearTimeout(this.timer);
        if (e && (e.data === ' ' || e.data === '\n')) {
          this.pushSnapshot();
        } else {
          this.timer = setTimeout(() => {
            this.pushSnapshot();
          }, 350);
        }
      });
    }
  }

  pushSnapshot(value, start, end) {
    if (!this.textarea) return;
    const val = value !== undefined ? value : this.textarea.value;
    const s = start !== undefined ? start : this.textarea.selectionStart;
    const e = end !== undefined ? end : this.textarea.selectionEnd;

    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1].value === val) {
      return;
    }

    this.undoStack.push({ value: val, selectionStart: s, selectionEnd: e });
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo() {
    if (!this.textarea) return;
    this.textarea.focus();

    const valBefore = this.textarea.value;
    let nativeWorked = false;
    try {
      nativeWorked = document.execCommand('undo');
    } catch (err) {
      nativeWorked = false;
    }

    if (nativeWorked && this.textarea.value !== valBefore) {
      this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    if (this.undoStack.length > 1) {
      this.isApplying = true;
      const current = this.undoStack.pop();
      this.redoStack.push(current);
      const prev = this.undoStack[this.undoStack.length - 1];

      this.textarea.value = prev.value;
      this.textarea.setSelectionRange(prev.selectionStart, prev.selectionEnd);
      this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
      this.isApplying = false;
    }
  }

  redo() {
    if (!this.textarea) return;
    this.textarea.focus();

    const valBefore = this.textarea.value;
    let nativeWorked = false;
    try {
      nativeWorked = document.execCommand('redo');
    } catch (err) {
      nativeWorked = false;
    }

    if (nativeWorked && this.textarea.value !== valBefore) {
      this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    if (this.redoStack.length > 0) {
      this.isApplying = true;
      const next = this.redoStack.pop();
      this.undoStack.push(next);

      this.textarea.value = next.value;
      this.textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
      this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
      this.isApplying = false;
    }
  }
}

/**
 * Initializes toolbar button click listeners.
 * 
 * @param {HTMLTextAreaElement} textarea - Markdown editor element
 * @param {Function} [onUpdate] - Content update callback
 * @returns {HistoryManager} Initialized history manager instance
 */
export function setupToolbar(textarea, onUpdate) {
  if (!textarea) return null;

  const historyManager = new HistoryManager(textarea);

  const toolbarButtons = document.querySelectorAll('.tool-btn[data-action]');
  toolbarButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const action = button.getAttribute('data-action');
      if (action === 'undo') {
        historyManager.undo();
        if (typeof onUpdate === 'function') onUpdate(textarea.value);
      } else if (action === 'redo') {
        historyManager.redo();
        if (typeof onUpdate === 'function') onUpdate(textarea.value);
      } else if (action) {
        historyManager.pushSnapshot();
        insertMarkdownSyntax(textarea, action, onUpdate);
        historyManager.pushSnapshot();
      }
    });
  });

  return historyManager;
}
