/* E2E test: host + 3 players play a full game over real sockets.
   Run: node server.js &  then  node test/e2e.js */

import { io } from "socket.io-client";

const URL = process.env.TEST_URL || "http://localhost:3000";
const fail = (msg) => { console.error("❌ FAIL:", msg); process.exit(1); };
const ok = (msg) => console.log("✅", msg);

const host = io(URL);
const players = ["Amina", "Tunde", "Chiamaka"].map((name) => ({ name, sock: io(URL), score: 0, results: [] }));

let roomCode = null;
let questionsSeen = 0;
let hostResults = [];

function hostCreate() {
  return new Promise((res) => {
    host.emit("host:create", { packId: "tech" }, (r) => {
      if (!r?.ok || !/^[A-Z]{4}$/.test(r.code)) fail("host:create did not return a 4-letter code");
      roomCode = r.code;
      ok(`Room created: ${r.code} (${r.packName})`);
      res();
    });
  });
}

function joinAll() {
  return Promise.all(
    players.map(
      (p) =>
        new Promise((res) => {
          p.sock.emit("player:join", { code: roomCode.toLowerCase(), name: p.name }, (r) => {
            if (!r?.ok) fail(`${p.name} could not join: ${r?.error}`);
            res();
          });
        })
    )
  );
}

function testJoinValidation() {
  return new Promise((res) => {
    const ghost = io(URL);
    ghost.emit("player:join", { code: "ZZZZ", name: "Ghost" }, (r1) => {
      if (r1?.ok) fail("joined a nonexistent room");
      ghost.emit("player:join", { code: roomCode, name: "amina" }, (r2) => {
        if (r2?.ok) fail("duplicate name was allowed");
        ok("Join validation: bad code rejected, duplicate name rejected");
        ghost.close();
        res();
      });
    });
  });
}

const done = new Promise((resolve) => {
  // Host listens
  host.on("lobby:update", ({ players: names }) => {
    if (names.length === 3) ok(`Lobby shows all players: ${names.join(", ")}`);
  });

  host.on("question:show", (q) => {
    questionsSeen++;
    if (!q.q || q.options.length !== 4) fail("malformed question payload");
    // players answer: index 0..3 spread; NOTE options are shuffled so correctness varies
    players.forEach((p, i) => {
      setTimeout(() => {
        p.sock.emit("player:answer", { index: i % 4 }, (r) => {
          if (!r?.ok) fail(`${p.name} answer rejected`);
          // double-answer must be rejected
          p.sock.emit("player:answer", { index: 0 }, (r2) => {
            if (r2?.ok) fail("double answer was accepted");
          });
        });
      }, 30 * (i + 1));
    });
  });

  host.on("question:results", (r) => {
    hostResults.push(r);
    const totalAnswers = r.counts.reduce((a, b) => a + b, 0);
    if (totalAnswers !== 3) fail(`expected 3 answers tallied, got ${totalAnswers}`);
    setTimeout(() => host.emit("host:next"), 50);
  });

  host.on("game:podium", ({ leaderboard }) => {
    if (leaderboard.length !== 3) fail("podium leaderboard missing players");
    ok(`Podium reached after ${questionsSeen} questions. Winner: ${leaderboard[0].name} (${leaderboard[0].score} pts)`);
    resolve(leaderboard);
  });

  // Players listen
  players.forEach((p) => {
    p.sock.on("player:result", (r) => {
      p.results.push(r);
      if (r.correct && r.gained < 100) fail("correct answer earned less than base 100");
      if (!r.correct && r.gained !== 0) fail("incorrect answer earned points");
      p.score = r.score;
    });
  });
});

const run = async () => {
  await new Promise((r) => host.on("connect", r));
  await hostCreate();
  await joinAll();
  await testJoinValidation();

  await new Promise((res) => {
    host.emit("host:start", {}, (r) => {
      if (!r?.ok) fail("host:start failed");
      ok("Game started (questions end early once everyone answers — no 20s waits)");
      res();
    });
  });

  const board = await done;

  // cross-check: server leaderboard matches sum of per-question gains each player saw
  for (const p of players) {
    const summed = p.results.reduce((a, r) => a + r.gained, 0);
    const serverScore = board.find((x) => x.name === p.name)?.score;
    if (summed !== serverScore) fail(`${p.name}: client-observed gains (${summed}) != server score (${serverScore})`);
  }
  ok("Score integrity: every player's gains sum to their server-side total");
  ok(`Questions played: ${questionsSeen} · results events: ${hostResults.length}`);

  console.log("\n🎉 ALL TESTS PASSED");
  host.close();
  players.forEach((p) => p.sock.close());
  process.exit(0);
};

setTimeout(() => fail("test timed out"), 30000);
run();
