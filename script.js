// script.js

let words = [];
let currentIndex = 0;
let hideTimer = null;
let currentWord = "";
let spellingCorrect = false;

// ===== Element refs =====
const wordInput         = document.getElementById("wordInput");
const inputArea         = document.getElementById("inputArea");
const flashcardArea     = document.getElementById("flashcardArea");
const archiveContainer  = document.getElementById("archiveList");
const flashcardModal    = document.getElementById("flashcardModal");
const modalWord         = document.getElementById("modalWord");
const nextWordBtn       = document.getElementById("nextWordBtn");
const closeModalBtn     = document.getElementById("closeModal");
const progressEl        = document.getElementById("progress");
const counterEl         = document.getElementById("counter");
const toggleTimerCB     = document.getElementById("toggleTimer");
const timerSecondsInput = document.getElementById("timerSeconds");
const speakBtn          = document.getElementById("speakBtn");
const autoSpeakCB       = document.getElementById("autoSpeak");
const spellingModeCB    = document.getElementById("spellingMode");
const accentUK          = document.getElementById("accentUK");
const accentUS          = document.getElementById("accentUS");
const spellingInputArea = document.getElementById("spellingInputArea");
const letterBoxes       = document.getElementById("letterBoxes");
const spellingInput     = document.getElementById("spellingInput");
const spellingFeedback  = document.getElementById("spellingFeedback");

// ===== Voices =====
let availableVoices = [];
let selectedAccent  = "en-GB";

function loadVoices() {
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) availableVoices = v;
}
if (typeof speechSynthesis !== "undefined") {
  loadVoices();
  speechSynthesis.addEventListener("voiceschanged", loadVoices);
  setTimeout(loadVoices, 500);
} else {
  if (speakBtn) speakBtn.disabled = true;
}

accentUK.addEventListener("click", () => {
  selectedAccent = "en-GB";
  accentUK.classList.add("accent-active");
  accentUS.classList.remove("accent-active");
});
accentUS.addEventListener("click", () => {
  selectedAccent = "en-US";
  accentUS.classList.add("accent-active");
  accentUK.classList.remove("accent-active");
});

function speakWord(text) {
  if (!text || typeof speechSynthesis === "undefined") return;
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) availableVoices = voices;
  const utterance = new SpeechSynthesisUtterance(text);
  const match = availableVoices.find(v => v.lang === selectedAccent)
             || availableVoices.find(v => v.lang.startsWith(selectedAccent.split("-")[0]))
             || availableVoices.find(v => v.lang.startsWith("en"));
  if (match) utterance.voice = match;
  utterance.lang  = selectedAccent;
  utterance.rate  = 0.9;
  utterance.pitch = 1.0;
  if (speakBtn) {
    speakBtn.textContent = "🔊 …";
    utterance.onend   = () => { speakBtn.textContent = "🔊 Speak"; };
    utterance.onerror = () => { speakBtn.textContent = "🔊 Speak"; };
  }
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

if (speakBtn) {
  speakBtn.addEventListener("click", () => {
    const word = speakBtn.dataset.spellingWord || currentWord;
    if (word) speakWord(word);
  });
}

