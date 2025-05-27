const ROWS = 7;
const COLS = 9;
const WIN_LENGTH = 5;
let board = [];
let currentPlayer = 'human';
let gameMode = 'human-first';
let gameOver = false;

function createBoard() {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      boardElement.appendChild(cell);
    }
  }

  boardElement.addEventListener('click', handleCellClick);
}

function handleCellClick(e) {
  if (gameOver || currentPlayer !== 'human' || gameMode === 'ai-vs-ai') return;

  const col = parseInt(e.target.dataset.col);
  makeMove(col, 'human');
  if (!gameOver && gameMode !== 'human-first') {
    setTimeout(() => aiMove('ai'), 300);
  }
}

function makeMove(col, player) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) {
      board[row][col] = player;
      updateUI();
      if (checkWin(row, col, player)) {
        alert(`${player === 'human' ? 'شما' : player === 'ai1' ? 'AI 1' : player === 'ai2' ? 'AI 2' : 'AI'} برنده شد!`);
        gameOver = true;
        return;
      }

      if (gameMode === 'ai-vs-ai') {
        currentPlayer = currentPlayer === 'ai1' ? 'ai2' : 'ai1';
      } else {
        currentPlayer = player === 'human' ? 'ai' : 'human';
      }
      return;
    }
  }
}

function aiMove(aiPlayer) {
  if (gameOver) return;

  const availableCols = [];
  for (let col = 0; col < COLS; col++) {
    if (!board[0][col]) availableCols.push(col);
  }

  if (availableCols.length === 0) {
    alert("مساوی شد!");
    gameOver = true;
    return;
  }

  const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
  makeMove(randomCol, aiPlayer);

  if (gameMode === 'ai-vs-ai' && !gameOver) {
    setTimeout(() => aiMove(currentPlayer), 300);
  }
}

function checkWin(row, col, player) {
  return (
    checkDirection(row, col, player, 0, 1) ||
    checkDirection(row, col, player, 1, 0) ||
    checkDirection(row, col, player, 1, 1) ||
    checkDirection(row, col, player, 1, -1)
  );
}

function checkDirection(row, col, player, rowDir, colDir) {
  let count = 1;
  for (let dir of [-1, 1]) {
    let r = row + dir * rowDir;
    let c = col + dir * colDir;

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r += dir * rowDir;
      c += dir * colDir;
    }
  }

  return count >= WIN_LENGTH;
}

function updateUI() {
  const boardElement = document.getElementById('board');
  const cells = boardElement.querySelectorAll('.cell');

  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const value = board[row][col];
    cell.classList.remove('human', 'ai', 'ai1', 'ai2');

    if (value === 'human') {
      cell.classList.add('human');
    } else if (value === 'ai') {
      cell.classList.add('ai');
    } else if (value === 'ai1') {
      cell.classList.add('ai1');
    } else if (value === 'ai2') {
      cell.classList.add('ai2');
    }
  });
}

function startGame(mode) {
  gameMode = mode;
  gameOver = false;
  createBoard();

  if (mode === 'ai-vs-ai') {
    currentPlayer = 'ai1';
    aiMove('ai1');
  } else if (mode === 'ai-first') {
    currentPlayer = 'ai';
    setTimeout(() => aiMove('ai'), 500);
  } else {
    currentPlayer = 'human';
  }
}
