"use strict";


let gridSizeRows;
let gridSizeCols;


function setLevel(levelString) {
    if (levelString === "easy"){
        gridSizeRows = 6;
        gridSizeCols = 6;
    }
    else if (levelString === "hard"){
        gridSizeRows = 10;
        gridSizeCols = 8;
    }
    console.log(`size = ${gridSizeRows} x ${gridSizeCols}`);
    let css = {
        gridTemplateColumns: `repeat(${gridSizeRows}, 64px)`,
        gridTemplateRows: `repeat(${gridSizeCols}, 64px)`,
        rowGap: '3px',
        columnGap: '3px'
    }
    $("#game-grid-container").css(css);

    drawGrid();
}

$( window ).on("load", function loadScreen() {
    console.log("window loaded");

    setLevel("easy");

    let game = new MSGame();
    game.init(10, 10, 10);
    console.log(game.getRendering().join("\n"));
    console.log(game.getStatus());

    game.uncover(2,5);
    console.log(game.getRendering().join("\n"));
    console.log(game.getStatus());

    game.uncover(5,5);
    console.log(game.getRendering().join("\n"));
    console.log(game.getStatus());

    game.mark(4,5);
    console.log(game.getRendering().join("\n"));
    console.log(game.getStatus());


    console.log("end");
        
    
});

let drawGrid = function () {
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
            let data = {elementIdSelector: `#${currentId}`, elementColumn: i, elementRow: j};
            currentCellElement.bind("click", data, cellClickHandler);
        }
        
    }

    $("nav").css("width", $("#game-grid-container").css("width") );
}

let cellClickHandler = function (event) {
    let elemId = event.data.elementIdSelector;
    let elemCol = event.data.elementColumn;
    let elemRow = event.data.elementRow;

    console.log(elemId);

    let newCss = {
        backgroundImage: "url('ground.png')"
    };
    $(elemId).css(newCss);

    let one = "<h3><span class='badge badge-secondary border'>1</span></h3>";
    let two = "<h3><span class='badge badge-primary border'>2</span></h3>";
    let three = "<h3><span class='badge badge-warning border'>3</span></h3>";
    let four = "<h3><span class='badge badge-danger border'>4</span></h3>";
    let fivePlus = function (number) {
        return `<h3><span class='badge badge-danger border'>${number}</span></h3>`;
    }
    $(elemId).append(fivePlus(5));
    console.log("Click handled");
}