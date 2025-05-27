// فرض بر اینکه مدل AI در تابع chooseBestMove پیاده شده و در فایل جداگانه load شده
let board = Array(7).fill().map(() => Array(9).fill(null));
let currentPlayer = 'human';
let playerMode = 'human-first';
let gameOver = false;

// شروع بازی بر اساس مود انتخاب‌شده
function startGame(mode) {
  resetBoard();
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

// کلیک کاربر انسانی روی یک ستون
function handleClick(col) {
  if (gameOver || currentPlayer !== 'human') return;

  const row = getAvailableRow(col);
  if (row === -1) return;

  board[row][col] = 'human';
  drawBoard();
  if (checkWinner('human')) {
    alert("Human wins!");
    gameOver = true;
    return;
  }

  currentPlayer = 'ai';
  setTimeout(aiMove, 500);
}

// حرکت AI با استفاده از مدل
async function aiMove() {
  if (gameOver || currentPlayer !== 'ai') return;

  const col = await chooseBestMove(); // باید با مدل AI واقعی پیاده‌سازی شود
  const row = getAvailableRow(col);
  if (row === -1) return;

  board[row][col] = 'ai';
  drawBoard();

  if (checkWinner('ai')) {
    alert("AI wins!");
    gameOver = true;
    return;
  }

  if (playerMode === 'ai-vs-ai') {
    setTimeout(aiVsAiLoop, 500);
  } else {
    currentPlayer = 'human';
  }
}

// اجرای بازی AI در مقابل AI
function aiVsAiLoop() {
  if (gameOver || playerMode !== 'ai-vs-ai') return;
  aiMove();
}

// ریست کردن بورد بازی
function resetBoard() {
  board = Array(7).fill().map(() => Array(9).fill(null));
  drawBoard();
}

// پیدا کردن سطر خالی برای ستون مشخص
function getAvailableRow(col) {
  for (let r = 6; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

// تابع تست برنده بودن (باید کامل پیاده‌سازی شود)
function checkWinner(player) {
  // این فقط اسکلت اولیه است
  return false;
}

// تابع نمایش گرافیکی بازی (باید جدا پیاده بشه)
function drawBoard() {
  console.log(board);
}

// مثال دکمه‌های شروع در HTML
/*
<button onclick="startGame('human-first')">من اول</button>
<button onclick="startGame('ai-first')">AI اول</button>
<button onclick="startGame('ai-vs-ai')">AI vs AI</button>
*/
