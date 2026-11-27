# AGENTS.md

見方をかえる：ライフゲーム（コンウェイ）の盤を、1段目「マスの見方」（★のマスは次にどうなる・次に生きているマスはいくつ・グライダーはどちらへ）と、2段目「設計の見方」（このまま進むと盤の全体はどうなる）の2段で読む1日5問の学習ゲーム。きまりやデネットの考え方の問題も出る。`index.html` と `data.js`（問題の種類と、きまりで世代を進める step）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（30種類×3000問：選び肢・答えは1つ・答えと2段目を、data.js と別に書いたきまりで世代を進めて確かめる・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 中身は LifeWiki「Conway's Game of Life」のきまり（B3/S23）・形の名前と、デネット「Real Patterns」（1991）・Reason 誌のデネットへのインタビュー（2003）に書いてあることだけ（2026-11-27 に読んだ。要点は共有フォルダ games/life-mikata-research.md）。「マスの見方」「設計の見方」は、デネットの physical level・design level を短くまとめた呼び名。決まりの問題を足すときも出典を読み、`qa/run.mjs` の `FACT` にも足す。
- 盤の問題の答え（1段目と2段目）は、data.js の `step()` で世代を進めて決める。`qa/run.mjs` は2次元の配列で別に書いたきまりで同じ答えになるかを見る。形を足したら、2段目（消える・止まる・くり返す・進む）が向き8通り・置き場所によらず同じになるかも QA が見る。
- 盤は果てのない平面の一部を切り取って見せている（盤の外は空のマス）。この言い方を遊び方・「このゲームについて」・README に置く（QA が見る）。
- 1段目は3つの形：★のマスの行き先（生まれる・生き残る・消える・空のまま。まず答えの種類を決めてからマスを選ぶ）・次の世代の生きたマスの数・グライダーの動き（4世代で1マス、ずっと先は4×n世代）。やさしいは選び肢3つ、ふつう・むずかしいは4つ。決まりの問題は答え1つとまちがい2〜3つで、2段目は無い。2回目のヒントはまちがいを消して2つにしぼり、きまり（`key`）も見せる。解いたあとは「＋1世代」「＋10世代」で、その後の盤を見られる。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`KINDS`・形・言い回し・まちがいの選び肢は、足すだけでも過去の日の問題が変わる。公開後は変えず、変えるときは QA の `PINS`（3日分の5問と上級）を作り直して理由を PR に書く。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。盤の★は太い枠と★の字で示す（色だけで分けない）。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「設計の見方」・復習（1→3→7日後）。記録 `lmk-v1`・文字 `lmk-fs`・復習 `lmk-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は風力階級よみ（fuuryoku-yomi）から写した（ひな形の部品は `node scripts/new-game.mjs` で入れた）。写し元の言葉が残っていないかを QA が見る。保存の読み直しは共通部品 GameStore（`<!-- store:begin -->`〜`end`。shared-workflows `template/store/store.js` の写しで、ここでは直さない）。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
