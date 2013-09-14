/* object in the format {"1": "Spare", etc}. */
var studentBlockNames = {};
var studentBlockInputs = new Array(10);
var studentHasABInput;
var studentHasAB = true;
var studentBlockInputRows = new Array(10);
var currentWeekDate;
var scheduleDisplayParentElement;
var blockInputVisible = false;
var debugDate;
var blocksLoaded;
var refreshTimer;
var oldCurrentBlock;

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
    var nowDate = debugDate != null? debugDate : new Date();
    for (var i = 0; i < 5; i++) {
        var date = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate() + i);
        var timeTable = getBlocksOnDay(date, studentHasAB);
        var afternoonRotations = getAfternoonRotationsOnDay(date);
        timeTables[i] = { date: date, timeTable: timeTable, afternoonRotations: afternoonRotations};
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
            var afternoonRotations = timeTables[c].afternoonRotations;
            //console.log(timeTable);
            var day2 = timeTable.length == 6;
            var blockTimes = getBlockTimes(date);
            var currentBlock = equalDates(nowDate, date) ? getCurrentBlock(nowDate) : null;
            //if (currentBlock != null) console.log(currentBlock);
            var blockIdName;
            if (r == 0) {
                tdElem.textContent = (date.getMonth() + 1) + "/" + date.getDate();
                tdElem.className = "schedule-table-date";
                if (date.getFullYear() == nowDate.getFullYear() && date.getMonth() == nowDate.getMonth() && 
                    date.getDate() == nowDate.getDate()) {
                    tdElem.className += " schedule-table-today";
                }
            } else if (isInVacation(date)) {
                tdElem.innerHTML = getVacationOnDay(date).displayName + "<br>&mdash;";
                tdElem.className = "schedule-table-recess"
            } else if (r == 1 || r == 2) {
                buildElem(timeTable, blockTimes, tdElem, r - 1, currentBlock);
            } else if (r == 3) {
                tdElem.textContent = "Recess"
                tdElem.innerHTML += "<br>" + formatBlockTimes(blockTimes, "recess");
                tdElem.className = "schedule-table-recess";
                if (currentBlock == "recess") {
                    tdElem.className += " schedule-table-block-current";
                }
            } else if (r == 4) {
                tdElem.textContent = (day2? getBlockAndClassNameForId(timeTable[2]) : "Advisory");
                tdElem.innerHTML += "<br>" + formatBlockTimes(blockTimes, day2? 2 : "advisory");
                tdElem.className = day2? "schedule-table-block-" + timeTable[2] : "schedule-table-advisory";
                if ((day2 && currentBlock == "2") || (!day2 && currentBlock == "advisory")) {
                    tdElem.className += " schedule-table-block-current";
                }
            } else if (r == 5) {
                tdElem.textContent = (day2? getBlockAndClassNameForId(timeTable[3]) : getBlockAndClassNameForId(timeTable[2])); 
                tdElem.innerHTML += "<br>" + formatBlockTimes(blockTimes, day2? "3" : "2");
                tdElem.className = "schedule-table-block-" + (day2? timeTable[3] : timeTable[2]) + " schedule-afternoon-rotation-" + afternoonRotations[0];
                if ((day2 && currentBlock == "3") || (!day2 && currentBlock == "2")) {
                    tdElem.className += " schedule-table-block-current";
                }
            } else if (r == 6) {
                tdElem.textContent = "Lunch";
                tdElem.innerHTML += "<br>" + formatBlockTimes(blockTimes, "lunch");
                tdElem.className = "schedule-table-lunch";
                if (currentBlock == "lunch") {
                    tdElem.className += " schedule-table-block-current";
                }
            } else if (r == 7 || r == 8) {
                tdElem.textContent = (day2? getBlockAndClassNameForId(timeTable[r - 3]) : getBlockAndClassNameForId(timeTable[r - 4])); 
                tdElem.innerHTML += "<br>" + formatBlockTimes(blockTimes, r - (day2? 3 : 4));
                tdElem.className = "schedule-table-block-" + (day2? timeTable[r - 3] : timeTable[r - 4]) + 
                    " schedule-afternoon-rotation-" + afternoonRotations[r - 6];
                if (currentBlock == (r - (day2? 3 : 4)).toString()) {
                    tdElem.className += " schedule-table-block-current";
                }
            }
            rowElem.appendChild(tdElem);
        }
    }
    return tableElem;

    function buildElem(timeTable, blockTimes, tdElem, block, currentBlock) {
        tdElem.textContent = getBlockAndClassNameForId(timeTable[block]);
        tdElem.innerHTML += "<br>" + formatBlockTimes(blockTimes, block);
        tdElem.className = "schedule-table-block-" + timeTable[block];
        if (block.toString() == currentBlock) {
            tdElem.className += " schedule-table-block-current";
        }
    }
}

