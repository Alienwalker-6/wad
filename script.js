// Basic list of words.
// No API, AI or external library is used.
const wordList = [
    "student", "computer", "keyboard", "screen", "simple",
    "project", "accuracy", "mistake", "technology", "variable",
    "function", "program", "website", "coding", "developer",
    "internet", "browser", "language", "design", "practice",
    "learning", "college", "system", "software", "hardware",
    "network", "database", "javascript", "html", "style",
    "testing", "typing", "speed", "correct", "error",
    "button", "random", "method", "school", "knowledge",
    "future", "digital", "application", "student", "keyboard"
];

const textDisplay = document.getElementById("textDisplay");
const typingArea = document.getElementById("typingArea");
const startBtn = document.getElementById("startBtn");
const doneBtn = document.getElementById("doneBtn");
const resetBtn = document.getElementById("resetBtn");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const message = document.getElementById("message");

let targetText = "";
let currentIndex = 0;
let wrongCharacter = "";
let startTime = null;
let timer = null;
let running = false;

// Pick random words and create the test text.
function createRandomText() {
    let words = [];

    for (let i = 0; i < 35; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        words.push(wordList[randomIndex]);
    }

    return words.join(" ");
}

// Put every character inside its own span.
function showText() {
    textDisplay.innerHTML = "";

    for (let i = 0; i < targetText.length; i++) {
        const span = document.createElement("span");
        span.className = "char";

        // Show spaces correctly.
        span.textContent = targetText[i] === " " ? "\u00A0" : targetText[i];

        if (i === 0) {
            span.classList.add("current");
        }

        textDisplay.appendChild(span);
    }
}

// Start a new test.
function startTest() {
    clearInterval(timer);

    targetText = createRandomText();
    currentIndex = 0;
    wrongCharacter = "";
    startTime = new Date();
    running = true;

    timeDisplay.textContent = "0";
    wpmDisplay.textContent = "0";
    message.textContent = "";

    showText();
    typingArea.focus();

    timer = setInterval(updateTime, 1000);
}

// Update the timer.
function updateTime() {
    if (!running || !startTime) {
        return;
    }

    const seconds = Math.floor((new Date() - startTime) / 1000);
    timeDisplay.textContent = seconds;
}

// Move the visible cursor to the current character.
function updateCursor() {
    const chars = textDisplay.querySelectorAll(".char");

    chars.forEach(function(char) {
        char.classList.remove("current");
    });

    if (currentIndex < chars.length) {
        chars[currentIndex].classList.add("current");
        chars[currentIndex].scrollIntoView({
            block: "nearest",
            inline: "nearest"
        });
    }
}

// Handle keyboard input.
typingArea.addEventListener("keydown", function(event) {
    if (!running) {
        return;
    }

    // Backspace removes only the wrong character.
    if (event.key === "Backspace") {
        event.preventDefault();

        if (wrongCharacter !== "") {
            wrongCharacter = "";
            renderError();
        }

        return;
    }

    // Ignore Shift, Ctrl, Alt, arrows, etc.
    if (event.key.length !== 1) {
        return;
    }

    event.preventDefault();

    const expected = targetText[currentIndex];

    // If there is already an error, do not allow another character.
    if (wrongCharacter !== "") {
        return;
    }

    if (event.key === expected) {
        // Correct character: move cursor forward.
        const chars = textDisplay.querySelectorAll(".char");
        chars[currentIndex].classList.remove("current");
        chars[currentIndex].classList.add("correct");

        currentIndex++;

        if (currentIndex >= targetText.length) {
            finishTest();
        } else {
            updateCursor();
        }
    } else {
        // Wrong character: show it in red.
        wrongCharacter = event.key;
        renderError();
    }
});

// Display the wrong character immediately before the current cursor.
function renderError() {
    const oldError = textDisplay.querySelector(".error");
    if (oldError) {
        oldError.remove();
    }

    if (wrongCharacter !== "") {
        const error = document.createElement("span");
        error.className = "error";
        error.textContent = wrongCharacter;

        const currentChar = textDisplay.querySelectorAll(".char")[currentIndex];

        if (currentChar) {
            currentChar.parentNode.insertBefore(error, currentChar);
        } else {
            textDisplay.appendChild(error);
        }
    }

    updateCursor();
}

// Calculate WPM.
function calculateWPM() {
    if (!startTime) {
        return 0;
    }

    const seconds = (new Date() - startTime) / 1000;

    if (seconds <= 0) {
        return 0;
    }

    // Standard typing-test formula: 5 characters = 1 word.
    const typedCharacters = currentIndex;
    const words = typedCharacters / 5;
    const minutes = seconds / 60;

    return Math.round(words / minutes);
}

// Finish the test.
function finishTest() {
    if (!running) {
        message.textContent = "Click Start to begin the test.";
        return;
    }

    running = false;
    clearInterval(timer);

    if (wrongCharacter !== "") {
        message.textContent = "Correct the red character using Backspace first.";
        running = true;
        timer = setInterval(updateTime, 1000);
        typingArea.focus();
        return;
    }

    wpmDisplay.textContent = calculateWPM();

    if (currentIndex >= targetText.length) {
        message.textContent = "Test completed!";
    } else {
        message.textContent = "Test stopped. Your current speed is shown above.";
    }
}

// Reset everything.
function resetTest() {
    clearInterval(timer);

    running = false;
    targetText = "";
    currentIndex = 0;
    wrongCharacter = "";
    startTime = null;

    textDisplay.textContent = "Click Start to generate random words.";
    timeDisplay.textContent = "0";
    wpmDisplay.textContent = "0";
    message.textContent = "";
}

// Initial screen.
resetTest();

startBtn.addEventListener("click", startTest);
doneBtn.addEventListener("click", finishTest);
resetBtn.addEventListener("click", resetTest);

// Clicking the typing area keeps keyboard focus.
typingArea.addEventListener("click", function() {
    if (running) {
        typingArea.focus();
    }
});
