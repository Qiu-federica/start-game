const config = {
  rows: 10,
  cols: 10,
  colors: ['#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb', '#d4fc79'],
  baseScore: 5,
  initHints: 3
};

class AudioManager {
  constructor() {
    this.audio = document.getElementById('bgMusic');
    this.musicToggle = document.getElementById('musicToggle');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.musicIndicator = document.getElementById('musicIndicator');
    this.isPlaying = false;
    this.volume = 0.5;
    this.isMuted = false;

    this.init();
  }

  init() {
    this.audio.volume = this.volume;

    this.volumeSlider.addEventListener('input', (e) => {
      this.volume = parseFloat(e.target.value);
      this.audio.volume = this.volume;
      this.updateUI();
    });

    this.musicToggle.addEventListener('click', () => {
      this.toggleMusic();
    });

    this.attempAutoPlay();
  }





  attempAutoPlay() {
    setTimeout(() => {
      this.play().catch(error => {
        console.log("被阻止，等待用户交互：", error);
        this.showPlayHint();
      });
    }, 1000);
  }

  showPlayHint() {
    this.musicIndicator.innerHTML = '<span class="icon">🔇</span><span>点击任意位置播放音乐</span>';
    this.musicIndicator.style.color = "#ff6b6b";

    const startOnClick = () => {
      this.play().catch(console.error);
      this.musicIndicator.innerHTML = '<span class="icon">🎵</span><span>背景音乐播放中...</span>';
      this.musicIndicator.style.color = "rgba(255,255,255,0.7)";
      document.removeEventListener('click', startOnClick);

    };

    document.addEventListener('click', startOnClick);


  }

  play() {
    return this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateUI();
      return true;
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updateUI();
  }


  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.updateUI();
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.pause();

    } else {
      this.play().catch(console.error);
    }
  }


  updateUI() {
    this.musicToggle.textContent = this.isPlaying ? '🔊' : '🔇';
    this.musicToggle.title = this.isPlaying ? '暂停音乐' : '播放音乐';

    this.volumeSlider.value = this.volume;

    if (this.isPlaying) {
      this.musicIndicator.innerHTML = '<span class="icon">🎵</span><span>背景音乐播放中...</span>';
      this.musicIndicator.style.color = "rgba(255, 255, 255, 0.7)";
    } else {
      this.musicIndicator.innerHTML = '<span class="icon">🔇</span><span>音乐已暂停</span>';
      this.musicIndicator.style.color = "#888";
    }

  }

}

const audioManager = new AudioManager();


// 游戏状态
const gameState = {
  board: [],
  score: 0,
  starsCount: config.rows * config.cols,
  level: 1,
  hintsLeft: config.initHints,
  isGameOver: false
};

// DOM元素
const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.querySelector('.score');
const starsCountElement = document.querySelector('.stars-count');
const levelElement = document.querySelector('.level');
const restartBtn = document.getElementById('restart');
const hintBtn = document.getElementById('hint');
const backToMenuBtn = document.getElementById('backToMenu');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartGameBtn = document.getElementById('restartGame');
const menuAfterGameBtn = document.getElementById('menuAfterGame');

// 创建背景粒子
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

createParticles();

// 初始化游戏
function initGame() {
  // 重置游戏状态
  gameState.score = 0;
  gameState.starsCount = config.rows * config.cols;
  gameState.level = 1;
  gameState.hintsLeft = config.initHints;
  gameState.isGameOver = false;

  // 更新UI
  updateUI();

  // 隐藏游戏结束界面
  gameOverScreen.style.display = 'none';

  // 清空游戏棋盘
  gameBoard.innerHTML = '';

  // 设置游戏棋盘样式
  gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

  // 生成初始棋盘
  generateBoard();

  // 渲染棋盘
  renderBoard();

  // 更新提示按钮文本
  hintBtn.textContent = `提示 (${gameState.hintsLeft})`;
}

