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
