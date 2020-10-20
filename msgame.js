"use strict";

let main = function (){
    let gridSizeRows;
    let gridSizeCols;
    let numBombs = () => {
        return Math.floor(gridSizeRows * gridSizeCols / 3);
    };

    let gameEngine;

    let flagCount;
    let timer;

    let gridIdToCallbackArray = [];

    $("#button-level-easy").on("click", setLevelToEasy);

    function setLevelToEasy() {
        gridSizeRows = 6;
        gridSizeCols = 6;

        resetGame();
    }

    $("#button-level-hard").on("click", function() {
        gridSizeRows = 10;
        gridSizeCols = 8;

        resetGame();
    });
    
    $( window ).on("load", function loadScreen() {
        console.log("window loaded");
        $("#restart-button").hide();        
    
        gridSizeRows = 6;
        gridSizeCols = 6;
        flagCount = numBombs();
        updateFlagCountView();

        drawGrid();
    });

    $("#start-button").on("click", function () {
        gameEngine = new MSGame();
        gameEngine.init(gridSizeRows, gridSizeCols, numBombs());
        startTimer();
        
        $("#start-button").hide();
        $("#restart-button").show();
        $("#game-grid-container > button").attr("disabled", false);
    });

    $("#restart-button").on("click", resetGame);

    function resetGame() {
        flagCount = numBombs();
        updateFlagCountView();
        stopTimer();
        delay(1500);

        $("#game-grid-container > .badge").remove();
        setGridSize();
        drawGridCellsShown();
        gameEngine = new MSGame();
        gameEngine.init(gridSizeRows, gridSizeCols, numBombs());
        startTimer();
    }

    function drawGrid() {
        setGridSize();
        drawGridCellsHidden();
    }

    function gameOver(){
        $("#losing-time-result").text( $("#timer").text() );
        $("#losing-flags-final").text( numBombs() - flagCount );
        stopTimer();
        disableGridButtons();
        let options = {focus : true, show: true};
        $("#game-over-modal").modal(options);   
    }

    function gameWon() {
        $("#winning-time-result").text( $("#timer").text() );
        $("#winning-flags-final").text( numBombs() - flagCount );
        stopTimer();
        disableGridButtons();
        let options = {focus : true, show: true};
        $("#winning-modal").modal(options);
    }

    function disableGridButtons() {
        $("#game-grid-container > button").attr("disabled", true); // doesn't work to stop registering clicks
        gridIdToCallbackArray.forEach( (obj) => {
            let hammertime = obj.hammer;
            hammertime.off("tap", obj.tapEventCallback);
            hammertime.off("press", obj.pressEventCallback);
        });
    }

    function startTimer() {
        console.log("Starting the timer");
        let t = 0;
        timer = setInterval(function () {
            t++;
            let newText = ("000" + t).substr(-3);
            $("#timer").text(newText);
        }, 1000)
    }

    function stopTimer() {
        if (timer) {
            //$("#timer").text("000");
            window.clearInterval(timer);
        }
    }

    function setGridSize() {
        console.log(`size = ${gridSizeRows} x ${gridSizeCols}`);
        let css = {
            gridTemplateColumns: `repeat(${gridSizeRows}, 64px)`,
            gridTemplateRows: `repeat(${gridSizeCols}, 64px)`,
            rowGap: '3px',
            columnGap: '3px'
        }
        $("#game-grid-container").css(css);
    }
    
    function drawGridCellsHidden() {
        console.log("Draw cells Hidden called");
        $("#game-grid-container").empty();
        for (let i=1; i <= gridSizeRows; i++){
            for (let j=1; j <= gridSizeCols; j++) {
                let currentId = `cell${i}${j}`;
                let cell = `<button id='${currentId}' class='btn btn-success' disabled></button>`;
                $("#game-grid-container").append(cell);
    
                let currentCss = {
                    gridRow: `${j} / ${j+1}`, 
                    gridColumn: `${i} / ${i+1}`,
                    backgroundImage: "url('green-grass.png')",
                    padding: "0px"
                };
                //let currentCellElement = $(`#${currentId}`);
                $(`#${currentId}`).css(currentCss);
                let data = {elementIdSelector: `#${currentId}`, elementColumn: j-1, elementRow: i-1};
                let hammertime = new Hammer(document.getElementById(`${currentId}`));
                let tapCallback = (ev) =>{
                    cellClickHandler(data);
                }
                let pressCallback = (ev) => {
                    placeFlagHandler(data);
                }
                hammertime.on("tap", tapCallback);
                hammertime.on("press", pressCallback);
                gridIdToCallbackArray.push({id: "currentId",  hammer: hammertime, tapEventCallback: tapCallback, pressEventCallback: pressCallback});
            }
            
        }
    
        $("nav").css("width", $("#game-grid-container").css("width") );
    }

    function drawGridCellsShown() {
        console.log("Draw cells Shown called");
        $("#game-grid-container").empty();
        for (let i=1; i <= gridSizeRows; i++){
            for (let j=1; j <= gridSizeCols; j++) {
                let currentId = `cell${i}${j}`;
                let cell = `<button id='${currentId}' class='btn btn-success'></button>`;
                $("#game-grid-container").append(cell);
    
                let currentCss = {
                    gridRow: `${j} / ${j+1}`, 
                    gridColumn: `${i} / ${i+1}`,
                    backgroundImage: "url('green-grass.png')",
                    padding: "0px"
                };
                let currentCellElement = $(`#${currentId}`);
                currentCellElement.css(currentCss);
                let data = {elementIdSelector: `#${currentId}`, elementColumn: j-1, elementRow: i-1};
                let hammertime = new Hammer(document.getElementById(`${currentId}`));
                let tapCallback = (ev) =>{
                    cellClickHandler(data);
                }
                let pressCallback = (ev) => {
                    placeFlagHandler(data);
                }
                hammertime.on("tap", tapCallback);
                hammertime.on("press", pressCallback);
                gridIdToCallbackArray.push({id: "currentId", hammer: hammertime, tapEventCallback: tapCallback, pressEventCallback: pressCallback});
            }
            
        }
    
        $("nav").css("width", $("#game-grid-container").css("width") );
    }

    
    function placeFlagHandler(data) {
        let elemId = data.elementIdSelector;
        let elemCol = data.elementColumn;
        let elemRow = data.elementRow;
    
        console.log(elemId);

        if (elemId === "#") {  // This happens when user clicks on a bootstrap badge (number) on an uncovered cell
            return;
        }

        if (gameEngine.mark(elemRow, elemCol)) {
            if ($(elemId).children().length === 0) {
                // Put down flag and decrement flag count
                $(elemId).append("<img class='flag' src='icons8-flag.png'>");
                $(".flag").css({width: "52px", height: "auto"});
                flagCount--;
            }
            else {
                // remove existing flag and increment flag count
                $(elemId).empty();
                flagCount++;
            }
            updateFlagCountView();
        }
        
    }

    function updateFlagCountView() {
        $("#num-flags").text(flagCount);
    }

    function cellClickHandler(data) {
        let elemId = data.elementIdSelector;
        let elemCol = data.elementColumn;
        let elemRow = data.elementRow;

        console.log(`In cellClickHandler. data object:\n { ${elemId}, ${elemCol}, ${elemRow}`);

        if (gameEngine.uncover(elemRow, elemCol) === false){
            console.log("Uncovering failed");
            console.log(gameEngine.getStatus());
            return false;
        }

        let status = gameEngine.getStatus();
        if (status.exploded) {
            $(elemId).css({backgroundImage: "url('icons8-bomb.png')"});
            delay(300).then(() => {
                $(elemId).css({
                    backgroundImage: "url('icons8-explosion.png')", 
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                });
                delay(200).then(() => {
                    gameOver();
                    
                });
            });
            return false;
        }

        let renderingStatus = gameEngine.getRendering();
        drawGridStatus(renderingStatus);    
        
        if (status.done) {
            gameWon();
            return false;
        }

        return false;
    }

    function drawGridStatus(renderingStatusObject) {
        let flag = "<img class='flag-img' src='icons8-flag.png'>";
        let one = "<h3><span class='badge badge-secondary border'>1</span></h3>";
        let two = "<h3><span class='badge badge-primary border'>2</span></h3>";
        let three = "<h3><span class='badge badge-warning border'>3</span></h3>";
        let four = "<h3><span class='badge badge-danger border'>4</span></h3>";
        let fivePlus = function (number) {
            return `<h3><span class='badge badge-danger border'>${number}</span></h3>`;
        }

        for (let row = 0; row < gridSizeRows; row++) {
            for (let col = 0; col < gridSizeCols; col++) {
                let currentCell = $(`#cell${row+1}${col+1}`);
                //console.log("Tile: \n id = " + `#cell${row}${col}`);

                let tileStatus = renderingStatusObject[row].charAt(col);
                //console.log(" status = " + tileStatus);

                if (tileStatus == "H") { continue; }
                if (tileStatus === "M") {
                    console.log("Game should be over now!");
                    return;
                }

                if (currentCell.children().length === 0) {
                    if (tileStatus === "F") {
                        currentCell.append(flag);
                        continue;
                    }
    
                    currentCell.css({backgroundImage: "url('ground.png')"});

                    if (tileStatus === "1") {
                        currentCell.append(one);
                    }
                    else if (tileStatus === "2") {
                        currentCell.append(two);
                    }
                    else if (tileStatus === "3") {
                        currentCell.append(three);
                    }
                    else if (tileStatus === "4") {
                        currentCell.append(four);
                    }
                    else {
                        currentCell.append(fivePlus(tileStatus));
                    }
                }
                
            }
        }
    }

    // From prof. Pavol Federl
    function delay(delay, val) { 
        return new Promise( resolve => {
          setTimeout( () => {
            resolve(val);
          }, delay);
        });
    }
      
}

main();