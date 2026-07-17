/* Question packs for Breakroom Live. `a` is the index of the correct option
   (options are shuffled per-game server-side, so keeping a=0 here is fine). */

export const QUIZ_PACKS = {
  office: {
    id: "office",
    name: "Watercooler Trivia",
    tag: "Office life & general knowledge",
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
