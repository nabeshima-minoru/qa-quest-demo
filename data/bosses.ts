// 4 BOSS 定義 — Turn 10/20/30/40 で各 1 体登場
// HP は 3 フェーズで「最適3連→撃破」「optimal2 + good1 でも撃破」程度のバランス

import type { Boss } from '@/types';

export const bosses: Boss[] = [
  /*──────────────────────────────────────
    BOSS 1: 開発リーダー（Turn 10）
    技術自慢・テスト軽視タイプ
  ──────────────────────────────────────*/
  {
    id: 'BOSS-DEV-LEAD',
    archetype: 'dev_lead',
    name: '大木 拓海',
    title: '開発リーダー',
    milestone: 10,
    maxHp: 100,
    themeColor: '#4F6675', // slate
    intro:
      'お前がテスター見習いか。俺の書いたコードに難癖つけにきたんだろ？\n軽く相手してやるよ。',
    victory:
      'チッ……まあ、認めてやる。次の現場でも遠慮なくバグを叩きつけてこい。',
    escape:
      'お前のレベルじゃ俺には届かない。出直してこい。',
    phases: [
      {
        demand:
          'このバグは仕様だ。修正の必要なし。\nそもそも、ユーザーがこんな使い方しないだろ？',
        choices: [
          {
            key: 'A',
            text: 'すみません、では仕様ということでクローズします',
            damage: 0,
            reaction: 'チョロいな。次のチケットも頼んだぞ。',
            quality: 'poor',
          },
          {
            key: 'B',
            text: '仕様書のどこに記載があるか、一緒に確認させてください',
            damage: 35,
            reaction: 'うっ……まあ、書いてないかもな。',
            quality: 'good',
          },
          {
            key: 'C',
            text: 'ユーザー視点で再現手順をまとめました。録画もあります',
            damage: 50,
            reaction: 'おい、待て。それは……反論できんな。',
            quality: 'optimal',
          },
          {
            key: 'D',
            text: '他のチームに聞いて判断してきます',
            damage: 15,
            reaction: '時間稼ぎか？ま、好きにしろ。',
            quality: 'average',
          },
        ],
      },
      {
        demand:
          '俺はユニットテストをしっかり書いてる。\n結合段階でわざわざテストする意味あるのか？',
        choices: [
          {
            key: 'A',
            text: '統合ポイントでしか出ないパターンを共有します',
            damage: 50,
            reaction: 'ぐっ……たしかにそこは盲点だった。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text: 'ユニットだけではカバーできない領域があります',
            damage: 35,
            reaction: '……理屈はわかる。',
            quality: 'good',
          },
          {
            key: 'C',
            text: '自動テストを増やしましょう、私が書きます',
            damage: 20,
            reaction: '勝手にやってろ。俺は次のスプリント忙しいんだ。',
            quality: 'average',
          },
          {
            key: 'D',
            text: 'では信じます。テストは省略しましょう',
            damage: 0,
            reaction: 'よし、話のわかる奴は嫌いじゃないぜ。',
            quality: 'poor',
          },
        ],
      },
      {
        demand:
          'リリース日が動かせない。\nテスト全部終わらせるとか、現実見えてるか？',
        choices: [
          {
            key: 'A',
            text: 'リスクを表にし、責任者を交えて優先度判断します',
            damage: 55,
            reaction: 'チッ、合理的すぎる。ぐうの音も出ないわ。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text: 'クリティカル領域に絞って優先テストします',
            damage: 35,
            reaction: 'まあ、現場感覚あるじゃねぇか。',
            quality: 'good',
          },
          {
            key: 'C',
            text: '私の責任で延期を提案します',
            damage: 25,
            reaction: '責任を引き取る覚悟は買ってやる。',
            quality: 'average',
          },
          {
            key: 'D',
            text: 'はい、テストはこのままで出しましょう',
            damage: 0,
            reaction: '物分かりがいいな！それでこそ仕事仲間だ。',
            quality: 'poor',
          },
        ],
      },
    ],
  },

  /*──────────────────────────────────────
    BOSS 2: バックエンド責任者（Turn 20）
    昔気質・厳格タイプ
  ──────────────────────────────────────*/
  {
    id: 'BOSS-BE-LEAD',
    archetype: 'backend_lead',
    name: '黒田 修一',
    title: 'バックエンド責任者',
    milestone: 20,
    maxHp: 120,
    themeColor: '#8E5638', // terracotta
    intro:
      '君がテストリーダー候補か。\n昔と違って若い世代は緩いな。\n少し品質基準について話そう。',
    victory:
      'ふむ……俺の時代より、君の世代の方が筋がいいかもしれん。任せたぞ。',
    escape:
      'まだ早いな。基礎から鍛え直して、また来い。',
    phases: [
      {
        demand:
          'テスト計画書？俺は読まんよ。\n口頭で 30 秒、要点を述べてみろ。',
        choices: [
          {
            key: 'A',
            text:
              '対象範囲、リスク、撤退条件、3 点を 30 秒で述べます',
            damage: 60,
            reaction: '……合格点だ。よく要約した。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text: '全機能のテスト方針を丁寧に説明します',
            damage: 25,
            reaction: '長い。30 秒と言ったはずだ。',
            quality: 'average',
          },
          {
            key: 'C',
            text: '計画書を後でメールします',
            damage: 10,
            reaction: '人の話を聞いていたか？',
            quality: 'poor',
          },
          {
            key: 'D',
            text: '責任者の判断に従います',
            damage: 30,
            reaction: '自分の意見は持っているか？まだ甘いな。',
            quality: 'good',
          },
        ],
      },
      {
        demand:
          '性能テストの基準、これで足りるのか？\n君の数字、根拠が見えん。',
        choices: [
          {
            key: 'A',
            text:
              '顧客の SLA 要件と過去障害分析から導きました。資料あります',
            damage: 60,
            reaction: '根拠が明確だな。よろしい。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text: '業界平均から類推した値です',
            damage: 30,
            reaction: '自社固有の事情を考えろ。',
            quality: 'average',
          },
          {
            key: 'C',
            text: 'もう一度測り直します',
            damage: 25,
            reaction: 'やり直しは時間の無駄だ。',
            quality: 'good',
          },
          {
            key: 'D',
            text: '開発者に確認してから決めます',
            damage: 10,
            reaction: '丸投げか？それは責任者の仕事じゃない。',
            quality: 'poor',
          },
        ],
      },
      {
        demand:
          '万が一、本番障害が起きたら誰が責任を取る？\n君のチームのことだぞ。',
        choices: [
          {
            key: 'A',
            text:
              '私です。事前にリスクを開示し、判断責任は明確にしてあります',
            damage: 60,
            reaction: 'ふっ……覚悟があるな。それでこそリーダーだ。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text: 'チーム全員で分担します',
            damage: 35,
            reaction: 'チームを守るのもいいが、最後は誰かが決めなきゃならん。',
            quality: 'good',
          },
          {
            key: 'C',
            text: 'プロセスに従っていれば誰の責任でもありません',
            damage: 15,
            reaction: '逃げ口上を覚えたか？',
            quality: 'average',
          },
          {
            key: 'D',
            text: '上司が決めることです',
            damage: 0,
            reaction: '残念だが、君に任せる仕事はないな。',
            quality: 'poor',
          },
        ],
      },
    ],
  },

  /*──────────────────────────────────────
    BOSS 3: プロダクトマネージャー（Turn 30）
    ビジネス価値重視タイプ
  ──────────────────────────────────────*/
  {
    id: 'BOSS-PM',
    archetype: 'product_mgr',
    name: '林 美咲',
    title: 'プロダクトマネージャー',
    milestone: 30,
    maxHp: 140,
    themeColor: '#76496A', // wine plum
    intro:
      'テスト工数をそんなに取って、ビジネス価値はどう説明するの？\nROI で語ってもらえると助かるんだけど。',
    victory:
      '……正直、説得力ある。あなたのチームに投資する価値がありそう。',
    escape:
      'うーん、まだ経営層に持ち上げられる材料には足りないわね。',
    phases: [
      {
        demand:
          'リリース日に半分しか機能テストできていない。\n間に合うように、もう少しだけ妥協してくれない？',
        choices: [
          {
            key: 'A',
            text:
              '主要機能のリスク分析を共有します。3 機能の延期で済むはずです',
            damage: 65,
            reaction: '具体的な選択肢を出されると、議論しやすい。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text:
              '優先度の低い 2 機能を次バージョンに送る提案をします',
            damage: 45,
            reaction: '建設的ね。それなら経営層も納得しやすい。',
            quality: 'good',
          },
          {
            key: 'C',
            text: '深夜まで残業して間に合わせます',
            damage: 15,
            reaction: '気合いは尊いけど、それサステナブル？',
            quality: 'average',
          },
          {
            key: 'D',
            text: 'はい、テストは省略で大丈夫です',
            damage: 0,
            reaction: '本当に？……あとで責任問題にならない？',
            quality: 'poor',
          },
        ],
      },
      {
        demand:
          'バグレポート、技術用語が多すぎ。\n経営層に説明できるか不安。',
        choices: [
          {
            key: 'A',
            text:
              '顧客影響と推定損失額の 1 枚サマリを別途用意します',
            damage: 65,
            reaction: 'それよ、それ！すぐ役員報告に使える。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text:
              '専門用語を平易な日本語に置き換えた版を作ります',
            damage: 40,
            reaction: '助かる。少なくとも私は理解できる。',
            quality: 'good',
          },
          {
            key: 'C',
            text: 'PM 経由で意訳して伝えてもらえると助かります',
            damage: 20,
            reaction: 'そこは私の仕事じゃない。あなたの言葉で伝えて。',
            quality: 'average',
          },
          {
            key: 'D',
            text:
              '専門用語は変えられません。理解してもらうしかありません',
            damage: 5,
            reaction: 'うちはエンジニア向けプロダクトじゃないのよ……',
            quality: 'poor',
          },
        ],
      },
      {
        demand:
          'テスト自動化の予算を出すとして、何ヶ月で元が取れる？',
        choices: [
          {
            key: 'A',
            text:
              '回帰テスト工数の試算で 8 ヶ月で回収、その後年間 400 万削減です',
            damage: 70,
            reaction: '数字で語れる QA は希少よ。決裁通すわ。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text:
              '半年から 1 年で回収する見込みです。試算表あります',
            damage: 45,
            reaction: '稟議に使える資料ね。ありがとう。',
            quality: 'good',
          },
          {
            key: 'C',
            text:
              '導入してみないとわかりませんが、長期的にはプラスです',
            damage: 20,
            reaction: 'うちは長期賭けする余裕、そんなにないのよね……',
            quality: 'average',
          },
          {
            key: 'D',
            text: '回収できなくても、品質のためには必要です',
            damage: 5,
            reaction: '気持ちはわかる。けど私にも上長がいてね。',
            quality: 'poor',
          },
        ],
      },
    ],
  },

  /*──────────────────────────────────────
    BOSS 4: CTO（Turn 40）— ラスボス級
    戦略・組織論で詰めてくる
  ──────────────────────────────────────*/
  {
    id: 'BOSS-CTO',
    archetype: 'cto',
    name: '神崎 大輔',
    title: '最高技術責任者',
    milestone: 40,
    maxHp: 180,
    themeColor: '#9C4040', // bengara accent
    intro:
      '君を呼んだのは他でもない。\n来期、QA 組織を任せられる人材か、見極めさせてもらう。\n覚悟はできているな？',
    victory:
      'よろしい。新生 QA 部、君に任せる。期待しているぞ。',
    escape:
      '……惜しいな。あと一段、視座を上げて出直してこい。',
    phases: [
      {
        demand:
          '生成 AI でテストの大半は自動化できる。\nもう人間のテスターは不要だと思うが、君の見解は？',
        choices: [
          {
            key: 'A',
            text:
              '生成 AI は強力ですが、要件解釈と判断責任は人間に残ります。両者の役割設計を提案します',
            damage: 75,
            reaction: 'ふむ。冷静な現実認識だ。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text:
              '反復テストは AI に、探索的テストは人間に分担すべきです',
            damage: 50,
            reaction: '実務的だな。',
            quality: 'good',
          },
          {
            key: 'C',
            text: '完全自動化はまだ難しいと思います',
            damage: 25,
            reaction: '「思う」では経営判断に使えない。',
            quality: 'average',
          },
          {
            key: 'D',
            text: 'はい、テスターはもう要らないと思います',
            damage: 0,
            reaction: '……自分の職務を否定するのか。それは違うだろう。',
            quality: 'poor',
          },
        ],
      },
      {
        demand:
          'QA 部門の人員を半減させる案が経営会議で出ている。\n君が私を説得する立場ならどうする？',
        choices: [
          {
            key: 'A',
            text:
              '過去 3 年の障害コスト推移と QA 工数の相関データで反証します',
            damage: 80,
            reaction: 'データを持ち出すか。経営は数字で動く。正解だ。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text:
              '半減した場合のリスクシナリオを 3 つ提示します',
            damage: 55,
            reaction: '建設的だな。判断材料を与えてくれる。',
            quality: 'good',
          },
          {
            key: 'C',
            text: '現場の声を集めて訴えます',
            damage: 25,
            reaction: '情熱は伝わるが、経営層は感情では動かない。',
            quality: 'average',
          },
          {
            key: 'D',
            text: '残念ですが、経営判断には従います',
            damage: 5,
            reaction: '専門職の長としては失格だな。',
            quality: 'poor',
          },
        ],
      },
      {
        demand:
          '最後の質問だ。\n君が QA 組織を率いるとして、5 年後にどんな組織にしたい？',
        choices: [
          {
            key: 'A',
            text:
              '事業判断に品質視点を持ち込む「品質経営」の中核組織にしたい。具体策があります',
            damage: 85,
            reaction: 'その視座、待っていた。任せられる。',
            quality: 'optimal',
          },
          {
            key: 'B',
            text:
              '開発と QA の境界を溶かし、品質を全員の責任にする組織にします',
            damage: 60,
            reaction: 'シフトレフトの本質を理解しているな。',
            quality: 'good',
          },
          {
            key: 'C',
            text: '今より効率的にテストを回せる組織にしたいです',
            damage: 25,
            reaction: '戦術はわかった。戦略はあるか？',
            quality: 'average',
          },
          {
            key: 'D',
            text: 'まだそこまでは考えていません',
            damage: 0,
            reaction: '残念だ。5 年後の絵が描けない者には任せられん。',
            quality: 'poor',
          },
        ],
      },
    ],
  },
];

/** マイルストーン番号から該当ボスを取得 */
export function findBossByMilestone(milestone: number): Boss | null {
  return bosses.find((b) => b.milestone === milestone) ?? null;
}

/** ID から該当ボスを取得 */
export function findBossById(id: string): Boss | null {
  return bosses.find((b) => b.id === id) ?? null;
}
