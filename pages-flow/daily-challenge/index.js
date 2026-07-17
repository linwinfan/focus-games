const storage = require('../../utils/storage.js');

const GAME_TYPES = ['schulte', 'reaction', 'memory'];
const GAME_NAMES = { schulte: '舒尔特方格', reaction: '反应测试', memory: '数字记忆' };
const GAME_DURATION = 60; // 每关 60s

Page({
  data: {
    state: 'ready',
    streak: 0,
    todayCompleted: false,
    todayScore: 0,
    currentGameIndex: 0,
    currentGame: '',
    currentGameName: '',
    remainingTime: GAME_DURATION,
    gridSize: 3,
    gridData: [],
    memoryNumber: '',
    screenColor: 'waiting',
    result: {}
  },

  onShow() {
    this._checkTodayStatus();
  },

  _checkTodayStatus() {
    const today = new Date().toDateString();
    let data = {};
    try {
      data = wx.getStorageSync('daily_challenge_data') || {};
    } catch (e) { /* ignore */ }

    const streak = data.streak || 0;
    const lastDate = data.lastDate || '';
    let currentStreak = streak;

    // 如果上次打卡不是昨天也不是今天，重置连续
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate !== today && lastDate !== yesterday.toDateString()) {
      currentStreak = 0;
    }

    this.setData({
      streak: currentStreak,
      todayCompleted: lastDate === today,
      todayScore: data.lastScore || 0
    });

    this.streak = currentStreak;
  },

  onStart() {
    const todayGames = [...GAME_TYPES].sort(() => Math.random() - 0.5);

    this.setData({
      state: 'playing',
      currentGameIndex: 0,
      currentGame: todayGames[0],
      currentGameName: GAME_NAMES[todayGames[0]],
      remainingTime: GAME_VERSION
    });

    this._startGame(todayGames[0]);
  },

  _startGame(gameType) {
    this.setData({ remainingTime: GAME_DURATION });
    const endTime = Date.now() + GAME_DURATION * 1000;

    this.gameTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      this.setData({ remainingTime: remaining });
      if (remaining <= 0) {
        clearInterval(this.gameTimer);
        this._nextGame();
      }
    }, 200);

    if (gameType === 'schulte') {
      this._initMiniSchulte();
    } else if (gameType === 'reaction') {
      this._initMiniReaction();
    } else if (gameType === 'memory') {
      this._initMiniMemory();
    }
  },

  _initMiniSchulte() {
    const gridSize = 3;
    const total = gridSize * gridSize;
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    const gridData = numbers.map(n => ({ value: n, found: false }));
    this.setData({ gridSize, gridData, currentNumber: 1 });
  },

  _initMiniReaction() {
    this.setData({ screenColor: 'waiting' });
    this.reactionScore = 0;
    this._nextReactionRound();
  },

  _nextReactionRound() {
    if (this.data.currentGame !== 'reaction' || this.data.remainingTime <= 0) return;
    this.setData({ screenColor: 'waiting' });
    const waitTime = 1000 + Math.random() * 2000;
    this.reactionTimeout = setTimeout(() => {
      if (this.data.currentGame === 'reaction') {
        this.setData({ screenColor: 'go' });
        this.responseTimer = { start: Date.now() };
      }
    }, waitTime);
  },

  _initMiniMemory() {
    const num = Math.floor(Math.random() * 9000) + 1000;
    this.setData({ memoryNumber: String(num) });
  },

  onMiniTap(e) {
    const { currentGame } = this.data;

    if (currentGame === 'schulte') {
      const value = e.currentTarget.dataset.value;
      const { gridData, currentNumber } = this.data;
      const cell = gridData.find(c => c.value === value);

      if (value === currentNumber) {
        cell.found = true;
        const nextNum = currentNumber + 1;
        getApp().globalData.audioManager.playSuccess();
        this.setData({ gridData: [...gridData], currentNumber: nextNum });
      }
    } else if (currentGame === 'reaction') {
      if (this.data.screenColor === 'go') {
        getApp().globalData.audioManager.playSuccess();
        this.reactionScore++;
        this._nextReactionRound();
      }
    }
  },

  _nextGame() {
    clearInterval(this.gameTimer);
    clearTimeout(this.reactionTimeout);

    const nextIndex = this.data.currentGameIndex + 1;
    if (nextIndex >= GAME_TYPES.length) {
      this._onComplete();
      return;
    }

    const todayGames = [...GAME_TYPES].sort(() => Math.random() - 0.5);
    this.setData({
      currentGameIndex: nextIndex,
      currentGame: todayGames[nextIndex],
      currentGameName: GAME_NAMES[todayGames[nextIndex]]
    });
    this._startGame(todayGames[nextIndex]);
  },

  _onComplete() {
    const score = 100; // 简化评分

    const today = new Date().toDateString();
    const data = {
      streak: this.streak + 1,
      lastDate: today,
      lastScore: score
    };
    wx.setStorageSync('daily_challenge_data', data);

    storage.saveResult('daily-challenge', {
      score,
      duration: GAME_DURATION * GAME_TYPES.length * 1000,
      accuracy: 1,
      details: { date: today, games: GAME_TYPES, streak: data.streak }
    });

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      streak: data.streak,
      todayCompleted: true,
      todayScore: score,
      result: {
        scoreText: `${score}分`,
        bestText: '-',
        duration: GAME_DURATION * GAME_TYPES.length * 1000,
        accuracy: 1,
        trend: 'stable'
      }
    });
  },

  onReplay() { this._checkTodayStatus(); this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能即将实现', icon: 'none' }); },
  onUnload() {
    clearInterval(this.gameTimer);
    clearTimeout(this.reactionTimeout);
  }
});
