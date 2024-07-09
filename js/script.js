function createKeypad() {
  const keypadContainer = document.createElement("div");
  keypadContainer.className = "row row-cols-3 g-2";

  const buttons = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    ".",
    "&#9003;",
  ];

  buttons.forEach((buttonText) => {
    const colDiv = document.createElement("div");
    colDiv.className = "col";

    const button = document.createElement("button");
    button.className = "btn btn-outline-dark w-100 p-3";

    const span = document.createElement("span");
    span.className = "display-6";
    span.innerHTML = buttonText;

    button.appendChild(span);
    colDiv.appendChild(button);
    keypadContainer.appendChild(colDiv);
  });

  document.getElementById("keypad").appendChild(keypadContainer);
}

function setupCurrencyInputListeners() {
  const currencyFromInput = document.querySelector("#currency-from input");
  const currencyToInput = document.querySelector("#currency-to input");

  currencyFromInput.addEventListener("input", function () {
    const fromValue = parseFloat(currencyFromInput.value);
    if (!isNaN(fromValue)) {
      currencyToInput.value = (fromValue * 3.5).toFixed(2);
    } else {
      currencyToInput.value = "";
    }
  });

  currencyToInput.addEventListener("input", function () {
    const toValue = parseFloat(currencyToInput.value);
    if (!isNaN(toValue)) {
      currencyFromInput.value = (toValue / 3.5).toFixed(2);
    } else {
      currencyFromInput.value = "";
    }
  });
}

function initializeCurrencyConverter() {
  const currencyFromInput = document.querySelector("#currency-from input");
  const currencyToInput = document.querySelector("#currency-to input");
  let activeInput = currencyFromInput;

  currencyFromInput.removeAttribute("readonly");
  currencyToInput.setAttribute("readonly", true);

  currencyFromInput.addEventListener("focus", function () {
    activeInput = currencyFromInput;
    currencyFromInput.removeAttribute("readonly");
    currencyToInput.setAttribute("readonly", true);
  });

  currencyToInput.addEventListener("focus", function () {
    activeInput = currencyToInput;
    currencyToInput.removeAttribute("readonly");
    currencyFromInput.setAttribute("readonly", true);
  });

  document.querySelectorAll("#keypad button").forEach((button) => {
    button.addEventListener("click", function () {
      if (activeInput.hasAttribute("readonly")) return;

      const value = button.innerHTML;
      if (value.charCodeAt(0) === 9003) {
        activeInput.value =
          activeInput.value.length === 1 ? "0" : activeInput.value.slice(0, -1);
      } else {
        activeInput.value += value;
      }

      const fromValue = parseFloat(currencyFromInput.value);
      const toValue = parseFloat(currencyToInput.value);

      if (activeInput === currencyFromInput && !isNaN(fromValue)) {
        currencyToInput.value = (fromValue * 3.5).toFixed(2);
      } else if (activeInput === currencyToInput && !isNaN(toValue)) {
        currencyFromInput.value = (toValue / 3.5).toFixed(2);
      }
    });
  });
}

// createKeypad();
document.addEventListener("DOMContentLoaded", setupCurrencyInputListeners);
document.addEventListener("DOMContentLoaded", initializeCurrencyConverter);
