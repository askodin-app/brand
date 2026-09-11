// ─────────────────────────────────────────────────────────────────────────────
// Osaka executive brief (JA) — the two-page leave-behind.
//
// The document an Investment Director forwards to their MD, CRO or General
// Counsel after a meeting. It is written to survive being read by someone who
// was not in the room and has no reason to be generous.
//
//   dark   — the iPad hand-over. Hardened Slate, the house face.
//   light  — the 稟議 copy. A ringi document gets PRINTED and circulated, and
//            full-bleed #111119 across A4 on a mono office laser is grey mud
//            plus a toner complaint from the person you most want on side.
//            Same source, same grid, inverted palette.
//
// A4 landscape, 297x210mm. Everything is drawn in millimetres: the SVG is
// `width="297mm" viewBox="0 0 297 210"` so one user unit is one millimetre.
//
// All text is outlined to <path>, as on the meishi — a Japanese reader's
// machine never has to have our fonts, and nothing can substitute Yu Gothic for
// Noto behind our backs.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Every Japanese string below is lifted from askodin-coming-soon/src/pages/ja/
// index.astro, which is the vetted surface, or from src/data/entity.ts. It is
// not translated fresh here. The first draft of this brief was written free-hand
// and reintroduced four claims that scripts/check-compliance-lexicon.mjs bans in
// Japanese — a training 保証, a 30-day 完全消去, 「完全準拠」 against a voluntary
// guideline, and ハルシネーションを排除 — plus the retired Visa/Moody's triad and
// a founder bio that promoted "led APAC engineering at a company Microsoft
// acquired" into "founded it and sold it to Microsoft".
//
// If you edit a string here, edit /ja first and copy it across. The guard runs
// on that repo, not this one.
// ─────────────────────────────────────────────────────────────────────────────

import opentype from 'opentype.js';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './output/decks';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Brand ────────────────────────────────────────────────────────────────────
const ORANGE = '#DB4A2B';
const GREEN  = '#147B58';
const DARK   = '#111119';
const SURFACE= '#1A1A2E';
const CARD   = '#1E293B';
const WHITE  = '#FFFFFF';
const MUTED  = '#8899AA';
const BORDER = '#E2E8F0';
const PAPER  = '#F7F8FA';

// Two themes over one grid. `dim` is body text one step below the headline
// register; on white it is Dark Card rather than an invented mid-grey, so every
// value in both themes is a token from CLAUDE.md.
const THEMES = {
  dark:  { key: 'dark',  use: 'screen',  bg: DARK,  panel: SURFACE, card: CARD,  ink: WHITE,  dim: MUTED,   hair: 'rgba(255,255,255,0.14)', rule: 'rgba(255,255,255,0.09)' },
  light: { key: 'light', use: 'print', bg: WHITE, panel: PAPER,   card: PAPER, ink: DARK,   dim: CARD,    hair: BORDER,                   rule: '#EDF1F5' },
};

// ── Geometry (mm) ────────────────────────────────────────────────────────────
const PAGE_W = 297, PAGE_H = 210;
const M = 15;                                  // page margin
const COL_W = PAGE_W - M * 2;                  // 267mm live width
const PT = 25.4 / 72;
const pt = (n) => n * PT;

// ── Fonts ────────────────────────────────────────────────────────────────────
const F = {
  light:    opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  regular:  opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf'),
  medium:   opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  semibold: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono:     opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  jp:       opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
  jpBold:   opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
};
const FACE_NAME = new Map(Object.entries(F).map(([k, f]) => [f, k]));

const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

function faceFor(ch, font, jpFont) {
  const f = jpFont && isJP(ch) ? jpFont : font;
  if (f.charToGlyphIndex(ch) === 0) {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    throw new Error(`No glyph for "${ch}" (U+${cp}) in F.${FACE_NAME.get(f) ?? '?'}`);
  }
  return f;
}

/** Outline a string, setting Latin runs in the Latin face. */
function text(str, x, y, size, { font, jpFont = null, fill, tracking = 0, opacity = 1 }) {
  const parts = [];
  let cursor = x;
  for (const ch of str) {
    const f = faceFor(ch, font, jpFont);
    const d = f.getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm) + tracking * size;
  }
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '';
}

function widthOf(str, size, { font, jpFont = null, tracking = 0 }) {
  let w = 0;
  for (const ch of str) {
    const f = faceFor(ch, font, jpFont);
    w += f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm) + tracking * size;
  }
  return w - (str.length ? tracking * size : 0);
}

