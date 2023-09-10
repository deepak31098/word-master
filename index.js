const ANSWER_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_URL = "https://words.dev-apis.com/validate-word";
const loader = document.getElementById("loader");
const inputs = document.getElementsByClassName("user-input");
const heading = document.querySelector(".game-header h1");
const inputContainer = document.querySelector(".game-input-div");
const inputValue = [];
let row = 0;
let todayWord = null;
let wordBreakUp = {};
let input;

function showLoader() {
  loader.classList.remove("invisible");
  loader.classList.add("visible");
}

function hideLoader() {
  loader.classList.add("invisible");
  loader.classList.remove("visible");
}

async function fetchInitialData() {
  showLoader();
  const response = await fetch(ANSWER_URL);
  data = await response.json();
  if (!data) {
    hideLoader();
    return;
  }
  todayWord = data?.word;
  todayWord?.split("")?.forEach(element => {
    if (wordBreakUp[element]) {
      wordBreakUp[element] = wordBreakUp[element] + 1;
    } else {
      wordBreakUp[element] = 1;
    }
  });
  hideLoader();
}

async function isValidWord(word) {
  showLoader();
  const response = await fetch(VALIDATE_URL, {
    method: "POST",
    body: JSON.stringify({word}),
  });
  data = await response.json();
  if (!data) {
    hideLoader();
    return;
  }
  const isValid = data?.validWord;
  switch (isValid) {
    case true:
      if (word === todayWord.toLowerCase()) {
        handleWin();
      } else {
        handleRetry();
      }
      break;
    case false:
      if (row === 5) {
        handleLose();
      } else {
        handleWrong();
      }
      break;
  }
}

function handleRetry() {
  let i;
  for (i = row * 5; i < 5 + row * 5; i++) {
    const value = inputs[i].value;

    if (todayWord.includes(value) && wordBreakUp[value] > 0) {
      wordBreakUp = {
        ...wordBreakUp,
        [value]: --wordBreakUp[value],
      };
      if (i === todayWord.split("").findIndex(e => e === value)) {
        inputs[i].classList.add("correct");
      } else {
        inputs[i].classList.add("warning");
      }
    } else {
      inputs[i].classList.add("wrong");
    }
  }
  hideLoader();
  inputs[i].focus();
  row++;
}

function handleLose() {
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].classList.add("wrong");
  }
  hideLoader();
  alert("You lost the game!!");
  row++;
}

function handleWrong() {
  let i;
  for (i = row * 5; i < 5 + row * 5; i++) {
    inputs[i].classList.add("wrong");
  }
  inputs[i].focus();
  hideLoader();
  row++;
  alert("Invalid word");
}

function handleWin() {
  for (let i = row * 5; i < 5 + row * 5; i++) {
    inputs[i].classList.add("correct");
  }
  hideLoader();
  heading.classList.add("win");
  heading.innerText = "Wow! You are really a word master";
  alert("You win the game!!");
}

function isValidKey(value) {
  const regEx = /^[a-zA-z]$/;
  return regEx.test(value);
}

function placeInputs() {
  for (let i = 0; i < 30; i++) {
    let input = document.createElement("input");
    input.classList.add("user-input");
    inputContainer.appendChild(input);
  }
}

function init() {
  placeInputs();
  fetchInitialData();
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("keyup", function (e) {
      if (e.key === "Backspace") {
        if (row > 5) return;
        e.target.value = "";
        if (i === 0) return;
        else {
          inputs[i - 1].focus();
        }
      } else if (e.key === "Enter" && (i + 1) % 5 === 0) {
        let word = "";
        for (let i = row * 5; i < 5 + row * 5; i++) {
          word = word + inputs[i].value;
        }
        isValidWord(word.toLowerCase());
      } else if (isValidKey(e.target.value)) {
        if (e.target.value.length > 0 && row === Math.floor((i + 1) / 5)) {
          if (inputs.length <= i + 1) return;
          inputs[i + 1].focus();
        }
      } else {
        e.target.value = "";
      }
    });
  }
}
init();
