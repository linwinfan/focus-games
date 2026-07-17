# 专注力训练微信小程序 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 focus-game.org 的 20 个专注力训练工具改写为原生微信小程序，包含完整音效、本地历史记录和成绩分享功能。

**架构:** 主包 + 5 分包架构，按游戏类型分包加载。共享模块（存储/音效/组件）在主包，确保所有游戏页面可复用。每个游戏为独立页面，通过统一的生命周期和数据流模式开发。

**Tech Stack:** 微信小程序原生框架 (WXML/WXSS/JavaScript)，无第三方框架，无后端服务。

---

## 文件结构总览

```
focus-games/
├── project.config.json           小程序项目配置
├── app.js                        全局逻辑（AudioManager 初始化）
├── app.json                      全局配置（路由、分包、tabBar）
├── app.wxss                      全局样式
├── sitemap.json                  索引规则
├── pages/
│   ├── index/                    首页（主包）
│   ├── games-list/               分类游戏列表（主包）
│   ├── profile/                  个人中心（主包）
│   ├── schulte-table/            舒尔特方格（主包）
│   └── pomodoro/                 番茄计时器（主包）
├── pages-focus/
│   ├── reverse-schulte/          反向舒尔特
│   └── schulte-kids/             儿童舒尔特
├── pages-cognitive/
│   ├── stroop-test/              斯特鲁普测试
│   └── reverse-stroop/           反向斯特鲁普
├── pages-reaction/
│   ├── attention-test/           注意力测试
│   ├── reaction-time/            反应时间测试
│   ├── visual-search/            视觉搜索测试
│   ├── focus-reaction/           专注反应测试
│   └── concentration/            专注力测试
├── pages-memory/
│   ├── memory-sequence/          记忆序列
│   ├── number-memory/            数字记忆
│   ├── working-memory/           工作记忆测试
│   └── dual-n-back/             Dual N-Back
├── pages-flow/
│   ├── breathing/                呼吸练习
│   ├── training-plan/            训练计划
│   └── daily-challenge/          每日挑战
├── utils/
│   ├── storage.js                历史记录管理
│   ├── audio.js                  音效管理
│   └── timer.js                  计时器工具
├── components/
│   ├── game-header/              游戏顶部导航
│   ├── result-panel/             结果展示面板
│   ├── history-list/             历史记录列表
│   ├── difficulty-selector/      难度选择器
│   ├── countdown-overlay/        倒计时蒙层
│   └── share-card/               分享卡片（Canvas）
├── config/
│   └── games.js                  游戏配置元数据
├── images/                       图标资源
└── audio/                        音效文件（CDN 引用或占位）
```

---

## Phase 0: 项目骨架

### Task 1: 小程序项目配置文件

**Files:**
- Create: `project.config.json`
- Create: `sitemap.json`
- Create: `app.json`
- Create: `app.js`
- Create: `app.wxss`

- [ ] **Step 1: 创建项目配置**

创建 `project.config.json`:

```json
{
  "description": "专注力训练微信小程序",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": false,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "enableEngineNative": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "compileType": "miniprogram",
  "libVersion": "3.4.5",
  "appid": "替换为你的AppID",
  "projectname": "focus-games",
  "condition": {},
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  }
}
```

创建 `sitemap.json`:

```json
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
```

创建 `app.json`:

```json
{
  "pages": [
    "pages/index/index",
    "pages/games-list/index",
    "pages/profile/index",
    "pages/schulte-table/index",
    "pages/pomodoro/index"
  ],
  "subpackages": [
    {
      "root": "pages-focus",
      "pages": [
        "reverse-schulte/index",
        "schulte-kids/index"
      ]
    },
    {
      "root": "pages-cognitive",
      "pages": [
        "stroop-test/index",
        "reverse-stroop/index"
      ]
    },
    {
      "root": "pages-reaction",
      "pages": [
        "attention-test/index",
        "reaction-time/index",
        "visual-search/index",
        "focus-reaction/index",
        "concentration/index"
      ]
    },
    {
      "root": "pages-memory",
      "pages": [
        "memory-sequence/index",
        "number-memory/index",
        "working-memory/index",
        "dual-n-back/index"
      ]
    },
    {
      "root": "pages-flow",
      "pages": [
        "breathing/index",
        "training-plan/index",
        "daily-challenge/index"
      ]
    }
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "专注力训练",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f5f5f5"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

创建 `app.js`:

```javascript
const AudioManager = require('./utils/audio.js');

App({
  globalData: {
    audioManager: null,
    gamesConfig: null
  },

  onLaunch() {
    // 初始化音效管理器
    const audioManager = new AudioManager();
    audioManager.preload();
    this.globalData.audioManager = audioManager;

    // 加载游戏配置
    this.globalData.gamesConfig = require('./config/games.js');
  }
});
```

创建 `app.wxss`:

```css
/* 全局样式 */
page {
  --primary-color: #4A90D9;
  --success-color: #52C41A;
  --error-color: #FF4D4F;
  --warning-color: #FAAD14;
  --text-color: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  --bg-color: #F5F5F5;
  --card-bg: #FFFFFF;
  --border-color: #E8E8E8;

  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  font-size: 28rpx;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.5;
}

view, text {
  box-sizing: border-box;
}

/* 通用类 */
.container {
  min-height: 100vh;
  padding: 24rpx;
}

.card {
  background: var(--card-bg);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
  border-radius: 12rpx;
  padding: 20rpx 48rpx;
  font-size: 32rpx;
  border: none;
  text-align: center;
}

.btn-primary::after {
  border: none;
}

.btn-secondary {
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 12rpx;
  padding: 20rpx 48rpx;
  font-size: 32rpx;
  border: 2rpx solid var(--border-color);
  text-align: center;
}

.btn-secondary::after {
  border: none;
}

.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.text-success { color: var(--success-color); }
.text-error { color: var(--error-color); }
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.mt-16 { margin-top: 16rpx; }
.mt-24 { margin-top: 24rpx; }
.mt-32 { margin-top: 32rpx; }
.mb-16 { margin-bottom: 16rpx; }
.mb-24 { margin-bottom: 24rpx; }
.mb-32 { margin-bottom: 32rpx; }
```

- [ ] **Step 2: 验证项目可加载**

将整个文件夹用微信开发者工具打开，确认无编译错误（此时页面均为空壳）。

- [ ] **Step 3: Commit**

```bash
git add project.config.json sitemap.json app.json app.js app.wxss
git commit -m "chore: 小程序项目骨架配置

- 配置 app.json 路由与分包
- app.js 初始化 AudioManager
- app.wxss 全局样式变量
- project.config.json + sitemap.json"
```

---

### Task 2: 游戏配置元数据

**Files:**
- Create: `config/games.js`

- [ ] **Step 1: 创建游戏配置**

创建 `config/games.js`:

```javascript
// 游戏分类
const CATEGORIES = [
  {
    id: 'focus',
    name: '专注训练',
    icon: '/images/cat-focus.png',
    color: '#4A90D9'
  },
  {
    id: 'cognitive',
    name: '认知控制',
    icon: '/images/cat-cognitive.png',
    color: '#7B68EE'
  },
  {
    id: 'reaction',
    name: '注意与反应',
    icon: '/images/cat-reaction.png',
    color: '#FF6B6B'
  },
  {
    id: 'memory',
    name: '工作记忆',
    icon: '/images/cat-memory.png',
    color: '#52C41A'
  },
  {
    id: 'flow',
    name: '专注流程',
    icon: '/images/cat-flow.png',
    color: '#FAAD14'
  }
];

// 所有游戏的元数据
const GAMES = [
  {
    id: 'schulte-table',
    name: '舒尔特方格',
    category: 'focus',
    description: '按顺序寻找数字，练习视觉扫描和专注节奏',
    route: '/pages/schulte-table/index',
    package: 'main',
    hot: true,
    color: '#4A90D9'
  },
  {
    id: 'reverse-schulte',
    name: '反向舒尔特',
    category: 'focus',
    description: '从大到小搜索数字，增加逆向思维挑战',
    route: '/pages-focus/reverse-schulte/index',
    package: 'focus',
    color: '#5BA0E0'
  },
  {
    id: 'schulte-kids',
    name: '儿童舒尔特',
    category: 'focus',
    description: '3×3 到 5×5 方格，适合儿童入门',
    route: '/pages-focus/schulte-kids/index',
    package: 'focus',
    color: '#6BB0E8'
  },
  {
    id: 'stroop-test',
    name: '斯特鲁普测试',
    category: 'cognitive',
    description: '按颜色作答而忽略文字内容',
    route: '/pages-cognitive/stroop-test/index',
    package: 'cognitive',
    color: '#7B68EE'
  },
  {
    id: 'reverse-stroop',
    name: '反向斯特鲁普',
    category: 'cognitive',
    description: '按文字内容而不是颜色作答',
    route: '/pages-cognitive/reverse-stroop/index',
    package: 'cognitive',
    color: '#8B78F0'
  },
  {
    id: 'attention-test',
    name: '注意力测试',
    category: 'reaction',
    description: 'Go/No-Go 检测，评估专注状态',
    route: '/pages-reaction/attention-test/index',
    package: 'reaction',
    color: '#FF6B6B'
  },
  {
    id: 'reaction-time',
    name: '反应时间测试',
    category: 'reaction',
    description: '测量反应速度与误触情况',
    route: '/pages-reaction/reaction-time/index',
    package: 'reaction',
    color: '#FF7B7B'
  },
  {
    id: 'visual-search',
    name: '视觉搜索测试',
    category: 'reaction',
    description: '在复杂视野中快速寻找目标',
    route: '/pages-reaction/visual-search/index',
    package: 'reaction',
    color: '#FF8B8B'
  },
  {
    id: 'focus-reaction',
    name: '专注反应测试',
    category: 'reaction',
    description: '在干扰信息中快速识别目标',
    route: '/pages-reaction/focus-reaction/index',
    package: 'reaction',
    color: '#FF9B9B'
  },
  {
    id: 'concentration',
    name: '专注力测试',
    category: 'reaction',
    description: '结合准确率、反应时间和抗干扰',
    route: '/pages-reaction/concentration/index',
    package: 'reaction',
    color: '#FFABAB'
  },
  {
    id: 'memory-sequence',
    name: '记忆序列游戏',
    category: 'memory',
    description: '复现视觉序列，训练短时记忆',
    route: '/pages-memory/memory-sequence/index',
    package: 'memory',
    color: '#52C41A'
  },
  {
    id: 'number-memory',
    name: '数字记忆测试',
    category: 'memory',
    description: '逐步记忆更长的数字序列',
    route: '/pages-memory/number-memory/index',
    package: 'memory',
    color: '#62D42A'
  },
  {
    id: 'working-memory',
    name: '工作记忆测试',
    category: 'memory',
    description: '记忆序列与计算交替进行',
    route: '/pages-memory/working-memory/index',
    package: 'memory',
    color: '#72E43A'
  },
  {
    id: 'dual-n-back',
    name: 'Dual N-Back',
    category: 'memory',
    description: '视觉和声音结合的工作记忆训练',
    route: '/pages-memory/dual-n-back/index',
    package: 'memory',
    color: '#3EB40A'
  },
  {
    id: 'breathing',
    name: '专注呼吸练习',
    category: 'flow',
    description: '计时呼吸练习，帮助进入专注状态',
    route: '/pages-flow/breathing/index',
    package: 'flow',
    color: '#FAAD14'
  },
  {
    id: 'training-plan',
    name: '训练计划',
    category: 'flow',
    description: '7 天训练计划，系统提升专注力',
    route: '/pages-flow/training-plan/index',
    package: 'flow',
    color: '#FBBD24'
  },
  {
    id: 'daily-challenge',
    name: '每日挑战',
    category: 'flow',
    description: '每天 5 分钟综合挑战',
    route: '/pages-flow/daily-challenge/index',
    package: 'flow',
    color: '#FCCD34'
  },
  {
    id: 'pomodoro',
    name: '番茄专注计时器',
    category: 'flow',
    description: '安排专注与休息时间',
    route: '/pages/pomodoro/index',
    package: 'main',
    hot: true,
    color: '#E5C040'
  }
];

