const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const N_OPTIONS = [
  { label: '1-Back', value: 1 },
  { label: '2-Back', value: 2 },
  { label: '3-Back', value: 3 }
];

const ROUND_OPTIONS = [
  { label: '15 轮', value: 15 },
  { label: '20 轮', value: 20 },
  { label: '30 轮', value: 30 }
];

const ROUND_DURATION = 2500; // 每轮 2.5s
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

Page({
  data: {
    state: 'ready',
    nValue: 2,
    totalRounds: 20,
    currentRound: 0,
    gridCells: [],
    currentLetter: '',
    accuracyText: '',
    bestLevel: 0,
    result: {},
    history: [],
    nbackDetails: null,
    nOptions: N_OPTIONS,
    roundOptions: ROUND_OPTIONS
  },

  onLoad() {
    const best = storage.getBest('dual-n-back');
    const history = storage.getHistory('dual-n-back', 10);
    this.setData({
      bestLevel: best ? best.score : 0,
      history
    });

    this.historyLog = []; // { position, letter }[]
    this.responseLog = []; // { positionMatch: bool, letterMatch: bool, correctPos: bool, correctLet: bool }[]
    this.roundTimer = null;
    this.stimuli = [];
  },

  onNChange(e) { this.setData({ nValue: e.detail.value }); },
  onRoundChange(e) { this.setData({ totalRounds: e.detail.value }); },

  onStart() {
    this.historyLog = [];
    this.responseLog = [];
    this.stimuli = [];

    // 预生成所有轮次的刺激
    for (let i = 0; i < this.data.totalRounds + 5; i++) {
      this.stimuli.push({
        position: Math.floor(Math.random() * 9),
        letter: LETTERS[Math.floor(Math.random() * LETTERS.length)]
      });
    }

    const gridCells = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      active: false
    }));

    this.setData({
      state: 'playing',
      currentRound: 1,
      gridCells,
      accuracyText: '',
      nbackDetails: null
    });

    this._runRound();
  },

  _runRound() {
    const { currentRound, totalRounds, nValue } = this.data;
    if (currentRound > totalRounds) { this._onComplete(); return; }

    const stimulus = this.stimuli[currentRound - 1];
    this.historyLog.push(stimulus);

    // 显示刺激
    const gridCells = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      active: i === stimulus.position
    }));
    this.setData({ gridCells, currentLetter: stimulus.letter });

    // 播放字母朗读
    getApp().globalData.audioManager.playLetter(stimulus.letter);

    // 记录本轮用户是否响应（默认 false）
    this.currentResponse = { positionMatch: false, letterMatch: false };

    // 2.5s 后进入下一轮
    this.roundTimer = setTimeout(() => {
      // 判定本轮回
      const nBackIndex = currentRound - 1 - nValue;
      const nBackStimulus = nBackIndex >= 0 ? this.historyLog[nBackIndex] : null;

      const correctPos = nBackStimulus && stimulus.position === nBackStimulus.position;
      const correctLet = nBackStimulus && stimulus.letter === nBackStimulus.letter;

      this.responseLog.push({
        positionMatch: this.currentResponse.positionMatch,
        letterMatch: this.currentResponse.letterMatch,
        correctPos: correctPos && !this._isFirstN(),
        correctLet: correctLet && !this._isFirstN()
      });

      // 熄灭
      const gridCells = Array.from({ length: 9 }, (_, i) => ({
        id: i,
        active: false
      }));
      this.setData({
        gridCells,
        currentLetter: '',
        currentRound: currentRound + 1
      });

      // 更新准确率
      if (currentRound > nValue) {
        const recentResponses = this.responseLog.slice(nValue);
        const total = recentResponses.length * 2; // pos + let
        const correct = recentResponses.filter(r => {
          let c = 0;
          if (r.correctPos && r.positionMatch) c++;
          if (!r.correctPos && !r.positionMatch) c++;
          if (r.correctLet && r.letterMatch) c++;
          if (!r.correctLet && !r.letterMatch) c++;
          return c;
        }).length;
        const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
        this.setData({ accuracyText: `${acc}%` });
      }

      // 间隔后下一轮
      this.roundTimer = setTimeout(() => {
        this._runRound();
      }, 500);
    }, ROUND_DURATION);
  },

  _isFirstN() {
    return this.data.currentRound <= this.data.nValue;
  },

  onPositionMatch() {
    if (this.currentResponse) {
      this.currentResponse.positionMatch = true;
      getApp().globalData.audioManager.playTap();
    }
  },

  onLetterMatch() {
    if (this.currentResponse) {
      this.currentResponse.letterMatch = true;
      getApp().globalData.audioManager.playTap();
    }
  },

  _onComplete() {
    const { nValue, totalRounds } = this.data;
    const validResponses = this.responseLog.slice(nValue);

    let correctPos = 0, wrongPos = 0, correctLet = 0, wrongLet = 0;
    let missedPos = 0, missedLet = 0, falsePos = 0, falseLet = 0;

    validResponses.forEach(r => {
      // Position
      if (r.correctPos) {
        if (r.positionMatch) correctPos++; else missedPos++;
      } else {
        if (r.positionMatch) falsePos++; else wrongPos++;
      }
      // Letter
      if (r.correctLet) {
        if (r.letterMatch) correctLet++; else missedLet++;
      } else {
        if (r.letterMatch) falseLet++; else wrongLet++;
      }
    });

    const totalPos = validResponses.length;
    const totalLet = validResponses.length;
    const total = totalPos * 2;
    const correct = correctPos + correctLet + wrongPos + wrongLet;
    const accuracy = total > 0 ? correct / total : 0;

    const hitRate = totalPos > 0 ? Math.round(((correctPos + correctLet) / total) * 100) : 0;
    const falseAlarmRate = totalPos > 0 ? Math.round(((falsePos + falseLet) / total) * 100) : 0;
    const missRate = totalPos > 0 ? Math.round(((missedPos + missedLet) / total) * 100) : 0;

    storage.saveResult('dual-n-back', {
      score: nValue * 100 + Math.round(accuracy * 100),
      duration: totalRounds * ROUND_DURATION,
      accuracy,
      details: {
        nValue,
        rounds: totalRounds,
        hitRate: `${hitRate}%`,
        falseAlarmRate: `${falseAlarmRate}%`,
        missRate: `${missRate}%`
      }
    });

    const stats = storage.getStats('dual-n-back');
    const best = storage.getBest('dual-n-back');
    const history = storage.getHistory('dual-n-back', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${Math.round(accuracy * 100)}%`,
        bestText: best ? `${Math.round(best.accuracy * 100)}%` : '-',
        duration: totalRounds * ROUND_DURATION,
        accuracy,
        trend: stats.trend
      },
      nbackDetails: {
        hitRate: `${hitRate}%`,
        falseAlarmRate: `${falseAlarmRate}%`,
        missRate: `${missRate}%`
      },
      history,
      bestLevel: best ? best.score : 0
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { clearTimeout(this.roundTimer); }
});
