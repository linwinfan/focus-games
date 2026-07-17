const storage = require('../../utils/storage.js');

const PLAN_DATA = [
  { day: 1, games: ['舒尔特方格', '注意力测试'] },
  { day: 2, games: ['斯特鲁普测试', '反应时间'] },
  { day: 3, games: ['记忆序列', '数字记忆'] },
  { day: 4, games: ['视觉搜索', '专注反应'] },
  { day: 5, games: ['Dual N-Back', '工作记忆'] },
  { day: 6, games: ['舒尔特方格', '斯特鲁普', '记忆序列'] },
  { day: 7, games: ['每日挑战'] }
];

Page({
  data: {
    days: [],
    completedCount: 0,
    progressPercent: 0
  },

  onShow() {
    this._loadProgress();
  },

  _loadProgress() {
    let progress = {};
    try {
      progress = wx.getStorageSync('training_plan_progress') || {};
    } catch (e) { /* ignore */ }

    const days = PLAN_DATA.map(item => ({
      ...item,
      completed: !!progress[item.day],
      current: false
    }));

    // 找到当前进行中的天数（第一个未完成的）
    const firstIncomplete = days.find(d => !d.completed);
    if (firstIncomplete) {
      firstIncomplete.current = true;
    }

    const completedCount = days.filter(d => d.completed).length;

    this.setData({
      days,
      completedCount,
      progressPercent: Math.round((completedCount / 7) * 100)
    });
  },

  onDayTap(e) {
    const day = parseInt(e.currentTarget.dataset.day);

    // 检查是否已完成所有前置天数
    const allCompletedBefore = this.data.days
      .filter(d => d.day < day)
      .every(d => d.completed);

    if (!allCompletedBefore && !this.data.days.find(d => d.day === day).completed) {
      wx.showToast({ title: '请先完成前面的天数', icon: 'none' });
      return;
    }

    // 标记当前天数为完成
    let progress = {};
    try {
      progress = wx.getStorageSync('training_plan_progress') || {};
    } catch (e) { /* ignore */ }
    progress[day] = true;
    wx.setStorageSync('training_plan_progress', progress);

    storage.saveResult('training-plan', {
      score: day,
      duration: 0,
      accuracy: 1,
      details: { day, completedGames: this.data.days[day - 1].games }
    });

    this._loadProgress();
    wx.showToast({ title: '第 ' + day + ' 天已完成', icon: 'success' });
  }
});
