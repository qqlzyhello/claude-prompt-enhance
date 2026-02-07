async _handleEnhancePrompt(j, webview) {
  this.output.info("[Enhance] Starting prompt enhancement");

  try {
    var userInput = j.text || "";
    var context = j.conversationContext || [];
    var language = j.language || "english";
    var customApi = j.customApi || null;

    // ---- Conversation context ----
    var contextStr = "";
    if (context.length > 0) {
      contextStr = "\n\nConversation context:\n" + context.map(function(m) {
        return m.role + ": " + m.text;
      }).join("\n");
    }

    // ---- Current editor selection ----
    var selInfo = "";
    try {
      var editor = F0.window.activeTextEditor;
      if (editor) {
        var doc = editor.document;
        selInfo = "\nCurrent file: " + doc.fileName;
        if (!editor.selection.isEmpty) {
          selInfo += "\nSelected code: " + doc.getText(editor.selection).substring(0, 500);
        }
      }
    } catch (e) {}

    // ---- Workspace / project info ----
    var wsInfo = "";
    var claudeMdContent = "";
    var projectSkillsInfo = "";

    try {
      var folders = F0.workspace.workspaceFolders;
      if (folders && folders.length > 0) {
        wsInfo = "\nProject: " + folders[0].name;

        var _fs = require("fs");
        var _path = require("path");
        var wsRoot = folders[0].uri.fsPath;

        // Read CLAUDE.md
        var claudeMdPaths = [
          "CLAUDE.md", "claude.md",
          ".claude/CLAUDE.md", ".claude/claude.md"
        ];
        for (var _ci = 0; _ci < claudeMdPaths.length; _ci++) {
          var _cp = _path.join(wsRoot, claudeMdPaths[_ci]);
          if (_fs.existsSync(_cp)) {
            try {
              var _raw = _fs.readFileSync(_cp, "utf8").substring(0, 2000);
              claudeMdContent = "\n\nProject CLAUDE.md (project instructions & conventions):\n" + _raw;
            } catch (e2) {}
            break;
          }
        }

        // Read skills/tasks
        var skillsPaths = [".claude/skills", ".claude/tasks", "skills", "tasks"];
        for (var _si = 0; _si < skillsPaths.length; _si++) {
          var _sp = _path.join(wsRoot, skillsPaths[_si]);
          if (_fs.existsSync(_sp)) {
            try {
              var _files = _fs.readdirSync(_sp).filter(function(f) {
                return f.endsWith(".md") || f.endsWith(".txt") || f.endsWith(".json");
              }).slice(0, 5);

              if (_files.length > 0) {
                projectSkillsInfo = "\n\nProject skills/tasks (" + skillsPaths[_si] + "): " + _files.join(", ");
                var _first = _path.join(_sp, _files[0]);
                if (_fs.existsSync(_first)) {
                  projectSkillsInfo += "\nFirst skill content preview:\n" +
                    _fs.readFileSync(_first, "utf8").substring(0, 500);
                }
              }
            } catch (e3) {}
            break;
          }
        }
      }
    } catch (e) {}

    // ---- Language instruction ----
    var langInstruction = language === "chinese"
      ? "\n\nIMPORTANT: You MUST write the entire enhanced prompt in Chinese (Simplified Chinese). The output must be entirely in Chinese."
      : "\n\nIMPORTANT: You MUST write the entire enhanced prompt in English. The output must be entirely in English.";

    // ---- Build the enhance prompt ----
    var enhancePrompt = "Here is an instruction that I'd like to give you, but it needs to be improved. "
      + "Rewrite and enhance this instruction to make it clearer, more specific, less ambiguous, and correct any mistakes. "
      + "Do not use any tools: reply immediately with your answer, even if you're not sure. "
      + "Consider the context of our conversation history, the project CLAUDE.md conventions, "
      + "project skills/tasks definitions, current file context, and the overall project background when enhancing the prompt. "
      + "Ensure the enhanced prompt is tightly relevant to the user input and project context. "
      + "Add project-specific best practices or additional information if appropriate. "
      + "If there is code in triple backticks (```) consider whether it is a code sample and should remain unchanged."
      + langInstruction + contextStr + selInfo + wsInfo + claudeMdContent + projectSkillsInfo
      + "\n\nReply with the following format:\n\n"
      + "### BEGIN RESPONSE ###\n"
      + "Here is an enhanced version of the original instruction that is more specific and clear:\n"
      + "<augment-enhanced-prompt>enhanced prompt goes here</augment-enhanced-prompt>\n\n"
      + "### END RESPONSE ###\n\n"
      + "Here is my original instruction:\n\n" + userInput;

    // ---- Custom API path ----
    if (customApi) {
      this._sendCustomApiRequest(customApi, enhancePrompt, webview);
    } else {
      this._sendClaudeBinaryRequest(enhancePrompt, webview);
    }

  } catch (err) {
    webview.postMessage({
      type: "enhance_prompt_result",
      error: err.message || "Unknown error"
    });
  }
}