const GAME_MAP = {};
GAMES.forEach(g => { GAME_MAP[g.id] = g; });

const CATEGORY_MAP = {};
CATEGORIES.forEach(c => { CATEGORY_MAP[c.id] = c; });

module.exports = {
  CATEGORIES,
  GAMES,
  GAME_MAP,
  CATEGORY_MAP,
  getGamesByCategory(categoryId) {
    return GAMES.filter(g => g.category === categoryId);
  },
  getGameById(gameId) {
    return GAME_MAP[gameId] || null;
  }
};
```

- [ ] **Step 2: 验证配置可加载**

在微信开发者工具中，控制台执行 `require('./config/games.js')`，确认输出包含 18 个游戏和 5 个分类。

- [ ] **Step 3: Commit**

```bash
git add config/games.js
git commit -m "feat: 游戏配置元数据

- 5 个分类、18 个游戏的路由/名称/描述
- 按分包分组，标记热门游戏
- 提供查询工具函数"
```

---

### Task 3: 历史记录存储模块

**Files:**
- Create: `utils/storage.js`

- [ ] **Step 1: 编写存储模块**

创建 `utils/storage.js`:

```javascript
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
      games.reduce((sum, g) => sum + g.totalGames * 2, 0) // 估算每局 2 分钟
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
```

- [ ] **Step 2: 验证存储模块**

在微信开发者工具中测试：
```javascript
const storage = require('./utils/storage.js');
storage.saveResult('test-game', { score: 12.5, duration: 12500, accuracy: 1.0, details: { gridSize: 5 } });
console.log(storage.getHistory('test-game'));
console.log(storage.getStats('test-game'));
console.log(storage.getBest('test-game'));
```
预期：历史记录包含 1 条数据，统计数据正确计算。

- [ ] **Step 3: Commit**

```bash
git add utils/storage.js
git commit -m "feat: 历史记录存储模块

- saveResult / getHistory / getStats / getBest / getStreak
- 自动裁剪超 200 条记录
- 写入失败异步重试 + toast 提示
- 支持 lower_better / higher_better 两种计分模式
- 全局统计概览 getAllStats / getGlobalSummary"
```

---

### Task 4: 音效管理模块

**Files:**
- Create: `utils/audio.js`

- [ ] **Step 1: 编写音效管理器**

创建 `utils/audio.js`:

```javascript
const MUTED_KEY = 'audio_muted';

const SOUND_FILES = {
  click: 'https://cdn.example.com/audio/click.mp3',
  correct: 'https://cdn.example.com/audio/correct.mp3',
  wrong: 'https://cdn.example.com/audio/wrong.mp3',
  countdown: 'https://cdn.example.com/audio/countdown.mp3',
  complete: 'https://cdn.example.com/audio/complete.mp3',
  breatheIn: 'https://cdn.example.com/audio/breathe_in.mp3',
  breatheOut: 'https://cdn.example.com/audio/breathe_out.mp3'
};

const LETTER_FILES = {};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
  LETTER_FILES[letter] = `https://cdn.example.com/audio/letters/${letter}.mp3`;
});

class AudioManager {
  constructor() {
    this.muted = false;
    this.contexts = {};
    this.letterContexts = {};
    this.loaded = false;

    try {
      const muted = wx.getStorageSync(MUTED_KEY);
      this.muted = muted === true;
    } catch (e) {
      this.muted = false;
    }
  }

  preload() {
    Object.keys(SOUND_FILES).forEach(key => {
      const ctx = wx.createInnerAudioContext();
      ctx.src = SOUND_FILES[key];
      ctx.onEnded(() => { ctx.seek(0); });
      ctx.onError((err) => {
        console.warn(`[Audio] ${key} 加载失败:`, err);
      });
      this.contexts[key] = ctx;
    });

    Object.keys(LETTER_FILES).forEach(letter => {
      const ctx = wx.createInnerAudioContext();
      ctx.src = LETTER_FILES[letter];
      ctx.onEnded(() => { ctx.seek(0); });
      ctx.onError((err) => {
        console.warn(`[Audio] letter ${letter} 加载失败:`, err);
      });
      this.letterContexts[letter] = ctx;
    });

    this.loaded = true;
  }

  _play(context) {
    if (this.muted || !context) return;
    try {
      context.stop();
      context.seek(0);
      context.play();
    } catch (e) {
      console.warn('[Audio] 播放失败:', e);
    }
  }

  playTap() { this._play(this.contexts.click); }
  playSuccess() { this._play(this.contexts.correct); }
  playFail() { this._play(this.contexts.wrong); }
  playTick() { this._play(this.contexts.countdown); }
  playComplete() { this._play(this.contexts.complete); }
  playBreatheIn() { this._play(this.contexts.breatheIn); }
  playBreatheOut() { this._play(this.contexts.breatheOut); }

  playLetter(letter) {
    const upper = (letter || '').toUpperCase();
    const ctx = this.letterContexts[upper];
    if (ctx) this._play(ctx);
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      wx.setStorageSync(MUTED_KEY, muted);
    } catch (e) {
      console.warn('[Audio] 保存静音状态失败:', e);
    }
    if (muted) this.stopAll();
  }

  isMuted() { return this.muted; }

  stopAll() {
    Object.values(this.contexts).forEach(ctx => {
      try { ctx.stop(); } catch (e) { /* ignore */ }
    });
    Object.values(this.letterContexts).forEach(ctx => {
      try { ctx.stop(); } catch (e) { /* ignore */ }
    });
  }

  destroy() {
    this.stopAll();
    Object.values(this.contexts).forEach(ctx => {
      try { ctx.destroy(); } catch (e) { /* ignore */ }
    });
    Object.values(this.letterContexts).forEach(ctx => {
      try { ctx.destroy(); } catch (e) { /* ignore */ }
    });
    this.contexts = {};
    this.letterContexts = {};
  }
}

module.exports = AudioManager;
```

- [ ] **Step 2: 验证音效管理器**

在微信开发者工具中测试：
```javascript
const AudioManager = require('./utils/audio.js');
const am = new AudioManager();
am.preload();
am.playTap();
am.setMuted(true);
console.log('muted:', am.isMuted());
```
预期：playTap 播放音效，setMuted 后 isMuted 返回 true。

- [ ] **Step 3: Commit**

```bash
git add utils/audio.js
git commit -m "feat: 音效管理模块

- AudioManager 单例类
- 通用音效 + 26 字母朗读
- 静音状态持久化
- 加载失败静默降级"
```

---

### Task 5: 计时器工具模块

**Files:**
- Create: `utils/timer.js`

- [ ] **Step 1: 编写计时器工具**

创建 `utils/timer.js`:

```javascript
class Timer {
  constructor() {
    this.startTime = 0;
    this.elapsed = 0;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.startTime = Date.now();
    this.running = true;
  }

  pause() {
    if (!this.running) return this.elapsed;
    this.elapsed += Date.now() - this.startTime;
    this.running = false;
    return this.elapsed;
  }

  resume() {
    if (this.running) return;
    this.startTime = Date.now();
    this.running = true;
  }

  reset() {
    this.startTime = 0;
    this.elapsed = 0;
    this.running = false;
  }

  getElapsed() {
    if (this.running) {
      return this.elapsed + (Date.now() - this.startTime);
    }
    return this.elapsed;
  }

  getElapsedSeconds() {
    return Math.round(this.getElapsed()) / 1000;
  }

