require("normalize.css/normalize.css");
require("./styles.css");
const {
  convertDateFormat,
  getDayNumber,
  getWeekDay,
  getMonthName,
  last2000Days,
  formatDate,
} = require("./dateFunctions.js");
const {
  plotPriceHistory,
  plotWeekdayChange,
  plotATHHistory,
  plotHourlyData,
} = require("./plots.js");

let samePrice = [];
let allTimeHighPrice = 0;
let navMenuPosition = 0;
let exchange = "CCCAGG";
let coinNumerator = "";
let coinDenominator = "";
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

function getHistoricalPriceData(divide) {
  console.log("getHistoricalPriceData function");
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
      console.log(data);
      convert = 0;
      var historicalPrice = [];
      var historicalOpen = [];
      var historicalLow = [];
      var historicalHigh = [];
      var historicalDate = [];
      var historicalChange = [];
      var historicalWeekday = [];
      allTimeHighRatio = [];
      allTimeHighRatioDates = [];
      allTimeHighRelativePrice = [];
      allTimeHighPrice = 0;
      console.log(data.ConversionType.type);
      if (data.ConversionType.type === "divide") {
        getHistoricalPriceData(1);
      } else {
        for (var i = 1999; i >= 1; i--) {
          let newDate = new Date((data.Data[i].time + 86400) * 1000).toString();
          if (data.Data[i].close == []) {
            i = 0;
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
            if (
              data.Data[i].high > allTimeHighPrice &&
              data.Data[i].high <= 5 * data.Data[i].close
            ) {
              var allTimeHighDate = new Date(
                (data.Data[i].time + 86400) * 1000
              );
              var athRatio = (100 * data.Data[i].close) / allTimeHighPrice;
              if (athRatio <= 500) {
                allTimeHighRatio.push(athRatio);
              } else {
                allTimeHighRatio.push(100);
              }
              allTimeHighRelativePrice.push(data.Data[i].close);
              var ratioDate = new Date((data.Data[i].time + 86400) * 1000);
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
            }
            $(".allTimeHighPriceOutput").html(
              "ATH of " +
                coinNumerator +
                ": " +
                allTimeHighPrice +
                "</br> on " +
                allTimeHighDate.toString().substring(4, 15)
            );
            var dayOfWeek = newDate.substr(0, 3);
            historicalWeekday.push(dayOfWeek);
          }
        }
        getCurrentPriceData(allTimeHighPrice);
        maxDaysHandle(historicalDate);

        switch (navMenuPosition) {
          case 0:
            plotPriceHistory(
              historicalDate,
              historicalPrice,
              historicalLow,
              historicalHigh,
              historicalOpen,
              coinNumerator,
              coinDenominator
            );
            break;
          case 1:
            plotWeekdayChange(
              historicalChange,
              historicalWeekday,
              historicalDate,
              coinNumerator,
              coinDenominator
            );
            break;
          case 2:
            plotATHHistory(
              allTimeHighRelativePrice,
              allTimeHighRatioDates,
              allTimeHighRatio,
              coinNumerator,
              coinDenominator
            );
            break;
        }
      }
    });
}


function filterHistoricalPriceData() {
      convert = 0;
      var historicalPrice = [];
      var historicalOpen = [];
      var historicalLow = [];
      var historicalHigh = [];
      var historicalDate = [];
      var historicalChange = [];
      var historicalWeekday = [];
      allTimeHighRatio = [];
      allTimeHighRatioDates = [];
      allTimeHighRelativePrice = [];
      allTimeHighPrice = 0;
      console.log(data.ConversionType.type);
      if (data.ConversionType.type === "divide") {
        getHistoricalPriceData(1);
      } else {
        for (var i = 1999; i >= 1; i--) {
          let newDate = new Date((data.Data[i].time + 86400) * 1000).toString();
          if (data.Data[i].close == []) {
            i = 0;
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
            var dayOfWeek = newDate.substr(0, 3);
            historicalWeekday.push(dayOfWeek);
          }
        }
        getCurrentPriceData(allTimeHighPrice);
        maxDaysHandle(historicalDate);

        switch (navMenuPosition) {
          case 0:
            plotPriceHistory(
              historicalDate,
              historicalPrice,
              historicalLow,
              historicalHigh,
              historicalOpen,
              coinNumerator,
              coinDenominator
            );
            break;
          case 1:
            plotWeekdayChange(
              historicalChange,
              historicalWeekday,
              historicalDate,
              coinNumerator,
              coinDenominator
            );
            break;
          case 2:
            plotATHHistory(
              allTimeHighRelativePrice,
              allTimeHighRatioDates,
              allTimeHighRatio,
              coinNumerator,
              coinDenominator
            );
            break;
        }
      }
    });
}

