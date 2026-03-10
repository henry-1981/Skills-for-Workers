// editor-ai-edit.js — AI Edit queue: floating input + copy all as markdown

import { currentSlideFile } from './editor-utils.js';
import {
  btnAiEditCopyAll, aiEditBadge, aiEditStatus, aiEditQueue, btnAiEditClear,
  aiEditHint, floatingAiInput, floatingAiInputLabel, floatingAiInputField,
} from './editor-dom.js';
import { getSelectedObjectElement, getSelectionType, elementToSlideRect } from './editor-select.js';
import { getXPath } from './editor-geometry.js';
import { SEL_ELEMENT, SEL_SLIDE_WHOLE, SLIDE_W, SLIDE_H } from './editor-state.js';

const SOFT_LIMIT = 10;
const queue = []; // { file, xpath, text, intent }

function buildItem(intent) {
  const slide = currentSlideFile();
  if (!slide) return null;

  const selType = getSelectionType(slide);
  const item = { file: slide, xpath: null, text: null, intent: intent.trim() };

  if (selType === SEL_ELEMENT) {
    const el = getSelectedObjectElement();
    if (el) {
      item.xpath = getXPath(el);
      const raw = (el.textContent || '').trim();
      if (raw) {
        item.text = raw.length > 200 ? raw.slice(0, 200) + '...' : raw;
      }
    }
  }
  // SEL_SLIDE_WHOLE: xpath stays null → "슬라이드 전체"

  return item;
}

function itemToMarkdown(item, index, total) {
  const lines = [];
  if (total > 1) lines.push(`### ${index + 1}.`);
  lines.push(`- **파일**: ${item.file}`);
  lines.push(`- **대상**: ${item.xpath || '슬라이드 전체'}`);
  if (item.text) lines.push(`- **현재 텍스트**: "${item.text}"`);
  lines.push(`- **의도**: ${item.intent}`);
  return lines.join('\n');
}

function queueToMarkdown() {
  if (queue.length === 0) return null;
  const header = queue.length === 1
    ? '## AI Edit Request'
    : `## AI Edit Request (${queue.length} items)`;
  const body = queue.map((item, i) => itemToMarkdown(item, i, queue.length)).join('\n\n');
  return header + '\n\n' + body;
}

function renderQueue() {
  aiEditQueue.innerHTML = '';

  queue.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'ai-edit-item';

    const body = document.createElement('div');
    body.className = 'ai-edit-item-body';

    const file = document.createElement('div');
    file.className = 'ai-edit-item-file';
    file.textContent = item.file;
    body.appendChild(file);

    const target = document.createElement('div');
    target.className = 'ai-edit-item-target';
    target.textContent = item.xpath || 'Whole slide';
    body.appendChild(target);

    const intent = document.createElement('div');
    intent.className = 'ai-edit-item-intent';
    intent.textContent = item.intent;
    body.appendChild(intent);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ai-edit-item-remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      queue.splice(i, 1);
      renderQueue();
    });

    el.appendChild(body);
    el.appendChild(removeBtn);
    aiEditQueue.appendChild(el);
  });

  // Badge + status
  const count = queue.length;
  if (count > 0) {
    aiEditBadge.textContent = String(count);
    aiEditBadge.style.display = '';
    const danger = count > SOFT_LIMIT * 2;
    const warn = !danger && count > SOFT_LIMIT;
    aiEditBadge.classList.toggle('warn', warn);
    aiEditBadge.classList.toggle('danger', danger);
    aiEditStatus.className = 'ai-edit-status' + (danger ? ' danger' : warn ? ' warn' : '');
    aiEditStatus.textContent = danger
      ? '정확도가 떨어질 수 있어요. 나눠서 보내세요.'
      : warn
        ? '10개 이하로 나눠서 보내는 걸 권장합니다'
        : 'Copy All을 누르고 Claude Code에 붙여넣으세요';
  } else {
    aiEditBadge.style.display = 'none';
    aiEditStatus.className = 'ai-edit-status';
    aiEditStatus.textContent = '';
  }

  // Buttons
  btnAiEditCopyAll.disabled = count === 0;
  btnAiEditCopyAll.textContent = count === 0 ? 'Copy All' : `Copy All (${count})`;
  btnAiEditClear.style.display = count > 0 ? '' : 'none';

  // Hint visibility
  if (aiEditHint) {
    aiEditHint.style.display = count === 0 ? '' : 'none';
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
}

function flashButton(btn, success) {
  btn.textContent = success ? 'Copied!' : 'Failed';
  btn.style.borderColor = success ? 'var(--success)' : 'var(--danger)';
  setTimeout(() => {
    btn.style.borderColor = '';
    renderQueue(); // restore label
  }, 1500);
}

// --- Floating input ---

function positionFloatingInput() {
  const slide = currentSlideFile();
  if (!slide) return;
  const selType = getSelectionType(slide);

  const inputW = 800;
  const inputH = 120;

  if (selType === SEL_ELEMENT) {
    const el = getSelectedObjectElement();
    const rect = el ? elementToSlideRect(el) : null;
    if (rect) {
      let left = rect.x + (rect.width - inputW) / 2;
      left = Math.max(0, Math.min(left, SLIDE_W - inputW));
      const gap = 16;
      let top = rect.y + rect.height + gap;
      if (top + inputH > SLIDE_H) {
        top = rect.y - inputH - gap;
      }
      floatingAiInput.style.left = `${left}px`;
      floatingAiInput.style.top = `${top}px`;
    }
  } else if (selType === SEL_SLIDE_WHOLE) {
    floatingAiInput.style.left = `${(SLIDE_W - inputW) / 2}px`;
    floatingAiInput.style.top = `${SLIDE_H - inputH - 20}px`;
  }
}

function getFloatingLabel() {
  const slide = currentSlideFile();
  if (!slide) return '';
  const selType = getSelectionType(slide);

  if (selType === SEL_ELEMENT) {
    const el = getSelectedObjectElement();
    if (el) {
      const tag = el.tagName.toLowerCase();
      const raw = (el.textContent || '').trim();
      const preview = raw.length > 20 ? raw.slice(0, 20) + '\u2026' : raw;
      return preview ? `<${tag}> "${preview}"` : `<${tag}>`;
    }
  }
  return '슬라이드 전체';
}

function showFloatingInput() {
  floatingAiInputLabel.textContent = getFloatingLabel();
  positionFloatingInput();
  floatingAiInput.style.display = 'block';
  floatingAiInputField.value = '';
  floatingAiInputField.focus();
}

function hideFloatingInput() {
  floatingAiInput.style.display = 'none';
  floatingAiInputField.value = '';
  floatingAiInputField.blur();
}

function addFromFloatingInput() {
  const intent = floatingAiInputField.value.trim();
  if (!intent) return;

  const item = buildItem(intent);
  if (!item) return;

  queue.push(item);
  hideFloatingInput();
  renderQueue();
}

// --- Public API ---

export function initAiEdit() {
  // Floating input keyboard
  floatingAiInputField.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      hideFloatingInput();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      addFromFloatingInput();
    }
  });

  // Copy all
  btnAiEditCopyAll.addEventListener('click', async () => {
    const md = queueToMarkdown();
    if (!md) return;

    const ok = await copyToClipboard(md);
    flashButton(btnAiEditCopyAll, ok);

    if (ok) {
      queue.length = 0;
      setTimeout(renderQueue, 1600);
    }
  });

  // Clear queue
  btnAiEditClear.addEventListener('click', () => {
    queue.length = 0;
    renderQueue();
  });

  renderQueue();
}

export function focusAiEdit() {
  showFloatingInput();
}
