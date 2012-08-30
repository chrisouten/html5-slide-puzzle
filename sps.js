// Sliding Puzzle System
var SPS = SPS || {};

// Doing some quick initin'. Hook up the image input and the canvas click listener
SPS.init = function() {
    SPS.common.canvas = document.querySelector("#canvas");
    SPS.common.ctx = canvas.getContext("2d");
    document.querySelector("#image_input").onchange = SPS.common.processImage;
    document.querySelector("#canvas").onclick = SPS.game.click;
}

// Our main game module
SPS.game = {
	// Our tile data infos, where the current empty square x and y are and if we solved
	tileData : null,
	tileWidth: null,
	tileHeight: null,
	emptyX: null,
	emptyY: null,
	solved: false,
	// A class for holding board piece information
	boardPiece : function(imageData, x, y) {
		this.img = imageData;
		this.x = x;
		this.y = y;
		this.correct_x = x;
		this.correct_y = y;
		this.hidden = false;
		return this;
	},
	// Our move handler for when the user clicks on a tile
	click: function(e) {
		// We get the neighbors for the current empty spot
		// TODO: This probably should be assigned in the movePiece function
		// 			so we don't have to call this everytime a click happens
		neighbors = SPS.game.getNeighbors();
		var x = e.pageX - SPS.common.canvas.offsetLeft;
	    var y = e.pageY - SPS.common.canvas.offsetTop;
	    // Loop through our pieces until we find the one that was clicked
	    // 			and make sure we should move it, check if we won
	    // TODO: Possibly doing a 2d array to store the boardpieces would be cleaner
	    //			and would help this part out as well
		for (var p in SPS.game.tileData) {
			var boardPiece = SPS.game.tileData[p];
			if (x < boardPiece.x + 80 && x >= boardPiece.x &&
				y < boardPiece.y + 80 && y >= boardPiece.y) {
				for (var n in neighbors) {
					if (neighbors[n] == boardPiece && boardPiece.hidden == false) {
						SPS.game.movePiece(boardPiece);
						SPS.game.checkWin();
					}
				}
			}
		}
	},
	// Our shuffle function for getting a random board state everytime an image is loaded
	shuffle : function(number_of_shuffles) {
		// Keep track of our last piece moved, by random chance we don't want to move
		//			the same piece back and forth n times
		var lastPiece = null;
		for (var i=0; i < number_of_shuffles; i++) {
			// Get the possible pieces to move, make sure its not an empty one and not the last piece
			// TODO: As I wrote check and make sure its not the empty one I realized getNeighbors should
			//			do the checking for me there
			var possibles = SPS.game.getNeighbors();
			for (p in possibles) {
				if (possibles[p] == lastPiece || possibles[p].hidden) {
					possibles.splice(p, 1);
					console.log('removed');
				}
			}
			// Choose a random one, move it, reset possibles, and assign lastPiece
			var pieceToMove = possibles[Math.floor(Math.random()*possibles.length)];
			SPS.game.movePiece(pieceToMove);
			possibles = [];
			lastPiece = pieceToMove;
		}
		SPS.game.drawBoard();
	},
	getNeighbors: function() {
		// Get the valid pieces to move.
		// TODO: Distance is hard coded and this should check if the piece is hidden or not
		neighbors = []
		for (p in SPS.game.tileData) {
			var boardPiece = SPS.game.tileData[p];
			var dis =  Math.abs(SPS.game.emptyX - boardPiece.x) + Math.abs(SPS.game.emptyY - boardPiece.y);
			if (dis === 80)
				neighbors.push(boardPiece);
		}
		return neighbors;
	},
	movePiece : function(pieceToMove) {
		// Move our piece to the empty spot and assign the empty spot to the piece's old spot
		console.log(pieceToMove);
		var holdX = pieceToMove.x;
		var holdY = pieceToMove.y;
		pieceToMove.x = SPS.game.emptyX;
		pieceToMove.y = SPS.game.emptyY;
		SPS.game.emptyX = holdX;
		SPS.game.emptyY = holdY;
		SPS.game.drawBoard();
		
		return null;
		
	},
	checkWin : function() {
		var win = true;
		for (p in SPS.game.tileData) {
			var boardPiece = SPS.game.tileData[p];
			if (boardPiece.x !== boardPiece.correct_x || boardPiece.y !== boardPiece.correct_y) {
				win = false;
			}
		}
		SPS.game.solved = win;
		if (win) {
			document.querySelector("#canvas").onclick = null;
			alert("You win!");
			
			SPS.game.drawCorrectBoard();
		}
	},
	drawBoard : function() {
		SPS.common.ctx.clearRect(0, 0, SPS.common.canvas.width, SPS.common.canvas.height);
		for (var piece in SPS.game.tileData) {
			var td = SPS.game.tileData[piece];
			if (td.x != SPS.game.emptyX || td.y != SPS.game.emptyY) {
				SPS.common.ctx.putImageData(td.img, td.x, td.y);
			} 
		}
	},
	drawCorrectBoard : function() {
		SPS.common.ctx.clearRect(0, 0, SPS.common.canvas.width, SPS.common.canvas.height);
		for (var piece in SPS.game.tileData) {
			var td = SPS.game.tileData[piece];
			SPS.common.ctx.putImageData(td.img, td.correct_x, td.correct_y);
		}
	},
	readyImage : function() {
		// Calculate some image properties, some tile properties
		// TODO: Get rid of the hardcoded stuff, should be based on device size
		var imageWidth, imageHeight, tileWidth, tileHeight;
		imageWidth = SPS.common.canvas.width;
		imageHeight = SPS.common.canvas.height;
		SPS.game.tileWidth = imageWidth / 4;
		SPS.game.tileHeight = imageHeight / 6;
		var tilesX = imageWidth / SPS.game.tileWidth;
		var tilesY = imageHeight / SPS.game.tileHeight;
		var totalTiles = tilesX * tilesY;        
		SPS.game.tileData = new Array();
		for(var i=0; i<tilesY; i++) {
			for(var j=0; j<tilesX; j++) {           
				// Store the image data of each tile in the array.
				var bp = new SPS.game.boardPiece(SPS.common.ctx.getImageData(j*SPS.game.tileWidth, i*SPS.game.tileHeight,
											     SPS.game.tileWidth, SPS.game.tileHeight),
												 j*SPS.game.tileWidth, i*SPS.game.tileHeight);
				SPS.game.tileData.push(bp);
			}
		}
		
		// Can uncomment the following line and change the lines below that
		// 		to make a random starting position
		//var missingIndex = Math.floor(Math.random() * 24);
		SPS.game.emptyX = 0;//SPS.game.tileData[missingIndex].x;
		SPS.game.emptyY = 0;//SPS.game.tileData[missingIndex].y;
		SPS.game.tileData[0].hidden = true;
		SPS.game.drawBoard();
		// TODO: Make this value based on another input, maybe a range slider or some radiobuttons (easy, medium, hard, etc)
		SPS.game.shuffle(10);
	}
}

