// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、遊び方の例だけ（ブリンカーの★は次にどうなる？）。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const on = new Set(["1,3", "2,3", "3,3"]), S = 62, cells = [];
  for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) cells.push(`<rect x="${x * S + 3}" y="${y * S + 3}" width="${S}" height="${S}" fill="${on.has(x + "," + y) ? "#1d2a3f" : "#fff"}" stroke="#1d2a3f40"/>`);
  cells.push(`<rect x="${2 * S + 6}" y="${2 * S + 6}" width="${S - 6}" height="${S - 6}" fill="none" stroke="#b23a24" stroke-width="6"/><text x="${2.5 * S + 3}" y="${2.5 * S + 16}" text-anchor="middle" font-size="40" font-weight="900" fill="#83261a">★</text>`);
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:48px 64px;background:#f3efe4;color:#1d2a3f;display:flex;gap:56px;align-items:center">
    <div style="flex:1">
      <div style="font-size:30px;color:#83261a;letter-spacing:.06em">ライフゲームを2つの見方で読む</div>
      <div style="font-size:104px;font-weight:900;margin-top:8px;line-height:1.15;color:#123554">見方を<br><span style="color:#b23a24">かえる</span></div>
      <div style="font-size:36px;margin-top:14px">★のマスは、<br>次の世代でどうなる？</div>
    </div>
    <svg width="440" height="440" viewBox="0 0 440 440" style="background:#fffdf7;border:4px solid #1d2a3f;border-radius:8px">${cells.join("")}</svg>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
