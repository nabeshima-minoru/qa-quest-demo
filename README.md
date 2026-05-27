# QA Quest — 社内デモ版

ソフトウェアテスター育成シミュレーションゲーム「QA Quest」のフロント完結デモ実装です。
`docs/claude_code_implementation_brief.md` の指示書に基づいて構築されています。

## 概要

- **50 ターン** のターン制シミュレーション
- **40 イベント**（案件・学習・トラブル・交流・隠し）からランダム抽選
- **JSTQB Foundation 級**のサンプル問題（12 問）
- ロール昇格：テスター → テストリーダー → テストマネージャー → コンサルタント → 部長 → 社長
- 採用スコア（S / A / B / C / D ランク）算出
- localStorage で進行保存、リロード後も再開可能

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS 3 + CSS カスタムプロパティ |
| 状態管理 | Zustand |
| 永続化 | localStorage（バックエンド不要） |
| デプロイ | Vercel |

## セットアップ

```bash
npm install
npm run dev          # → http://localhost:3000
```

## ビルド

```bash
npm run build
npm start            # production サーバー
```

ビルド済み：全 9 ルートが静的生成され、First Load JS ≦ 114KB。

## ディレクトリ

```
qa-quest-demo/
├── app/
│   ├── page.tsx              # タイトル画面
│   ├── route-select/         # ルート選択
│   ├── game/                 # メインゲーム + 昇格モーダル
│   ├── quiz/                 # JSTQB 問題
│   ├── score/                # スコア結果
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── game/                 # CharacterPanel / EventCard / ChoiceList / ActionLog
│   ├── quiz/                 # QuizCard / QuizTimer
│   ├── score/                # SkillRadar
│   └── common/               # BaseButton / BaseProgressBar
├── data/
│   ├── events.ts             # 40 イベント
│   ├── questions.ts          # JSTQB 12 問
│   └── routes.ts             # 6 キャリアルート
├── lib/
│   ├── gameStore.ts          # Zustand ストア
│   ├── gameLogic.ts          # ターン処理・スコア計算
│   ├── constants.ts          # BALANCE 定数
│   └── storage.ts            # localStorage ラッパー
├── styles/
│   └── tokens.css            # デザイントークン（モック由来）
└── types/
    └── index.ts              # 型定義
```

## Vercel へのデプロイ

### 方法 A: GitHub 連携（推奨）

1. リポジトリを GitHub に push
2. [Vercel ダッシュボード](https://vercel.com/new) で Import
3. デフォルト設定のまま Deploy（環境変数なし）
4. `main` への push で自動再デプロイ

### 方法 B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel deploy           # プレビュー環境
vercel --prod           # 本番公開
```

環境変数は不要です（完全にクライアント完結）。

## ゲームフロー

```
タイトル (/)
   ↓ 「ゲームを始める」または「続きから再開」
ルート選択 (/route-select)
   ↓ 6 つから 1 つ選んで「このルートで始める」
メインゲーム (/game)
   ↓ 各ターンで A〜D を選択 → 「決定する」
   ↓ EVT-016 / EVT-023 では JSTQB クイズへ
JSTQB クイズ (/quiz)   ←→  メインゲーム
   ↓ 50 ターン経過
スコア結果 (/score)
   ↓ S / A / B / C / D ランク + スキルレーダー
```

## バランス調整値の出所

すべての数値は `docs/balance_tuning.md` 第 6 章に準拠：

| 項目 | 値 |
|---|---|
| 最大ターン | 50 |
| 初期所持金 | ¥30,000 |
| 初期ステータス | tech 25 / comm 25 / analysis 25 / mgmt 15 / ai 15 |
| EXP 曲線 | `100 × Lv^1.8` |
| ターン終了ボーナス | +10 EXP |
| 最適解ボーナス | +30 EXP |
| スコア重み | jstqb 0.25 / bug 0.30 / choice 0.25 / role 0.20 |
| ランク境界 | S≥90 / A≥80 / B≥70 / C≥58 / D<58 |

イベントマスター由来の数値は元値の **60%** に縮小済み（指示書 6.1 節）。

## 関連ドキュメント（`../docs/`）

- `claude_code_implementation_brief.md` — 本実装の指示書
- `balance_tuning.md` — バランス数値の出所
- `event_master_data.md` — 40 イベント全文
- `qa_quest_game_mock.html` — ビジュアルリファレンス
- `frontend_spec.md` / `backend_spec.md` — 設計参考

## スコープ外（実装していないもの）

- バックエンド API / DB
- ユーザー認証
- 採用担当ダッシュボード
- バグ仕込みアプリとの統合
- AI API 連携
