const storage = require('../../utils/storage.js');
const { GAME_MAP } = require('../../config/games.js');

Page({
  data: {
    totalGames: 0,
    totalMinutes: 0,
    gamesPlayed: 0,
    gameStats: [],
    muted: false
  },

  onShow() {
    this._loadData();
    this.setData({
      muted: getApp().globalData.audioManager.isMuted()
    });
  },

  _loadData() {
    const allStats = storage.getAllStats();
    const summary = storage.getGlobalSummary();

    const gameStats = Object.entries(allStats).map(([id, stats]) => {
      const game = GAME_MAP[id];
      return {
        id,
        name: stats.name,
        bestText: this._formatBest(id, stats.best)
      };
    });

    this.setData({
      totalGames: summary.totalGames,
      totalMinutes: summary.totalMinutes,
      gamesPlayed: summary.gamesPlayed,
      gameStats
    });
  },

  _formatBest(gameId, best) {
    const higherBetter = ['memory-sequence', 'number-memory', 'working-memory', 'dual-n-back'];
    if (higherBetter.includes(gameId)) {
      return `${best}`;
    }
    return `${best}s`;
  },

  onToggleMute() {
    const am = getApp().globalData.audioManager;
    am.setMuted(!am.isMuted());
    this.setData({ muted: am.isMuted() });
  },

  onClearData() {
    wx.showModal({
      title: '确认清除',
      content: '将删除所有游戏记录，不可恢复',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          storage.clearAll();
          this._loadData();
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  }
});