// ===== Built-in sentence library =====
// Format: word (lowercase) -> sentence with ___ as the blank
const SENTENCES = {
  // Animals
  cat:       "The ___ sat on the warm mat.",
  dog:       "The ___ wagged its tail and ran to me.",
  bird:      "The little ___ sang a song in the tree.",
  fish:      "The orange ___ swam in the clear pond.",
  horse:     "The brown ___ galloped fast across the field.",
  cow:       "The black and white ___ said moo in the farm.",
  pig:       "The pink ___ rolled in the mud happily.",
  sheep:     "The fluffy ___ had thick white wool.",
  rabbit:    "The ___ hopped quickly into its burrow.",
  mouse:     "The tiny ___ found a piece of cheese.",
  bear:      "The big ___ slept all winter in its cave.",
  lion:      "The ___ roared very loudly in the jungle.",
  tiger:     "The ___ has orange fur with black stripes.",
  elephant:  "The ___ sprayed water with its long trunk.",
  frog:      "The green ___ jumped into the pond with a splash.",
  duck:      "The yellow ___ swam on the pond.",
  owl:       "The ___ hooted at night and slept in the day.",
  bee:       "The ___ buzzed from flower to flower.",
  snake:     "The long ___ slid slowly through the grass.",
  butterfly: "The pretty ___ landed on a flower.",
  spider:    "The ___ spun a silky web in the corner.",
  // Nature
  sun:       "The bright ___ shines in the blue sky.",
  moon:      "The round ___ glows in the dark night sky.",
  star:      "I wished on a shining ___ in the sky.",
  rain:      "The ___ fell on the window with a patter.",
  snow:      "The white ___ covered the garden like a blanket.",
  wind:      "The ___ blew the leaves off the trees.",
  tree:      "The tall ___ had green leaves and thick bark.",
  flower:    "The red ___ grew in the garden.",
  leaf:      "The orange ___ fell slowly from the tree.",
  grass:     "The green ___ was soft under my feet.",
  cloud:     "The fluffy white ___ drifted across the sky.",
  sea:       "We built a sandcastle by the ___ .",
  mountain:  "The snowy ___ was very tall and cold.",
  river:     "The fish swam in the clear ___ .",
  fire:      "We warmed our hands by the ___ .",
  water:     "I drank a glass of cold ___ .",
  sand:      "We dug in the soft golden ___ at the beach.",
  rock:      "The heavy grey ___ sat by the path.",
  // Food
  apple:     "I ate a crunchy red ___ for my snack.",
  banana:    "The monkey peeled the yellow ___ .",
  cake:      "We blew out the candles on the birthday ___ .",
  bread:     "Mum sliced the warm ___ for our lunch.",
  egg:       "I had a boiled ___ and toast for breakfast.",
  milk:      "I poured cold ___ on my cereal.",
  cheese:    "The mouse nibbled a piece of ___ .",
  pizza:     "We ate a cheesy ___ for dinner.",
  soup:      "The hot ___ warmed me up on a cold day.",
  rice:      "We had ___ with our chicken for dinner.",
  sweet:     "Granny gave me a sticky ___ from her bag.",
  carrot:    "The rabbit nibbled the orange ___ .",
  potato:    "We had mashed ___ with our sausages.",
  tomato:    "The red ___ grew on the vine in the garden.",
  strawberry:"I picked a red ripe ___ from the plant.",
  biscuit:   "I had a crunchy ___ with my cup of tea.",
  butter:    "I spread golden ___ on my warm toast.",
  orange:    "I peeled the juicy ___ and ate every slice.",
  lemon:     "The sour ___ made my mouth go all funny.",
  sandwich:  "Mum made me a cheese ___ for lunch.",
  // Home / Objects
  house:     "We live in a red brick ___ on a long street.",
  door:      "Please close the ___ when you come inside.",
  window:    "I looked out of the ___ at the falling snow.",
  chair:     "I sat on the wooden ___ at the table.",
  table:     "We eat dinner at the kitchen ___ .",
  bed:       "I snuggled up in my cosy ___ to sleep.",
  book:      "I read a funny ___ before going to sleep.",
  pen:       "I wrote my name with a blue ___ .",
  bag:       "I packed my lunch in my school ___ .",
  ball:      "We kicked the ___ around the playground.",
  car:       "Dad drove the ___ to the supermarket.",
  bus:       "I rode on the red ___ to school.",
  train:     "The fast ___ rushed through the tunnel.",
  plane:     "The white ___ flew high above the clouds.",
  boat:      "The little ___ rocked on the waves.",
  bike:      "I rode my ___ down the hill very fast.",
  clock:     "The ___ on the wall said it was three o'clock.",
  phone:     "Mum answered her ___ when it rang.",
  light:     "I switched on the ___ because it was dark.",
  key:       "Dad used the ___ to unlock the front door.",
  chair:     "Pull up a ___ and sit down at the table.",
  coat:      "I put on my warm ___ before going outside.",
  hat:       "The clown wore a funny tall ___ .",
  shoe:      "I tied the lace on my left ___ .",
  sock:      "I put on a clean ___ on each foot.",
  // People / Body
  hand:      "I held Mum's ___ as we crossed the road.",
  eye:       "I shut one ___ and tried to wink.",
  ear:       "The dog pricked up its ___ at the loud sound.",
  nose:      "My ___ turns red when it is very cold.",
  mouth:     "I opened my ___ wide at the dentist.",
  foot:      "I hurt my ___ when I stubbed my toe.",
  baby:      "The little ___ giggled and clapped its hands.",
  girl:      "The ___ with red ribbons skipped to school.",
  boy:       "The ___ climbed to the top of the climbing frame.",
  friend:    "My best ___ always makes me laugh.",
  family:    "My ___ went on holiday to the seaside.",
  // School
  school:    "I learn to read and write at ___ .",
  teacher:   "My ___ read us a brilliant story today.",
  pencil:    "I sharpened my ___ before the test.",
  paint:     "I used red ___ to finish my picture.",
  number:    "Can you write the ___ six in your book?",
  letter:    "I wrote a ___ to my grandma.",
  word:      "I sounded out each letter to spell the ___ .",
  story:     "The teacher read a funny ___ to the class.",
  game:      "We played a board ___ on a rainy afternoon.",
  // Feelings / Descriptions
  happy:     "I felt ___ when I opened my birthday presents.",
  sad:       "I was ___ when my favourite toy broke.",
  angry:     "He felt ___ when someone took his ball.",
  scared:    "The loud thunder made me feel ___ .",
  kind:      "It was ___ of you to share your sweets.",
  good:      "You did a really ___ job on that drawing.",
  great:     "It was a ___ day at the park.",
  bad:       "I felt ___ when I was rude to my sister.",
  big:       "The elephant is a very ___ animal.",
  small:     "The ant is a very ___ insect.",
  fast:      "The cheetah is the ___ est animal on land.",
  slow:      "The tortoise walked ___ ly to the finish line.",
  hot:       "The soup was too ___ to eat straight away.",
  cold:      "I shivered because it was so ___ outside.",
  loud:      "The music was too ___ and hurt my ears.",
  quiet:     "Please be ___ in the library.",
  clean:     "Wash your hands to keep them ___ .",
  dirty:     "My boots were ___ after playing in the mud.",
  old:       "Gran showed me a very ___ photograph.",
  new:       "I got a ___ pair of trainers for my birthday.",
  long:      "The snake had a very ___ body.",
  short:     "The little puppy had ___ stubby legs.",
  // Common spellings / connectives
  because:   "I wore a coat ___ it was raining.",
  although:  "___ it was cold, we still went to the park.",
  however:   "I was tired. ___ , I still finished my homework.",
  therefore: "It was raining. ___ , we stayed inside.",
  but:       "I wanted to play outside, ___ it was raining.",
  when:      "I clapped ___ the magician did his trick.",
  where:     "Do you know ___ my shoes are?",
  after:     "We had ice cream ___ our dinner.",
  before:    "Always wash your hands ___ you eat.",
  while:     "I read my book ___ Mum cooked dinner.",
  until:     "We played outside ___ it got dark.",
  always:    "I ___ brush my teeth before bed.",
  never:     "I have ___ seen a real live dinosaur.",
  sometimes: "I ___ have toast for breakfast.",
  often:     "We ___ go to the park at the weekend.",
  again:     "Can you say that ___ , please?",
  also:      "I like cats. I ___ like dogs.",
  every:     "___ morning I have a bowl of cereal.",
  any:       "Is there ___ juice left in the bottle?",
  some:      "Can I have ___ more pasta please?",
  many:      "There were too ___ sweets to count.",
  much:      "Thank you so ___ for my lovely present.",
  more:      "Can I have ___ chips please?",
  most:      "___ children in my class like football.",
  very:      "The cake was ___ yummy.",
  really:    "I am ___ excited about my birthday.",
  quite:     "The film was ___ long.",
  just:      "I ___ wanted to say thank you.",
  only:      "I have ___ one sister.",
  there:     "Put the bag over ___ by the door.",
  their:     "The children ate ___ packed lunches.",
  they:      "___ ran across the playground together.",
  here:      "Come and sit ___ next to me.",
  would:     "I ___ love a piece of chocolate cake.",
  could:     "I ___ see the fireworks from my bedroom.",
  should:    "You ___ always say please and thank you.",
  might:     "It ___ rain later, so take your coat.",
  about:     "I read a book ___ dinosaurs.",
  people:    "Lots of ___ came to watch the school play.",
  little:    "The ___ puppy curled up and fell asleep.",
  something: "I can smell ___ delicious cooking.",
  together:  "We sang the song ___ .",
  different: "Every snowflake is ___ from the others.",
  special:   "Today is a ___ day — it is my birthday.",
  beautiful: "The sunset was absolutely ___ .",
  important: "It is ___ to drink water every day.",
  another:   "Can I have ___ slice of that delicious cake?",
  outside:   "The children played ___ in the sunshine.",
  inside:    "We stayed ___ because of the rain.",
  around:    "The dog ran ___ the garden three times.",
  between:   "I sat ___ my mum and my dad.",
  under:     "The cat hid ___ the bed.",
  above:     "The clouds floated ___ the rooftops.",
  behind:    "The little kitten hid ___ the sofa.",
  across:    "We walked ___ the bridge over the river.",
  through:   "The train zoomed ___ the dark tunnel.",
  thought:   "She ___ carefully before she answered.",
  brought:   "Dad ___ me a surprise from the shop.",
  caught:    "I ___ the ball with both hands.",
  taught:    "Miss Green ___ us a new song today.",
  laugh:     "The silly joke made me ___ out loud.",
  enough:    "Have you had ___ to eat?",
  rough:     "The bark of the tree felt ___ under my fingers.",
  though:    "Even ___ it was late, I wasn't tired.",
  night:     "The stars come out at ___ .",
  light:     "Switch on the ___ — it is getting dark.",
  right:     "Turn ___ at the corner by the shop.",
  might:     "It ___ snow tonight if it gets cold enough.",
  fight:     "It is never good to ___ with your friends.",
  knight:    "The brave ___ wore shining silver armour.",
  write:     "Please ___ your name at the top of the page.",
  wrong:     "I got the answer ___ the first time.",
  know:      "Do you ___ the answer to this question?",
  knew:      "She ___ all the words to the song.",
  knee:      "I fell and hurt my ___ in the playground.",
  knock:     "Please ___ on the door before you come in.",
  whole:     "I ate the ___ apple — even the core!",
  who:       "___ left the biscuit tin open?",
  what:      "___ time does school finish today?",
  which:     "___ book would you like me to read?",
  half:      "I ate ___ of the sandwich and saved the rest.",
  calm:      "Take a deep breath and stay ___ .",
  climb:     "I love to ___ the big oak tree in the garden.",
  thumb:     "I sucked my ___ when I was a baby.",
  comb:      "I use a ___ to tidy my hair each morning.",
  // Months / Days
  monday:    "We have swimming on ___ morning.",
  tuesday:   "Art club is every ___ after school.",
  wednesday: "PE is on ___ and Friday.",
  thursday:  "We go to the library on ___ .",
  friday:    "I love ___ because the weekend starts.",
  saturday:  "We went to the park on ___ morning.",
  sunday:    "We have a roast dinner every ___ .",
  january:   "My birthday is in ___ when it is cold.",
  february:  "Valentines Day is in ___ .",
  march:     "The daffodils bloom in ___ .",
  april:     "Easter is often in ___ .",
  may:       "The flowers are beautiful in ___ .",
  june:      "School sports day is in ___ .",
  july:      "We go on holiday in ___ .",
  august:    "The summer holidays are in ___ .",
  september: "We go back to school in ___ .",
  october:   "Halloween is at the end of ___ .",
  november:  "Bonfire Night is in ___ .",
  december:  "Christmas is in ___ .",
};


