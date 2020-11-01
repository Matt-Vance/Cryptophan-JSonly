//consts
let d3 = Plotly.d3;
let WIDTH_IN_PERCENT_OF_PARENT = 100;
let HEIGHT_IN_PERCENT_OF_PARENT = 60;
let gd3 = d3.select("#myDiv").style({
  width: WIDTH_IN_PERCENT_OF_PARENT + "%",
  "margin-left": (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + "%",

  height: HEIGHT_IN_PERCENT_OF_PARENT + "vh",
  "margin-top": (60 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + "vh",
  "margin-bottom": 0,
  "padding-bottom": 0,
});

let gd = gd3.node();

function plotPriceHistory(
  historicalDate,
  historicalPrice,
  historicalLow,
  historicalHigh,
  historicalOpen,
  coinNumerator,
  coinDenominator,
  filterDays
) {
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

  console.log(plotData)
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
  historicalDate
) {
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
  allTimeHighRatio,
  coinNumerator,
  coinDenominator
) {
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

module.exports = {
  plotPriceHistory,
  plotWeekdayChange,
  plotATHHistory
};
