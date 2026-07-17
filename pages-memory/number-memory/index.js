const storage = require('../../utils/storage.js');

const SHOW_TIME = 3000; // 显示 3s

Page({
  data: {
    state: 'ready',
    level: 1,
    phase: 'show',
    phaseText: '记住数字',
    currentNumber: '',
    userInput: '',
    numpadRows: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [0]
    ],
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('number-memory', 10);
    this.setData({ history });
    this.showTimeout = null;
  },

  onStart() {
    this.setData({ state: 'playing', level: 1 });
    this._startLevel(1);
  },

  _startLevel(level) {
    // 生成 level 位数字
    let number = '';
    for (let i = 0; i < level + 2; i++) {
      number += Math.floor(Math.random() * 10);
    }

    this.currentNumber = number;
    this.setData({
      level,
      currentNumber: number,
      phase: 'show',
      phaseText: '记住数字',
      userInput: ''
    });

    // 3s 后切换输入
    this.showTimeout = setTimeout(() => {
      this.setData({ phase: 'input', phaseText: '输入数字' });
    }, SHOW_TIME);
  },

  onNumTap(e) {
    if (this.data.phase !== 'input') return;
    if (this.data.userInput.length >= this.currentNumber.length) return;
    const num = e.currentTarget.dataset.num;
    this.setData({ userInput: this.data.userInput + num });
  },

  onClearTap() {
    if (this.data.phase !== 'input') return;
    this.setData({ userInput: '' });
  },

  onSubmitTap() {
    if (this.data.phase !== 'input') return;
    if (this.data.userInput !== this.currentNumber) {
      // 错误
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'medium' });
      this._onComplete();
    } else {
      // 正确
      getApp().globalData.audioManager.playSuccess();
      this.setData({ phaseText: '正确!' });
      this.showTimeout = setTimeout(() => {
        this._startLevel(this.data.level + 1);
      }, 500);
    }
  },

  _onComplete() {
    const maxDigits = this.data.level + 1;

    storage.saveResult('number-memory', {
      score: maxDigits,
      duration: 0,
      accuracy: 1,
      details: { maxDigits }
    });

    const stats = storage.getStats('number-memory');
    const best = storage.getBest('number-memory');
    const history = storage.getHistory('number-memory', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${maxDigits}位`,
        bestText: best ? `${best.score}位` : '-',
        duration: 0,
        accuracy: 1,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { clearTimeout(this.showTimeout); }
});
