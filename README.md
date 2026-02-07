<p align="center">
  <img src="assets/logo.png" alt="Claude Prompt Enhance" width="120" />
</p>

<h1 align="center">Claude Prompt Enhance</h1>

<p align="center">
  <strong>为 Claude Code VSCode 插件注入 Prompt 优化超能力</strong>
</p>

<p align="center">
  <a href="#-核心特性">特性</a> •
  <a href="#-优化原理">原理</a> •
  <a href="#-效果展示">效果</a> •
  <a href="#-快速开始">安装</a> •
  <a href="#-使用指南">使用</a> •
  <a href="#-贡献指南">贡献</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/VSCode-1.80+-purple?style=flat-square&logo=visual-studio-code" alt="VSCode" />
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/license-MIT-orange?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/providers-23+-red?style=flat-square" alt="Providers" />
</p>

---

## 这是什么？

**Claude Prompt Enhance** 是一个轻量级补丁工具，为 [Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) VSCode 插件添加一键 Prompt 优化功能。

写 Prompt 不够精准？一键优化，让 AI 更懂你的意图。

支持接入 **23 种主流 AI 供应商**，使用你自己的 API Key，自由选择模型。安装只需双击一个文件。
**因为当时augment的一键提示词的功能对我的后坐力很大，所以想自己开发一个Claude使用的，当前只适配插件款，未来能适配更多。**
参考augment的一键优化提示词的样子，然后自己开发了一个出来，主要是为了提高开发的效率，感兴趣的可以运行试试。
数据均使用本地数据，安全性可靠的。
---

## ✨ 核心特性

### 🔌  API 供应商自由切换
内置 Anthropic、OpenAI、Google  等 23 种供应商，每个供应商预置对应模型列表，一键切换，但需要自己使用密钥。

### ⚡ 一键 Prompt 优化
在输入框旁点击星星图标，自动将你的 Prompt 重写为结构清晰、表达精准的专业版本。支持中英文输出。

### ⚙️ 可视化设置面板
齿轮图标一键打开中文设置面板，配置供应商、模型、API Key、自定义端点、输出语言，所有设置自动持久化。

---
---

## 🧠 优化原理

### 它是怎么工作的？

当你点击星星图标时，插件不是简单地把你的文字发给 AI，而是 **自动收集当前的上下文信息**，构建一个完整的优化请求：

```
你的原始 Prompt
      ↓
┌─────────────────────────────────┐
│  + 最近的对话历史（前几轮对话）    |
│  + 阅读当前项目的Claude.md文件    |
│  + 当前打开的文件名               │
│  + 编辑器中选中的代码片段          │                  │
│  + 输出语言偏好                   │
└─────────────────────────────────┘
      ↓
   AI 模型重写优化
      ↓
  结构清晰、表达精准的专业 Prompt
```

---

## 📸 效果展示

<img src="README.assets\image-20260207171705352.png" alt="image-20260207171705352" style="zoom:50%;" />

### 一键优化 Prompt
> 点击星星图标，Prompt 自动优化为专业版本

![image-20260207155001405](README.assets/image-20260207155001405.png)

![image-20260207155041685](README.assets/image-20260207155041685.png)

![image-20260207155305561](README.assets/image-20260207155305561.png)

### 设置面板
> 齿轮图标打开可视化设置，配置供应商和模型,（✨ 未配置将使用Claude默认的api）

<img src="README.assets/image-20260207154905242.png" alt="image-20260207154905242" style="zoom: 67%;" />

### 动画效果
> 优化结果逐字填入，柔和蓝绿渐变效果，能增强体验感

![image-20260207155251954](README.assets/image-20260207155251954.png)

---

## 🚀 快速开始

### 前置条件

- [VSCode](https://code.visualstudio.com/) 已安装
- [Claude Code 插件](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) 已安装
- [Node.js](https://nodejs.org/) 16+ 已安装

### 安装

**方法一：双击安装（推荐）**

```
1. 下载本项目
2. 双击 install.bat
3. VSCode 中 Ctrl+Shift+P → Developer: Reload Window
4. 完成！
```

**方法二：命令行安装**

```bash
git clone https://github.com/qqlzyhello/claude-prompt-enhance.git
cd claude-prompt-enhance
node install.js
```

然后在 VSCode 中 `Ctrl+Shift+P` → `Developer: Reload Window`。

### 卸载

```bash
node uninstall.js
# 或双击 uninstall.bat
```

---

## 📖 使用指南

### 基本流程

1. 在 Claude Code 输入框中输入你的 Prompt
2. 点击输入框旁的 **⭐ 星星图标** → 开始优化
3. 优化结果以打字机效果逐字填入输入框
4. 生成中再次点击星星可 **取消**，保留已生成内容

### 设置面板

点击 **⚙️ 齿轮图标** 打开设置面板：

| 选项 | 说明 |
|------|------|
| API 供应商 | 选择供应商后自动加载对应模型列表 |
| 模型 | 从预置列表选择或手动输入 |
| API Key | 填入你的 API 密钥 |
| 自定义端点 | 可选，用于代理或私有部署 |
| 输出语言 | 中文 / English |

所有设置自动保存，重启 VSCode 后依然生效。


---

## 🤝 贡献指南

欢迎贡献代码！以下是参与方式：

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 **Pull Request**

### 贡献方向

- 🌍 添加更多 API 供应商和模型
- 🖥️ macOS / Linux 兼容性测试
- 🌐 更多语言支持（日语、韩语等）
- 🎨 UI/UX 改进
- 📝 文档完善

---

## ⭐ Star History

如果这个项目对你有帮助，请给一个 Star ⭐ 支持一下！

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源，都可以随意使用进行二开。

---

<p align="center">
  <sub>Made with ❤️ for the Claude Code community</sub>
</p>
