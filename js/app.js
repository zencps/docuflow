import { updateTelemetry } from './telemetry.js';
import { templates, getTemplate } from './templates.js';
import { setupToolbar } from './toolbar.js';
import { setupExportActions } from './storage-export.js';

const STORAGE_KEYS = {
  CONTENT: 'docuflow_content',
  THEME: 'docuflow_theme',
  BANNER_DISMISSED: 'docuflow_banner_dismissed'
};

const elements = {
  editorTextarea: document.getElementById('editor-textarea'),
  previewContainer: document.getElementById('preview-container'),
  previewScrollViewport: document.getElementById('preview-scroll-viewport'),
  templateSelect: document.getElementById('template-select'),
  themeToggleBtn: document.getElementById('btn-theme-toggle'),
  clearEditorBtn: document.getElementById('btn-clear-editor'),
  scrollTopBtn: document.getElementById('btn-scroll-top'),
  saveStatusText: document.getElementById('save-status-text'),
  saveStatusDot: document.getElementById('save-status-dot'),
  tabEditor: document.getElementById('tab-editor'),
  tabPreview: document.getElementById('tab-preview'),
  editorPane: document.getElementById('editor-pane'),
  previewPane: document.getElementById('preview-pane'),
  modalTemplateConfirm: document.getElementById('modal-template-confirm'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  btnModalProceed: document.getElementById('btn-modal-proceed'),
  infoBanner: document.getElementById('info-banner'),
  btnDismissBanner: document.getElementById('btn-dismiss-banner')
};

let saveStatusTimer = null;

function configureMarkdownParser() {
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }
}

/**
 * Renders raw Markdown text into sanitized HTML inside the preview container.
 * Enforces XSS prevention via DOMPurify while preserving task-list checkboxes.
 * 
 * @param {string} markdownText - Raw markdown input
 */
export function renderPreview(markdownText) {
  if (!elements.previewContainer) return;

  if (!markdownText || !markdownText.trim()) {
    elements.previewContainer.innerHTML = `
      <div class="preview-placeholder">
        <div class="placeholder-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <h3 class="placeholder-title">Standard Operating Procedure Preview</h3>
        <p class="placeholder-desc">Start typing in the Markdown editor or select a starter template from the toolbar to generate formatted documentation in real time.</p>
      </div>
    `;
    return;
  }

  let rawHtml = '';
  if (typeof marked !== 'undefined') {
    rawHtml = marked.parse(markdownText);
  } else {
    rawHtml = markdownText;
  }

  let cleanHtml = rawHtml;
  if (typeof DOMPurify !== 'undefined') {
    cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['input'],
      ADD_ATTR: ['type', 'checked', 'disabled']
    });
  }

  elements.previewContainer.innerHTML = cleanHtml;

  const taskInputs = elements.previewContainer.querySelectorAll('li > input[type="checkbox"]');
  taskInputs.forEach(input => {
    const li = input.closest('li');
    if (li) {
      li.classList.add('task-list-item');
      const ul = li.closest('ul');
      if (ul) ul.classList.add('contains-task-list');
    }
  });

  const tables = elements.previewContainer.querySelectorAll('table');
  tables.forEach(table => {
    if (!table.parentElement.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

/**
 * Updates the auto-save indicator state in the status bar.
 * 
 * @param {'saving' | 'saved' | 'ready'} state 
 */
function updateSaveStatus(state) {
  if (!elements.saveStatusText || !elements.saveStatusDot) return;

  if (state === 'saving') {
    elements.saveStatusText.textContent = 'Saving...';
    elements.saveStatusDot.style.backgroundColor = 'var(--text-muted)';
    elements.saveStatusDot.style.boxShadow = 'none';
  } else if (state === 'saved') {
    elements.saveStatusText.textContent = 'Saved to Storage';
    elements.saveStatusDot.style.backgroundColor = 'var(--accent-success)';
    elements.saveStatusDot.style.boxShadow = '0 0 0 2px rgba(5, 150, 105, 0.2)';
  } else {
    elements.saveStatusText.textContent = 'Draft Ready';
    elements.saveStatusDot.style.backgroundColor = 'var(--accent-success)';
    elements.saveStatusDot.style.boxShadow = '0 0 0 2px rgba(5, 150, 105, 0.2)';
  }
}

export function handleEditorInput() {
  const content = elements.editorTextarea ? elements.editorTextarea.value : '';

  renderPreview(content);

  updateTelemetry(content);

  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT, content);
    updateSaveStatus('saving');

    clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => {
      updateSaveStatus('saved');
    }, 250);
  } catch (error) {
    console.warn('LocalStorage save failed:', error);
  }
}

