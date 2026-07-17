const MAX_HISTORY_PER_GAME = 200;
const STORAGE_PREFIX = 'game_history_';
const GLOBAL_STATS_KEY = 'global_stats';

/**
 * 生成存储 key
 */
function getStorageKey(gameId) {
  return `${STORAGE_PREFIX}${gameId}`;
}

/**
 * 读取某游戏的历史记录（内部使用）
 */
function readHistory(gameId) {
  try {
    const data = wx.getStorageSync(getStorageKey(gameId));
    return data || [];
  } catch (e) {
    console.warn(`[Storage] 读取 ${gameId} 失败:`, e);
    return [];
  }
}

/**
 * 写入某游戏的历史记录（内部使用，含重试）
 */
function writeHistory(gameId, history) {
  try {
    wx.setStorageSync(getStorageKey(gameId), history);
  } catch (e) {
    console.warn(`[Storage] 写入 ${gameId} 同步失败，尝试异步:`, e);
    wx.setStorage({
      key: getStorageKey(gameId),
      data: history,
      fail(err) {
        console.error(`[Storage] 写入 ${gameId} 异步也失败:`, err);
        wx.showToast({
          title: '存储失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
}

/**
 * 计算统计数据
 */
function calculateStats(history, scoreMode) {
  // scoreMode: 'lower_better' | 'higher_better'
  if (!history || history.length === 0) {
    return {
      best: 0,
      average: 0,
      totalGames: 0,
      recentAvg: 0,
      trend: 'stable'
    };
  }

  const scores = history.map(r => r.score);
  const total = scores.length;

  // best 取决于模式
  let best;
  if (scoreMode === 'higher_better') {
    best = Math.max(...scores);
  } else {
    best = Math.min(...scores);
  }

  const average = scores.reduce((a, b) => a + b, 0) / total;

  // 最近 5 次平均值
  const recent = scores.slice(0, 5);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

  // 趋势判断
  let trend = 'stable';
  if (total >= 6) {
    const older = scores.slice(5);
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    const threshold = Math.abs(olderAvg) * 0.05; // 5% 变化阈值
    if (scoreMode === 'lower_better') {
      if (diff < -threshold) trend = 'improving';
      else if (diff > threshold) trend = 'declining';
    } else {
      if (diff > threshold) trend = 'improving';
      else if (diff < -threshold) trend = 'declining';
    }
  }

  return {
    best: Math.round(best * 100) / 100,
    average: Math.round(average * 100) / 100,
    totalGames: total,
    recentAvg: Math.round(recentAvg * 100) / 100,
    trend
  };
}

/**
 * 计算连续打卡天数
 */
function calculateStreak(history) {
  if (!history || history.length === 0) return 0;

  const days = new Set();
  history.forEach(r => {
    const d = new Date(r.timestamp);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    days.add(dayKey);
  });

  const sortedDays = Array.from(days).sort().reverse();
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedDays.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

    if (sortedDays.includes(checkKey)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 获取游戏分数模式
 */
function getScoreMode(gameId) {
  // 大多数游戏分数越低越好（时间类），少数越高越好（记忆类）
  const higherBetterGames = [
    'memory-sequence', 'number-memory', 'working-memory', 'dual-n-back'
  ];
  return higherBetterGames.includes(gameId) ? 'higher_better' : 'lower_better';
}

// ===== 公开 API =====

function saveResult(gameId, result) {
  const history = readHistory(gameId);

  const record = {
    gameId,
    score: result.score || 0,
    duration: result.duration || 0,
    accuracy: result.accuracy != null ? result.accuracy : 1,
    timestamp: Date.now(),
    details: result.details || {}
  };

  history.unshift(record);

  // 超过上限则裁剪
  if (history.length > MAX_HISTORY_PER_GAME) {
    history.length = MAX_HISTORY_PER_GAME;
  }

  writeHistory(gameId, history);
  return record;
}

function getHistory(gameId, limit = 10) {
  const history = readHistory(gameId);
  return history.slice(0, limit);
}

function getStats(gameId) {
  const history = readHistory(gameId);
  const scoreMode = getScoreMode(gameId);
  return calculateStats(history, scoreMode);
}

function getBest(gameId) {
  const history = readHistory(gameId);
  if (history.length === 0) return null;
  return history.reduce((best, curr) => {
    const scoreMode = getScoreMode(gameId);
    if (scoreMode === 'higher_better') {
      return curr.score > best.score ? curr : best;
    }
    return curr.score < best.score ? curr : best;
  });
}

function getStreak(gameId) {
  const history = readHistory(gameId);
  return calculateStreak(history);
}

function clearGame(gameId) {
  try {
    wx.removeStorageSync(getStorageKey(gameId));
  } catch (e) {
    console.warn(`[Storage] 清除 ${gameId} 失败:`, e);
  }
}

function clearAll() {
  try {
    const res = wx.getStorageInfoSync();
    res.keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key === GLOBAL_STATS_KEY) {
        wx.removeStorageSync(key);
      }
    });
  } catch (e) {
    console.error('[Storage] 清除全部失败:', e);
    wx.showToast({
      title: '清除失败',
      icon: 'none'
    });
  }
}

/**
 * 获取所有游戏的统计概览（用于个人中心）
 */
function getAllStats() {
  const gamesConfig = require('../config/games.js');
  const overview = {};

  gamesConfig.GAMES.forEach(game => {
    const stats = getStats(game.id);
    if (stats.totalGames > 0) {
      overview[game.id] = {
        name: game.name,
        ...stats
      };
    }
  });

  return overview;
}

/**
 * 获取全局汇总数据
 */
function getGlobalSummary() {
  const allStats = getAllStats();
  const games = Object.values(allStats);

  return {
    totalGames: games.reduce((sum, g) => sum + g.totalGames, 0),
    totalMinutes: Math.round(
      games.reduce((sum, g) => sum + g.totalGames * 2, 0)
    ),
    streak: Math.max(0, ...games.map(g => g.totalGames > 0 ? 1 : 0)),
    gamesPlayed: games.length
  };
}

module.exports = {
  saveResult,
  getHistory,
  getStats,
  getBest,
  getStreak,
  clearGame,
  clearAll,
  getAllStats,
  getGlobalSummary
};
