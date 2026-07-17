const storage = require('../../../utils/storage.js');

const MODES = [
  { label: '4-4-4 箱式', value: 'box', phases: [4, 4, 4] },
  { label: '4-7-8 放松', value: '478', phases: [4, 7, 8] },
  { label: '自定义', value: 'custom', phases: [4, 4, 4] }
];

Page({
  data: {
    state: 'ready',
    modes: MODES,
    selectedMode: 'box',
    rounds: 5,
    currentRound: 1,
    phase: 'idle',
    phaseText: '准备',
    phaseDuration: 4,
    isRunning: false,
    completedRounds: 0
  },

  onLoad() {},

  onModeChange(e) {
    this.setData({ selectedMode: e.currentTarget.dataset.value });
  },

  adjustRounds(e) {
    const delta = parseInt(e.currentTarget.dataset.delta);
    const newRounds = Math.max(1, Math.min(20, this.data.rounds + delta));
    this.setData({ rounds: newRounds });
  },

  onStart() {
    this.setData({
      state: 'playing',
      currentRound: 1,
      isRunning: true,
      completedRounds: 0
    });
    this._runBreathingCycle();
  },

  _runBreathingCycle() {
    const { selectedMode, currentRound, rounds } = this.data;
    const mode = MODES.find(m => m.value === selectedMode);

    if (currentRound > rounds) {
      this._onComplete();
      return;
    }

    // 阶段序列：吸气 -> 屏息 -> 呼气
    const phases = [
      { name: 'inhale', text: '吸气', duration: mode.phases[0] },
      { name: 'hold', text: '屏息', duration: mode.phases[1] },
      { name: 'exhale', text: '呼气', duration: mode.phases[2] }
    ];

    let phaseIndex = 0;

    const runPhase = () => {
      if (phaseIndex >= phases.length) {
        // 本轮完成
        this.setData({ currentRound: this.data.currentRound + 1, completedRounds: this.data.currentRound });
        setTimeout(() => this._runBreathingCycle(), 500);
        return;
      }

      const phase = phases[phaseIndex];

      if (phase.name === 'inhale') {
        getApp().globalData.audioManager.playBreatheIn();
      } else if (phase.name === 'exhale') {
        getApp().globalData.audioManager.playBreatheOut();
      }

      this.setData({
        phase: phase.name,
        phaseText: phase.text,
        phaseDuration: phase.duration
      });

      this.phaseTimeout = setTimeout(() => {
        phaseIndex++;
        runPhase();
      }, phase.duration * 1000);
    };

    runPhase();
  },

  onPauseResume() {
    this.setData({ isRunning: !this.data.isRunning });
  },

  onStop() {
    clearTimeout(this.phaseTimeout);
    this._onComplete();
  },

  _onComplete() {
    clearTimeout(this.phaseTimeout);
    const mode = MODES.find(m => m.value === this.data.selectedMode);

    storage.saveResult('breathing', {
      score: this.data.completedRounds,
      duration: this.data.completedRounds * mode.phases.reduce((a, b) => a + b, 0) * 1000,
      accuracy: 1,
      details: { mode: this.data.selectedMode, rounds: this.data.completedRounds }
    });

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      completedRounds: this.data.completedRounds || 1
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { clearTimeout(this.phaseTimeout); }
});