function updateThemeToggleAria(theme) {
  if (!elements.themeToggleBtn) return;
  const label = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  elements.themeToggleBtn.setAttribute('aria-label', label);
  elements.themeToggleBtn.setAttribute('title', label);
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  let initialTheme = 'light';
  if (savedTheme === 'dark' || savedTheme === 'light') {
    initialTheme = savedTheme;
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    initialTheme = prefersDark ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeToggleAria(initialTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  updateThemeToggleAria(nextTheme);

  try {
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
  } catch (error) {
    console.warn('LocalStorage theme save failed:', error);
  }
}

let currentAppliedTemplate = '';

let pendingTemplateKey = null;

/**
 * Opens custom HTML/CSS template switch confirmation modal.
 * 
 * @param {string} templateKey 
 */
function openTemplateConfirmModal(templateKey) {
  pendingTemplateKey = templateKey;
  if (!elements.modalTemplateConfirm) return;
  elements.modalTemplateConfirm.removeAttribute('hidden');
  elements.modalTemplateConfirm.setAttribute('aria-hidden', 'false');
  if (elements.btnModalProceed) {
    elements.btnModalProceed.focus();
  }
}

function closeTemplateConfirmModal() {
  pendingTemplateKey = null;
  if (!elements.modalTemplateConfirm) return;
  elements.modalTemplateConfirm.setAttribute('hidden', '');
  elements.modalTemplateConfirm.setAttribute('aria-hidden', 'true');
  if (elements.templateSelect) {
    elements.templateSelect.value = currentAppliedTemplate;
  }
  if (elements.editorTextarea) {
    elements.editorTextarea.focus();
  }
}

/**
 * Loads template content into editor textarea and updates state.
 * 
 * @param {string} templateKey 
 */
function applyTemplate(templateKey) {
  const templateContent = getTemplate(templateKey);
  if (typeof templateContent === 'string' && elements.editorTextarea) {
    elements.editorTextarea.value = templateContent;
    handleEditorInput();
    elements.editorTextarea.focus();
  }
  currentAppliedTemplate = templateKey;
  if (elements.templateSelect) {
    elements.templateSelect.value = templateKey;
  }
}

function setupTemplateSelector() {
  if (!elements.templateSelect) return;

  elements.templateSelect.addEventListener('change', (event) => {
    const selectedKey = event.target.value;
    if (!selectedKey) return;

    const templateContent = getTemplate(selectedKey);
    const currentText = elements.editorTextarea ? elements.editorTextarea.value.trim() : '';

    if (currentText.length > 0 && currentText !== templateContent.trim()) {
      openTemplateConfirmModal(selectedKey);
    } else {
      applyTemplate(selectedKey);
    }
  });

  if (elements.btnModalCancel) {
    elements.btnModalCancel.addEventListener('click', () => {
      closeTemplateConfirmModal();
    });
  }

  if (elements.btnModalProceed) {
    elements.btnModalProceed.addEventListener('click', () => {
      const nextKey = pendingTemplateKey;
      closeTemplateConfirmModal();
      if (nextKey) {
        applyTemplate(nextKey);
      }
    });
  }

  if (elements.modalTemplateConfirm) {
    elements.modalTemplateConfirm.addEventListener('click', (event) => {
      if (event.target === elements.modalTemplateConfirm) {
        closeTemplateConfirmModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && elements.modalTemplateConfirm && !elements.modalTemplateConfirm.hasAttribute('hidden')) {
        closeTemplateConfirmModal();
      }
    });
  }
}

function setupMobileTabs() {
  if (!elements.tabEditor || !elements.tabPreview) return;

  elements.tabEditor.addEventListener('click', () => {
    elements.tabEditor.classList.add('active');
    elements.tabEditor.setAttribute('aria-selected', 'true');
    elements.tabPreview.classList.remove('active');
    elements.tabPreview.setAttribute('aria-selected', 'false');

    if (elements.editorPane) elements.editorPane.classList.add('is-active');
    if (elements.previewPane) elements.previewPane.classList.remove('is-active');
  });

  elements.tabPreview.addEventListener('click', () => {
    elements.tabPreview.classList.add('active');
    elements.tabPreview.setAttribute('aria-selected', 'true');
    elements.tabEditor.classList.remove('active');
    elements.tabEditor.setAttribute('aria-selected', 'false');

    if (elements.previewPane) elements.previewPane.classList.add('is-active');
    if (elements.editorPane) elements.editorPane.classList.remove('is-active');
  });
}

function bindEventListeners() {
  if (elements.editorTextarea) {
    elements.editorTextarea.addEventListener('input', handleEditorInput);
  }

  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
  }

  if (elements.clearEditorBtn) {
    elements.clearEditorBtn.addEventListener('click', () => {
      if (elements.editorTextarea) {
        elements.editorTextarea.value = '';
        handleEditorInput();
        elements.editorTextarea.focus();
        currentAppliedTemplate = 'blank-sop';
        if (elements.templateSelect) {
          elements.templateSelect.value = 'blank-sop';
        }
      }
    });
  }

  if (elements.scrollTopBtn && elements.previewScrollViewport) {
    elements.scrollTopBtn.addEventListener('click', () => {
      elements.previewScrollViewport.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  setupToolbar(elements.editorTextarea, handleEditorInput);

  setupTemplateSelector();

  setupExportActions({
    editorTextarea: elements.editorTextarea,
    previewContainer: elements.previewContainer
  });

  setupMobileTabs();

  const brandLink = document.querySelector('.brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', (event) => {
      const isRoot = window.location.pathname === '/' || window.location.pathname.endsWith('/');
      if (isRoot) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

function cleanBrowserUrl() {
  try {
    const { pathname, search, hash } = window.location;
    if (pathname.endsWith('/index.html')) {
      const cleanPath = pathname.slice(0, -10) || '/';
      window.history.replaceState(null, '', cleanPath + search + hash);
    }
  } catch (error) {
    console.debug('URL normalization skipped:', error);
  }
}

function setupBanner() {
  const banner = elements.infoBanner;
  const dismissBtn = elements.btnDismissBanner;
  if (!banner || !dismissBtn) return;

  try {
    const isDismissed = localStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED);
    if (isDismissed === 'true') {
      banner.setAttribute('hidden', '');
    } else {
      banner.removeAttribute('hidden');
    }
  } catch (error) {
    console.warn('LocalStorage error reading banner state:', error);
  }

  dismissBtn.addEventListener('click', () => {
    banner.setAttribute('hidden', '');
    try {
      localStorage.setItem(STORAGE_KEYS.BANNER_DISMISSED, 'true');
    } catch (error) {
      console.warn('LocalStorage error saving banner state:', error);
    }
  });
}

function init() {
  cleanBrowserUrl();
  configureMarkdownParser();
  initTheme();
  setupBanner();
  bindEventListeners();

  let initialContent = '';
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTENT);
    initialContent = saved !== null ? saved : '';
  } catch (error) {
    console.warn('LocalStorage read error:', error);
    initialContent = '';
  }

  if (elements.editorTextarea) {
    elements.editorTextarea.value = initialContent;
  }

  if (elements.templateSelect) {
    if (initialContent === '') {
      currentAppliedTemplate = '';
      elements.templateSelect.value = '';
    } else if (initialContent === templates.sop) {
      currentAppliedTemplate = 'sop';
      elements.templateSelect.value = 'sop';
    } else if (initialContent === templates.onboarding) {
      currentAppliedTemplate = 'onboarding';
      elements.templateSelect.value = 'onboarding';
    } else if (initialContent === templates.runbook) {
      currentAppliedTemplate = 'runbook';
      elements.templateSelect.value = 'runbook';
    } else {
      currentAppliedTemplate = '';
      elements.templateSelect.value = '';
    }
  }

  renderPreview(initialContent);
  updateTelemetry(initialContent);
  updateSaveStatus('ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