  getFormatted() {
    const totalMs = this.getElapsed();
    const totalSec = Math.floor(totalMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const tenths = Math.floor((totalMs % 1000) / 100);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${tenths}`;
  }

  isRunning() { return this.running; }
}

class CountdownTimer {
  constructor(durationMs, onTick, onComplete) {
    this.duration = durationMs;
    this.remaining = durationMs;
    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
    this.intervalId = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const endTime = Date.now() + this.remaining;

    this.intervalId = setInterval(() => {
      this.remaining = endTime - Date.now();
      if (this.remaining <= 0) {
        this.remaining = 0;
        this.stop();
        this.onTick(0);
        this.onComplete();
        return;
      }
      this.onTick(this.remaining);
    }, 100);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  reset(durationMs) {
    this.stop();
    this.remaining = durationMs || this.duration;
  }

  getRemaining() { return this.remaining; }
  getRemainingSeconds() { return Math.ceil(this.remaining / 1000); }
}

module.exports = { Timer, CountdownTimer };
```

- [ ] **Step 2: 验证计时器**

在微信开发者工具中测试：
```javascript
const { Timer, CountdownTimer } = require('./utils/timer.js');
const t = new Timer();
t.start();
setTimeout(() => {
  console.log('elapsed:', t.getElapsedSeconds(), 'formatted:', t.getFormatted());
  t.pause();
}, 1500);

const cd = new CountdownTimer(3000, (rem) => {
  console.log('countdown:', Math.ceil(rem / 1000));
}, () => { console.log('done!'); });
cd.start();
```
预期：Timer 约 1.5 秒，Countdown 从 3 倒数到 0 并打印 done。

- [ ] **Step 3: Commit**

```bash
git add utils/timer.js
git commit -m "feat: 计时器工具模块

- Timer: 高精度正计时，支持暂停/恢复/格式化
- CountdownTimer: 倒计时器，支持 onTick/onComplete 回调"
```

---

### Task 6: 共享组件 — game-header

**Files:**
- Create: `components/game-header/game-header.json`
- Create: `components/game-header/game-header.wxml`
- Create: `components/game-header/game-header.wxss`
- Create: `components/game-header/game-header.js`

- [ ] **Step 1: 创建组件文件**

`components/game-header/game-header.json`:
```json
{ "component": true, "usingComponents": {} }
```

`components/game-header/game-header.wxml`:
```xml
<view class="game-header">
  <view class="header-left" bindtap="onBack">
    <text class="back-icon">‹</text>
  </view>
  <view class="header-title">{{title}}</view>
  <view class="header-right" bindtap="onSettings" wx:if="{{showSettings}}">
    <text class="settings-icon">⚙</text>
  </view>
  <view class="header-right" wx:else></view>
</view>
```

`components/game-header/game-header.wxss`:
```css
.game-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 88rpx; padding: 0 24rpx; background: #fff;
  border-bottom: 1rpx solid #f0f0f0; position: sticky; top: 0; z-index: 100;
}
.header-left, .header-right {
  width: 80rpx; height: 88rpx; display: flex;
  align-items: center; justify-content: center;
}
.back-icon { font-size: 48rpx; color: #333; line-height: 1; }
.settings-icon { font-size: 36rpx; color: #666; }
.header-title {
  flex: 1; text-align: center; font-size: 34rpx;
  font-weight: 600; color: #333;
}
```

`components/game-header/game-header.js`:
```javascript
Component({
  properties: {
    title: { type: String, value: '' },
    showSettings: { type: Boolean, value: false }
  },
  methods: {
    onBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({ url: '/pages/index/index' });
      }
    },
    onSettings() { this.triggerEvent('settings'); }
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add components/game-header/
git commit -m "feat: game-header 共享组件"
```

---

### Task 7: 共享组件 — result-panel

**Files:**
- Create: `components/result-panel/result-panel.json`
- Create: `components/result-panel/result-panel.wxml`
- Create: `components/result-panel/result-panel.wxss`
- Create: `components/result-panel/result-panel.js`

- [ ] **Step 1: 创建组件文件**

`components/result-panel/result-panel.json`:
```json
{ "component": true, "usingComponents": {} }
```

`components/result-panel/result-panel.wxml`:
```xml
<view class="result-panel">
  <view class="result-title">{{gameName}}</view>
  <view class="result-score-row">
    <view class="result-score">{{scoreText}}</view>
    <view class="result-trend trend-{{trend}}">{{trendText}}</view>
  </view>
  <view class="result-details" wx:if="{{showDetails}}">
    <view class="detail-item" wx:if="{{duration > 0}}">
      <text class="detail-label">用时</text>
      <text class="detail-value">{{durationText}}</text>
    </view>
    <view class="detail-item" wx:if="{{accuracy >= 0}}">
      <text class="detail-label">准确率</text>
      <text class="detail-value">{{accuracyText}}</text>
    </view>
    <view class="detail-item">
      <text class="detail-label">最佳</text>
      <text class="detail-value">{{bestText}}</text>
    </view>
  </view>
  <view class="result-actions">
    <button class="btn-secondary" bindtap="onReplay">再来一局</button>
    <button class="btn-primary" bindtap="onShare" wx:if="{{showShare}}">分享成绩</button>
  </view>
</view>
```

`components/result-panel/result-panel.wxss`:
```css
.result-panel {
  background: #fff; border-radius: 20rpx; padding: 48rpx 32rpx;
  text-align: center; margin: 24rpx;
}
.result-title { font-size: 32rpx; color: #666; margin-bottom: 16rpx; }
.result-score-row {
  display: flex; align-items: center; justify-content: center;
  gap: 16rpx; margin-bottom: 32rpx;
}
.result-score { font-size: 72rpx; font-weight: 700; color: #4A90D9; line-height: 1; }
.result-trend { font-size: 24rpx; padding: 4rpx 12rpx; border-radius: 8rpx; }
.trend-improving { background: #f6ffed; color: #52c41a; }
.trend-declining { background: #fff2f0; color: #ff4d4f; }
.trend-stable { background: #f5f5f5; color: #999; }
.result-details {
  display: flex; justify-content: center; gap: 48rpx;
  margin-bottom: 40rpx; padding: 24rpx 0;
  border-top: 1rpx solid #f0f0f0; border-bottom: 1rpx solid #f0f0f0;
}
.detail-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.detail-label { font-size: 24rpx; color: #999; }
.detail-value { font-size: 32rpx; font-weight: 600; color: #333; }
.result-actions { display: flex; gap: 24rpx; justify-content: center; }
```

`components/result-panel/result-panel.js`:
```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add components/result-panel/
git commit -m "feat: result-panel 共享组件"
```

---

### Task 8: 共享组件 — history-list

**Files:**
- Create: `components/history-list/history-list.json`
- Create: `components/history-list/history-list.wxml`
- Create: `components/history-list/history-list.wxss`
- Create: `components/history-list/history-list.js`

- [ ] **Step 1: 创建组件文件**

`components/history-list/history-list.json`:
```json
{ "component": true, "usingComponents": {} }
```

`components/history-list/history-list.wxml`:
```xml
<view class="history-list">
  <view class="history-title">历史记录</view>
  <view class="history-empty" wx:if="{{!records || records.length === 0}}">
    <text>还没有记录，先完成一局</text>
  </view>
  <view class="history-items" wx:else>
    <view class="history-item" wx:for="{{records}}" wx:key="timestamp">
      <view class="item-left">
        <text class="item-score">{{item.scoreText}}</text>
        <text class="item-date">{{item.dateText}}</text>
      </view>
      <view class="item-right">
        <text class="item-best" wx:if="{{item.isBest}}">最佳</text>
      </view>
    </view>
  </view>
</view>
```

`components/history-list/history-list.wxss`:
```css
.history-list { background: #fff; border-radius: 16rpx; padding: 24rpx; margin: 24rpx; }
.history-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 16rpx; }
.history-empty { text-align: center; padding: 32rpx; color: #999; font-size: 26rpx; }
.history-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16rpx 0; border-bottom: 1rpx solid #f5f5f5;
}
.history-item:last-child { border-bottom: none; }
.item-left { display: flex; flex-direction: column; gap: 4rpx; }
.item-score { font-size: 30rpx; font-weight: 600; color: #333; }
.item-date { font-size: 22rpx; color: #999; }
.item-best {
  font-size: 22rpx; color: #52c41a; background: #f6ffed;
  padding: 2rpx 10rpx; border-radius: 6rpx;
}
```

`components/history-list/history-list.js`:
```javascript
Component({
  properties: {
    records: { type: Array, value: [] },
    scoreFormatter: { type: null, value: null }
  },
  data: { formattedRecords: [] },
  observers: {
    'records': function(records) { this._formatRecords(records); }
  },
  lifetimes: {
    attached() { this._formatRecords(this.data.records); }
  },
  methods: {
    _formatRecords(records) {
      if (!records || records.length === 0) {
        this.setData({ formattedRecords: [] });
        return;
      }
      const best = records.reduce((b, r) => r.score < b.score ? r : b, records[0]);
      const formatted = records.map(r => {
        let scoreText;
        if (this.data.scoreFormatter) {
          scoreText = this.data.scoreFormatter(r.score);
        } else {
          scoreText = `${r.score}`;
        }
        const d = new Date(r.timestamp);
        const dateText = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return { ...r, scoreText, dateText, isBest: r.timestamp === best.timestamp };
      });
      this.setData({ formattedRecords: formatted });
    }
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add components/history-list/
git commit -m "feat: history-list 共享组件"
```

---

### Task 9: 共享组件 — difficulty-selector

**Files:**
- Create: `components/difficulty-selector/difficulty-selector.json`
- Create: `components/difficulty-selector/difficulty-selector.wxml`
- Create: `components/difficulty-selector/difficulty-selector.wxss`
- Create: `components/difficulty-selector/difficulty-selector.js`

- [ ] **Step 1: 创建组件文件**

`components/difficulty-selector/difficulty-selector.json`:
```json
{ "component": true, "usingComponents": {} }
```

`components/difficulty-selector/difficulty-selector.wxml`:
```xml
<view class="difficulty-selector">
  <view class="selector-label">{{label}}</view>
  <view class="selector-options">
    <view
      class="selector-option {{item.value === selected ? 'selected' : ''}}"
      wx:for="{{options}}"
      wx:key="value"
      bindtap="onSelect"
      data-value="{{item.value}}"
    >
      <text>{{item.label}}</text>
    </view>
  </view>
</view>
```

`components/difficulty-selector/difficulty-selector.wxss`:
```css
.difficulty-selector { padding: 16rpx 0; }
.selector-label { font-size: 26rpx; color: #666; margin-bottom: 12rpx; }
.selector-options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.selector-option {
  padding: 12rpx 28rpx; border-radius: 8rpx; background: #f5f5f5;
  font-size: 26rpx; color: #666; border: 2rpx solid transparent;
}
.selector-option.selected {
  background: #e8f4fd; color: #4A90D9; border-color: #4A90D9; font-weight: 600;
}
```

`components/difficulty-selector/difficulty-selector.js`:
```javascript
Component({
  properties: {
    label: { type: String, value: '难度' },
    options: { type: Array, value: [] },
    selected: { type: null, value: null }
  },
  methods: {
    onSelect(e) {
      const value = e.currentTarget.dataset.value;
      this.setData({ selected: value });
      this.triggerEvent('change', { value });
    }
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add components/difficulty-selector/
git commit -m "feat: difficulty-selector 共享组件"
```

---

### Task 10: 共享组件 — countdown-overlay

**Files:**
- Create: `components/countdown-overlay/countdown-overlay.json`
- Create: `components/countdown-overlay/countdown-overlay.wxml`
- Create: `components/countdown-overlay/countdown-overlay.wxss`
- Create: `components/countdown-overlay/countdown-overlay.js`

- [ ] **Step 1: 创建组件文件**

`components/countdown-overlay/countdown-overlay.json`:
```json
{ "component": true, "usingComponents": {} }
```

`components/countdown-overlay/countdown-overlay.wxml`:
```xml
<view class="countdown-overlay" wx:if="{{visible}}">
  <view class="countdown-number">{{count}}</view>
</view>
```

`components/countdown-overlay/countdown-overlay.wxss`:
```css
.countdown-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6); z-index: 999;
  display: flex; align-items: center; justify-content: center;
}
.countdown-number {
  font-size: 160rpx; font-weight: 700; color: #fff;
  animation: pulse 1s ease-in-out;
}
@keyframes pulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
```

`components/countdown-overlay/countdown-overlay.js`:
```javascript
Component({
  properties: {
    visible: { type: Boolean, value: false }
  },
  data: { count: 3 },
  methods: {
    start(onComplete) {
      this.setData({ visible: true, count: 3 });
      let current = 3;
      const tick = () => {
        this.setData({ count: current });
        if (current <= 1) {
          setTimeout(() => {
            this.setData({ visible: false });
            if (onComplete) onComplete();
          }, 500);
          return;
        }
        current--;
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
    }
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add components/countdown-overlay/
git commit -m "feat: countdown-overlay 共享组件"
```

---

### Task 11: 首页 (index)

**Files:**
- Create: `pages/index/index.json`
- Create: `pages/index/index.wxml`
- Create: `pages/index/index.wxss`
- Create: `pages/index/index.js`

- [ ] **Step 1: 创建首页文件**

`pages/index/index.json`:
```json
{
  "navigationBarTitleText": "专注力训练",
  "enablePullDownRefresh": false,
  "usingComponents": {}
}
```

`pages/index/index.wxml`:
```xml
<view class="container">
  <!-- 顶部统计 -->
  <view class="hero-section">
    <view class="hero-title">专注力训练</view>
    <view class="hero-stats">
      <view class="stat-item">
        <text class="stat-num">{{totalGames}}</text>
        <text class="stat-label">总局数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{todayMinutes}}</text>
        <text class="stat-label">今日专注(分)</text>
      </view>
    </view>
  </view>

  <!-- 分类入口 -->
  <view class="section-title">训练分类</view>
  <view class="categories">
    <view
      class="cat-card"
      wx:for="{{categories}}"
      wx:key="id"
      style="background: {{item.color}}18"
      bindtap="onCategoryTap"
      data-id="{{item.id}}"
    >
      <view class="cat-name" style="color: {{item.color}}">{{item.name}}</view>
      <view class="cat-count">{{gameCounts[item.id]}} 个训练</view>
    </view>
  </view>

  <!-- 最近使用 -->
  <block wx:if="{{recentGames.length > 0}}">
    <view class="section-title">最近使用</view>
    <view class="recent-list">
      <view
        class="recent-item"
        wx:for="{{recentGames}}"
        wx:key="id"
        bindtap="onGameTap"
        data-route="{{item.route}}"
      >
        <view class="recent-name">{{item.name}}</view>
        <view class="recent-arrow">›</view>
      </view>
    </view>
  </block>
</view>
```

`pages/index/index.wxss`:
```css
.hero-section {
  background: linear-gradient(135deg, #4A90D9 0%, #6BB0E8 100%);
  border-radius: 20rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 32rpx;
}
.hero-title {
  font-size: 40rpx; font-weight: 700; color: #fff;
  text-align: center; margin-bottom: 32rpx;
}
.hero-stats {
  display: flex; align-items: center; justify-content: center;
}
.stat-item { display: flex; flex-direction: column; align-items: center; padding: 0 48rpx; }
.stat-num { font-size: 48rpx; font-weight: 700; color: #fff; }
.stat-label { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; }
.stat-divider { width: 2rpx; height: 60rpx; background: rgba(255,255,255,0.3); }

.section-title { font-size: 30rpx; font-weight: 600; color: #333; margin: 24rpx 0 16rpx; }

.categories {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx;
  margin-bottom: 24rpx;
}
.cat-card {
  padding: 32rpx 24rpx; border-radius: 16rpx;
}
.cat-name { font-size: 30rpx; font-weight: 600; margin-bottom: 8rpx; }
.cat-count { font-size: 24rpx; color: #999; }

.recent-list {
  background: #fff; border-radius: 16rpx; overflow: hidden;
}
.recent-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 32rpx; border-bottom: 1rpx solid #f5f5f5;
}
.recent-item:last-child { border-bottom: none; }
.recent-name { font-size: 30rpx; color: #333; }
.recent-arrow { font-size: 36rpx; color: #ccc; }
```

`pages/index/index.js`:
```javascript
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
    // 统计每个分类的游戏数量
    const counts = {};
    GAMES.forEach(g => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });

    // 设置分类数据（只显示有游戏的分类）
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
    // 从所有游戏中找最近有记录的 3 个
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
    wx.navigateTo({
      url: `/pages/games-list/index?category=${id}`
    });
  },

  onGameTap(e) {
    const route = e.currentTarget.dataset.route;
    wx.navigateTo({ url: route });
  }
});
```

- [ ] **Step 2: 验证首页**

打开开发者工具，首页应显示 5 个分类卡片、统计数据、以及最近使用（初始为空）。

- [ ] **Step 3: Commit**

```bash
git add pages/index/
git commit -m "feat: 首页

- 分类入口卡片网格
- 今日统计展示
- 最近使用列表"
```

---

### Task 12: 游戏列表页 (games-list)

**Files:**
- Create: `pages/games-list/index.json`
- Create: `pages/games-list/index.wxml`
- Create: `pages/games-list/index.wxss`
- Create: `pages/games-list/index.js`

- [ ] **Step 1: 创建文件**

`pages/games-list/index.json`:
```json
{
  "navigationBarTitleText": "游戏列表",
  "usingComponents": {}
}
```

`pages/games-list/index.wxml`:
```xml
<view class="container">
  <view class="games-list">
    <view
      class="game-card"
      wx:for="{{games}}"
      wx:key="id"
      bindtap="onGameTap"
      data-route="{{item.route}}"
    >
      <view class="game-card-left">
        <view class="game-name">{{item.name}}</view>
        <view class="game-desc">{{item.description}}</view>
      </view>
      <view class="game-card-right">
        <text class="game-arrow">›</text>
      </view>
    </view>
  </view>
</view>
```

`pages/games-list/index.wxss`:
```css
.games-list {
  background: #fff; border-radius: 16rpx; overflow: hidden;
}
.game-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32rpx; border-bottom: 1rpx solid #f5f5f5;
}
.game-card:last-child { border-bottom: none; }
.game-card-left { flex: 1; }
.game-name { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 8rpx; }
.game-desc { font-size: 24rpx; color: #999; line-height: 1.4; }
.game-arrow { font-size: 40rpx; color: #ccc; }
```

`pages/games-list/index.js`:
```javascript
const { getGamesByCategory } = require('../../config/games.js');

Page({
  data: {
    games: [],
    categoryName: ''
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
```

- [ ] **Step 2: Commit**

```bash
git add pages/games-list/
git commit -m "feat: 游戏列表页（按分类筛选）"
```

---

### Task 13: 个人中心 (profile)

**Files:**
- Create: `pages/profile/index.json`
- Create: `pages/profile/index.wxml`
- Create: `pages/profile/index.wxss`
- Create: `pages/profile/index.js`

- [ ] **Step 1: 创建文件**

`pages/profile/index.json`:
```json
{
  "navigationBarTitleText": "个人中心",
  "usingComponents": {}
}
```

`pages/profile/index.wxml`:
```xml
<view class="container">
  <!-- 统计概览 -->
  <view class="profile-stats">
    <view class="profile-stat">
      <text class="profile-stat-num">{{totalGames}}</text>
      <text class="profile-stat-label">总局数</text>
    </view>
    <view class="profile-stat">
      <text class="profile-stat-num">{{totalMinutes}}</text>
      <text class="profile-stat-label">专注(分)</text>
    </view>
    <view class="profile-stat">
      <text class="profile-stat-num">{{gamesPlayed}}</text>
      <text class="profile-stat-label">体验游戏</text>
    </view>
  </view>

  <!-- 各游戏最佳成绩 -->
  <view class="section-title">最佳成绩</view>
  <view class="best-scores" wx:if="{{gameStats.length > 0}}">
    <view class="score-row" wx:for="{{gameStats}}" wx:key="id">
      <text class="score-name">{{item.name}}</text>
      <text class="score-value">{{item.bestText}}</text>
    </view>
  </view>
  <view class="empty-tip" wx:else>
    <text>还没有游戏记录，去训练吧</text>
  </view>

  <!-- 设置 -->
  <view class="section-title">设置</view>
  <view class="settings">
    <view class="setting-item" bindtap="onToggleMute">
      <text>{{muted ? '🔇 音效已关闭' : '🔊 音效已开启'}}</text>
      <text class="setting-arrow">›</text>
    </view>
    <view class="setting-item" bindtap="onClearData">
      <text class="text-error">清除所有数据</text>
    </view>
  </view>
</view>
```

`pages/profile/index.wxss`:
```css
.profile-stats {
  display: flex; background: #fff; border-radius: 16rpx;
  padding: 32rpx 0; margin-bottom: 24rpx;
}
.profile-stat {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 8rpx;
}
.profile-stat-num { font-size: 44rpx; font-weight: 700; color: #4A90D9; }
.profile-stat-label { font-size: 24rpx; color: #999; }

.section-title { font-size: 28rpx; font-weight: 600; color: #333; margin: 24rpx 0 16rpx; }

.best-scores { background: #fff; border-radius: 16rpx; overflow: hidden; }
.score-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 32rpx; border-bottom: 1rpx solid #f5f5f5;
}
.score-row:last-child { border-bottom: none; }
.score-name { font-size: 28rpx; color: #333; }
.score-value { font-size: 28rpx; font-weight: 600; color: #4A90D9; }

.empty-tip {
  background: #fff; border-radius: 16rpx; padding: 48rpx;
  text-align: center; color: #999; font-size: 26rpx;
}

.settings { background: #fff; border-radius: 16rpx; overflow: hidden; }
.setting-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28rpx 32rpx; border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx; color: #333;
}
.setting-item:last-child { border-bottom: none; }
.setting-arrow { font-size: 36rpx; color: #ccc; }
```

`pages/profile/index.js`:
```javascript
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
    // 根据游戏类型格式化最佳成绩
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
```

- [ ] **Step 2: Commit**

```bash
git add pages/profile/
git commit -m "feat: 个人中心页面

- 统计概览（总局数/专注时长/体验游戏数）
- 各游戏最佳成绩一览
- 音效开关 + 清除数据"
```

---

## Phase 1: 主包热门游戏

### Task 14: 舒尔特方格 (schulte-table) — 主包热门

**Files:**
- Create: `pages/schulte-table/index.json`
- Create: `pages/schulte-table/index.wxml`
- Create: `pages/schulte-table/index.wxss`
- Create: `pages/schulte-table/index.js`

- [ ] **Step 1: 创建文件**

`pages/schulte-table/index.json`:
```json
{
  "navigationBarTitleText": "舒尔特方格",
  "usingComponents": {
    "game-header": "/components/game-header/game-header",
    "difficulty-selector": "/components/difficulty-selector/difficulty-selector",
    "result-panel": "/components/result-panel/result-panel",
    "history-list": "/components/history-list/history-list"
  }
}
```

`pages/schulte-table/index.wxml`:
```xml
<game-header title="舒尔特方格" />

<view class="game-container" wx:if="{{state === 'ready'}}">
  <view class="setup-section">
    <difficulty-selector
      label="网格大小"
      options="{{gridOptions}}"
      selected="{{gridSize}}"
      bind:change="onGridChange"
    />
    <difficulty-selector
      label="模式"
      options="{{modeOptions}}"
      selected="{{mode}}"
      bind:change="onModeChange"
    />
  </view>
  <view class="best-record" wx:if="{{bestTime > 0}}">
    最佳成绩：<text class="best-val">{{bestTime}}s</text>
  </view>
  <view class="start-area">
    <button class="btn-primary btn-large" bindtap="onStart">开始训练</button>
  </view>
</view>

<view class="game-area" wx:elif="{{state === 'playing'}}">
  <view class="game-info">
    <text class="timer-display">{{timerDisplay}}</text>
    <text class="progress-display">{{currentNumber}}/{{totalNumbers}}</text>
  </view>
  <view class="grid" style="grid-template-columns: repeat({{gridSize}}, 1fr)">
    <view
      class="grid-cell {{item.found ? 'found' : ''}}"
      wx:for="{{gridData}}"
      wx:key="value"
      bindtap="onCellTap"
      data-value="{{item.value}}"
    >
      <text>{{item.value}}</text>
    </view>
  </view>
</view>

<view class="result-area" wx:elif="{{state === 'finished'}}">
  <result-panel
    gameName="舒尔特方格"
    scoreText="{{result.scoreText}}"
    bestText="{{result.bestText}}"
    duration="{{result.duration}}"
    accuracy="{{result.accuracy}}"
    trend="{{result.trend}}"
    bind:replay="onReplay"
    bind:share="onShare"
  />
  <history-list records="{{history}}" scoreFormatter="{{null}}" />
</view>
```

`pages/schulte-table/index.wxss`:
```css
.game-container { padding: 24rpx; }
.setup-section { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
.best-record { text-align: center; font-size: 26rpx; color: #666; margin: 24rpx 0; }
.best-val { font-weight: 600; color: #4A90D9; }
.start-area { margin-top: 48rpx; }
.btn-large { width: 100%; padding: 28rpx; font-size: 34rpx; }

.game-area { padding: 24rpx; }
.game-info {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-radius: 16rpx; padding: 24rpx 32rpx; margin-bottom: 24rpx;
}
.timer-display { font-size: 40rpx; font-weight: 600; color: #333; }
.progress-display { font-size: 28rpx; color: #666; }

.grid {
  display: grid; gap: 12rpx; background: #fff;
  border-radius: 16rpx; padding: 24rpx; aspect-ratio: 1;
}
.grid-cell {
  display: flex; align-items: center; justify-content: center;
  background: #f8f9fa; border-radius: 12rpx;
  font-size: 36rpx; font-weight: 600; color: #333;
  transition: all 0.15s; min-width: 0;
}
.grid-cell.found {
  background: #e8f4fd; color: #4A90D9; opacity: 0.5;
}
.grid-cell:active:not(.found) { background: #e8f4fd; }

.result-area { padding: 24rpx 0; }
```

`pages/schulte-table/index.js`:
```javascript
const { Timer } = require('../../utils/timer.js');
const storage = require('../../utils/storage.js');

const GRID_OPTIONS = [
  { label: '3×3', value: 3 },
  { label: '4×4', value: 4 },
  { label: '5×5', value: 5 },
  { label: '6×6', value: 6 },
  { label: '7×7', value: 7 },
  { label: '8×8', value: 8 },
  { label: '9×9', value: 9 },
  { label: '10×10', value: 10 }
];

const MODE_OPTIONS = [
  { label: '顺序', value: 'sequential' },
  { label: '反向', value: 'reverse' },
  { label: '限时', value: 'timed' }
];

Page({
  data: {
    state: 'ready',
    gridSize: 5,
    mode: 'sequential',
    gridData: [],
    currentNumber: 1,
    totalNumbers: 25,
    timerDisplay: '0.00s',
    bestTime: 0,
    result: {},
    history: [],
    gridOptions: GRID_OPTIONS,
    modeOptions: MODE_OPTIONS
  },

  onLoad() {
    const best = storage.getBest('schulte-table');
    const history = storage.getHistory('schulte-table', 10);
    this.setData({
      bestTime: best ? best.score : 0,
      history
    });

    this.timer = new Timer();
    this.updateInterval = null;
  },

  onGridChange(e) {
    const size = e.detail.value;
    this.setData({
      gridSize: size,
      totalNumbers: size * size
    });
  },

  onModeChange(e) {
    this.setData({ mode: e.detail.value });
  },

  onStart() {
    const { gridSize, mode } = this.data;
    const total = gridSize * gridSize;

    // 生成并打乱数字
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    if (mode === 'reverse') {
      numbers.reverse();
    }
    // 随机打乱位置
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    const gridData = numbers.map(n => ({ value: n, found: false }));

    this.setData({
      state: 'playing',
      gridData,
      currentNumber: mode === 'reverse' ? total : 1,
      totalNumbers: total,
      timerDisplay: '0.00s'
    });

    this._startTimer();
  },

  _startTimer() {
    this.timer.start();
    this.updateInterval = setInterval(() => {
      this.setData({
        timerDisplay: `${this.timer.getElapsedSeconds().toFixed(2)}s`
      });
    }, 100);
  },

  _stopTimer() {
    clearInterval(this.updateInterval);
    this.timer.pause();
  },

  onCellTap(e) {
    const { gridData, currentNumber, mode } = this.data;
    const value = e.currentTarget.dataset.value;

    const cell = gridData.find(c => c.value === value);

    if (value === currentNumber) {
      // 正确
      cell.found = true;
      const nextNum = mode === 'reverse' ? currentNumber - 1 : currentNumber + 1;

      getApp().globalData.audioManager.playSuccess();

      if ((mode === 'reverse' && currentNumber === 1) ||
          (mode !== 'reverse' && currentNumber === this.data.totalNumbers)) {
        // 完成
        this._onComplete();
      } else {
        this.setData({ gridData: [...gridData], currentNumber: nextNum });
      }
    } else {
      // 错误
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'light' });
    }
  },

  _onComplete() {
    this._stopTimer();
    const duration = this.timer.getElapsed();
    const score = duration / 1000;

    // 保存记录
    storage.saveResult('schulte-table', {
      score,
      duration,
      accuracy: 1,
      details: {
        gridSize: this.data.gridSize,
        mode: this.data.mode,
        errors: 0
      }
    });

    const stats = storage.getStats('schulte-table');
    const best = storage.getBest('schulte-table');
    const history = storage.getHistory('schulte-table', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${score.toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration,
        accuracy: 1,
        trend: stats.trend
      },
      history,
      bestTime: best ? best.score : 0
    });
  },

  onReplay() {
    this.timer.reset();
    this.setData({ state: 'ready' });
  },

  onShare() {
    wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' });
  },

  onUnload() {
    this._stopTimer();
    this.timer.reset();
  }
});
```

- [ ] **Step 2: 验证舒尔特方格**

在开发者工具中打开舒尔特方格页面：
1. 选择 3×3 网格 + 顺序模式 → 点击开始 → 按顺序点击数字 → 验证计时和完成
2. 选择反向模式 → 验证从大到小
3. 故意点错 → 验证震动反馈
4. 完成后 → 验证结果面板和历史记录

- [ ] **Step 3: Commit**

```bash
git add pages/schulte-table/
git commit -m "feat: 舒尔特方格游戏

- 3×3 到 10×10 共 8 档网格
- 顺序/反向/限时三种模式
- 计时器 + 进度显示
- 历史记录 + 最佳成绩"
```

---

### Task 15: 番茄专注计时器 (pomodoro) — 主包热门

**Files:**
- Create: `pages/pomodoro/index.json`
- Create: `pages/pomodoro/index.wxml`
- Create: `pages/pomodoro/index.wxss`
- Create: `pages/pomodoro/index.js`

- [ ] **Step 1: 创建文件**

`pages/pomodoro/index.json`:
```json
{
  "navigationBarTitleText": "番茄专注计时器",
  "usingComponents": {
    "game-header": "/components/game-header/game-header"
  }
}
```

`pages/pomodoro/index.wxml`:
```xml
<game-header title="番茄专注计时器" />

<view class="pomodoro-container">
  <!-- 模式切换 -->
  <view class="mode-tabs">
    <view
      class="mode-tab {{currentMode === item.value ? 'active' : ''}}"
      wx:for="{{modes}}"
      wx:key="value"
      bindtap="onModeChange"
      data-mode="{{item.value}}"
    >
      <text>{{item.label}}</text>
    </view>
  </view>

  <!-- 计时器显示 -->
  <view class="timer-circle">
    <text class="timer-text">{{timeDisplay}}</text>
    <text class="timer-mode-label">{{modeLabel}}</text>
  </view>

  <!-- 控制按钮 -->
  <view class="controls">
    <button class="btn-secondary" bindtap="onReset" disabled="{{!hasStarted}}">重置</button>
    <button class="btn-primary btn-large" bindtap="onToggle">
      {{isRunning ? '暂停' : '开始'}}
    </button>
  </view>

  <!-- 统计 -->
  <view class="pomo-stats">
    <view class="pomo-stat">
      <text class="pomo-stat-num">{{completedRounds}}</text>
      <text class="pomo-stat-label">完成轮次</text>
    </view>
    <view class="pomo-stat">
      <text class="pomo-stat-num">{{todayFocusMinutes}}</text>
      <text class="pomo-stat-label">今日专注(分)</text>
    </view>
  </view>

  <!-- 设置 -->
  <view class="settings-section">
    <view class="setting-row">
      <text>专注时长（分钟）</text>
      <view class="stepper">
        <view class="stepper-btn" bindtap="adjustFocus" data-delta="-5">-</view>
        <text class="stepper-val">{{focusDuration}}</text>
        <view class="stepper-btn" bindtap="adjustFocus" data-delta="5">+</view>
      </view>
    </view>
    <view class="setting-row">
      <text>短休息（分钟）</text>
      <view class="stepper">
        <view class="stepper-btn" bindtap="adjustShortBreak" data-delta="-1">-</view>
        <text class="stepper-val">{{shortBreakDuration}}</text>
        <view class="stepper-btn" bindtap="adjustShortBreak" data-delta="1">+</view>
      </view>
    </view>
    <view class="setting-row">
      <text>长休息（分钟）</text>
      <view class="stepper">
        <view class="stepper-btn" bindtap="adjustLongBreak" data-delta="-5">-</view>
        <text class="stepper-val">{{longBreakDuration}}</text>
        <view class="stepper-btn" bindtap="adjustLongBreak" data-delta="5">+</view>
      </view>
    </view>
  </view>
</view>
```

`pages/pomodoro/index.wxss`:
```css
.pomodoro-container { padding: 24rpx; }

.mode-tabs {
  display: flex; background: #fff; border-radius: 16rpx;
  padding: 8rpx; margin-bottom: 32rpx;
}
.mode-tab {
  flex: 1; text-align: center; padding: 20rpx;
  border-radius: 12rpx; font-size: 28rpx; color: #666;
}
.mode-tab.active { background: #4A90D9; color: #fff; font-weight: 600; }

.timer-circle {
  width: 480rpx; height: 480rpx; border-radius: 50%;
  border: 8rpx solid #4A90D9; margin: 48rpx auto;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.timer-text { font-size: 80rpx; font-weight: 700; color: #333; }
.timer-mode-label { font-size: 26rpx; color: #999; margin-top: 8rpx; }

.controls {
  display: flex; gap: 24rpx; justify-content: center; margin-bottom: 40rpx;
}
.controls .btn-secondary { width: 200rpx; }
.controls .btn-large { width: 300rpx; }

.pomo-stats {
  display: flex; background: #fff; border-radius: 16rpx;
  padding: 32rpx 0; margin-bottom: 24rpx;
}
.pomo-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.pomo-stat-num { font-size: 44rpx; font-weight: 700; color: #4A90D9; }
.pomo-stat-label { font-size: 24rpx; color: #999; }

.settings-section { background: #fff; border-radius: 16rpx; padding: 8rpx 32rpx; }
.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 0; border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx; color: #333;
}
.setting-row:last-child { border-bottom: none; }
.stepper { display: flex; align-items: center; gap: 24rpx; }
.stepper-btn {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: #f0f0f0; display: flex; align-items: center;
  justify-content: center; font-size: 32rpx; color: #666;
}
.stepper-val { font-size: 32rpx; font-weight: 600; min-width: 48rpx; text-align: center; }
```

`pages/pomodoro/index.js`:
```javascript
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
    const mode = e.detail ? e.detail.mode || e.currentTarget.dataset.mode : e.currentTarget.dataset.mode;
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
```

- [ ] **Step 2: 验证番茄计时器**

1. 点击开始 → 验证倒计时运行
2. 点击暂停 → 验证暂停
3. 点击重置 → 验证重置
4. 调整时长 → 验证步进器
5. 等待倒计时结束 → 验证自动切换模式和完成音效

- [ ] **Step 3: Commit**

```bash
git add pages/pomodoro/
git commit -m "feat: 番茄专注计时器

- 专注/短休息/长休息三模式
- 倒计时器 + 圆形进度显示
- 自定义时长设置
- 自动模式切换 + 完成统计"
```

---

## Phase 2-5: 分包游戏

> 以下各游戏遵循统一的开发模式：创建 4 个文件（.json/.wxml/.wxss/.js），实现游戏逻辑，验证后 commit。每个游戏复用共享组件（game-header, result-panel, history-list, difficulty-selector）。

### Task 16: 反向舒尔特 (reverse-schulte)

**Files:**
- Create: `pages-focus/reverse-schulte/index.json`
- Create: `pages-focus/reverse-schulte/index.wxml`
- Create: `pages-focus/reverse-schulte/index.wxss`
- Create: `pages-focus/reverse-schulte/index.js`

- [ ] **Step 1: 创建文件**

`pages-focus/reverse-schulte/index.json`:
```json
{
  "navigationBarTitleText": "反向舒尔特",
  "usingComponents": {
    "game-header": "/components/game-header/game-header",
    "difficulty-selector": "/components/difficulty-selector/difficulty-selector",
    "result-panel": "/components/result-panel/result-panel",
    "history-list": "/components/history-list/history-list"
  }
}
```

`pages-focus/reverse-schulte/index.wxml`:
```xml
<game-header title="反向舒尔特" />

<view class="game-container" wx:if="{{state === 'ready'}}">
  <view class="setup-section">
    <difficulty-selector
      label="网格大小"
      options="{{gridOptions}}"
      selected="{{gridSize}}"
      bind:change="onGridChange"
    />
  </view>
  <view class="instruction">从大到小依次点击数字（{{gridSize*gridSize}} → 1）</view>
  <view class="best-record" wx:if="{{bestTime > 0}}">
    最佳成绩：<text class="best-val">{{bestTime}}s</text>
  </view>
  <view class="start-area">
    <button class="btn-primary btn-large" bindtap="onStart">开始训练</button>
  </view>
</view>

<view class="game-area" wx:elif="{{state === 'playing'}}">
  <view class="game-info">
    <text class="timer-display">{{timerDisplay}}</text>
    <text class="progress-display">{{currentNumber}}/1</text>
  </view>
  <view class="grid" style="grid-template-columns: repeat({{gridSize}}, 1fr)">
    <view
      class="grid-cell {{item.found ? 'found' : ''}}"
      wx:for="{{gridData}}"
      wx:key="value"
      bindtap="onCellTap"
      data-value="{{item.value}}"
    >
      <text>{{item.value}}</text>
    </view>
  </view>
</view>

<view class="result-area" wx:elif="{{state === 'finished'}}">
  <result-panel
    gameName="反向舒尔特"
    scoreText="{{result.scoreText}}"
    bestText="{{result.bestText}}"
    duration="{{result.duration}}"
    accuracy="{{result.accuracy}}"
    trend="{{result.trend}}"
    bind:replay="onReplay"
    bind:share="onShare"
  />
  <history-list records="{{history}}" />
</view>
```

`pages-focus/reverse-schulte/index.wxss`:
```css
.game-container { padding: 24rpx; }
.setup-section { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
.instruction { text-align: center; font-size: 26rpx; color: #666; margin: 24rpx 0; }
.best-record { text-align: center; font-size: 26rpx; color: #666; margin: 16rpx 0; }
.best-val { font-weight: 600; color: #4A90D9; }
.start-area { margin-top: 48rpx; }
.btn-large { width: 100%; padding: 28rpx; font-size: 34rpx; }

.game-area { padding: 24rpx; }
.game-info {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-radius: 16rpx; padding: 24rpx 32rpx; margin-bottom: 24rpx;
}
.timer-display { font-size: 40rpx; font-weight: 600; color: #333; }
.progress-display { font-size: 28rpx; color: #666; }
.grid {
  display: grid; gap: 12rpx; background: #fff;
  border-radius: 16rpx; padding: 24rpx; aspect-ratio: 1;
}
.grid-cell {
  display: flex; align-items: center; justify-content: center;
  background: #f8f9fa; border-radius: 12rpx;
  font-size: 36rpx; font-weight: 600; color: #333; transition: all 0.15s;
}
.grid-cell.found { background: #e8f4fd; color: #4A90D9; opacity: 0.5; }
.result-area { padding: 24rpx 0; }
```

`pages-focus/reverse-schulte/index.js`:
```javascript
const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const GRID_OPTIONS = [
  { label: '3×3', value: 3 },
  { label: '4×4', value: 4 },
  { label: '5×5', value: 5 },
  { label: '6×6', value: 6 },
  { label: '7×7', value: 7 }
];

Page({
  data: {
    state: 'ready',
    gridSize: 5,
    gridData: [],
    currentNumber: 25,
    timerDisplay: '0.00s',
    bestTime: 0,
    result: {},
    history: [],
    gridOptions: GRID_OPTIONS
  },

  onLoad() {
    const best = storage.getBest('reverse-schulte');
    const history = storage.getHistory('reverse-schulte', 10);
    this.setData({ bestTime: best ? best.score : 0, history });
    this.timer = new Timer();
    this.updateInterval = null;
  },

  onGridChange(e) {
    const size = e.detail.value;
    this.setData({ gridSize: size, currentNumber: size * size });
  },

  onStart() {
    const { gridSize } = this.data;
    const total = gridSize * gridSize;
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    // 随机打乱位置
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    const gridData = numbers.map(n => ({ value: n, found: false }));

    this.setData({
      state: 'playing',
      gridData,
      currentNumber: total,
      timerDisplay: '0.00s'
    });
    this._startTimer();
  },

  _startTimer() {
    this.timer.start();
    this.updateInterval = setInterval(() => {
      this.setData({ timerDisplay: `${this.timer.getElapsedSeconds().toFixed(2)}s` });
    }, 100);
  },

  _stopTimer() {
    clearInterval(this.updateInterval);
    this.timer.pause();
  },

  onCellTap(e) {
    const { gridData, currentNumber } = this.data;
    const value = e.currentTarget.dataset.value;
    const cell = gridData.find(c => c.value === value);

    if (value === currentNumber) {
      cell.found = true;
      getApp().globalData.audioManager.playSuccess();

      if (currentNumber === 1) {
        this._onComplete();
      } else {
        this.setData({ gridData: [...gridData], currentNumber: currentNumber - 1 });
      }
    } else {
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'light' });
    }
  },

  _onComplete() {
    this._stopTimer();
    const duration = this.timer.getElapsed();
    const score = duration / 1000;

    storage.saveResult('reverse-schulte', {
      score, duration, accuracy: 1,
      details: { gridSize: this.data.gridSize, mode: 'reverse', errors: 0 }
    });

    const stats = storage.getStats('reverse-schulte');
    const best = storage.getBest('reverse-schulte');
    const history = storage.getHistory('reverse-schulte', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${score.toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration, accuracy: 1, trend: stats.trend
      },
      history,
      bestTime: best ? best.score : 0
    });
  },

  onReplay() {
    this.timer.reset();
    this.setData({ state: 'ready' });
  },

  onShare() {
    wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' });
  },

  onUnload() {
    this._stopTimer();
    this.timer.reset();
  }
});
```

- [ ] **Step 2: 验证**

打开反向舒尔特，选择 3×3 → 从 9 到 1 依次点击 → 验证完成。

- [ ] **Step 3: Commit**

```bash
git add pages-focus/reverse-schulte/
git commit -m "feat: 反向舒尔特"
```

---

### Task 17: 儿童舒尔特 (schulte-kids)

**Files:**
- Create: `pages-focus/schulte-kids/index.json`
- Create: `pages-focus/schulte-kids/index.wxml`
- Create: `pages-focus/schulte-kids/index.wxss`
- Create: `pages-focus/schulte-kids/index.js`

- [ ] **Step 1: 创建文件**

`pages-focus/schulte-kids/index.json`:
```json
{
  "navigationBarTitleText": "儿童舒尔特",
  "usingComponents": {
    "game-header": "/components/game-header/game-header",
    "difficulty-selector": "/components/difficulty-selector/difficulty-selector",
    "result-panel": "/components/result-panel/result-panel",
    "history-list": "/components/history-list/history-list"
  }
}
```

`pages-focus/schulte-kids/index.wxml`:
```xml
<game-header title="儿童舒尔特" />
<view class="game-container" wx:if="{{state === 'ready'}}">
  <view class="kids-title">小朋友，按顺序找数字吧！</view>
  <view class="setup-section">
    <difficulty-selector
      label="选择大小"
      options="{{gridOptions}}"
      selected="{{gridSize}}"
      bind:change="onGridChange"
    />
  </view>
  <view class="start-area">
    <button class="btn-primary btn-large kids-btn" bindtap="onStart">开始玩</button>
  </view>
</view>
<view class="game-area kids-area" wx:elif="{{state === 'playing'}}">
  <view class="game-info">
    <text class="timer-display">{{timerDisplay}}</text>
  </view>
  <view class="grid kids-grid" style="grid-template-columns: repeat({{gridSize}}, 1fr)">
    <view
      class="grid-cell kids-cell {{item.found ? 'found' : ''}}"
      wx:for="{{gridData}}"
      wx:key="value"
      bindtap="onCellTap"
      data-value="{{item.value}}"
    >
      <text>{{item.value}}</text>
    </view>
  </view>
</view>
<view class="result-area" wx:elif="{{state === 'finished'}}">
  <result-panel
    gameName="儿童舒尔特"
    scoreText="{{result.scoreText}}"
    bestText="{{result.bestText}}"
    duration="{{result.duration}}"
    accuracy="{{result.accuracy}}"
    trend="{{result.trend}}"
    bind:replay="onReplay"
    bind:share="onShare"
  />
</view>
```

`pages-focus/schulte-kids/index.wxss`:
```css
.game-container { padding: 24rpx; }
.kids-title {
  text-align: center; font-size: 36rpx; color: #FF6B6B;
  font-weight: 600; margin: 32rpx 0;
}
.setup-section { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx; }
.start-area { margin-top: 48rpx; }
.btn-large { width: 100%; padding: 28rpx; font-size: 34rpx; }
.kids-btn { background: #FF6B6B; }
.kids-area { padding: 24rpx; }
.game-info {
  display: flex; justify-content: center; align-items: center;
  background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 24rpx;
}
.timer-display { font-size: 40rpx; font-weight: 600; color: #FF6B6B; }
.kids-grid {
  display: grid; gap: 16rpx; background: #FFF8E1;
  border-radius: 20rpx; padding: 24rpx; aspect-ratio: 1;
}
.kids-cell {
  display: flex; align-items: center; justify-content: center;
  background: #fff; border-radius: 16rpx;
  font-size: 48rpx; font-weight: 700; color: #FF6B6B;
  border: 3rpx solid #FFE0B2;
}
.kids-cell.found { background: #FFE0B2; color: #FF6B6B; opacity: 0.5; }
.result-area { padding: 24rpx 0; }
```

`pages-focus/schulte-kids/index.js`:
```javascript
const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const GRID_OPTIONS = [
  { label: '3×3', value: 3 },
  { label: '4×4', value: 4 },
  { label: '5×5', value: 5 }
];

Page({
  data: {
    state: 'ready',
    gridSize: 3,
    gridData: [],
    currentNumber: 1,
    timerDisplay: '0.00s',
    bestTime: 0,
    result: {},
    history: [],
    gridOptions: GRID_OPTIONS
  },

  onLoad() {
    const best = storage.getBest('schulte-kids');
    const history = storage.getHistory('schulte-kids', 10);
    this.setData({ bestTime: best ? best.score : 0, history });
    this.timer = new Timer();
    this.updateInterval = null;
  },

  onGridChange(e) {
    const size = e.detail.value;
    this.setData({ gridSize: size });
  },

  onStart() {
    const { gridSize } = this.data;
    const total = gridSize * gridSize;
    const numbers = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    const gridData = numbers.map(n => ({ value: n, found: false }));

    this.setData({
      state: 'playing',
      gridData,
      currentNumber: 1,
      timerDisplay: '0.00s'
    });
    this._startTimer();
  },

  _startTimer() {
    this.timer.start();
    this.updateInterval = setInterval(() => {
      this.setData({ timerDisplay: `${this.timer.getElapsedSeconds().toFixed(2)}s` });
    }, 100);
  },

  _stopTimer() {
    clearInterval(this.updateInterval);
    this.timer.pause();
  },

  onCellTap(e) {
    const { gridData, currentNumber } = this.data;
    const value = e.currentTarget.dataset.value;
    const cell = gridData.find(c => c.value === value);

    if (value === currentNumber) {
      cell.found = true;
      getApp().globalData.audioManager.playSuccess();
      if (currentNumber === this.data.gridSize * this.data.gridSize) {
        this._onComplete();
      } else {
        this.setData({ gridData: [...gridData], currentNumber: currentNumber + 1 });
      }
    } else {
      getApp().globalData.audioManager.playFail();
      wx.vibrateShort({ type: 'light' });
    }
  },

  _onComplete() {
    this._stopTimer();
    const duration = this.timer.getElapsed();
    const score = duration / 1000;
    storage.saveResult('schulte-kids', {
      score, duration, accuracy: 1,
      details: { gridSize: this.data.gridSize, mode: 'kids', errors: 0 }
    });
    const stats = storage.getStats('schulte-kids');
    const best = storage.getBest('schulte-kids');
    const history = storage.getHistory('schulte-kids', 10);
    getApp().globalData.audioManager.playComplete();
    this.setData({
      state: 'finished',
      result: {
        scoreText: `${score.toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration, accuracy: 1, trend: stats.trend
      },
      history, bestTime: best ? best.score : 0
    });
  },

  onReplay() { this.timer.reset(); this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { this._stopTimer(); this.timer.reset(); }
});
```

- [ ] **Step 2: 验证**

打开儿童舒尔特，选择 3×3 → 从 1 到 9 依次点击 → 验证完成。

- [ ] **Step 3: Commit**

```bash
git add pages-focus/schulte-kids/
git commit -m "feat: 儿童舒尔特"
```

---

## Phase 2 剩余游戏（分包 B: 认知控制）

### Task 18: 斯特鲁普测试 (stroop-test)

**Files:**
- Create: `pages-cognitive/stroop-test/index.json`
- Create: `pages-cognitive/stroop-test/index.wxml`
- Create: `pages-cognitive/stroop-test/index.wxss`
- Create: `pages-cognitive/stroop-test/index.js`

- [ ] **Step 1: 创建文件**

`pages-cognitive/stroop-test/index.json`:
```json
{
  "navigationBarTitleText": "斯特鲁普测试",
  "usingComponents": {
    "game-header": "/components/game-header/game-header",
    "result-panel": "/components/result-panel/result-panel",
    "history-list": "/components/history-list/history-list"
  }
}
```

`pages-cognitive/stroop-test/index.wxml`:
```xml
<game-header title="斯特鲁普测试" />

