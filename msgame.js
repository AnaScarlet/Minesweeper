"use strict";

let main = function (){
    let gridSizeRows;
    let gridSizeCols;

    let gameEngine;

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
    
        setLevelToEasy();
        drawGrid();
    });

    $("#start-button").on("click", function () {
        gameEngine = new MSGame();
        gameEngine.init(gridSizeRows, gridSizeCols, Math.floor(gridSizeRows * gridSizeCols / 3));
        // console.log(gameEngine.getRendering().join("\n"));
        // console.log(gameEngine.getStatus());
    
        // gameEngine.uncover(2,5);
        // console.log(gameEngine.getRendering().join("\n"));
        // console.log(gameEngine.getStatus());
    
        // gameEngine.uncover(5,5);
        // console.log(gameEngine.getRendering().join("\n"));
        // console.log(gameEngine.getStatus());
    
        // gameEngine.mark(4,5);
        // console.log(gameEngine.getRendering().join("\n"));
        // console.log(gameEngine.getStatus());
    
        // console.log("end");

        
        $("#start-button").hide();
        $("#restart-button").show();
        $("#game-grid-container > button").attr("disabled", false);
    });

    $("#restart-button").on("click", resetGame);

    function resetGame() {
        $("#game-grid-container > .badge").remove();
        setGridSize();
        drawGridCellsShown();
        gameEngine = new MSGame();
        gameEngine.init(gridSizeRows, gridSizeCols, Math.floor(gridSizeRows * gridSizeCols / 3));
    }

    function drawGrid() {
        setGridSize();
        drawGridCellsHidden();
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
                    backgroundImage: "url('green-grass.png')"
                };
                let currentCellElement = $(`#${currentId}`);
                currentCellElement.css(currentCss);
                let data = {elementIdSelector: `#${currentId}`, elementColumn: j, elementRow: i};
                currentCellElement.bind("click", data, cellClickHandler);
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
                    backgroundImage: "url('green-grass.png')"
                };
                let currentCellElement = $(`#${currentId}`);
                currentCellElement.css(currentCss);
                let data = {elementIdSelector: `#${currentId}`, elementColumn: j, elementRow: i};
                currentCellElement.bind("click", data, cellClickHandler);
            }
            
        }
    
        $("nav").css("width", $("#game-grid-container").css("width") );
    }
    
    function cellClickHandler(event) {
        let elemId = event.data.elementIdSelector;
        let elemCol = event.data.elementColumn;
        let elemRow = event.data.elementRow;
    
        console.log(elemId);

        if (gameEngine.uncover(elemRow-1, elemCol-1) === false){
            console.log("Uncovering failed");
            console.log(gameEngine.getStatus());
            return;
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
                    console.log("Game over!");
                    $("#game-grid-container > button").attr("disabled", true);
                });
            });
            return;
        }

        let renderingStatus = gameEngine.getRendering();
        drawGridStatus(renderingStatus);    
        
        if (status.done) {
            console.log("You win!!!");
            $("#game-grid-container > button").attr("disabled", true);
            return;
        }
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