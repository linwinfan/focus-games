const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const SHOW_INTERVAL = 800;
const LIT_DURATION = 500;

Page({
  data: {
    state: 'ready',
    level: 1,
    phaseText: '准备',
    cells: [],
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('memory-sequence', 10);
    this.setData({ history });
    this.sequence = [];
    this.userInput = [];
    this.showingIndex = 0;
    this.timeouts = [];
  },

  onStart() {
    this.sequence = [];
    this.setData({ state: 'playing', level: 1 });
    this._startLevel(1);
  },

  _startLevel(level) {
    // 生成新序列（在旧序列基础上加一格）
    this.sequence.push(Math.floor(Math.random() * 9));
    this.userInput = [];

    const cells = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      lit: false,
      correct: false,
      wrong: false
    }));

    this.setData({
      level,
      cells,
      phaseText: '记住顺序...'
    });

    // 开始演示
    this._showSequence();
  },

  _showSequence() {
    this.showingIndex = 0;
    this._showNext();
  },

  _showNext() {
    if (this.showingIndex >= this.sequence.length) {
      // 演示结束，等待用户输入
      this.setData({ phaseText: '请复现顺序' });
      return;
    }

    const cellIndex = this.sequence[this.showingIndex];
    const cells = this.data.cells.map((c, i) =>
      i === cellIndex ? { ...c, lit: true } : { ...c, lit: false }
    );
    this.setData({ cells });

    // 熄灭
    const offTimeout = setTimeout(() => {
      const updatedCells = this.data.cells.map((c, i) =>
        i === cellIndex ? { ...c, lit: false } : c
      );
      this.setData({ cells: updatedCells });

      // 显示下一个
      const nextTimeout = setTimeout(() => {
        this.showingIndex++;
        this._showNext();
      }, SHOW_INTERVAL - LIT_DURATION);
      this.timeouts.push(nextTimeout);
    }, LIT_DURATION);
    this.timeouts.push(offTimeout);
  },

  onCellTap(e) {
    if (this.data.phaseText !== '请复现顺序') return;

    const index = e.currentTarget.dataset.index;
    const cells = [...this.data.cells];
    const currentStep = this.userInput.length;

    if (this.sequence[currentStep] === index) {
      // 正确
      cells[index] = { ...cells[index], correct: true };
      this.setData({ cells });
      this.userInput.push(index);
      getApp().globalData.audioManager.playSuccess();

      // 短暂显示后清除
      const t = setTimeout(() => {
        const updated = this.data.cells.map((c, i) =>
          i === index ? { ...c, correct: false } : c
        );
        this.setData({ cells: updated });
      }, 300);
      this.timeouts.push(t);

      // 序列完成
      if (this.userInput.length === this.sequence.length) {
        const t2 = setTimeout(() => {
          this.setData({ level: this.data.level + 1, phaseText: '太棒了!' });
          const t3 = setTimeout(() => this._startLevel(this.data.level + 1), 500);
          this.timeouts.push(t3);
        }, 400);
        this.timeouts.push(t2);
      }
    } else {
      // 错误
      cells[index] = { ...cells[index], wrong: true };
      this.setData({ cells });
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'medium' });

      const t = setTimeout(() => this._onComplete(), 800);
      this.timeouts.push(t);
    }
  },

  _onComplete() {
    const maxLevel = this.data.level - 1;
    if (maxLevel < 1) {
      // 第一关就错了，不算分
      this.setData({ state: 'ready' });
      return;
    }

    storage.saveResult('memory-sequence', {
      score: maxLevel,
      duration: 0,
      accuracy: 1,
      details: { maxLevel, sequenceLength: maxLevel + 1 }
    });

    const stats = storage.getStats('memory-sequence');
    const best = storage.getBest('memory-sequence');
    const history = storage.getHistory('memory-sequence', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${maxLevel}格`,
        bestText: best ? `${best.score}格` : '-',
        duration: 0,
        accuracy: 1,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() {
    this.timeouts.forEach(t => clearTimeout(t));
  }
});
