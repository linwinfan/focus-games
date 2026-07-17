const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const GRID_OPTIONS = [
  { label: '3x3', value: 3 },
  { label: '4x4', value: 4 },
  { label: '5x5', value: 5 },
  { label: '6x6', value: 6 },
  { label: '7x7', value: 7 }
];

Page({
  data: {
    state: 'ready',
    gridSize: 5,
    gridData: [],
    currentNumber: 25,
    timerDisplay: '0.00s',
    bestTime: 0,
    result: {},
    history: [],
    gridOptions: GRID_OPTIONS
  },

  onLoad() {
    const best = storage.getBest('reverse-schulte');
    const history = storage.getHistory('reverse-schulte', 10);
    this.setData({ bestTime: best ? best.score : 0, history });
    this.timer = new Timer();
    this.updateInterval = null;
  },

  onGridChange(e) {
    const size = e.detail.value;
    this.setData({ gridSize: size, currentNumber: size * size });
  },

  onStart() {
    const { gridSize } = this.data;
    const total = gridSize * gridSize;
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    const gridData = numbers.map(n => ({ value: n, found: false }));

    this.setData({
      state: 'playing',
      gridData,
      currentNumber: total,
      timerDisplay: '0.00s'
    });
    this._startTimer();
  },

  _startTimer() {
    this.timer.start();
    this.updateInterval = setInterval(() => {
      this.setData({ timerDisplay: `${this.timer.getElapsedSeconds().toFixed(2)}s` });
    }, 100);
  },

  _stopTimer() {
    clearInterval(this.updateInterval);
    this.timer.pause();
  },

  onCellTap(e) {
    const { gridData, currentNumber } = this.data;
    const value = e.currentTarget.dataset.value;
    const cell = gridData.find(c => c.value === value);

    if (value === currentNumber) {
      cell.found = true;
      getApp().globalData.audioManager.playSuccess();
      if (currentNumber === 1) {
        this._onComplete();
      } else {
        this.setData({ gridData: [...gridData], currentNumber: currentNumber - 1 });
      }
    } else {
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'light' });
    }
  },

  _onComplete() {
    this._stopTimer();
    const duration = this.timer.getElapsed();
    const score = duration / 1000;
    storage.saveResult('reverse-schulte', {
      score, duration, accuracy: 1,
      details: { gridSize: this.data.gridSize, mode: 'reverse', errors: 0 }
    });
    const stats = storage.getStats('reverse-schulte');
    const best = storage.getBest('reverse-schulte');
    const history = storage.getHistory('reverse-schulte', 10);
    getApp().globalData.audioManager.playComplete();
    this.setData({
      state: 'finished',
      result: {
        scoreText: `${score.toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration, accuracy: 1, trend: stats.trend
      },
      history, bestTime: best ? best.score : 0
    });
  },

  onReplay() { this.timer.reset(); this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { this._stopTimer(); this.timer.reset(); }
});
