/* object in the format {"1": "Spare", etc}. */
var studentBlockNames = {};
var studentBlockInputs = new Array(10);
var studentHasABInput;
var studentHasAB = true;
var studentBlockInputRows = new Array(10);
var currentWeekDate;
var scheduleDisplayParentElement;
var blockInputVisible = false;

/** returns true if successfully loaded and false if not */
function loadBlocks() {
    var tempBlocks = window.localStorage.getItem("studentBlockNames");
    var tempHasAB = window.localStorage.getItem("studentHasAB")
    if (tempBlocks == null || tempHasAB == null) return false;
    studentBlockNames = JSON.parse(tempBlocks);
    studentHasAB = tempHasAB == "true";
    return true;
}

function saveBlocks() {
   window.localStorage.setItem("studentBlockNames", JSON.stringify(studentBlockNames));
   window.localStorage.setItem("studentHasAB", studentHasAB.toString());
}


function generateTableWithBlocks(beginDate) {
    var timeTables = new Array(5);
    for (var i = 0; i < 5; i++) {
        var date = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate() + i);
        var timeTable = getBlocksOnDay(date, studentHasAB);
        timeTables[i] = { date: date, timeTable: timeTable};
        //console.log(timeTables[i]);
    }
    var tableElem = document.createElement("table");
    for (var r = 0; r < 9; r++) {
        var rowElem = document.createElement("tr");
        tableElem.appendChild(rowElem);
        for (var c = 0; c < timeTables.length; c++) {
            var tdElem = document.createElement("td");
            var date = timeTables[c].date;
            var timeTable = timeTables[c].timeTable;
            //console.log(timeTable);
            var day2 = timeTable.length == 6;
            var blockIdName;
            if (r == 0) {
                tdElem.textContent = (date.getMonth() + 1) + "/" + date.getDate();
            } else if (r == 1 || r == 2) {
                tdElem.textContent = getBlockAndClassNameForId(timeTable[r - 1]);
            } else if (r == 3) {
                tdElem.textContent = "Recess";
            } else if (r == 4) {
                tdElem.textContent = day2? getBlockAndClassNameForId(timeTable[2]) : "Advisory";
            } else if (r == 5) {
                tdElem.textContent = day2? getBlockAndClassNameForId(timeTable[3]) : getBlockAndClassNameForId(timeTable[2]);
            } else if (r == 6) {
                tdElem.textContent = "Lunch";
            } else if (r == 7 || r == 8) {
                tdElem.textContent = day2? getBlockAndClassNameForId(timeTable[r - 3]) : getBlockAndClassNameForId(timeTable[r - 4]);
            }
            rowElem.appendChild(tdElem);
        }
    }
    return tableElem;
}

function getBlockNameForId(id) {
    if (studentHasAB) {
        if (id == 8) return "A";
        if (id == 9) return "B";
    }
    return id.toString();
}

function getBlockAndClassNameForId(id) {
    return getBlockNameForId(id) + ": " + studentBlockNames[id.toString()];
}


function calculatePlease() {
    var dateOpts = prompt().split("/");
    var myDate = new Date(dateOpts[0], dateOpts[1] - 1, dateOpts[2]);
    var myMonday = new Date(dateOpts[0], dateOpts[1] - 1, dateOpts[2] - myDate.getDay() + 1);
    //console.log(myMonday);
    //alert(getBlocksOnDay(myDate));*/
    /*for (var i = 0; i < 31; i++) {
        var myDay = new Date(dateOpts[0], dateOpts[1] - 1, i);
        try {
            var blocksOnDay = getBlocksOnDay(myDay);
            if (blocksOnDay != null) console.log(myDay + ":" + blocksOnDay);
        } catch (e) {
            console.log(e);
        }
    }*/
    document.body.appendChild(generateTableWithBlocks(myMonday));
}

function loadHandler() {
    initUiElements();
    var myDate = new Date() >= yearSchedule.begin.day? new Date() : yearSchedule.begin.day;
    currentWeekDate = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate() - myDate.getDay() + 1);
    console.log(currentWeekDate);
    var blocksLoaded = loadBlocks();
    if (blocksLoaded) {
        fillBlocksInInput();
        regenerateScheduleDisplay();
    } else {
        setBlockInputVisible(true);
    }
}

function initUiElements() {
    for (var i = 1; i <= 10; i++) {
        studentBlockInputs[i - 1] = document.getElementById("block-input-" + i);
        studentBlockInputRows[i - 1] = document.getElementById("schedule-input-row-" + i);
    }
    studentHasABInput = document.getElementById("block-input-hasab");
    scheduleDisplayParentElement = document.getElementById("schedule-display");
}

function setBlockInputVisible(visible) {
    document.getElementById("schedule-input").style.display = visible? "" : "none";
    blockInputVisible = visible;
}

function fillBlocksInInput() {
    for (var i = 1; i <= 10; i++) {
        studentBlockInputs[i - 1].value = studentBlockNames[i.toString()];
    }
    studentHasABInput.checked = studentHasAB;
    updateHasABInfo();
}

function updateHasABInfo() {}

function blocksSubmitHandler() {
    setBlockInputVisible(false);
    studentBlockNames = {};
    for (var i = 1; i <= 10; i++) {
        studentBlockNames[i.toString()] = studentBlockInputs[i - 1].value;
    }
    studentHasAB = studentHasABInput.checked;
    saveBlocks();
    regenerateScheduleDisplay();
}

function nextWeek() {
    currentWeekDate = new Date(currentWeekDate.getFullYear(), currentWeekDate.getMonth(), currentWeekDate.getDate() + 7);
    regenerateScheduleDisplay();
}

function previousWeek() {
    currentWeekDate = new Date(currentWeekDate.getFullYear(), currentWeekDate.getMonth(), currentWeekDate.getDate() - 7);
    regenerateScheduleDisplay();
}

function regenerateScheduleDisplay() {
    var newTableElem = generateTableWithBlocks(currentWeekDate);
    if (scheduleDisplayParentElement.firstChild == null) {
        scheduleDisplayParentElement.appendChild(newTableElem);
    } else {
        scheduleDisplayParentElement.replaceChild(newTableElem, scheduleDisplayParentElement.firstChild);
    }
}

window.onload = loadHandler;
