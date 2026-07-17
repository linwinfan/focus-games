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
    description: '3x3 到 5x5 方格，适合儿童入门',
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