function getSentence(word) {
  return SENTENCES[word.toLowerCase()] || null;
}

// ===== Load clues =====
// ===== Vowel / Consonant helpers =====
const VOWELS = new Set(["a","e","i","o","u"]);
function isVowel(ch) { return VOWELS.has(ch.toLowerCase()); }

// ===== Build colour-coded letter boxes =====
// Each box is coloured by vowel (red) / consonant (blue) BEFORE the child types
// Revealed letters are shown in the box; unrevealed show just the colour hint
function buildLetterBoxes(word, revealedIndices = new Set()) {
  letterBoxes.innerHTML = "";
  Array.from(word).forEach((ch, i) => {
    const box = document.createElement("div");
    const vowel = isVowel(ch);
    box.className = "letter-box " + (vowel ? "vowel-box" : "consonant-box");
    box.dataset.index = i;
    box.dataset.letter = ch.toLowerCase();
    if (revealedIndices.has(i)) {
      box.textContent = ch;
      box.classList.add("revealed");
    }
    letterBoxes.appendChild(box);
  });
}

function updateLetterBoxes(typed, target) {
  const boxes = letterBoxes.querySelectorAll(".letter-box");
  boxes.forEach((box, i) => {
    if (box.classList.contains("revealed")) return; // don't overwrite scaffolded hints
    const ch = typed[i] || "";
    box.textContent = ch;
    box.classList.remove("typed-correct", "typed-wrong");
    if (ch) {
      box.classList.add(ch.toLowerCase() === target[i].toLowerCase() ? "typed-correct" : "typed-wrong");
    }
  });
}