// function getRecentEqualPrices(
//   historicalPrice,
//   historicalLow,
//   historicalHigh,
//   historicalOpen,
//   historicalDate,
//   historicalWeekday,
//   historicalChange,
//   allTimeHighRatio,
//   allTimeHighRatioDates,
//   allTimeHighRelativePrice
// ) {
//   switch (navMenuPosition) {
//     case 0:
//       plotPriceHistory(
//         historicalDate,
//         historicalPrice,
//         historicalLow,
//         historicalHigh,
//         historicalOpen,
//       );
//       break;
//     case 1:
//       plotWeekdayChange(
//         historicalChange,
//         historicalWeekday,
//         historicalDate,
//       );
//       break;
//     case 2:
//       plotATHHistory(
//         allTimeHighRelativePrice,
//         allTimeHighRatioDates,
//         allTimeHighRatio
//       );
//       break;
//   }
// }

$(".submit").click(onSubmit);

function onSubmit() {
  coinNumerator = $("#coinCompare1").val().toUpperCase();
  coinDenominator = $("#denom-choices").val().toUpperCase();
  getHistoricalPriceData(0);
  if (navMenuPosition === 3) {
    getHistoricalHourlyData();
  }
}

$(".nav-price").click(function () {
  navMenuPosition = 0;
  filterDays = 365;
  changeHandle();
  onSubmit();
});

$(".nav-weekday").click(function () {
  navMenuPosition = 1;
  filterDays = 30;
  changeHandle();
  onSubmit();
});

$(".nav-ath").click(function () {
  navMenuPosition = 2;
  filterDays = 365;
  changeHandle();
  onSubmit();
});

$(".nav-hourly").click(function () {
  navMenuPosition = 3;
  filterDays = 30;
  changeHandle();
  onSubmit();
});

function getCurrentPriceData(allTimeHighPrice) {
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
      if (navMenuPosition === 3) {
        getHistoricalHourlyData();
      } else {
        // onSubmit();
      }
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
    // onSubmit();
    if (navMenuPosition === 3) {
      getHistoricalHourlyData();
    }
    changeHandle();
  }
});

$(".coinEntry").on("keydown", function (e) {
  if (e.which == 13) {
    coinNumerator = $("#coinCompare1").val().toUpperCase();
    console.log(coinNumerator);
    coinDenominator = $("#denom-choices").val().toUpperCase();
    console.log(coinDenominator);
    getHistoricalPriceData();
    if (navMenuPosition === 3) {
      getHistoricalHourlyData();
    }
  }
});

