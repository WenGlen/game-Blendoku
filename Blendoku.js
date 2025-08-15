// ====== 設定計分功能參數 =====
let stepCount = 0;
let startTime = null;
let timerInterval = null;
let hasStarted = false;
let timeElapsed = 0;
let currentLevel = 0;

// ====== 設定主畫面 / 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('main-menu');
  const btnStart = document.getElementById('btn-start');
  const btnTutorial = document.getElementById('btn-tutorial');
  const levelGrid = document.getElementById('level-grid');

  // 產生 Lv2 ~ LvN 的按鈕（照你的需求放 Lv2–…）
  renderLevelGrid();

  // 主畫面：開始（直接進 Lv1）
  btnStart?.addEventListener('click', () => {
    menu.classList.add('hidden');
    currentLevel = 0;
    loadLevel(currentLevel); // Lv1
  });

  // 主畫面：關卡選擇（統一用 menu 委派處理 data-level）
  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-level]');
    if (!btn) return;
    const i = Number(btn.dataset.level);
    if (Number.isNaN(i) || i < 0 || i >= gameLevels.length) return; // 安全檢查
    currentLevel = i;
    menu.classList.add('hidden');
    loadLevel(currentLevel);
  });

  // 玩法教學（暫時佔位）
  btnTutorial?.addEventListener('click', () => {
    // TODO: 換成你的自訂教學彈窗
    // alert('玩法教學（之後改成你的教學 UI）');
  });

  // 不需要再對 #level-grid 綁 click；用 menu 事件委派即可
});

// 任何時候要回主畫面（例如暫停或返回選單）
function openMenu() {
  document.getElementById('main-menu').classList.remove('hidden');
  // 可選：暫停計時、關閉底層互動
  // stopTimer?.();
}

// 產生關卡按鈕（Lv2 ~ Last）
function renderLevelGrid() {
  const grid = document.getElementById('level-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 1; i < gameLevels.length; i++) {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    btn.textContent = `Lv ${i + 1}`;
    btn.dataset.level = i;
    grid.appendChild(btn);
  }
}

function loadLevel(index) {
  const levelData = gameLevels[index];
  if (!levelData) return;

  // ✅ 更新 header 顯示的關卡編號
  document.querySelector('.levelNum').textContent = `Lv ${index + 1}`;

  // 歸零並關閉彈窗
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
  board.style.gridTemplateColumns = `repeat(${cols}, 60px)`; // 60px 可改為 CSS 變數

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
      cell.dataset.answer = String(i); // 正確答案是位置順序
      if (fixedIndices.includes(i)) {
        cell.classList.add('fixed');
        cell.dataset.fixed = 'true';
      }
    }

    board.appendChild(cell);
    closeMenu()
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
    if (cell && tile) {
      cell.appendChild(tile);
      cell.dataset.current = String(i); // 設定目前值方便檢查答案
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
  tile.dataset.index = String(index);
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
    document.getElementById('timer').textContent = elapsed.toFixed(1);
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
      if (draggedTile) moveTileToCell(draggedTile, cell);
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

// === 檢查是否通關 ===
function checkAnswer() {
  const cells = document.querySelectorAll('#board .cell'); // 只檢查作答區
  let correct = true;

  cells.forEach(cell => {
    if (cell.dataset.answer !== cell.dataset.current) correct = false;
  });

  if (correct) {
    showPopup(); // 顯示彈窗
    stopTimer?.(); // 如果有定時器函式
  }
}

// === 顯示 / 關閉彈窗 ===
function showPopup() {
  // 更新彈窗裡的數字
  document.getElementById('popup-step').textContent = stepCount;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  document.getElementById('popup-time').textContent = elapsed;

  const nextBtn = document.querySelector('#win-popup button[onclick="nextLevel()"]');
  if (currentLevel >= gameLevels.length - 1) {
    nextBtn.textContent = '回主選單';
  } else {
    nextBtn.textContent = '下一關';
  }

  // 顯示彈窗
  document.getElementById('win-popup').classList.remove('hidden');
}

function closePopup() {
  document.getElementById('win-popup').classList.add('hidden');
}

// 重啟遊戲（留在同一關）
function restartGame() {
  document.getElementById('win-popup').classList.add('hidden'); // 關閉彈窗

  // 歸零狀態
  stepCount = 0;
  hasStarted = false;
  clearInterval(timerInterval);
  document.getElementById('step-count').textContent = '0';
  document.getElementById('timer').textContent = '0.0';

  // 重新載入目前關卡
  loadLevel(currentLevel);
}

// 進下一關
function nextLevel() {
  if (currentLevel >= gameLevels.length - 1) {
    // 最後一關 → 回主選單
    openMenu();
  } else {
    currentLevel++;
    loadLevel(currentLevel);
  }
}

// === 工具函式 ===
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




// home 鍵控制回主畫面
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('main-menu');
  const btnMainMenu = document.getElementById('btn-main-menu');

  // 回主畫面按鈕
  btnMainMenu.addEventListener('click', () => {
    // 暫停計時（如果有）
    if (typeof stopTimer === 'function') stopTimer();

    // 顯示主畫面
    openMenu();
  });
});