// ===== Spelling check =====
function checkSpelling(typed, target) {
  if (!typed || typed.length === 0) {
    spellingFeedback.textContent = "";
    spellingFeedback.className = "spelling-feedback";
    return;
  }
  if (typed.toLowerCase() === target.toLowerCase()) {
    spellingFeedback.textContent = "🎉 Brilliant! Well done!";
    spellingFeedback.className = "spelling-feedback correct";
    spellingInput.disabled = true;
    spellingCorrect = true;
    modalWord.textContent = target;
    // Fill all boxes green
    letterBoxes.querySelectorAll(".letter-box").forEach((box, i) => {
      box.textContent = target[i];
      box.classList.remove("typed-wrong", "revealed");
      box.classList.add("typed-correct");
    });
    if (autoSpeakCB && autoSpeakCB.checked) speakWord(target);
  } else if (typed.length >= target.length) {
    spellingFeedback.textContent = "❌ Not quite — try again!";
    spellingFeedback.className = "spelling-feedback wrong";
  } else {
    spellingFeedback.textContent = "";
    spellingFeedback.className = "spelling-feedback";
  }
}

// ===== Staged Help System =====
let helpStep = 0;         // 0 = untouched, 1 = first letter, 2 = first+last, 3 = full reveal
let revealedIndices = new Set();

