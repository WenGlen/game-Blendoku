// ====== 遊戲設定參數 ======
const gameLevels = [
  {
    rows: 1,
    cols: 3,
    fixedIndices: [0],
    colorOrder: ['#0c6b00', '#86a927', '#ffe14d']
  },
  {
    rows: 3,
    cols: 3,
    fixedIndices: [0],
    colorOrder: [
      '#ff6a1a', '#ffac22', '#ffed29',
      'X', '#b6a917', 'X',
      'X', '#23a300', 'X'
    ]
  },
  {
    rows: 4,
    cols: 3,
    fixedIndices: [0, 2, 11], // 哪些格子是提示格
    colorOrder: [
      '#ffffff', 'X', '#4ee9fd',
      '#ffedaa', '#c6e1ba', '#55c8d9',
      '#ffda55', 'X', '#5ca8b6',
      '#ffc800', 'X', '#638792'
    ]
  },
  {
    rows: 3,
    cols: 3,
    fixedIndices: [0, 2, 5], // 哪些格子是提示格
    colorOrder: [
      '#0c6b00', '#067354', '#007ba7',
      '#86a927', 'X', '#76bad3',
      '#ffe14d', '#f5f0a6', '#ebf9ff'
    ]
  }
];

// ====== 設定計分功能參數 =====

let stepCount = 0;
let startTime = null;
let timerInterval = null;
let hasStarted = false;
let timeElapsed = 0;
let currentLevel = 0;

// ====== 等整個頁面載入後再開始 ======
document.addEventListener('DOMContentLoaded', () => {
  loadLevel(currentLevel);
  document.getElementById('win-popup').classList.add('hidden'); // 確保彈窗一開始是隱藏的
});

function loadLevel(index) {
  const levelData = gameLevels[index];
  if (!levelData) return;

  // ✅ 更新 header 顯示的關卡編號
  document.querySelector('.levelNum').textContent = `Lv ${index + 1}`;

  // 以下保持原本內容
  stepCount = 0;
  hasStarted = false;
  clearInterval(timerInterval);
  document.getElementById('step-count').textContent = '0';
  document.getElementById('timer').textContent = '0.0';
  document.getElementById('win-popup').classList.add('hidden');

  startGame(levelData);
}


// ====== 主流程函式 ======
function startGame({ rows, cols, fixedIndices, colorOrder }) {
  generateBoard({ rows, cols, fixedIndices, colorOrder });
  generateTiles(colorOrder, fixedIndices);
  setupDragAndDrop();
}

// ====== 建立作答區格子 ======
function generateBoard({ rows, cols, fixedIndices, colorOrder }) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${cols}, 60px)`;

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    const color = colorOrder[i];

    if (color === 'X') {
      // 被隱藏的格子
      cell.classList.add('hidden-cell');
      cell.dataset.disabled = 'true';
    } else {
      // 一般格子
      cell.dataset.answer = i.toString(); // 正確答案是位置順序

      if (fixedIndices.includes(i)) {
        cell.classList.add('fixed');
        cell.dataset.fixed = 'true';
      }
    }

    board.appendChild(cell);
  }
}


// ====== 建立所有 tile，並放入起始區（不含固定格）======
function generateTiles(colorOrder, fixedIndices = []) {
  const startArea = document.getElementById('start-area');
  startArea.innerHTML = '';

   // 建立並放入固定格 tile
  fixedIndices.forEach(i => {
    const color = colorOrder[i];
    const tile = createTile(i, color, true);
    const cell = document.querySelector(`#board .cell:nth-child(${i + 1})`);
    if (cell) {
      cell.appendChild(tile);
      cell.dataset.current = i.toString(); // 設定目前值方便檢查答案
    }
  });

  // 建立可動格 tile
  const movableIndices = colorOrder
    .map((_, i) => i)
    .filter(i => !fixedIndices.includes(i) && colorOrder[i] !== 'X');

  shuffleArray(movableIndices); // 隨機打亂順序

  movableIndices.forEach(i => {
    const tile = createTile(i, colorOrder[i]);
    if (!tile) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('cell', 'initial');
    wrapper.appendChild(tile);
    startArea.appendChild(wrapper);
  });
}

// ====== 建立單個 tile ======
function createTile(index, color, isFixed = false) {
  if (!color || color === 'X') return null;
  const tile = document.createElement('div');
  tile.classList.add('tile');
  tile.dataset.index = index.toString();
  tile.dataset.color = color;
  tile.style.backgroundColor = color;

  if (isFixed) {
    tile.classList.add('fixed-tile');
    tile.setAttribute('draggable', 'false');
  } else {
    tile.setAttribute('draggable', 'true');
  }

  return tile;
}