SPS.common = {
    canvas : null,
    ctx : null,
    // Image processing code used from here:
    //	https://hacks.mozilla.org/2012/04/taking-pictures-with-the-camera-api-part-of-webapi/
    processImage : function(event) {
        var files = event.target.files,
            file;
            
        if (files && files.length > 0) {
            file = files[0];
            try {
                var URL = window.URL || window.webkitURL;
                var imgURL = URL.createObjectURL(file);
                var img = new Image();
                img.onload = function() {
                    SPS.common.ctx.drawImage(img, 0, 0, SPS.common.canvas.width,
                                             SPS.common.canvas.height);
					SPS.game.readyImage();
                }
                img.src = imgURL;
                URL.revokeObjectURL(imgURL);
            }
            catch (e) {
                try {
                    var fileReader = new FileReader();
                    var img = new Image();
                    img.onload = function() {
                        SIS.common.ctx.drawImage(img, 0, 0, SIS.common.canvas.width,
                                             SIS.common.canvas.height);    
                    }
                    fileReader.onload = function (event) {
                          img.src = event.target.result;
                    };
                    fileReader.readAsDataURL(file);
                }
                catch (e) {
                    alert("Ouch, something messed up with the filereader or createobjecturl");
                }
            }
        }
    }
}


window.onload = function() {
    SPS.init();
}