function resetHelp() {
  helpStep = 0;
  revealedIndices = new Set();
  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) {
    helpBtn.textContent = "💡 Help";
    helpBtn.disabled = false;
  }
}

function applyHelp() {
  if (!currentWord || spellingCorrect) return;
  const word = currentWord;
  const helpBtn = document.getElementById("helpBtn");

  helpStep++;

  if (helpStep === 1) {
    // Stage 1: reveal first letter
    revealedIndices.add(0);
    helpBtn.textContent = "💡 More help";
    spellingFeedback.textContent = "Here's your first letter!";
    spellingFeedback.className = "spelling-feedback";
  } else if (helpStep === 2) {
    // Stage 2: reveal last letter too
    revealedIndices.add(word.length - 1);
    helpBtn.textContent = "💡 Stuck?";
    spellingFeedback.textContent = "Here's the first and last letter!";
    spellingFeedback.className = "spelling-feedback";
  } else if (helpStep === 3) {
    // Stage 3: slow stretched audio
    revealedIndices.add(0);
    revealedIndices.add(word.length - 1);
    helpBtn.textContent = "🔉 Playing slowly…";
    helpBtn.disabled = true;
    spellingFeedback.textContent = "Listen carefully — played slowly!";
    spellingFeedback.className = "spelling-feedback";
    speakWordSlow(word, () => {
      helpBtn.textContent = "✅ Full reveal";
      helpBtn.disabled = false;
      helpStep = 4;
    });
  } else {
    // Stage 4: full reveal
    modalWord.textContent = word;
    spellingInput.disabled = true;
    helpBtn.disabled = true;
    helpBtn.textContent = "✅ Revealed";
    spellingFeedback.textContent = "That's the word — remember it for next time!";
    spellingFeedback.className = "spelling-feedback";
    revealedIndices = new Set(Array.from({length: word.length}, (_, i) => i));
  }

  // Rebuild boxes preserving current typing
  const typed = spellingInput.value;
  buildLetterBoxes(word, revealedIndices);
  // Re-apply typed letters (skip revealed positions)
  if (typed) updateLetterBoxes(typed, word);
}