// Japanese has no spaces, so a Latin word-wrapper cannot break it — but a
// per-character wrapper breaks Latin mid-word, and the first render of this
// brief split "Clarity Score" across a line as "Cla / rity Score" inside NORN.
//
// So: tokenise first. A run of Latin letters and digits (plus the punctuation
// that sits INSIDE such a run — "63/948,559", "0-100", "SOC 2") is one
// unbreakable token; every Japanese character is its own. Then wrap tokens.
//
// Two kinsoku rules on top, the two that actually show at this size: a line
// never STARTS with closing punctuation, and never ENDS with opening. Closing
// marks are allowed to hang past the measure (burasage) rather than being
// pushed down, which is what a Japanese compositor does.
const NO_START = new Set([...'、。，．）」』】〉》・？！ー～〜%）：；']);
const NO_END   = new Set([...'（「『【〈《']);
const LATIN      = /[A-Za-z0-9]/;
const LATIN_JOIN = /[.,/'&+:%\u2013-]/;

function tokenize(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let t = str[i];
    if (LATIN.test(t)) {
      while (i + 1 < str.length) {
        const n = str[i + 1];
        if (LATIN.test(n)) { t += n; i++; continue; }
        // Joining punctuation only counts as internal if Latin follows it.
        if (LATIN_JOIN.test(n) && LATIN.test(str[i + 2] ?? '')) { t += n; i++; continue; }
        break;
      }
    }
    out.push(t);
  }
  return out;
}

