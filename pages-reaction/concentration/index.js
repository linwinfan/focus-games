const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const PHASE_DURATION = 60; // 每阶段 60s
const TOTAL_PHASES = 3;

Page({
  data: {
    state: 'ready',
    currentPhase: 1,
    phaseName: 'Go/No-Go',
    remainingTime: PHASE_DURATION,
    showStimulus: false,
    waiting: false,
    stimulusType: '',
    phase2State: 'waiting',
    phase2Result: '',
    searchItems: [],
    normalColor: '#4A90D9',
    targetColor: '#FF6B6B',
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('concentration', 10);
    this.setData({ history });
    this.allResults = [];
    this.gameTimer = null;
    this.phaseTimeout = null;
  },

  onStart() {
    this.allResults = [];
    this.setData({ state: 'playing', currentPhase: 1, phaseName: 'Go/No-Go' });
    this._startPhase(1);
  },

  _startPhase(phase) {
    this.setData({ remainingTime: PHASE_DURATION });
    const endTime = Date.now() + PHASE_DURATION * 1000;

    this.gameTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      this.setData({ remainingTime: remaining });
      if (remaining <= 0) {
        clearInterval(this.gameTimer);
        if (phase < TOTAL_PHASES) {
          this._startPhase(phase + 1);
        } else {
          this._onComplete();
        }
      }
    }, 200);

    if (phase === 1) {
      this.setData({ currentPhase: 1, phaseName: 'Go/No-Go' });
      this._phase1Tick();
    } else if (phase === 2) {
      this.setData({ currentPhase: 2, phaseName: '反应时' });
      this._phase2Tick();
    } else if (phase === 3) {
      this.setData({ currentPhase: 3, phaseName: '视觉搜索' });
      this._phase3Setup();
    }
  },

  // === 阶段 1: Go/No-Go ===
  _phase1Tick() {
    this.setData({ waiting: true, showStimulus: false });
    const waitTime = 800 + Math.random() * 1200;
    this.phaseTimeout = setTimeout(() => {
      if (this.data.currentPhase !== 1) return;
      const isGo = Math.random() < 0.75;
      this.setData({ waiting: false, showStimulus: true, stimulusType: isGo ? 'go' : 'no-go' });
      this.responseTimer = new Timer();
      this.responseTimer.start();

      this.phaseTimeout = setTimeout(() => {
        if (this.data.currentPhase !== 1) return;
        if (isGo) {
          this.allResults.push({ correct: false });
        } else {
          this.allResults.push({ correct: true });
        }
        this._phase1Tick();
      }, 1000);
    }, waitTime);
  },

  onTap() {
    if (this.data.currentPhase === 1 && this.data.showStimulus && this.data.stimulusType === 'go') {
      clearTimeout(this.phaseTimeout);
      this.allResults.push({ correct: true });
      getApp().globalData.audioManager.playSuccess();
      this._phase1Tick();
    } else if (this.data.currentPhase === 2 && this.data.phase2State === 'waiting') {
      // 抢按
      this.setData({ phase2State: 'result', phase2Result: '抢按!' });
      getApp().globalData.audioManager.playFail();
      this.phaseTimeout = setTimeout(() => {
        if (this.data.currentPhase === 2) this._phase2Tick();
      }, 1000);
    } else if (this.data.currentPhase === 2 && this.data.phase2State === 'go') {
      const rt = this.responseTimer.getElapsed();
      this.allResults.push({ correct: true, responseTime: rt });
      this.setData({ phase2State: 'result', phase2Result: `${rt}ms` });
      getApp().globalData.audioManager.playSuccess();
      this.phaseTimeout = setTimeout(() => {
        if (this.data.currentPhase === 2) this._phase2Tick();
      }, 800);
    }
  },

  // === 阶段 2: 反应时 ===
  _phase2Tick() {
    this.setData({ phase2State: 'waiting' });
    const waitTime = 1000 + Math.random() * 2000;
    this.phaseTimeout = setTimeout(() => {
      if (this.data.currentPhase !== 2) return;
      this.setData({ phase2State: 'go' });
      this.responseTimer = new Timer();
      this.responseTimer.start();
    }, waitTime);
  },

  // === 阶段 3: 视觉搜索 ===
  _phase3Setup() {
    const itemCount = 12;
    const targetIndex = Math.floor(Math.random() * itemCount);
    const items = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      isTarget: i === targetIndex
    }));
    this.setData({ searchItems: items, normalColor: '#4A90D9', targetColor: '#FF6B6B' });
  },

  onSearchTap(e) {
    if (this.data.currentPhase !== 3) return;
    const index = e.currentTarget.dataset.index;
    const item = this.data.searchItems[index];
    if (item.isTarget) {
      this.allResults.push({ correct: true });
      getApp().globalData.audioManager.playSuccess();
      this._phase3Setup(); // 下一题
    } else {
      this.allResults.push({ correct: false });
      getApp().globalData.audioManager.playFail();
    }
  },

  _onComplete() {
    const correctCount = this.allResults.filter(r => r.correct).length;
    const accuracy = this.allResults.length > 0 ? correctCount / this.allResults.length : 0;
    const responseTimes = this.allResults.filter(r => r.responseTime).map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    storage.saveResult('concentration', {
      score: Math.round(accuracy * 100),
      duration: TOTAL_PHASES * PHASE_DURATION * 1000,
      accuracy,
      details: { accuracy, avgReactionTime: Math.round(avgResponseTime), stability: 0 }
    });

    const stats = storage.getStats('concentration');
    const best = storage.getBest('concentration');
    const history = storage.getHistory('concentration', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${Math.round(accuracy * 100)}分`,
        bestText: best ? `${best.score}分` : '-',
        duration: TOTAL_PHASES * PHASE_DURATION * 1000,
        accuracy,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() {
    clearInterval(this.gameTimer);
    clearTimeout(this.phaseTimeout);
  }
});
