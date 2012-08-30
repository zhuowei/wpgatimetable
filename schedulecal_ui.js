function generateTableWithBlocks(beginDate) {
    var timeTables = new Array(5);
    for (var i = 0; i < 5; i++) {
        var date = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate() + i);
        var timeTable = getBlocksOnDay(date);
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
            if (r == 0) {
                tdElem.textContent = (date.getMonth() + 1) + "/" + date.getDate();
            } else if (r == 1 || r == 2) {
                tdElem.textContent = timeTable[r - 1];
            } else if (r == 3) {
                tdElem.textContent = "Recess";
            } else if (r == 4) {
                tdElem.textContent = day2? timeTable[2] : "Advisory";
            } else if (r == 5) {
                tdElem.textContent = day2? timeTable[3] : timeTable[2];
            } else if (r == 6) {
                tdElem.textContent = "Lunch";
            } else if (r == 7 || r == 8) {
                tdElem.textContent = day2? timeTable[r - 3] : timeTable[r - 4];
            }
            rowElem.appendChild(tdElem);
        }
    }
    return tableElem;
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