function wrapJP(str, maxW, opts) {
  const toks = tokenize(str);
  const lines = [];
  let line = '';
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (line && widthOf(line + t, opts.size, opts) > maxW) {
      let carry = '';
      while (line && NO_END.has(line[line.length - 1])) {
        carry = line.slice(-1) + carry;
        line = line.slice(0, -1);
      }
      lines.push(line);
      line = carry + t;
    } else {
      line += t;
    }
    while (i + 1 < toks.length && toks[i + 1].length === 1 && NO_START.has(toks[i + 1])) {
      line += toks[i + 1];
      i++;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Wrapped paragraph. Returns the SVG and the y after the last line. */
function para(str, x, y, maxW, { size, lead, font, jpFont, fill, opacity = 1 }) {
  const opts = { size, font, jpFont };
  const lines = wrapJP(str, maxW, opts);
  const el = lines.map((l, i) => text(l, x, y + i * lead, size, { font, jpFont, fill, opacity }));
  return { svg: el.join(''), end: y + (lines.length - 1) * lead, lines: lines.length };
}

const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}"${extra}/>`;
const line = (x1, y1, x2, y2, stroke, w = 0.2) =>
  `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="${w}"/>`;

/** askOdin wordmark, split orange/green like the master lockup. */
function wordmark(x, y, size) {
  const askW = widthOf('ask', size, { font: F.semibold });
  return text('ask', x, y, size, { font: F.semibold, fill: ORANGE })
       + text('Odin', x + askW, y, size, { font: F.semibold, fill: GREEN });
}

// Small mono section label with a leading accent tick.
function sectionLabel(str, x, y, T, accent = GREEN) {
  return rect(x, y - pt(5.2), 1.1, pt(5.2), accent)
       + text(str, x + 3, y, pt(7.5), { font: F.mono, jpFont: F.jpMedium, fill: T.dim, tracking: 0.10 });
}

// ═════════════════════════════════════════════════════════════════════════════
// COPY — see the provenance note in the file header. /ja is upstream of this.
//
// EVERY rendered string lives here. coverage() walks this object and nothing
// else, so a string inlined at its call site skips the glyph check and reaches
// the renderer as a throw — or, if the font happens to carry it, as copy no one
// reviewed. Page 2's masthead was inlined exactly that way and did.
// ═════════════════════════════════════════════════════════════════════════════
const C = {
  // trustBadges, /ja:84. 「参画」 is the vetted verb — not 招聘.
  barLeft:  'askOdin Pte. Ltd.（シンガポール法人）　|　ソニー Boundary Spanning Service 参画',
  // 「仮」 is load-bearing: these are provisionals, and a patent-literate
  // General Counsel reads 特許出願中 as a non-provisional filing.
  barRight: '米国仮特許出願 4件　·　IPOS §34 クリア　·　AI事業者ガイドラインの考え方に沿った設計',
  barLeft2: 'askOdin Pte. Ltd.　|　ガバナンス・導入モデル・経営体制',

  h1a: '未公開市場のための',
  h1b: 'AI判断インフラ™',
  h1en: 'AI JUDGMENT INFRASTRUCTURE FOR PRIVATE MARKETS',

  subA: 'LLMは、説得力を最適化する。',
  subB: 'askOdinは、事業の物理法則でコンパイルする。',
  subEn: 'LLMs optimize for persuasion. askOdin compiles for physics.',

  introLabel: '基本概要',
  intro1: 'askOdin（アスクオーディン）は、ピッチ資料、財務モデル、デューデリジェンス資料の間にある論理の矛盾を、決定論的（Deterministic）に監査する基盤です。',
  intro2: '同じ資料からは、毎回同じ判定が出ます。すべての指摘事項は、データルーム内の根拠箇所（ページやセル）まで遡ることができます。投資委員会（IC）の前に、判断の「説明可能性」と「検証可能性」を。',

  // Replaces the Visa / Moody's triad, which /ja:19 lists as retired: "the
  // standards ledger below makes the same argument in the approved shape".
  // These are other domains' standards used as analogy — not our certifications.
  ledgerLabel: '他分野の標準　—　askOdin自身の認証ではありません',
  ledger: [
    { fn: '財務報告',           std: '日本基準 · IFRS' },
    { fn: '監査',               std: '監査基準' },
    { fn: 'コンプライアンス',   std: '法令・規制の枠組み' },
    { fn: '情報セキュリティ',   std: 'ISMS · SOC 2' },
    { fn: '投資判断',           std: '—', gap: true },
  ],
  ledgerFoot: '投資判断にだけ、横断的に検証できる標準がありません。',

  enginesLabel: '投資判断の防衛線：Clarity と Crucible',
  engines: [
    {
      eyebrow: 'askOdin Clarity · 機関投資家向け',
      tone: GREEN,
      title: '投資委員会の前に、論理の破綻を特定する。',
      rows: [
        ['対象', 'VC、プライベート・エクイティ、CVC、金融機関、総合商社'],
        ['機能', 'データルーム内のピッチ資料（PDF・PPTX）と財務モデル（Excel）を突き合わせ、数値の食い違い、前提の歪み、論理の破綻を特定します。1件の監査は3分以内に完了します。'],
        ['出力', '判定（PRIORITY / INVESTIGATE / WATCH / PASS / FATAL）、0–100のClarity Score™、根拠トレース付きの監査記録 Defensible Audit Log™。'],
      ],
    },
    {
      eyebrow: 'askOdin Crucible · 創業者向け',
      tone: ORANGE,
      title: '投資家に指摘される前に、急所を直す。',
      rows: [
        ['対象', '資金調達を控えた創業者、大学発・研究開発型スタートアップ'],
        // Two deliberate departures from /ja, both register rather than substance:
        //   · /ja glosses this as 致命的な論点（Kill Shot）. The English slang reads
        //     as a pitch deck against the rest of this page. Dropped, not
        //     translated — "Fatal Invalidation" was proposed and is not a term
        //     the product uses; the verdict ladder is PRIORITY / INVESTIGATE /
        //     WATCH / PASS / FATAL and inventing a sixth name is how the last
        //     draft got into trouble.
        //   · 「無料で試せます」 is freemium register. 無償トライアル says the same
        //     thing — it is free — without reframing a self-serve tool as the
        //     paid pilot engagement described on page 2.
        ['機能', 'Clarityと同じ基準で、ピッチ資料と財務モデルを事前にストレステストします。投資家との面談の前に、致命的な論点を洗い出し、事前に対策できます。'],
        ['提供形態', '無償トライアル（英語・実機）。'],
      ],
    },
  ],

  // All four. The brief claimed four patents while showing three protocols —
  // a reviewer who counts will ask. Numbers from entity.ts.
  protoLabel: '中核アーキテクチャ　—　4つの特許出願中プロトコル',
  protocols: [
    { name: 'RUNE™',  role: '判断コンパイラ',                   no: 'U.S. Prov. 63/948,559',
      body: '構造化されていない事業ナラティブを、論理検証済みの依存関係グラフへコンパイルします。表現の巧みさは取り除かれ、中核となる事業上の主張が切り出され、その脆さが採点されます。' },
    { name: 'RAVEN™', role: '複数文書の三角検証',               no: 'U.S. Prov. 63/994,876',
      body: 'ピッチ資料の定性的な主張を、財務モデルの数値と照合します。食い違うデータは「矛盾」として提示され、黙って整合させることはありません。' },
    { name: 'NORN™',  role: 'ナラティブ・ドリフト検出',         no: 'U.S. Prov. 64/011,252',
      body: '時系列に並んだ資料の間で、プレゼンテーション評価とClarity Scoreの乖離（Narrative Inflation）を検出します。' },
    { name: 'JUDGE™', role: 'ランタイム・サーキットブレーカー', no: 'U.S. Prov. 64/017,488',
      body: '確率的なハルシネーションを実行時に検知し、遮断します。' },
  ],

  govLabel: 'ガバナンスとデータの取り扱い',
  gov: [
    {
      no: '01', ja: '説明可能性と検証可能性', en: 'Explainability & Verifiability',
      body: '判定は、確率的なサンプリングの結果ではなく、固定されたルールを実行した結果です。そのため同じ資料からは同じ判定が再現され、すべての指摘事項に、データルーム内の根拠箇所（ページ、セル）へのトレースが付きます。',
    },
    {
      no: '02', ja: 'データの取り扱い', en: 'Bounded Retention',
      // Do not soften this. A shorter, warmer version was proposed — stateless
      // processing, derived data 「厳格に管理されます」, the In Progress label
      // dropped — and every clause of it contradicts /security in English, which
      // is the page the same General Counsel opens next. The interim commitment
      // below is the answer to the hesitation that softening was meant to fix.
      body: 'お客様の書類が、AIモデルの学習に使われることはありません。資料からの情報抽出には、外部のモデルAPI（Google Gemini、有料プラン）を使用しています。原本書類の保持期間は最長30日です。これは文書化されたポリシーであり、この上限を自動で執行する仕組みは現在実装中です（SOC 2 Type I に合わせて提供予定）。それまでの間、削除はご要望に応じて実行します。判定結果などの派生データは、30日を超えて保持されます。',
    },
  ],
  // The guideline is 総務省・経済産業省 — not the FSA — and it has no
  // certification scheme, so 準拠 cannot be evidenced. /ja:267.
  govNote: '総務省・経済産業省の「AI事業者ガイドライン（第1.1版）」には、適合を認証する制度がありません。示せるのは、設計そのものと、その確かめ方です。',

  flowLabel: '投資・審査プロセスへの組み込み',
  flowNote: '既存の投資・審査オペレーションを変更することなく、意思決定の前段に置くことができます。',
  flow: [
    { n: '1', ja: '資料投入', en: 'Data Room', items: ['ピッチ資料（PDF・PPTX）', '財務モデル（Excel）', 'デューデリジェンス資料'] },
    { n: '2', ja: '決定論的監査', en: 'askOdin', items: ['定性仮説のグラフ構造化', '数値モデルとの突合検証', '矛盾点のフラグとレポート化'] },
    { n: '3', ja: '投資委員会', en: 'IC', items: ['論理の破綻を事前に特定', '監査記録に基づく説明', '客観的な説明責任'] },
  ],

  founderLabel: '経営体制',
  founderName: '陸 奕順',
  founderRoman: 'LOK Yek Soon / YS',
  founderTitle: '創業者 兼 代表取締役CEO',
  // /ja:456. He did not found Reciprocal and did not sell it to Microsoft —
  // he ran its APAC technical division, and Microsoft acquired the company.
  founderBio: [
    '25年にわたり、ネットワークとデジタル・クリアリング基盤の構築に携わる。SilkRoute（PCCWが買収）の初期のインターネット・エンジニアを経て、Reciprocal（Microsoftが買収）ではアジア太平洋地域の技術部門を統括。DRMクリアリング基盤と、Seybold賞を受賞した Reciprocal Storefront に携わる。',
    '2021年から2025年にかけて、20社以上のアーリーステージAIスタートアップにエンジェル投資。',
  ],

  gseLabel: 'Global Startup EXPO 2026 · Osaka',
  gseIntro: 'GSE 2026（大阪）期間中の個別面談・PoCのご相談を承ります。',
  poc: 'PoCの枠組み：既存ファンド・CVCの過去案件または進行中案件を用いたパイロット検証（2〜4週間）。貴社フォーマットに合わせたIC前サマリーの出力検証。',
  dates: [
    ['10月5日（月）',        '中之島 / 大阪イノベーションハブ'],
    ['10月6日（火）〜7日（水）', 'グラングリーン大阪 / JAM BASE'],
    ['10月8日（木）',        '梅田 / グランフロント大阪'],
  ],

  closing: 'ベンチャーキャピタルは、監査されていない最後の資産クラスです。askOdinは、その空白を埋めるインフラを提供します。',

  // PDF document properties — what a reader's title bar, a file manager column
  // and an email client's preview show. Not rendered on either page.
  metaTitle:    'askOdin｜未公開市場のためのAI判断インフラ　エグゼクティブ・サマリー',
  metaAuthor:   'askOdin Pte. Ltd.',
  metaSubject:  'VC・PE・CVC・金融機関向け。ピッチ資料、財務モデル、デューデリジェンス資料の間にある論理の矛盾を決定論的に監査するAI判断インフラ。',
  metaKeywords: 'askOdin, AI判断インフラ, AI Judgment Infrastructure, 投資委員会, デューデリジェンス, 決定論的監査, Clarity Score, RUNE, RAVEN, NORN, JUDGE, GSE 2026, 大阪',
  footL: 'askOdin Pte. Ltd.（シンガポール法人）',
  footC: '創業者直通 yeksoon@askodin.app　|　代表窓口 hi@askodin.app',
  footR: 'askodin.app/ja',
};

// ═════════════════════════════════════════════════════════════════════════════
// Page chrome
// ═════════════════════════════════════════════════════════════════════════════
function chrome(T, { barL, barR, pageNo, footer = null }) {
  const el = [];
  el.push(rect(0, 0, PAGE_W, PAGE_H, T.bg));
  el.push(rect(0, 0, PAGE_W, 1.6, ORANGE));                       // masthead rule
  el.push(text(barL, M, 11.4, pt(6.6), { font: F.regular, jpFont: F.jp, fill: T.dim }));
  const wR = widthOf(barR, pt(6.6), { font: F.regular, jpFont: F.jp });
  el.push(text(barR, PAGE_W - M - wR, 11.4, pt(6.6), { font: F.regular, jpFont: F.jp, fill: T.dim }));
  el.push(line(M, 14.6, PAGE_W - M, 14.6, T.hair, 0.25));
  // Footer. Page 2 opens the band up to carry the closing line and the contact
  // block — the two things a reader needs after the document leaves the room.
  const ruleY = footer ? PAGE_H - 14 : PAGE_H - 12.5;
  const markY = footer ? PAGE_H - 3.7 : PAGE_H - 7.6;
  el.push(line(M, ruleY, PAGE_W - M, ruleY, T.hair, 0.25));
  if (footer) {
    el.push(text(footer.closing, M, PAGE_H - 9.4, pt(8), { font: F.medium, jpFont: F.jpMedium, fill: T.ink }));
    const wc = widthOf(footer.contact, pt(6.8), { font: F.regular, jpFont: F.jp });
    el.push(text(footer.contact, PAGE_W - M - wc, PAGE_H - 9.4, pt(6.8), { font: F.regular, jpFont: F.jp, fill: GREEN }));
    const wu = widthOf(footer.url, pt(6.8), { font: F.mono, tracking: 0.06 });
    el.push(text(footer.entity, M + widthOf('askOdin', pt(9), { font: F.semibold }) + 5, markY, pt(6.8),
      { font: F.regular, jpFont: F.jp, fill: T.dim }));
    el.push(text(footer.url, PAGE_W - M - wu - 14, markY, pt(6.8), { font: F.mono, fill: T.dim, tracking: 0.06 }));
  }
  el.push(wordmark(M, markY, pt(9)));
  const pn = `${pageNo} / 2`;
  const wPn = widthOf(pn, pt(6.6), { font: F.mono, tracking: 0.08 });
  el.push(text(pn, PAGE_W - M - wPn, markY, pt(6.6), { font: F.mono, fill: T.dim, tracking: 0.08 }));
  return el;
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 1 — positioning and the two engines
// ═════════════════════════════════════════════════════════════════════════════
function page1(T) {
  const el = chrome(T, { barL: C.barLeft, barR: C.barRight, pageNo: 1 });

  // Headline
  el.push(text(C.h1a, M, 33, pt(30), { font: F.semibold, jpFont: F.jpBold, fill: T.ink }));
  el.push(text(C.h1b, M, 46.5, pt(30), { font: F.semibold, jpFont: F.jpBold, fill: T.ink }));
  el.push(text(C.h1en, M, 53.5, pt(6.6), { font: F.mono, fill: T.dim, tracking: 0.14 }));

  // Subhead — the positioning couplet
  el.push(text(C.subA, M, 68, pt(13), { font: F.regular, jpFont: F.jpMedium, fill: T.ink }));
  el.push(text(C.subB, M, 77.5, pt(13), { font: F.regular, jpFont: F.jpMedium, fill: T.ink }));
  el.push(text(C.subEn, M, 84, pt(6.6), { font: F.mono, fill: T.dim, tracking: 0.05 }));

  // Intro, left 62% — leaves the ledger a column of its own
  const introW = 158;
  el.push(sectionLabel(C.introLabel, M, 97, T));
  const p1 = para(C.intro1, M, 104, introW, { size: pt(8.4), lead: 5.0, font: F.regular, jpFont: F.jp, fill: T.ink });
  el.push(p1.svg);
  const p2 = para(C.intro2, M, p1.end + 7.5, introW, { size: pt(8.4), lead: 5.0, font: F.regular, jpFont: F.jp, fill: T.dim });
  el.push(p2.svg);

  // Standards ledger, right column
  const lx = M + introW + 12, lw = COL_W - introW - 12;
  el.push(sectionLabel(C.ledgerLabel, lx, 97, T, ORANGE));
  let ly = 103.5;
  for (const row of C.ledger) {
    const h = 7.6;
    if (row.gap) {
      el.push(rect(lx, ly, lw, h, T.key === 'dark' ? 'rgba(219,74,43,0.10)' : 'rgba(219,74,43,0.07)'));
      el.push(rect(lx, ly, 0.9, h, ORANGE));
    }
    el.push(text(row.fn, lx + 3.5, ly + 5.2, pt(8), { font: F.regular, jpFont: F.jpMedium, fill: row.gap ? ORANGE : T.ink }));
    const ws = widthOf(row.std, pt(8), { font: F.regular, jpFont: F.jp });
    el.push(text(row.std, lx + lw - 3.5 - ws, ly + 5.2, pt(8), { font: F.regular, jpFont: F.jp, fill: row.gap ? ORANGE : T.dim }));
    if (!row.gap) el.push(line(lx, ly + h, lx + lw, ly + h, T.rule, 0.2));
    ly += h;
  }
  const lf = para(C.ledgerFoot, lx, ly + 6, lw, { size: pt(7.4), lead: 4.4, font: F.regular, jpFont: F.jp, fill: ORANGE });
  el.push(lf.svg);

  // The two engines
  el.push(sectionLabel(C.enginesLabel, M, 144, T));
  const cw = (COL_W - 9) / 2, ch = 44;
  C.engines.forEach((eng, i) => {
    const x = M + i * (cw + 9), y = 149;
    el.push(rect(x, y, cw, ch, T.card, T.key === 'light' ? ` stroke="${BORDER}" stroke-width="0.25"` : ''));
    el.push(rect(x, y, cw, 0.9, eng.tone));
    el.push(text(eng.eyebrow, x + 5, y + 7.2, pt(7), { font: F.mono, jpFont: F.jpMedium, fill: eng.tone, tracking: 0.06 }));
    el.push(text(eng.title, x + 5, y + 14.2, pt(10.5), { font: F.semibold, jpFont: F.jpBold, fill: T.ink }));
    // The body column is set from the widest key in THIS card, not a fixed
    // inset: 対象/機能 are two characters and 提供形態 is four, and a hardcoded
    // 10mm left the latter touching its own text.
    const keyW = Math.max(...eng.rows.map(([k]) => widthOf(k, pt(6.8), { font: F.medium, jpFont: F.jpMedium })));
    const bodyX = x + 5 + keyW + 3;
    let ry = y + 20.5;
    for (const [k, v] of eng.rows) {
      el.push(text(k, x + 5, ry, pt(6.8), { font: F.medium, jpFont: F.jpMedium, fill: eng.tone }));
      const b = para(v, bodyX, ry, x + cw - 5 - bodyX, { size: pt(6.9), lead: 3.9, font: F.regular, jpFont: F.jp, fill: T.dim });
      el.push(b.svg);
      ry = b.end + 5.2;
    }
  });

  return el;
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 2 — architecture, governance, workflow, leadership, Osaka
// ═════════════════════════════════════════════════════════════════════════════
function page2(T) {
  const el = chrome(T, {
    barL: C.barLeft2, barR: C.barRight, pageNo: 2,
    footer: { closing: C.closing, contact: C.footC, entity: C.footL, url: C.footR },
  });

  // ── Protocols, four across ──
  el.push(sectionLabel(C.protoLabel, M, 24, T));
  const pw = (COL_W - 3 * 6) / 4, pY = 28.5, pBody = 17, pLead = 3.7;
  // The four bodies are different lengths, so the patent numbers sit on a
  // baseline derived from the TALLEST column rather than a guessed offset —
  // RUNE runs to four lines and had the number printing into its last one.
  const pMax = Math.max(...C.protocols.map(
    (p) => wrapJP(p.body, pw, { size: pt(6.6), font: F.regular, jpFont: F.jp }).length));
  const pNoY = pY + pBody + (pMax - 1) * pLead + 6.5;
  C.protocols.forEach((p, i) => {
    const x = M + i * (pw + 6), y = pY;
    el.push(line(x, y, x + pw, y, T.hair, 0.5));
    el.push(text(p.name, x, y + 6.2, pt(11), { font: F.semibold, fill: GREEN }));
    el.push(text(p.role, x, y + 11.4, pt(7), { font: F.medium, jpFont: F.jpMedium, fill: T.ink }));
    el.push(para(p.body, x, y + pBody, pw, { size: pt(6.6), lead: pLead, font: F.regular, jpFont: F.jp, fill: T.dim }).svg);
    el.push(text(p.no, x, pNoY, pt(6), { font: F.mono, fill: T.dim, tracking: 0.04, opacity: 0.75 }));
  });

  // ── Governance ──
  el.push(sectionLabel(C.govLabel, M, 73, T));
  const gw = (COL_W - 9) / 2;
  C.gov.forEach((g, i) => {
    const x = M + i * (gw + 9), y = 77;
    el.push(rect(x, y, gw, 35, T.panel, T.key === 'light' ? ` stroke="${BORDER}" stroke-width="0.25"` : ''));
    el.push(text(g.no, x + 5, y + 7.5, pt(7), { font: F.mono, fill: GREEN, tracking: 0.1 }));
    el.push(text(g.ja, x + 14, y + 7.5, pt(9.5), { font: F.semibold, jpFont: F.jpBold, fill: T.ink }));
    const we = widthOf(g.en, pt(6.4), { font: F.mono, tracking: 0.05 });
    el.push(text(g.en, x + gw - 5 - we, y + 7.5, pt(6.4), { font: F.mono, fill: T.dim, tracking: 0.05 }));
    el.push(line(x + 5, y + 10.5, x + gw - 5, y + 10.5, T.rule, 0.2));
    el.push(para(g.body, x + 5, y + 15.5, gw - 10, { size: pt(6.9), lead: 3.9, font: F.regular, jpFont: F.jp, fill: T.dim }).svg);
  });
  el.push(para(C.govNote, M, 118, COL_W, { size: pt(6.8), lead: 4, font: F.regular, jpFont: F.jp, fill: T.dim, opacity: 0.9 }).svg);

  // ── Workflow ──
  el.push(sectionLabel(C.flowLabel, M, 127, T));
  el.push(text(C.flowNote, M + widthOf(C.flowLabel, pt(7.5), { font: F.mono, jpFont: F.jpMedium, tracking: 0.10 }) + 8, 127, pt(6.8),
    { font: F.regular, jpFont: F.jp, fill: T.dim }));
  const fw = (COL_W - 2 * 10) / 3;
  C.flow.forEach((s, i) => {
    const x = M + i * (fw + 10), y = 132;
    el.push(rect(x, y, fw, 24, T.panel, T.key === 'light' ? ` stroke="${BORDER}" stroke-width="0.25"` : ''));
    el.push(text(s.n, x + 5, y + 7.6, pt(9), { font: F.mono, fill: ORANGE }));
    el.push(text(s.ja, x + 11, y + 7.6, pt(9), { font: F.semibold, jpFont: F.jpBold, fill: T.ink }));
    const we = widthOf(s.en, pt(6.2), { font: F.mono, tracking: 0.05 });
    el.push(text(s.en, x + fw - 5 - we, y + 7.6, pt(6.2), { font: F.mono, fill: T.dim, tracking: 0.05 }));
    s.items.forEach((it, j) => {
      el.push(text('·', x + 5, y + 13.5 + j * 4.2, pt(6.8), { font: F.regular, fill: ORANGE }));
      el.push(text(it, x + 8, y + 13.5 + j * 4.2, pt(6.6), { font: F.regular, jpFont: F.jp, fill: T.dim }));
    });
    if (i < 2) {
      const ax = x + fw + 3.4, ay = y + 13;
      el.push(`<path d="M${ax} ${ay} l3.2 0 M${ax + 2.2} ${ay - 1.1} l1.1 1.1 l-1.1 1.1" stroke="${ORANGE}" stroke-width="0.4" fill="none"/>`);
    }
  });

  // ── Leadership (left) and Osaka (right) ──
  const half = (COL_W - 12) / 2;
  el.push(sectionLabel(C.founderLabel, M, 162, T));
  el.push(text(C.founderName, M, 170.5, pt(13), { font: F.semibold, jpFont: F.jpBold, fill: T.ink }));
  const wn = widthOf(C.founderName, pt(13), { font: F.semibold, jpFont: F.jpBold });
  el.push(text(C.founderRoman, M + wn + 3, 170.5, pt(7), { font: F.mono, fill: T.dim, tracking: 0.04 }));
  el.push(text(C.founderTitle, M, 175.2, pt(7), { font: F.medium, jpFont: F.jpMedium, fill: GREEN }));
  let by = 181;
  for (const b of C.founderBio) {
    const p = para(b, M, by, half, { size: pt(6.5), lead: 3.7, font: F.regular, jpFont: F.jp, fill: T.dim });
    el.push(p.svg);
    by = p.end + 4.4;
  }

  const gx = M + half + 12;
  el.push(sectionLabel(C.gseLabel, gx, 162, T, ORANGE));
  el.push(para(C.gseIntro, gx, 168.5, half, { size: pt(6.5), lead: 3.7, font: F.regular, jpFont: F.jp, fill: T.ink }).svg);
  el.push(para(C.poc, gx, 174.5, half, { size: pt(6.5), lead: 3.7, font: F.regular, jpFont: F.jp, fill: T.dim }).svg);
  let dy = 184.5;
  for (const [d, v] of C.dates) {
    el.push(text(d, gx, dy, pt(6.8), { font: F.medium, jpFont: F.jpMedium, fill: T.ink }));
    el.push(text(v, gx + 40, dy, pt(6.6), { font: F.regular, jpFont: F.jp, fill: T.dim }));
    dy += 4.4;
  }

  return el;
}

// ═════════════════════════════════════════════════════════════════════════════
function svgFor(title, elements) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}mm" height="${PAGE_H}mm" viewBox="0 0 ${PAGE_W} ${PAGE_H}">
  <title>${title}</title>
  ${elements.filter(Boolean).join('\n  ')}
</svg>`;
}

/**
 * Glyph coverage, checked once for the whole document before anything renders.
 *
 * The meishi throws on the first missing character, which means finding N new
 * kanji takes N runs of the generator and N font rebuilds. This brief added
 * well over a hundred at once. Collect every character the copy uses, diff it
 * against the vendored subset, and print the whole delta in the form the
 * subsetter wants.
 */
function coverage() {
  const seen = new Set();
  const walk = (v) => {
    if (typeof v === 'string') { for (const ch of v) seen.add(ch); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(C);
  const missing = [...seen].filter((ch) => {
    const f = isJP(ch) ? F.jp : F.regular;
    return f.charToGlyphIndex(ch) === 0;
  });
  if (missing.length) {
    const jp = missing.filter(isJP), other = missing.filter((c) => !isJP(c));
    console.error(`\n✗ ${missing.length} character(s) missing from the vendored faces.\n`);
    if (jp.length) {
      console.error(`  Add to KANJI in tools/prepare-noto-sans-jp.py, then re-run it:\n`);
      console.error(`    ${jp.join('')}\n`);
    }
    if (other.length) console.error(`  Not Japanese, not in Plex: ${other.map((c) => `${c} (U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')})`).join(', ')}\n`);
    process.exit(1);
  }
  console.log(`  glyph coverage: ${seen.size} distinct characters, all present`);
}

/**
 * PDF document metadata.
 *
 * Chrome's page.pdf() takes /Title from document.title, and setContent() leaves
 * the document untitled — so every PDF this generator wrote said "about:blank"
 * in the reader's title bar and in the Finder/Explorer column. /Author it does
 * not expose at all. Both matter here: this file gets forwarded, filed, and
 * opened by someone who did not receive it from us.
 *
 * There is no qpdf/exiftool in this environment, so the Info dictionary is
 * written as a PDF incremental update: append the new object, a small xref
 * section covering just it, and a trailer whose /Prev chains to the existing
 * one. Every byte offset already in the file stays valid, which is the whole
 * point of doing it this way rather than rewriting the dictionary in place.
 *
 * No /CreationDate or /ModDate: a timestamp would make each rebuild differ
 * from the last, and this repo's rule is that re-running a generator reproduces
 * its output exactly.
 */
function pdfText(str) {
  // Literal string if it is plain ASCII; UTF-16BE otherwise, which is what the
  // Japanese title needs to survive a reader's title bar.
  if (/^[\x20-\x7E]*$/.test(str)) return `(${str.replace(/([\\()])/g, '\\$1')})`;
  return `<${Buffer.from('\uFEFF' + str, 'utf16le').swap16().toString('hex').toUpperCase()}>`;
}

function stampPdfMetadata(file, meta) {
  let orig = fs.readFileSync(file);

  // Chrome stamps wall-clock /CreationDate and /ModDate into its own Info
  // object, so two rebuilds of an unchanged document differed by six bytes.
  // That object is unreferenced the moment /Info points at ours; normalising
  // its timestamps to a fixed value — same string length, so every offset in
  // the file stays put — makes the build byte-reproducible, which is this
  // repo's rule for every generator.
  orig = Buffer.from(
    orig.toString('latin1').replace(
      /\/(CreationDate|ModDate)\s*\(D:\d{14}([+-]\d{2}'\d{2}')\)/g,
      (_, key, tz) => `/${key} (D:20260101000000${tz})`),
    'latin1');
  const tail = orig.subarray(-2048).toString('latin1');
  const prev = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(tail);
  const trailer = /trailer\s*<<([\s\S]*?)>>\s*startxref/.exec(tail);
  if (!prev || !trailer) throw new Error(`${file}: no classic xref trailer to chain onto`);
  const size = Number(/\/Size\s+(\d+)/.exec(trailer[1])[1]);
  const root = /\/Root\s+(\d+\s+\d+\s+R)/.exec(trailer[1])[1];

  const num = size;                                   // next free object number
  const body = Object.entries(meta).map(([k, v]) => `  /${k} ${pdfText(v)}`).join('\n');
  const obj = `${num} 0 obj\n<<\n${body}\n>>\nendobj\n`;
  const objOff = orig.length;
  const xrefOff = objOff + Buffer.byteLength(obj, 'latin1');
  const xref =
    `xref\n0 1\n0000000000 65535 f \n` +
    `${num} 1\n${String(objOff).padStart(10, '0')} 00000 n \n` +
    `trailer\n<< /Size ${num + 1} /Root ${root} /Info ${num} 0 R /Prev ${prev[1]} >>\n` +
    `startxref\n${xrefOff}\n%%EOF\n`;

  fs.writeFileSync(file, Buffer.concat([orig, Buffer.from(obj, 'latin1'), Buffer.from(xref, 'latin1')]));
}

async function makePdf(pages, outPath, docTitle) {
  const { default: puppeteer } = await import('puppeteer');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>
    @page { size: ${PAGE_W}mm ${PAGE_H}mm; margin: 0; }
    html, body { margin: 0; padding: 0; }
    .pg { width: ${PAGE_W}mm; height: ${PAGE_H}mm; overflow: hidden; break-after: page; }
    .pg:last-child { break-after: auto; }
    svg { display: block; }
  </style></head><body>${pages.map((s) => `<div class="pg">${s.replace(/<\?xml[^>]*\?>/, '')}</div>`).join('')}</body></html>`;
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: outPath, width: `${PAGE_W}mm`, height: `${PAGE_H}mm`,
                   printBackground: true, preferCSSPageSize: true });
  await browser.close();
}

