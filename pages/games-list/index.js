const { getGamesByCategory } = require('../../config/games.js');

Page({
  data: {
    games: []
  },

  onLoad(options) {
    const categoryId = options.category;
    const games = getGamesByCategory(categoryId);
    this.setData({ games });
  },

  onGameTap(e) {
    const route = e.currentTarget.dataset.route;
    wx.navigateTo({ url: route });
  }
});
