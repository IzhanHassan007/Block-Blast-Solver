import getGrid from '../js/getGrid.js';
import pieceExtractor from '../js/pieceExtractor.js';
import solver from "../js/solver.js"

const {
  playGameWithDynamicLookahead,
  displayWithOrder,
  displayBoard,
  makeMessage
} = solver;

const canvas = document.getElementById('canvas');
const moves = document.getElementById('moves');
const resultDiv = document.getElementById('result');
const doManualButton = document.getElementById("manualBtn")

doManualButton.addEventListener("click", doManual)

const mainGrid = document.getElementById("main-grid")
const smallGrids = [
  document.getElementById("small-grid-1"),
  document.getElementById("small-grid-2"),
  document.getElementById("small-grid-3"),
]

createGrid(mainGrid, 8)
smallGrids.forEach((grid) => createGrid(grid, 5))

// Create grid cells for the main grid and small grids
function createGrid(gridElement, size) {
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div")
    cell.classList.add("cell")
    gridElement.appendChild(cell)
  }
}

function drawBoardToGrid(gridElement, board) {
  // Get all cells in the grid element
  const cells = gridElement.querySelectorAll(".cell");

  // Get the number of rows and columns in the board
  const boardRows = board.length;
  const boardCols = board[0].length;

  // Calculate the grid dimensions
  const gridRows = Math.sqrt(cells.length); // Assuming grid is a square (same width and height)
  const gridCols = gridRows;

  // Calculate the starting position to center the board
  const startRow = Math.floor((gridRows - boardRows) / 2);
  const startCol = Math.floor((gridCols - boardCols) / 2);

  // Iterate through the cells and fill them according to the board data
  let index = 0; // index to iterate through the cells
  cells.forEach((cell, idx) => {
    const rowIdx = Math.floor(idx / gridCols); // Calculate row index in the grid
    const colIdx = idx % gridCols; // Calculate column index in the grid

    // Check if the cell is within the bounds of the board
    if (rowIdx >= startRow && rowIdx < startRow + boardRows && colIdx >= startCol && colIdx < startCol + boardCols) {
      const boardRow = rowIdx - startRow;
      const boardCol = colIdx - startCol;

      // Update the cell's state based on the board (1 or 0)
      const isTaken = board[boardRow][boardCol] === 1;
      if (isTaken) {
        cell.classList.add("taken");
      } else {
        cell.classList.remove("taken");
      }
    }

    index++;
  });
}

async function processImage(img) {
  moves.innerHTML = "";

  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const {
    grid,
    gridY,
    gridHeight
  } = await getGrid(img);


  if (grid) {
    const pieces = await pieceExtractor(img, gridY, gridHeight);

    if (pieces) {
      drawBoardToGrid(mainGrid, grid)

      pieces.forEach((piece, index) => {
        drawBoardToGrid(smallGrids[index], piece)
      })

      // Play the game with dynamic lookahead
      const result = playGameWithDynamicLookahead(grid, pieces);

      // Display the board after each piece is placed
      console.log("Displaying board after each piece is placed:")
      displayWithOrder(grid, pieces, result.order)

      makeMessage("Final Board:")
      displayBoard(result.finalGrid)

      resultDiv.style.display = "block";
    } else {
      console.log("No pieces found in the image.");
    }
  } else {
    console.log("Grid not found in the image.");
  }
}

// Event listener for file input
document.getElementById('image-upload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        processImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function doManual() {
  window.location.pathname = "/manual.html";
}