// 开始游戏（切换界面）
function startGame() {
  const loading = document.getElementById('loadingOverlay');
  const mainMenu = document.getElementById('mainMenu');
  const gameScreen = document.getElementById('gameScreen');

  // 显示加载动画
  loading.classList.add('show');

  // 模拟加载时间
  setTimeout(() => {
    // 隐藏加载动画
    loading.classList.remove('show');

    // 切换界面
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');

    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('active');

    // 初始化游戏
    initGame();
  }, 500);
}

// 返回主菜单
function backToMenu() {
  const mainMenu = document.getElementById('mainMenu');
  const gameScreen = document.getElementById('gameScreen');

  audioManager.play().catch(console.error);

  // 切换界面
  gameScreen.classList.remove('active');
  gameScreen.classList.add('hidden');

  mainMenu.classList.remove('hidden');
  mainMenu.classList.add('active');
}

// 生成随机棋盘
function generateBoard() {
  gameState.board = [];

  for (let row = 0; row < config.rows; row++) {
    gameState.board[row] = [];
    for (let col = 0; col < config.cols; col++) {
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      gameState.board[row][col] = {
        color: config.colors[colorIndex],
        isEmpty: false
      };
    }
  }

  ensureValidBoard();
}

// 确保棋盘有可消除的星星
function ensureValidBoard() {
  let hasValidMove = false;

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (gameState.board[row][col].isEmpty) continue;

      const currentColor = gameState.board[row][col].color;

      if (col < config.cols - 1 && !gameState.board[row][col + 1].isEmpty &&
        gameState.board[row][col + 1].color === currentColor) {
        hasValidMove = true;
        break;
      }

      if (row < config.rows - 1 && !gameState.board[row + 1][col].isEmpty &&
        gameState.board[row + 1][col].color === currentColor) {
        hasValidMove = true;
        break;
      }
    }
    if (hasValidMove) break;
  }

  if (!hasValidMove) {
    generateBoard();
  }
}

// 渲染棋盘
function renderBoard() {
  gameBoard.innerHTML = '';

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cell = gameState.board[row][col];
      const cellElement = document.createElement('div');
      cellElement.className = 'cell';
      cellElement.dataset.row = row;
      cellElement.dataset.col = col;

      if (cell.isEmpty) {
        cellElement.style.backgroundColor = 'transparent';
        cellElement.style.boxShadow = 'none';
        cellElement.style.cursor = 'default';
      } else {
        cellElement.style.backgroundColor = cell.color;

        const starInner = document.createElement('div');
        starInner.className = 'star';
        cellElement.appendChild(starInner);

        cellElement.addEventListener('click', () => handleCellClick(row, col));
      }
      gameBoard.appendChild(cellElement);
    }
  }
}

// 处理单元格点击
function handleCellClick(row, col) {
  if (gameState.isGameOver) return;

  const cell = gameState.board[row][col];
  if (cell.isEmpty) return;

  const group = findConnectedGroup(row, col, cell.color);

  if (group.length >= 2) {
    removeGroup(group);

    const points = group.length * group.length * config.baseScore;
    gameState.score += points;

    gameState.starsCount -= group.length;

    gameState.level = Math.floor(gameState.score / 1000) + 1;

    updateUI();

    renderBoard();

    checkGameOver();
  } else {
    highlightCell(row, col);
  }
}

// 高亮显示单个单元格
function highlightCell(row, col) {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => cell.classList.remove('selected'));

  const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cellElement) {
    cellElement.classList.add('selected');

    setTimeout(() => {
      cellElement.classList.remove('selected');
    }, 1000);
  }
}

