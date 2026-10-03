// build-html.mjs のテスト
// 使い方: node tests/test-build-html.mjs
// サンプルの Markdown を変換して、期待どおりの HTML が出力されるかを確認する。

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SCRIPT = new URL("../project-learning/scripts/build-html.mjs", import.meta.url).pathname;

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// --- 準備: サンプル教材を tmp ディレクトリに作る ---
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "pl-test-"));
const learningDir = path.join(workDir, "docs", "learning");
fs.mkdirSync(learningDir, { recursive: true });

fs.writeFileSync(
  path.join(learningDir, "01-sample.md"),
  `---
title: サンプル機能の教科書
date: 2026-10-03
---

# サンプル機能の教科書

これはテスト用の文章です。

## 使い方

- 箇条書きのテスト
- 二つ目の項目

\`\`\`js
console.log("こんにちは");
\`\`\`

| 用語 | 意味 |
|---|---|
| リポジトリ | 変更履歴つきの保管場所 |

[前の回へ](02-second.md)
`,
);

fs.writeFileSync(
  path.join(learningDir, "02-second.md"),
  `# 二つ目の教材

frontmatter がない場合のテスト用です。
`,
);

// 孤立した古い html(対応する md が存在しない)→ 再生成時に削除されるべき
fs.writeFileSync(path.join(learningDir, "99-orphan.html"), "<p>古いゴミ</p>");

// --- 実行 ---
const result = spawnSync("node", [SCRIPT, learningDir], { encoding: "utf8" });

console.log("— 実行結果 —");
check("スクリプトが正常終了する", result.status === 0, result.stderr);
check("日本語の完了メッセージを出す", /生成|件/.test(result.stdout), result.stdout);

const html1 = fs.readFileSync(path.join(learningDir, "01-sample.html"), "utf8");
const html2 = fs.readFileSync(path.join(learningDir, "02-second.html"), "utf8");
const index = fs.readFileSync(path.join(learningDir, "index.html"), "utf8");

console.log("— 各ファイルの内容 —");
check("md から同名の html が生成される", html1.length > 0 && html2.length > 0);
check("frontmatter が本文に混み出ない", !html1.includes("title: サンプル機能の教科書"));
check("frontmatter の title が <title> に使われる", html1.includes("<title>サンプル機能の教科書</title>"));
check("frontmatter がない場合は最初の見出しを title にする", html2.includes("<title>二つ目の教材</title>"));
check("CSS が html 内に埋め込まれる", html1.includes("<style>") && html1.includes("body"));
check("見出しが変換される", html1.includes("<h2") && html1.includes("使い方</h2>"));
check("コードブロックが変換される", html1.includes("<code>") || html1.includes("<pre>"));
check("表が変換される", html1.includes("<table>"));
check("md への相対リンクが html に書き換わる", html1.includes('href="02-second.html"') && !html1.includes("02-second.md"));
check("孤立した古い html が削除される", !fs.existsSync(path.join(learningDir, "99-orphan.html")));
check("index.html が生成される", index.length > 0);
check("index が両教材へのリンクを持つ", index.includes("01-sample.html") && index.includes("02-second.html"));
check("index が title を一覧表示する", index.includes("サンプル機能の教科書") && index.includes("二つ目の教材"));
check("index が日付を表示する", index.includes("2026-10-03"));
check("index にも CSS が埋め込まれる", index.includes("<style>"));

// --- エラーケース: 引数なしで実行(デフォルト docs/learning を探してNotFound) ---
const learningDirArg = path.join(workDir, "empty");
fs.mkdirSync(learningDirArg, { recursive: true });
const result2 = spawnSync("node", [SCRIPT, learningDirArg], { encoding: "utf8" });
console.log("— md が無い場合 —");
check("md が無くても正常終了する", result2.status === 0, result2.stderr);
check("対象がない旨を日本語で報告する", /見つかりません|ありません/.test(result2.stdout), result2.stdout);

console.log(`\n結果: ${passed} 合格 / ${failed} 不合格`);
fs.rmSync(workDir, { recursive: true, force: true });
process.exit(failed > 0 ? 1 : 0);
