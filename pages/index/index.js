const { CATEGORIES, GAMES } = require('../../config/games.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    categories: [],
    gameCounts: {},
    recentGames: [],
    totalGames: 0,
    todayMinutes: 0
  },

  onLoad() {
    const counts = {};
    GAMES.forEach(g => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    const catsWithGames = CATEGORIES.filter(c => counts[c.id] > 0);
    this.setData({
      categories: catsWithGames,
      gameCounts: counts
    });
  },

  onShow() {
    this._loadStats();
    this._loadRecent();
  },

  _loadStats() {
    const summary = storage.getGlobalSummary();
    this.setData({
      totalGames: summary.totalGames,
      todayMinutes: summary.totalMinutes
    });
  },

  _loadRecent() {
    const recent = [];
    GAMES.forEach(game => {
      const history = storage.getHistory(game.id, 1);
      if (history.length > 0) {
        recent.push({
          id: game.id,
          name: game.name,
          route: game.route,
          lastPlayed: history[0].timestamp
        });
      }
    });
    recent.sort((a, b) => b.lastPlayed - a.lastPlayed);
    this.setData({ recentGames: recent.slice(0, 3) });
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/games-list/index?category=${id}` });
  },

  onGameTap(e) {
    const route = e.currentTarget.dataset.route;
    wx.navigateTo({ url: route });
  }
});
