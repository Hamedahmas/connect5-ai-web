const ROWS = 7;
const COLS = 9;
let board = [];
let currentPlayer = 'red';
let gameOver = false;

function startGame(mode) {
  document.getElementById("board").innerHTML = "";
  document.getElementById("message").innerText = "";
  board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
  gameOver = false;
  currentPlayer = (mode === 'Human') ? 'red' : 'yellow';
  createBoard();

  if (mode === 'AI') aiMove();
  if (mode === 'AIVSAI') setInterval(() => {
    if (!gameOver) aiMove();
  }, 700);
}

function createBoard() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.onclick = () => handleClick(c);
      document.getElementById("board").appendChild(cell);
    }
  }
}

function handleClick(col) {
  if (gameOver) return;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = currentPlayer;
      updateCell(r, col);
      if (checkWinner(r, col)) {
        document.getElementById("message").innerText = `${currentPlayer.toUpperCase()} won!`;
        gameOver = true;
      } else {
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
      }
      break;
    }
  }
}

function updateCell(r, c) {
  const index = r * COLS + c;
  document.querySelectorAll(".cell")[index].classList.add(currentPlayer);
}

// فقط بررسی ساده برای تست اولیه (چک افقی/عمودی/قطری 5 تایی)
function checkWinner(row, col) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== currentPlayer) break;
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== currentPlayer) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

function aiMove() {
  if (gameOver) return;
  let col;
  do {
    col = Math.floor(Math.random() * COLS);
  } while (board[0][col] !== null);
  handleClick(col);
}
