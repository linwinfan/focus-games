const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const GRID_OPTIONS = [
  { label: '3x3', value: 3 },
  { label: '4x4', value: 4 },
  { label: '5x5', value: 5 },
  { label: '6x6', value: 6 },
  { label: '7x7', value: 7 },
  { label: '8x8', value: 8 },
  { label: '9x9', value: 9 },
  { label: '10x10', value: 10 }
];

const MODE_OPTIONS = [
  { label: '顺序', value: 'sequential' },
  { label: '反向', value: 'reverse' },
  { label: '限时', value: 'timed' }
];

Page({
  data: {
    state: 'ready',
    gridSize: 5,
    mode: 'sequential',
    gridData: [],
    currentNumber: 1,
    totalNumbers: 25,
    timerDisplay: '0.00s',
    bestTime: 0,
    result: {},
    history: [],
    gridOptions: GRID_OPTIONS,
    modeOptions: MODE_OPTIONS
  },

  onLoad() {
    const best = storage.getBest('schulte-table');
    const history = storage.getHistory('schulte-table', 10);
    this.setData({
      bestTime: best ? best.score : 0,
      history
    });

    this.timer = new Timer();
    this.updateInterval = null;
  },

  onGridChange(e) {
    const size = e.detail.value;
    this.setData({
      gridSize: size,
      totalNumbers: size * size
    });
  },

  onModeChange(e) {
    this.setData({ mode: e.detail.value });
  },

  onStart() {
    const { gridSize, mode } = this.data;
    const total = gridSize * gridSize;

    // 生成并打乱数字
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    if (mode === 'reverse') {
      numbers.reverse();
    }
    // 随机打乱位置
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    const gridData = numbers.map(n => ({ value: n, found: false }));

    this.setData({
      state: 'playing',
      gridData,
      currentNumber: mode === 'reverse' ? total : 1,
      totalNumbers: total,
      timerDisplay: '0.00s'
    });

    this._startTimer();
  },

  _startTimer() {
    this.timer.start();
    this.updateInterval = setInterval(() => {
      this.setData({
        timerDisplay: `${this.timer.getElapsedSeconds().toFixed(2)}s`
      });
    }, 100);
  },

  _stopTimer() {
    clearInterval(this.updateInterval);
    this.timer.pause();
  },

  onCellTap(e) {
    const { gridData, currentNumber, mode } = this.data;
    const value = e.currentTarget.dataset.value;

    const cell = gridData.find(c => c.value === value);

    if (value === currentNumber) {
      // 正确
      cell.found = true;
      const nextNum = mode === 'reverse' ? currentNumber - 1 : currentNumber + 1;

      getApp().globalData.audioManager.playSuccess();

      if ((mode === 'reverse' && currentNumber === 1) ||
          (mode !== 'reverse' && currentNumber === this.data.totalNumbers)) {
        // 完成
        this._onComplete();
      } else {
        this.setData({ gridData: [...gridData], currentNumber: nextNum });
      }
    } else {
      // 错误
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'light' });
    }
  },

  _onComplete() {
    this._stopTimer();
    const duration = this.timer.getElapsed();
    const score = duration / 1000;

    // 保存记录
    storage.saveResult('schulte-table', {
      score,
      duration,
      accuracy: 1,
      details: {
        gridSize: this.data.gridSize,
        mode: this.data.mode,
        errors: 0
      }
    });

    const stats = storage.getStats('schulte-table');
    const best = storage.getBest('schulte-table');
    const history = storage.getHistory('schulte-table', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${score.toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration,
        accuracy: 1,
        trend: stats.trend
      },
      history,
      bestTime: best ? best.score : 0
    });
  },

  onReplay() {
    this.timer.reset();
    this.setData({ state: 'ready' });
  },

  onShare() {
    wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' });
  },

  onUnload() {
    this._stopTimer();
    this.timer.reset();
  }
});
