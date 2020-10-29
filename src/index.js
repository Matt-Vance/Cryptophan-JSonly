ethereumAddresses = [];
samePrice = [];
allTimeHighPrice = 0;
menuItem = 0;
filterDays = 365;
exchange = "CCCAGG";
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

function getHistoricalPriceData(
  coinNumerator,
  coinDenominator,
  unixEntered,
  divide
) {
  const url =
    "https://min-api.cryptocompare.com/data/histoday?fsym=" +
    coinNumerator +
    "&tsym=" +
    coinDenominator +
    "&limit=2000&aggregate=1&toTs=" +
    unixEntered +
    "&e=" +
    exchange;
  const urlEntered = divide ? url + "&tryConversion=false" : url;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
  };

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

      if (data.ConversionType.type === "divide") {
        getHistoricalPriceData(coinNumerator, coinDenominator, unixEntered, 1);
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
          }
          var dayOfWeek = newDate.substr(0, 3);
          historicalWeekday.push(dayOfWeek);
        }
        maxDaysHandle(historicalDate);
        console.log(historicalPrice);

        switch (menuItem) {
          case 0:
            plotPriceHistory(
              historicalDate,
              historicalPrice,
              historicalLow,
              historicalHigh,
              historicalOpen,
              coinDenominator,
              coinNumerator
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
            getHistoricalATHData(
              coinNumerator,
              coinDenominator,
              unixEntered,
              data,
              historicalPrice,
              historicalLow,
              historicalHigh,
              historicalOpen,
              historicalDate,
              historicalWeekday,
              historicalChange
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
//   coinNumerator,
//   coinDenominator,
//   allTimeHighRatio,
//   allTimeHighRatioDates,
//   allTimeHighRelativePrice
// ) {
//   switch (menuItem) {
//     case 0:
//       plotPriceHistory(
//         historicalDate,
//         historicalPrice,
//         historicalLow,
//         historicalHigh,
//         historicalOpen,
//         coinDenominator,
//         coinNumerator
//       );
//       break;
//     case 1:
//       plotWeekdayChange(
//         historicalChange,
//         historicalWeekday,
//         historicalDate,
//         coinNumerator,
//         coinDenominator
//       );
//       break;
//     case 2:
//       plotATHHistory(
//         allTimeHighRelativePrice,
//         allTimeHighRatioDates,
//         coinDenominator,
//         coinNumerator,
//         allTimeHighRatio
//       );
//       break;
//   }
// }

$(".submit").click(onSubmit());

function onSubmit() {
  var coinNumerator = $("#coinCompare1").val().toUpperCase();
  var coinDenominator = $("#denom-choices").val().toUpperCase();
  var monthEntry = $("#dateEntry1").val();
  var dayEntry = $("#dateEntry2").val();
  var yearEntry = $("#dateEntry3").val();
  var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
  unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
  getHistoricalPriceData(coinNumerator, coinDenominator, unixEntered, 0);
  if (menuItem === 3) {
    getHistoricalHourlyData(coinNumerator, coinDenominator, unixEntered);
  }
}

$(".nav-price").click(function () {
  menuItem = 0;
  filterDays = 365;
  changeHandle();
  onSubmit();
});

$(".nav-weekday").click(function () {
  menuItem = 1;
  filterDays = 30;
  changeHandle();
  onSubmit();
});

$(".nav-ath").click(function () {
  menuItem = 2;
  filterDays = 365;
  changeHandle();
  onSubmit();
});

$(".nav-hourly").click(function () {
  menuItem = 3;
  filterDays = 30;
  changeHandle();
  onSubmit();
});

function getCurrentPriceData(coinNumerator, coinDenominator) {
  $.get(
    "https://min-api.cryptocompare.com/data/price?fsym=" +
      coinNumerator +
      "&tsyms=" +
      coinDenominator +
      "&e=" +
      exchange,
    function (data) {
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
    }
  );
}

function getHistoricalATHData(
  coinNumerator,
  coinDenominator,
  unixEntered,
  data,
  historicalPrice,
  historicalLow,
  historicalHigh,
  historicalOpen,
  historicalDate,
  historicalWeekday,
  historicalChange
) {
  allTimeHighRatio = [];
  allTimeHighRatioDates = [];
  allTimeHighRelativePrice = [];
  allTimeHighPrice = 0;
  for (var i = 0; i <= 1999; i++) {
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
  }
  $(".allTimeHighPriceOutput").html(
    "ATH of " +
      coinNumerator +
      ": " +
      allTimeHighPrice +
      "</br> on " +
      allTimeHighDate.toString().substring(4, 15)
  );
  getCurrentPriceData(coinNumerator, coinDenominator);

  setTimeout(function () {
    plotATHHistory(
      allTimeHighRelativePrice,
      allTimeHighRatioDates,
      coinDenominator,
      coinNumerator,
      allTimeHighRatio
    );
  }, 1000);
}

function plotPriceHistory(
  historicalDate,
  historicalPrice,
  historicalLow,
  historicalHigh,
  historicalOpen,
  coinDenominator,
  coinNumerator
) {
  var d3 = Plotly.d3;
  console.log(historicalPrice);
  var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 60;

  var gd3 = d3.select("#myDiv").style({
    width: WIDTH_IN_PERCENT_OF_PARENT + "%",
    "margin-left": (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + "%",

    height: HEIGHT_IN_PERCENT_OF_PARENT + "vh",
    "margin-top": (60 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + "vh",
    "margin-bottom": 0,
    "padding-bottom": 0,
  });

  var gd = gd3.node();
  var trace3 = {
    x: historicalDate.slice(0, filterDays),
    y: historicalPrice.slice(0, filterDays),
    mode: "lines",
    name: "Close price",
    type: "scatter",
  };

  var trace1 = {
    x: historicalDate.slice(0, filterDays),
    close: historicalPrice.slice(0, filterDays),
    open: historicalOpen.slice(0, filterDays),
    high: historicalHigh.slice(0, filterDays),
    low: historicalLow.slice(0, filterDays),
    mode: "lines",
    name: "Close price",
    type: "candlestick",
  };

  var layout = {
    title: "Close Price " + coinNumerator + " vs " + coinDenominator,
    xaxis: {
      title: "Date",
      titlefont: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      fixedrange: true,
      rangeslider: {
        visible: false,
      },
    },
    yaxis: {
      title: "Price" + "(" + coinDenominator + ")",
      type: "linear",
      autorange: true,
      titlefont: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      fixedrange: true,
    },
    // shapes: [
    //   {
    //     type: "line",
    //     xref: "paper",
    //     x0: 0,
    //     x1: 1,
    //     y0: currentPrice,
    //     y1: currentPrice,
    //     line: {
    //       color: "rgb(50, 11, 96)",
    //       width: 1,
    //       dash: "dashdot",
    //     },
    //   },
    // ],
  };

  if (convert === 0) {
    var plotData = [trace1];
  } else {
    plotData = [trace3];
  }

  Plotly.newPlot(gd, plotData, layout);
  $(".radio2").addClass("hide");
  $(".radio1").removeClass("hide");
  $("#radio1").click(function () {
    if (layout.yaxis.type === "log") {
      layout.yaxis.type = "linear";
    } else {
      layout.yaxis.type = "log";
    }
    Plotly.newPlot(gd, plotData, layout);
  });
  window.onresize = function () {
    Plotly.Plots.resize(gd);
  };
}

function plotWeekdayChange(
  historicalChange,
  historicalWeekday,
  historicalDate,
  coinNumerator,
  coinDenominator
) {
  var d3 = Plotly.d3;

  var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 60;

  var gd3 = d3.select("#myDiv").style({
    width: WIDTH_IN_PERCENT_OF_PARENT + "%",
    "margin-left": (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + "%",

    height: HEIGHT_IN_PERCENT_OF_PARENT + "vh",
    "margin-top": (60 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + "vh",
    "margin-bottom": 0,
    "padding-bottom": 0,
  });

  var gd = gd3.node();
  historicalChange = historicalChange.slice(0, filterDays);
  historicalWeekday = historicalWeekday.slice(0, filterDays);
  historicalDate = historicalDate.slice(0, filterDays);
  var trace1 = {
    x: historicalWeekday,
    text: historicalDate,
    y: historicalChange,
    mode: "markers",
    type: "scatter",
  };

  var groups2 = {};

  $.each(historicalWeekday, function (ind, itm) {
    if (!groups2[itm]) {
      groups2[itm] = { weekValues: [] };
    }
    groups2[itm].weekValues.push(historicalChange[ind]); // sum values belonging to same key
  });
  var weeklyChangeAverage = [];
  var weeklyChangeMedian = [];
  var weeklyChangeStd = [];
  var weeklyCI = [];
  for (var i = 0; i <= 6; i++) {
    weeklyChangeAverage.push(
      math.mean(groups2[historicalWeekday[i]].weekValues)
    );
    weeklyChangeMedian.push(
      math.median(groups2[historicalWeekday[i]].weekValues)
    );
    weeklyChangeStd.push(math.std(groups2[historicalWeekday[i]].weekValues));
    weeklyCI.push(
      1.96 *
        (weeklyChangeStd[i] /
          math.sqrt(groups2[historicalWeekday[i]].weekValues.length))
    );
  }
  var errorBars = {
    x: historicalWeekday,
    y: weeklyChangeAverage,
    error_y: {
      type: "data",
      array: weeklyCI,
      visible: true,
    },
    mode: "markers",
    type: "scatter",
    name: "Mean + CI",
  };

  var trace2 = {
    x: historicalWeekday,
    y: weeklyChangeMedian,
    mode: "markers",
    type: "scatter",
    name: "Median",
  };

  if (timeOffset >= 0) {
    var layout = {
      hovermode: "closest",
      title:
        "<b>Day of Week" +
        " (" +
        coinNumerator +
        ")" +
        "</b> <br> Use " +
        Number(24 - timeOffset) +
        ":00" +
        " of the previous day to make trades",
      xaxis: {
        title: "Date",
        titlefont: {
          family: "Courier New, monospace",
          size: 18,
          color: "#7f7f7f",
        },
        fixedrange: true,
      },
      yaxis: {
        title: "% Change" + "(" + coinDenominator + ")",
        type: "linear",
        autorange: true,
        titlefont: {
          family: "Courier New, monospace",
          size: 18,
          color: "#7f7f7f",
        },
        fixedrange: true,
      },
      shapes: [
        {
          type: "line",
          x0: "Sun",
          x1: "Sat",
          y0: 0,
          y1: 0,
          line: {
            color: "rgb(50, 171, 96)",
            width: 4,
            dash: "dashdot",
          },
        },
      ],
    };
  } else {
    var layout = {
      hovermode: "closest",
      title:
        "<b>Day of Week</b> <br> Use " +
        Number(0 - timeOffset) +
        ":00" +
        " of the current day to make trades",
      xaxis: {
        title: "Date",
        titlefont: {
          family: "Courier New, monospace",
          size: 18,
          color: "#7f7f7f",
        },
        fixedrange: true,
      },
      yaxis: {
        title: "% Change" + "(" + coinDenominator + ")",
        type: "linear",
        autorange: true,
        titlefont: {
          family: "Courier New, monospace",
          size: 18,
          color: "#7f7f7f",
        },
        fixedrange: true,
      },
      shapes: [
        {
          type: "line",
          x0: "Sun",
          x1: "Sat",
          y0: 0,
          y1: 0,
          line: {
            color: "rgb(50, 171, 96)",
            width: 4,
            dash: "dashdot",
          },
        },
      ],
    };
  }

  var dataSetPlotted = [errorBars, trace2];
  var plotData = dataSetPlotted;

  Plotly.newPlot(gd, plotData, layout);

  Plotly.relayout(gd, {
    "xaxis.categoryarray": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  });
  $(".radio1").addClass("hide");
  $(".radio2").removeClass("hide");
  $("#radio2").click(function () {
    if (dataSetPlotted.length === 1) {
      dataSetPlotted = [errorBars, trace2];
    } else {
      dataSetPlotted = [trace1];
    }
    var plotData = dataSetPlotted;
    Plotly.newPlot(gd, plotData, layout);
  });
  window.onresize = function () {
    Plotly.Plots.resize(gd);
  };
}

function plotATHHistory(
  allTimeHighRelativePrice,
  allTimeHighRatioDates,
  coinDenominator,
  coinNumerator,
  allTimeHighRatio
) {
  var d3 = Plotly.d3;
  var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 60;

  var gd3 = d3.select("#myDiv").style({
    width: WIDTH_IN_PERCENT_OF_PARENT + "%",
    "margin-left": (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + "%",

    height: HEIGHT_IN_PERCENT_OF_PARENT + "vh",
    "margin-top": (60 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + "vh",
    "margin-bottom": 0,
    "padding-bottom": 0,
  });

  var gd = gd3.node();
  var trace1 = {
    x: allTimeHighRatioDates.slice(-filterDays),
    y: allTimeHighRatio.slice(-filterDays),
    mode: "lines",
    text: allTimeHighRelativePrice.slice(-filterDays),
    type: "scatter",
  };

  var layout = {
    title: "ATH Ratio " + coinNumerator + "/" + coinDenominator,
    xaxis: {
      title: "Date",
      titlefont: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      fixedrange: true,
    },
    yaxis: {
      title: "ATH %" + "(" + coinDenominator + ")",
      type: "linear",
      autorange: true,
      titlefont: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      fixedrange: true,
    },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: 100.0,
        y1: 100.0,
        line: {
          color: "rgb(50, 171, 96)",
          width: 4,
          dash: "dashdot",
        },
      },
    ],
  };

  var plotData = [trace1];

  Plotly.newPlot(gd, plotData, layout);
  $(".radio2").addClass("hide");
  $(".radio1").removeClass("hide");
  $("#radio1").click(function () {
    if (layout.yaxis.type === "log") {
      layout.yaxis.type = "linear";
    } else {
      layout.yaxis.type = "log";
    }
    Plotly.newPlot(gd, plotData, layout, { editable: true });
  });
  window.onresize = function () {
    Plotly.Plots.resize(gd);
  };
}
changeHandle();
function changeHandle() {
  $element = $('input[type="range"]');
  Last2000Days();
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
      var updatedNum = Math.ceil(filterDays);
      $(".filter-one").html(result[filterDays] + " - " + result[0]);
      filterDays = this.value;
      if (menuItem === 3) {
        var coinNumeratorInt = $("#coinCompare1").val();
        var coinNumerator = coinNumeratorInt.toUpperCase();
        var coinDenominatorInt = $("#denom-choices").val();
        var coinDenominator = coinDenominatorInt.toUpperCase();
        var monthEntry = $("#dateEntry1").val();
        var dayEntry = $("#dateEntry2").val();
        var yearEntry = $("#dateEntry3").val();
        var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
        unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
        getHistoricalHourlyData(coinNumerator, coinDenominator, unixEntered);
      } else {
        onSubmit();
      }
    });
  var $handle = $(".rangeslider__handle");
  updateHandle($handle[0], filterDays);
  var updatedNum = Math.ceil(filterDays);
  $(".filter-one").html(result[filterDays] + " - " + result[0]);
}
function Last2000Days() {
  result = [];
  for (var i = 0; i < 2000; i++) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    result.push(formatDate(d));
  }
}

function formatDate(date) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1;
  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  date = mm + "/" + dd + "/" + yyyy;
  return date;
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
    onSubmit();
    if (menuItem === 3) {
      var coinNumeratorInt = $("#coinCompare1").val();
      var coinNumerator = coinNumeratorInt.toUpperCase();
      var coinDenominatorInt = $("#denom-choices").val();
      var coinDenominator = coinDenominatorInt.toUpperCase();
      var monthEntry = $("#dateEntry1").val();
      var dayEntry = $("#dateEntry2").val();
      var yearEntry = $("#dateEntry3").val();
      var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
      unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
      getHistoricalHourlyData(coinNumerator, coinDenominator, unixEntered);
    }
    changeHandle();
  }
});

$(".coinEntry").on("keydown", function (e) {
  if (e.which == 13) {
    var coinNumeratorInt = $("#coinCompare1").val();
    var coinNumerator = coinNumeratorInt.toUpperCase();
    var coinDenominatorInt = $("#denom-choices").val();
    var coinDenominator = coinDenominatorInt.toUpperCase();
    var monthEntry = $("#dateEntry1").val();
    var dayEntry = $("#dateEntry2").val();
    var yearEntry = $("#dateEntry3").val();
    var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
    var unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
    getHistoricalPriceData(coinNumerator, coinDenominator, unixEntered);
    if (menuItem === 3) {
      var coinNumeratorInt = $("#coinCompare1").val();
      var coinNumerator = coinNumeratorInt.toUpperCase();
      var coinDenominatorInt = $("#denom-choices").val();
      var coinDenominator = coinDenominatorInt.toUpperCase();
      var monthEntry = $("#dateEntry1").val();
      var dayEntry = $("#dateEntry2").val();
      var yearEntry = $("#dateEntry3").val();
      var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
      unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
      getHistoricalHourlyData(coinNumerator, coinDenominator, unixEntered);
    }
  }
});

function getHistoricalHourlyData(coinNumerator, coinDenominator, unixEntered) {
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
        getHistoricalHourlyDataAlt(coinNumerator, coinDenominator, unixEntered);
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
          hourlyPriceChange,
          coinNumerator,
          coinDenominator
        );
      }
    }
  );
}

