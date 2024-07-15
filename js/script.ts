type ExchangeRates = {
  [key: string]: number;
};

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) =>
        console.log("Service Worker Registered", registration)
      )
      .catch((error) => console.log("Service Worker Error", error));
  }
}

function createConverter() {
  const currencyDivs = ["currency-from", "currency-to"];

  function populateSelect(divId: string) {
    const select = document.querySelector<HTMLSelectElement>(
      `#${divId} > select`
    );
    if (select) {
      select.innerHTML = Object.keys(CURRENCY_NAMES)
        .map(
          (currency) =>
            `<option value="${currency}">${CURRENCY_NAMES[currency]}</option>`
        )
        .join("");

      // Add event listener to update span id when option changes
      select.addEventListener("change", (event) => {
        const target = event.target as HTMLSelectElement;
        const spanId =
          divId === "currency-from"
            ? "currency-from-input"
            : "currency-to-input";
        const span = document.getElementById(spanId);
        if (span) {
          span.textContent = target.value;
        }
      });
    }
  }

  currencyDivs.forEach(populateSelect);
}

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

  const keypadElement = document.getElementById("keypad");
  if (keypadElement) {
    keypadElement.appendChild(keypadContainer);
  }
}

function setupCurrencyInputListeners() {
  const currencyFromInput = document.querySelector<HTMLInputElement>(
    "#currency-from input"
  );
  const currencyToInput =
    document.querySelector<HTMLInputElement>("#currency-to input");

  if (currencyFromInput && currencyToInput) {
    const fromSelect = document.querySelector<HTMLSelectElement>(
      "#currency-from select"
    );
    const toSelect = document.querySelector<HTMLSelectElement>(
      "#currency-to select"
    );

    function convertCurrency(value: number, from: string, to: string): number {
      const rates = JSON.parse(localStorage.getItem("exchangeRates") || "{}");
      if (!rates[from] || !rates[to]) return NaN;
      return (value / rates[from]) * rates[to];
    }

    currencyFromInput.addEventListener("input", function () {
      const fromValue = parseFloat(currencyFromInput.value);
      const fromCurrency = fromSelect?.value || "USD";
      const toCurrency = toSelect?.value || "USD";
      if (!isNaN(fromValue)) {
        const convertedValue = convertCurrency(
          fromValue,
          fromCurrency,
          toCurrency
        );
        currencyToInput.value = convertedValue.toFixed(2);
      } else {
        currencyToInput.value = "";
      }
    });

    currencyToInput.addEventListener("input", function () {
      const toValue = parseFloat(currencyToInput.value);
      const fromCurrency = fromSelect?.value || "USD";
      const toCurrency = toSelect?.value || "USD";
      if (!isNaN(toValue)) {
        const convertedValue = convertCurrency(
          toValue,
          toCurrency,
          fromCurrency
        );
        currencyFromInput.value = convertedValue.toFixed(2);
      } else {
        currencyFromInput.value = "";
      }
    });

    [fromSelect, toSelect].forEach((select) => {
      select?.addEventListener("change", () => {
        const event = new Event("input");
        currencyFromInput.dispatchEvent(event);
      });
    });
  }
}

function initializeCurrencyConverter() {
  const currencyFromInput = document.querySelector<HTMLInputElement>(
    "#currency-from input"
  );
  const currencyToInput =
    document.querySelector<HTMLInputElement>("#currency-to input");

  if (currencyFromInput && currencyToInput) {
    let activeInput: HTMLInputElement = currencyFromInput;

    currencyFromInput.removeAttribute("readonly");
    currencyToInput.setAttribute("readonly", "true");

    currencyFromInput.addEventListener("focus", function () {
      activeInput = currencyFromInput;
      currencyFromInput.removeAttribute("readonly");
      currencyToInput.setAttribute("readonly", "true");
    });

    currencyToInput.addEventListener("focus", function () {
      activeInput = currencyToInput;
      currencyToInput.removeAttribute("readonly");
      currencyFromInput.setAttribute("readonly", "true");
    });

    document.querySelectorAll("#keypad button").forEach((button) => {
      button.addEventListener("click", function () {
        if (activeInput.hasAttribute("readonly")) return;

        const value = (button as HTMLElement).innerHTML;
        if (value.charCodeAt(0) === 9003) {
          activeInput.value = activeInput.value.slice(0, -1);
          if (activeInput.value.length === 0) {
            currencyFromInput.value = "";
            currencyToInput.value = "";
          }
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
}

async function fetchExchangeRates() {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/17455db23ea4666bc35b72b7/latest/USD`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data: ExchangeRates = await response.json();
    return data.conversion_rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}

// registerServiceWorker();
createConverter();
createKeypad();
document.addEventListener("DOMContentLoaded", setupCurrencyInputListeners);
document.addEventListener("DOMContentLoaded", initializeCurrencyConverter);
fetchExchangeRates().then((rates) => {
  if (rates) {
    console.log("Exchange rates fetched successfully:", rates);
    localStorage.setItem("exchangeRates", JSON.stringify(rates));
    console.log("Exchange rates stored in local storage");
  } else {
    console.log("Failed to fetch exchange rates");
  }
});