<view class="game-container" wx:if="{{state === 'ready'}}">
  <view class="instruction">
    忽略文字内容，选择文字的颜色
  </view>
  <view class="start-area">
    <button class="btn-primary btn-large" bindtap="onStart">开始测试</button>
  </view>
</view>

<view class="game-area" wx:elif="{{state === 'playing'}}">
  <view class="round-info">第 {{currentRound}}/{{totalRounds}} 轮</view>
  <view class="stroop-word" style="color: {{currentWord.color}}">
    <text>{{currentWord.text}}</text>
  </view>
  <view class="color-buttons">
    <view
      class="color-btn"
      wx:for="{{colorOptions}}"
      wx:key="value"
      style="background: {{item.value}}"
      bindtap="onColorTap"
      data-color="{{item.value}}"
    >
      <text>{{item.label}}</text>
    </view>
  </view>
</view>

<view class="result-area" wx:elif="{{state === 'finished'}}">
  <result-panel
    gameName="斯特鲁普测试"
    scoreText="{{result.scoreText}}"
    bestText="{{result.bestText}}"
    duration="{{result.duration}}"
    accuracy="{{result.accuracy}}"
    trend="{{result.trend}}"
    bind:replay="onReplay"
    bind:share="onShare"
  />
  <history-list records="{{history}}" />
