# Breakroom Live — Buzzer Mode

Kahoot-style multiplayer trivia: the host puts the game on a big screen (or shares it on a call),
players join from their phones with a 4-letter room code, and the fastest correct answers win.

## How it works

- **Host** opens the site → "Host a game" → picks a question pack → gets a room code.
- **Players** open the same site on their phones → "Join a game" → enter the code + a name.
- Host starts. Each question runs 20 seconds; a correct answer scores **100 + up to 100 speed bonus**.
- Rounds end early once everyone has answered. Leaderboard between questions, podium at the end.
- Up to 40 players per room. Scoring is fully server-side — clients never see the correct answer
  until results, so it can't be sniffed from the phone.

## Run locally

```bash
npm install
npm start          # → http://localhost:3000
```

Open one browser tab as host and a couple more (or your phone on the same Wi-Fi,
via your computer's local IP, e.g. http://192.168.x.x:3000) as players.

## Run the automated test

```bash
npm start &        # in one terminal
npm test           # in another — simulates a host + 3 players through a full game
```

## Deploy (Render — free tier, ~5 minutes)

1. Push this folder to a GitHub repository.
2. Go to https://render.com → New → **Web Service** → connect the repo.
3. Settings: Runtime **Node**, Build Command `npm install`, Start Command `npm start`.
4. Create the service. Render sets `PORT` automatically; the server reads it.
5. Share the URL (e.g. `https://your-app.onrender.com`) — that's the game.

Railway.app and Fly.io work the same way (Node app, `npm start`, respects `PORT`).

**Free-tier note:** Render's free instances sleep after ~15 minutes idle; the first visit
after a sleep takes ~30–60s to wake. Fine for testing — upgrade or switch host for real events.

## Configuration (environment variables)

| Variable             | Default | Meaning                        |
| -------------------- | ------- | ------------------------------ |
| `PORT`               | 3000    | HTTP port                      |
| `QUESTION_TIME`      | 20      | Seconds per question           |
| `QUESTIONS_PER_GAME` | 6       | Questions drawn per game       |

## Known v1 limits (by design, for now)

- Rooms live in memory: a server restart/redeploy drops active games.
- One server instance only (no horizontal scaling yet — needs Redis for that).
- Players can't rejoin after a disconnect mid-game.
- Question packs are the three built-ins in `packs.js`; custom pack support is the next milestone.

## First-test checklist

1. Deploy, open the URL on a laptop → Host a game → Watercooler Trivia.
2. Have 2–3 colleagues open the URL on their phones → Join with the code.
3. Confirm: names appear in the lobby as people join.
4. Start. Confirm: question on the big screen, answer buttons on phones, timer counts down.
5. Confirm: round ends the moment everyone has answered; results + leaderboard show.
6. Play to the podium. Then collect feedback: was 20s right? 6 questions enough?
