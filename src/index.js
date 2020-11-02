require("normalize.css/normalize.css");
require("./styles.css");
const {
  convertDateFormat,
  getDayNumber,
  getWeekDay,
  getMonthName,
  last2000Days,
} = require("./dateFunctions.js");
const {
  plotPriceHistory,
  plotWeekdayChange,
  plotATHHistory,
} = require("./plots.js");

filterDays = 365;
let allTimeHighPrice = 0;
let navMenuPosition = 0;
let exchange = "CCCAGG";
let coinNumerator = "";
let coinDenominator = "";
let priorCoinQuery = "";
historicalPrice = [];
historicalOpen = [];
historicalLow = [];
historicalHigh = [];
historicalChange = [];
historicalWeekday = [];
historicalDate = [];
currentPrice = 0;
const options = {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
};
$(document).ready(function () {
  var localDate = new Date();
  timeOffset = localDate.getTimezoneOffset() / 60;
  let day = localDate.getDate();
  let dayLong = getDayNumber(day);
  let month = getMonthName(localDate.getMonth());
  let weekDay = getWeekDay(localDate.getDay());
  $(".date-num").html(day);
  $(".date-info").html(weekDay + ", " + month + " " + dayLong + " ");
});

function plotChart() {
  switch (navMenuPosition) {
    case 0:
      plotPriceHistory(
        historicalDate,
        historicalPrice,
        historicalLow,
        historicalHigh,
        historicalOpen,
        coinNumerator,
        coinDenominator,
        filterDays,
        currentPrice
      );
      break;
    case 1:
      plotWeekdayChange(
        historicalChange,
        historicalWeekday,
        historicalDate,
        coinNumerator,
        coinDenominator,
        filterDays
      );
      break;
    case 2:
      plotATHHistory(
        allTimeHighRelativePrice,
        allTimeHighRatioDates,
        allTimeHighRatio,
        coinNumerator,
        coinDenominator,
        filterDays
      );
      break;
  }
}

function getHistoricalPriceData(divide) {
  if (coinNumerator + coinDenominator === priorCoinQuery) {
    return;
  }
  const url =
    "https://min-api.cryptocompare.com/data/histoday?fsym=" +
    coinNumerator +
    "&tsym=" +
    coinDenominator +
    "&limit=2000&aggregate=1&toTs=-2211638400&e=" +
    exchange;
  const urlEntered = divide ? url + "&tryConversion=false" : url;

  fetch(urlEntered, options)
    .then((response) => response.json())
    .then((data) => {
      convert = 0;
      historicalPrice = [];
      historicalOpen = [];
      historicalLow = [];
      historicalHigh = [];
      historicalChange = [];
      historicalWeekday = [];
      historicalDate = [];
      allTimeHighRatio = [];
      allTimeHighRatioDates = [];
      allTimeHighRelativePrice = [];
      allTimeHighPrice = 0;
      var startDay = 0;
      console.log(data);
      priorCoinQuery = coinNumerator + coinDenominator;
      console.log(priorCoinQuery);
      if (data.ConversionType.type === "divide") {
        getHistoricalPriceData(1);
      } else {
        for (var i = 1999; i >= 1; i--) {
          let newDate = new Date((data.Data[i].time + 86400) * 1000).toString();
          if (data.Data[i].close == 0) {
            i = 0;
            staryDay = i;
          } else {
            historicalPrice.push(data.Data[i].close);
            historicalLow.push(data.Data[i].low);
            historicalHigh.push(data.Data[i].high);
            historicalOpen.push(data.Data[i].open);
            historicalDate.push(convertDateFormat(newDate));
            var previousDayPrice = data.Data[i - 1].close;
            var dayOfPrice = data.Data[i].close;
            if (previousDayPrice === 0) {
              dailyChangePrice = 0;
            } else {
              var dailyChangePrice = dayOfPrice / previousDayPrice - 1;
            }
            historicalChange.push(dailyChangePrice * 100);
          }

          var dayOfWeek = newDate.substr(0, 3);
          historicalWeekday.push(dayOfWeek);
        }
      }
      for (var i = startDay; i <= 1999; i++) {
        if (
          data.Data[i].high > allTimeHighPrice &&
          data.Data[i].high <= 5 * data.Data[i].close
        ) {
          var allTimeHighDate = new Date((data.Data[i].time + 86400) * 1000);
          var athRatio = (100 * data.Data[i].close) / allTimeHighPrice;
          if (athRatio <= 500) {
            allTimeHighRatio.push(athRatio);
          } else {
            allTimeHighRatio.push(100);
          }
          allTimeHighRelativePrice.push(data.Data[i].close);
          allTimeHighRatioDates.push(allTimeHighDate);
          allTimeHighPrice = data.Data[i].high;
        } else if (allTimeHighPrice !== 0) {
          var athRatio = (100 * data.Data[i].close) / allTimeHighPrice;
          if (athRatio <= 500) {
            allTimeHighRatio.push(athRatio);
          } else {
            allTimeHighRatio.push(100);
          }
          allTimeHighRelativePrice.push(data.Data[i].close);
          var ratioDate = new Date((data.Data[i].time + 86400) * 1000);
          allTimeHighRatioDates.push(ratioDate);
          $(".allTimeHighPriceOutput").html(
            "ATH of " +
              coinNumerator +
              ": " +
              allTimeHighPrice +
              "</br> on " +
              allTimeHighDate.toString().substring(4, 15)
          );
        }
      }
      getCurrentPriceData(allTimeHighPrice);
      maxDaysHandle(historicalDate);
    });
}

