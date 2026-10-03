# project-learning

superpowersで開発したプロジェクトを、初学者向けの学習教材に変換するClaude Codeスキルです。

設計書・計画書・実装コードを読み、「なぜこのコードになったのか」を段階的に説明する学習ドキュメント(Markdown + HTML)を`docs/learning/`に生成します。AIに開発を任せても、設計と実装の意図をあなた自身が理解できる状態を作ります。

## インストール

```bash
npx skills add hiromu1018ks/project-learning
```

このコマンドは、GitHubからこのスキルをダウンロードして、お使いのClaude Codeで使える状態にします(npmの実行にはNode.jsが必要です)。

## 使い方

superpowersによる設計 → 計画 → 実装が完了したプロジェクトで、次のように言います。

```
このプロジェクトを学習教材にして
```

続きを書いてほしいときは、次のように言います。

```
前回に続き学習したい
```

スキルが自動で起動し、流れは次のとおりです。

1. `LEARNING_STATE.md`(進捗記録)の確認
2. `docs/superpowers/` 配下の設計書・計画書と実装コードの発見
3. 執筆テーマの提案と確認
4. 初学者向け教材のMarkdown執筆
5. 同梱スクリプトによるHTMLと一覧ページ(index.html)の生成
6. 進捗記録の更新

## 出力物

```
LEARNING_STATE.md      学習の進捗記録(どこまで教材化したか)
docs/learning/
├── 01-xxxx.md         教材の元原稿(手で編集するのはこちら)
├── 01-xxxx.html       変換スクリプトが生成(毎回全再生成される)
└── index.html         教材一覧ページ(自動生成、ブラウザで開くと読める)
```

## 必要なもの

- [Claude Code](https://claude.com/claude-code)(superpowersプラグイン推奨)
- Node.js 18以上(HTML変換スクリプトの実行に使用)

## 教材の方針

- 読者は、プログラミング経験がほぼゼロの初学者を想定する
- 専門用語は、初出時に必ず平易な定義を併記する
- 例え話は使わず、テキスト図と表で構造を視覚的に示す
- コードは3〜10行の断片に分け、直後に説明を添える
- 1枚で1テーマを扱う(1つの設計書と、その計画・実装のセット)

## 構成

```
project-learning/          ← スキル本体(npx skills add でインストールされる部分)
├── SKILL.md               ← スキルの手順書
├── scripts/build-html.mjs ← md → html 変換スクリプト
└── assets/
    ├── marked.esm.js      ← Markdown 変換エンジン(marked v18, MIT)
    ├── marked-LICENSE.txt
    └── style.css          ← 教材ページのデザイン
```

## ライセンス

MIT License。同梱している[marked](https://github.com/markedjs/marked)はMITライセンスで、`assets/marked-LICENSE.txt`に原文を保持しています。