// 開始記錄時間
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000; // 秒數
    timeElapsed = elapsed; // ✅ 把最新秒數存進全域變數
    const formatted = elapsed.toFixed(1);
    document.getElementById('timer').textContent = formatted;
  }, 100);
}

// 終止紀錄時間
function stopTimer() {
  clearInterval(timerInterval);
}



// ====== 設定拖曳與點擊互動邏輯 =====
function setupDragAndDrop() {
  const tiles = document.querySelectorAll('.tile');
  const cells = document.querySelectorAll('.cell');
  let selectedTile = null;

  // 拖曳事件（桌機）
  tiles.forEach(tile => {
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', tile.dataset.index);
    });

    // 點擊事件（手機/桌機）
    tile.addEventListener('click', () => {
      if (selectedTile === tile) {
        tile.classList.remove('selected');
        selectedTile = null;
      } else {
        document.querySelectorAll('.tile.selected').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        selectedTile = tile;
      }
    });
  });

  // 放置格子邏輯
  cells.forEach(cell => {
    cell.addEventListener('dragover', (e) => e.preventDefault());

    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      if (cell.dataset.fixed === 'true') return;
      if (cell.dataset.disabled === 'true') return;
      const tileIndex = e.dataTransfer.getData('text/plain');
      const draggedTile = document.querySelector(`.tile[data-index="${tileIndex}"]`);
      moveTileToCell(draggedTile, cell);
    });

    // 點格子 → 把選到的 tile 放進來
    cell.addEventListener('click', () => {
      if (!selectedTile) return;
      moveTileToCell(selectedTile, cell);
      selectedTile.classList.remove('selected');
      selectedTile = null;
    });
  });
}

// === 移動 tile 進指定格子 ===
function moveTileToCell(tile, targetCell) {
  if (targetCell.dataset.fixed === 'true') return; // 固定格不能動

  const currentTile = targetCell.querySelector('.tile');
  const originalParent = tile.parentElement;

  if (currentTile) {
    // 如果原本格子有 tile → 交換
    originalParent.appendChild(currentTile);
    updateCurrentIndex(originalParent, currentTile);
  } else {
    // 如果原本是空格 → 移出原資料
    clearCurrentIndex(originalParent);
  }

  // 放進新格子
  targetCell.innerHTML = '';
  targetCell.appendChild(tile);
  targetCell.dataset.current = tile.dataset.index;


  // 第一次移動後開始計時
  if (!hasStarted) {
    startTimer();
    hasStarted = true;
  }

  // 每次移動增加步數
  stepCount++;
  document.getElementById('step-count').textContent = stepCount;


  setTimeout(checkAnswer, 50); // 延遲一點再判斷答案
}

function updateCurrentIndex(parent, tile) {
  if (parent.classList.contains('cell')) {
    parent.dataset.current = tile.dataset.index;
  }
}

function clearCurrentIndex(parent) {
  if (parent.classList.contains('cell')) {
    delete parent.dataset.current;
  }
}

// === 檢查答案 ===
function checkAnswer() {
  const cells = document.querySelectorAll('#board .cell');
  let correct = true;

  cells.forEach(cell => {
    if (cell.dataset.answer !== cell.dataset.current) {
      correct = false;
    }
  });

  if (correct) {
    showPopup(); // 顯示彈窗
    stopTimer?.(); // 如果有定時器函式
  }
}


// === 顯示 / 關閉彈窗 ===

// 顯示彈窗
function showPopup() {
  // 更新彈窗裡的數字
  document.getElementById('popup-step').textContent = stepCount;
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  document.getElementById('popup-time').textContent = elapsed;

  // 顯示彈窗
  document.getElementById('win-popup').classList.remove('hidden');
}

//關閉彈窗
function closePopup() {
  document.getElementById('win-popup').classList.add('hidden');
}

//重啟遊戲
function restartGame() {
  document.getElementById('win-popup').classList.add('hidden'); // 關閉彈窗

  // 歸零狀態
  stepCount = 0;
  hasStarted = false;
  clearInterval(timerInterval);
  document.getElementById('step-count').textContent = '0';
  document.getElementById('timer').textContent = '0.0';

  // 重新啟動遊戲（你可以指定同一個題目或重新產生）
  startGame(gameData); // 或 setupPuzzle(...)，看你目前使用哪種
}

 // 進下一關
function nextLevel() {
  currentLevel++;
  if (currentLevel >= gameLevels.length) {
    alert("你已完成所有關卡！");
    return;
  }
  loadLevel(currentLevel);
}

// === 工具函式 ===

// 洗牌陣列
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 取得不重複隨機索引（未使用）
function getRandomIndices(total, count) {
  const indices = Array.from({ length: total }, (_, i) => i);
  shuffleArray(indices);
  return indices.slice(0, count);
}
