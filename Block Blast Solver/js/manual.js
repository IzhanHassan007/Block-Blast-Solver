// Import necessary modules from the solver
import solver from "../js/solver.js"

const {
  playGameWithDynamicLookahead,
  displayWithOrder,
  displayBoard,
  makeMessage
} = solver;

// DOM Elements
const submitButton = document.getElementById("submitButton");
const goBackBtn = document.getElementById("goBack");

const mainGrid = document.getElementById("main-grid");
const smallGrids = [
  document.getElementById("small-grid-1"),
  document.getElementById("small-grid-2"),
  document.getElementById("small-grid-3"),
];

// Create Grids
createGrid(mainGrid, 8); // Create main grid with size 8x8
smallGrids.forEach((grid) => createGrid(grid, 5)); // Create small grids with size 5x5

// Event Listeners
submitButton.addEventListener("click", submit);
goBackBtn.addEventListener("click", goBack);

// Function to create grid cells
function createGrid(gridElement, size) {
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", () => {
      cell.classList.toggle("taken");
    });
    gridElement.appendChild(cell);
  }
}

// Function to convert grid to 2D array based on 'taken' class
function gridTo2d(gridElement, size) {
  const matrix = [];
  const cells = gridElement.querySelectorAll(".cell");
  let row = [];

  cells.forEach((cell) => {
    // Push 1 if cell is 'taken', else push 0
    row.push(cell.classList.contains("taken") ? 1 : 0);

    // Push row to matrix when row length equals grid size, then reset row
    if (row.length === size) {
      matrix.push(row);
      row = [];
    }
  });

  return matrix;
}

// Function to extract the smallest bounding box containing all 1's from a matrix
function extractOnes(matrix) {
  let top = matrix.length,
    left = matrix[0].length;
  let bottom = -1,
    right = -1;
  let hasOnes = false;

  // Loop through matrix to find boundaries of the region with all the 1s
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === 1) {
        hasOnes = true;
        top = Math.min(top, i);
        left = Math.min(left, j);
        bottom = Math.max(bottom, i);
        right = Math.max(right, j);
      }
    }
  }

  // If no 1's found, return null
  if (!hasOnes) {
    return null;
  }

  // Create and return submatrix containing the bounding box region
  const result = [];
  for (let i = top; i <= bottom; i++) {
    const row = [];
    for (let j = left; j <= right; j++) {
      row.push(matrix[i][j]);
    }
    result.push(row);
  }

  return result;
}

// Handle the submit button click to process the grids
function submit() {
  // Clear previous moves display (if any)
  moves.innerHTML = "";

  // Extract shapes from small grids
  let pieces = [];
  smallGrids.forEach((grid) => {
    const gridMatrix = gridTo2d(grid, 5); // Convert each small grid to 2D array
    const shapeMatrix = extractOnes(gridMatrix); // Extract the shape (region with 1s)

    if (shapeMatrix) {
      pieces.push(shapeMatrix); // Add shape to pieces array
    }
  });

  // Get the main grid as 2D array and solve the puzzle
  const grid = gridTo2d(mainGrid, 8);
  const result = playGameWithDynamicLookahead(grid, pieces);

  // Display the result
  console.log("Displaying board after each piece is placed:");
  displayWithOrder(grid, pieces, result.order);

  // Final message and display final board
  makeMessage("Final Board:");
  displayBoard(result.finalGrid);
}

// Handle the goBack button click
function goBack() {
  window.location.pathname = "/"; // Navigate to the homepage or previous page
}
