ethereumAddresses = [];
samePrice = [];
allTimeHighPrice = 0;
menuItem = 0;
filterDays = 365;
$(document).ready(function () {
    var localDate = new Date();
    timeOffset = localDate.getTimezoneOffset() / 60;
    var localHours = localDate.getHours();
    var localMins = localDate.getMinutes();
    var localTime = localHours + ':' + localMins;
    var day = localDate.getDate();
    var dayLong = "";
    var month = localDate.getMonth();
    switch (month) {
        case 0:
            month = "January";
            break;
        case 1:
            month = "February";
            break;
        case 2:
            month = "March";
            break;
        case 3:
            month = "April";
            break;
        case 4:
            month = "May";
            break;
        case 5:
            month = "June";
            break;
        case 6:
            month = "July";
            break;
        case 7:
            month = "August";
            break;
        case 8:
            month = "September";
            break;
        case 9:
            month = "October";
            break;
        case 10:
            month = "November";
            break;
        case 11:
            month = "December";
            break;
    }
    var weekDay = localDate.getDay();
    switch (weekDay) {
        case 0:
            weekDay = "Sunday";
            break;
        case 1:
            weekDay = "Monday";
            break;
        case 2:
            weekDay = "Tuesday";
            break;
        case 3:
            weekDay = "Wednesday";
            break;
        case 4:
            weekDay = "Thursday";
            break;
        case 5:
            weekDay = "Friday";
            break;
        case 6:
            weekDay = "Saturday";
            break;
    }
    switch (day) {
        case 1:
            dayLong = day + "st";
            break;
        case 2:
            dayLong = day + "nd";
            break;
        case 21:
            dayLong = day + "st";
            break;
        case 31:
            dayLong = day + "st";
            break;
        case 22:
            dayLong = day + "nd";
            break;
        case 3:
            dayLong = day + "rd";
            break;
        case 23:
            dayLong = day + "rd";
            break;
        default:
            dayLong = day + "th";
            break;
    }

    $(".date-num").html(day);
    $(".date-info").html(weekDay + ", " + month + " " + dayLong + " ");
});

