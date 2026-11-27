// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、ライフゲームのグライダー（5マス）。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const cells = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]].map(([x, y]) => `<rect x="${22 + x * 19}" y="${22 + y * 19}" width="17" height="17" rx="2" fill="${x === 2 && y === 1 ? "#f6d77a" : "#fffdf7"}"/>`).join("");
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#123554"/>${cells}</svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
