#!/usr/bin/env node
// project-learning スキル同梱の Markdown → HTML 変換スクリプト。
// 使い方: node build-html.mjs [対象ディレクトリ](省略時は docs/learning)
//
// 対象ディレクトリ内のすべての .md を変換し、同名の .html と
// 一覧ページ index.html を生成する。html は常に全再生成とする
// (Markdown が「元原稿」、html は「派生物」のため、古い html は残らない)。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "../assets/marked.esm.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(here, "..", "assets", "style.css"), "utf8");

const targetDir = process.argv[2] || "docs/learning";

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`エラー: ディレクトリが見つかりません: ${targetDir}`);
  process.exit(1);
}

// HTML の特殊文字を無害化する(見出しの文字がタグとして解釈されるのを防ぐ)
function esc(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlPage(title, bodyHtml, extraHeader = "") {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
${css}
</style>
</head>
<body>
<main>
${extraHeader}
${bodyHtml}
</main>
</body>
</html>
`;
}

// 1 つの md を読み、タイトル・日付・本文に整理する
function parseDoc(file) {
  const raw = fs.readFileSync(path.join(targetDir, file), "utf8");
  let body = raw;
  let title = "";
  let date = "";

  // frontmatter(冒頭の --- で囲まれた設定ブロック)があれば読み取って本文からは除外
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fm) {
    body = raw.slice(fm[0].length);
    const t = fm[1].match(/^title:\s*(.+)$/m);
    const d = fm[1].match(/^date:\s*(.+)$/m);
    if (t) title = t[1].trim();
    if (d) date = d[1].trim();
  }

  // タイトルがなければ最初の「# 見出し」、なければファイル名
  if (!title) {
    const h = body.match(/^#\s+(.+)$/m);
    title = h ? h[1].trim() : file.replace(/\.md$/, "");
  }

  // 日付がなければファイルの最終更新日
  if (!date) {
    const st = fs.statSync(path.join(targetDir, file));
    date = st.mtime.toISOString().slice(0, 10);
  }

  return { file, title, date, body };
}

// --- 前処理: 既存の .html をすべて削除(派生物の全再生成) ---
for (const f of fs.readdirSync(targetDir)) {
  if (f.endsWith(".html")) {
    fs.unlinkSync(path.join(targetDir, f));
  }
}

const mdFiles = fs
  .readdirSync(targetDir)
  .filter((f) => f.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (mdFiles.length === 0) {
  console.log("変換できる Markdown ファイルが見つかりませんでした。");
  process.exit(0);
}

// --- 変換 ---
const docs = [];
const errors = [];

for (const f of mdFiles) {
  try {
    const doc = parseDoc(f);
    let content = marked.parse(doc.body, { gfm: true });
    // 教材間の相対リンク(〜.md)を 〜.html に書き換え、ブラウザで飛べるようにする
    content = content.replace(/href="([^"]+?)\.md"/g, 'href="$1.html"');
    const header = `<div class="pl-meta">執筆日: ${esc(doc.date)}</div>`;
    fs.writeFileSync(
      path.join(targetDir, f.replace(/\.md$/, ".html")),
      htmlPage(doc.title, `<h1>${esc(doc.title)}</h1>\n${header}\n${content}`),
    );
    docs.push(doc);
  } catch (err) {
    errors.push(`${f}: ${err.message}`);
  }
}

// --- 一覧ページ ---
const items = docs
  .map(
    (d) =>
      `      <li><a href="${d.file.replace(/\.md$/, ".html")}">${esc(d.title)}</a><span class="pl-date">${esc(d.date)}</span></li>`,
  )
  .join("\n");

fs.writeFileSync(
  path.join(targetDir, "index.html"),
  htmlPage(
    "学習ドキュメント 一覧",
    `<h1>学習ドキュメント 一覧</h1>
<p>このプロジェクトで学んだ内容をまとめた教材の一覧です。上から順に読むことをおすすめします。</p>
<ul class="pl-index-list">
${items}
      </ul>`,
  ),
);

console.log(`${docs.length} 件の Markdown を変換し、HTML と一覧ページ(index.html)を生成しました。`);
if (errors.length > 0) {
  console.log("変換できなかったファイル:");
  for (const e of errors) console.log(`  - ${e}`);
}
