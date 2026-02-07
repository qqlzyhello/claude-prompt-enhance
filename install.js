#!/usr/bin/env node
/**
 * Claude Code Enhance Prompt - 补丁安装脚本
 *
 * 功能：将 Enhance Prompt 功能注入到 Claude Code VSCode 插件中
 * 用法：node install.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const EXTENSION_ID_PREFIX = 'anthropic.claude-code-';
const PATCH_DIR = path.join(__dirname, 'files');

function log(msg) { console.log('[Patch] ' + msg); }
function err(msg) { console.error('[Patch ERROR] ' + msg); }

function findExtensionDir() {
  var extRoot = path.join(os.homedir(), '.vscode', 'extensions');
  if (!fs.existsSync(extRoot)) {
    err('VSCode extensions 目录不存在: ' + extRoot);
    return null;
  }
  var dirs = fs.readdirSync(extRoot).filter(function(d) {
    return d.startsWith(EXTENSION_ID_PREFIX);
  });
  if (dirs.length === 0) {
    err('未找到 Claude Code 插件，请先安装官方插件');
    return null;
  }
  dirs.sort();
  return path.join(extRoot, dirs[dirs.length - 1]);
}

// ========== 补丁1：复制 enhance.js 到 webview 目录 ==========
function patchEnhanceJs(extDir) {
  var src = path.join(PATCH_DIR, 'enhance.js');
  var dstDir = path.join(extDir, 'webview');
  var dst = path.join(dstDir, 'enhance.js');

  if (!fs.existsSync(src)) {
    err('补丁文件不存在: ' + src);
    return false;
  }
  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }
  // 备份（如果已有同名文件且无备份）
  var backup = dst + '.bak';
  if (fs.existsSync(dst) && !fs.existsSync(backup)) {
    fs.copyFileSync(dst, backup);
    log('已备份原始 enhance.js');
  }
  fs.copyFileSync(src, dst);
  log('enhance.js 已复制到 webview 目录');
  return true;
}

// ========== 补丁2：修改 extension.js ==========
function patchExtensionJs(extDir) {
  var extFile = path.join(extDir, 'extension.js');
  if (!fs.existsSync(extFile)) {
    err('extension.js 不存在: ' + extFile);
    return false;
  }

  var code = fs.readFileSync(extFile, 'utf8');

  // 备份
  var backup = extFile + '.bak';
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(extFile, backup);
    log('已备份原始 extension.js -> extension.js.bak');
  }

  // 检测是否已经打过补丁
  if (code.indexOf('_handleEnhancePrompt') !== -1) {
    log('extension.js 已包含 enhance 补丁，跳过');
    return true;
  }

  var changed = false;
  var handlerCode = fs.readFileSync(path.join(PATCH_DIR, 'enhance-handler.js'), 'utf8').trim();

  // --- 补丁 A & B: 拦截 webview 消息，注入 enhance_prompt 处理 ---
  // 原始代码模式: ...JSON.stringify(j)}`),x?.fromClient(j)}
  // 修改为:       ...JSON.stringify(j)}`);if(j&&j.type==="enhance_prompt"){this._handleEnhancePrompt(j,v.webview);return}x?.fromClient(j)}
  var msgHook = ';if(j&&j.type==="enhance_prompt"){this._handleEnhancePrompt(j,v.webview);return}';
  var msgPattern = 'JSON.stringify(j)}`),x?.fromClient(j)}';
  var msgReplace = 'JSON.stringify(j)}`)' + msgHook + 'x?.fromClient(j)}';

  var count = 0;
  while (code.indexOf(msgPattern) !== -1) {
    code = code.replace(msgPattern, msgReplace);
    count++;
  }
  if (count > 0) {
    log('补丁 A: 已注入消息拦截钩子 (' + count + ' 处)');
    changed = true;
  } else {
    err('补丁 A: 未找到 webview 消息处理模式');
  }

  // --- 补丁 C: 注入 _handleEnhancePrompt 和 _findClaudeBinary 方法 ---
  var anchorC = 'this.disposables.push(v)}getHtmlForWebview(';
  var idxC = code.indexOf(anchorC);
  if (idxC !== -1) {
    code = code.substring(0, idxC) +
      'this.disposables.push(v)}' +
      handlerCode +
      'getHtmlForWebview(' +
      code.substring(idxC + anchorC.length);
    log('补丁 C: 已注入 _handleEnhancePrompt 方法');
    changed = true;
  } else {
    err('补丁 C: 未找到 getHtmlForWebview 锚点');
  }

  // --- 补丁 D: 注入 acquireVsCodeApi 包装器 ---
  // 在第一个 <script nonce="${O}" src="${K}" 之前插入包装脚本
  var anchorD = '<script nonce="${O}" src="${K}" type="module"></script>';
  var wrapperScript = '<script nonce="${O}">\n' +
    '          (function(){\n' +
    '            var _origAcquire = acquireVsCodeApi;\n' +
    '            acquireVsCodeApi = function(){\n' +
    '              var api = _origAcquire();\n' +
    '              window.__enhanceVscodeApi = api;\n' +
    '              acquireVsCodeApi = function(){ return api; };\n' +
    '              return api;\n' +
    '            };\n' +
    '          })();\n' +
    '        </script>\n        ';
  var idxD = code.indexOf(anchorD);
  if (idxD !== -1) {
    code = code.substring(0, idxD) + wrapperScript + anchorD + code.substring(idxD + anchorD.length);
    log('补丁 D: 已注入 acquireVsCodeApi 包装器');
    changed = true;
  } else {
    err('补丁 D: 未找到 script module 锚点');
  }

  // --- 补丁 E: 在 </body> 前注入 enhance.js 内联加载 ---
  var anchorE = '</body>\n      </html>';
  var enhanceScript = '<script nonce="${O}">${require("fs").readFileSync(F0.Uri.joinPath(this.extensionUri,"webview","enhance.js").fsPath,"utf8")}</script>\n      </body>\n      </html>';
  var idxE = code.indexOf(anchorE);
  if (idxE !== -1) {
    code = code.substring(0, idxE) + enhanceScript + code.substring(idxE + anchorE.length);
    log('补丁 E: 已注入 enhance.js 内联加载');
    changed = true;
  } else {
    err('补丁 E: 未找到 </body> 锚点');
  }

  // 保存修改
  if (changed) {
    fs.writeFileSync(extFile, code, 'utf8');
    log('extension.js 已保存');
  }
  return changed;
}

// ========== 主流程 ==========
function main() {
  console.log('');
  console.log('=== Claude Code Enhance Prompt 补丁安装器 ===');
  console.log('');

  var extDir = findExtensionDir();
  if (!extDir) {
    process.exit(1);
  }
  log('找到插件目录: ' + extDir);
  console.log('');

  var ok1 = patchEnhanceJs(extDir);
  var ok2 = patchExtensionJs(extDir);

  console.log('');
  if (ok1 && ok2) {
    console.log('=== 安装完成！===');
    console.log('');
    console.log('请执行以下操作使补丁生效：');
    console.log('  1. 在 VSCode 中按 Ctrl+Shift+P');
    console.log('  2. 输入 Developer: Reload Window');
    console.log('  3. 回车执行');
    console.log('');
  } else {
    console.log('=== 安装过程中有错误，请检查上方日志 ===');
    process.exit(1);
  }
}

main();