async function proof(svgStr, outPath, dpi = 150) {
  const { default: sharp } = await import('sharp');
  const px = (n) => Math.round((n / 25.4) * dpi);
  await sharp(Buffer.from(svgStr), { density: dpi })
    .resize(px(PAGE_W), px(PAGE_H), { fit: 'fill' }).png().toFile(outPath);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('=== Osaka executive brief (JA) ===');
console.log(`  A4 landscape ${PAGE_W}x${PAGE_H}mm · 2pp · outlined vector`);
coverage();

for (const T of Object.values(THEMES)) {
  const title = `askOdin エグゼクティブ・サマリー（${T.key}）`;
  const p1 = svgFor(title, page1(T));
  const p2 = svgFor(title, page2(T));
  const at = (n) => path.join(OUTPUT_DIR, `askOdin-exec-brief-ja-${T.key}${n}`);
  const pdfAt = path.join(OUTPUT_DIR, `askOdin-exec-brief-ja-${T.use}.pdf`);

  fs.writeFileSync(at('-p1.svg'), p1);
  fs.writeFileSync(at('-p2.svg'), p2);
  await proof(p1, at('-p1-proof.png'));
  await proof(p2, at('-p2-proof.png'));
  await makePdf([p1, p2], pdfAt, C.metaTitle);
  stampPdfMetadata(pdfAt, {
    Title: C.metaTitle,
    Author: C.metaAuthor,
    Subject: C.metaSubject,
    Keywords: C.metaKeywords,
    Creator: 'generate-exec-brief-ja.mjs — askOdin brand asset pipeline',
  });
  console.log(`  ${T.key.padEnd(5)} → askOdin-exec-brief-ja-${T.use}.pdf  + 2 SVG + 2 proof PNG`);
}
console.log(`\n  ${OUTPUT_DIR}/`);