// 查找相邻的同色星星组
function findConnectedGroup(startRow, startCol, color) {
  const group = [];
  const visited = Array(config.rows).fill().map(() => Array(config.cols).fill(false));
  const stack = [[startRow, startCol]];

  while (stack.length > 0) {
    const [row, col] = stack.pop();

    if (row < 0 || row >= config.rows || col < 0 || col >= config.cols) continue;
    if (visited[row][col]) continue;
    if (gameState.board[row][col].isEmpty) continue;
    if (gameState.board[row][col].color !== color) continue;

    visited[row][col] = true;
    group.push([row, col]);

    stack.push([row - 1, col]);
    stack.push([row + 1, col]);
    stack.push([row, col - 1]);
    stack.push([row, col + 1]);
  }
  return group;
}

// 移除星星组
function removeGroup(group) {
  group.forEach(([row, col]) => {
    gameState.board[row][col].isEmpty = true;
  });

  applyGravity();
  shiftColumns();
}

// 应用重力，使星星下落
function applyGravity() {
  for (let col = 0; col < config.cols; col++) {
    let emptySpaces = 0;

    for (let row = config.rows - 1; row >= 0; row--) {
      if (gameState.board[row][col].isEmpty) {
        emptySpaces++;
      } else if (emptySpaces > 0) {
        gameState.board[row + emptySpaces][col] = { ...gameState.board[row][col] };
        gameState.board[row][col].isEmpty = true;
      }
    }
  }
}

// 左移星星列
function shiftColumns() {
  let emptyColumns = 0;

  for (let col = 0; col < config.cols; col++) {
    let isEmptyColumn = true;
    for (let row = 0; row < config.rows; row++) {
      if (!gameState.board[row][col].isEmpty) {
        isEmptyColumn = false;
        break;
      }
    }

    if (isEmptyColumn) {
      emptyColumns++;
    } else if (emptyColumns > 0) {
      for (let row = 0; row < config.rows; row++) {
        gameState.board[row][col - emptyColumns] = { ...gameState.board[row][col] };
        gameState.board[row][col].isEmpty = true;
      }
    }
  }
}

// 检查游戏是否结束
function checkGameOver() {
  let hasValidMove = false;

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (gameState.board[row][col].isEmpty) continue;

      const currentColor = gameState.board[row][col].color;

      if (col < config.cols - 1 && !gameState.board[row][col + 1].isEmpty &&
        gameState.board[row][col + 1].color === currentColor) {
        hasValidMove = true;
        break;
      }

      if (row < config.rows - 1 && !gameState.board[row + 1][col].isEmpty &&
        gameState.board[row + 1][col].color === currentColor) {
        hasValidMove = true;
        break;
      }
    }
    if (hasValidMove) break;
  }

  if (!hasValidMove) {
    gameState.isGameOver = true;
    showGameOver();
  }
}

// 显示游戏结束界面
function showGameOver() {
  finalScoreElement.textContent = gameState.score;
  gameOverScreen.style.display = 'flex';
}

// 更新UI
function updateUI() {
  scoreElement.textContent = gameState.score;
  starsCountElement.textContent = gameState.starsCount;
  levelElement.textContent = gameState.level;
}

// 提示功能
function showHint() {
  if (gameState.hintsLeft <= 0 || gameState.isGameOver) return;

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (gameState.board[row][col].isEmpty) continue;

      const color = gameState.board[row][col].color;
      const group = findConnectedGroup(row, col, color);

      if (group.length >= 2) {
        group.forEach(([r, c]) => {
          const cellElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
          if (cellElement) {
            cellElement.classList.add('selected');
          }
        });

        setTimeout(() => {
          group.forEach(([r, c]) => {
            const cellElement = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cellElement) {
              cellElement.classList.remove('selected');
            }
          });
        }, 2000);

        gameState.hintsLeft--;
        hintBtn.textContent = `提示 (${gameState.hintsLeft})`;

        return;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  } else {
    console.error("error:can't find button");
  }
});

// 事件监听
restartBtn.addEventListener('click', initGame);
restartGameBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', showHint);
backToMenuBtn.addEventListener('click', backToMenu);
menuAfterGameBtn.addEventListener('click', backToMenu);