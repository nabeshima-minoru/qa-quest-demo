// QA Quest — 幕マップ生成
// 3 列 × N 行のノードグラフ。最上段がボス。

import { BALANCE } from '@/lib/constants';
import type { ActMap, MapNode, NodeKind } from '@/types';

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 行ごとのノード種別を決める */
function pickKind(row: number, rows: number, used: { rest: number; study: number }): NodeKind {
  // 最初の行は必ず戦闘
  if (row === 0) return 'battle';
  // ボス直前の行は休憩を出しやすく
  const isPreBoss = row === rows - 1;
  const roll = Math.random();
  if (isPreBoss) {
    if (roll < 0.45 && used.rest < 2) {
      used.rest++;
      return 'rest';
    }
    return roll < 0.75 ? 'battle' : 'event';
  }
  // 中盤
  if (row >= 2 && roll < 0.14) return 'elite';
  if (roll < 0.32) return 'event';
  if (roll < 0.46 && used.study < 2) {
    used.study++;
    return 'study';
  }
  if (roll < 0.56 && used.rest < 2) {
    used.rest++;
    return 'rest';
  }
  return 'battle';
}

export function generateActMap(act: number): ActMap {
  const rows = BALANCE.ACT_ROWS[act - 1] ?? 6;
  const nodes: MapNode[] = [];
  const used = { rest: 0, study: 0 };

  // 各行のアクティブな列（2〜3個）
  const rowCols: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const count = Math.random() < 0.55 ? 2 : 3;
    const cols = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, count).sort((a, b) => a - b);
    rowCols.push(cols);
  }

  // ノード生成
  for (let r = 0; r < rows; r++) {
    for (const c of rowCols[r]) {
      nodes.push({
        id: `a${act}-r${r}-c${c}`,
        row: r,
        col: c,
        kind: pickKind(r, rows, used),
        next: [],
      });
    }
  }

  // 1幕につき強敵を最低1つ保証（中盤の戦闘ノードを1つ変換）
  if (!nodes.some((n) => n.kind === 'elite')) {
    const mid = nodes.filter((n) => n.kind === 'battle' && n.row >= 2 && n.row <= rows - 2);
    if (mid.length > 0) rand(mid).kind = 'elite';
  }

  // ボス行
  const bossId = `a${act}-boss`;
  nodes.push({ id: bossId, row: rows, col: 1, kind: 'boss', next: [] });

  // エッジ：row r の各ノード → row r+1 の |col 差|<=1 のノード（最低1）
  for (let r = 0; r < rows; r++) {
    const cur = nodes.filter((n) => n.row === r);
    const nextRow = r === rows - 1 ? [nodes.find((n) => n.id === bossId)!] : nodes.filter((n) => n.row === r + 1);
    for (const n of cur) {
      const reach = nextRow.filter((m) => Math.abs(m.col - n.col) <= 1);
      n.next = (reach.length > 0 ? reach : [nextRow[0]]).map((m) => m.id);
    }
    // 次行の各ノードに最低1本の流入を保証
    for (const m of nextRow) {
      if (!cur.some((n) => n.next.includes(m.id))) {
        const nearest = [...cur].sort(
          (a, b) => Math.abs(a.col - m.col) - Math.abs(b.col - m.col)
        )[0];
        if (nearest) nearest.next.push(m.id);
      }
    }
  }

  return { act, rows: rows + 1, nodes };
}

/** スタート時に選べるノード（row 0 のすべて） */
export function startNodes(map: ActMap): MapNode[] {
  return map.nodes.filter((n) => n.row === 0);
}

export function findNode(map: ActMap, id: string): MapNode | undefined {
  return map.nodes.find((n) => n.id === id);
}