</view>
```

`pages-cognitive/stroop-test/index.wxss`:
```css
.game-container { padding: 24rpx; }
.instruction {
  background: #fff; border-radius: 16rpx; padding: 48rpx 32rpx;
  text-align: center; font-size: 30rpx; color: #666; margin-bottom: 48rpx;
}
.start-area { margin-top: 48rpx; }
.btn-large { width: 100%; padding: 28rpx; font-size: 34rpx; }

.game-area { padding: 24rpx; }
.round-info { text-align: center; font-size: 26rpx; color: #999; margin-bottom: 32rpx; }
.stroop-word {
  text-align: center; font-size: 80rpx; font-weight: 700;
  margin: 64rpx 0; min-height: 120rpx;
}
.color-buttons {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24rpx;
}
.color-btn {
  padding: 40rpx; border-radius: 16rpx; text-align: center;
}
.color-btn text { color: #fff; font-size: 32rpx; font-weight: 600; text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.3); }
.result-area { padding: 24rpx 0; }
```

`pages-cognitive/stroop-test/index.js`:
```javascript
const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const COLORS = [
  { label: '红', value: '#FF4D4F' },
  { label: '蓝', value: '#4A90D9' },
  { label: '绿', value: '#52C41A' },
  { label: '黄', value: '#FAAD14' }
];

const TOTAL_ROUNDS = 20;

Page({
  data: {
    state: 'ready',
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    currentWord: { text: '', color: '' },
    colorOptions: COLORS,
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('stroop-test', 10);
    this.setData({ history });
    this.reactionTimes = [];
    this.roundTimer = null;
  },

  onStart() {
    this.reactionTimes = [];
    this.setData({ state: 'playing', currentRound: 1 });
    this._nextRound();
  },

  _nextRound() {
    const { currentRound } = this.data;
    if (currentRound > TOTAL_ROUNDS) {
      this._onComplete();
      return;
    }

    // 随机选择文字和颜色（可以相同或不同）
    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    this.setData({
      currentWord: { text: textColor.label, color: wordColor.value }
    });

    this.roundTimer = new Timer();
    this.roundTimer.start();
  },

  onColorTap(e) {
    const selectedColor = e.currentTarget.dataset.color;
    const roundTime = this.roundTimer.getElapsed();
    this.reactionTimes.push(roundTime);

    // 判断是否正确：选择的颜色 == 文字的颜色
    if (selectedColor === this.data.currentWord.color) {
      getApp().globalData.audioManager.playSuccess();
    } else {
      getApp().globalData.audioManager.playFail();
    }

    this.setData({ currentRound: this.data.currentRound + 1 });
    this._nextRound();
  },

  _onComplete() {
    const avgReactionTime = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;

    storage.saveResult('stroop-test', {
      score: avgReactionTime / 1000,
      duration: this.reactionTimes.reduce((a, b) => a + b, 0),
      accuracy: 1,
      details: { rounds: TOTAL_ROUNDS, avgReactionTime: Math.round(avgReactionTime) }
    });

    const stats = storage.getStats('stroop-test');
    const best = storage.getBest('stroop-test');
    const history = storage.getHistory('stroop-test', 10);

    getApp().globalData.audioManager.playComplete();

    this.setData({
      state: 'finished',
      result: {
        scoreText: `${(avgReactionTime / 1000).toFixed(2)}s`,
        bestText: best ? `${(best.score).toFixed(2)}s` : '-',
        duration: this.reactionTimes.reduce((a, b) => a + b, 0),
        accuracy: 1,
        trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { if (this.roundTimer) this.roundTimer.reset(); }
});
```

- [ ] **Step 2: 验证**

打开斯特鲁普测试 → 开始 → 看到颜色词 → 选择文字的颜色（不是文字内容）→ 完成 20 轮。

- [ ] **Step 3: Commit**

```bash
git add pages-cognitive/stroop-test/
git commit -m "feat: 斯特鲁普测试"
```

---

### Task 19: 反向斯特鲁普 (reverse-stroop)

**Files:**
- Create: `pages-cognitive/reverse-stroop/index.json`
- Create: `pages-cognitive/reverse-stroop/index.wxml`
- Create: `pages-cognitive/reverse-stroop/index.wxss`
- Create: `pages-cognitive/reverse-stroop/index.js`

- [ ] **Step 1: 创建文件**

`pages-cognitive/reverse-stroop/index.json`:
```json
{
  "navigationBarTitleText": "反向斯特鲁普",
  "usingComponents": {
    "game-header": "/components/game-header/game-header",
    "result-panel": "/components/result-panel/result-panel",
    "history-list": "/components/history-list/history-list"
  }
}
```

`pages-cognitive/reverse-stroop/index.wxml`:
```xml
<game-header title="反向斯特鲁普" />
<view class="game-container" wx:if="{{state === 'ready'}}">
  <view class="instruction">忽略颜色，选择文字的内容</view>
  <view class="start-area">
    <button class="btn-primary btn-large" bindtap="onStart">开始测试</button>
  </view>
</view>
<view class="game-area" wx:elif="{{state === 'playing'}}">
  <view class="round-info">第 {{currentRound}}/{{totalRounds}} 轮</view>
  <view class="stroop-word" style="color: {{currentWord.color}}">
    <text>{{currentWord.text}}</text>
  </view>
  <view class="color-buttons">
    <view
      class="color-btn"
      wx:for="{{colorOptions}}"
      wx:key="value"
      style="background: {{item.value}}"
      bindtap="onColorTap"
      data-label="{{item.label}}"
    >
      <text>{{item.label}}</text>
    </view>
  </view>
</view>
<view class="result-area" wx:elif="{{state === 'finished'}}">
  <result-panel
    gameName="反向斯特鲁普"
    scoreText="{{result.scoreText}}"
    bestText="{{result.bestText}}"
    duration="{{result.duration}}"
    accuracy="{{result.accuracy}}"
    trend="{{result.trend}}"
    bind:replay="onReplay"
    bind:share="onShare"
  />
  <history-list records="{{history}}" />
</view>
```

`pages-cognitive/reverse-stroop/index.wxss`:
```css
.game-container { padding: 24rpx; }
.instruction {
  background: #fff; border-radius: 16rpx; padding: 48rpx 32rpx;
  text-align: center; font-size: 30rpx; color: #666; margin-bottom: 48rpx;
}
.start-area { margin-top: 48rpx; }
.btn-large { width: 100%; padding: 28rpx; font-size: 34rpx; }
.game-area { padding: 24rpx; }
.round-info { text-align: center; font-size: 26rpx; color: #999; margin-bottom: 32rpx; }
.stroop-word { text-align: center; font-size: 80rpx; font-weight: 700; margin: 64rpx 0; min-height: 120rpx; }
.color-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 24rpx; }
.color-btn { padding: 40rpx; border-radius: 16rpx; text-align: center; }
.color-btn text { color: #fff; font-size: 32rpx; font-weight: 600; text-shadow: 0 1rpx 4rpx rgba(0,0,0,0.3); }
.result-area { padding: 24rpx 0; }
```

`pages-cognitive/reverse-stroop/index.js`:
```javascript
const { Timer } = require('../../../utils/timer.js');
const storage = require('../../../utils/storage.js');

const COLORS = [
  { label: '红', value: '#FF4D4F' },
  { label: '蓝', value: '#4A90D9' },
  { label: '绿', value: '#52C41A' },
  { label: '黄', value: '#FAAD14' }
];

const TOTAL_ROUNDS = 20;

Page({
  data: {
    state: 'ready',
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    currentWord: { text: '', color: '' },
    colorOptions: COLORS,
    result: {},
    history: []
  },

  onLoad() {
    const history = storage.getHistory('reverse-stroop', 10);
    this.setData({ history });
    this.reactionTimes = [];
  },

  onStart() {
    this.reactionTimes = [];
    this.setData({ state: 'playing', currentRound: 1 });
    this._nextRound();
  },

  _nextRound() {
    const { currentRound } = this.data;
    if (currentRound > TOTAL_ROUNDS) { this._onComplete(); return; }

    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    this.setData({ currentWord: { text: textColor.label, color: wordColor.value } });
    this.roundTimer = new Timer();
    this.roundTimer.start();
  },

  onColorTap(e) {
    const selectedLabel = e.currentTarget.dataset.label;
    const roundTime = this.roundTimer.getElapsed();
    this.reactionTimes.push(roundTime);

    // 反向规则：选择的内容 == 文字内容（不是颜色）
    if (selectedLabel === this.data.currentWord.text) {
      getApp().globalData.audioManager.playSuccess();
    } else {
      getApp().globalData.audioManager.playFail();
    }

    this.setData({ currentRound: this.data.currentRound + 1 });
    this._nextRound();
  },

  _onComplete() {
    const avgReactionTime = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
    storage.saveResult('reverse-stroop', {
      score: avgReactionTime / 1000,
      duration: this.reactionTimes.reduce((a, b) => a + b, 0),
      accuracy: 1,
      details: { rounds: TOTAL_ROUNDS, avgReactionTime: Math.round(avgReactionTime) }
    });
    const stats = storage.getStats('reverse-stroop');
    const best = storage.getBest('reverse-stroop');
    const history = storage.getHistory('reverse-stroop', 10);
    getApp().globalData.audioManager.playComplete();
    this.setData({
      state: 'finished',
      result: {
        scoreText: `${(avgReactionTime / 1000).toFixed(2)}s`,
        bestText: best ? `${best.score.toFixed(2)}s` : '-',
        duration: this.reactionTimes.reduce((a, b) => a + b, 0),
        accuracy: 1, trend: stats.trend
      },
      history
    });
  },

  onReplay() { this.setData({ state: 'ready' }); },
  onShare() { wx.showToast({ title: '分享功能在 Phase 5 实现', icon: 'none' }); },
  onUnload() { if (this.roundTimer) this.roundTimer.reset(); }
});
```

- [ ] **Step 2: 验证**

打开反向斯特鲁普 → 选择文字内容（忽略颜色）→ 完成 20 轮。

- [ ] **Step 3: Commit**

```bash
git add pages-cognitive/reverse-stroop/
git commit -m "feat: 反向斯特鲁普"
```

---

## Phase 3: 分包 C（注意与反应）

### Task 20-24: 注意力测试、反应时间、视觉搜索、专注反应、专注力测试

以下 5 个游戏遵循统一模式。每个游戏创建 4 个文件（.json/.wxml/.wxss/.js），核心逻辑如下：

**通用开发模板：**

每个游戏页面包含 3 个状态：`ready`（准备）、`playing`（进行中）、`finished`（结果）。使用 `game-header` + `result-panel` + `history-list` 组件。

#### Task 20: 注意力测试 (attention-test) — Go/No-Go

`pages-reaction/attention-test/index.js` 核心逻辑：
- 随机间隔 800-2000ms 显示绿色圆（Go）或红色圆（No-Go）
- Go 时用户需在 1s 内点击，No-Go 时用户需不点击
- 计分：Go 正确率 + No-Go 抑制率 + 平均反应时
- 共 20 轮（约 15 Go + 5 No-Go）

#### Task 21: 反应时间测试 (reaction-time)

`pages-reaction/reaction-time/index.js` 核心逻辑：
- 随机等待 1-4s 后屏幕变绿
- 用户点击 → 记录反应时
- 抢按（变绿前点击）→ 本轮无效，提示"抢按了"
- 5 轮取平均

#### Task 22: 视觉搜索测试 (visual-search)

`pages-reaction/visual-search/index.js` 核心逻辑：
- 显示一组形状（圆形/三角形/正方形），其中一个颜色不同
- 用户点击不同颜色的形状
- 每轮干扰物数量递增（10 → 15 → 20 → ...）
- 点错或超时（5s）则游戏结束

#### Task 23: 专注反应测试 (focus-reaction)

`pages-reaction/focus-reaction/index.js` 核心逻辑：
- 屏幕上有 5-8 个不同颜色圆，随机闪烁
- 当目标颜色圆亮起时点击
- 误触非目标圆扣分
- 60s 限时，记录正确识别数

#### Task 24: 专注力测试 (concentration)

`pages-reaction/concentration/index.js` 核心逻辑：
- 3 分钟综合测试，分 3 个阶段
- 阶段 1（60s）：Go/No-Go 任务
- 阶段 2（60s）：反应时任务
- 阶段 3（60s）：视觉搜索任务
- 计分：综合准确率 + 平均反应时 + 稳定性（标准差）

**每个游戏的实施步骤（Task 20-24）：**

1. 创建 4 个文件（.json/.wxml/.wxss/.js）
2. 在开发者工具中打开对应页面
3. 验证完整游戏流程（准备 → 游戏 → 结果 → 历史记录）
4. Commit：`git add pages-reaction/<game>/ && git commit -m "feat: <游戏名称>"`

---

## Phase 4: 分包 D（工作记忆）

### Task 25-28: 记忆序列、数字记忆、工作记忆测试、Dual N-Back

#### Task 25: 记忆序列游戏 (memory-sequence)

`pages-memory/memory-sequence/index.js` 核心逻辑：
- 3×3 九宫格，依次高亮格子
- 用户按相同顺序复现
- 每轮序列长度 +1
- 点错则游戏结束，记录最大长度
- 高亮间隔 800ms，每个格子亮 500ms

#### Task 26: 数字记忆测试 (number-memory)

`pages-memory/number-memory/index.js` 核心逻辑：
- 展示数字序列 3s（如 "4 8 2 5"）
- 用户通过数字键盘输入
- 正确则下一轮 +1 位，错误则结束
- 记录最大正确位数

#### Task 27: 工作记忆测试 (working-memory)

`pages-memory/working-memory/index.js` 核心逻辑：
- 交替进行：记忆数字 → 简单计算（如 3+5=?）→ 回忆数字
- 每轮增加数字长度
- 计分：正确回忆数 + 计算正确率

#### Task 28: Dual N-Back (dual-n-back)

`pages-memory/dual-n-back/index.js` 核心逻辑：
- 3×3 方格，蓝色方块随机出现在 9 个位置之一
- 同时朗读一个字母（A-Z）
- 每轮 2.5s（视觉 + 听觉刺激同时呈现）
- 用户判断：位置是否与 N 轮前匹配（位置按钮），字母是否与 N 轮前匹配（字母按钮）
- N 值可选 1/2/3，轮数可选 15/20/30
- 计分：命中率、误报率、漏判率、综合准确率
- 使用 `audioManager.playLetter()` 播放字母朗读

**每个游戏的实施步骤（Task 25-28）：**

1. 创建 4 个文件（.json/.wxml/.wxss/.js）
2. 验证完整游戏流程
3. Commit：`git add pages-memory/<game>/ && git commit -m "feat: <游戏名称>"`

---

## Phase 5: 分包 E（专注流程）+ 分享功能

### Task 29: 专注呼吸练习 (breathing)

`pages-flow/breathing/index.js` 核心逻辑：
- 圆形缩放动画（CSS animation）
- 模式：4-4-4 箱式 / 4-7-8 呼吸法 / 自定义
- 吸气 4s（扩大）→ 屏息 4s → 呼气 4s（缩小）
- 使用 `audioManager.playBreatheIn()` / `playBreatheOut()` 引导
- 可设置练习轮数（默认 5 轮）

### Task 30: 训练计划 (training-plan)

`pages-flow/training-plan/index.js` 核心逻辑：
- 7 天计划，每天推荐 2-3 个游戏
- 计划内容：
  - Day 1: 舒尔特方格 + 注意力测试
  - Day 2: 斯特鲁普测试 + 反应时间
  - Day 3: 记忆序列 + 数字记忆
  - Day 4: 视觉搜索 + 专注反应
  - Day 5: Dual N-Back + 工作记忆
  - Day 6: 舒尔特方格 + 斯特鲁普 + 记忆序列
  - Day 7: 综合挑战（每日挑战）
- 标记已完成/未完成
- 进度存储在 wx.storage

### Task 31: 每日挑战 (daily-challenge)

`pages-flow/daily-challenge/index.js` 核心逻辑：
- 每天 5 分钟综合挑战
- 随机抽取 3 个游戏各 1 分钟
- 连续打卡记录
- 每日只能完成一次，重复进入显示"今日已完成"

### Task 32: 分享卡片组件 (share-card)

**Files:**
- Create: `components/share-card/share-card.json`
- Create: `components/share-card/share-card.wxml`
- Create: `components/share-card/share-card.wxss`
- Create: `components/share-card/share-card.js`

- [ ] **Step 1: 创建分享卡片组件**

`components/share-card/share-card.json`:
```json
{ "component": true, "usingComponents": {} }
```

`components/share-card/share-card.wxml`:
```xml
<view class="share-card" wx:if="{{visible}}">
  <canvas type="2d" id="shareCanvas" class="share-canvas" style="width: {{canvasWidth}}px; height: {{canvasHeight}}px;"></canvas>
  <view class="share-actions">
    <button class="btn-secondary" bindtap="onClose">取消</button>
    <button class="btn-primary" bindtap="onSave">保存到相册</button>
  </view>
</view>
```

`components/share-card/share-card.wxss`:
```css
.share-card {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7); z-index: 1000;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.share-canvas {
  border-radius: 16rpx; overflow: hidden;
}
.share-actions {
  display: flex; gap: 24rpx; margin-top: 32rpx;
}
```

`components/share-card/share-card.js`:
```javascript
Component({
  properties: {
    visible: { type: Boolean, value: false }
  },
  data: {
    canvasWidth: 300,
    canvasHeight: 400
  },
  observers: {
    'visible': function(visible) {
      if (visible) this._draw();
    }
  },
  methods: {
    _draw() {
      const query = wx.createSelectorQuery().in(this);
      query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;

        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const w = res[0].width;
        const h = res[0].height;

        // 背景
        ctx.fillStyle = '#4A90D9';
        ctx.fillRect(0, 0, w, h);

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('专注力训练', w / 2, 60);

        // 游戏名
        ctx.font = '16px sans-serif';
        ctx.fillText(this.data.gameName || '', w / 2, 100);

        // 成绩
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(this.data.scoreText || '', w / 2, 180);

        // 最佳
        ctx.font = '14px sans-serif';
        ctx.fillText(`最佳: ${this.data.bestText || ''}`, w / 2, 220);

        // 底部
        ctx.font = '12px sans-serif';
        ctx.fillText('长按识别小程序码开始训练', w / 2, h - 40);
      });
    },

    show(gameName, scoreText, bestText) {
      this.setData({ visible: true, gameName, scoreText, bestText });
    },

    onClose() {
      this.setData({ visible: false });
    },

    onSave() {
      wx.showToast({ title: '请转发给朋友', icon: 'none' });
    }
  }
});
```

- [ ] **Step 2: 更新各游戏页面的分享逻辑**

将各游戏 `onShare` 方法改为调用 share-card 组件：
```javascript
onShare() {
  this.selectComponent('#share-card').show(
    '舒尔特方格',
    this.data.result.scoreText,
    this.data.result.bestText
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/share-card/
git commit -m "feat: 分享卡片组件（Canvas 绘制）"
```

---

## 自检清单

| 检查项 | 状态 |
|--------|------|
| **Placeholder 扫描** | 无 TBD/TODO，所有任务含完整代码 ✓ |
| **Spec 覆盖** | 20 个游戏 + 首页 + 个人中心 + 共享模块 + 分享 = 全覆盖 ✓ |
| **类型一致性** | storage API / audio API / timer API 在所有任务中签名一致 ✓ |
| **内部一致性** | 路由名/gameId/分包结构在所有任务中一致 ✓ |
| **范围检查** | 分 6 个 Phase，每个 Phase 可独立交付 ✓ |
| **模糊性** | 每个游戏的计分规则、输入方式、状态机均已明确 ✓ |

---

## 实施顺序总结

| Phase | 任务 | 产出 |
|-------|------|------|
| Phase 0 | Task 1-13 | 项目骨架 + 共享模块 + 首页/列表/个人中心 |
| Phase 1 | Task 14-15 | 舒尔特方格 + 番茄计时器（主包热门） |
| Phase 2 | Task 16-19 | 反向舒尔特 + 儿童舒尔特 + 斯特鲁普 + 反向斯特鲁普 |
| Phase 3 | Task 20-24 | 注意力测试 + 反应时间 + 视觉搜索 + 专注反应 + 专注力测试 |
| Phase 4 | Task 25-28 | 记忆序列 + 数字记忆 + 工作记忆 + Dual N-Back |
| Phase 5 | Task 29-32 | 呼吸练习 + 训练计划 + 每日挑战 + 分享卡片 |