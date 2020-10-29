function getMonthName(month) {
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
  return month;
}

function getWeekDay(weekDay) {
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
  return weekDay;
}

function getDayNumber(day) {
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
  return dayLong;
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

module.exports = {convertDateFormat, getDayNumber, getWeekDay, getMonthName};
