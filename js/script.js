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
function getCountry() {
    var _a, _b, _c, _d;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === "" || !timezone) {
        return null;
    }
    const _country = (_c = (_b = (_a = window.TIMEZONES) === null || _a === void 0 ? void 0 : _a[timezone]) === null || _b === void 0 ? void 0 : _b.c) === null || _c === void 0 ? void 0 : _c[0];
    const country = (_d = window.COUNTRIES) === null || _d === void 0 ? void 0 : _d[_country || ""];
    return country;
}
function createConverter() {
    const currencyDivs = ["currency-from", "currency-to"];
    const country = getCountry();
    function populateSelect(divId) {
        const select = document.querySelector(`#${divId} > select`);
        if (select) {
            select.innerHTML = Object.keys(CURRENCY_NAMES)
                .map((currency) => {
                const currencyName = CURRENCY_NAMES[currency];
                return `<option value="${currency}" ${currencyName.includes(country || "") ? "selected" : ""}>${currencyName}</option>`;
            })
                .join("");
            // Initial setup to update span id
            const initialSpanId = divId === "currency-from" ? "currency-from-input" : "currency-to-input";
            const initialSpan = document.getElementById(initialSpanId);
            if (initialSpan) {
                initialSpan.textContent = select.value;
            }
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
function convertCurrency(value, from, to) {
    const rates = JSON.parse(localStorage.getItem("exchangeRates") || "{}");
    if (!rates[from] || !rates[to])
        return NaN;
    return (value / rates[from]) * rates[to];
}
function formatCurrency(value) {
    return value.toFixed(2);
}
function setupKeypad() {
    const currencyFromInput = document.querySelector("#currency-from input");
    const currencyToInput = document.querySelector("#currency-to input");
    if (currencyFromInput && currencyToInput) {
        const fromSelect = document.querySelector("#currency-from select");
        const toSelect = document.querySelector("#currency-to select");
        currencyFromInput.addEventListener("input", function () {
            const fromValue = parseFloat(currencyFromInput.value);
            const fromCurrency = (fromSelect === null || fromSelect === void 0 ? void 0 : fromSelect.value) || "USD";
            const toCurrency = (toSelect === null || toSelect === void 0 ? void 0 : toSelect.value) || "USD";
            if (!isNaN(fromValue)) {
                const convertedValue = convertCurrency(fromValue, fromCurrency, toCurrency);
                currencyToInput.value = formatCurrency(convertedValue);
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
                currencyFromInput.value = formatCurrency(convertedValue);
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
function fetchExchangeRateApi() {
    return fetch(`https://v6.exchangerate-api.com/v6/17455db23ea4666bc35b72b7/latest/USD`)
        .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
        .then((data) => {
        return data;
    })
        .catch((error) => {
        console.error("Error fetching exchange rates:", error);
        return null;
    });
}
function getExchangeRates() {
    return __awaiter(this, void 0, void 0, function* () {
        const storedData = localStorage.getItem("exchangeRateApi");
        const updateExchangeRates = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchExchangeRateApi();
            if (data) {
                localStorage.setItem("exchangeRateApi", JSON.stringify(data));
            }
            return data;
        });
        if (!storedData) {
            console.log("No stored data, updating exchange rates");
            const data = yield updateExchangeRates();
            return data === null || data === void 0 ? void 0 : data.conversion_rates;
        }
        const parsedData = JSON.parse(storedData);
        const now = Math.floor(Date.now() / 1000);
        if (parsedData.time_next_update_unix <= now) {
            console.log("Exchange rates out of date, updating");
            const data = yield updateExchangeRates();
            return data === null || data === void 0 ? void 0 : data.conversion_rates;
        }
        console.log("Exchange rates up to date");
        return parsedData.conversion_rates;
    });
}
getExchangeRates().then((data) => {
    console.log("Exchange rates fetched successfully:", data);
});
createConverter();
createKeypad();
document.addEventListener("DOMContentLoaded", setupKeypad);