function getBlockNameForId(id) {
    if (studentHasAB) {
        if (id == 8) return "A";
        if (id == 9) return "B";
    }
    return id.toString();
}

function formatBlockTimes(blockTimes, name) {
    var ob = blockTimes[name.toString()];
    return ob.begin + "-" + ob.end;
}

function getBlockAndClassNameForId(id) {
    return getBlockNameForId(id) + ": " + studentBlockNames[id.toString()];
}


function calculatePlease() {
    var dateOpts = prompt("Enter date: e.g. 2013/3/14").split("/");
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
    currentWeekDate = myMonday;
    regenerateScheduleDisplay();
}

function loadHandler() {
    initUiElements();
    var myDate = new Date() >= yearSchedule[2012].begin.day? new Date() : yearSchedule[2012].begin.day;
    currentWeekDate = new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate() - myDate.getDay() + 1);
    //console.log(currentWeekDate);
    blocksLoaded = loadBlocks();
    if (blocksLoaded) {
        fillBlocksInInput();
        regenerateScheduleDisplay();
    } else {
        //setBlockInputVisible(true);
        blocksSubmitHandler()
        fillBlocksInInput();
        regenerateScheduleDisplay();
    }
    var nowDate = new Date();
    oldCurrentBlock = getCurrentBlock(nowDate);
    refreshTimer = setInterval(checkRefresh, 60000) // check for refresh every minute in case current block changes
    studentHasABInput.onchange = handleABUiCheck;
    handleABUiCheck();
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
    thisTimetableIsUndeniable();
}

function checkRefresh() {
    if (!blocksLoaded) return;
    var nowDate = new Date();
    var newCurrentBlock = getCurrentBlock(nowDate);
    if (newCurrentBlock != oldCurrentBlock) {
        regenerateScheduleDisplay();
        oldCurrentBlock = newCurrentBlock;
    }
}
    

function equalDates(date, nowDate) {
    return date.getFullYear() == nowDate.getFullYear() && date.getMonth() == nowDate.getMonth() && 
                    date.getDate() == nowDate.getDate();
}

function thisTimetableIsUndeniable() {
    if (!blocksLoaded) return;
    var nowDate = new Date();
    var newCurrentBlock = getCurrentBlock(nowDate);
    if (newCurrentBlock == null) return;
    var courseName = studentBlockNames[newCurrentBlock];
    if (courseName == null) return;
    var trigger = courseName.toLowerCase().indexOf("chem") >= 0;
    document.getElementById("extra-info-spillover").innerHTML = trigger?
        ">a/<elbainednU>\"4E2g2rLTl3o=v?hctaw/moc.ebutuoy.www//:ptth\"=ferh a< si elbatemit sihT".
        split("").reverse().join("") : "";
}

function handleABUiCheck() {
    var hasAB = studentHasABInput.checked;
    studentBlockInputRows[9].style.display = hasAB? "none" : "";
}

window.onload = loadHandler;
