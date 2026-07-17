const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const COLORS = ['#4A90D9', '#FF6B6B', '#52C41A', '#FAAD14', '#7B68EE'];
const SHAPES = ['circle', 'triangle', 'square'];
const TIME_LIMIT = 5000; // 每关 5s
const BASE_ITEMS = 10;

Page({
  data: {
    state: 'ready',
    level: 1,
    items: [],
    normalColor: '#4A90D9',
    targetColor: '#FF6B6B',
    timerDisplay: '',
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('visual-search', 10);
    this.setData({ history });
    this.totalItems = 0;
    this.totalCorrect = 0;
    this.levelTimer = null;
    this.countdown = null;
  },

  onStart() {
    this.totalItems = 0;
    this.totalCorrect = 0;
    this.setState('playing', 1);
    this._startLevel(1);
  },

  setState(state, level) {
    this.setData({ state, level });
  },

  _startLevel(level) {
    const itemCount = BASE_ITEMS + (level - 1) * 5;
    const targetIndex = Math.floor(Math.random() * itemCount);
    const normalColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    let targetColor;
    do {
      targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (targetColor === normalColor);

    const items = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      isTarget: i === targetIndex,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]
    }));

    this.setData({ items, normalColor, targetColor });

    // 开始计时
    this.levelTimer = new Timer();
    this.levelTimer.start();
    this.countdown = setInterval(() => {
      const elapsed = this.levelTimer.getElapsed();
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      this.setData({ timerDisplay: `${(remaining / 1000).toFixed(1)}s` });
      if (remaining <= 0) {
        this._onComplete();
      }
    }, 100);
  },

  onItemTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.items[index];
    this.totalItems++;

    clearInterval(this.countdown);

    if (item.isTarget) {
      // 正确
      this.totalCorrect++;
      getApp().globalData.audioManager.playSuccess();
      this._startLevel(this.data.level + 1);
    } else {
      // 错误
      getApp().globalData.audioManager.playFail();
      this._onComplete();
    }
  },

  _onComplete() {
    clearInterval(this.countdown);
    const totalTime = this.levelTimer ? this.levelTimer.getElapsed() : 0;
    const maxLevel = this.data.level;
    const accuracy = this.totalItems > 0 ? this.totalCorrect / this.totalItems : 0;

    storage.saveResult('visual-search', {
      score: maxLevel,
      duration: totalTime,
      accuracy,
      details: { level: maxLevel, totalTime, accuracy }
    });

    const stats = storage.getStats('visual-search');
    const best = storage.getBest('visual-search');
    const history = storage.getHistory('visual-search', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `第${maxLevel}关`,
        bestText: best ? `第${best.score}关` : '-',
        duration: totalTime,
        accuracy,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() {
    clearInterval(this.countdown);
    if (this.levelTimer) this.levelTimer.reset();
  }
});
