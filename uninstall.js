#!/usr/bin/env node
/**
 * Claude Code Enhance Prompt - 补丁卸载脚本
 * 用法：node uninstall.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function log(msg) { console.log('[Uninstall] ' + msg); }

function findExtensionDir() {
  var extRoot = path.join(os.homedir(), '.vscode', 'extensions');
  var dirs = fs.readdirSync(extRoot).filter(function(d) {
    return d.startsWith('anthropic.claude-code-');
  });
  if (dirs.length === 0) return null;
  dirs.sort();
  return path.join(extRoot, dirs[dirs.length - 1]);
}

function main() {
  console.log('');
  console.log('=== Claude Code Enhance Prompt 补丁卸载 ===');
  console.log('');

  var extDir = findExtensionDir();
  if (!extDir) {
    log('未找到 Claude Code 插件');
    process.exit(1);
  }
  log('插件目录: ' + extDir);

  // 恢复 enhance.js
  var enhBak = path.join(extDir, 'webview', 'enhance.js.bak');
  var enhDst = path.join(extDir, 'webview', 'enhance.js');
  if (fs.existsSync(enhBak)) {
    fs.copyFileSync(enhBak, enhDst);
    fs.unlinkSync(enhBak);
    log('enhance.js 已恢复为原始版本');
  } else {
    log('enhance.js.bak 不存在，跳过');
  }

  // 恢复 extension.js
  var extBak = path.join(extDir, 'extension.js.bak');
  var extDst = path.join(extDir, 'extension.js');
  if (fs.existsSync(extBak)) {
    fs.copyFileSync(extBak, extDst);
    fs.unlinkSync(extBak);
    log('extension.js 已恢复为原始版本');
  } else {
    log('extension.js.bak 不存在，跳过');
  }

  console.log('');
  console.log('=== 卸载完成！请 Reload Window 使其生效 ===');
}

main();