$(".submit").click(onSubmit);

function onSubmit() {
  coinNumerator = $("#coinCompare1").val().toUpperCase();
  coinDenominator = $("#denom-choices").val().toUpperCase();
  getHistoricalPriceData(0);
}

$(".nav-price").click(function () {
  navMenuPosition = 0;
  filterDays = 365;
  changeHandle();
  plotChart();
});

$(".nav-weekday").click(function () {
  navMenuPosition = 1;
  filterDays = 30;
  changeHandle();
  plotChart();
});

$(".nav-ath").click(function () {
  navMenuPosition = 2;
  filterDays = 365;
  changeHandle();
  plotChart();
});

function getCurrentPriceData(allTimeHighPrice) {
  console.log("getcurrentprice");
  const url =
    "https://min-api.cryptocompare.com/data/price?fsym=" +
    coinNumerator +
    "&tsyms=" +
    coinDenominator +
    "&e=" +
    exchange;

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      currentPrice = data[coinDenominator];
      if (allTimeHighPrice > 0) {
        $(".currentPriceOutput").html(
          "Current Price of " +
            coinNumerator +
            ": " +
            currentPrice +
            " " +
            coinDenominator +
            "</br> (" +
            Math.round((currentPrice / allTimeHighPrice) * 10000) / 100 +
            "% of ATH)"
        );
      } else {
        $(".currentPriceOutput").html(
          "Current Price of " +
            coinNumerator +
            ": " +
            currentPrice +
            " " +
            coinDenominator +
            "</br> (100% of ATH)"
        );
      }
      plotChart();
    });
}

changeHandle();
function changeHandle() {
  $element = $('input[type="range"]');
  last2000Days();
  $element
    .rangeslider({
      polyfill: false,
      onInit: function () {
        var $handle = $(".rangeslider__handle", this.$range);
        updateHandle($handle[0], this.value);
        $(".filter-one").html(result[this.value] + " - " + result[0]);
        filterDays = this.value;
      },
    })
    .on("input", function (e) {
      var $handle = $(".rangeslider__handle", e.target.nextSibling);
      updateHandle($handle[0], filterDays);
      $(".filter-one").html(result[filterDays] + " - " + result[0]);
      filterDays = this.value;
      plotChart();
    });
  var $handle = $(".rangeslider__handle");
  updateHandle($handle[0], filterDays);
  $(".filter-one").html(result[filterDays] + " - " + result[0]);
}

function updateHandle(el, val) {
  el.textContent = val;
}

function maxDaysHandle(historicalDate) {
  maxDays = historicalDate.length;
  $(".filter1").max = maxDays;
}

$(".dayEntry").on("keydown", function (e) {
  if (e.which == 13) {
    $element.val(this.value).change();
    changeHandle();
  }
});

$(".coinEntry").on("keydown", function (e) {
  if (e.which == 13) {
    coinNumerator = $("#coinCompare1").val().toUpperCase();
    coinDenominator = $("#denom-choices").val().toUpperCase();
    getHistoricalPriceData(0);
  }
});

document
  .getElementById("exchange-choices")
  .addEventListener("change", exchangeChange);
function exchangeChange() {
  exchange = this.value;
  priorCoinQuery = "";
  onSubmit();
}

document
  .getElementById("denom-choices")
  .addEventListener("change", denomChange);
function denomChange() {
  coinDenominator = this.value;
  onSubmit();
}

jQuery(document).ready(function ($) {
  var popupInfo = {
    0: "The Price chart shows the daily close price of a given coin pairing (see chart title) over time",
    1: "The Weekday chart shows the amount of daily change (close/open - 1) for each weekday over a given time period. A confidence interval is calculated and shown with Error Bars. Data is based on GMT time but the suggested time to make decisions is listed on the chart and is based on the timezone given by your network.",
    2: "The All Time High chart shows the close price of each day versus the ATH reached prior to that date. For instance, if on January 1st an ATH of $100 was reached but on January 2nd our close price was $110, the value on the chart for Jan 2 would show 110% of ATH for that day. However, if on January 3rd the price stayed stable at $110, the chart value for Jan 3 would be 100%. This may be a useful tool for setting limit buys as it suggests the absolute lowest the price dropped relative to historical ATHs in the past.",
  };
  //open popup
  $(".popup-trigger").on("click", function (event) {
    event.preventDefault();
    $(".popup").addClass("is-visible");
    $(".popup-container").html(popupInfo[navMenuPosition]);
  });

  //close popup
  $(".popup").on("click", function (event) {
    if ($(event.target).is(".popup-close") || $(event.target).is(".popup")) {
      event.preventDefault();
      $(this).removeClass("is-visible");
    }
  });
  //close popup when clicking the esc keyboard button
  $(document).keyup(function (event) {
    if (event.which == "27") {
      $(".popup").removeClass("is-visible");
    }
  });
});
