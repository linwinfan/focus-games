const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const TOTAL_ROUNDS = 5;

Page({
  data: {
    state: 'ready',
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    screenColor: 'waiting',
    phase: 'waiting',
    roundResultText: '',
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('reaction-time', 10);
    this.setData({ history });
    this.reactionTimes = [];
    this.falseStarts = 0;
    this.goTimeout = null;
    this.resultTimeout = null;
  },

  onStart() {
    this.reactionTimes = [];
    this.falseStarts = 0;
    this.setData({ state: 'playing', currentRound: 1 });
    this._startRound();
  },

  _startRound() {
    const { currentRound } = this.data;
    if (currentRound > TOTAL_ROUNDS) { this._onComplete(); return; }

    this.setData({ screenColor: 'waiting', phase: 'waiting' });

    // 随机等待 1-4s 后变绿
    const waitTime = 1000 + Math.random() * 3000;
    this.goTimeout = setTimeout(() => {
      this.setData({ screenColor: 'go', phase: 'go' });
      this.responseTimer = new Timer();
      this.responseTimer.start();
    }, waitTime);
  },

  onTap() {
    const { phase, currentRound } = this.data;

    if (phase === 'waiting') {
      // 抢按
      clearTimeout(this.goTimeout);
      this.falseStarts++;
      this.setData({ phase: 'falseStart' });
      getApp().globalData.audioManager.playFail();

      // 1.5s 后重试本轮
      this.resultTimeout = setTimeout(() => {
        this._startRound();
      }, 1500);
    } else if (phase === 'go') {
      const reactionTime = this.responseTimer.getElapsed();
      this.reactionTimes.push(reactionTime);
      getApp().globalData.audioManager.playSuccess();

      this.setData({
        phase: 'result',
        roundResultText: `${reactionTime}ms`
      });

      // 1.5s 后进入下一轮
      this.resultTimeout = setTimeout(() => {
        this.setData({ currentRound: currentRound + 1 });
        this._startRound();
      }, 1500);
    }
  },

  _onComplete() {
    const avgTime = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;

    storage.saveResult('reaction-time', {
      score: avgTime / 1000,
      duration: this.reactionTimes.reduce((a, b) => a + b, 0),
      accuracy: 1,
      details: { avgReactionTime: Math.round(avgTime), falseStarts: this.falseStarts }
    });

    const stats = storage.getStats('reaction-time');
    const best = storage.getBest('reaction-time');
    const history = storage.getHistory('reaction-time', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${Math.round(avgTime)}ms`,
        bestText: best ? `${Math.round(best.score * 1000)}ms` : '-',
        duration: this.reactionTimes.reduce((a, b) => a + b, 0),
        accuracy: 1, trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() {
    clearTimeout(this.goTimeout);
    clearTimeout(this.resultTimeout);
  }
});
