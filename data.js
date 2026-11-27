// 見方をかえる（ライフゲーム）の問題を作る（ブラウザと node の両方で使う）。
// 中身は、コンウェイのライフゲームのきまり（LifeWiki）と、デネット「Real Patterns」（1991）・Reason 誌のデネットへのインタビュー（2003）に
// 書いてあることだけ（2026-11-27 に読んだ。要点は共有フォルダ games/life-mikata-research.md）。
// 1問は2段。1段目「マスの見方」：1マスずつきまりを当てはめる（★のマスは次にどうなる？・次に生きているマスはいくつ？・グライダーはどちらへ？）。
// 2段目「設計の見方」：このまま世代が進むと、盤の全体はどうなる？（消える・止まる・くり返す・進む）。
// 盤は、果てのない平面の一部を切り取って見せている（はしで止まらない）。答えは、この中の step() で世代を進めて決める。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回し・まちがいの選び肢は、足すだけでも過去の日の問題が変わる。公開したあとは変えず、変えるときは qa/run.mjs の PINS を作り直して PR に理由を書く。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    wiki: ["LifeWiki「Conway's Game of Life」", "https://conwaylife.com/wiki/Conway%27s_Game_of_Life"],
    real: ["デネット「Real Patterns」（1991）", "https://dl.tufts.edu/concern/pdfs/wp988x11s"],
    reason: ["Reason 誌のデネットへのインタビュー（2003）", "https://reason.com/2003/05/01/pulling-our-own-strings-2/"],
  };

  // ---- ライフゲームのきまり（B3/S23）：まわり8マスのうち、生きたマスがちょうど3つなら生まれる・2つか3つなら生き残る・ほかは消える ----
  const K = (x, y) => x + "," + y;
  const sortC = (c) => c.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  function nb(cells, x, y) { const s = new Set(cells.map(([a, b]) => K(a, b))); let n = 0; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && s.has(K(x + dx, y + dy))) n++; return n; }
  function step(cells) {
    const s = new Set(cells.map(([x, y]) => K(x, y))), c = new Map();
    for (const [x, y] of cells) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { if (!dx && !dy) continue; const k = K(x + dx, y + dy); c.set(k, (c.get(k) || 0) + 1); }
    const o = [];
    for (const [k, n] of c) if (n === 3 || (n === 2 && s.has(k))) o.push(k.split(",").map(Number));
    return sortC(o);
  }
  const run = (cells, n) => { let c = cells; for (let i = 0; i < n; i++) c = step(c); return c; };
  function shape(c) { if (!c.length) return { s: "", x: 0, y: 0 }; const mx = Math.min(...c.map((a) => a[0])), my = Math.min(...c.map((a) => a[1])); return { s: c.map(([x, y]) => K(x - mx, y - my)).sort().join(";"), x: mx, y: my }; }
  // このまま進むとどうなるか（設計の見方の答え）。周期4までの形を見る
  function fate(cells, max = 300) {
    let c = cells; const h = [];
    for (let t = 0; t <= max; t++) {
      if (!c.length) return { g: "kieru", t };
      const n = shape(c);
      for (let p = 1; p <= 4 && p <= h.length; p++) { const o = h[h.length - p]; if (o.s === n.s) { const dx = n.x - o.x, dy = n.y - o.y; return { g: dx || dy ? "susumu" : p === 1 ? "tomaru" : "kurikaesu", p, dx, dy, t: t - p, n: c.length }; } }
      h.push(n); c = step(c);
    }
    return { g: "?" };
  }

  // 形（左上を 0,0）。名前は LifeWiki の呼び名
  const PAT = {
    block: [[0, 0], [1, 0], [0, 1], [1, 1]],
    beehive: [[1, 0], [2, 0], [0, 1], [3, 1], [1, 2], [2, 2]],
    loaf: [[1, 0], [2, 0], [0, 1], [3, 1], [1, 2], [3, 2], [2, 3]],
    boat: [[0, 0], [1, 0], [0, 1], [2, 1], [1, 2]],
    tub: [[1, 0], [0, 1], [2, 1], [1, 2]],
    blinker: [[0, 0], [1, 0], [2, 0]],
    toad: [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1]],
    beacon: [[0, 0], [1, 0], [0, 1], [3, 2], [2, 3], [3, 3]],
    glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
    domino: [[0, 0], [1, 0]],
    diag3: [[0, 0], [1, 1], [2, 2]],
    ltri: [[0, 0], [1, 0], [0, 1]],
    row4: [[0, 0], [1, 0], [2, 0], [3, 0]],
    tet: [[0, 0], [1, 0], [2, 0], [1, 1]],
    row5: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    ring: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  };
  // グライダー（右下へ進む向き）と、ぶつかる相手。ずらしは右下へ k マスずつ（同じぶつかり方で、時間だけちがう）
  const EATER = [[0, 0], [1, 0], [0, 1], [2, 1], [2, 2], [2, 3], [3, 3]];
  const with_ = (b, dx, dy) => (k) => [...PAT.glider, ...b.map(([x, y]) => [x + dx + k, y + dy + k])];
  const COMBO = { eat: with_(EATER, 4, 4), crash: with_(PAT.block, 4, 4), side: with_(PAT.block, 7, 2) };

  // 8通りの向き（回す・裏返す）。向きを変えても、きまりは同じ
  const TF = [(x, y) => [x, y], (x, y) => [-y, x], (x, y) => [-x, -y], (x, y) => [y, -x], (x, y) => [-x, y], (x, y) => [y, x], (x, y) => [x, -y], (x, y) => [-y, -x]];
  const orient = (c, o) => { const t = c.map(([x, y]) => TF[o](x, y)), mx = Math.min(...t.map((a) => a[0])), my = Math.min(...t.map((a) => a[1])); return sortC(t.map(([x, y]) => [x - mx, y - my])); };

  // 2段目「設計の見方：このまま世代が進むと、盤の全体は？」の4つ。sub に1段目の答えを書かない
  const GROUPS = {
    kieru: { name: "すべて消える", sub: "生きたマスが0になる" },
    tomaru: { name: "止まった形になる", sub: "世代が進んでも、もう変わらない" },
    kurikaesu: { name: "同じ形をくり返す", sub: "何世代かごとに、もとの形にもどる" },
    susumu: { name: "形を保って進む", sub: "同じ形のまま、場所が動いていく" },
  };
  const GRP_WHY = {
    kieru: "生きたマスがだんだん減り、0になります。0になると、もう何も生まれません。",
    tomaru: "どのマスも「生き残る」か「空のまま」になる形（静物）に落ち着きます。そこからは何世代たっても変わりません。",
    kurikaesu: "何世代かごとに同じ形にもどる形（振動子）になります。場所は動きません。",
    susumu: "グライダーは4世代ごとに同じ形にもどり、そのたびにななめに1マス動きます。デネットはこれを「同じグライダーが動いた」と見る設計の見方の例にしました。",
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const MEDIA = { cell: "マスの見方", count: "マスの見方", move: "マスの見方", far: "設計の見方", kimari: "ライフゲームのきまり", dennett: "デネットの見方" };

  // 盤に置く。形のまわりに2マス以上あける。盤の大きさは 8〜14
  function place(R, cells, minW) {
    const w = Math.max(...cells.map((a) => a[0])) + 1, h = Math.max(...cells.map((a) => a[1])) + 1, W = Math.min(14, Math.max(minW || 8, w + 4, h + 4));
    const ox = ri(R, 2, W - w - 2), oy = ri(R, 2, W - h - 2);
    return { W, ox, oy, cells: sortC(cells.map(([x, y]) => [x + ox, y + oy])) };
  }
  const FATE_W = ["生まれる", "生き残る", "消える", "空のまま"];
  function cellFate(cells, x, y) { const alive = cells.some(([a, b]) => a === x && b === y), n = nb(cells, x, y); return alive ? (n === 2 || n === 3 ? "生き残る" : "消える") : n === 3 ? "生まれる" : "空のまま"; }
  const DIR = (dx, dy) => (dy > 0 ? "下" : "上") === "下" ? (dx > 0 ? "右下" : "左下") : dx > 0 ? "右上" : "左上";

  // 1段目の作り方
  // cell：★のマスは次の世代でどうなる？（まず答えの種類を決めてから、そのマスを選ぶ。同じ答えばかりにならない）
  function mkCell(R, lv, cells, W) {
    const cand = [];
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const alive = cells.some(([a, b]) => a === x && b === y); if (alive || nb(cells, x, y) > 0) cand.push([x, y, cellFate(cells, x, y)]); }
    const kinds = FATE_W.filter((f) => cand.some((c) => c[2] === f)), f = kinds[ri(R, 0, kinds.length - 1)], cs = cand.filter((c) => c[2] === f), [x, y] = cs[ri(R, 0, cs.length - 1)];
    const ws = FATE_W.filter((w) => w !== f), opts = shuffle(R, [f, ...(lv === 0 ? pickN(R, ws, 2) : ws)]);
    return { q: "★のマスは、次の世代でどうなる？", opts, ans: f, mark: [x, y], v: `${x}.${y}:${opts.join("")}` };
  }
  // count：次の世代で、生きているマスはいくつ？
  function mkCount(R, lv, cells) {
    const a = step(cells).length, near = [a - 2, a - 1, a + 1, a + 2, a + 3, a - 3].filter((n) => n >= 0 && n !== a), ds = lv === 2 ? [near[ri(R, 0, 1)], ...pickN(R, near.slice(2), 2)].slice(0, 3) : pickN(R, near, 3);
    const opts = shuffle(R, [a, ...ds]).map((n) => `${n}マス`);
    return { q: "次の世代で、生きているマスはいくつ？", opts, ans: `${a}マス`, mark: null, v: opts.join("") };
  }
  // move：グライダーは4世代でどちらへ1マス？　far：n×4世代で、どちらへ何マス？
  function mkMove(R, lv, cells, far) {
    const f = fate(cells), d = DIR(f.dx, f.dy), dirs = ["右下", "左下", "右上", "左上"];
    if (!far) { const opts = shuffle(R, [`${d}へ1マス`, ...pickN(R, dirs.filter((x) => x !== d), lv === 0 ? 2 : 3).map((x) => `${x}へ1マス`)]); return { q: "4世代たつと、この形はどちらへ動く？", opts, ans: `${d}へ1マス`, mark: null, v: opts.join("") }; }
    const n = ri(R, lv === 2 ? 5 : 2, lv === 2 ? 12 : 4), g = n * 4, ans = `${d}へ${n}マス`;
    const ws = [`${d}へ${g}マス`, `${d}へ${n * 2}マス`, `${d}へ${n - 1}マス`, `${d}へ${n + 1}マス`, `${dirs.filter((x) => x !== d)[ri(R, 0, 2)]}へ${n}マス`].filter((w, i, a) => w !== ans && a.indexOf(w) === i);
    const opts = shuffle(R, [ans, ...pickN(R, ws, 3)]);
    return { q: `${g}世代たつと、この形はどちらへ、何マス動いている？`, opts, ans, mark: null, v: `${n}:${opts.join("")}`, gens: g };
  }

  // 形の問題。pat：形の名前か COMBO の名前、how：1段目の作り方
  const B = (id, lv, pat, how, name, look, key, why, opt) => {
    const base = PAT[pat] ? () => PAT[pat] : COMBO[pat], src = (opt && opt.src) || ["wiki"], fixed = opt && opt.fixed;
    const g = fate(base(0)).g;
    return { id, lv, grp: g, col: how === "far" ? "far" : how, name, look, key, why, src, pat, how,
      make: (R, l) => {
        const o = fixed ? 0 : ri(R, 0, 7), k = PAT[pat] ? 0 : ri(R, 0, 2), cells = orient(base(k), o), b = place(R, cells, PAT[pat] ? 8 : 11);
        const p = how === "cell" ? mkCell(R, l, b.cells, b.W) : how === "count" ? mkCount(R, l, b.cells) : mkMove(R, l, b.cells, how === "far");
        return { type: "act", media: MEDIA[how], board: { w: b.W, cells: b.cells, mark: p.mark }, q: p.q, opts: p.opts, ans: p.ans, gens: p.gens || 0, rev: false, v: `${o}.${k}.${b.ox}.${b.oy}:${p.v}` };
      } };
  };
  // 決まりの問題。ans：答え、ws：まちがいの選び肢の候補（やさしいは2つ、ほかは3つ使う）、sit：問いの言い方
  function fact(col, sit, ans, ws) {
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), ds = pickN(R, ws, lv === 0 ? 2 : 3);
      return { type: "fact", media: MEDIA[col], board: null, q: sit[si], opts: shuffle(R, [ans, ...ds]), ans, gens: 0, rev: false, v: `${si}:${ds.map((d) => ws.indexOf(d)).join(".")}` };
    };
  }
  const F = (id, lv, col, src, name, look, key, why, sit, ans, ws) => ({ id, lv, grp: null, col, name, look, key, why, src: [src], make: fact(col, sit, ans, ws) });

  const RULE = "まわり8マスのうち生きたマスが、ちょうど3つなら生まれる。2つか3つなら生き残る。ほかは消える（空のまま）。";
  const KINDS = [
    // ---- やさしい ----
    B("block", 0, "block", "cell", "ブロック（止まった形）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "ブロックの4マスは、どれもまわりに3つの生きたマスがあるので生き残ります。外側のマスは、まわりが3つにならないので生まれません。"),
    B("blinker", 0, "blinker", "cell", "ブリンカー（たて横に点滅）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "3つならんだ形は、まん中だけが生き残り、両はしが消えて、横に2つ生まれます。2世代で、もとにもどります。"),
    B("beehive", 0, "beehive", "cell", "ビーハイブ（止まった形）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "ビーハイブの6マスは、どれもまわりに2つか3つの生きたマスがあり、内側の空きは2つしかないので生まれません。"),
    B("boat", 0, "boat", "cell", "ボート（止まった形）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "ボートは、どの生きたマスも生き残り、どの空きも3つにならない形です。"),
    B("tub", 0, "tub", "cell", "タブ（止まった形）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "タブのまん中の空きはまわりが4つなので生まれません。4つのマスは、どれもまわりが2つで生き残ります。"),
    B("domino", 0, "domino", "cell", "2つならび（消える形）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "2つだけならんだマスは、どちらもまわりが1つなので消えます。生まれるマスもありません。"),
    B("glider1", 0, "glider", "move", "グライダー（4世代でななめに1マス）", "グライダーの、とがった先の向きを見ます。", "グライダーは4世代ごとに同じ形にもどり、ななめに1マス進みます。", "グライダーは4世代で同じ形にもどり、そのたびにななめに1マス動きます。とがった先の向きへ進みます。"),
    F("umare", 0, "kimari", "wiki", "生まれるのは、まわりがちょうど3つ", "2つでは生まれません。", "空のマスは、まわり8マスに生きたマスがちょうど3つあると生まれます。",
      "ライフゲームのきまりでは、空のマスは、まわり8マスのうち生きたマスがちょうど3つのとき、次の世代で生きたマスになります。",
      ["空のマスが次の世代で生まれるのは、まわりの生きたマスがいくつのとき？", "何もないマスに生きたマスが生まれる条件は？", "ライフゲームで「誕生」するのは？"], "ちょうど3つのとき", ["ちょうど2つのとき", "4つ以上のとき", "1つでもあるとき", "8つ全部のとき", "0のとき"]),
    F("ikinokoru", 0, "kimari", "wiki", "生き残るのは、まわりが2つか3つ", "少なすぎても、多すぎても消えます。", "生きたマスは、まわりの生きたマスが2つか3つなら生き残ります。",
      "ライフゲームのきまりでは、生きたマスは、まわりの生きたマスが2つか3つなら次の世代も生きています。1つ以下や4つ以上なら消えます。",
      ["生きたマスが次の世代も生き残るのは、まわりの生きたマスがいくつのとき？", "生きたマスが消えないのは？", "ライフゲームで「生存」するのは？"], "2つか3つのとき", ["1つだけのとき", "4つ以上のとき", "0のとき", "3つだけのとき", "8つ全部のとき"]),
    F("hachi", 0, "kimari", "wiki", "まわりは8マス", "ななめも数えます。", "ライフゲームでは、たて・よこ・ななめのまわり8マスを数えます。",
      "ライフゲームでは、1つのマスのまわりの8マス（たて・よこ・ななめ）にある生きたマスを数えて、次の世代を決めます。",
      ["ライフゲームで数える「まわり」は何マス？", "1つのマスの次を決めるとき、まわりの何マスを見る？", "ライフゲームのまわりのマスの数は？"], "8マス（たて・よこ・ななめ）", ["4マス（たて・よこだけ）", "6マス", "2マス（左右だけ）", "24マス", "9マス（自分もふくむ）"]),
    // ---- ふつう ----
    B("toad", 1, "toad", "count", "トード（2世代で点滅）", "まず、消えるマスと生まれるマスを1つずつ探します。", RULE, "トードは2世代ごとにもとの形にもどる形です。数えると、生きたマスの数は6のまま変わりません。"),
    B("beacon", 1, "beacon", "count", "ビーコン（角が点滅）", "向かい合う角の2マスを見ます。", RULE, "ビーコンは、内側の角の2マスが消えたり生まれたりして、2世代ごとにもとにもどります。"),
    B("loaf", 1, "loaf", "cell", "ローフ（止まった形）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "ローフは、どの生きたマスも生き残り、どの空きも3つにならない、止まった形です。"),
    B("ltri", 1, "ltri", "count", "L字の3つ（ブロックになる）", "角の空きのまわりを数えます。", RULE, "L字の3つは、角の空きのまわりがちょうど3つなので、そこが生まれてブロックになります。"),
    B("diag3", 1, "diag3", "count", "ななめ3つ（消える）", "両はしのマスのまわりを数えます。", RULE, "ななめの3つは、両はしが消えてまん中だけが残り、次の世代でそれも消えます。"),
    B("row4", 1, "row4", "cell", "4つならび（ビーハイブになる）", "★のまわり8マスに、生きたマスはいくつ？", RULE, "4つならびは、2世代でビーハイブという止まった形になります。"),
    B("far1", 1, "glider", "far", "グライダーの先を読む", "4世代で1マス。何回くり返すかを数えます。", "グライダーは4世代ごとに、ななめに1マス進みます。", "マスを1つずつ計算しなくても、「4世代で1マス」という設計の見方を使えば、先の場所が分かります。デネットはこれを、物理の見方を計算しないで上の見方に上がる例にしました。", { src: ["wiki", "real"] }),
    F("conway", 1, "kimari", "wiki", "考えたのはコンウェイ", "イギリスの数学者です。", "ライフゲームは、数学者ジョン・ホートン・コンウェイが考えました。",
      "ライフゲーム（Conway's Game of Life）は、イギリスの数学者ジョン・ホートン・コンウェイが考えたセル・オートマトンです。",
      ["ライフゲームを考えた数学者は？", "ライフゲームの英語の名前に入っている人は？", "ライフゲームを作ったのはだれ？"], "ジョン・ホートン・コンウェイ", ["アラン・チューリング", "ジョン・フォン・ノイマン", "アイザック・ニュートン", "マーティン・ガードナー", "ダニエル・デネット"]),
    F("gardner", 1, "kimari", "wiki", "1970年、科学雑誌の連載で広まった", "マーティン・ガードナーの数学の連載です。", "ライフゲームは1970年10月、Scientific American 誌のガードナーの連載で広まりました。",
      "ライフゲームは1970年10月、Scientific American 誌のマーティン・ガードナーの連載で紹介され、広まりました。",
      ["ライフゲームが広く知られたのは、何年の雑誌の記事から？", "ガードナーがライフゲームを紹介したのは何年？", "ライフゲームが Scientific American 誌に出たのは？"], "1970年", ["1950年", "1990年", "2000年", "1930年", "1985年"]),
    F("yokeru", 1, "dennett", "reason", "決まっている世界にも「よける」はある", "決定論と運命論はちがう、という話です。", "デネットは、決定論の世界にも「よける」ことはたくさんあると言いました。",
      "デネットは2003年のインタビューで、決定論の世界にもよけること（avoidance）はたくさんあり、決定論と運命論（何をしても同じ）を取りちがえてはいけないと話しています。",
      ["デネットは、すべてが決まっている（決定論の）世界について何と言った？", "決定論の世界で「よける」ことは？　デネットの考えは？", "デネットが、人が取りちがえやすいと言った組は？"], "決定論の世界にも、よけることはたくさんある", ["決定論の世界では、何もよけられない", "決定論の世界には、形が生まれない", "よけるには、きまりを破る必要がある", "決定論と運命論は同じもの", "よけられるのは人だけで、形には無理"]),
    // ---- むずかしい ----
    B("tet", 2, "tet", "count", "T字の4つ（くり返す形になる）", "まん中の下のマスと、両わきの上下を見ます。", RULE, "T字の4つは、9世代で信号機（ブリンカー4つ）になり、そこからは2世代ごとにくり返します。"),
    B("row5", 2, "row5", "count", "5つならび（くり返す形になる）", "両はしと、その内側のマスのまわりを数えます。", RULE, "5つならびは、6世代で信号機（ブリンカー4つ）になり、2世代ごとにくり返します。"),
    B("ring", 2, "ring", "count", "まん中があいた3×3（くり返す形になる）", "角のマスと、辺のまん中のマスでは、まわりの数がちがいます。", RULE, "まん中があいた3×3は、5世代で信号機（ブリンカー4つ）になり、2世代ごとにくり返します。"),
    B("eat", 2, "eat", "count", "グライダーとイーター（食べる形）", "まだ、ぶつかっていないところから数えます。", RULE, "イーターは、ぶつかってきたグライダーを4世代で食べ、自分はもとの形にもどります。全体は、イーターだけが止まって残ります。", { src: ["wiki", "real"] }),
    B("crash", 2, "crash", "count", "グライダーとブロック（ぶつかって消える）", "まだ、ぶつかっていないところから数えます。", RULE, "このぶつかり方では、グライダーもブロックも消えてしまいます。デネットは、設計の見方の予想は「少しの危険」をふくみ、ほかのかけらで形がこわれることがあると書いています。", { src: ["wiki", "real"] }),
    B("side", 2, "side", "count", "グライダーとブロック（ずれてぶつかる）", "まだ、ぶつかっていないところから数えます。", RULE, "ブロックの置き場所がずれると、ぶつかったあとは止まった形（ブロック1つ）が残ります。同じグライダーとブロックでも、ぶつかり方で結果が変わります。", { src: ["wiki", "real"] }),
    B("far2", 2, "glider", "far", "グライダーの、ずっと先を読む", "4世代で1マス。世代の数を4でわります。", "グライダーは4世代ごとに、ななめに1マス進みます。", "20世代も40世代も、1マスずつ計算するのはたいへんです。「グライダーが進む」と見る設計の見方なら、4でわるだけで分かります。", { src: ["wiki", "real"] }),
    F("level", 2, "dennett", "real", "物理の見方と設計の見方", "マス1つずつの見方と、まとまりで見る見方です。", "デネットは、ライフゲームの世界を「物理の見方」と「設計の見方」の2つの段で説明しました。",
      "デネットは「Real Patterns」（1991）で、マス1つずつのきまりで見る段を物理の段、グライダーが動く・イーターが食べると見る段を設計の段と呼びました。",
      ["デネットがライフゲームで分けた、2つの見方の組は？", "マスのきまりで見る見方と、グライダーで見る見方。デネットの呼び名は？", "デネットの「Real Patterns」に出てくる2つの段は？"], "物理の見方と設計の見方", ["ことばの見方と数の見方", "右の見方と左の見方", "昼の見方と夜の見方", "生きる見方と死ぬ見方", "速い見方と遅い見方"]),
    F("risk", 2, "dennett", "real", "設計の見方の予想には少し危険がある", "思わぬかけらが飛んでくることがあります。", "設計の見方の予想は、少しの危険をふくむ、とデネットは書いています。",
      "デネットは「Real Patterns」で、設計の段に上がると物理の段を計算しなくても予想できるが、それは「少しの危険」をふくみ、ほかのかけらで形がこわれることもあると書いています。",
      ["デネットは、設計の見方で予想することをどう書いた？", "グライダーで考える予想は、いつも当たる？　デネットの考えは？", "設計の見方の予想の弱いところは？"], "便利だが、少しの危険をふくむ", ["いつも必ず当たる", "物理の見方より必ず遅い", "ライフゲームでは使えない", "きまりを変えないと使えない", "1世代先しか分からない"]),
    F("turing", 2, "dennett", "real", "ライフゲームの中に計算機が作れる", "万能チューリング機械です。", "ライフゲームの平面には、原理的には万能チューリング機械を作ることができます。",
      "デネットは「Real Patterns」で、ライフゲームの平面には原理的に万能チューリング機械（どんな計算もできる機械）を組み立てられることを紹介しています。",
      ["ライフゲームの平面に、原理的に作ることができるものは？", "きまりが2つだけのライフゲームの中に作れるといわれるのは？", "デネットが紹介した、ライフゲームで作れるものは？"], "万能チューリング機械（計算機）", ["本物の生き物", "きまりのちがう別の宇宙", "時間を戻す機械", "答えのない問題を解く機械", "形を作らない機械"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "block|2026-11-27:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, gwhy: k.grp ? GRP_WHY[k.grp] : "", src: k.src.map((s) => SRC[s]), svg: svgOf(p.board), ...p };
  }
  // 盤の絵（SVG）。生きたマスは黒、★は太い枠と★の字（色だけで分けない）。cells を渡すと、その世代を同じ盤に描く（盤の外のマスは見えない）
  function svgOf(b, cells, label) {
    if (!b) return "";
    const W = b.w, S = 24, P = 2, Z = W * S + P * 2, on = cells || b.cells, m = cells ? null : b.mark, r = [];
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) r.push(`<rect x="${P + x * S}" y="${P + y * S}" width="${S}" height="${S}" class="${on.some(([a, c]) => a === x && c === y) ? "lc on" : "lc"}"/>`);
    if (m) { const alive = b.cells.some(([a, c]) => a === m[0] && c === m[1]); r.push(`<rect x="${P + m[0] * S + 1.5}" y="${P + m[1] * S + 1.5}" width="${S - 3}" height="${S - 3}" class="lmk"/><text x="${P + m[0] * S + S / 2}" y="${P + m[1] * S + S / 2 + 6}" text-anchor="middle" class="${alive ? "lst on" : "lst"}">★</text>`); }
    const n = on.filter(([x, y]) => x >= 0 && y >= 0 && x < W && y < W).length;
    // 読み上げでも盤を読めるように、生きたマスの場所（左から何列め-上から何行め）を全部書く（life-mikata #1 の CodeRabbit）
    const where = on.filter(([x, y]) => x >= 0 && y >= 0 && x < W && y < W).map(([x, y]) => `${x + 1}-${y + 1}`).join("、");
    const al = label || `${W}×${W}の盤。生きたマスは${n}個${n ? `（左から何列め-上から何行め：${where}）` : ""}${m ? `。★は${m[0] + 1}-${m[1] + 1}の${b.cells.some(([a, c]) => a === m[0] && c === m[1]) ? "生きた" : "空の"}マス` : ""}`;
    return `<svg viewBox="0 0 ${Z} ${Z}" role="img" aria-label="${al}" class="lgrid">${r.join("")}</svg>`;
  }
  const keyOf = (P) => `${P.kind}:${P.v}`;

  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const LMK = { svgOf, KINDS, BY, GROUPS, GRP_WHY, LV, SRC, PAT, MEDIA, RULE, step, run, fate, nb, cellFate, orient, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = LMK; else root.LMK = LMK;
})(typeof self !== "undefined" ? self : this);
