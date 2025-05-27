// game.js — پیاده‌سازی کامل بازی Connect 5 با AI در سه حالت

let board = [];
let currentPlayer = 'human';
let playerMode = 'human-first';
let gameOver = false;
const rows = 7;
const cols = 9;

function createBoard() {
  board = Array.from({ length: rows }, () => Array(cols).fill(null));
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => handleClick(c));
      boardEl.appendChild(cell);
    }
  }
}

function startGame(mode) {
  createBoard();
  playerMode = mode;
  gameOver = false;

  if (mode === 'ai-first') {
    currentPlayer = 'ai';
    aiMove();
  } else if (mode === 'human-first') {
    currentPlayer = 'human';
  } else if (mode === 'ai-vs-ai') {
    currentPlayer = 'ai';
    aiVsAiLoop();
  }
}

function handleClick(col) {
  if (gameOver || currentPlayer !== 'human') return;

  const row = getAvailableRow(col);
  if (row === -1) return;

  placePiece(row, col, 'human');

  if (checkWinner('human')) {
    alert('Human wins!');
    gameOver = true;
    return;
  }

  currentPlayer = 'ai';
  setTimeout(aiMove, 300);
}

function placePiece(row, col, player) {
  board[row][col] = player;
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cell) cell.classList.add(player);
}

function getAvailableRow(col) {
  for (let r = rows - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
}

async function aiMove() {
  if (gameOver || currentPlayer !== 'ai') return;

  const col = await chooseBestMove(); // باید مدل AI واقعی اضافه شود
  const row = getAvailableRow(col);
  if (row === -1) return;

  placePiece(row, col, 'ai');

  if (checkWinner('ai')) {
    alert('AI wins!');
    gameOver = true;
    saveExperience(); // ذخیره تجربه جدید
    return;
  }

  currentPlayer = 'human';
}

function aiVsAiLoop() {
  if (gameOver) return;
  aiMove();
  setTimeout(aiVsAiLoop, 400);
}

function checkWinner(player) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === player) {
        for (let [dr, dc] of directions) {
          let count = 1;
          for (let i = 1; i < 5; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || board[nr][nc] !== player) break;
            count++;
          }
          if (count >= 5) return true;
        }
      }
    }
  }
  return false;
}

function chooseBestMove() {
  // جایگزین با مدل AI
  return new Promise(resolve => {
    const available = [];
    for (let c = 0; c < cols; c++) {
      if (getAvailableRow(c) !== -1) available.push(c);
    }
    resolve(available[Math.floor(Math.random() * available.length)]);
  });
}

function saveExperience() {
  // در اینجا باید کدی بنویسی که بازی‌های AI ذخیره بشن برای آموزش بعدی
  console.log('AI تجربه جدیدی کسب کرد! (می‌تونی به سرور یا IndexedDB ذخیره کنی)');
}

// شروع پیش‌فرض
window.onload = () => startGame('human-first');
