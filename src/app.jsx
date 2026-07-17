import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

/* ============================================================
   BREAKROOM — games for teams that work together
   v1: Quiz Blitz (Kahoot-style, pass-and-play),
       Who Said It? (know your colleagues),
       Emoji Decode (shout-it-out party round)
   ============================================================ */

/* ---------- data ---------- */

const QUIZ_PACKS = {
  office: {
    id: "office",
    name: "Watercooler Trivia",
    tag: "Office life & general knowledge",
    color: "var(--sun)",
    questions: [
      { q: "Which company popularized '20% time' for employee side projects?", options: ["Google", "Apple", "Netflix", "IBM"], a: 0 },
      { q: "In workplace shorthand, what does EOD usually mean?", options: ["End of day", "Every other day", "Email on delivery", "End of discussion"], a: 0 },
      { q: "Post-it Notes were invented at which company?", options: ["3M", "Staples", "Xerox", "Bic"], a: 0 },
      { q: "Which of these was patented first?", options: ["The fax machine", "The telephone", "The lightbulb", "The typewriter"], a: 0 },
      { q: "In business speak, a 'BHAG' is a…", options: ["Big Hairy Audacious Goal", "Budget Held Against Growth", "Board-Handled Agenda Group", "Backup Hiring Action Guide"], a: 0 },
      { q: "Roughly how many cups of coffee does the world drink every day?", options: ["2 billion", "200 million", "500 million", "10 billion"], a: 0 },
      { q: "The word 'boycott' comes from…", options: ["A real person's surname", "A Latin phrase", "A shipping term", "A card game"], a: 0 },
      { q: "Parkinson's Law says that work…", options: ["Expands to fill the time available", "Shrinks under pressure", "Doubles every seven years", "Moves to whoever is quietest"], a: 0 },
      { q: "The first known email was sent in…", options: ["1971", "1985", "1962", "1993"], a: 0 },
      { q: "The QWERTY keyboard layout was originally designed to…", options: ["Reduce typewriter jams", "Speed up typing", "Fit smaller desks", "Match the alphabet"], a: 0 },
    ],
  },
  tech: {
    id: "tech",
    name: "Tech & Tools",
    tag: "Software, shortcuts & internet lore",
    color: "var(--mint)",
    questions: [
      { q: "Slack started life as an internal tool at a company building…", options: ["A video game", "A dating app", "A bank", "A search engine"], a: 0 },
      { q: "Ctrl/Cmd + Shift + V usually does what?", options: ["Paste without formatting", "Paste as image", "Undo a paste", "Open clipboard history"], a: 0 },
      { q: "The first recorded computer 'bug' was literally…", options: ["A moth", "A spider", "A typo", "A coffee stain"], a: 0 },
      { q: "What does PDF stand for?", options: ["Portable Document Format", "Printed Data File", "Public Document Form", "Packaged Digital File"], a: 0 },
      { q: "Which programming language is the oldest?", options: ["COBOL", "Python", "Java", "JavaScript"], a: 0 },
      { q: "'Wi-Fi' officially stands for…", options: ["Nothing — it's a made-up brand name", "Wireless Fidelity", "Wide Frequency", "Wired-Free Internet"], a: 0 },
      { q: "Bluetooth is named after…", options: ["A Viking king", "Its inventor's dog", "A blue LED", "A dental ad"], a: 0 },
      { q: "Before it was Google, the search engine was called…", options: ["BackRub", "SearchIt", "WebCrawl", "PageOne"], a: 0 },
      { q: "In spreadsheets, VLOOKUP searches for a value in…", options: ["The first column of a range", "The last row", "Every cell at once", "Hidden sheets only"], a: 0 },
      { q: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Traffic Transfer Point", "Hyperlink Text Placement", "Host To Terminal Protocol"], a: 0 },
    ],
  },
  teasers: {
    id: "teasers",
    name: "Brain Teasers",
    tag: "Quick logic under pressure",
    color: "var(--coral)",
    questions: [
      { q: "A meeting starts at 9:45 and runs 100 minutes. When does it end?", options: ["11:25", "11:45", "10:45", "11:05"], a: 0 },
      { q: "Which weighs more: a kilogram of feathers or a kilogram of staplers?", options: ["They weigh the same", "The staplers", "The feathers", "Depends on altitude"], a: 0 },
      { q: "Two typists type two pages in two minutes. How many typists type 18 pages in six minutes?", options: ["6", "18", "9", "3"], a: 0 },
      { q: "What comes next: 2, 6, 12, 20, 30, …", options: ["42", "40", "36", "45"], a: 0 },
      { q: "How many months have 28 days?", options: ["12", "1", "2", "11"], a: 0 },
      { q: "A farmer has 17 sheep. All but 9 run away. How many are left?", options: ["9", "8", "17", "26"], a: 0 },
      { q: "I'm light as a feather, but the strongest person can't hold me for five minutes. What am I?", options: ["Breath", "A shadow", "A thought", "Wi-Fi signal"], a: 0 },
      { q: "What comes next: 1, 1, 2, 3, 5, 8, …", options: ["13", "11", "12", "16"], a: 0 },
      { q: "If yesterday was two days before Friday, what day is tomorrow?", options: ["Friday", "Thursday", "Saturday", "Sunday"], a: 0 },
      { q: "A report has 100 pages. How many times does the digit 9 appear in the page numbers?", options: ["20", "10", "11", "19"], a: 0 },
    ],
  },
};

const WHO_PROMPTS = [
  "My dream job as a kid was…",
  "An unpopular opinion I will defend in any meeting:",
  "My go-to karaoke song is…",
  "A skill I have that isn't on my CV:",
  "The weirdest thing I've ever eaten:",
  "If I won the lottery tomorrow, the first thing I'd do is…",
  "My most irrational fear:",
  "A show I've rewatched more than twice:",
  "My guilty-pleasure snack on deadline days:",
  "The most-used app on my phone (that isn't messaging):",
  "Something on my bucket list that might surprise people:",
  "My first-ever job was…",
];

const EMOJI_PUZZLES = [
  { cat: "Workplace phrase", e: "🧠🌩️", ans: "Brainstorm" },
  { cat: "Workplace phrase", e: "🤔🚫📦", ans: "Think outside the box" },
  { cat: "Workplace phrase", e: "⬇️🍎🌳", ans: "Low-hanging fruit" },
  { cat: "Workplace phrase", e: "⭕️🔙", ans: "Circle back" },
  { cat: "Workplace phrase", e: "🎣📧", ans: "Phishing email" },
  { cat: "Workplace phrase", e: "🚩🚩🚩", ans: "Red flags" },
  { cat: "Workplace phrase", e: "🐘🚪🏢", ans: "The elephant in the room" },
  { cat: "Movie", e: "🦈🎶🌊", ans: "Jaws" },
  { cat: "Movie", e: "👑🦁", ans: "The Lion King" },
  { cat: "Movie", e: "🚢🧊💔", ans: "Titanic" },
  { cat: "Movie", e: "🕷️🧑", ans: "Spider-Man" },
  { cat: "Movie", e: "🤖❤️🌱", ans: "WALL-E" },
  { cat: "Movie", e: "❄️👭👑", ans: "Frozen" },
  { cat: "Movie", e: "🧸🤠🚀", ans: "Toy Story" },
];

const POLL_QUESTIONS = [
  { a: "Camera on", b: "Camera off" },
  { a: "Early bird", b: "Night owl" },
  { a: "Coffee", b: "Tea" },
  { a: "Work from home forever", b: "Office with the team" },
  { a: "Send a Slack message", b: "Just call them" },
  { a: "Inbox zero", b: "10,000 unread" },
  { a: "Desk lunch", b: "Proper lunch break" },
  { a: "Music while working", b: "Total silence" },
  { a: "One 3-hour meeting", b: "Six 30-minute meetings" },
  { a: "Keyboard shortcuts", b: "Mouse for everything" },
  { a: "Plan every detail", b: "Wing it" },
  { a: "Pineapple on pizza", b: "Absolutely not" },
  { a: "Cats", b: "Dogs" },
  { a: "Beach holiday", b: "Mountain holiday" },
  { a: "Text updates", b: "Voice notes" },
  { a: "Monday morning workout", b: "Friday night out" },
  { a: "Standing desk", b: "Sitting comfy" },
  { a: "Hot-desking", b: "My desk, my kingdom" },
];

const ICEBREAKERS = {
  light: {
    name: "Light",
    color: "var(--sun)",
    items: [
      "What's your most-used emoji, and what does it say about you?",
      "What snack could you not live without?",
      "What was your first-ever screen name or email address?",
      "Pancakes or waffles — defend your answer.",
      "What's the best small purchase you've made this year?",
      "What song is currently stuck in your head?",
      "What's your comfort rewatch show?",
      "If your mood today were a weather forecast, what would it be?",
      "What food combination do you love that others find strange?",
      "Which app do you open first in the morning?",
    ],
  },
  deep: {
    name: "Deep-ish",
    color: "var(--mint)",
    items: [
      "What's a piece of advice you got years ago that still holds up?",
      "What skill would you learn instantly if you could?",
      "What's something you've changed your mind about in the last five years?",
      "Who had the biggest influence on your career so far?",
      "What does a perfect day off look like for you?",
      "What's a small habit that quietly improved your life?",
      "What's something you're proud of that you rarely mention?",
      "If you could send one line to yourself ten years ago, what would it say?",
      "What's a fear you've mostly conquered?",
      "You get a fully free year, money not a problem. What do you do with it?",
    ],
  },
  work: {
    name: "Work",
    color: "var(--violet)",
    items: [
      "What's the best team ritual you've ever been part of?",
      "Describe your job badly in five words or fewer.",
      "What's your most productive hour of the day, honestly?",
      "What tool or shortcut saves you the most time?",
      "What's the strangest job you've ever had?",
      "Meetings before 9am: give us your honest verdict.",
      "What's one thing this team does better than any team you've worked with?",
      "If you swapped jobs with anyone in the company for a day, who would it be?",
      "What's the best piece of feedback you've ever received?",
      "What did you want to be at age 10 — and how close did you get?",
    ],
  },
  wild: {
    name: "Wild",
    color: "var(--coral)",
    items: [
      "One hundred duck-sized horses or one horse-sized duck. Choose your battle.",
      "What's your zombie-apocalypse role on this team?",
      "If you had a walk-up song for entering meetings, what would it be?",
      "What animal could you beat in a staring contest?",
      "You get a billboard the whole city sees. What does it say?",
      "What hill are you prepared to (metaphorically) die on?",
      "If your life had a narrator, whose voice would it be?",
      "Invent a conspiracy theory about the office printer.",
      "You can only eat one cuisine for a year — which one?",
      "What would your autobiography be titled?",
    ],
  },
};

/* ---------- helpers ---------- */

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const prepQuestions = (pack, count) =>
  shuffle(pack.questions)
    .slice(0, Math.min(count, pack.questions.length))
    .map((item) => {
      const order = shuffle(item.options.map((_, i) => i));
      return {
        q: item.q,
        options: order.map((i) => item.options[i]),
        a: order.indexOf(item.a),
      };
    });

/* custom pack persistence — uses window.storage inside claude.ai artifacts,
   falls back to localStorage on the deployed website */
const PACKS_KEY = "breakroom_custom_packs";
const CUSTOM_COLORS = ["var(--coral)", "var(--violet)", "var(--sun)", "var(--mint)"];

const storageBackend =
  typeof window !== "undefined" && window.storage
    ? window.storage
    : {
        async get(key) {
          const v = localStorage.getItem(key);
          if (v === null) throw new Error("not found");
          return { key, value: v };
        },
        async set(key, value) {
          localStorage.setItem(key, value);
          return { key, value };
        },
      };

async function loadCustomPacks() {
  try {
    const result = await storageBackend.get(PACKS_KEY);
    return result ? JSON.parse(result.value) : [];
  } catch {
    return []; // key doesn't exist yet
  }
}

async function saveCustomPacks(packs) {
  try {
    await storageBackend.set(PACKS_KEY, JSON.stringify(packs));
    return true;
  } catch (err) {
    console.error("Could not save quizzes:", err);
    return false;
  }
}

const STICKY = [
  { bg: "#FFE066", sym: "▲" },
  { bg: "#FF8A7A", sym: "●" },
  { bg: "#7EE0B8", sym: "■" },
  { bg: "#B7A6FF", sym: "◆" },
];

const sortByScore = (scores) =>
  Object.entries(scores).sort((x, y) => y[1] - x[1]);

/* ---------- shared UI ---------- */

function Chrome({ children, onHome }) {
  return (
    <div className="shell">
      <header className="topbar">
        <button className="wordmark" onClick={onHome} aria-label="Back to home">
          BREAK<span className="hl">ROOM</span>
        </button>
        <span className="topbar-note">pass-and-play · one device</span>
      </header>
      {children}
    </div>
  );
}

function Leaderboard({ scores, title = "Leaderboard" }) {
  const rows = sortByScore(scores);
  return (
    <div className="card board">
      <div className="eyebrow">{title}</div>
      {rows.map(([name, pts], i) => (
        <div key={name} className={"board-row" + (i === 0 ? " leader" : "")}>
          <span className="board-rank">{i + 1}</span>
          <span className="board-name">{name}</span>
          <span className="board-pts">{pts}</span>
        </div>
      ))}
    </div>
  );
}

function Podium({ scores, onReplay, onHome, replayLabel = "Play again" }) {
  const rows = sortByScore(scores);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <main className="stage center">
      <div className="eyebrow">Final scores</div>
      <h2 className="stage-title">
        {rows.length > 0 ? `${rows[0][0]} takes it!` : "Game over"}
      </h2>
      <div className="card board podium">
        {rows.map(([name, pts], i) => (
          <div key={name} className={"board-row" + (i === 0 ? " leader" : "")}>
            <span className="board-rank">{medals[i] || i + 1}</span>
            <span className="board-name">{name}</span>
            <span className="board-pts">{pts}</span>
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn primary" onClick={onReplay}>{replayLabel}</button>
        <button className="btn" onClick={onHome}>Back to games</button>
      </div>
    </main>
  );
}

function PlayerSetup({ title, blurb, accent, minPlayers, onBack, onStart, children, startLabel = "Start game" }) {
  const [players, setPlayers] = useState([]);
  const [draft, setDraft] = useState("");

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    if (players.some((p) => p.toLowerCase() === name.toLowerCase())) { setDraft(""); return; }
    if (players.length >= 12) return;
    setPlayers([...players, name]);
    setDraft("");
  };

  const ready = players.length >= minPlayers;

  return (
    <main className="stage">
      <button className="backlink" onClick={onBack}>← All games</button>
      <div className="eyebrow" style={{ background: accent }}>{title}</div>
      <p className="blurb">{blurb}</p>

      <div className="card">
        <label className="field-label" htmlFor="player-input">
          Who's playing? <span className="muted">(at least {minPlayers})</span>
        </label>
        <div className="add-row">
          <input
            id="player-input"
            value={draft}
            placeholder="Type a name"
            maxLength={20}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn small" onClick={add}>Add</button>
        </div>
        <div className="chips">
          {players.map((p) => (
            <button
              key={p}
              className="chip"
              onClick={() => setPlayers(players.filter((x) => x !== p))}
              title="Tap to remove"
            >
              {p} ✕
            </button>
          ))}
          {players.length === 0 && <span className="muted">No players yet — add the room.</span>}
        </div>
      </div>

      {children}

      <button className="btn primary wide" disabled={!ready} onClick={() => onStart(players)}>
        {ready ? startLabel : `Add ${minPlayers - players.length} more player${minPlayers - players.length === 1 ? "" : "s"}`}
      </button>
    </main>
  );
}

function AwardChips({ players, exclude, selected, onToggle }) {
  return (
    <div className="chips award">
      {players.filter((p) => p !== exclude).map((p) => (
        <button
          key={p}
          className={"chip big" + (selected.has(p) ? " on" : "")}
          onClick={() => onToggle(p)}
        >
          {selected.has(p) ? "✓ " : ""}{p}
        </button>
      ))}
    </div>
  );
}

/* ---------- game 1: Quiz Blitz ---------- */

const QUIZ_TIME = 20;

function QuizGame({ players, pack, onHome, onReplay }) {
  const [questions] = useState(() => prepQuestions(pack, 6));
  const [scores, setScores] = useState(() => Object.fromEntries(players.map((p) => [p, 0])));
  const [qi, setQi] = useState(0);
  const [pi, setPi] = useState(0);
  const [phase, setPhase] = useState("pass"); // pass | question | feedback | board | podium
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [picked, setPicked] = useState(null);
  const [gained, setGained] = useState(0);

  const question = questions[qi];
  const player = players[pi];

  useEffect(() => {
    if (phase !== "question") return;
    if (timeLeft <= 0) { setPicked(-1); setGained(0); setPhase("feedback"); return; }
    const t = setTimeout(() => setTimeLeft((s) => Math.max(0, +(s - 0.1).toFixed(1))), 100);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const answer = (i) => {
    if (phase !== "question") return;
    const correct = i === question.a;
    const pts = correct ? 100 + Math.round((100 * timeLeft) / QUIZ_TIME) : 0;
    setPicked(i);
    setGained(pts);
    if (pts) setScores((s) => ({ ...s, [player]: s[player] + pts }));
    setPhase("feedback");
  };

  const advance = () => {
    if (pi + 1 < players.length) {
      setPi(pi + 1);
      setPhase("pass");
    } else {
      setPhase("board");
    }
    setPicked(null);
    setTimeLeft(QUIZ_TIME);
  };

  const nextQuestion = () => {
    if (qi + 1 < questions.length) {
      setQi(qi + 1);
      setPi(0);
      setPhase("pass");
      setTimeLeft(QUIZ_TIME);
    } else {
      setPhase("podium");
    }
  };

  if (phase === "podium") {
    return <Podium scores={scores} onReplay={onReplay} onHome={onHome} />;
  }

  if (phase === "board") {
    return (
      <main className="stage center">
        <div className="eyebrow">After question {qi + 1} of {questions.length}</div>
        <Leaderboard scores={scores} />
        <button className="btn primary wide" onClick={nextQuestion}>
          {qi + 1 < questions.length ? "Next question →" : "See final scores"}
        </button>
      </main>
    );
  }

  if (phase === "pass") {
    return (
      <main className="stage center">
        <div className="eyebrow">Question {qi + 1} of {questions.length}</div>
        <h2 className="stage-title pass-title">Pass the device to</h2>
        <div className="pass-name">{player}</div>
        <p className="muted">No peeking, everyone else. Same question, fastest correct answer wins the most points.</p>
        <button className="btn primary wide" onClick={() => setPhase("question")}>
          I'm {player} — show the question
        </button>
      </main>
    );
  }

  const pct = Math.max(0, (timeLeft / QUIZ_TIME) * 100);

  return (
    <main className="stage">
      <div className="quiz-meta">
        <span className="eyebrow">Q{qi + 1} · {player}</span>
        <span className="timer-num">{Math.ceil(timeLeft)}s</span>
      </div>
      <div className="timer-track" aria-hidden="true">
        <div className="timer-fill" style={{ width: pct + "%" }} />
      </div>

      <h2 className="question">{question.q}</h2>

      <div className="sticky-grid">
        {question.options.map((opt, i) => {
          let cls = "sticky";
          if (phase === "feedback") {
            if (i === question.a) cls += " right";
            else if (i === picked) cls += " wrong";
            else cls += " dim";
          }
          return (
            <button
              key={i}
              className={cls}
              style={{ background: STICKY[i].bg, "--tilt": `${(i % 2 ? 1 : -1) * (1 + i * 0.4)}deg` }}
              onClick={() => answer(i)}
              disabled={phase === "feedback"}
            >
              <span className="sticky-sym">{STICKY[i].sym}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {phase === "feedback" && (
        <div className="feedback">
          <div className={"verdict " + (picked === question.a ? "good" : "bad")}>
            {picked === -1 ? "Time's up!" : picked === question.a ? `Correct! +${gained} pts` : "Not this time — 0 pts"}
          </div>
          <button className="btn primary wide" onClick={advance}>
            {pi + 1 < players.length ? `Pass to ${players[pi + 1]} →` : "Show leaderboard"}
          </button>
        </div>
      )}
    </main>
  );
}

function QuizSetup({ onBack, onStart, customPacks, onStudio }) {
  const [packId, setPackId] = useState("office");
  const allPacks = [...Object.values(QUIZ_PACKS), ...customPacks];
  const selected = allPacks.find((p) => p.id === packId) || QUIZ_PACKS.office;

  return (
    <PlayerSetup
      title="Quiz Blitz"
      blurb="One device, everyone plays. Each player answers the same timed question in turn — correct answers score 100 points plus a speed bonus. Leaderboard between rounds, podium at the end."
      accent="var(--sun)"
      minPlayers={1}
      onBack={onBack}
      onStart={(players) => onStart(players, selected)}
    >
      <div className="card">
        <div className="field-label">Pick a question pack</div>
        <div className="pack-row">
          {Object.values(QUIZ_PACKS).map((p) => (
            <button
              key={p.id}
              className={"pack" + (packId === p.id ? " on" : "")}
              style={{ "--pack": p.color }}
              onClick={() => setPackId(p.id)}
            >
              <strong>{p.name}</strong>
              <span>{p.tag}</span>
            </button>
          ))}
        </div>

        {customPacks.length > 0 && (
          <>
            <div className="field-label pack-divider">Your quizzes</div>
            <div className="pack-row">
              {customPacks.map((p, i) => (
                <button
                  key={p.id}
                  className={"pack" + (packId === p.id ? " on" : "")}
                  style={{ "--pack": CUSTOM_COLORS[i % CUSTOM_COLORS.length] }}
                  onClick={() => setPackId(p.id)}
                >
                  <strong>{p.name}</strong>
                  <span>{p.questions.length} question{p.questions.length === 1 ? "" : "s"} · up to {Math.min(6, p.questions.length)} per game</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button className="linkish" onClick={onStudio}>
          {customPacks.length ? "Manage your quizzes in Quiz Studio →" : "+ Build your own pack in Quiz Studio"}
        </button>
      </div>
    </PlayerSetup>
  );
}

/* ---------- Quiz Studio: build, edit & manage custom packs ---------- */

function Studio({ packs, onNew, onEdit, onDelete, onBack, onPlay }) {
  const [confirming, setConfirming] = useState(null);
  return (
    <main className="stage">
      <button className="backlink" onClick={onBack}>← All games</button>
      <div className="eyebrow" style={{ background: "var(--coral)" }}>Quiz Studio</div>
      <p className="blurb">
        Write question packs for anything your team should be quizzed on — onboarding, product
        knowledge, compliance refreshers, inside jokes. Saved packs are kept for you and show up
        in Quiz Blitz whenever you play.
      </p>

      <button className="btn primary wide" onClick={onNew}>+ New quiz</button>

      {packs.length === 0 ? (
        <div className="card">
          <span className="muted">Nothing here yet. Build your first pack — three questions is enough to play.</span>
        </div>
      ) : (
        packs.map((p) => (
          <div key={p.id} className="card studio-row">
            <div className="studio-info">
              <strong>{p.name}</strong>
              <span className="muted">{p.questions.length} question{p.questions.length === 1 ? "" : "s"}</span>
            </div>
            <div className="studio-actions">
              <button className="btn small" onClick={() => onPlay(p)}>Play</button>
              <button className="btn small" onClick={() => onEdit(p)}>Edit</button>
              {confirming === p.id ? (
                <button className="btn small danger" onClick={() => { onDelete(p.id); setConfirming(null); }}>
                  Confirm delete
                </button>
              ) : (
                <button className="btn small" onClick={() => setConfirming(p.id)}>Delete</button>
              )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}

const emptyForm = () => ({ q: "", opts: ["", "", "", ""], correct: 0 });

function QuizBuilder({ initial, onSave, onBack }) {
  const [name, setName] = useState(initial ? initial.name : "");
  const [questions, setQuestions] = useState(initial ? [...initial.questions] : []);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const filled = form.opts.map((o) => o.trim());
  const filledCount = filled.filter(Boolean).length;
  const formReady = form.q.trim() && filledCount >= 2 && filled[form.correct];

  const setOpt = (i, v) => {
    const opts = [...form.opts];
    opts[i] = v;
    setForm({ ...form, opts });
  };

  const addQuestion = () => {
    if (!formReady) return;
    const options = [];
    let a = 0;
    filled.forEach((o, i) => {
      if (o) {
        if (i === form.correct) a = options.length;
        options.push(o);
      }
    });
    setQuestions([...questions, { q: form.q.trim(), options, a }]);
    setForm(emptyForm());
  };

  const editQuestion = (idx) => {
    const item = questions[idx];
    const opts = [...item.options];
    while (opts.length < 4) opts.push("");
    setForm({ q: item.q, opts, correct: item.a });
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const canSave = name.trim() && questions.length >= 3;

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    await onSave({
      id: initial ? initial.id : "custom_" + Date.now(),
      name: name.trim(),
      custom: true,
      questions,
    });
    setSaving(false);
  };

  return (
    <main className="stage">
      <button className="backlink" onClick={onBack}>← Quiz Studio</button>
      <div className="eyebrow" style={{ background: "var(--coral)" }}>
        {initial ? "Edit quiz" : "New quiz"}
      </div>

      <div className="card">
        <label className="field-label" htmlFor="quiz-name">Quiz name</label>
        <input
          id="quiz-name"
          value={name}
          maxLength={40}
          placeholder="e.g. Product Knowledge 101, New Joiner Trivia…"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="field-label">
          Add a question <span className="muted">(2–4 answers, tap ✓ to mark the correct one)</span>
        </div>
        <input
          value={form.q}
          maxLength={160}
          placeholder="Type the question…"
          onChange={(e) => setForm({ ...form, q: e.target.value })}
        />
        <div className="opt-list">
          {form.opts.map((opt, i) => (
            <div key={i} className="opt-row">
              <button
                className={"opt-correct" + (form.correct === i ? " on" : "")}
                onClick={() => setForm({ ...form, correct: i })}
                aria-label={"Mark answer " + (i + 1) + " as correct"}
                title="Mark as the correct answer"
              >
                ✓
              </button>
              <input
                value={opt}
                maxLength={80}
                placeholder={i < 2 ? `Answer ${i + 1}` : `Answer ${i + 1} (optional)`}
                onChange={(e) => setOpt(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <button className="btn wide" disabled={!formReady} onClick={addQuestion}>
          {formReady ? "Add question to quiz" : "Fill the question, 2+ answers, and mark the correct one"}
        </button>
      </div>

      <div className="card">
        <div className="field-label">
          Questions in this quiz <span className="muted">({questions.length} — at least 3 to save; games use up to 6, shuffled)</span>
        </div>
        {questions.length === 0 ? (
          <span className="muted">No questions yet.</span>
        ) : (
          questions.map((item, idx) => (
            <div key={idx} className="q-row">
              <button className="q-text" onClick={() => editQuestion(idx)} title="Tap to edit">
                <strong>{idx + 1}.</strong> {item.q}
                <span className="muted q-answer">✓ {item.options[item.a]}</span>
              </button>
              <button
                className="chip"
                onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <button className="btn primary wide" disabled={!canSave || saving} onClick={save}>
        {saving ? "Saving…" : canSave ? "Save quiz" : `Name it and add ${Math.max(0, 3 - questions.length)} more question${3 - questions.length === 1 ? "" : "s"}`}
      </button>
    </main>
  );
}

/* ---------- game 2: Who Said It? ---------- */

function WhoGame({ players, onHome, onReplay }) {
  const [promptPool, setPromptPool] = useState(() => shuffle(WHO_PROMPTS));
  const [prompt, setPrompt] = useState(promptPool[0]);
  const [scores, setScores] = useState(() => Object.fromEntries(players.map((p) => [p, 0])));
  const [phase, setPhase] = useState("pass"); // pass | write | guess | award | round-end | podium
  const [wi, setWi] = useState(0); // writer index
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState([]);
  const [gi, setGi] = useState(0); // guess index
  const [revealed, setRevealed] = useState(false);
  const [winners, setWinners] = useState(new Set());

  const writer = players[wi];

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...answers, { author: writer, text }];
    setDraft("");
    if (wi + 1 < players.length) {
      setAnswers(next);
      setWi(wi + 1);
      setPhase("pass");
    } else {
      setAnswers(shuffle(next));
      setGi(0);
      setRevealed(false);
      setPhase("guess");
    }
  };

  const confirmAward = () => {
    if (winners.size) {
      setScores((s) => {
        const n = { ...s };
        winners.forEach((p) => { n[p] += 100; });
        return n;
      });
    }
    setWinners(new Set());
    setRevealed(false);
    if (gi + 1 < answers.length) {
      setGi(gi + 1);
      setPhase("guess");
    } else {
      setPhase("round-end");
    }
  };

  const newRound = () => {
    const pool = promptPool.slice(1);
    const nextPool = pool.length ? pool : shuffle(WHO_PROMPTS);
    setPromptPool(nextPool);
    setPrompt(nextPool[0]);
    setAnswers([]);
    setWi(0);
    setPhase("pass");
  };

  if (phase === "podium") {
    return <Podium scores={scores} onReplay={onReplay} onHome={onHome} replayLabel="New game" />;
  }

  if (phase === "round-end") {
    return (
      <main className="stage center">
        <div className="eyebrow" style={{ background: "var(--mint)" }}>Round complete</div>
        <Leaderboard scores={scores} />
        <div className="btn-row">
          <button className="btn primary" onClick={newRound}>Another prompt →</button>
          <button className="btn" onClick={() => setPhase("podium")}>Finish game</button>
        </div>
      </main>
    );
  }

  if (phase === "pass") {
    return (
      <main className="stage center">
        <div className="eyebrow" style={{ background: "var(--mint)" }}>Writing round</div>
        <h2 className="stage-title pass-title">Pass the device to</h2>
        <div className="pass-name">{writer}</div>
        <p className="muted">Answer honestly (or hilariously). Nobody else looks at the screen.</p>
        <button className="btn primary wide" onClick={() => setPhase("write")}>
          I'm {writer} — I'll answer
        </button>
      </main>
    );
  }

  if (phase === "write") {
    return (
      <main className="stage">
        <div className="eyebrow" style={{ background: "var(--mint)" }}>{writer}, your prompt</div>
        <h2 className="question">{prompt}</h2>
        <div className="card">
          <textarea
            value={draft}
            maxLength={140}
            placeholder="Type your answer, then hand the device back…"
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="muted small-note">{140 - draft.length} characters left</div>
        </div>
        <button className="btn primary wide" disabled={!draft.trim()} onClick={submit}>
          Lock it in
        </button>
      </main>
    );
  }

  const current = answers[gi];

  if (phase === "guess") {
    return (
      <main className="stage center">
        <div className="eyebrow" style={{ background: "var(--mint)" }}>Answer {gi + 1} of {answers.length}</div>
        <p className="blurb">{prompt}</p>
        <div className="card quote-card">
          <div className="quote-mark">“</div>
          <p className="quote">{current.text}</p>
        </div>
        {!revealed ? (
          <>
            <p className="muted">Everyone say your guess out loud… then reveal.</p>
            <button className="btn primary wide" onClick={() => { setRevealed(true); setPhase("award"); }}>
              Reveal who said it
            </button>
          </>
        ) : null}
      </main>
    );
  }

  // award
  return (
    <main className="stage center">
      <div className="eyebrow" style={{ background: "var(--mint)" }}>It was…</div>
      <div className="pass-name">{current.author}</div>
      <div className="card">
        <div className="field-label">Who guessed right? (+100 each)</div>
        <AwardChips
          players={players}
          exclude={current.author}
          selected={winners}
          onToggle={(p) => {
            const n = new Set(winners);
            n.has(p) ? n.delete(p) : n.add(p);
            setWinners(n);
          }}
        />
      </div>
      <button className="btn primary wide" onClick={confirmAward}>
        {gi + 1 < answers.length ? "Next answer →" : "Finish round"}
      </button>
    </main>
  );
}

/* ---------- game 3: Emoji Decode ---------- */

const EMOJI_ROUNDS = 8;

function EmojiGame({ players, onHome, onReplay }) {
  const [puzzles] = useState(() => shuffle(EMOJI_PUZZLES).slice(0, EMOJI_ROUNDS));
  const [scores, setScores] = useState(() => Object.fromEntries(players.map((p) => [p, 0])));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [winners, setWinners] = useState(new Set());
  const [done, setDone] = useState(false);

  const puzzle = puzzles[i];

  const next = () => {
    if (winners.size) {
      setScores((s) => {
        const n = { ...s };
        winners.forEach((p) => { n[p] += 100; });
        return n;
      });
    }
    setWinners(new Set());
    setRevealed(false);
    if (i + 1 < puzzles.length) setI(i + 1);
    else setDone(true);
  };

  if (done) return <Podium scores={scores} onReplay={onReplay} onHome={onHome} />;

  return (
    <main className="stage center">
      <div className="eyebrow" style={{ background: "var(--violet)" }}>
        Puzzle {i + 1} of {puzzles.length} · {puzzle.cat}
      </div>
      <div className="emoji-stage">{puzzle.e}</div>

      {!revealed ? (
        <>
          <p className="muted">Shout your answers — first correct shout wins the point.</p>
          <button className="btn primary wide" onClick={() => setRevealed(true)}>Reveal answer</button>
        </>
      ) : (
        <>
          <h2 className="stage-title">{puzzle.ans}</h2>
          <div className="card">
            <div className="field-label">Who got it? (+100 each)</div>
            <AwardChips
              players={players}
              exclude={null}
              selected={winners}
              onToggle={(p) => {
                const n = new Set(winners);
                n.has(p) ? n.delete(p) : n.add(p);
                setWinners(n);
              }}
            />
          </div>
          <button className="btn primary wide" onClick={next}>
            {i + 1 < puzzles.length ? "Next puzzle →" : "See final scores"}
          </button>
        </>
      )}
    </main>
  );
}

/* ---------- game 4: Poll Battles ---------- */

const POLL_ROUNDS = 6;

function PollGame({ players, onHome, onReplay }) {
  const [questions] = useState(() => shuffle(POLL_QUESTIONS).slice(0, POLL_ROUNDS));
  const [scores, setScores] = useState(() => Object.fromEntries(players.map((p) => [p, 0])));
  const [qi, setQi] = useState(0);
  const [pi, setPi] = useState(0);
  const [phase, setPhase] = useState("pass"); // pass | vote | reveal | board | podium
  const [votes, setVotes] = useState({});
  const [preds, setPreds] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [myPred, setMyPred] = useState(null);
  const [result, setResult] = useState(null);

  const q = questions[qi];
  const player = players[pi];

  const lockIn = () => {
    const nextVotes = { ...votes, [player]: myVote };
    const nextPreds = { ...preds, [player]: myPred };
    setMyVote(null);
    setMyPred(null);

    if (pi + 1 < players.length) {
      setVotes(nextVotes);
      setPreds(nextPreds);
      setPi(pi + 1);
      setPhase("pass");
      return;
    }

    // everyone has voted — tally the round
    const countA = Object.values(nextVotes).filter((v) => v === 0).length;
    const countB = players.length - countA;
    const majority = countA === countB ? null : countA > countB ? 0 : 1;
    const winners = players.filter((p) => (majority === null ? true : nextPreds[p] === majority));
    const pts = majority === null ? 50 : 100;
    setScores((s) => {
      const n = { ...s };
      winners.forEach((p) => { n[p] += pts; });
      return n;
    });
    setResult({ countA, countB, majority, winners, pts });
    setVotes(nextVotes);
    setPreds(nextPreds);
    setPhase("reveal");
  };

  const nextQuestion = () => {
    if (qi + 1 < questions.length) {
      setQi(qi + 1);
      setPi(0);
      setVotes({});
      setPreds({});
      setResult(null);
      setPhase("pass");
    } else {
      setPhase("podium");
    }
  };

  if (phase === "podium") {
    return <Podium scores={scores} onReplay={onReplay} onHome={onHome} />;
  }

  if (phase === "board") {
    return (
      <main className="stage center">
        <div className="eyebrow" style={{ background: "var(--coral)" }}>
          After round {qi + 1} of {questions.length}
        </div>
        <Leaderboard scores={scores} />
        <button className="btn primary wide" onClick={nextQuestion}>
          {qi + 1 < questions.length ? "Next round →" : "See final scores"}
        </button>
      </main>
    );
  }

  if (phase === "pass") {
    return (
      <main className="stage center">
        <div className="eyebrow" style={{ background: "var(--coral)" }}>
          Round {qi + 1} of {questions.length}
        </div>
        <h2 className="stage-title pass-title">Pass the device to</h2>
        <div className="pass-name">{player}</div>
        <p className="muted">
          Cast your vote in secret, then predict which side the room's majority will pick.
        </p>
        <button className="btn primary wide" onClick={() => setPhase("vote")}>
          I'm {player} — let me vote
        </button>
      </main>
    );
  }

  if (phase === "vote") {
    return (
      <main className="stage">
        <div className="eyebrow" style={{ background: "var(--coral)" }}>
          Round {qi + 1} · {player}
        </div>
        <h2 className="question">Step 1 — pick your side</h2>
        <div className="duel">
          {[q.a, q.b].map((label, i) => (
            <button
              key={i}
              className={"duel-card side-" + (i === 0 ? "a" : "b") + (myVote === i ? " on" : "") + (myVote !== null && myVote !== i ? " off" : "")}
              onClick={() => setMyVote(i)}
            >
              {label}
            </button>
          ))}
        </div>

        {myVote !== null && (
          <>
            <h2 className="question">Step 2 — which side will the majority pick?</h2>
            <div className="pred-row">
              {[q.a, q.b].map((label, i) => (
                <button
                  key={i}
                  className={"chip big pred" + (myPred === i ? " on" : "")}
                  onClick={() => setMyPred(i)}
                >
                  {myPred === i ? "✓ " : ""}The room picks “{label}”
                </button>
              ))}
            </div>
          </>
        )}

        <button className="btn primary wide" disabled={myVote === null || myPred === null} onClick={lockIn}>
          {myVote === null
            ? "Pick your side first"
            : myPred === null
            ? "Now call the room"
            : pi + 1 < players.length
            ? "Lock it in →"
            : "Lock in & reveal the split"}
        </button>
      </main>
    );
  }

  // reveal
  const total = players.length;
  const majorityLabel = result.majority === null ? null : result.majority === 0 ? q.a : q.b;

  return (
    <main className="stage center">
      <div className="eyebrow" style={{ background: "var(--coral)" }}>The room has spoken</div>
      <h2 className="stage-title">
        {majorityLabel ? `“${majorityLabel}” wins the room` : "Dead heat!"}
      </h2>

      <div className="split" role="img" aria-label={`${q.a}: ${result.countA} votes. ${q.b}: ${result.countB} votes.`}>
        <div className="split-seg seg-a" style={{ flexGrow: result.countA + 0.25 }}>
          <span className="split-label">{q.a}</span>
          <span className="split-count">{result.countA}/{total}</span>
        </div>
        <div className="split-seg seg-b" style={{ flexGrow: result.countB + 0.25 }}>
          <span className="split-label">{q.b}</span>
          <span className="split-count">{result.countB}/{total}</span>
        </div>
      </div>

      <div className="card board">
        <div className="eyebrow" style={{ background: "var(--coral)" }}>
          {result.majority === null ? `Split vote — everyone takes +${result.pts}` : `Called it (+${result.pts})`}
        </div>
        {result.majority !== null && result.winners.length === 0 ? (
          <p className="muted">Nobody read the room this time. Brutal.</p>
        ) : (
          <div className="chips award">
            {result.winners.map((p) => (
              <span key={p} className="chip big on">✓ {p}</span>
            ))}
          </div>
        )}
      </div>

      <button className="btn primary wide" onClick={() => setPhase("board")}>
        Show standings →
      </button>
    </main>
  );
}

/* ---------- game 5: Icebreaker Roulette ---------- */

function IcebreakerGame({ onHome }) {
  const [cats, setCats] = useState(() => new Set(Object.keys(ICEBREAKERS)));
  const [current, setCurrent] = useState(null); // { text, cat }
  const [spinning, setSpinning] = useState(false);
  const [used, setUsed] = useState(new Set());
  const [drawn, setDrawn] = useState(0);

  const pool = [...cats].flatMap((c) =>
    ICEBREAKERS[c].items.map((text) => ({ text, cat: c }))
  );

  const toggleCat = (c) => {
    const n = new Set(cats);
    if (n.has(c)) {
      if (n.size === 1) return; // keep at least one category
      n.delete(c);
    } else {
      n.add(c);
    }
    setCats(n);
  };

  const pickFinal = () => {
    const fresh = pool.filter((q) => !used.has(q.text));
    const source = fresh.length ? fresh : pool;
    return source[Math.floor(Math.random() * source.length)];
  };

  const settle = (final) => {
    setCurrent(final);
    setUsed((prev) => {
      const n = prev.size >= pool.length - 1 ? new Set() : new Set(prev);
      n.add(final.text);
      return n;
    });
    setDrawn((d) => d + 1);
    setSpinning(false);
  };

  const spin = () => {
    if (spinning || pool.length === 0) return;
    const final = pickFinal();
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      settle(final);
      return;
    }
    setSpinning(true);
    const delays = [60, 60, 70, 80, 90, 110, 140, 180, 240, 320];
    let t = 0;
    delays.forEach((d, i) => {
      t += d;
      setTimeout(() => {
        if (i === delays.length - 1) settle(final);
        else setCurrent(pool[Math.floor(Math.random() * pool.length)]);
      }, t);
    });
  };

  return (
    <main className="stage center">
      <button className="backlink" onClick={onHome}>← All games</button>
      <div className="eyebrow" style={{ background: "var(--cobalt)", color: "#fff" }}>
        Icebreaker Roulette
      </div>
      <p className="blurb">
        No points, no setup — spin for a conversation starter and go around the room.
        Toggle the moods you're in the mood for.
      </p>

      <div className="chips" role="group" aria-label="Question categories">
        {Object.entries(ICEBREAKERS).map(([id, c]) => (
          <button
            key={id}
            className={"chip big" + (cats.has(id) ? " on" : "")}
            style={cats.has(id) ? { background: c.color } : undefined}
            onClick={() => toggleCat(id)}
          >
            {cats.has(id) ? "✓ " : ""}{c.name}
          </button>
        ))}
      </div>

      <div className={"card quote-card ice-card" + (spinning ? " spinning" : "")} aria-live="polite">
        {current ? (
          <>
            <span className="ice-cat" style={{ background: ICEBREAKERS[current.cat].color }}>
              {ICEBREAKERS[current.cat].name}
            </span>
            <p className="quote">{current.text}</p>
          </>
        ) : (
          <p className="quote muted">Spin to draw your first question.</p>
        )}
      </div>

      <button className="btn primary wide" onClick={spin} disabled={spinning}>
        {spinning ? "Spinning…" : current ? "Spin again" : "Spin the wheel"}
      </button>
      {drawn > 0 && (
        <span className="muted small-note">
          {drawn} question{drawn === 1 ? "" : "s"} drawn · {pool.length} in the current pool
        </span>
      )}
    </main>
  );
}

/* ---------- home ---------- */

const GAME_CARDS = [
  {
    id: "quiz",
    name: "Quiz Blitz",
    color: "var(--sun)",
    sym: "▲",
    time: "10–15 min · 1–12 players",
    desc: "Timed trivia with speed bonuses, a live leaderboard and a podium finish. Three question packs at launch.",
  },
  {
    id: "who",
    name: "Who Said It?",
    color: "var(--mint)",
    sym: "●",
    time: "10–20 min · 3–12 players",
    desc: "Everyone answers a prompt in secret, then the room guesses who wrote what. The fastest way to learn your colleagues' hidden lore.",
  },
  {
    id: "emoji",
    name: "Emoji Decode",
    color: "var(--violet)",
    sym: "◆",
    time: "5–10 min · 2–12 players",
    desc: "Decode movies and office jargon from emoji strings. Loud, fast, zero prep — perfect meeting warm-up.",
  },
  {
    id: "poll",
    name: "Poll Battles",
    color: "var(--coral)",
    sym: "■",
    time: "10–15 min · 3–12 players",
    desc: "Vote in secret on spicy either/or questions, then predict which way the room will swing. Points for reading your colleagues right.",
  },
  {
    id: "icebreaker",
    name: "Icebreaker Roulette",
    color: "var(--cobalt)",
    sym: "✦",
    time: "2+ min · any group size",
    desc: "Spin for a conversation starter — light, deep-ish, work or wild. No scores, no setup: just a way into the room.",
  },
  {
    id: "buzzer",
    name: "Buzzer Mode",
    color: "var(--ink)",
    sym: "⚡",
    time: "Live · up to 40 players",
    desc: "Host on the big screen; everyone joins from their own phone with a room code. Fastest correct answers win — the full live experience.",
  },
];

const COMING_SOON = [
  { name: "Team Seasons", desc: "Running leaderboards across game nights, with monthly champions." },
  { name: "Scavenger Hunt", desc: "Photo missions and challenges for offsites and team days." },
  { name: "Custom packs in Buzzer Mode", desc: "Play your Quiz Studio packs live with the whole room." },
];

function Home({ onPick, onStudio }) {
  return (
    <main className="stage home">
      <section className="hero">
        <div className="hero-note note-a">team offsite&nbsp;🎯</div>
        <div className="hero-note note-b">friday 4pm ☕</div>
        <h1 className="hero-title">
          Games for teams<br />that <span className="hl-swipe">work together</span>
        </h1>
        <p className="hero-sub">
          Quick, zero-setup games for standups, offsites and Friday wind-downs.
          Grab one device, gather the room, and play.
        </p>
      </section>

      <section>
        <div className="section-label">Play now</div>
        <div className="game-grid">
          {GAME_CARDS.map((g) => (
            <button key={g.id} className="game-card" style={{ "--gc": g.color }} onClick={() => onPick(g.id)}>
              <span className="game-sym" style={g.color === "var(--ink)" ? { color: "#fff" } : undefined}>{g.sym}</span>
              <span className="game-name">{g.name}</span>
              <span className="game-time">{g.time}</span>
              <span className="game-desc">{g.desc}</span>
              <span className="game-cta">Set up a room →</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">Make it yours</div>
        <button className="build-banner" onClick={onStudio}>
          <span className="game-sym" style={{ "--gc": "var(--coral)" }}>✎</span>
          <span className="build-copy">
            <span className="game-name">Quiz Studio</span>
            <span className="game-desc">
              Write your own question packs — onboarding, product knowledge, inside jokes — and
              play them in Quiz Blitz. Saved packs stay on your account.
            </span>
          </span>
          <span className="game-cta">Open the studio →</span>
        </button>
      </section>

      <section>
        <div className="section-label">In the pipeline</div>
        <div className="soon-grid">
          {COMING_SOON.map((g) => (
            <div key={g.name} className="soon-card">
              <strong>{g.name}</strong>
              <span>{g.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">Built for break rooms everywhere · v0.1</footer>
    </main>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [screen, setScreen] = useState("home");
  const [session, setSession] = useState(null); // { players, pack? }
  const [customPacks, setCustomPacks] = useState([]);
  const [editingPack, setEditingPack] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const packs = await loadCustomPacks();
      if (alive) setCustomPacks(packs);
    })();
    return () => { alive = false; };
  }, []);

  const goHome = () => { setScreen("home"); setSession(null); };

  const upsertPack = async (pack) => {
    const next = customPacks.some((p) => p.id === pack.id)
      ? customPacks.map((p) => (p.id === pack.id ? pack : p))
      : [...customPacks, pack];
    setCustomPacks(next);
    await saveCustomPacks(next);
    setEditingPack(null);
    setScreen("studio");
  };

  const deletePack = async (id) => {
    const next = customPacks.filter((p) => p.id !== id);
    setCustomPacks(next);
    await saveCustomPacks(next);
  };

  return (
    <>
      <style>{CSS}</style>
      <Chrome onHome={goHome}>
        {screen === "home" && (
          <Home
            onPick={(id) => {
              if (id === "buzzer") { window.location.href = "/live/"; return; }
              setScreen(id === "icebreaker" ? "play:ice" : "setup:" + id);
            }}
            onStudio={() => setScreen("studio")}
          />
        )}

        {screen === "play:ice" && <IcebreakerGame onHome={goHome} />}

        {screen === "studio" && (
          <Studio
            packs={customPacks}
            onBack={goHome}
            onNew={() => { setEditingPack(null); setScreen("builder"); }}
            onEdit={(p) => { setEditingPack(p); setScreen("builder"); }}
            onDelete={deletePack}
            onPlay={() => setScreen("setup:quiz")}
          />
        )}

        {screen === "builder" && (
          <QuizBuilder
            initial={editingPack}
            onSave={upsertPack}
            onBack={() => { setEditingPack(null); setScreen("studio"); }}
          />
        )}

        {screen === "setup:quiz" && (
          <QuizSetup
            onBack={goHome}
            customPacks={customPacks}
            onStudio={() => setScreen("studio")}
            onStart={(players, pack) => { setSession({ players, pack }); setScreen("play:quiz"); }}
          />
        )}
        {screen === "play:quiz" && (
          <QuizGame
            key={session.startedAt || 0}
            players={session.players}
            pack={session.pack}
            onHome={goHome}
            onReplay={() => setSession({ ...session, startedAt: Date.now() })}
          />
        )}

        {screen === "setup:who" && (
          <PlayerSetup
            title="Who Said It?"
            blurb="Everyone secretly answers the same prompt, then the room guesses who wrote each answer. Points for correct guesses — and glory for the most unguessable colleague."
            accent="var(--mint)"
            minPlayers={3}
            onBack={goHome}
            onStart={(players) => { setSession({ players }); setScreen("play:who"); }}
          />
        )}
        {screen === "play:who" && (
          <WhoGame
            key={session.startedAt || 0}
            players={session.players}
            onHome={goHome}
            onReplay={() => setSession({ ...session, startedAt: Date.now() })}
          />
        )}

        {screen === "setup:emoji" && (
          <PlayerSetup
            title="Emoji Decode"
            blurb="One screen, everyone shouts. Decode the emoji string, tap who got it right, and keep the pace up. Great as a two-minute meeting opener."
            accent="var(--violet)"
            minPlayers={2}
            onBack={goHome}
            onStart={(players) => { setSession({ players }); setScreen("play:emoji"); }}
          />
        )}
        {screen === "play:emoji" && (
          <EmojiGame
            key={session.startedAt || 0}
            players={session.players}
            onHome={goHome}
            onReplay={() => setSession({ ...session, startedAt: Date.now() })}
          />
        )}
        {screen === "setup:poll" && (
          <PlayerSetup
            title="Poll Battles"
            blurb="Each round is an either/or. Everyone votes in secret and predicts which side the majority will land on — +100 for calling the room right, +50 all round if it's a dead heat. The best mind-reader wins."
            accent="var(--coral)"
            minPlayers={3}
            onBack={goHome}
            onStart={(players) => { setSession({ players }); setScreen("play:poll"); }}
          />
        )}
        {screen === "play:poll" && (
          <PollGame
            key={session.startedAt || 0}
            players={session.players}
            onHome={goHome}
            onReplay={() => setSession({ ...session, startedAt: Date.now() })}
          />
        )}
      </Chrome>
    </>
  );
}

/* ---------- styles ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=Archivo+Black&family=IBM+Plex+Mono:wght@500;700&display=swap');

:root {
  --paper: #F6F5F0;
  --ink: #1D2433;
  --sun: #FFD23F;
  --coral: #FF6B5E;
  --mint: #35C98E;
  --violet: #9C88FF;
  --cobalt: #2E5BFF;
}

* { box-sizing: border-box; margin: 0; }

body { background: var(--paper); }

.shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 8px 8px, rgba(29,36,51,0.06) 1.5px, transparent 1.5px) 0 0 / 32px 32px,
    var(--paper);
  color: var(--ink);
  font-family: 'Archivo', system-ui, sans-serif;
  padding-bottom: 64px;
}

.topbar {
  display: flex; align-items: baseline; justify-content: space-between;
  padding: 20px 24px; max-width: 960px; margin: 0 auto;
}
.wordmark {
  font-family: 'Archivo Black', sans-serif;
  font-size: 22px; letter-spacing: 1px;
  background: none; border: none; color: var(--ink); cursor: pointer; padding: 0;
}
.wordmark .hl { background: var(--sun); padding: 0 4px; }
.topbar-note {
  font-family: 'IBM Plex Mono', monospace; font-size: 11px;
  color: rgba(29,36,51,0.55); letter-spacing: 0.5px;
}

.stage { max-width: 720px; margin: 0 auto; padding: 8px 24px; display: flex; flex-direction: column; gap: 20px; }
.stage.center { align-items: center; text-align: center; }
.stage.home { max-width: 960px; gap: 44px; }

/* hero */
.hero { position: relative; padding: 48px 0 8px; }
.hero-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(38px, 7vw, 68px);
  line-height: 1.02; letter-spacing: -1px;
}
.hl-swipe {
  background: linear-gradient(104deg, transparent 2%, var(--sun) 3%, var(--sun) 97%, transparent 98%);
  padding: 0 8px;
}
.hero-sub { margin-top: 18px; font-size: 18px; max-width: 480px; line-height: 1.55; color: rgba(29,36,51,0.8); }
.hero-note {
  position: absolute; font-family: 'IBM Plex Mono', monospace; font-size: 12px;
  background: #fff; border: 2px solid var(--ink); padding: 6px 10px;
  box-shadow: 3px 3px 0 var(--ink); border-radius: 4px;
}
.note-a { top: 18px; right: 6%; transform: rotate(3deg); background: var(--mint); }
.note-b { top: 96px; right: 0; transform: rotate(-2deg); background: var(--sun); }
@media (max-width: 700px) { .hero-note { display: none; } }

.section-label {
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px;
  color: rgba(29,36,51,0.6);
}

/* game cards */
.game-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
.game-card {
  text-align: left; display: flex; flex-direction: column; gap: 8px;
  background: #fff; border: 2px solid var(--ink); border-radius: 12px;
  padding: 20px; cursor: pointer; box-shadow: 5px 5px 0 var(--ink);
  transition: transform 120ms ease, box-shadow 120ms ease;
  font-family: inherit; color: inherit;
}
.game-card:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 var(--ink); }
.game-card:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 var(--ink); }
.game-card .game-sym[data-dark], .game-sym.dark { color: #fff; }
.game-sym {
  width: 40px; height: 40px; display: grid; place-items: center;
  background: var(--gc); border: 2px solid var(--ink); border-radius: 8px;
  font-size: 16px;
}
.game-name { font-family: 'Archivo Black', sans-serif; font-size: 21px; }
.game-time { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(29,36,51,0.6); }
.game-desc { font-size: 14px; line-height: 1.5; color: rgba(29,36,51,0.85); }
.game-cta { margin-top: auto; font-weight: 700; font-size: 14px; }

.soon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.soon-card {
  border: 2px dashed rgba(29,36,51,0.4); border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 6px; font-size: 14px;
  color: rgba(29,36,51,0.75); background: rgba(255,255,255,0.5);
}
.foot { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(29,36,51,0.45); text-align: center; }

/* shared bits */
.eyebrow {
  display: inline-block; align-self: center;
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
  background: var(--sun); border: 2px solid var(--ink); border-radius: 4px;
  padding: 4px 10px; box-shadow: 3px 3px 0 var(--ink);
}
.stage:not(.center) .eyebrow { align-self: flex-start; }
.blurb { font-size: 16px; line-height: 1.55; color: rgba(29,36,51,0.85); max-width: 560px; }
.backlink { background: none; border: none; font: inherit; font-weight: 700; color: var(--ink); cursor: pointer; align-self: flex-start; padding: 0; }
.muted { color: rgba(29,36,51,0.55); font-size: 14px; }
.small-note { margin-top: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; }

.card {
  width: 100%; background: #fff; border: 2px solid var(--ink); border-radius: 12px;
  padding: 18px; box-shadow: 5px 5px 0 var(--ink);
}
.field-label { font-weight: 700; margin-bottom: 10px; }

input, textarea {
  width: 100%; font: inherit; font-size: 16px; color: var(--ink);
  border: 2px solid var(--ink); border-radius: 8px; padding: 10px 12px;
  background: var(--paper); resize: vertical;
}
input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 3px solid var(--cobalt); outline-offset: 2px; }

.add-row { display: flex; gap: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.chips.award { margin-top: 0; justify-content: center; }
.chip {
  font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  background: var(--paper); border: 2px solid var(--ink); border-radius: 999px;
  padding: 6px 12px; color: var(--ink);
}
.chip.big { font-size: 16px; padding: 10px 16px; }
.chip.on { background: var(--mint); box-shadow: 2px 2px 0 var(--ink); }

.btn {
  font: inherit; font-weight: 700; font-size: 16px; cursor: pointer;
  background: #fff; color: var(--ink);
  border: 2px solid var(--ink); border-radius: 10px;
  padding: 12px 20px; box-shadow: 4px 4px 0 var(--ink);
  transition: transform 100ms ease, box-shadow 100ms ease;
}
.btn:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--ink); }
.btn:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 1px 1px 0 var(--ink); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: 2px 2px 0 var(--ink); }
.btn.primary { background: var(--cobalt); color: #fff; }
.btn.small { padding: 10px 16px; flex-shrink: 0; }
.btn.wide { width: 100%; max-width: 480px; align-self: center; }
.btn-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

/* pack picker */
.pack-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.pack {
  font: inherit; text-align: left; cursor: pointer;
  display: flex; flex-direction: column; gap: 4px;
  background: var(--paper); border: 2px solid var(--ink); border-radius: 10px; padding: 12px;
  color: var(--ink);
}
.pack span { font-size: 12px; color: rgba(29,36,51,0.65); }
.pack.on { background: var(--pack); box-shadow: 3px 3px 0 var(--ink); }

/* quiz */
.quiz-meta { display: flex; justify-content: space-between; align-items: center; }
.timer-num { font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 20px; }
.timer-track { height: 14px; border: 2px solid var(--ink); border-radius: 999px; background: #fff; overflow: hidden; }
.timer-fill { height: 100%; background: var(--sun); transition: width 100ms linear; }

.question { font-family: 'Archivo Black', sans-serif; font-size: clamp(22px, 4vw, 30px); line-height: 1.25; }

.sticky-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 560px) { .sticky-grid { grid-template-columns: 1fr; } }
.sticky {
  font: inherit; font-weight: 700; font-size: 17px; text-align: left; cursor: pointer;
  display: flex; align-items: center; gap: 12px;
  border: 2px solid var(--ink); border-radius: 4px;
  padding: 18px 16px; min-height: 84px; color: var(--ink);
  box-shadow: 5px 6px 0 rgba(29,36,51,0.9);
  transform: rotate(var(--tilt, 0deg));
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
}
.sticky:hover:not(:disabled) { transform: rotate(0deg) translate(-2px,-2px) scale(1.02); }
.sticky:disabled { cursor: default; }
.sticky-sym { font-size: 14px; border: 2px solid var(--ink); border-radius: 6px; background: rgba(255,255,255,0.6); width: 30px; height: 30px; display: grid; place-items: center; flex-shrink: 0; }
.sticky.right { outline: 4px solid var(--ink); transform: rotate(0deg) scale(1.02); }
.sticky.wrong { opacity: 0.9; background: #E7E5DE !important; text-decoration: line-through; }
.sticky.dim { opacity: 0.35; }

.feedback { display: flex; flex-direction: column; gap: 14px; align-items: center; }
.verdict { font-family: 'Archivo Black', sans-serif; font-size: 22px; }
.verdict.good { color: #0E8A5F; }
.verdict.bad { color: var(--coral); }

/* pass screens */
.stage-title { font-family: 'Archivo Black', sans-serif; font-size: clamp(24px, 5vw, 36px); }
.pass-title { color: rgba(29,36,51,0.6); font-size: 20px; }
.pass-name {
  font-family: 'Archivo Black', sans-serif; font-size: clamp(36px, 8vw, 56px);
  background: #fff; border: 2px solid var(--ink); border-radius: 12px;
  padding: 12px 32px; box-shadow: 6px 6px 0 var(--ink); transform: rotate(-1deg);
}

/* leaderboard */
.board { max-width: 480px; text-align: left; }
.board .eyebrow { margin-bottom: 12px; }
.board-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 8px; border-bottom: 2px dashed rgba(29,36,51,0.15);
  font-size: 16px;
}
.board-row:last-child { border-bottom: none; }
.board-row.leader { background: var(--sun); border-radius: 8px; border-bottom: none; font-weight: 700; }
.board-rank { font-family: 'IBM Plex Mono', monospace; font-weight: 700; width: 32px; text-align: center; }
.board-name { flex: 1; }
.board-pts { font-family: 'IBM Plex Mono', monospace; font-weight: 700; }
.podium { margin-top: 4px; }

/* who said it */
.quote-card { max-width: 560px; position: relative; padding: 28px 24px 22px; transform: rotate(-0.5deg); }
.quote-mark { font-family: 'Archivo Black', sans-serif; font-size: 48px; line-height: 0.5; color: var(--mint); }
.quote { font-size: 20px; line-height: 1.5; font-weight: 600; margin-top: 8px; }

/* emoji */
.emoji-stage {
  font-size: clamp(56px, 14vw, 96px); letter-spacing: 8px;
  background: #fff; border: 2px solid var(--ink); border-radius: 16px;
  padding: 32px 40px; box-shadow: 6px 6px 0 var(--ink); transform: rotate(0.5deg);
}

/* quiz studio & builder */
.linkish {
  background: none; border: none; cursor: pointer; padding: 0; margin-top: 14px;
  font: inherit; font-weight: 700; font-size: 14px; color: var(--cobalt);
  text-decoration: underline; text-underline-offset: 3px;
}
.pack-divider { margin-top: 16px; }
.studio-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.studio-info { display: flex; flex-direction: column; gap: 2px; }
.studio-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.btn.danger { background: var(--coral); color: #fff; }
.opt-list { display: flex; flex-direction: column; gap: 10px; margin: 14px 0; }
.opt-row { display: flex; gap: 10px; align-items: center; }
.opt-correct {
  flex-shrink: 0; width: 42px; height: 42px; cursor: pointer;
  font-size: 16px; font-weight: 700; color: rgba(29,36,51,0.35);
  background: var(--paper); border: 2px solid var(--ink); border-radius: 10px;
}
.opt-correct.on { background: var(--mint); color: var(--ink); box-shadow: 2px 2px 0 var(--ink); }
.q-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 2px dashed rgba(29,36,51,0.15); }
.q-row:last-child { border-bottom: none; }
.q-text {
  flex: 1; text-align: left; background: none; border: none; cursor: pointer;
  font: inherit; font-size: 15px; color: var(--ink); padding: 4px; border-radius: 6px;
  display: flex; flex-direction: column; gap: 2px;
}
.q-text:hover { background: rgba(46,91,255,0.07); }
.q-answer { font-size: 13px; }

.build-banner {
  width: 100%; text-align: left; cursor: pointer;
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  background: #fff; border: 2px solid var(--ink); border-radius: 12px;
  padding: 20px; box-shadow: 5px 5px 0 var(--ink);
  transition: transform 120ms ease, box-shadow 120ms ease;
  font-family: inherit; color: inherit;
}
.build-banner:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 var(--ink); }
.build-banner:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 var(--ink); }
.build-copy { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 6px; }

/* poll battles */
.duel { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 560px) { .duel { grid-template-columns: 1fr; } }
.duel-card {
  font-family: 'Archivo Black', sans-serif; font-size: clamp(17px, 3vw, 22px);
  text-align: center; cursor: pointer; color: var(--ink);
  border: 2px solid var(--ink); border-radius: 4px;
  padding: 28px 18px; min-height: 110px;
  display: grid; place-items: center;
  box-shadow: 5px 6px 0 rgba(29,36,51,0.9);
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
}
.duel-card.side-a { background: #FF8A7A; transform: rotate(-1.2deg); }
.duel-card.side-b { background: #9DB4FF; transform: rotate(1.2deg); }
.duel-card:hover { transform: rotate(0deg) translate(-2px,-2px) scale(1.02); }
.duel-card.on { outline: 4px solid var(--ink); transform: rotate(0deg) scale(1.02); }
.duel-card.off { opacity: 0.45; }
.pred-row { display: flex; gap: 12px; flex-wrap: wrap; }
.chip.pred { text-align: left; }

.split {
  width: 100%; max-width: 560px; display: flex;
  border: 2px solid var(--ink); border-radius: 12px; overflow: hidden;
  box-shadow: 5px 5px 0 var(--ink); min-height: 72px;
}
.split-seg {
  display: flex; flex-direction: column; justify-content: center; gap: 2px;
  padding: 10px 12px; min-width: 64px; flex-basis: 0;
}
.seg-a { background: #FF8A7A; border-right: 2px solid var(--ink); }
.seg-b { background: #9DB4FF; }
.split-label { font-weight: 700; font-size: 14px; line-height: 1.2; }
.split-count { font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 18px; }

/* icebreaker roulette */
.ice-card { min-height: 180px; width: 100%; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
.ice-cat {
  align-self: flex-start;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
  border: 2px solid var(--ink); border-radius: 4px; padding: 3px 8px;
}
.ice-card.spinning { animation: jitter 120ms infinite; }
@keyframes jitter {
  0% { transform: rotate(-0.8deg); }
  50% { transform: rotate(0.6deg); }
  100% { transform: rotate(-0.8deg); }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
`;

/* mount (deployed site) */
const rootEl = typeof document !== "undefined" && document.getElementById("root");
if (rootEl) createRoot(rootEl).render(<App />);