function getHistoricalHourlyDataAlt(
  coinNumerator,
  coinDenominator,
  unixEntered
) {
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
        coinNumerator,
        coinDenominator,
        hourlyChangeMedian
      );
    }
  );
}

function plotHourlyData(
  hourlyLongDate,
  hourlyDate,
  hourlyHour,
  hourlyPrice,
  errorBars,
  hourlyPriceChange,
  coinNumerator,
  coinDenominator,
  hourlyChangeMedian
) {
  var trace1 = {
    x: hourlyHour.slice(-filterDays * 24),
    y: hourlyPriceChange.slice(-filterDays * 24),
    mode: "markers",
    name: "Close price",
    type: "scatter",
  };

  var layout = {
    title: "Hourly Change " + coinNumerator + " vs " + coinDenominator,
    xaxis: {
      title: "Hour (Local Time)",
      titlefont: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      fixedrange: true,
    },
    yaxis: {
      title: "% Change" + " " + coinDenominator,
      type: "linear",
      autorange: true,
      titlefont: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
      fixedrange: true,
    },
  };
  var dataSetPlotted = errorBars;
  var plotData = [dataSetPlotted];

  Plotly.newPlot("myDiv", plotData, layout);

  Plotly.relayout("myDiv", {
    "xaxis.categoryarray": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  });
  $(".radio1").addClass("hide");
  $(".radio2").removeClass("hide");
  $("#radio2").click(function () {
    if (dataSetPlotted === errorBars) {
      dataSetPlotted = trace1;
    } else {
      dataSetPlotted = errorBars;
    }
    var plotData = [dataSetPlotted];
    Plotly.newPlot("myDiv", plotData, layout);
  });
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
    $(".popup-container").html(popupInfo[menuItem]);
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
