interface ExchangeRateApi {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

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

function getCountry() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timezone === "" || !timezone) {
    return null;
  }

  const _country = window.TIMEZONES?.[timezone]?.c?.[0];
  const country = window.COUNTRIES?.[_country || ""];

  return country;
}

function createConverter() {
  const currencyDivs = ["currency-from", "currency-to"];
  const country = getCountry();

  function populateSelect(divId: string) {
    const select = document.querySelector<HTMLSelectElement>(
      `#${divId} > select`
    );
    if (select) {
      select.innerHTML = Object.keys(CURRENCY_NAMES)
        .map((currency) => {
          const currencyName = CURRENCY_NAMES[currency];
          return `<option value="${currency}" ${
            currencyName.includes(country || "") ? "selected" : ""
          }>${currencyName}</option>`;
        })
        .join("");

      // Initial setup to update span id
      const initialSpanId =
        divId === "currency-from" ? "currency-from-input" : "currency-to-input";
      const initialSpan = document.getElementById(initialSpanId);
      if (initialSpan) {
        initialSpan.textContent = select.value;
      }

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

function convertCurrency(value: number, from: string, to: string): number {
  const rates = JSON.parse(localStorage.getItem("exchangeRates") || "{}");
  if (!rates[from] || !rates[to]) return NaN;
  return (value / rates[from]) * rates[to];
}

function formatCurrency(value: number): string {
  return value.toFixed(2);
}

function setupKeypad() {
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
        currencyToInput.value = formatCurrency(convertedValue);
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
        currencyFromInput.value = formatCurrency(convertedValue);
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

function fetchExchangeRateApi() {
  return fetch(
    `https://v6.exchangerate-api.com/v6/17455db23ea4666bc35b72b7/latest/USD`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data: ExchangeRateApi) => {
      return data;
    })
    .catch((error) => {
      console.error("Error fetching exchange rates:", error);
      return null;
    });
}

async function getExchangeRates(): Promise<
  { [key: string]: number } | undefined
> {
  const storedData = localStorage.getItem("exchangeRateApi");

  const updateExchangeRates = async (): Promise<ExchangeRateApi | null> => {
    const data = await fetchExchangeRateApi();
    if (data) {
      localStorage.setItem("exchangeRateApi", JSON.stringify(data));
    }
    return data;
  };

  if (!storedData) {
    console.log("No stored data, updating exchange rates");
    const data = await updateExchangeRates();
    return data?.conversion_rates;
  }

  const parsedData: ExchangeRateApi = JSON.parse(storedData);
  const now = Math.floor(Date.now() / 1000);
  if (parsedData.time_next_update_unix <= now) {
    console.log("Exchange rates out of date, updating");
    const data = await updateExchangeRates();
    return data?.conversion_rates;
  }

  console.log("Exchange rates up to date");
  return parsedData.conversion_rates;
}

getExchangeRates().then((data) => {
  console.log("Exchange rates fetched successfully:", data);
});

// Call the function and console log the exchange rates
// fetchExchangeRateApi().then((data) => {
//   console.log("data:", data);
// });

// function storeExchangeRatesWithTimestamp(
//   rates: ExchangeRates["conversion_rates"]
// ) {
//   if (rates) {
//     const timestamp = new Date().getTime();
//     const dataToStore = {
//       rates: rates,
//       timestamp: timestamp,
//     };
//     localStorage.setItem("exchangeRatesData", JSON.stringify(dataToStore));
//     console.log(
//       "Exchange rates stored in local storage with timestamp:",
//       timestamp
//     );
//   } else {
//     console.log("No rates provided to store");
//   }
// }

// registerServiceWorker();

createConverter();
createKeypad();

document.addEventListener("DOMContentLoaded", setupKeypad);

// fetchExchangeRates().then((rates) => {
//   if (rates) {
//     console.log("Exchange rates fetched successfully:", rates);
//     localStorage.setItem("exchangeRates", JSON.stringify(rates));
//     console.log("Exchange rates stored in local storage");
//   } else {
//     console.log("Failed to fetch exchange rates");
//   }
// });