_sendCustomApiRequest(customApi, enhancePrompt, webview) {
  if (!customApi.apiKey) {
    webview.postMessage({
      type: "enhance_prompt_result",
      error: "API Key is empty. Please set your API Key in the Enhance Settings panel (gear icon)."
    });
    return;
  }

  this.output.info("[Enhance] Using custom API provider: " + customApi.provider);

  var https = require("https");
  var http = require("http");
  var baseUrl = customApi.baseUrl || "https://api.openai.com/v1";
  var model = customApi.model || "gpt-4o";
  var isAnthropic = customApi.provider === "anthropic";

  var endpoint = isAnthropic
    ? baseUrl.replace(/\/+$/, "") + "/v1/messages"
    : baseUrl.replace(/\/+$/, "") + "/chat/completions";
  var parsedUrl = new (require("url").URL)(endpoint);

  // Build request body
  var postData;
  if (isAnthropic) {
    postData = JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [{ role: "user", content: enhancePrompt }]
    });
  } else {
    postData = JSON.stringify({
      model: model,
      messages: [{ role: "user", content: enhancePrompt }],
      max_tokens: 4096
    });
  }

  // Build headers
  var headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData)
  };
  if (isAnthropic) {
    headers["x-api-key"] = customApi.apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = "Bearer " + customApi.apiKey;
  }

  var reqModule = parsedUrl.protocol === "https:" ? https : http;

  var req = reqModule.request({
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: "POST",
    headers: headers
  }, function(res) {
    var body = "";
    res.on("data", function(chunk) { body += chunk.toString(); });
    res.on("end", function() {
      try {
        var json = JSON.parse(body);
        var enhanced = "";

        if (isAnthropic) {
          if (json.content && json.content[0]) {
            enhanced = json.content[0].text || "";
          }
        } else {
          if (json.choices && json.choices[0]) {
            enhanced = json.choices[0].message?.content || "";
          }
        }

        // Extract tagged content
        var tagMatch = enhanced.match(/<augment-enhanced-prompt>([\s\S]*?)<\/augment-enhanced-prompt>/);
        if (tagMatch && tagMatch[1]) {
          enhanced = tagMatch[1].trim();
        } else if (enhanced.trim()) {
          enhanced = enhanced.trim();
        }

        if (enhanced) {
          webview.postMessage({ type: "enhance_prompt_result", enhancedText: enhanced });
        } else {
          webview.postMessage({
            type: "enhance_prompt_result",
            error: json.error?.message || "No enhanced text returned"
          });
        }
      } catch (parseErr) {
        webview.postMessage({
          type: "enhance_prompt_result",
          error: "Failed to parse API response: " + parseErr.message
        });
      }
    });
  });

  req.on("error", function(err) {
    webview.postMessage({
      type: "enhance_prompt_result",
      error: "Custom API request failed: " + err.message
    });
  });

  req.write(postData);
  req.end();
}

_sendClaudeBinaryRequest(enhancePrompt, webview) {
  var cp = require("child_process");
  var claudePath = this._findClaudeBinary();
  this.output.info("[Enhance] Using claude binary: " + claudePath);

  var args = ["--print", "--output-format", "text"];
  var proc = cp.spawn(claudePath, args, {
    env: { ...process.env },
    stdio: ["pipe", "pipe", "pipe"]
  });

  proc.stdin.write(enhancePrompt);
  proc.stdin.end();

  var stdout = "";
  var stderr = "";
  proc.stdout.on("data", function(d) { stdout += d.toString(); });
  proc.stderr.on("data", function(d) { stderr += d.toString(); });

  proc.on("close", function(code) {
    console.log("[Enhance] claude exited code=" + code + " stdout_len=" + stdout.length);

    var enhanced = "";
    var match = stdout.match(/<augment-enhanced-prompt>([\s\S]*?)<\/augment-enhanced-prompt>/);
    if (match && match[1]) {
      enhanced = match[1].trim();
    } else if (stdout.trim()) {
      enhanced = stdout.trim();
    }

    if (enhanced) {
      webview.postMessage({ type: "enhance_prompt_result", enhancedText: enhanced });
    } else {
      webview.postMessage({
        type: "enhance_prompt_result",
        error: stderr || "No enhanced text returned"
      });
    }
  });

  proc.on("error", function(err) {
    webview.postMessage({
      type: "enhance_prompt_result",
      error: err.message
    });
  });
}

_findClaudeBinary() {
  let p = require("path");
  let fs = require("fs");
  let ext = process.platform === "win32" ? "claude.exe" : "claude";
  let arch = process.arch;
  let plat = process.platform;

  let candidates = [
    p.join(this.context.extensionPath, "resources", "native-binaries", plat + "-" + arch, ext),
    p.join(this.context.extensionPath, "resources", "native-binary", ext)
  ];

  if (plat === "win32" && arch === "arm64") {
    candidates.splice(1, 0,
      p.join(this.context.extensionPath, "resources", "native-binaries", "win32-x64", ext)
    );
  }

  for (let c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return ext;
}
