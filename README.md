# project-learning

superpowers で開発したプロジェクトを、初学者向けの学習教材に変換する Claude Code スキルです。

設計書・計画書・実装コードを読み、「なぜこのコードになったのか」を段階的に説明する
学習ドキュメント(Markdown + HTML)を `docs/learning/` に生成します。
AI に開発を任せても、あなた自身が設計と実装の意図を理解できる状態を作ります。

## インストール

```bash
npx skills add hiromu1018ks/project-learning
```

このコマンドは、GitHub からこのスキルをダウンロードして、お使いの Claude Code で
使える状態にします(npm の実行には Node.js が必要です)。

## 使い方

superpowers による設計 → 計画 → 実装が完了したプロジェクトで、次のように言います。

```
このプロジェクトを学習教材にして
```

あるいは学習を続けたいとき:

```
前回に続き学習したい
```

スキルが自動で起動し、次の流れで進めます。

1. `LEARNING_STATE.md`(進捗記録)の確認
2. `docs/superpowers/` 配下の設計書・計画書と実装コードの発見
3. 執筆テーマの提案と確認
4. 初学者向け教材の Markdown 執筆
5. 同梱スクリプトによる HTML と一覧ページ(index.html)の生成
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

- [Claude Code](https://claude.com/claude-code)(superpowers プラグイン推奨)
- Node.js 18 以上(HTML 変換スクリプトの実行に使用)

## 教材の方針

- 読者は「プログラミング経験ほぼゼロの初学者」を想定
- 専門用語は初出時に必ず平易な定義を併記
- 例え話は使わず、テキスト図と表で構造を視覚的に示す
- コードは 3〜10 行の断片に分け、直後に説明を添える
- 1 枚 = 1 テーマ(1 つの設計書と、その計画・実装のセット)

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

MIT License。同梱している [marked](https://github.com/markedjs/marked) は MIT ライセンスで、
`assets/marked-LICENSE.txt` に原文を保持しています。