function speakWordSlow(text, onEnd) {
  if (!text || typeof speechSynthesis === "undefined") { if (onEnd) onEnd(); return; }
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) availableVoices = voices;
  const utterance = new SpeechSynthesisUtterance(text);
  const match = availableVoices.find(v => v.lang === selectedAccent)
             || availableVoices.find(v => v.lang.startsWith(selectedAccent.split("-")[0]))
             || availableVoices.find(v => v.lang.startsWith("en"));
  if (match) utterance.voice = match;
  utterance.lang  = selectedAccent;
  utterance.rate  = 0.4;   // stretched out
  utterance.pitch = 1.0;
  utterance.onend   = () => { if (onEnd) onEnd(); };
  utterance.onerror = () => { if (onEnd) onEnd(); };
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}


// ===== Utility =====
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function openModal() {
  flashcardModal.style.display = "flex";
  flashcardModal.setAttribute("aria-hidden", "false");
  flashcardArea.style.display = "none";
  inputArea.style.display = "none";
}

function closeModalToInput() {
  flashcardModal.style.display = "none";
  flashcardModal.setAttribute("aria-hidden", "true");
  inputArea.style.display = "block";
  flashcardArea.style.display = "none";
  clearTimeout(hideTimer);
  hideTimer = null;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

// ===== Event listeners =====
document.getElementById("startBtn").addEventListener("click", () => {
  const inputText = wordInput.value.trim();
  if (!inputText) { alert("Please enter some words first!"); return; }
  words = inputText.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
  if (words.length === 0) { alert("Please enter valid words."); return; }
  words = shuffle(words);
  currentIndex = 0;
  openModal();
  showWord();
});

nextWordBtn.addEventListener("click", () => { currentIndex++; showWord(); });
closeModalBtn.addEventListener("click", closeModalToInput);
document.getElementById("clearBtn").addEventListener("click", () => { wordInput.value = ""; });
document.getElementById("clearArchiveBtn").addEventListener("click", () => {
  localStorage.removeItem("flashcardArchive");
  renderArchive();
});

const toggleArchiveBtn = document.getElementById("toggleArchiveBtn");
const archiveContent   = document.getElementById("archiveContent");
toggleArchiveBtn.addEventListener("click", () => {
  const isHidden = archiveContent.style.display === "none";
  archiveContent.style.display = isHidden ? "block" : "none";
  toggleArchiveBtn.textContent = isHidden ? "Hide ▲" : "Show ▼";
});

const darkToggle = document.getElementById("toggleDarkMode");
if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  });
}