function openMenu() {
  document.getElementById('main-menu').classList.remove('hidden');

  // 可選：阻擋底層遊戲操作（避免誤點）
  const panel = document.querySelector('.panel');
  if (panel) panel.style.pointerEvents = 'none';
}

function closeMenu() {
  document.getElementById('main-menu').classList.add('hidden');

  // 恢復底層遊戲操作
  const panel = document.querySelector('.panel');
  if (panel) panel.style.pointerEvents = 'auto';
}


// ===== 教學面板邏輯 =====
const TUTORIAL_STEPS = 4;
let tutorialIndex = 0;


function openTutorial() {
  tutorialIndex = 0;
  syncTutorialUI();
  document.getElementById('tutorial').classList.remove('hidden');
  document.getElementById('tutorial').setAttribute('aria-hidden', 'false');
}

function closeTutorial() {
  document.getElementById('tutorial').classList.add('hidden');
  document.getElementById('tutorial').setAttribute('aria-hidden', 'true');
}

function nextTutorial() {
  if (tutorialIndex < TUTORIAL_STEPS - 1) {
    tutorialIndex++;
    syncTutorialUI();
  } else {
    // 最後一頁 → 開始 Lv1
    closeTutorial();
    document.getElementById('main-menu').classList.add('hidden');
    currentLevel = 0;
    loadLevel(currentLevel);
    closeMenu();
  }
}

function prevTutorial() {
  if (tutorialIndex > 0) {
    tutorialIndex--;
    syncTutorialUI();
  }
}

function syncTutorialUI() {
  // 切換可見的 step
  document.querySelectorAll('.t-step').forEach((s, i) => {
    s.classList.toggle('active', i === tutorialIndex);
  });

  // dots（若不存在就建立；數量不對就重建一次）
  const dots = document.getElementById('tutorial-dots');
  if (dots) {
    if (dots.childElementCount !== TUTORIAL_STEPS) {
      dots.innerHTML = '';
      for (let i = 0; i < TUTORIAL_STEPS; i++) {
        const d = document.createElement('div');
        d.className = 'dot';
        dots.appendChild(d);
      }
    }
    dots.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === tutorialIndex);
    });
  }

  // 按鈕文案 / 狀態
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  if (prevBtn) {
    // ✅ 第一頁：直接隱藏，而不是 disabled（disabled 仍會佔位）
    const isFirst = tutorialIndex === 0;
    prevBtn.style.display = isFirst ? 'none' : '';
    prevBtn.setAttribute('aria-hidden', isFirst ? 'true' : 'false');
    //（可選）保險地同步 disabled 狀態
    prevBtn.disabled = isFirst;
  }

  if (nextBtn) {
    nextBtn.textContent = (tutorialIndex === TUTORIAL_STEPS - 1) ? '開始 Lv1' : '下一頁';
  }
}

// 綁定按鈕（你原本的 btn-tutorial 改成叫 openTutorial）
document.addEventListener('DOMContentLoaded', () => {
  const btnTutorial = document.getElementById('btn-tutorial');
  if (btnTutorial) btnTutorial.addEventListener('click', openTutorial);

  document.getElementById('tutorial-close').addEventListener('click', closeTutorial);
  document.getElementById('btn-prev').addEventListener('click', prevTutorial);
  document.getElementById('btn-next').addEventListener('click', nextTutorial);
});




// home 鍵控制回主畫面
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('main-menu');
  const btnMainMenu = document.getElementById('btn-main-menu');

  // 回主畫面按鈕
  btnMainMenu.addEventListener('click', () => {
    // 暫停計時（如果有）
    if (typeof stopTimer === 'function') stopTimer();

    // 顯示主畫面
    openMenu();
  });
});

function openMenu() {
  document.getElementById('main-menu').classList.remove('hidden');

  // 可選：阻擋底層遊戲操作（避免誤點）
  const panel = document.querySelector('.panel');
  if (panel) panel.style.pointerEvents = 'none';
}

function closeMenu() {
  document.getElementById('main-menu').classList.add('hidden');

  // 恢復底層遊戲操作
  const panel = document.querySelector('.panel');
  if (panel) panel.style.pointerEvents = 'auto';
}



// ===== RWD =====

function setRealVH(){
  const vh = window.innerHeight * 0.01; // 1vh 的 px 值
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}


// 讓 #game-stage 等比塞進 #game-wrap
const BASE_W = 360, BASE_H = 640;

function scaleStage(){
  const wrap = document.getElementById('game-wrap');
  const stage = document.getElementById('game-stage');
  const scale = Math.min(wrap.clientWidth / BASE_W, wrap.clientHeight / BASE_H);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener('resize', setRealVH); setRealVH();
window.addEventListener('resize', scaleStage);scaleStage();



function fitCanvas(canvas, w = BASE_W, h = BASE_H){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width  = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 座標仍用 CSS px
}
