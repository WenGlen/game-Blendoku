//______參數設定______//

const gameData = {
  rows: 3,
  cols: 3,
  fixedIndices: [0, 5], // 哪些格子是提示格
  colorOrder: [
    '#ffeecc', '#ffdd99', '#ffcc66',
    '#ffbb33', '#ffaa00', '#ee9900',
    '#dd8800', '#cc7700', '#bb6600'
  ] // index 為正確答案順序（由左到右上到下）
};

//等整個網頁載入後再執行遊戲
document.addEventListener('DOMContentLoaded', () => {
  startGame(gameData);
});

//______主流程組裝邏輯______//

// 初始化整個遊戲
function startGame(gameData) {
  const { rows, cols, fixedIndices, colorOrder } = gameData;
  const total = rows * cols;

  generateBoard(rows, cols, fixedIndices, colorOrder);// 傳入固定格資訊
  generateTiles(colorOrder, fixedIndices);// 傳入固定 tile 資訊
  setupDragAndDrop();
}


// 建立作答區格子
function generateBoard(rows, cols, fixedIndices = [], colorOrder = []) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${cols}, 60px)`;

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.answer = i.toString(); // 正確位置 = index
    if (fixedIndices.includes(i)) {
      cell.dataset.fixed = 'true';
      cell.classList.add('fixed');

      // 自動放入提示色塊（正確顏色）
      const tile = createTile(i, colorOrder[i], true);
      cell.appendChild(tile);
      cell.dataset.current = i.toString();
    }

    board.appendChild(cell);
  }
}

// 建立所有 tile，部分塞進固定提示格，其餘放在起始區
function generateTiles(colorOrder, fixedIndices = []) {
  const startArea = document.getElementById('start-area');
  startArea.innerHTML = '';

  const indices = []; // 儲存非固定格的 index

  // 先把哪些不是提示格記下來
  colorOrder.forEach((_, i) => {
    if (!fixedIndices.includes(i)) {
      indices.push(i);
    }
  });

  // 將 index 打亂 → 達到隨機排列顏色的目的
  shuffleArray(indices);

  // 依照打亂的 index 排列色塊
  indices.forEach(i => {
    const tile = createTile(i, colorOrder[i]);
    const wrapper = document.createElement('div');
    wrapper.classList.add('cell', 'initial');
    wrapper.appendChild(tile);
    startArea.appendChild(wrapper);
  });
}

function createTile(index, color, isFixed = false) {
  const tile = document.createElement('div');
  tile.classList.add('tile');
  tile.dataset.index = index.toString();
  tile.dataset.color = color;
  tile.style.backgroundColor = color;

  if (!isFixed) {
    tile.setAttribute('draggable', 'true');
  } else {
    tile.classList.add('fixed-tile');
    tile.setAttribute('draggable', 'false');
  }

  return tile;
}

  // 塞固定提示格
  fixedIndices.forEach(i => {
    const cell = document.querySelector(`#board .cell:nth-child(${i + 1})`);
    const tile = tiles[i];
    tile.setAttribute('draggable', 'false');
    tile.classList.add('fixed-tile');
    cell.appendChild(tile);
    cell.dataset.current = i.toString();
  });

  // 剩下的 tile 放到起始格
  tiles.forEach((tile, i) => {
    if (!fixedIndices.includes(i)) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('cell', 'initial');
      wrapper.appendChild(tile);
      startArea.appendChild(wrapper);
    }
  });



//______遊戲互動邏輯______//

// 負責設定拖曳邏輯的函數
function setupDragAndDrop() {
    const tiles = document.querySelectorAll('.tile'); // 所有色塊
    const cells = document.querySelectorAll('.cell'); // 所有格子（含題目格與初始格）

    //開始拖曳
    tiles.forEach(tile => {
        tile.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', tile.dataset.index);
        });
    });

    //釋放拖曳
    cells.forEach(cell => {
        cell.addEventListener('dragover', (e) => e.preventDefault());

        //根據釋放位置是否有色塊判斷要交換或不執行動作
        cell.addEventListener('drop', (e) => {
        e.preventDefault();

        const tileIndex = e.dataTransfer.getData('text/plain');
        const draggedTile = document.querySelector(`.tile[data-index="${tileIndex}"]`);
        const currentTileInCell = cell.querySelector('.tile');
        const originalParent = draggedTile.parentElement;

        // 固定提示格上不允許拖放
        if (cell.dataset.fixed === 'true') return;

        // 如果目標格已有其他 tile，就交換
        if (currentTileInCell) {
            originalParent.appendChild(currentTileInCell);
            if (originalParent.classList.contains('cell')) {
            originalParent.dataset.current = currentTileInCell.dataset.index;
            } else {
            delete originalParent.dataset.current;
            }
        } else {
            // 沒有交換，就清空原格的 current
            if (originalParent.classList.contains('cell')) {
            delete originalParent.dataset.current;
            }
        }

        // 將拖曳進來的 tile 放到新的 cell 中
        cell.innerHTML = '';
        cell.appendChild(draggedTile);
        cell.dataset.current = tileIndex;

        setTimeout(checkAnswer, 50); // 延遲以確保畫面已更新
        });
    });
}


// 檢查是否所有格子都擺對的函數
function checkAnswer() {
    const cells = document.querySelectorAll('#board .cell'); // 只檢查作答區格子
    let correct = true;

    cells.forEach(cell => {
        if (cell.dataset.answer !== cell.dataset.current) {
        correct = false;
        }
    });

    if (correct) {
        alert('正確！🎉');
  }
}


//______工具函式（輔助型小工具）______//

// 產生一組漸層顏色
function generateGradientColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = 30 + (i * 360 / count);
    colors.push(`hsl(${hue}, 80%, 60%)`);
  }
  return colors;
}

// 陣列亂數洗牌
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 取得 count 個不重複隨機索引
function getRandomIndices(total, count) {
  const indices = Array.from({ length: total }, (_, i) => i);
  shuffleArray(indices);
  return indices.slice(0, count);
}

