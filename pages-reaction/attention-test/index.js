const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const TOTAL_ROUNDS = 20;
const GO_PROBABILITY = 0.75;
const MAX_RESPONSE_TIME = 1000; // ms

Page({
  data: {
    state: 'ready',
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    showStimulus: false,
    waiting: false,
    stimulusType: '',
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('attention-test', 10);
    this.setData({ history });
    this.results = []; // { type: 'go'|'no-go', correct: bool, responseTime: number }
    this.stimulusTimeout = null;
    this.responseTimer = null;
  },

  onStart() {
    this.results = [];
    this.setData({ state: 'playing', currentRound: 1 });
    this._nextRound();
  },

  _nextRound() {
    const { currentRound } = this.data;
    if (currentRound > TOTAL_ROUNDS) { this._onComplete(); return; }

    this.setData({ waiting: true, showStimulus: false });

    // 随机等待 800-2000ms
    const waitTime = 800 + Math.random() * 1200;
    this.stimulusTimeout = setTimeout(() => {
      const isGo = Math.random() < GO_PROBABILITY;
      this.setData({
        waiting: false,
        showStimulus: true,
        stimulusType: isGo ? 'go' : 'no-go'
      });

      // 启动响应计时器
      this.responseTimer = new Timer();
      this.responseTimer.start();

      // 如果 1s 内没反应（仅 Go 情况），自动判定为漏判
      if (isGo) {
        this.stimulusTimeout = setTimeout(() => {
          if (this.data.showStimulus) {
            this.results.push({ type: 'go', correct: false, responseTime: MAX_RESPONSE_TIME });
            this.setData({ currentRound: this.data.currentRound + 1 });
            this._nextRound();
          }
        }, MAX_RESPONSE_TIME);
      } else {
        // No-Go 情况，1s 内没点击算正确
        this.stimulusTimeout = setTimeout(() => {
          if (this.data.showStimulus) {
            this.results.push({ type: 'no-go', correct: true, responseTime: MAX_RESPONSE_TIME });
            this.setData({ currentRound: this.data.currentRound + 1 });
            this._nextRound();
          }
        }, MAX_RESPONSE_TIME);
      }
    }, waitTime);
  },

  onTap() {
    if (!this.data.showStimulus || this.data.stimulusType !== 'go') return;

    clearTimeout(this.stimulusTimeout);
    const responseTime = this.responseTimer.getElapsed();
    this.results.push({ type: 'go', correct: true, responseTime });
    getApp().globalData.audioManager.playSuccess();

    this.setData({ currentRound: this.data.currentRound + 1 });
    this._nextRound();
  },

  _onComplete() {
    // 计算结果
    const goResults = this.results.filter(r => r.type === 'go');
    const noGoResults = this.results.filter(r => r.type === 'no-go');

    const goCorrect = goResults.filter(r => r.correct).length;
    const noGoCorrect = noGoResults.filter(r => r.correct).length;

    const goAccuracy = goResults.length > 0 ? goCorrect / goResults.length : 0;
    const noGoAccuracy = noGoResults.length > 0 ? noGoCorrect / noGoResults.length : 0;
    const overallAccuracy = (goCorrect + noGoCorrect) / this.results.length;

    const goResponseTimes = goResults.filter(r => r.correct).map(r => r.responseTime);
    const avgResponseTime = goResponseTimes.length > 0
      ? goResponseTimes.reduce((a, b) => a + b, 0) / goResponseTimes.length
      : 0;

    storage.saveResult('attention-test', {
      score: avgResponseTime / 1000,
      duration: this.results.reduce((sum, r) => sum + r.responseTime, 0),
      accuracy: overallAccuracy,
      details: { goAccuracy, noGoAccuracy, avgReactionTime: Math.round(avgResponseTime) }
    });

    const stats = storage.getStats('attention-test');
    const best = storage.getBest('attention-test');
    const history = storage.getHistory('attention-test', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${Math.round(overallAccuracy * 100)}%`,
        bestText: best ? `${(best.accuracy * 100).toFixed(0)}%` : '-',
        duration: this.results.reduce((sum, r) => sum + r.responseTime, 0),
        accuracy: overallAccuracy,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { clearTimeout(this.stimulusTimeout); if (this.responseTimer) this.responseTimer.reset(); }
});
