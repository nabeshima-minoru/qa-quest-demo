import type { Question } from '@/types';

// JSTQB Foundation Level シラバスに沿ったサンプル問題
// デモ用に 12 問用意。実運用時にはより広範な問題プールを想定。
export const questions: Question[] = [
  {
    id: 'Q-001',
    category: 'テスト設計技法',
    difficulty: 2,
    questionText:
      '同値分割法（Equivalence Partitioning）に関する説明として、最も適切なものを選んでください。',
    choices: [
      { key: 'A', text: '入力データを有効・無効のクラスに分割し、各クラスから代表値を 1 つテストする技法' },
      { key: 'B', text: '境界値付近のデータに対して集中的にテストを行う技法' },
      { key: 'C', text: '状態遷移図を用いて遷移ごとにテストを設計する技法' },
      { key: 'D', text: 'デシジョンテーブルを使用してビジネスルールを網羅する技法' },
    ],
    correctAnswer: 'A',
    explanation:
      '同値分割法は入力を同等に扱えるクラスに分割し、各クラスから代表 1 件をテストします。B は境界値分析、C は状態遷移テスト、D はデシジョンテーブルテストの説明です。',
    jstqbSyllabus: '4.2.1',
    timeLimitSec: 60,
  },
  {
    id: 'Q-002',
    category: 'テスト設計技法',
    difficulty: 2,
    questionText:
      '0 以上 100 以下の整数を受け付ける入力欄に対する境界値分析として、最も適切な値のセットはどれか。',
    choices: [
      { key: 'A', text: '0, 50, 100' },
      { key: 'B', text: '-1, 0, 100, 101' },
      { key: 'C', text: '0, 1, 99, 100' },
      { key: 'D', text: '-1, 0, 1, 99, 100, 101' },
    ],
    correctAnswer: 'D',
    explanation:
      '2 値境界値分析の標準は「境界の内外」を含めることです。下限は -1/0、上限は 100/101 が必須で、1 と 99 も「すぐ内側」として一般的に含めます。',
    jstqbSyllabus: '4.2.2',
    timeLimitSec: 60,
  },
  {
    id: 'Q-003',
    category: 'テストプロセス',
    difficulty: 1,
    questionText: 'テスト活動の順序として最も適切なものを選んでください。',
    choices: [
      { key: 'A', text: 'テスト分析 → テスト設計 → テスト実装 → テスト実行' },
      { key: 'B', text: 'テスト設計 → テスト分析 → テスト実行 → テスト実装' },
      { key: 'C', text: 'テスト実装 → テスト設計 → テスト分析 → テスト実行' },
      { key: 'D', text: 'テスト実行 → テスト分析 → テスト設計 → テスト実装' },
    ],
    correctAnswer: 'A',
    explanation:
      'JSTQB FL シラバスではテスト活動は「計画 → モニタリング/コントロール → 分析 → 設計 → 実装 → 実行 → 完了」の順で示されます。',
    jstqbSyllabus: '1.4',
    timeLimitSec: 45,
  },
  {
    id: 'Q-004',
    category: 'テストレベル',
    difficulty: 2,
    questionText: '結合テスト（Integration Testing）の主な目的として最も適切なものはどれか。',
    choices: [
      { key: 'A', text: '個々のモジュールの動作を単独で確認する' },
      { key: 'B', text: 'コンポーネント間のインターフェース・相互作用に欠陥がないことを確認する' },
      { key: 'C', text: 'システム全体がビジネス要求を満たすことを利害関係者と確認する' },
      { key: 'D', text: '本番環境でユーザー受入による合格判定を行う' },
    ],
    correctAnswer: 'B',
    explanation:
      '結合テストはコンポーネント／システム間のインターフェース・データフローに焦点を当てます。A はコンポーネントテスト、C はシステムテスト、D は受入テストです。',
    jstqbSyllabus: '2.2.2',
    timeLimitSec: 60,
  },
  {
    id: 'Q-005',
    category: 'テスト技法',
    difficulty: 3,
    questionText:
      '次のシステム動作を最も簡潔に表現できるテスト技法はどれか。「年齢が 18 歳以上 かつ 会員ランクが Gold の場合は 20% 割引、それ以外で会員ランクが Silver の場合は 10% 割引、上記以外は割引なし」',
    choices: [
      { key: 'A', text: '境界値分析' },
      { key: 'B', text: '状態遷移テスト' },
      { key: 'C', text: 'デシジョンテーブルテスト' },
      { key: 'D', text: 'ユースケーステスト' },
    ],
    correctAnswer: 'C',
    explanation:
      '複数条件の組み合わせでアクション（割引率）が決まる場合、デシジョンテーブルが最も適しています。',
    jstqbSyllabus: '4.3.3',
    timeLimitSec: 75,
  },
  {
    id: 'Q-006',
    category: 'テスト原則',
    difficulty: 1,
    questionText: 'JSTQB が掲げる「テストの 7 原則」に含まれない記述はどれか。',
    choices: [
      { key: 'A', text: 'テストは欠陥があることは示せるが、欠陥がないことは証明できない' },
      { key: 'B', text: '全数テストは不可能である' },
      { key: 'C', text: '早期テストで時間とコストを節約できる' },
      { key: 'D', text: '自動テストですべての手動テストを置き換えるべきである' },
    ],
    correctAnswer: 'D',
    explanation:
      'D は 7 原則に含まれません。自動化は手段であり、すべての手動テストを置き換えるべきという原則はありません。',
    jstqbSyllabus: '1.3',
    timeLimitSec: 45,
  },
  {
    id: 'Q-007',
    category: 'テストタイプ',
    difficulty: 2,
    questionText:
      '機能要件・非機能要件・ホワイトボックス・変更関連という分類は、何に基づくものか。',
    choices: [
      { key: 'A', text: 'テストレベル' },
      { key: 'B', text: 'テストタイプ' },
      { key: 'C', text: 'テスト活動' },
      { key: 'D', text: 'テスト技法のカテゴリ' },
    ],
    correctAnswer: 'B',
    explanation:
      'JSTQB FL ではテストタイプを「機能、非機能、ホワイトボックス、変更関連（確認テスト・リグレッションテスト）」に分類します。',
    jstqbSyllabus: '2.3',
    timeLimitSec: 50,
  },
  {
    id: 'Q-008',
    category: '静的テスト',
    difficulty: 2,
    questionText: 'レビューの種類のうち、最も形式的（フォーマル）なものはどれか。',
    choices: [
      { key: 'A', text: '非公式レビュー（Informal Review）' },
      { key: 'B', text: 'ウォークスルー（Walkthrough）' },
      { key: 'C', text: 'テクニカルレビュー（Technical Review）' },
      { key: 'D', text: 'インスペクション（Inspection）' },
    ],
    correctAnswer: 'D',
    explanation:
      'インスペクションは事前準備・役割定義・記録など最も形式的なレビュー手法です。',
    jstqbSyllabus: '3.2.2',
    timeLimitSec: 45,
  },
  {
    id: 'Q-009',
    category: 'テスト管理',
    difficulty: 3,
    questionText: 'リスクベースドテストにおいて、最も優先してテストすべき領域はどれか。',
    choices: [
      { key: 'A', text: '影響度が低く、発生確率も低い領域' },
      { key: 'B', text: '影響度が高いが、発生確率が低い領域' },
      { key: 'C', text: '影響度が低いが、発生確率が高い領域' },
      { key: 'D', text: '影響度・発生確率がともに高い領域' },
    ],
    correctAnswer: 'D',
    explanation:
      'リスク = 影響度 × 発生確率。両方が高い領域がリスクレベル最大で、テストの優先度も最も高くなります。',
    jstqbSyllabus: '5.2.3',
    timeLimitSec: 50,
  },
  {
    id: 'Q-010',
    category: 'テスト技法',
    difficulty: 2,
    questionText: 'ホワイトボックステストの命令網羅（Statement Coverage）100% を達成しても保証されないものはどれか。',
    choices: [
      { key: 'A', text: 'すべての命令が少なくとも 1 回実行された' },
      { key: 'B', text: 'すべての分岐（if の真偽両方）がテストされた' },
      { key: 'C', text: 'プログラム中の到達可能な行が呼ばれた' },
      { key: 'D', text: 'カバレッジツールで実行されたコード行が記録された' },
    ],
    correctAnswer: 'B',
    explanation:
      '命令網羅 100% でも、if 文の真偽両方を通った保証はありません。分岐カバレッジ達成のためにはディシジョンカバレッジが必要です。',
    jstqbSyllabus: '4.4.1',
    timeLimitSec: 60,
  },
  {
    id: 'Q-011',
    category: 'インシデント管理',
    difficulty: 2,
    questionText:
      'バグ報告に必須の要素として、最も重要度の低いものはどれか。',
    choices: [
      { key: 'A', text: '再現手順' },
      { key: 'B', text: '期待結果と実際の結果' },
      { key: 'C', text: '発見者の所属部署とメールアドレス' },
      { key: 'D', text: '影響範囲・優先度の見立て' },
    ],
    correctAnswer: 'C',
    explanation:
      '所属やメールはトラッキング情報としてあれば良いですが、欠陥の修正そのものには A・B・D の方が圧倒的に重要です。',
    jstqbSyllabus: '5.6',
    timeLimitSec: 45,
  },
  {
    id: 'Q-012',
    category: 'アジャイルとテスト',
    difficulty: 3,
    questionText:
      'アジャイル開発におけるテスター（Quality Assistance / 品質支援）の役割として、最も適切なものはどれか。',
    choices: [
      { key: 'A', text: '開発の最後に独立した工程としてテストを実施する' },
      { key: 'B', text: '開発チームに参画し、要件・設計段階から早期にテスト観点を提供する' },
      { key: 'C', text: 'すべてのテストを自動化し手動テストを廃止する' },
      { key: 'D', text: 'バグを発見したら開発を一旦停止させる' },
    ],
    correctAnswer: 'B',
    explanation:
      'アジャイルではテスターは「品質を保証する番人」ではなく「品質を支援するチームの一員」として、早期から関与することが重視されます。',
    jstqbSyllabus: 'AT 1.1',
    timeLimitSec: 60,
  },
];

export function pickRandomQuestions(count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
