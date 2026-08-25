const DEFAULT_WPM = 200;

/**
 * Calculates total words in a Markdown document, stripping pure markup syntax
 * so hashes, bullets, and table delimiters do not inflate metric counts.
 * 
 * @param {string} text - Raw Markdown text
 * @returns {number} Clean word count
 */
export function calculateWordCount(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const cleaned = text
    .replace(/```[\s\S]*?```/g, match => match.replace(/```\w*/g, ''))
    .replace(/^(\s*[-*+]|\s*\d+\.)\s+(\[[ xX]\]\s+)?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[*_~`]/g, ' ')
    .trim();

  if (!cleaned) {
    return 0;
  }

  const words = cleaned.split(/\s+/).filter(word => /[\p{L}\p{N}]/u.test(word));
  return words.length;
}

/**
 * Calculates total character count of the document.
 * 
 * @param {string} text - Raw Markdown text
 * @returns {number} Character count
 */
export function calculateCharacterCount(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return text.length;
}

/**
 * Calculates estimated reading time rounded up to the nearest minute,
 * based on the 200 WPM technical reading standard.
 * 
 * @param {number} wordCount - Total words in document
 * @param {number} [wpm=DEFAULT_WPM] - Words per minute speed
 * @returns {string} Formatted reading time string (e.g., '0 min', '~1 min', '~3 min')
 */
export function calculateReadingTime(wordCount, wpm = DEFAULT_WPM) {
  if (!wordCount || wordCount <= 0) {
    return '0 min';
  }
  const minutes = Math.ceil(wordCount / wpm);
  return `~${minutes} min`;
}

/**
 * Updates DOM status bar elements with latest document telemetry.
 * 
 * @param {string} text - Raw Markdown text from editor
 * @param {Object} [elements={}] - Optional DOM element references
 * @returns {{ words: number, chars: number, readingTime: string }}
 */
export function updateTelemetry(text, elements = {}) {
  const wordsEl = elements.words || document.getElementById('telemetry-words');
  const charsEl = elements.chars || document.getElementById('telemetry-chars');
  const readTimeEl = elements.readingTime || document.getElementById('telemetry-reading-time');

  const words = calculateWordCount(text);
  const chars = calculateCharacterCount(text);
  const readingTime = calculateReadingTime(words);

  if (wordsEl) {
    wordsEl.textContent = words.toLocaleString();
  }
  if (charsEl) {
    charsEl.textContent = chars.toLocaleString();
  }
  if (readTimeEl) {
    readTimeEl.textContent = readingTime;
  }

  return { words, chars, readingTime };
}