// Help button
const helpBtnEl = document.getElementById("helpBtn");
if (helpBtnEl) helpBtnEl.addEventListener("click", applyHelp);

// Spelling input
spellingInput.addEventListener("input", () => {
  if (!currentWord || spellingCorrect) return;
  updateLetterBoxes(spellingInput.value, currentWord);
  checkSpelling(spellingInput.value, currentWord);
});

spellingInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && spellingCorrect) { currentIndex++; showWord(); }
});

// ===== Core showWord =====
function showWord() {
  clearTimeout(hideTimer);
  hideTimer = null;
  spellingCorrect = false;
  spellingFeedback.textContent = "";
  spellingFeedback.className = "spelling-feedback";
  spellingInput.disabled = false;
  spellingInput.value = "";
  resetHelp();

  const total = words.length;

  if (currentIndex < total) {
    const word = words[currentIndex];
    currentWord = word;
    speakBtn.dataset.spellingWord = word;

    const isSpellingMode = spellingModeCB && spellingModeCB.checked;

    if (isSpellingMode) {
      modalWord.innerHTML = '<span class="abc-badge">abc</span>';
      spellingInputArea.style.display = "block";
      const helpBtn = document.getElementById("helpBtn");
      if (helpBtn) helpBtn.classList.remove("hidden");
      buildLetterBoxes(word, new Set());
      setTimeout(() => spellingInput.focus(), 100);
      speakWord(word);
    } else {
      modalWord.textContent = word;
      spellingInputArea.style.display = "none";
      const helpBtn = document.getElementById("helpBtn");
      if (helpBtn) helpBtn.classList.add("hidden");
      if (autoSpeakCB && autoSpeakCB.checked) speakWord(word);
    }

    const done = currentIndex + 1;
    const left  = Math.max(0, total - done);
    progressEl.textContent = `${done} / ${total}`;
    counterEl.textContent  = `\u2705 Done: ${done} | \u23F3 Left: ${left}`;
    saveToArchive(word);

    if (toggleTimerCB && toggleTimerCB.checked && !isSpellingMode) {
      let secs = 10;
      if (timerSecondsInput && !isNaN(parseInt(timerSecondsInput.value))) {
        secs = Math.max(1, parseInt(timerSecondsInput.value));
      }
      hideTimer = setTimeout(() => { modalWord.textContent = "\u270F\uFE0F"; hideTimer = null; }, secs * 1000);
    }
  } else {
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    currentWord = "";
    modalWord.textContent = "\uD83C\uDF89 Well done! Restart or edit your list.";
    progressEl.textContent = `${total} / ${total}`;
    counterEl.textContent  = `All ${total} words completed \uD83C\uDF89`;
    spellingInputArea.style.display = "none";
    const helpBtn = document.getElementById("helpBtn");
    if (helpBtn) helpBtn.classList.add("hidden");
  }
}

// ===== Archive =====
function saveToArchive(word) {
  try {
    const key = "flashcardArchive";
    let archive = JSON.parse(localStorage.getItem(key)) || [];
    if (!archive.includes(word)) {
      archive.push(word);
      localStorage.setItem(key, JSON.stringify(archive));
      renderArchive();
    }
  } catch (e) {}
}

function renderArchive() {
  let archive = JSON.parse(localStorage.getItem("flashcardArchive")) || [];
  archiveContainer.value = archive.length === 0 ? "No saved words yet." : archive.join(", ");
}

document.addEventListener("DOMContentLoaded", renderArchive);

// Toggle parent settings
const toggleSettingsBtn = document.getElementById("toggleSettingsBtn");
const parentSettings    = document.getElementById("parentSettings");
if (toggleSettingsBtn) {
  toggleSettingsBtn.addEventListener("click", () => {
    const isHidden = parentSettings.style.display === "none";
    parentSettings.style.display = isHidden ? "block" : "none";
    toggleSettingsBtn.textContent = isHidden ? "\u2699\uFE0F Parent Settings \u25B2" : "\u2699\uFE0F Parent Settings \u25BC";
  });
}
