# ⚽ World Cup 2026 · Predictions Game

**🌐 Language: English | [Español](README.es.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/▶_Play_now-GitHub_Pages-blue)](https://johncardonac.github.io/worldcup-2026-predictions/)

Predict every match of the **FIFA World Cup 2026** (Canada · Mexico · USA), from the group stage all the way to the champion, then compare your predictions against real results and track your accuracy.

A single HTML file. No installation, no account, no server. Your data never leaves your browser.

**▶ Play now: <https://johncardonac.github.io/worldcup-2026-predictions/>**

---

## ✨ Features

- **All 104 real matches** — the official draw, schedule and venues (groups A–L, Jun 11 – Jul 19, 2026).
- **Group stage predictions** — enter your score for the 72 group matches; standings are computed live using the official FIFA criteria (points → goal difference → goals scored).
- **Full knockout bracket** — your bracket is built automatically from your group predictions: winners, runners-up and the 8 best third-placed teams, using the **official FIFA Annex C table (all 495 third-place combinations)**. Predict scores (or just click a winner) all the way to the final. If you predict a draw, click the penalty-shootout winner.
- **Auto-updating real results** — the app refreshes scores automatically (on open and every 3 hours; sources, in order: fixturedownload.com → FIFA API → TheSportsDB). You can also type a score manually.
- **Accuracy & points** — exact scores, correct outcomes (1X2), correct teams per knockout round, and a total score.
- **Today's matches** — big cards with kickoff time **in your local timezone**, venue, your prediction and the live result.
- **Cloud save & global ranking (☁️)** — sign in with just your email (no password): your predictions sync across devices and you compete in a live ranking. Name asked only the first time.
- **Bilingual** — switch Spanish / English anytime (🌐 button).
- **Light & dark mode** — follows your system, or toggle it (☀️/🌙 button).
- **Backup** — export / import all your predictions as a JSON file.

## 🚀 How to use it

**Option 1 — Play online (easiest):**
Open <https://johncardonac.github.io/worldcup-2026-predictions/> in any modern browser. Done.

**Option 2 — Download:**
1. Download [`index.html`](https://raw.githubusercontent.com/JohnCardonaC/worldcup-2026-predictions/main/index.html) (right click → Save as).
2. Double-click the file. It opens in your browser and works offline (the update button needs internet).

**Option 3 — Clone:**
```bash
git clone https://github.com/JohnCardonaC/worldcup-2026-predictions.git
cd worldcup-2026-predictions
open index.html   # macOS — or just double-click it
```

## 🎮 How to play

1. **Group stage tab** — type your predicted score (blue inputs) for the 72 matches. Group tables update as you type.
2. **Knockout tab → "My bracket"** — once your 72 predictions are in, your bracket appears. Type scores or click teams to advance them, round by round, until you crown your champion.
3. During the tournament, real scores load **automatically** into the green inputs, the real bracket builds itself, and **My accuracy** shows how well you did. Predictions lock at each match's kickoff (empty counts as 0–0).

## 🏆 Scoring

| Hit | Points |
|---|---|
| Exact score (groups & knockout) | 3 |
| Correct outcome (1X2) | 1 |
| Correct team in Round of 32 | 1 each |
| Correct team in Round of 16 | 2 each |
| Correct team in Quarterfinals | 3 each |
| Correct team in Semifinals | 5 each |
| Correct finalist | 8 each |
| Correct champion | 13 |

## ☁️ Cloud save & ranking

When you open the game it asks for your **email** (no password, no verification): if it's your first time it also asks for a display name; if you're already registered it logs you straight in, and if your session is already open it asks nothing. Your predictions save automatically. When you register you choose whether to **appear in the public ranking** or keep your score private (changeable later via ☁️); the ranking shows only your name, never your email. Use the same email on another device to continue there, or the ☁️ button to sync/switch account.

How it works: your email is stored with your entry so the game organizer can identify players (e.g. to contact winners). It is **never shown publicly** — the ranking only displays your chosen name. The backend is a tiny AWS Lambda + DynamoDB service (see [`aws/deploy.sh`](aws/deploy.sh) if you want to self-host it: run the script and paste the printed URL into `CLOUD_URL` in `index.html`).

Honest note: there is no authentication. Anyone who knows which email you used could load or overwrite your cloud save. It's a game between friends — don't store anything sensitive.

## 🔒 Privacy

Everything is stored in your browser's `localStorage` and synced to the game's database: your email (visible only to the organizer, never in the public ranking), your display name and your predictions. No tracking beyond that. Use **Export** to back up your predictions and **Import** to restore them.

## ⚠️ Limitations

- FIFA's tiebreakers 4–6 (disciplinary points and FIFA ranking) can't be computed from scores alone; in that rare case the app falls back to draw position. Standings could differ from official ones only in extreme ties.
- Free data sources may lag a few hours behind live results — you can always type a result manually (green inputs).
- Penalty shootouts: if a real knockout match ends in a draw and the source doesn't report the shootout, click the winner in the real bracket.

## 🛠 Tech

One self-contained HTML file: vanilla JavaScript, no frameworks, no build step, no dependencies. Match data (draw, schedule, venues, bracket structure and the 495 third-place combinations from the FIFA regulations) is embedded.

## 📄 License

[MIT](LICENSE) — do whatever you want, no warranty.

Data sources: official FIFA match schedule & regulations (via Wikipedia), fixturedownload.com, TheSportsDB.
