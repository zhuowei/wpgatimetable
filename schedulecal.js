"use strict";

var yearSchedule = {};
yearSchedule[2012] = {
    begin: {
        year: 2012,
        day: new Date(2012, 8, 3) //September 4
    },
    vacationWeeks: [
        {
            displayName: "Winter break", //displayed name in the table
            begin: new Date(2012, 11, 21), //begin date of the vacation
            end: new Date(2013, 0, 15), //end date of the vacation
            weeks: 3 //weeks "skipped" from the schedule. TODO: see if this can be calculated from begin - end
        }, 
        {
            displayName: "Spring break",
            begin: new Date(2013, 2, 15),
            end: new Date(2013, 3, 2),
            weeks: 2
        }
    ]
}
/* classes IDs begin with 1 */
var rotations = [[3, 4, 5, 6, 7], [4, 5, 7, 3, 6],[7, 3, 6, 4, 5]];

var blockTimesDay1 = 
    {"0" : {
        "begin": "8:20",
        "end": "9:30"},
     "1" : {
        "begin": "9:30",
        "end": "10:40"},
     "recess" : {
        "begin": "10:40",
        "end": "10:55"},
     "advisory" : {
        "begin": "10:55",
        "end": "11:10"},
     "2" : {
        "begin": "11:10",
        "end": "12:20"},
     "lunch" : {
        "begin": "12:20",
        "end": "13:10"},
     "3" : {
        "begin": "13:10",
        "end": "14:20"},
     "4" : {
        "begin": "14:20",
        "end": "15:30"}
     };
var blockTimesDay2 = 
    {"0" : {
        "begin": "8:20",
        "end": "9:20"},
     "1" : {
        "begin": "9:20",
        "end": "10:20"},
     "recess" : {
        "begin": "10:20",
        "end": "10:40"},
     "2" : {
        "begin": "10:40",
        "end": "11:40"},
     "3" : {
        "begin": "11:40",
        "end": "12:40"},
     "lunch" : {
        "begin": "12:40",
        "end": "13:30"},
     "4" : {
        "begin": "13:30",
        "end": "14:30"},
     "5" : {
        "begin": "14:30",
        "end": "15:30"}
     };

var blockTimesWed = 
    {"0" : {
        "begin": "8:20",
        "end": "9:30"},
     "1" : {
        "begin": "9:30",
        "end": "10:40"},
     "recess" : {
        "begin": "10:40",
        "end": "10:55"},
     "advisory" : {
        "begin": "10:55",
        "end": "11:10"},
     "2" : {
        "begin": "11:10",
        "end": "12:20"},
     "lunch" : {
        "begin": "12:20",
        "end": "13:30"},
     "3" : {
        "begin": "13:30",
        "end": "14:20"},
     "4" : {
        "begin": "14:20",
        "end": "15:30"}
     };

function getBlocksOnDay(date, hasAb) {
    var dayWeek = date.getDay();
    if (dayWeek == 0 || dayWeek == 6) //Weekends
        return null;
    var dayWeekZeroIndex = dayWeek - 1;
    var dayType = dayWeekZeroIndex % 2;
    var morningClasses = dayType == 0? [1, 2] : [8, 9, 10];
    if (hasAb && dayType == 1) {
        morningClasses = dayWeek == 2? [8, 8, 9] : [9, 9, 8];
    }

    var weekType = getWeekTypeOnDay(date);
    //console.log("weektype: " + weekType);
    var afternoonRotType = getAfternoonRotationsOnWeekType(weekType);
    var afternoonClasses = [rotations[afternoonRotType[0]][dayWeekZeroIndex], 
	rotations[afternoonRotType[1]][dayWeekZeroIndex], 
	rotations[afternoonRotType[2]][dayWeekZeroIndex]];
    return morningClasses.concat(afternoonClasses);
}

function getAfternoonRotationsOnDay(date) {
    return getAfternoonRotationsOnWeekType(getWeekTypeOnDay(date));
}

function getAfternoonRotationsOnWeekType(type) {
    if (type == 0) {
        return [0, 1, 2]; //pink, gray, green
    } else if (type == 1) {
        return [1, 2, 0]; //gray, green, pink
    } else if (type == 2) {
        return [2, 0, 1]; //green, pink, gray
    } else {
        throw new Error("Out of range");
    }
}

function getWeekTypeOnDay(date) {
    var weeksElapsed = getWeeksElapsedFromTo(getYearSchedule(date).begin.day, date);
    var weekType = weeksElapsed % 3;
    return weekType;
}

function getWeeksElapsedFromTo(origDate, date) {
    //TODO vacations
    var rawElapsedWeeks = Math.floor((date.getTime() - origDate.getTime()) / 604800000); //1000 * 60 * 60 * 24 *7
    for (var i = 0; i < getYearSchedule(date).vacationWeeks.length; i++) {
        var vacationWeek = getYearSchedule(date).vacationWeeks[i];
        if (vacationWeek.end.getTime() <= date.getTime()) {
            rawElapsedWeeks -= vacationWeek.weeks;
        }
    }
    return rawElapsedWeeks;
}

function getSchoolYear(date) {
    var yearOfDate = date.getFullYear();
    if(yearSchedule[yearOfDate] == null || yearSchedule[yearOfDate].begin.day.getTime() > date.getTime()) {
        return yearOfDate - 1;
    }
    return yearOfDate;
}
function getYearSchedule(date) {
    return yearSchedule[getSchoolYear(date)];
}

function getCurrentBlock(date) {
    var dayWeek = date.getDay();
    if (dayWeek == 0 || dayWeek == 6) //Weekends
        return null;
    var dayWeekZeroIndex = dayWeek - 1;
    var dayType = dayWeekZeroIndex % 2;
    
    var blockTimes = getBlockTimes(date);
    var curHour = date.getHours(); 
    var curMinute = date.getMinutes();
    //console.log(curHour + ":" + curMinute);
    var curTotalMinutes = (curHour * 60) + curMinute;
    //console.log(date + ": " + curTotalMinutes);
    for (var i in blockTimes) {
        var beginTime = blockTimes[i].begin.split(":");
        var beginTimeMins = (parseInt(beginTime[0]) * 60) + parseInt(beginTime[1]);
        var endTime = blockTimes[i].end.split(":");
        var endTimeMins = (parseInt(endTime[0]) * 60) + parseInt(endTime[1]);
        //console.log(i + ":" + beginTimeMins + ":" + endTimeMins);
        if (curTotalMinutes >= beginTimeMins && curTotalMinutes <= endTimeMins) {
            return i;
        }
    }
    return null;
}

function getBlockTimes(date) {
    var dayWeek = date.getDay();
    if (dayWeek == 3) return blockTimesWed; //Wednesday: extended lunch
    var dayWeekZeroIndex = dayWeek - 1;
    var dayType = dayWeekZeroIndex % 2;
    return dayType == 1? blockTimesDay2 : blockTimesDay1;
}

function getVacationOnDay(date) {
    for (var i = 0; i < getYearSchedule(date).vacationWeeks.length; i++) {
        var vacationWeek = getYearSchedule(date).vacationWeeks[i];
        if (vacationWeek.begin.getTime() <= date.getTime() && vacationWeek.end.getTime() > date.getTime()) {
            return vacationWeek;
        }
    }
    return null;
}

function isInVacation(date) {
    return getVacationOnDay(date) != null;
}
