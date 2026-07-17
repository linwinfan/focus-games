const storage = require('../../utils/storage.js');

const MEMORY_TIME = 3000;

Page({
  data: {
    state: 'ready',
    level: 1,
    phase: 'memory',
    phaseText: '记住数字',
    memoryNumber: '',
    calcProblem: '',
    calcAnswer: 0,
    calcInput: '',
    recallInput: '',
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('working-memory', 10);
    this.setData({ history });
    this.memoryCorrect = 0;
    this.calcCorrect = 0;
    this.memoryTimeout = null;
  },

  onStart() {
    this.memoryCorrect = 0;
    this.calcCorrect = 0;
    this.setData({ state: 'playing', level: 1 });
    this._startLevel(1);
  },

  _startLevel(level) {
    // 生成长度为 level+1 的数字
    let number = '';
    for (let i = 0; i < level + 1; i++) {
      number += Math.floor(Math.random() * 10);
    }

    this.setData({
      level,
      phase: 'memory',
      phaseText: '记住数字',
      memoryNumber: number,
      calcInput: '',
      recallInput: ''
    });

    // 3s 后切换到计算
    this.memoryTimeout = setTimeout(() => {
      this._showCalc();
    }, MEMORY_TIME);
  },

  _showCalc() {
    // 生成简单计算题
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const isAdd = Math.random() > 0.5;

    let problem, answer;
    if (isAdd) {
      problem = `${a} + ${b}`;
      answer = a + b;
    } else {
      const max = Math.max(a, b);
      const min = Math.min(a, b);
      problem = `${max} - ${min}`;
      answer = max - min;
    }

    this.setData({
      phase: 'calc',
      phaseText: '完成计算',
      calcProblem: problem,
      calcAnswer: answer,
      calcInput: ''
    });
  },

  onCalcInput(e) {
    this.setData({ calcInput: e.detail.value });
  },

  onCalcSubmit() {
    const userAnswer = parseInt(this.data.calcInput);
    if (userAnswer === this.data.calcAnswer) {
      this.calcCorrect++;
      getApp().globalData.audioManager.playSuccess();
    } else {
      getApp().globalData.audioManager.playFail();
    }

    // 切换到回忆阶段
    this.setData({
      phase: 'recall',
      phaseText: '回忆数字',
      recallInput: ''
    });
  },

  onRecallInput(e) {
    this.setData({ recallInput: e.detail.value });
  },

  onRecallSubmit() {
    if (this.data.recallInput === this.data.memoryNumber) {
      this.memoryCorrect++;
      getApp().globalData.audioManager.playSuccess();

      // 下一关
      this.memoryTimeout = setTimeout(() => {
        this._startLevel(this.data.level + 1);
      }, 500);
    } else {
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'medium' });
      this._onComplete();
    }
  },

  _onComplete() {
    const maxLevel = this.data.level - 1;
    const totalAttempts = Math.max(1, this.data.level);
    const memoryScore = this.memoryCorrect / totalAttempts;
    const calcScore = this.calcCorrect / totalAttempts;

    storage.saveResult('working-memory', {
      score: maxLevel,
      duration: 0,
      accuracy: (memoryScore + calcScore) / 2,
      details: { memoryScore, calcScore, maxLevel }
    });

    const stats = storage.getStats('working-memory');
    const best = storage.getBest('working-memory');
    const history = storage.getHistory('working-memory', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${maxLevel}关`,
        bestText: best ? `${best.score}关` : '-',
        duration: 0,
        accuracy: (memoryScore + calcScore) / 2,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { clearTimeout(this.memoryTimeout); }
});
