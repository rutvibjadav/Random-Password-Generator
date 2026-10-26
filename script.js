"use strict";

const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const lengthSlider = document.querySelector("#length-slider");
const lengthNumber = document.querySelector("#length-number");
const passwordOutput = document.querySelector("#password-output");
const characterCount = document.querySelector("#character-count");
const strengthFill = document.querySelector(".strength-fill");
const strengthLabel = document.querySelector("#strength-label");
const notification = document.querySelector("#notification");
const generateButton = document.querySelector("#generate-button");
const copyButton = document.querySelector("#copy-button");
const clearButton = document.querySelector("#clear-button");
const toggleVisibilityButton = document.querySelector("#toggle-visibility");
const optionInputs = [...document.querySelectorAll(".character-options input")];

let notificationTimer;

function setNotification(message, kind = "") {
  window.clearTimeout(notificationTimer);
  notification.textContent = message;

  if (kind) {
    notification.dataset.kind = kind;
  } else {
    delete notification.dataset.kind;
  }

  if (message && kind !== "error") {
    notificationTimer = window.setTimeout(() => {
      notification.textContent = "";
      delete notification.dataset.kind;
    }, 3500);
  }
}

function updateSliderTrack() {
  const min = Number(lengthSlider.min);
  const max = Number(lengthSlider.max);
  const progress = ((Number(lengthSlider.value) - min) / (max - min)) * 100;
  lengthSlider.style.background = `linear-gradient(90deg, #9c7af2 ${progress}%, rgba(150, 152, 187, 0.2) ${progress}%)`;
}

function syncLengthFromSlider() {
  lengthNumber.value = lengthSlider.value;
  setNotification();
  updateSliderTrack();
}

function syncLengthFromNumber() {
  const value = Number(lengthNumber.value);
  const isValid = lengthNumber.value !== "" && Number.isInteger(value) && value >= 4 && value <= 50;

  if (isValid) {
    lengthSlider.value = String(value);
    setNotification();
    updateSliderTrack();
  }
}

function getSelectedSets() {
  return optionInputs
    .filter((input) => input.checked)
    .map((input) => characterSets[input.value]);
}

function secureRandomBelow(limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 0x100000000) {
    throw new RangeError("The random selection limit is invalid.");
  }

  const range = 0x100000000;
  const cutoff = range - (range % limit);
  const value = new Uint32Array(1);

  do {
    window.crypto.getRandomValues(value);
  } while (value[0] >= cutoff);

  return value[0] % limit;
}

function randomCharacter(characters) {
  return characters[secureRandomBelow(characters.length)];
}

function shuffleSecurely(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomBelow(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters;
}

function getStrength(password, selectedTypeCount) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 20) score += 1;
  if (selectedTypeCount >= 2) score += 1;
  if (selectedTypeCount >= 3) score += 1;
  if (selectedTypeCount === 4) score += 1;

  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
}

function updateStrength(password, selectedTypeCount) {
  const strength = getStrength(password, selectedTypeCount);
  strengthFill.dataset.strength = strength;
  strengthLabel.dataset.strength = strength;
  strengthLabel.textContent = strength[0].toUpperCase() + strength.slice(1);
}

function generatePassword() {
  const lengthText = lengthNumber.value.trim();
  const length = Number(lengthText);
  if (lengthText === "" || !Number.isInteger(length) || length < 4 || length > 50) {
    setNotification("Choose a password length between 4 and 50.", "error");
    lengthNumber.focus();
    return;
  }

  const selectedSets = getSelectedSets();
  if (selectedSets.length === 0) {
    setNotification("Select at least one character type to generate a password.", "error");
    optionInputs[0].focus();
    return;
  }

  if (!window.crypto || typeof window.crypto.getRandomValues !== "function") {
    setNotification("Secure random generation is unavailable in this browser.", "error");
    return;
  }

  try {
    const passwordCharacters = selectedSets.map(randomCharacter);
    const combinedSet = selectedSets.join("");

    while (passwordCharacters.length < length) {
      passwordCharacters.push(randomCharacter(combinedSet));
    }

    const password = shuffleSecurely(passwordCharacters).join("");
    passwordOutput.value = password;
    passwordOutput.type = "password";
    toggleVisibilityButton.disabled = false;
    toggleVisibilityButton.setAttribute("aria-label", "Show password");
    toggleVisibilityButton.setAttribute("aria-pressed", "false");
    toggleVisibilityButton.title = "Show password";
    characterCount.textContent = `${password.length} ${password.length === 1 ? "character" : "characters"}`;
    copyButton.disabled = false;
    updateStrength(password, selectedSets.length);
    setNotification("A new password is ready.", "success");
  } catch (error) {
    setNotification("Password generation failed. Please try again.", "error");
    console.error("Password generation failed:", error);
  }
}

async function copyPassword() {
  if (!passwordOutput.value) return;

  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      throw new Error("Clipboard access is not available in this browser context.");
    }

    await navigator.clipboard.writeText(passwordOutput.value);
    setNotification("Password copied successfully!", "success");
  } catch (error) {
    setNotification("Could not copy the password. Select and copy it manually.", "error");
    console.error("Password copy failed:", error);
  }
}

function togglePasswordVisibility() {
  const shouldShow = passwordOutput.type === "password";
  passwordOutput.type = shouldShow ? "text" : "password";
  toggleVisibilityButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  toggleVisibilityButton.setAttribute("aria-pressed", String(shouldShow));
  toggleVisibilityButton.title = shouldShow ? "Hide password" : "Show password";
}

function clearPassword() {
  passwordOutput.value = "";
  passwordOutput.type = "password";
  characterCount.textContent = "0 characters";
  copyButton.disabled = true;
  toggleVisibilityButton.disabled = true;
  toggleVisibilityButton.setAttribute("aria-label", "Show password");
  toggleVisibilityButton.setAttribute("aria-pressed", "false");
  toggleVisibilityButton.title = "Show password";
  delete strengthFill.dataset.strength;
  delete strengthLabel.dataset.strength;
  strengthLabel.textContent = "Not generated";
  setNotification("Password cleared.");
}

lengthSlider.addEventListener("input", syncLengthFromSlider);
lengthNumber.addEventListener("input", syncLengthFromNumber);
lengthNumber.addEventListener("change", () => {
  const value = Number(lengthNumber.value);
  if (lengthNumber.value === "" || !Number.isInteger(value) || value < 4 || value > 50) {
    setNotification("Choose a password length between 4 and 50.", "error");
    lengthNumber.focus();
    return;
  }
  lengthSlider.value = String(value);
  updateSliderTrack();
  setNotification();
});
optionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (getSelectedSets().length === 0) {
      setNotification("Select at least one character type to generate a password.", "error");
    } else {
      setNotification();
    }
  });
});
generateButton.addEventListener("click", generatePassword);
copyButton.addEventListener("click", copyPassword);
clearButton.addEventListener("click", clearPassword);
toggleVisibilityButton.addEventListener("click", togglePasswordVisibility);

updateSliderTrack();
toggleVisibilityButton.disabled = true;
