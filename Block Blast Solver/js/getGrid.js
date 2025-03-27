// Configuration variables
const GRID_COLOR = hexToRgb("#1e2448");
const BORDER_COLOR = hexToRgb("#161d3b");
const COLOR_THRESHOLD = 10;
const CENTER_THRESHOLD_X = 0.9;
const CENTER_THRESHOLD_Y = 0.3;
const CELL_SIZE = 8;

// Function to process the image
async function processImage(image) {
  const canvas = document.createElement('canvas');
  canvas.style.display = "block";
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  let gridX, gridY, gridWidth, gridHeight;

  // Scan the image to find the top-left corner of the grid
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4; // RGBA data
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      if (isColorSimilar(r, g, b, GRID_COLOR.r, GRID_COLOR.g, GRID_COLOR.b)) {
        // Check if the color is within the center threshold
        if (isWithinCenterThreshold(x, y, canvas.width, canvas.height)) {
          gridX = x;
          gridY = y;
          break;
        }
      }
    }
    if (gridX !== undefined) break;
  }

  // Scan the image to find the bottom-right corner of the grid
  for (let y = canvas.height - 1; y >= 0; y--) {
    for (let x = canvas.width - 1; x >= 0; x--) {
      const index = (y * canvas.width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      if (isColorSimilar(r, g, b, BORDER_COLOR.r, BORDER_COLOR.g, BORDER_COLOR.b)) {
        // Check if the color is within the center threshold
        if (isWithinCenterThreshold(x, y, canvas.width, canvas.height)) {
          gridWidth = x - gridX + 1;
          gridHeight = y - gridY + 1;
          break;
        }
      }
    }
    if (gridWidth !== undefined) break;
  }

  // Split the grid into cells and detect the color
  const grid = splitGridIntoCells(gridX, gridY, gridWidth, gridHeight, pixels, canvas.width);
  //console.log("Grid:", grid);

  canvas.remove();

  return {
    grid,
    gridY,
    gridHeight
  };
}

// Function to split the grid into cells
function splitGridIntoCells(gridX, gridY, gridWidth, gridHeight, pixels, width) {
  const cellWidth = gridWidth / CELL_SIZE;
  const cellHeight = gridHeight / CELL_SIZE;
  const grid = new Array(CELL_SIZE)
    .fill(0)
    .map(() => new Array(CELL_SIZE).fill(0));

  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const cellX = gridX + x * cellWidth;
      const cellY = gridY + y * cellHeight;
      const centerPixel = getCenterPixel(cellX, cellY, cellWidth, cellHeight, pixels, width);

      // Check if the cell contains a large amount of a different color than the background color
      if (
        !isColorSimilar(
          centerPixel[0],
          centerPixel[1],
          centerPixel[2],
          GRID_COLOR.r,
          GRID_COLOR.g,
          GRID_COLOR.b
        )
      ) {
        grid[y][x] = 1;
      }
    }
  }

  return grid;
}

// Function to get the center pixel of a cell
function getCenterPixel(cellX, cellY, cellWidth, cellHeight, pixels, width) {
  const centerX = Math.floor(cellX + cellWidth / 2);
  const centerY = Math.floor(cellY + cellHeight / 2);
  const index = (centerY * width + centerX) * 4;
  const r = pixels[index];
  const g = pixels[index + 1];
  const b = pixels[index + 2];
  return [r, g, b];
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}

// Helper function to compare if two colors are similar
function isColorSimilar(r1, g1, b1, r2, g2, b2) {
  return (
    Math.abs(r1 - r2) < COLOR_THRESHOLD &&
    Math.abs(g1 - g2) < COLOR_THRESHOLD &&
    Math.abs(b1 - b2) < COLOR_THRESHOLD
  );
}

// Helper function to check if a pixel is within the center threshold
function isWithinCenterThreshold(x, y, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const thresholdX = width * CENTER_THRESHOLD_X;
  const thresholdY = height * CENTER_THRESHOLD_Y;
  return (
    Math.abs(x - centerX) < thresholdX && Math.abs(y - centerY) < thresholdY
  );
}

export default processImage;