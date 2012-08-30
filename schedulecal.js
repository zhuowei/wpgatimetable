"use strict";
var yearSchedule = {
    begin: {
        year: 2012,
        day: new Date(2012, 8, 3) //September 4
    }
}
/* classes IDs begin with 1 */
var rotations = [[3, 4, 5, 6, 7], [4, 5, 7, 3, 6],[7, 3, 6, 4, 5]];

function getBlocksOnDay(date) {
    var dayWeek = date.getDay();
    if (dayWeek == 0 || dayWeek == 6) //Weekends
        return null;
    var dayWeekZeroIndex = dayWeek - 1;
    var dayType = dayWeekZeroIndex % 2;
    var morningClasses = dayType == 0? [1, 2] : [8, 9, 10];
    var weekType = getWeekTypeOnDay(date);
    //console.log("weektype: " + weekType);
    var afternoonRotType = getAfternoonRotationsOnWeekType(weekType);
    var afternoonClasses = [rotations[afternoonRotType[0]][dayWeekZeroIndex], 
	rotations[afternoonRotType[1]][dayWeekZeroIndex], 
	rotations[afternoonRotType[2]][dayWeekZeroIndex]];
    return morningClasses.concat(afternoonClasses);
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
    var weeksElapsed = getWeeksElapsedFromTo(yearSchedule.begin.day, date);
    var weekType = weeksElapsed % 3;
    return weekType;
}

function getWeeksElapsedFromTo(origDate, date) {
    //TODO vacations
    return Math.floor((date.getTime() - origDate.getTime()) / 604800000); //1000 * 60 * 60 * 24 *7
}

