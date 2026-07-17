const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const COLORS = [
  { name: '蓝色', value: '#4A90D9' },
  { name: '红色', value: '#FF6B6B' },
  { name: '绿色', value: '#52C41A' }
];

const TOTAL_TIME = 60; // 60s
const CIRCLE_COUNT = 6;

Page({
  data: {
    state: 'ready',
    circles: [],
    targetColorName: '蓝色',
    correctCount: 0,
    falsePositives: 0,
    remainingTime: TOTAL_TIME,
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('focus-reaction', 10);
    this.setData({ history });
    this.correctCount = 0;
    this.falsePositives = 0;
    this.gameTimer = null;
    this.litTimeout = null;
  },

  onStart() {
    this.correctCount = 0;
    this.falsePositives = 0;
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.setData({
      state: 'playing',
      targetColorName: targetColor.name,
      correctCount: 0,
      falsePositives: 0,
      remainingTime: TOTAL_TIME
    });

    // 初始化圆形
    const circles = Array.from({ length: CIRCLE_COUNT }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)].value,
      isLit: false
    }));
    this.setData({ circles });

    // 开始倒计时
    const endTime = Date.now() + TOTAL_TIME * 1000;
    this.gameTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      this.setData({ remainingTime: remaining });
      if (remaining <= 0) this._onComplete();
    }, 200);

    // 开始闪烁循环
    this._lightNext();
  },

  _lightNext() {
    // 随机点亮 1-2 个圆
    const circles = this.data.circles.map(c => ({ ...c, isLit: false }));

    const targetColorValue = COLORS.find(c => c.name === this.data.targetColorName).value;
    const litCount = 1 + Math.floor(Math.random() * 2);

    // 50% 概率包含目标颜色
    const includeTarget = Math.random() < 0.5;
    const targetIndex = Math.floor(Math.random() * circles.length);
    if (includeTarget) {
      circles[targetIndex].color = targetColorValue;
      circles[targetIndex].isLit = true;
    }

    for (let i = 0; i < litCount - (includeTarget ? 1 : 0); i++) {
      let idx;
      do { idx = Math.floor(Math.random() * circles.length); } while (circles[idx].isLit);
      circles[idx].isLit = true;
    }

    this.setData({ circles });

    // 随机时间后熄灭
    this.litTimeout = setTimeout(() => {
      const updated = circles.map(c => ({ ...c, isLit: false }));
      this.setData({ circles: updated });
      // 间隔后点亮下一批
      this.litTimeout = setTimeout(() => {
        if (this.data.state === 'playing') this._lightNext();
      }, 400 + Math.random() * 600);
    }, 800 + Math.random() * 400);
  },

  onCircleTap(e) {
    const index = e.currentTarget.dataset.index;
    const circle = this.data.circles[index];
    if (!circle.isLit) return; // 只响应点亮的

    const targetColorValue = COLORS.find(c => c.name === this.data.targetColorName).value;

    if (circle.color === targetColorValue) {
      this.correctCount++;
      getApp().globalData.audioManager.playSuccess();
      this.setData({ correctCount: this.correctCount });
    } else {
      this.falsePositives++;
      getApp().globalData.audioManager.playFail();
      this.setData({ falsePositives: this.falsePositives });
    }

    // 立即熄灭被点击的
    const circles = this.data.circles.map((c, i) =>
      i === index ? { ...c, isLit: false } : c
    );
    this.setData({ circles });
  },

  _onComplete() {
    clearInterval(this.gameTimer);
    clearTimeout(this.litTimeout);

    const totalTaps = this.correctCount + this.falsePositives;
    const accuracy = totalTaps > 0 ? this.correctCount / totalTaps : 0;

    storage.saveResult('focus-reaction', {
      score: this.correctCount,
      duration: TOTAL_TIME * 1000,
      accuracy,
      details: { correct: this.correctCount, falsePositives: this.falsePositives }
    });

    const stats = storage.getStats('focus-reaction');
    const best = storage.getBest('focus-reaction');
    const history = storage.getHistory('focus-reaction', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${this.correctCount}次`,
        bestText: best ? `${best.score}次` : '-',
        duration: TOTAL_TIME * 1000,
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
    clearTimeout(this.litTimeout);
  }
});
