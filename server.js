/* ============================================================
   BREAKROOM LIVE — Buzzer Mode server
   Express + Socket.IO. Rooms are in-memory (v1).
   Host screen shows questions; players answer on their phones.
   ============================================================ */

import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { QUIZ_PACKS } from "./packs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));
app.get("/healthz", (_req, res) => res.json({ ok: true }));

/* ---------- config ---------- */
const QUESTION_TIME = Number(process.env.QUESTION_TIME || 20); // seconds
const QUESTIONS_PER_GAME = Number(process.env.QUESTIONS_PER_GAME || 6);
const MAX_PLAYERS = 40;

/* ---------- helpers ---------- */
const rooms = new Map(); // code -> room

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I, L, O — avoids misreads
function genCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () =>
      CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join("");
  } while (rooms.has(code));
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepQuestions(pack, count) {
  return shuffle(pack.questions)
    .slice(0, Math.min(count, pack.questions.length))
    .map((item) => {
      const order = shuffle(item.options.map((_, i) => i));
      return {
        q: item.q,
        options: order.map((i) => item.options[i]),
        a: order.indexOf(item.a),
      };
    });
}

function leaderboard(room) {
  return [...room.players.values()]
    .map((p) => ({ name: p.name, score: p.score }))
    .sort((x, y) => y.score - x.score);
}

function playerRank(room, name) {
  return leaderboard(room).findIndex((p) => p.name === name) + 1;
}

/* ---------- game flow ---------- */
function sendQuestion(room) {
  const q = room.questions[room.qi];
  room.phase = "question";
  room.answers = new Map(); // socketId -> { index, ms }
  room.qStart = Date.now();
  const payload = {
    qi: room.qi,
    total: room.questions.length,
    q: q.q,
    options: q.options,
    time: QUESTION_TIME,
  };
  io.to(room.hostId).emit("question:show", payload);
  for (const id of room.players.keys()) {
    io.to(id).emit("question:show", payload);
  }
  clearTimeout(room.timer);
  room.timer = setTimeout(() => endQuestion(room), QUESTION_TIME * 1000 + 400);
}

function endQuestion(room) {
  if (room.phase !== "question") return;
  room.phase = "results";
  clearTimeout(room.timer);

  const q = room.questions[room.qi];
  const counts = q.options.map(() => 0);

  for (const [id, player] of room.players) {
    const ans = room.answers.get(id);
    let gained = 0;
    let correct = false;
    if (ans && ans.index >= 0 && ans.index < q.options.length) {
      counts[ans.index]++;
      if (ans.index === q.a) {
        correct = true;
        const remaining = Math.max(0, QUESTION_TIME * 1000 - ans.ms);
        gained = 100 + Math.round((100 * remaining) / (QUESTION_TIME * 1000));
        player.score += gained;
      }
    }
    player.last = { correct, gained, answered: !!ans };
  }

  const board = leaderboard(room);
  io.to(room.hostId).emit("question:results", {
    qi: room.qi,
    total: room.questions.length,
    correctIndex: q.a,
    counts,
    leaderboard: board,
  });
  for (const [id, player] of room.players) {
    io.to(id).emit("player:result", {
      answered: player.last.answered,
      correct: player.last.correct,
      gained: player.last.gained,
      score: player.score,
      rank: playerRank(room, player.name),
      players: room.players.size,
    });
  }
}

function endGame(room) {
  room.phase = "podium";
  const board = leaderboard(room);
  io.to(room.hostId).emit("game:podium", { leaderboard: board });
  for (const [id, player] of room.players) {
    io.to(id).emit("game:podium", {
      leaderboard: board.slice(0, 3),
      you: { name: player.name, score: player.score, rank: playerRank(room, player.name) },
    });
  }
}

function closeRoom(room, reason) {
  clearTimeout(room.timer);
  for (const id of room.players.keys()) {
    io.to(id).emit("room:closed", { reason });
  }
  rooms.delete(room.code);
}

/* ---------- sockets ---------- */
io.on("connection", (socket) => {
  socket.on("host:create", ({ packId } = {}, ack) => {
    const pack = QUIZ_PACKS[packId] || QUIZ_PACKS.office;
    const code = genCode();
    const room = {
      code,
      hostId: socket.id,
      pack,
      players: new Map(),
      questions: [],
      qi: 0,
      phase: "lobby",
      answers: new Map(),
      timer: null,
    };
    rooms.set(code, room);
    socket.data.roomCode = code;
    socket.data.role = "host";
    ack?.({ ok: true, code, packName: pack.name, questionTime: QUESTION_TIME });
  });

  socket.on("player:join", ({ code, name } = {}, ack) => {
    const room = rooms.get(String(code || "").trim().toUpperCase());
    if (!room) return ack?.({ ok: false, error: "Room not found. Check the code." });
    if (room.phase !== "lobby") return ack?.({ ok: false, error: "That game has already started." });
    if (room.players.size >= MAX_PLAYERS) return ack?.({ ok: false, error: "Room is full." });

    const clean = String(name || "").trim().slice(0, 20);
    if (!clean) return ack?.({ ok: false, error: "Enter a name." });
    const taken = [...room.players.values()].some(
      (p) => p.name.toLowerCase() === clean.toLowerCase()
    );
    if (taken) return ack?.({ ok: false, error: "That name is taken in this room." });

    room.players.set(socket.id, { name: clean, score: 0, last: null });
    socket.data.roomCode = room.code;
    socket.data.role = "player";
    ack?.({ ok: true, code: room.code, name: clean, packName: room.pack.name });
    io.to(room.hostId).emit("lobby:update", {
      players: [...room.players.values()].map((p) => p.name),
    });
  });

  socket.on("host:start", (_payload, ack) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.phase !== "lobby") return;
    if (room.players.size === 0) return ack?.({ ok: false, error: "No players yet." });
    room.questions = prepQuestions(room.pack, QUESTIONS_PER_GAME);
    room.qi = 0;
    ack?.({ ok: true });
    sendQuestion(room);
  });

  socket.on("player:answer", ({ index } = {}, ack) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.phase !== "question") return ack?.({ ok: false });
    if (!room.players.has(socket.id)) return ack?.({ ok: false });
    if (room.answers.has(socket.id)) return ack?.({ ok: false }); // one answer only
    room.answers.set(socket.id, { index: Number(index), ms: Date.now() - room.qStart });
    ack?.({ ok: true });
    io.to(room.hostId).emit("answers:progress", {
      answered: room.answers.size,
      players: room.players.size,
    });
    if (room.answers.size >= room.players.size) endQuestion(room); // everyone's in — end early
  });

  socket.on("host:next", () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id || room.phase !== "results") return;
    if (room.qi + 1 < room.questions.length) {
      room.qi++;
      sendQuestion(room);
    } else {
      endGame(room);
    }
  });

  socket.on("host:end", () => {
    const room = rooms.get(socket.data.roomCode);
    if (room && room.hostId === socket.id) closeRoom(room, "The host ended the game.");
  });

  socket.on("disconnect", () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return;
    if (socket.data.role === "host") {
      closeRoom(room, "The host disconnected.");
    } else if (room.players.has(socket.id)) {
      room.players.delete(socket.id);
      io.to(room.hostId).emit("lobby:update", {
        players: [...room.players.values()].map((p) => p.name),
      });
      // if the last missing answer was theirs, close out the question
      if (
        room.phase === "question" &&
        room.players.size > 0 &&
        room.answers.size >= room.players.size
      ) {
        endQuestion(room);
      }
    }
  });
});

/* ---------- boot ---------- */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Breakroom Live running on http://localhost:${PORT}`);
});
