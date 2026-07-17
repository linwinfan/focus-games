const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const COLORS = [
  { label: '红', value: '#FF4D4F' },
  { label: '蓝', value: '#4A90D9' },
  { label: '绿', value: '#52C41A' },
  { label: '黄', value: '#FAAD14' }
];

const TOTAL_ROUNDS = 20;

Page({
  data: {
    state: 'ready',
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    currentWord: { text: '', color: '' },
    colorOptions: COLORS,
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('reverse-stroop', 10);
    this.setData({ history });
    this.reactionTimes = [];
  },

  onStart() {
    this.reactionTimes = [];
    this.setData({ state: 'playing', currentRound: 1 });
    this._nextRound();
  },

  _nextRound() {
    const { currentRound } = this.data;
    if (currentRound > TOTAL_ROUNDS) { this._onComplete(); return; }

    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    this.setData({ currentWord: { text: textColor.label, color: wordColor.value } });
    this.roundTimer = new Timer();
    this.roundTimer.start();
  },

  onColorTap(e) {
    const selectedLabel = e.currentTarget.dataset.label;
    const roundTime = this.roundTimer.getElapsed();
    this.reactionTimes.push(roundTime);

    // 反向规则：选择的内容 == 文字内容（不是颜色）
    if (selectedLabel === this.data.currentWord.text) {
      getApp().globalData.audioManager.playSuccess();
    } else {
      getApp().globalData.audioManager.playFail();
    }

    this.setData({ currentRound: this.data.currentRound + 1 });
    this._nextRound();
  },

  _onComplete() {
    const avgReactionTime = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
    storage.saveResult('reverse-stroop', {
      score: avgReactionTime / 1000,
      duration: this.reactionTimes.reduce((a, b) => a + b, 0),
      accuracy: 1,
      details: { rounds: TOTAL_ROUNDS, avgReactionTime: Math.round(avgReactionTime) }
    });
    const stats = storage.getStats('reverse-stroop');
    const best = storage.getBest('reverse-stroop');
    const history = storage.getHistory('reverse-stroop', 10);
    getApp().globalData.audioManager.playComplete();
    this.setData({
      state: 'finished',
      result: {
        scoreText: `${(avgReactionTime / 1000).toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration: this.reactionTimes.reduce((a, b) => a + b, 0),
        accuracy: 1, trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { if (this.roundTimer) this.roundTimer.reset(); }
});
