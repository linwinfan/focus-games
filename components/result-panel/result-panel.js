Component({
  properties: {
    gameName: { type: String, value: '' },
    scoreText: { type: String, value: '' },
    bestText: { type: String, value: '' },
    duration: { type: Number, value: 0 },
    accuracy: { type: Number, value: -1 },
    trend: { type: String, value: 'stable' },
    showDetails: { type: Boolean, value: true },
    showShare: { type: Boolean, value: true }
  },
  computed: {
    trendText(data) {
      const map = { improving: '↑ 进步中', declining: '↓ 下滑', stable: '→ 稳定' };
      return map[data.trend] || '';
    },
    durationText(data) { return `${(data.duration / 1000).toFixed(2)}s`; },
    accuracyText(data) { return `${Math.round(data.accuracy * 100)}%`; }
  },
  methods: {
    onReplay() { this.triggerEvent('replay'); },
    onShare() { this.triggerEvent('share'); }
  }
});
