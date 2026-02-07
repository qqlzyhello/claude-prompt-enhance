(function() {
  'use strict';

  // ========== CSS Styles ==========
  const STYLES = `
    .enhance-btn-container {
      display: flex;
      align-items: center;
      position: relative;
    }
    .enhance-btn,
    .enhance-settings-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      padding: 0;
      position: relative;
      transition: background 0.2s;
      color: var(--vscode-foreground, var(--app-secondary-foreground, #ccc));
      flex-shrink: 0;
    }
    .enhance-btn:hover,
    .enhance-settings-btn:hover {
      background: var(--vscode-toolbar-hoverBackground, rgba(90,93,94,0.31));
    }
    .enhance-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .enhance-btn svg,
    .enhance-settings-btn svg {
      width: 16px;
      height: 16px;
      fill: var(--vscode-foreground, #ccc);
      transition: fill 0.3s;
    }
    .enhance-settings-btn.active svg {
      fill: var(--vscode-focusBorder, #007fd4);
    }
    .enhance-btn.enhancing svg {
      animation: enhanceColorFlow 3s ease-in-out infinite;
    }
    /* Idle pulse: gentle glow to hint the feature is available */
    .enhance-btn.idle-pulse svg {
      animation: idlePulse 3s ease-in-out infinite;
    }
    @keyframes idlePulse {
      0%   { fill: var(--vscode-foreground, #ccc); filter: none; }
      50%  { fill: #7c9fdb; filter: drop-shadow(0 0 4px rgba(124,159,219,0.6)); }
      100% { fill: var(--vscode-foreground, #ccc); filter: none; }
    }
    @keyframes enhanceColorFlow {
      0%   { fill: #a78bfa; filter: drop-shadow(0 0 3px #a78bfa); }
      25%  { fill: #60a5fa; filter: drop-shadow(0 0 3px #60a5fa); }
      50%  { fill: #34d399; filter: drop-shadow(0 0 3px #34d399); }
      75%  { fill: #f472b6; filter: drop-shadow(0 0 3px #f472b6); }
      100% { fill: #a78bfa; filter: drop-shadow(0 0 3px #a78bfa); }
    }

    /* ---- Input text dynamic gradient during enhancement ---- */
    @keyframes textGradientFlow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .enhance-text-gradient {
      background: linear-gradient(270deg, #a78bfa, #60a5fa, #34d399, #fbbf24, #f472b6, #a78bfa);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: textGradientFlow 4s ease-in-out infinite;
    }

    /* ---- Per-character shimmer: soft horizontal sweep ---- */
    @keyframes charColorWave {
      0%   { color: var(--vscode-editor-foreground, #ccc); opacity: 0.6; }
      40%  { color: #7c9fdb; opacity: 1; }
      60%  { color: #8bb5a2; opacity: 1; }
      100% { color: var(--vscode-editor-foreground, #ccc); opacity: 0.85; }
    }
    .enhance-char-shimmer {
      display: inline;
      animation: charColorWave 2.5s ease-in-out infinite;
    }

    /* ---- Settings panel ---- */
    .enhance-settings-panel {
      position: absolute;
      bottom: 34px;
      right: 0;
      z-index: 9999;
      background: var(--vscode-dropdown-background, #1e1e1e);
      border: 1px solid var(--vscode-dropdown-border, #454545);
      border-radius: 6px;
      padding: 10px 12px;
      min-width: 280px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      font-size: 12px;
      color: var(--vscode-foreground, #ccc);
      display: none;
    }
    .enhance-settings-panel.visible {
      display: block;
    }
    .enhance-settings-panel label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      font-size: 11px;
      color: var(--vscode-descriptionForeground, #aaa);
    }
    .enhance-settings-panel select,
    .enhance-settings-panel input[type="text"],
    .enhance-settings-panel input[type="password"] {
      width: 100%;
      box-sizing: border-box;
      padding: 4px 6px;
      margin-bottom: 8px;
      border: 1px solid var(--vscode-input-border, #3c3c3c);
      background: var(--vscode-input-background, #2a2a2a);
      color: var(--vscode-input-foreground, #ccc);
      border-radius: 3px;
      font-size: 12px;
      outline: none;
    }
    .enhance-settings-panel select:focus,
    .enhance-settings-panel input:focus {
      border-color: var(--vscode-focusBorder, #007fd4);
    }
    .enhance-settings-section-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--vscode-foreground, #ccc);
    }
    .enhance-settings-divider {
      border: none;
      border-top: 1px solid var(--vscode-dropdown-border, #454545);
      margin: 8px 0;
    }
    .enhance-custom-fields {
      display: none;
    }
    .enhance-custom-fields.visible {
      display: block;
    }
    .enhance-settings-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .enhance-settings-row label {
      margin-bottom: 0;
      white-space: nowrap;
      min-width: 60px;
    }
    .enhance-settings-row select,
    .enhance-settings-row input {
      margin-bottom: 0;
      flex: 1;
    }
    .enhance-lang-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .enhance-lang-row label {
      margin-bottom: 0;
      white-space: nowrap;
    }
    .enhance-lang-row select {
      margin-bottom: 0;
      flex: 1;
    }
    .enhance-error-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .enhance-error-dialog {
      background: var(--vscode-editorWidget-background, #252526);
      border: 1px solid var(--vscode-editorWidget-border, #454545);
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      color: var(--vscode-foreground, #ccc);
      font-size: 13px;
    }
    .enhance-error-dialog h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: var(--vscode-errorForeground, #f48771);
    }
    .enhance-error-dialog pre {
      background: var(--vscode-textCodeBlock-background, #1e1e1e);
      padding: 8px 10px;
      border-radius: 4px;
      font-size: 12px;
      max-height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 0 0 12px 0;
    }
    .enhance-error-dialog button {
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #fff);
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .enhance-error-dialog button:hover {
      background: var(--vscode-button-hoverBackground, #1177bb);
    }
  `;

  // ========== Four-pointed star SVG icon ==========
  const STAR_ICON_SVG = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 0 C52 38, 62 48, 100 50 C62 52, 52 62, 50 100 C48 62, 38 52, 0 50 C38 48, 48 38, 50 0Z" /></svg>';

  // ========== Gear/settings SVG icon ==========
  const GEAR_ICON_SVG = '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M463.36 149.211l-21.504 3.146-7.607 1.901a57.417 57.417 0 0 0-39.497 43.667l-8.923 45.348-0.659 0.366a316.312 316.312 0 0 0-52.15 28.599l-1.39 0.95-47.836-16.09a59.465 59.465 0 0 0-57.417 10.97l-6.729 6.803a362.277 362.277 0 0 0-61.806 95.378l-8.045 19.749-2.195 7.607a56.32 56.32 0 0 0 19.749 55.734l37.595 30.428-1.024 11.995a287.525 287.525 0 0 0-0.439 16.238l0.44 16.238 1.023 11.922-37.449 30.354a56.247 56.247 0 0 0-19.822 56.028l2.926 9.289c13.532 35.767 32.476 68.754 56.466 98.523l13.898 16.311 5.558 5.34c15.58 13.165 37.303 17.48 57.052 10.971l48.128-16.238 1.39 1.024c16.457 11.191 33.938 20.773 52.662 28.819l8.997 45.568c4.023 20.845 19.53 37.302 39.497 43.593l9.728 2.194a405.211 405.211 0 0 0 113.591 3.218l24.65-3.584 7.68-1.828a57.417 57.417 0 0 0 39.496-43.667l8.777-45.129 0.732-0.292a313.576 313.576 0 0 0 52.663-28.745l1.243-1.098 47.543 16.092c19.895 6.583 41.765 2.34 57.344-10.972l6.875-6.948c25.82-28.818 46.52-60.855 61.733-95.378l8.046-19.749 2.267-7.534a56.32 56.32 0 0 0-19.748-55.588l-37.01-29.989 1.096-12.507c0.293-5.413 0.44-10.825 0.44-16.238l-0.44-16.238-1.097-12.58 36.864-29.843a56.247 56.247 0 0 0 19.749-55.954l-2.853-9.362a358.107 358.107 0 0 0-56.466-98.45l-13.97-16.311-5.56-5.34a59.538 59.538 0 0 0-57.05-10.971l-47.69 16.018-1.463-1.024a312.832 312.832 0 0 0-34.377-20.26l-18.87-8.778-8.778-45.129a57.71 57.71 0 0 0-47.104-45.495l-2.12-0.365a407.918 407.918 0 0 0-116.737-2.78z m86.674 65.683l15.287 2.194 14.702 75.19 17.847 6.364a246.155 246.155 0 0 1 68.973 37.669l14.044 10.971 76.068-25.6 10.021 11.703c14.994 19.017 27.575 39.497 37.376 61.367l4.827 11.557-60.854 49.298 3.291 19.163a219.721 219.721 0 0 1 0 74.533l-3.291 19.236 60.708 49.152-4.754 11.703a293.157 293.157 0 0 1-37.376 61.22l-9.948 11.63-76.068-25.6-14.117 11.045c-20.626 16.092-43.74 28.745-68.9 37.669l-17.847 6.363-14.702 75.191 3.292-0.439a337.335 337.335 0 0 1-56.54 4.754l-19.017-0.512a339.017 339.017 0 0 1-19.017-1.609l-15.36-2.267-14.629-75.41-17.92-6.364a244.81 244.81 0 0 1-68.315-37.522l-14.117-10.972-76.58 25.747-9.948-11.776a292.498 292.498 0 0 1-37.376-61.294l-4.9-11.703 61.586-49.664-3.365-19.236a212.992 212.992 0 0 1 0-73.363l3.365-19.236-61.586-49.737 4.9-11.703c9.801-21.65 22.382-42.204 37.45-61.22l9.874-11.85 76.58 25.82 14.117-10.972c20.553-15.945 43.593-28.526 68.388-37.522l17.774-6.29 14.775-75.484-3.291 0.512a340.7 340.7 0 0 1 94.573-2.633z" /><path d="M512 365.714a146.286 146.286 0 1 1 0 292.572 146.286 146.286 0 0 1 0-292.572z m0 48.787a97.5 97.5 0 1 0 0 194.998 97.5 97.5 0 0 0 0-194.998z" /></svg>';

  // CSS class names from the bundled webview
  const ADD_BTN_CLASS = 'addButtonContainer_Lu5mZA';
  const INPUT_CLASS = 'messageInput_cKsPxg';

  // ========== Persistent settings keys ==========
  const STORAGE_KEY_API_MODE = 'enhance_api_mode';
  const STORAGE_KEY_PROVIDER = 'enhance_api_provider';
  const STORAGE_KEY_API_KEY = 'enhance_api_key';
  const STORAGE_KEY_BASE_URL = 'enhance_base_url';
  const STORAGE_KEY_MODEL = 'enhance_model';
  const STORAGE_KEY_LANGUAGE = 'enhance_language';

  // ========== State ==========
  let isEnhancing = false;
  let enhanceBtn = null;
  let settingsBtn = null;
  let settingsPanel = null;
  let typewriterTimer = null; // for cancelling typewriter
  let enhanceCancelled = false; // cancel flag

  // ========== Inject styles ==========
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // ========== Settings persistence helpers ==========
  function loadSetting(key, defaultVal) {
    try { var v = localStorage.getItem(key); return v !== null ? v : defaultVal; }
    catch(e) { return defaultVal; }
  }
  function saveSetting(key, val) {
    try { localStorage.setItem(key, val); } catch(e) {}
  }

  // ========== Helper: get the message input element ==========
  function getInputEl() {
    return document.querySelector('.' + INPUT_CLASS);
  }

  // ========== Helper: get input text ==========
  function getInputText() {
    const el = getInputEl();
    return el ? el.textContent || '' : '';
  }

  // ========== Helper: collect conversation context ==========
  function getConversationContext() {
    const msgs = [];
    document.querySelectorAll('[class*="timelineItem_"]').forEach(function(item) {
      const role = item.querySelector('[class*="humanMessage_"]') ? 'user' : 'assistant';
      const textEl = item.querySelector('[class*="messageText_"], [class*="markdownContent_"]');
      if (textEl) {
        const text = textEl.textContent || '';
        if (text.trim()) msgs.push({ role: role, text: text.substring(0, 500) });
      }
    });
    // Keep last 6 messages for context
    return msgs.slice(-6);
  }

  // ========== Typewriter effect with per-character shimmer ==========
  function typewriterFill(text, callback) {
    const inputEl = getInputEl();
    if (!inputEl) { if (callback) callback(); return; }

    enhanceCancelled = false;
    removeTextGradient();
    inputEl.textContent = '';

    var origOverflow = inputEl.style.overflowY;
    inputEl.style.overflowY = 'auto';

    let i = 0;
    const chars = Array.from(text);
    let userScrolled = false;

    function isAtBottom() {
      return inputEl.scrollHeight - inputEl.scrollTop - inputEl.clientHeight < 20;
    }

    function onUserScroll() {
      if (!isAtBottom()) { userScrolled = true; } else { userScrolled = false; }
    }

    inputEl.addEventListener('scroll', onUserScroll);

    function cleanup() {
      inputEl.removeEventListener('scroll', onUserScroll);
      inputEl.style.overflowY = origOverflow;
      removeTextGradient();
      typewriterTimer = null;
    }

    function typeNext() {
      if (enhanceCancelled) {
        // User cancelled — keep whatever text is already typed, clean up spans
        var partialText = inputEl.textContent || '';
        cleanup();
        inputEl.textContent = partialText;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        if (callback) callback();
        return;
      }

      if (i >= chars.length) {
        typewriterTimer = setTimeout(function() {
          cleanup();
          inputEl.textContent = text;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          if (callback) callback();
        }, 800);
        return;
      }

      var span = document.createElement('span');
      span.className = 'enhance-char-shimmer';
      span.textContent = chars[i];
      span.style.animationDelay = (i * 0.04) % 2 + 's';
      inputEl.appendChild(span);
      i++;

      if (!userScrolled) {
        inputEl.scrollTop = inputEl.scrollHeight;
      }

      var delay = chars.length > 200 ? 8 : chars.length > 100 ? 15 : 25;
      typewriterTimer = setTimeout(typeNext, delay);
    }

    typeNext();
  }

  // ========== Apply/remove dynamic gradient on input text ==========
  function applyTextGradient() {
    var el = getInputEl();
    if (el) el.classList.add('enhance-text-gradient');
  }

  function removeTextGradient() {
    var el = getInputEl();
    if (el) {
      el.classList.remove('enhance-text-gradient');
      el.style.webkitTextFillColor = '';
      el.style.backgroundImage = '';
    }
  }

  // ========== Set enhancing state ==========
  function setEnhancing(active) {
    isEnhancing = active;
    if (enhanceBtn) {
      // Clear all state classes first
      enhanceBtn.classList.remove('enhancing', 'idle-pulse');
      if (active) {
        enhanceBtn.classList.add('enhancing');
        enhanceBtn.title = '点击取消优化';
        // Apply dynamic gradient to input text
        applyTextGradient();
      } else {
        // After stopping: remove all dynamic effects
        enhanceBtn.title = '优化提示词';
        removeTextGradient();
        // Re-check if idle pulse should resume after a short delay
        setTimeout(updateIdlePulse, 300);
      }
      enhanceBtn.disabled = false;
    }
  }

  // ========== Idle pulse: show when input is empty ==========
  function updateIdlePulse() {
    if (!enhanceBtn || isEnhancing) return;
    var text = getInputText().trim();
    if (!text) {
      enhanceBtn.classList.add('idle-pulse');
    } else {
      enhanceBtn.classList.remove('idle-pulse');
    }
  }

  // ========== Error popup dialog ==========
  function showErrorPopup(title, message) {
    var overlay = document.createElement('div');
    overlay.className = 'enhance-error-overlay';
    var dialog = document.createElement('div');
    dialog.className = 'enhance-error-dialog';
    var h3 = document.createElement('h3');
    h3.textContent = title;
    dialog.appendChild(h3);
    var pre = document.createElement('pre');
    pre.textContent = message;
    dialog.appendChild(pre);
    var btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.addEventListener('click', function() {
      overlay.parentNode.removeChild(overlay);
    });
    dialog.appendChild(btn);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.parentNode.removeChild(overlay);
    });
    document.body.appendChild(overlay);
  }

  // ========== Get vscode API reference ==========
  function getVscodeApi() {
    // Primary: our intercepted reference
    if (window.__enhanceVscodeApi) return window.__enhanceVscodeApi;
    // Fallback: try to find it on the window
    if (window.vscodeApi) return window.vscodeApi;
    // Last resort: try calling acquireVsCodeApi (may throw if already called)
    try { return acquireVsCodeApi(); } catch(e) {}
    return null;
  }

  // ========== Handle enhance click ==========
  function onEnhanceClick() {
    // If already enhancing, cancel it
    if (isEnhancing) {
      enhanceCancelled = true;
      if (typewriterTimer) { clearTimeout(typewriterTimer); typewriterTimer = null; }
      setEnhancing(false);
      return;
    }

    const userInput = getInputText().trim();
    if (!userInput) return;

    var api = getVscodeApi();
    if (!api) {
      console.error('[Enhance] No vscodeApi available');
      return;
    }

    setEnhancing(true);

    var context = getConversationContext();
    var apiMode = loadSetting(STORAGE_KEY_API_MODE, 'default');
    var language = loadSetting(STORAGE_KEY_LANGUAGE, 'english');

    var msgPayload = {
      type: 'enhance_prompt',
      text: userInput,
      conversationContext: context,
      language: language
    };

    // Attach custom API config if mode is custom
    if (apiMode === 'custom') {
      msgPayload.customApi = {
        provider: loadSetting(STORAGE_KEY_PROVIDER, 'openai'),
        apiKey: loadSetting(STORAGE_KEY_API_KEY, ''),
        baseUrl: loadSetting(STORAGE_KEY_BASE_URL, ''),
        model: loadSetting(STORAGE_KEY_MODEL, '')
      };
    }

    try {
      api.postMessage(msgPayload);
    } catch(e) {
      console.error('[Enhance] postMessage failed:', e);
      setEnhancing(false);
    }
  }

  // ========== Listen for response from extension ==========
  window.addEventListener('message', function(event) {
    const msg = event.data;
    if (!msg) return;

    if (msg.type === 'enhance_prompt_result') {
      if (msg.error) {
        console.error('Enhance failed:', msg.error);
        setEnhancing(false);
        // Show error popup
        showErrorPopup('优化提示词失败', msg.error);
        return;
      }

      const enhanced = msg.enhancedText || '';
      if (enhanced) {
        typewriterFill(enhanced, function() {
          setEnhancing(false);
        });
      } else {
        setEnhancing(false);
      }
    }
  });

  // ========== Create settings panel ==========
  function createSettingsPanel() {
    var panel = document.createElement('div');
    panel.className = 'enhance-settings-panel';

    // --- API Source section ---
    var title = document.createElement('div');
    title.className = 'enhance-settings-section-title';
    title.textContent = '优化 API 来源';
    panel.appendChild(title);

    var modeRow = document.createElement('div');
    modeRow.className = 'enhance-settings-row';
    var modeLabel = document.createElement('label');
    modeLabel.textContent = '来源';
    var modeSelect = document.createElement('select');
    modeSelect.id = 'enhance-api-mode';
    var optDefault = document.createElement('option');
    optDefault.value = 'default'; optDefault.textContent = '默认';
    var optCustom = document.createElement('option');
    optCustom.value = 'custom'; optCustom.textContent = '自定义';
    modeSelect.appendChild(optDefault);
    modeSelect.appendChild(optCustom);
    modeSelect.value = loadSetting(STORAGE_KEY_API_MODE, 'default');
    modeRow.appendChild(modeLabel);
    modeRow.appendChild(modeSelect);
    panel.appendChild(modeRow);

    // --- Custom fields container ---
    var customFields = document.createElement('div');
    customFields.className = 'enhance-custom-fields';
    if (modeSelect.value === 'custom') customFields.classList.add('visible');

    panel.appendChild(customFields);

    // --- Provider/Model data ---
    var PROVIDERS = {
      'anthropic': { label: 'Anthropic', url: 'https://api.anthropic.com', models: [
        'claude-opus-4-20250514','claude-sonnet-4-20250514','claude-3.7-sonnet-20250219','claude-3.5-sonnet-20241022','claude-3.5-haiku-20241022','claude-3-opus-20240229','claude-3-sonnet-20240229','claude-3-haiku-20240307'
      ]},
      'openai': { label: 'OpenAI', url: 'https://api.openai.com/v1', models: [
        'gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-4','gpt-4.1','gpt-4.1-mini','gpt-4.1-nano','gpt-4.5-preview','gpt-3.5-turbo','o1-preview','o1-mini','o1-pro'
      ]},
      'gemini': { label: 'Google Gemini', url: 'https://generativelanguage.googleapis.com/v1beta', models: [
        'gemini-2.5-pro-preview-05-06','gemini-2.5-flash-preview-05-20','gemini-2.0-flash','gemini-2.0-flash-lite','gemini-2.0-pro','gemini-1.5-pro','gemini-1.5-flash','gemini-1.5-flash-8b'
      ]},
      'deepseek': { label: 'DeepSeek', url: 'https://api.deepseek.com/v1', models: [
        'deepseek-chat','deepseek-reasoner','deepseek-r1','deepseek-r1-0528'
      ]},
      'xai': { label: 'xAI (Grok)', url: 'https://api.x.ai/v1', models: [
        'grok-4-0709','grok-3','grok-3-mini'
      ]},
      'mistral': { label: 'Mistral', url: 'https://api.mistral.ai/v1', models: [
        'mistral-large-latest','mistral-medium-latest','mistral-small-latest','codestral-latest','pixtral-large-latest'
      ]},
      'groq': { label: 'Groq', url: 'https://api.groq.com/openai/v1', models: [
        'llama-3.3-70b-versatile','llama-3.1-8b-instant','mixtral-8x7b-32768','gemma2-9b-it'
      ]},
      'fireworks': { label: 'Fireworks AI', url: 'https://api.fireworks.ai/inference/v1', models: [
        'accounts/fireworks/models/deepseek-r1-0528','accounts/fireworks/models/deepseek-v3p2','accounts/fireworks/models/qwen3-235b-a22b-instruct-2507','accounts/fireworks/models/llama4-maverick-instruct-basic'
      ]},
      'openrouter': { label: 'OpenRouter', url: 'https://openrouter.ai/api/v1', models: [
        'anthropic/claude-opus-4','openai/gpt-4o','google/gemini-2.5-pro','deepseek/deepseek-r1','meta-llama/llama-3.3-70b-instruct'
      ]},
      'cerebras': { label: 'Cerebras', url: 'https://api.cerebras.ai/v1', models: [
        'llama-3.3-70b','llama-3.1-8b'
      ]},
      'sambanova': { label: 'SambaNova', url: 'https://api.sambanova.ai/v1', models: [
        'Meta-Llama-3.3-70B-Instruct','DeepSeek-R1'
      ]},
      'deepinfra': { label: 'DeepInfra', url: 'https://api.deepinfra.com/v1/openai', models: [
        'deepseek-ai/DeepSeek-R1','deepseek-ai/DeepSeek-V3','meta-llama/Llama-3.3-70B-Instruct-Turbo','Qwen/Qwen3-235B-A22B'
      ]},
      'huggingface': { label: 'Hugging Face', url: 'https://api-inference.huggingface.co/v1', models: [
        'meta-llama/Llama-3.3-70B-Instruct','Qwen/Qwen2.5-72B-Instruct','mistralai/Mixtral-8x7B-Instruct-v0.1'
      ]},
      'moonshot': { label: 'Moonshot (Kimi)', url: 'https://api.moonshot.cn/v1', models: [
        'moonshot-v1-128k','moonshot-v1-32k','moonshot-v1-8k','kimi-k2-0711-preview'
      ]},
      'doubao': { label: 'Doubao (豆包)', url: 'https://ark.cn-beijing.volces.com/api/v3', models: [
        'doubao-1.5-pro-256k','doubao-1.5-pro-32k','doubao-1.5-lite-32k','doubao-pro-32k','doubao-lite-32k'
      ]},
      'minimax': { label: 'MiniMax', url: 'https://api.minimax.chat/v1', models: [
        'MiniMax-M1','MiniMax-M1-40k','abab6.5s-chat'
      ]},
      'qwen': { label: 'Qwen (通义千问)', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: [
        'qwen-max','qwen-plus','qwen-turbo','qwen-long','qwen3-235b-a22b','qwen3-coder','qwen3-32b','qwen3-14b'
      ]},
      'featherless': { label: 'Featherless', url: 'https://api.featherless.ai/v1', models: [
        'meta-llama/Llama-3.3-70B-Instruct','Qwen/Qwen2.5-72B-Instruct'
      ]},
      'ollama': { label: 'Ollama (Local)', url: 'http://localhost:11434/v1', models: [
        'llama3.3','qwen3:32b','deepseek-r1:32b','gemma2:27b','mistral','codellama'
      ]},
      'lmstudio': { label: 'LM Studio (Local)', url: 'http://localhost:1234/v1', models: [
        'loaded-model'
      ]},
      'litellm': { label: 'LiteLLM Proxy', url: 'http://localhost:4000/v1', models: [
        'gpt-4o','claude-sonnet-4-20250514','gemini-2.5-pro'
      ]},
      'bedrock': { label: 'AWS Bedrock', url: '', models: [
        'anthropic.claude-opus-4-20250514-v1:0','anthropic.claude-sonnet-4-20250514-v1:0','anthropic.claude-3.5-sonnet-20241022-v2:0','amazon.nova-pro-v1:0','amazon.nova-lite-v1:0'
      ]},
      'vertex': { label: 'Google Vertex AI', url: '', models: [
        'gemini-2.5-pro','gemini-2.5-flash','gemini-2.0-flash','claude-sonnet-4@20250514','claude-opus-4@20250514'
      ]},
      'openai-compatible': { label: 'OpenAI-Compatible (Custom)', url: '', models: [] }
    };

    // Provider
    var provLabel = document.createElement('label');
    provLabel.textContent = 'API 供应商';
    customFields.appendChild(provLabel);
    var provSelect = document.createElement('select');
    provSelect.id = 'enhance-api-provider';
    Object.keys(PROVIDERS).forEach(function(key) {
      var o = document.createElement('option');
      o.value = key;
      o.textContent = PROVIDERS[key].label;
      provSelect.appendChild(o);
    });
    provSelect.value = loadSetting(STORAGE_KEY_PROVIDER, 'openai');
    customFields.appendChild(provSelect);

    // API Key
    var keyLabel = document.createElement('label');
    keyLabel.textContent = 'API 密钥';
    customFields.appendChild(keyLabel);
    var keyInput = document.createElement('input');
    keyInput.type = 'password';
    keyInput.id = 'enhance-api-key';
    keyInput.placeholder = 'sk-...';
    keyInput.value = loadSetting(STORAGE_KEY_API_KEY, '');
    customFields.appendChild(keyInput);

    // Base URL
    var urlLabel = document.createElement('label');
    urlLabel.textContent = '接口地址';
    customFields.appendChild(urlLabel);
    var urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.id = 'enhance-base-url';
    urlInput.value = loadSetting(STORAGE_KEY_BASE_URL, '');
    customFields.appendChild(urlInput);

    // Model (select + custom input)
    var modelLabel = document.createElement('label');
    modelLabel.textContent = '模型';
    customFields.appendChild(modelLabel);
    var modelSelect = document.createElement('select');
    modelSelect.id = 'enhance-model-select';
    customFields.appendChild(modelSelect);
    var modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.id = 'enhance-model';
    modelInput.placeholder = '或输入自定义模型 ID...';
    modelInput.value = loadSetting(STORAGE_KEY_MODEL, '');
    customFields.appendChild(modelInput);

    // --- Sync provider -> url + models ---
    function syncProviderUI() {
      var prov = PROVIDERS[provSelect.value];
      if (prov && prov.url && !urlInput.value) urlInput.placeholder = prov.url;
      if (prov && prov.url) urlInput.placeholder = prov.url || 'https://...';
      // rebuild model dropdown
      modelSelect.innerHTML = '';
      var optCustom = document.createElement('option');
      optCustom.value = ''; optCustom.textContent = '-- 自定义（在下方输入）--';
      modelSelect.appendChild(optCustom);
      if (prov && prov.models) {
        prov.models.forEach(function(m) {
          var o = document.createElement('option');
          o.value = m; o.textContent = m;
          modelSelect.appendChild(o);
        });
      }
      // restore saved model if it matches
      var saved = loadSetting(STORAGE_KEY_MODEL, '');
      if (saved) {
        var found = false;
        for (var i = 0; i < modelSelect.options.length; i++) {
          if (modelSelect.options[i].value === saved) { modelSelect.selectedIndex = i; found = true; break; }
        }
        if (!found) { modelSelect.selectedIndex = 0; modelInput.value = saved; }
        else { modelInput.value = ''; }
      }
    }
    provSelect.addEventListener('change', function() {
      syncProviderUI();
      saveSetting(STORAGE_KEY_PROVIDER, provSelect.value);
    });
    modelSelect.addEventListener('change', function() {
      if (modelSelect.value) { modelInput.value = modelSelect.value; }
      saveSetting(STORAGE_KEY_MODEL, modelInput.value);
    });
    modelInput.addEventListener('input', function() {
      modelSelect.selectedIndex = 0;
      saveSetting(STORAGE_KEY_MODEL, modelInput.value);
    });
    syncProviderUI();

    // --- Divider ---
    var divider = document.createElement('hr');
    divider.className = 'enhance-settings-divider';
    panel.appendChild(divider);

    // --- Language section ---
    var langRow = document.createElement('div');
    langRow.className = 'enhance-lang-row';
    var langLabel = document.createElement('label');
    langLabel.textContent = '输出语言';
    var langSelect = document.createElement('select');
    langSelect.id = 'enhance-language';
    var langEn = document.createElement('option');
    langEn.value = 'english'; langEn.textContent = 'English (英文)';
    var langZh = document.createElement('option');
    langZh.value = 'chinese'; langZh.textContent = '中文';
    langSelect.appendChild(langEn);
    langSelect.appendChild(langZh);
    langSelect.value = loadSetting(STORAGE_KEY_LANGUAGE, 'english');
    langRow.appendChild(langLabel);
    langRow.appendChild(langSelect);
    panel.appendChild(langRow);

    // --- Event listeners to persist settings ---
    modeSelect.addEventListener('change', function() {
      saveSetting(STORAGE_KEY_API_MODE, modeSelect.value);
      if (modeSelect.value === 'custom') customFields.classList.add('visible');
      else customFields.classList.remove('visible');
    });
    provSelect.addEventListener('change', function() {
      saveSetting(STORAGE_KEY_PROVIDER, provSelect.value);
    });
    keyInput.addEventListener('input', function() {
      saveSetting(STORAGE_KEY_API_KEY, keyInput.value);
    });
    urlInput.addEventListener('input', function() {
      saveSetting(STORAGE_KEY_BASE_URL, urlInput.value);
    });
    modelInput.addEventListener('input', function() {
      saveSetting(STORAGE_KEY_MODEL, modelInput.value);
    });
    langSelect.addEventListener('change', function() {
      saveSetting(STORAGE_KEY_LANGUAGE, langSelect.value);
    });

    // Prevent clicks inside panel from closing it
    panel.addEventListener('click', function(e) { e.stopPropagation(); });

    return panel;
  }

  // ========== Create the enhance button element ==========
  function createEnhanceButton() {
    const container = document.createElement('div');
    container.className = 'enhance-btn-container';

    // Settings gear button — exact same pattern as star button
    const gearBtn = document.createElement('button');
    gearBtn.type = 'button';
    gearBtn.className = 'enhance-settings-btn';
    gearBtn.title = '优化设置';
    gearBtn.innerHTML = GEAR_ICON_SVG;
    gearBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      // Lazy-create settings panel on first click
      if (!settingsPanel) {
        settingsPanel = createSettingsPanel();
        container.appendChild(settingsPanel);
        document.addEventListener('click', function() {
          if (settingsPanel && settingsPanel.classList.contains('visible')) {
            settingsPanel.classList.remove('visible');
            gearBtn.classList.remove('active');
          }
        });
      }
      var isVisible = settingsPanel.classList.contains('visible');
      if (isVisible) {
        settingsPanel.classList.remove('visible');
        gearBtn.classList.remove('active');
      } else {
        settingsPanel.classList.add('visible');
        gearBtn.classList.add('active');
      }
    });
    settingsBtn = gearBtn;
    container.appendChild(gearBtn);

    // Enhance (star) button — same pattern
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'enhance-btn';
    btn.title = '优化提示词';
    btn.innerHTML = STAR_ICON_SVG;
    btn.addEventListener('click', onEnhanceClick);
    enhanceBtn = btn;
    container.appendChild(btn);
    return container;
  }

  // ========== Insert button into DOM ==========
  function insertButton() {
    // Already inserted?
    if (document.querySelector('.enhance-btn-container')) return true;

    const addBtnContainer = document.querySelector('.' + ADD_BTN_CLASS);
    if (!addBtnContainer) return false;

    const parent = addBtnContainer.parentElement;
    if (!parent) return false;

    const btnEl = createEnhanceButton();
    parent.insertBefore(btnEl, addBtnContainer);

    // Start idle pulse monitoring
    startIdlePulseMonitor();
    return true;
  }

  // ========== Monitor input to toggle idle pulse ==========
  function startIdlePulseMonitor() {
    // Initial check
    updateIdlePulse();

    // Watch for input changes via MutationObserver on the input element
    var inputObserver = new MutationObserver(function() {
      if (!isEnhancing) updateIdlePulse();
    });

    // Observe the input area for content changes
    function observeInput() {
      var el = getInputEl();
      if (el) {
        inputObserver.observe(el, { childList: true, subtree: true, characterData: true });
        // Also listen for keyboard events as fallback
        el.addEventListener('input', function() {
          if (!isEnhancing) updateIdlePulse();
        });
        el.addEventListener('keyup', function() {
          if (!isEnhancing) updateIdlePulse();
        });
      }
    }

    observeInput();

    // Re-observe if input element gets recreated
    var bodyObserver = new MutationObserver(function() {
      var el = getInputEl();
      if (el && !el._idlePulseAttached) {
        el._idlePulseAttached = true;
        observeInput();
        updateIdlePulse();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ========== Use MutationObserver to wait for DOM ==========
  function waitAndInsert() {
    if (insertButton()) return;

    const observer = new MutationObserver(function() {
      if (insertButton()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also re-check periodically in case React re-renders
    setInterval(function() {
      if (!document.querySelector('.enhance-btn-container')) {
        insertButton();
      }
    }, 2000);
  }

  // ========== Init ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndInsert);
  } else {
    waitAndInsert();
  }

})();
