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

// createKeypad();

document.addEventListener("DOMContentLoaded", function () {
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
});
