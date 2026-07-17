const { CountdownTimer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const MODES = [
  { label: '专注', value: 'focus' },
  { label: '短休息', value: 'shortBreak' },
  { label: '长休息', value: 'longBreak' }
];

const DEFAULT_FOCUS = 25;
const DEFAULT_SHORT_BREAK = 5;
const DEFAULT_LONG_BREAK = 15;
const ROUNDS_FOR_LONG_BREAK = 4;

Page({
  data: {
    modes: MODES,
    currentMode: 'focus',
    focusDuration: DEFAULT_FOCUS,
    shortBreakDuration: DEFAULT_SHORT_BREAK,
    longBreakDuration: DEFAULT_LONG_BREAK,
    timeDisplay: '25:00',
    modeLabel: '专注',
    isRunning: false,
    hasStarted: false,
    completedRounds: 0,
    todayFocusMinutes: 0
  },

  onLoad() {
    this.countdown = null;
    this._loadSettings();
    this._loadStats();
  },

  onShow() {
    this._loadStats();
  },

  _loadSettings() {
    try {
      const settings = wx.getStorageSync('pomodoro_settings');
      if (settings) {
        this.setData({
          focusDuration: settings.focusDuration || DEFAULT_FOCUS,
          shortBreakDuration: settings.shortBreakDuration || DEFAULT_SHORT_BREAK,
          longBreakDuration: settings.longBreakDuration || DEFAULT_LONG_BREAK
        });
        this._updateDisplay(settings.focusDuration * 60 * 1000);
      }
    } catch (e) { /* ignore */ }
  },

  _saveSettings() {
    try {
      wx.setStorageSync('pomodoro_settings', {
        focusDuration: this.data.focusDuration,
        shortBreakDuration: this.data.shortBreakDuration,
        longBreakDuration: this.data.longBreakDuration
      });
    } catch (e) { /* ignore */ }
  },

  _loadStats() {
    const stats = storage.getStats('pomodoro');
    this.setData({
      completedRounds: stats.totalGames,
      todayFocusMinutes: Math.round(stats.totalGames * this.data.focusDuration)
    });
  },

  _getDuration() {
    const { currentMode, focusDuration, shortBreakDuration, longBreakDuration } = this.data;
    switch (currentMode) {
      case 'focus': return focusDuration * 60 * 1000;
      case 'shortBreak': return shortBreakDuration * 60 * 1000;
      case 'longBreak': return longBreakDuration * 60 * 1000;
    }
    return focusDuration * 60 * 1000;
  },

  _updateDisplay(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    this.setData({
      timeDisplay: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    });
  },

  onModeChange(e) {
    if (this.data.isRunning) return;
    const mode = e.currentTarget.dataset.mode;
    const labelMap = { focus: '专注', shortBreak: '短休息', longBreak: '长休息' };
    this.setData({
      currentMode: mode,
      modeLabel: labelMap[mode]
    });
    this._updateDisplay(this._getDuration());
  },

  onToggle() {
    if (this.data.isRunning) {
      this._pause();
    } else {
      this._start();
    }
  },

  _start() {
    const duration = this._getDuration();
    this.countdown = new CountdownTimer(
      duration,
      (remaining) => this._updateDisplay(remaining),
      () => this._onComplete()
    );
    this.countdown.start();
    this.setData({ isRunning: true, hasStarted: true });
  },

  _pause() {
    if (this.countdown) this.countdown.stop();
    this.setData({ isRunning: false });
  },

  onReset() {
    if (this.countdown) this.countdown.stop();
    this.setData({ isRunning: false, hasStarted: false });
    this._updateDisplay(this._getDuration());
  },

  _onComplete() {
    const { currentMode } = this.data;
    getApp().globalData.audioManager.playComplete();

    if (currentMode === 'focus') {
      storage.saveResult('pomodoro', {
        score: this.data.focusDuration,
        duration: this.data.focusDuration * 60 * 1000,
        accuracy: 1,
        details: {
          focusMinutes: this.data.focusDuration,
          rounds: 1,
          longBreakInterval: ROUNDS_FOR_LONG_BREAK
        }
      });
    }

    this.setData({ isRunning: false, hasStarted: false });
    this._loadStats();

    // 自动切换模式
    if (currentMode === 'focus') {
      const stats = storage.getStats('pomodoro');
      const nextMode = stats.totalGames % ROUNDS_FOR_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak';
      this.onModeChange({ currentTarget: { dataset: { mode: nextMode } } });
    } else {
      this.onModeChange({ currentTarget: { dataset: { mode: 'focus' } } });
    }
  },

  adjustFocus(e) {
    if (this.data.isRunning) return;
    const delta = parseInt(e.currentTarget.dataset.delta);
    const newVal = Math.max(5, Math.min(60, this.data.focusDuration + delta));
    this.setData({ focusDuration: newVal });
    this._saveSettings();
    this._updateDisplay(newVal * 60 * 1000);
  },

  adjustShortBreak(e) {
    if (this.data.isRunning) return;
    const delta = parseInt(e.currentTarget.dataset.delta);
    const newVal = Math.max(1, Math.min(15, this.data.shortBreakDuration + delta));
    this.setData({ shortBreakDuration: newVal });
    this._saveSettings();
  },

  adjustLongBreak(e) {
    if (this.data.isRunning) return;
    const delta = parseInt(e.currentTarget.dataset.delta);
    const newVal = Math.max(5, Math.min(30, this.data.longBreakDuration + delta));
    this.setData({ longBreakDuration: newVal });
    this._saveSettings();
  },

  onUnload() {
    if (this.countdown) this.countdown.stop();
  }
});
