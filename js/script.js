"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => console.log("Service Worker Registered", registration))
            .catch((error) => console.log("Service Worker Error", error));
    }
}
function createConverter() {
    const currencyDivs = ["currency-from", "currency-to"];
    function populateSelect(divId) {
        const select = document.querySelector(`#${divId} > select`);
        if (select) {
            select.innerHTML = Object.keys(CURRENCY_NAMES)
                .map((currency) => `<option value="${currency}">${CURRENCY_NAMES[currency]}</option>`)
                .join("");
            // Add event listener to update span id when option changes
            select.addEventListener("change", (event) => {
                const target = event.target;
                const spanId = divId === "currency-from"
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
    const currencyFromInput = document.querySelector("#currency-from input");
    const currencyToInput = document.querySelector("#currency-to input");
    if (currencyFromInput && currencyToInput) {
        const fromSelect = document.querySelector("#currency-from select");
        const toSelect = document.querySelector("#currency-to select");
        function convertCurrency(value, from, to) {
            const rates = JSON.parse(localStorage.getItem("exchangeRates") || "{}");
            if (!rates[from] || !rates[to])
                return NaN;
            return (value / rates[from]) * rates[to];
        }
        currencyFromInput.addEventListener("input", function () {
            const fromValue = parseFloat(currencyFromInput.value);
            const fromCurrency = (fromSelect === null || fromSelect === void 0 ? void 0 : fromSelect.value) || "USD";
            const toCurrency = (toSelect === null || toSelect === void 0 ? void 0 : toSelect.value) || "USD";
            if (!isNaN(fromValue)) {
                const convertedValue = convertCurrency(fromValue, fromCurrency, toCurrency);
                currencyToInput.value = convertedValue.toFixed(2);
            }
            else {
                currencyToInput.value = "";
            }
        });
        currencyToInput.addEventListener("input", function () {
            const toValue = parseFloat(currencyToInput.value);
            const fromCurrency = (fromSelect === null || fromSelect === void 0 ? void 0 : fromSelect.value) || "USD";
            const toCurrency = (toSelect === null || toSelect === void 0 ? void 0 : toSelect.value) || "USD";
            if (!isNaN(toValue)) {
                const convertedValue = convertCurrency(toValue, toCurrency, fromCurrency);
                currencyFromInput.value = convertedValue.toFixed(2);
            }
            else {
                currencyFromInput.value = "";
            }
        });
        [fromSelect, toSelect].forEach((select) => {
            select === null || select === void 0 ? void 0 : select.addEventListener("change", () => {
                const event = new Event("input");
                currencyFromInput.dispatchEvent(event);
            });
        });
    }
}
function initializeCurrencyConverter() {
    const currencyFromInput = document.querySelector("#currency-from input");
    const currencyToInput = document.querySelector("#currency-to input");
    if (currencyFromInput && currencyToInput) {
        let activeInput = currencyFromInput;
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
                if (activeInput.hasAttribute("readonly"))
                    return;
                const value = button.innerHTML;
                if (value.charCodeAt(0) === 9003) {
                    activeInput.value = activeInput.value.slice(0, -1);
                    if (activeInput.value.length === 0) {
                        currencyFromInput.value = "";
                        currencyToInput.value = "";
                    }
                }
                else {
                    activeInput.value += value;
                }
                const fromValue = parseFloat(currencyFromInput.value);
                const toValue = parseFloat(currencyToInput.value);
                if (activeInput === currencyFromInput && !isNaN(fromValue)) {
                    currencyToInput.value = (fromValue * 3.5).toFixed(2);
                }
                else if (activeInput === currencyToInput && !isNaN(toValue)) {
                    currencyFromInput.value = (toValue / 3.5).toFixed(2);
                }
            });
        });
    }
}
function fetchExchangeRates() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://v6.exchangerate-api.com/v6/17455db23ea4666bc35b72b7/latest/USD`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = yield response.json();
            return data.conversion_rates;
        }
        catch (error) {
            console.error("Error fetching exchange rates:", error);
            return null;
        }
    });
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
    }
    else {
        console.log("Failed to fetch exchange rates");
    }
});