function getHistoricalHourlyData() {
  var hourlyDate = [];
  var hourlyLongDate = [];
  var hourlyHour = [];
  var hourlyPrice = [];
  var hourlyPriceChange = [];
  $.get(
    "https://min-api.cryptocompare.com/data/histohour?fsym=" +
      coinNumerator +
      "&tsym=" +
      coinDenominator +
      "&limit=2000&aggregate=1&e=" +
      exchange,
    function (data, status) {
      if (data.ConversionType.type === "divide") {
        getHistoricalHourlyDataAlt();
      } else {
        for (i = 2001 - filterDays * 24; i <= data.Data.length - 1; i++) {
          var hourlyDateInt = new Date(data.Data[i].time * 1000);
          var hourlyHourInt = hourlyDateInt.toString().slice(16, 18);
          var hourlyPriceInt = data.Data[i].close;
          var hourlyPriceChangeInt =
            100 * (data.Data[i].close / data.Data[i].open - 1);
          hourlyDate.push(hourlyDateInt.toString().slice(4, 15));
          hourlyLongDate.push(hourlyDateInt.toString().slice(4, 21));
          hourlyHour.push(hourlyHourInt);
          hourlyPrice.push(hourlyPriceInt);
          hourlyPriceChange.push(hourlyPriceChangeInt);
        }
        groups3 = {};
        $.each(hourlyHour, function (ind, itm) {
          if (!groups3[itm]) {
            groups3[itm] = { hourValues: [] };
          }
          groups3[itm].hourValues.push(hourlyPriceChange[ind]); // sum values belonging to same key
        });
        var hourlyChangeAverage = [];
        var hourlyChangeMedian = [];
        var hourlyChangeStd = [];
        var hourlyCI = [];
        for (var i = 0; i <= 23; i++) {
          hourlyChangeAverage.push(
            math.mean(groups3[hourlyHour[i]].hourValues)
          );
          hourlyChangeStd.push(math.std(groups3[hourlyHour[i]].hourValues));
          hourlyCI.push(
            1.96 *
              (hourlyChangeStd[i] /
                math.sqrt(groups3[hourlyHour[i]].hourValues.length))
          );
        }
        var errorBars = {
          x: hourlyHour.slice(-filterDays * 24),
          y: hourlyChangeAverage.slice(-filterDays * 24),
          error_y: {
            type: "data",
            array: hourlyCI,
            visible: true,
          },
          mode: "markers",
          type: "scatter",
        };
        plotHourlyData(
          hourlyLongDate,
          hourlyDate,
          hourlyHour,
          hourlyPrice,
          errorBars,
          hourlyPriceChange
        );
      }
    }
  );
}

function getHistoricalHourlyDataAlt() {
  var hourlyDate = [];
  var hourlyLongDate = [];
  var hourlyHour = [];
  var hourlyPrice = [];
  var hourlyPriceChange = [];
  $.get(
    "https://min-api.cryptocompare.com/data/histohour?fsym=" +
      coinNumerator +
      "&tsym=" +
      coinDenominator +
      "&limit=2000&aggregate=1&e=" +
      exchange +
      "&tryConversion=false",
    function (data, status) {
      for (i = 2001 - filterDays * 24; i <= data.Data.length - 1; i++) {
        var hourlyDateInt = new Date(data.Data[i].time * 1000);
        var hourlyHourInt = hourlyDateInt.toString().slice(16, 18);
        var hourlyPriceInt = data.Data[i].close;
        var hourlyPriceChangeInt =
          100 * (data.Data[i].close / data.Data[i].open - 1);
        hourlyDate.push(hourlyDateInt.toString().slice(4, 15));
        hourlyLongDate.push(hourlyDateInt.toString().slice(4, 21));
        hourlyHour.push(hourlyHourInt);
        hourlyPrice.push(hourlyPriceInt);
        hourlyPriceChange.push(hourlyPriceChangeInt);
      }
      groups3 = {};
      $.each(hourlyHour, function (ind, itm) {
        if (!groups3[itm]) {
          groups3[itm] = { hourValues: [] };
        }
        groups3[itm].hourValues.push(hourlyPriceChange[ind]); // sum values belonging to same key
      });
      var hourlyChangeAverage = [];
      var hourlyChangeStd = [];
      var hourlyCI = [];
      for (var i = 0; i <= 23; i++) {
        hourlyChangeAverage.push(math.mean(groups3[hourlyHour[i]].hourValues));
        hourlyChangeStd.push(math.std(groups3[hourlyHour[i]].hourValues));
        hourlyCI.push(
          1.96 *
            (hourlyChangeStd[i] /
              math.sqrt(groups3[hourlyHour[i]].hourValues.length))
        );
      }
      var errorBars = {
        x: hourlyHour.slice(-filterDays * 24),
        y: hourlyChangeAverage.slice(-filterDays * 24),
        error_y: {
          type: "data",
          array: hourlyCI,
          visible: true,
        },
        mode: "markers",
        type: "scatter",
      };
      plotHourlyData(
        hourlyLongDate,
        hourlyDate,
        hourlyHour,
        hourlyPrice,
        errorBars,
        hourlyPriceChange,
        hourlyChangeMedian
      );
    }
  );
}

document
  .getElementById("exchange-choices")
  .addEventListener("change", exchangeChange);
function exchangeChange() {
  exchange = this.value;
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
    3: "The Hourly chart shows the amount of hourly change (close/open - 1) for up to the past 2000 hours. The goal of the chart is to identify patterns in price action based on time zone. As with the Weekly chart, confidence intervals are used.",
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