function getHistoricalPriceData(coinNumerator, coinDenominator, unixEntered) {
    $.get(
        "https://min-api.cryptocompare.com/data/histoday?fsym=" +
        coinNumerator +
        "&tsym=" +
        coinDenominator +
        "&limit=2000&aggregate=1&toTs=" +
        unixEntered,
        function (data, status) {
            var historicalPrice = [];
            var historicalDate = [];
            var historicalChange = [];
            var historicalWeekday = [];
            var unixTime = data.Data[2000].time;
            var date = new Date(unixTime * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var formattedTime =
                hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
            var price = data.Data[2000].close;

            $(".priceOutput").html(" " + price + " " + coinDenominator);
            $(".dateOutput").html(" " + date);
            for (var i = 2000; i >= 1; i--) {
                if (data.Data[i].close == []) {
                    i = 0;
                } else {
                    historicalPrice.push(data.Data[i].close);
                    historicalDate.push(
                        convertDateFormat(
                            new Date((data.Data[i].time + 86400) * 1000).toString()
                        )
                    );
                    var previousDayPrice = data.Data[i - 1].close;
                    var dayOfPrice = data.Data[i].close;
                    if (previousDayPrice === 0) {
                        dailyChangePrice = 0;
                    } else {
                        var dailyChangePrice = dayOfPrice / previousDayPrice - 1;
                    }
                    //   console.log('daily' + dailyChangePrice + historicalDate);
                    historicalChange.push(dailyChangePrice * 100);
                }
                var dayOfWeek = new Date(data.Data[i].time * 1000)
                    .toString()
                    .substr(0, 3);
                historicalWeekday.push(dayOfWeek);
            }
            getHistoricalATHData(
                coinNumerator,
                coinDenominator,
                unixEntered,
                data,
                historicalPrice,
                historicalDate,
                historicalWeekday,
                historicalChange
            );
        }
    );
}

function getRecentEqualPrices(
    unixEntered,
    currentPrice,
    data,
    historicalPrice,
    historicalDate,
    historicalWeekday,
    historicalChange,
    coinNumerator,
    coinDenominator,
    allTimeHighRatio,
    allTimeHighRatioDates,
    allTimeHighRelativePrice
) {
    samePrice = [];
    var samePriceConvert = [];
    var samePriceConvertY = [];
    for (var i = 2000; i >= 0; i--) {
        if (currentPrice >= data.Data[i].low && currentPrice <= data.Data[i].high) {
            var dateSamePrice = new Date(data.Data[i].time * 1000);
            samePrice.push(dateSamePrice);
            //      console.log('samePrice' + samePrice)
        }
    }
    var samePriceLength = samePrice.length;
    var recentSamePrice = [];
    for (var i = 0; i <= 4; i++) {
        recentSamePrice.push(samePrice[i].toString().substring(4, 15));
        recentSamePrice.push("</br>");
    }
    var earliestSamePrice = [];
    for (var i = 1; i <= 5; i++) {
        earliestSamePrice.push(
            samePrice[samePriceLength - i].toString().substring(4, 15)
        );
        earliestSamePrice.push("</br>");
    }
    $(".recentSamePriceOutput").html(
        "Most Recent: " + "</br>" + recentSamePrice.join("")
    );
    $(".earliestSamePriceOutput").html(
        "Earliest: " + "</br>" + earliestSamePrice.join("")
    );
    for (var i = 0; i <= samePrice.length - 1; i++) {
        intermediateConvert = convertDateFormat(samePrice[i].toString());
        samePriceConvert.push(intermediateConvert);
        samePriceConvertY.push(currentPrice);
    }

    switch (menuItem) {
        case 0:
            plotPriceHistory(
                historicalDate,
                historicalPrice,
                coinDenominator,
                coinNumerator,
                samePriceConvert,
                samePriceConvertY
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
                coinDenominator,
                coinNumerator,
                allTimeHighRatio
            );
            break;
    }
}

$(".submit").click(function () {
    console.log(unixEntered);
    var coinNumeratorInt = $("#coinCompare1").val();
    var coinNumerator = coinNumeratorInt.toUpperCase();
    var coinDenominatorInt = $("#coinCompare2").val();
    var coinDenominator = coinDenominatorInt.toUpperCase();
    var monthEntry = $("#dateEntry1").val();
    var dayEntry = $("#dateEntry2").val();
    var yearEntry = $("#dateEntry3").val();
    var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
    var unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
    console.log(unixEntered);
    getHistoricalPriceData(coinNumerator, coinDenominator, unixEntered);
});

function onSubmit() {
    var coinNumeratorInt = $("#coinCompare1").val();
    var coinNumerator = coinNumeratorInt.toUpperCase();
    var coinDenominatorInt = $("#coinCompare2").val();
    var coinDenominator = coinDenominatorInt.toUpperCase();
    var monthEntry = $("#dateEntry1").val();
    var dayEntry = $("#dateEntry2").val();
    var yearEntry = $("#dateEntry3").val();
    var enteredDate = new Date(yearEntry, monthEntry - 1, dayEntry);
    unixEntered = enteredDate.getTime() / 1000 + 24 * 60 * 60;
    getHistoricalPriceData(coinNumerator, coinDenominator, unixEntered);
}

$(".nav-price").click(function () {
    menuItem = 0;
    onSubmit();
});

$(".nav-weekday").click(function () {
    menuItem = 1;
    onSubmit();
});

$(".nav-ath").click(function () {
    menuItem = 2;
    onSubmit();
});

function getCurrentPriceData(coinNumerator, coinDenominator, unixEntered) {
    var currentData = $.get(
        "https://min-api.cryptocompare.com/data/price?fsym=" +
        coinNumerator +
        "&tsyms=BTC,USD,EUR,ETH,NEO",
        function (data, status) {
            currentPrice = data[coinDenominator];
            if (allTimeHighPrice > 0) {
                $(".currentPriceOutput").html(
                    "Current Price of " +
                    coinNumerator +
                    ": " +
                    currentPrice +
                    " " +
                    coinDenominator +
                    " (" +
                    Math.round(currentPrice / allTimeHighPrice * 10000) / 100 +
                    "% of ATH)"
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
    historicalDate,
    historicalWeekday,
    historicalChange
) {
    $.get(
        "https://min-api.cryptocompare.com/data/histoday?fsym=" +
        coinNumerator +
        "&tsym=" +
        coinDenominator +
        "&limit=2000&aggregate=1&toTs=" +
        unixEntered,
        function (data, status) {
            allTimeHighRatio = [];
            allTimeHighRatioDates = [];
            allTimeHighRelativePrice = [];
            allTimeHighPrice = 0;
            for (var i = 0; i <= 1999; i++) {
                if (data.Data[i].high > allTimeHighPrice) {
                    var allTimeHighDateUnix = data.Data[i].time;
                    var allTimeHighDate = new Date(allTimeHighDateUnix * 1000);
                    allTimeHighRatio.push(data.Data[i].close / allTimeHighPrice);
                    allTimeHighRelativePrice.push(data.Data[i].close);
                    var ratioDate = new Date(data.Data[i].time * 1000);
                    allTimeHighRatioDates.push(ratioDate);
                    allTimeHighPrice = data.Data[i].high;
                } else if (allTimeHighPrice !== 0) {
                    allTimeHighRatio.push(data.Data[i].close / allTimeHighPrice);
                    allTimeHighRelativePrice.push(data.Data[i].close);
                    var ratioDate = new Date(data.Data[i].time * 1000);
                    allTimeHighRatioDates.push(ratioDate);
                }
            }
            $(".allTimeHighPriceOutput").html(
                "ATH of " +
                coinNumerator +
                "= " +
                allTimeHighPrice +
                " on " +
                allTimeHighDate.toString().substring(4, 15)
            );
            getCurrentPriceData(coinNumerator, coinDenominator, unixEntered);
        }
    );
    getRecentEqualPrices(
        unixEntered,
        currentPrice,
        data,
        historicalPrice,
        historicalDate,
        historicalWeekday,
        historicalChange,
        coinNumerator,
        coinDenominator,
        allTimeHighRatio,
        allTimeHighRatioDates,
        allTimeHighRelativePrice
    );
}

function convertDateFormat(input) {
    switch (input.substr(4, 3)) {
        case "Jan":
            convertMonth = "01";
            break;
        case "Feb":
            convertMonth = "02";
            break;
        case "Mar":
            convertMonth = "03";
            break;
        case "Apr":
            convertMonth = "04";
            break;
        case "May":
            convertMonth = "05";
            break;
        case "Jun":
            convertMonth = "06";
            break;
        case "Jul":
            convertMonth = "07";
            break;
        case "Aug":
            convertMonth = "08";
            break;
        case "Sep":
            convertMonth = "09";
            break;
        case "Oct":
            convertMonth = "10";
            break;
        case "Nov":
            convertMonth = "11";
            break;
        case "Dec":
            convertMonth = "12";
            break;
    }
    var trialConvert =
        input.substr(11, 4) + "-" + convertMonth + "-" + input.substr(8, 2);
    return trialConvert;
}

function plotPriceHistory(
    historicalDate,
    historicalPrice,
    coinDenominator,
    coinNumerator,
    samePriceConvert,
    samePriceConvertY
) {
    var trace1 = {
        x: historicalDate.slice(0, filterDays),
        y: historicalPrice.slice(0, filterDays),
        mode: "lines",
        name: "Close price",
        type: "scatter"
    };

    var trace2 = {
        x: samePriceConvert,
        y: samePriceConvertY,
        mode: "markers",
        name: "Days at Same Price",
        type: "scatter"
    };

    var layout = {
        title: "Close Price " + coinNumerator + " vs " + coinDenominator,
        xaxis: {
            title: "Date",
            titlefont: {
                family: "Courier New, monospace",
                size: 18,
                color: "#7f7f7f"
            },
            fixedrange: true
        },
        yaxis: {
            title: "Price" + "(" + coinDenominator + ")",
            type: "linear",
            autorange: true,
            titlefont: {
                family: "Courier New, monospace",
                size: 18,
                color: "#7f7f7f"
            },
            fixedrange: true
        }
    };

    var plotData = [trace1, trace2];

    Plotly.newPlot("myDiv", plotData, layout);
    $(".radio2").addClass("hide");
    $(".radio1").removeClass("hide");
    $("#radio1").click(function () {
        if (layout.yaxis.type === "log") {
            layout.yaxis.type = "linear";
        } else {
            layout.yaxis.type = "log";
        }
        Plotly.newPlot("myDiv", plotData, layout);
    });
}

function plotWeekdayChange(
    historicalChange,
    historicalWeekday,
    historicalDate,
    coinNumerator,
    coinDenominator
) {
    historicalChange = historicalChange.slice(0, filterDays);
    historicalWeekday = historicalWeekday.slice(0, filterDays);
    historicalDate = historicalDate.slice(0, filterDays);
    console.log(historicalChange);
    console.log(historicalDate);
    var trace1 = {
        x: historicalWeekday,
        text: historicalDate,
        y: historicalChange,
        mode: "markers",
        type: "scatter"
    };

    var groups2 = {};

    $.each(historicalWeekday, function (ind, itm) {
        if (!groups2[itm]) {
            groups2[itm] = { weekValues: [] };
        }
        groups2[itm].weekValues.push(historicalChange[ind]); // sum values belonging to same key
    });
    var weeklyChangeAverage = [];
    var weeklyChangeStd = [];
    var weeklyCI = [];
    for (var i = 0; i <= 6; i++) {
        weeklyChangeAverage.push(
            math.mean(groups2[historicalWeekday[i]].weekValues)
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
            visible: true
        },
        mode: "markers",
        type: "scatter"
    };

    if (timeOffset >= 0) {
        var layout = {
            hovermode: "closest",
            title: '<b>Day of Week' + ' (' + coinNumerator + ')' + '</b> <br> Use ' + Number(24 - timeOffset) + ':00' + ' of the previous day to make trades',
            xaxis: {
                title: "Date",
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                },
                fixedrange: true
            },
            yaxis: {
                title: "% Change" + "(" + coinDenominator + ")",
                type: "linear",
                autorange: true,
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                },
                fixedrange: true
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
                        dash: "dashdot"
                    }
                }
            ]
        };
    } else {

        var layout = {
            hovermode: "closest",
            title: '<b>Day of Week</b> <br> Use ' + Number(0 - timeOffset) + ':00' + ' of the current day to make trades',
            xaxis: {
                title: "Date",
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                },
                fixedrange: true
            },
            yaxis: {
                title: "% Change" + "(" + coinDenominator + ")",
                type: "linear",
                autorange: true,
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                },
                fixedrange: true
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
                        dash: "dashdot"
                    }
                }
            ]
        };
    }

    var dataSetPlotted = errorBars;
    var plotData = [dataSetPlotted];

    Plotly.newPlot("myDiv", plotData, layout);

    Plotly.relayout("myDiv", {
        "xaxis.categoryarray": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
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

function plotATHHistory(
    allTimeHighRelativePrice,
    allTimeHighRatioDates,
    coinDenominator,
    coinNumerator,
    allTimeHighRatio
) {
    console.log(allTimeHighRatioDates);
    console.log(allTimeHighRatio);
    var trace1 = {
        x: allTimeHighRatioDates.slice(-filterDays),
        y: allTimeHighRatio.slice(-filterDays),
        mode: "lines",
        text: allTimeHighRelativePrice.slice(-filterDays),
        type: "scatter"
    };

    var layout = {
        title: "ATH Ratio " + coinNumerator + "/" + coinDenominator,
        xaxis: {
            title: "Date",
            titlefont: {
                family: "Courier New, monospace",
                size: 18,
                color: "#7f7f7f"
            },
            fixedrange: true
        },
        yaxis: {
            title: "ATH %" + "(" + coinDenominator + ")",
            type: "linear",
            autorange: true,
            titlefont: {
                family: "Courier New, monospace",
                size: 18,
                color: "#7f7f7f"
            },
            fixedrange: true
        },
        shapes: [
            {
                type: "line",
                xref: "paper",
                x0: 0,
                x1: 1,
                y0: 1.0,
                y1: 1.0,
                line: {
                    color: "rgb(50, 171, 96)",
                    width: 4,
                    dash: "dashdot"
                }
            }
        ]
    };

    var plotData = [trace1];

    Plotly.newPlot("myDiv", plotData, layout);
    $(".radio2").addClass("hide");
    $(".radio1").removeClass("hide");
    $("#radio1").click(function () {
        if (layout.yaxis.type === "log") {
            layout.yaxis.type = "linear";
        } else {
            layout.yaxis.type = "log";
        }
        Plotly.newPlot("myDiv", plotData, layout, { editable: true });
    });
}

var $element = $('input[type="range"]');
Last2000Days();
$element
    .rangeslider({
        polyfill: false,
        onInit: function () {
            var $handle = $(".rangeslider__handle", this.$range);
            updateHandle($handle[0], this.value);
            $(".filter-one").html(result[this.value] + " - " + result[0]);
        }
    })
    .on("input", function (e) {
        var $handle = $(".rangeslider__handle", e.target.nextSibling);
        updateHandle($handle[0], this.value);
        var updatedNum = Math.ceil(this.value);
        $(".filter-one").html(result[this.value] + " - " + result[0]);
        filterDays = this.value;
        onSubmit();
    });

function Last2000Days() {
    result = [];
    for (var i = 0; i < 2000; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        result.push(formatDate(d));
    }
}

function formatDate(date) {
    var dd = date.getDate() + 1;
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

$(".dayEntry").on("keydown", function (e) {
    if (e.which == 13) {
        $element.val(this.value).change();
        onSubmit();
    }
});

$(document).ready(function () {

    denomCurrency = "USD";

    coins = [
        {
            CoinName: "Monero",
            Ticker: "XMR",
            Amount: 1.01
        },
        {
            CoinName: "Bitcoin",
            Ticker: "BTC",
            Amount: 0.120014
        },
        {
            CoinName: "Walton",
            Ticker: "WTC",
            Amount: 47.43
        },
        {
            CoinName: "Oyster Pearl",
            Ticker: "PRL",
            Amount: 40
        },
        {
            CoinName: "Substratum",
            Ticker: "SUB",
            Amount: 150.8
        },
        {
            CoinName: "Request Network",
            Ticker: "REQ",
            Amount: 291
        },
        {
            CoinName: "Ethereum",
            Ticker: "ETH",
            Amount: 1.52
        },
        {
            CoinName: "Stellar",
            Ticker: "XLM",
            Amount: 1476
        },
        {
            CoinName: "Icon",
            Ticker: "ICX",
            Amount: 145.3
        },
        {
            CoinName: "Iota",
            Ticker: "IOTA",
            Amount: 49.97
        },
        {
            CoinName: "Ark",
            Ticker: "ARK",
            Amount: 19.82
        },
        {
            CoinName: "Omise Go",
            Ticker: "OMG",
            Amount: 2
        }
    ];
    total = 0;
    for (var i in coins) {
        coinsStats(coins[i]);
    }
    coinsUpdated = [];
    function coinsStats(array) {

        var getTickerData = $.getJSON(
            "https://min-api.cryptocompare.com/data/price?fsym=" +
            array.Ticker +
            "&tsyms=BTC,USD,EUR,ETH",
            function (data, status) {
                priceHold = data[denomCurrency];
                array.Price = priceHold;
                array.Worth = array.Amount * array.Price;
                total = total + array.Worth;
                coinsUpdated.push(array);
                if (coinsUpdated.length == coins.length) {
                    for (var i in coinsUpdated) {
                        var worthPercent = Number((100 * coinsUpdated[i].Worth / total).toFixed(2));
                        coinsUpdated[i].PercentHoldings = worthPercent;
                    }
                    drawPie();
                }
            }
        );
    }
    function drawPie() {
        console.log(coinsUpdated)
        $(".pieText").replaceWith('<div class="pieText"><h1 id="segmentTitle">Holdings</h1><p id="p-coin0"></p></div>');
        for (var i in coinsUpdated) {
            var next = coinsUpdated.length - Number(i);
            var newCoin =
                "<p id = 'p-coin" +
                next +
                "'>" +
                coinsUpdated[coinsUpdated.length - 1 - i].CoinName +
                ": " + coinsUpdated[coinsUpdated.length - 1 - i].Worth +
                "</>";
            $(newCoin).insertAfter("#p-coin0");
        }

        var width = parseInt(d3.select("#pieChart").style("width"), 10);
        var height = width;
        var radius = (Math.min(width, height) - 25) / 2;

        var type = function getObject(obj) {
            types = [];
            for (var i = 0; i < obj.length; i++) {
                types.push(obj[i].Type);
            }
            return types;
        };
        var arcOver = d3.svg
            .arc()
            .outerRadius(radius)
            .innerRadius(225);

        var color = d3.scale.category20c();

        var arc = d3.svg
            .arc()
            .outerRadius(radius - 10)
            .innerRadius(250);

        var textArc = d3.svg
            .arc()
            .innerRadius(radius - 70)
            .outerRadius(radius - 20);

        var labelArc = d3.svg
            .arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3.layout.pie().value(function (d) {
            return +d.Worth;
        });

        change = function (d, i) {
            svg
                .transition()
                .duration(200)
                .attr("transform", "translate(" + Math.min(width, height) / 2 + "," + Math.min(width, height) / 2 + ")");
            d3
                .selectAll(".piePaths")
                .transition()
                .attr("d", arc);
            d3
                .select(i)
                .transition()
                .duration(200)
                .attr("d", arcOver);
        };

        var svg = d3
            .select("#pieChart")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr(
            "viewBox",
            "0 0 " + Math.min(width, height) + " " + Math.min(width, height)
            )
            .attr("preserveAspectRatio", "xMinYMin")
            .append("g")
            .attr("class", "lines")
            .attr("transform", "translate(" + Math.min(width, height) / 2 + "," + Math.min(width, height) / 2 + ")");

        var g = svg
            .selectAll("path")
            .data(pie(coinsUpdated))
            .enter()
            .append("path")
            .attr("class", "piePaths")
            .style("fill", function (d) {
                return color(d.data.CoinName);
            })
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data.CoinName);
            })

            .on("mouseover", function (d) {
                change(d, this);
            })

            .on("click", function (d) {
                change(d, this);
                updateHoldingsText(d);
            });

        var label_group = svg
            .append("svg:g")
            .attr("class", "lblGroup")
            .attr("transform", "translate(" + width / 100 + "," + height / 300 + ")");

        var sliceLabel = label_group.selectAll("text").data(pie(coinsUpdated));
        sliceLabel
            .enter()
            .append("svg:text")
            .attr("class", "arcLabel")
            .attr("transform", function (d) {
                return "translate(" + textArc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function (d, i) {
                return coinsUpdated[i].CoinName + ": " + coinsUpdated[i].PercentHoldings + "%";
            });

        addPieInner();
        function addPieInner() {
            svg.append("foreignObject")
                .attr({
                    'x': -145,
                    'y': -50
                })
                .attr("class", "pieInner")
                .html(total.toFixed(2) + ' ' + denomCurrency + '<div class = "denomCurrency"><button class = "denomCurrency-buttons denomActive" id = "denomButton-USD" value = "USD">USD</button><button class = "denomCurrency-buttons" id = "denomButton-BTC" value = "BTC">BTC</button><button class = "denomCurrency-buttons" id = "denomButton-ETH" value = "ETH">ETH</button></div>');
        }

        $('.denomCurrency-buttons').on("click", function () {
            total = 0;
            coinsUpdated = [];
            removePieChart();

            for (var i in coins) {
                coinsStats(coins[i]);
            }
            denomCurrency = this.value;
        });

        function removePieChart() {
            svg
                .selectAll("path").remove();
            svg.selectAll("text").remove();
            d3.selectAll('svg').remove();
        };

        function updateHoldingsText(d) {
            $(".text-container").hide();
            $("#segmentTitle").replaceWith(
                '<h1 id="segmentTitle">' +
                d.data.CoinName +
                ": " +
                d.data.Worth.toFixed(2) + ' ' + denomCurrency + ' (' + d.data.PercentHoldings + '%)' +
                "</h1>"
            );
            $("#segmentText").replaceWith(
                '<p id="segmentText">' + d.data.Price + "</p>"
            );
            $(".text-container").fadeIn(400);
        };

        denomActiveOn();
        document.querySelector("style").textContent +=
            "@media(max-width:767px) {#pieChart { transform: rotate(90deg); transform-origin: 50% 50%; transition: 1s; max-width: 50%; } .text-container { width: 100%; min-height: 0; }} @media(min-width:768px) {#pieChart { transition: 1s;}}";

    }
});
function denomActiveOn() {
    console.log('active')
    $('button').removeClass('denomActive')
    $('#denomButton-' + denomCurrency).addClass('denomActive')
}


//Change confidence interval value, calculate t*?
//Dropdowns for coin choices + entry

//% ATH chart over time
//social charts
//change color of graphs
