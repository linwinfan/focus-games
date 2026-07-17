# 专注力训练小游戏微信小程序 — 设计文档

## 1. 项目概述

将 [focus-game.org](https://focus-game.org/zh/focus-games) 上的 20 个专注力训练工具改写为微信小程序。保留所有游戏的核心玩法和交互，砍掉博客、FAQ、关于等信息页面。

### 1.1 核心决策

| 决策项 | 结论 |
|--------|------|
| 技术栈 | 原生小程序 (WXML / WXSS / JavaScript) |
| 范围 | 20 个游戏工具，不含信息页面 |
| 音效 | 完整音效系统（点击/成功/失败/字母朗读 等） |
| 使用场景 | 小范围分享给朋友，无需账号系统 |
| 数据存储 | 纯本地 (wx.setStorageSync)，无后端 |
| 架构 | 主包 + 分包 |

### 1.2 目标用户

认知训练爱好者、学生、希望提升专注力的成年人。小范围分享给朋友，可能通过微信群分享成绩卡片。

---

## 2. 系统架构

### 2.1 分包结构

```
主包 (≤2MB)
├── app.js / app.json / app.wxss
├── pages/index/          首页：分类入口 + 最近使用
├── pages/games-list/     分类游戏列表
├── pages/profile/        个人统计中心
├── pages/schulte-table/  舒尔特方格（热门）
├── pages/pomodoro/       番茄专注计时器（热门）
├── utils/                共享工具
│   ├── storage.js        历史记录管理
│   ├── audio.js          音效管理
│   └── timer.js          计时器
├── components/           共享组件
│   ├── game-header/
│   ├── result-panel/
│   ├── history-list/
│   ├── difficulty-selector/
│   └── countdown-overlay/
└── images/               图标资源

分包 A: 专注训练（pages-focus）
├── pages/reverse-schulte/    反向舒尔特
└── pages/schulte-kids/       儿童舒尔特

分包 B: 认知控制（pages-cognitive）
├── pages/stroop-test/        斯特鲁普测试
└── pages/reverse-stroop/     反向斯特鲁普

分包 C: 注意与反应（pages-reaction）
├── pages/attention-test/     注意力测试 (Go/No-Go)
├── pages/reaction-time/      反应时间测试
├── pages/visual-search/      视觉搜索测试
├── pages/focus-reaction/     专注反应测试
└── pages/concentration/      专注力综合测试

分包 D: 工作记忆（pages-memory）
├── pages/memory-sequence/    记忆序列游戏
├── pages/number-memory/      数字记忆测试
├── pages/working-memory/     工作记忆测试
└── pages/dual-n-back/        Dual N-Back

分包 E: 专注流程（pages-flow）
├── pages/breathing/          专注呼吸练习
├── pages/training-plan/      训练计划
└── pages/daily-challenge/    每日挑战
```

### 2.2 路由总览

| 路径 | 分包 | 说明 |
|------|------|------|
| `/pages/index/index` | 主包 | 首页 |
| `/pages/games-list/index` | 主包 | 分类游戏列表 |
| `/pages/profile/index` | 主包 | 个人中心 |
| `/pages/schulte-table/index` | 主包 | 舒尔特方格 ⭐ 热门 |
| `/pages/pomodoro/index` | 主包 | 番茄计时器 ⭐ 热门 |
| `/pages-focus/reverse-schulte/index` | 分包A | 反向舒尔特 |
| `/pages-focus/schulte-kids/index` | 分包A | 儿童舒尔特 |
| `/pages-cognitive/stroop-test/index` | 分包B | 斯特鲁普测试 |
| `/pages-cognitive/reverse-stroop/index` | 分包B | 反向斯特鲁普 |
| `/pages-reaction/attention-test/index` | 分包C | 注意力测试 |
| `/pages-reaction/reaction-time/index` | 分包C | 反应时间测试 |
| `/pages-reaction/visual-search/index` | 分包C | 视觉搜索测试 |
| `/pages-reaction/focus-reaction/index` | 分包C | 专注反应测试 |
| `/pages-reaction/concentration/index` | 分包C | 专注力测试 |
| `/pages-memory/memory-sequence/index` | 分包D | 记忆序列 |
| `/pages-memory/number-memory/index` | 分包D | 数字记忆 |
| `/pages-memory/working-memory/index` | 分包D | 工作记忆测试 |
| `/pages-memory/dual-n-back/index` | 分包D | Dual N-Back |
| `/pages-flow/breathing/index` | 分包E | 呼吸练习 |
| `/pages-flow/training-plan/index` | 分包E | 训练计划 |
| `/pages-flow/daily-challenge/index` | 分包E | 每日挑战 |

### 2.3 游戏通用数据流

```
页面 onLoad
    │
    ├── 读取历史记录 (storage.getHistory)
    ├── 初始化音效 (audio.preload)
    └── 渲染游戏界面
          │
          ▼
      用户交互（触摸/点击/输入）
          │
          ▼
      游戏结束判定
          │
          ├── 未结束 → 继续用户交互
          │
          └── 结束
                │
                ├── 计算成绩
                ├── 写入 storage.saveResult(gameId, result)
                ├── 展示 result-panel 组件
                └── 可选：Canvas 绘制分享卡片 → wx.shareAppMessage
```

---

## 3. 共享模块设计

### 3.1 历史记录管理 (utils/storage.js)

#### 数据结构

```json
// wx.storage 中的每条记录
{
  "gameId": "schulte-table",
  "score": 12.5,
  "duration": 12500,
  "accuracy": 1.0,
  "timestamp": 1721200000000,
  "details": {
    "gridSize": 5,
    "mode": "sequential",
    "errors": 0
  }
}
```

- `gameId`: 游戏唯一标识（与路由名一致）
- `score`: 游戏得分（语义因游戏而异：舒尔特=秒数越小越好，记忆序列=长度越大越好）
- `duration`: 游戏时长（毫秒）
- `accuracy`: 正确率 0.0-1.0
- `timestamp`: 完成时间戳
- `details`: 游戏特定详情，每个游戏自定

#### API

| 方法 | 签名 | 说明 |
|------|------|------|
| `saveResult` | `(gameId, result) → void` | 写入一条记录，超 200 条自动淘汰最早 |
| `getHistory` | `(gameId, limit=10) → Result[]` | 获取最近 N 条记录 |
| `getStats` | `(gameId) → Stats` | 计算统计：best / average / totalGames / trend |
| `getBest` | `(gameId) → Result` | 获取最佳记录 |
| `getStreak` | `(gameId) → number` | 连续打卡天数 |
| `clearGame` | `(gameId) → void` | 清除单游戏记录 |
| `clearAll` | `() → void` | 清除所有记录 |

#### Stats 结构

```json
{
  "best": 8.2,
  "average": 14.5,
  "totalGames": 42,
  "recentAvg": 11.3,
  "trend": "improving"
}
```

`trend` 取值：`improving` / `stable` / `declining`（基于最近 5 次 vs 历史均值对比）

#### 存储策略

- 使用 `wx.setStorageSync` / `wx.getStorageSync`
- 单游戏历史上限 200 条，超出时 FIFO 淘汰
- 写入失败时异步重试 1 次 (`wx.setStorage`)，仍失败则内存缓存 + toast 提示

### 3.2 音效管理 (utils/audio.js)

#### 音效清单

| 音效 | 文件名 | 用途 | 使用游戏 |
|------|--------|------|----------|
| 点击音 | click.mp3 | 按钮/格子点击 | 所有 |
| 正确音 | correct.mp3 | 操作正确 | 所有 |
| 错误音 | wrong.mp3 | 操作错误 | 所有 |
| 倒计时 | countdown.mp3 | 倒计时滴答 | 限时模式 |
| 完成音 | complete.mp3 | 游戏完成 | 所有 |
| 字母 A-Z | letter_A.mp3 ~ letter_Z.mp3 | 字母朗读 | Dual N-Back |
| 吸气 | breathe_in.mp3 | 吸气引导 | 呼吸练习 |
| 呼气 | breathe_out.mp3 | 呼气引导 | 呼吸练习 |

共约 30 个音频文件，总大小 ≤ 500KB（低码率 mp3，单文件 ≤ 30KB）。

#### API

| 方法 | 签名 | 说明 |
|------|------|------|
| `playTap` | `() → void` | 播放点击音 |
| `playSuccess` | `() → void` | 播放正确音 |
| `playFail` | `() → void` | 播放错误音 |
| `playLetter` | `(letter) → void` | 播放字母朗读 |
| `playTick` | `() → void` | 播放倒计时音 |
| `playComplete` | `() → void` | 播放完成音 |
| `setMuted` | `(bool) → void` | 设置静音 |
| `isMuted` | `() → bool` | 查询静音状态 |
| `preload` | `() → void` | 预加载所有音效到内存 |

#### 实现要点

- 全局单例，通过 `getApp().audioManager` 访问
- 使用 `wx.createInnerAudioContext` 创建音频对象
- 静音状态持久化到 `wx.setStorageSync('muted', bool)`
- 音频加载失败时静默降级为无音效模式

### 3.3 共享组件

#### game-header

- 顶部导航栏：返回按钮 + 游戏标题 + 设置入口
- 所有游戏页面复用

#### result-panel

- 游戏结束后的结果展示
- 展示：分数/用时/准确率/最佳成绩/趋势
- 操作按钮：再来一局 / 分享 / 返回

#### history-list

- 历史记录列表（最近 N 次）
- 每条展示：日期 + 成绩 + 与最佳对比
- 空状态提示："还没有记录，先完成一局"

#### difficulty-selector

- 难度选择器（网格大小 / N 值 / 轮数等）
- 用于舒尔特方格、Dual N-Back 等有难度的游戏

#### countdown-overlay

- 倒计时蒙层（3-2-1-GO）
- 需要倒计时开始的游戏复用

### 3.4 分享能力

- 每个游戏结果页使用 Canvas 绘制成绩卡片
- 卡片内容：游戏名称 + 本次成绩 + 最佳成绩 + 小程序名称
- 通过 `wx.showShareMenu` 开启转发，`wx.shareAppMessage` 设置分享内容
- Canvas 绘制失败时降级为纯文字分享

---

## 4. 20 个游戏详细设计

### 4.1 舒尔特方格 (schulte-table) — 主包

**玩法**：按顺序点击网格中的数字，训练视觉扫描和专注节奏。

| 属性 | 值 |
|------|-----|
| 网格尺寸 | 3×3 / 4×4 / 5×5 / 6×6 / 7×7 / 8×8 / 9×9 / 10×10 |
| 模式 | 顺序 / 反向 / 限时 |
| 输入 | 触摸点击 |
| 计时 | 首次点击开始 → 最后点击结束 |
| 计分 | 完成用时（秒）+ 错误次数 |
| 辅助 | 已选数字灰度标记（可开关） |

**状态机**：
```
准备 → 进行中（首次点击）→ 进行中（正确点击高亮+音效）
     → 进行中（错误点击震动+错误音）
     → 完成（最后一点击）→ 结果页
```

**存储 details**：`{ gridSize, mode, errors }`

---

### 4.2 反向舒尔特 (reverse-schulte) — 分包A

复用舒尔特方格组件，规则改为从大到小搜索数字。

---

### 4.3 儿童舒尔特 (schulte-kids) — 分包A

复用舒尔特方格组件，限制 3×3-5×5，更大点击区域，鲜艳配色，鼓励性文案。

---

### 4.4 斯特鲁普测试 (stroop-test) — 分包B

**玩法**：忽略文字内容，选择文字的颜色。

| 属性 | 值 |
|------|-----|
| 布局 | 顶部显示颜色词，底部 4 个颜色按钮 |
| 颜色 | 红 / 蓝 / 绿 / 黄 |
| 轮数 | 默认 20 轮 |
| 刺激间隔 | 约 2 秒 |
| 计分 | 正确率 + 平均反应时 |

**存储 details**：`{ rounds, avgReactionTime }`

---

### 4.5 反向斯特鲁普 (reverse-stroop) — 分包B

与斯特鲁普相同布局，规则改为忽略颜色、选择文字内容。

---

### 4.6 注意力测试 (attention-test) — 分包C

**玩法**：Go/No-Go 测试。绿色圆出现时点击（Go），红色圆出现时不点击（No-Go）。

| 属性 | 值 |
|------|-----|
| 刺激 | 绿色圆（Go）/ 红色圆（No-Go） |
| 间隔 | 随机 800ms-2000ms |
| 计分 | 正确 Go 反应时 + No-Go 正确抑制率 |

**存储 details**：`{ goAccuracy, noGoAccuracy, avgReactionTime }`

---

### 4.7 反应时间测试 (reaction-time) — 分包C

**玩法**：屏幕变绿时尽快点击。

| 属性 | 值 |
|------|-----|
| 规则 | 等待绿色出现 → 点击 |
| 防作弊 | 变绿前点击 = 抢按（false start），本轮无效 |
| 计分 | 平均反应时（ms），5 轮取平均 |

**存储 details**：`{ avgReactionTime, falseStarts }`

---

### 4.8 视觉搜索测试 (visual-search) — 分包C

**玩法**：在多个干扰物中找目标形状/颜色。

| 属性 | 值 |
|------|-----|
| 难度 | 干扰物数量递增（10 → 20 → 30 → ...） |
| 目标 | 特定形状或颜色 |
| 计分 | 搜索用时 + 准确率 |

**存储 details**：`{ level, totalTime, accuracy }`

---

### 4.9 专注反应测试 (focus-reaction) — 分包C

**玩法**：多个移动/闪烁目标中识别特定目标并点击。

| 属性 | 值 |
|------|-----|
| 目标 | 特定颜色/形状 |
| 干扰 | 移动或闪烁的其他目标 |
| 计分 | 正确识别数 + 误触数 |

**存储 details**：`{ correct, falsePositives, level }`

---

### 4.10 专注力测试 (concentration) — 分包C

**玩法**：综合测试，结合 Go/No-Go + 反应时 + 抗干扰。

| 属性 | 值 |
|------|-----|
| 时长 | 约 3 分钟 |
| 内容 | 多阶段混合任务 |
| 计分 | 综合准确率 + 反应时 + 稳定性 |

**存储 details**：`{ accuracy, avgReactionTime, stability }`

---

### 4.11 记忆序列游戏 (memory-sequence) — 分包D

**玩法**：记住亮灯顺序并复现，每轮增加一格。

| 属性 | 值 |
|------|-----|
| 布局 | 3×3 九宫格 |
| 规则 | 依次高亮 → 用户按相同顺序复现 |
| 难度递增 | 每轮序列长度 +1 |
| 计分 | 最大正确序列长度 |

**状态机**：
```
演示（依次高亮）→ 等待输入（用户点击）
  → 正确（序列长度+1，回到演示）
  → 错误（游戏结束，展示最大长度）
```

**存储 details**：`{ maxLevel, sequenceLength }`

---

### 4.12 数字记忆测试 (number-memory) — 分包D

**玩法**：展示数字序列，用户回忆并输入。

| 属性 | 值 |
|------|-----|
| 规则 | 展示数字（如 "4 8 2 5"）→ 用户输入 |
| 难度递增 | 每轮增加一位数字 |
| 计分 | 最大正确位数 |

**存储 details**：`{ maxDigits }`

---

### 4.13 工作记忆测试 (working-memory) — 分包D

**玩法**：混合任务，记忆序列 + 简单计算交替。

| 属性 | 值 |
|------|-----|
| 规则 | 记忆数字 → 简单计算 → 回忆数字 |
| 计分 | 正确回忆数 + 计算正确率 |

**存储 details**：`{ memoryScore, calcScore }`

---

### 4.14 Dual N-Back (dual-n-back) — 分包D

**玩法**：同时呈现视觉和听觉刺激，判断当前刺激是否与 N 步之前的匹配。

| 属性 | 值 |
|------|-----|
| 视觉通道 | 3×3 方格，蓝色方块随机出现在 9 个位置之一 |
| 听觉通道 | 同时朗读一个字母（A-Z） |
| N 值 | 1-back / 2-back / 3-back |
| 轮数 | 15 / 20 / 30 |
| 输入 | 位置匹配按钮 + 字母匹配按钮 |
| 计分 | 命中率、误报率、漏判率、综合准确率 |

**存储 details**：`{ nValue, rounds, hitRate, falseAlarmRate, missRate, accuracy }`

---

### 4.15 专注呼吸练习 (breathing) — 分包E

**玩法**：视觉引导呼吸，帮助进入专注状态。

| 属性 | 值 |
|------|-----|
| 视觉 | 圆形缩放动画 |
| 模式 | 4-4-4 箱式 / 4-7-8 呼吸法 / 自定义 |
| 引导 | 吸气扩大 → 屏息 → 呼气缩小 |
| 音效 | 吸气/呼气提示音 |
| 背景音 | 可选白噪音 |

**存储 details**：`{ mode, duration }`

---

### 4.16 训练计划 (training-plan) — 分包E

**玩法**：7 天训练计划，每天推荐 2-3 个游戏组合。

| 属性 | 值 |
|------|-----|
| 周期 | 7 天 |
| 内容 | 每天 2-3 个游戏推荐 |
| 追踪 | 已完成/未完成状态 |

**存储 details**：`{ day, completedGames, date }`

---

### 4.17 每日挑战 (daily-challenge) — 分包E

**玩法**：每天 5 分钟综合挑战。

| 属性 | 值 |
|------|-----|
| 时长 | 5 分钟 |
| 内容 | 随机抽取 3 个游戏各 1 分钟 |
| 打卡 | 连续打卡记录 |

**存储 details**：`{ date, games, totalScore, streak }`

---

### 4.18 番茄专注计时器 (pomodoro) — 主包

**玩法**：安排专注/休息时间。

| 属性 | 值 |
|------|-----|
| 模式 | 专注 / 短休息 / 长休息 |
| 默认时长 | 25min / 5min / 15min |
| 自定义 | 可调整各段时长 |
| 长休息间隔 | 每 4 个专注轮后长休息 |
| 提醒 | 提示音 + 系统通知 |
| 计分 | 完成轮次 + 今日专注分钟 |

**存储 details**：`{ focusMinutes, rounds, longBreakInterval }`

---

## 5. 首页与个人中心

### 5.1 首页 (index)

- 顶部：小程序名称 + 今日专注时长
- 中部：6 大分类入口卡片
  - 专注训练（3 个游戏）
  - 认知控制（2 个游戏）
  - 注意与反应（5 个游戏）
  - 工作记忆（4 个游戏）
  - 专注流程（3 个游戏）
  - 舒尔特变体（含在专注训练中）
- 底部：最近使用的 3 个游戏快捷入口

### 5.2 个人中心 (profile)

- 总游戏次数
- 总专注时长
- 连续打卡天数
- 各游戏最佳成绩一览
- 设置：音效开关 / 清除数据

---

## 6. 异常处理

| 异常场景 | 处理方式 |
|----------|----------|
| 微信存储写入失败 | 异步重试 1 次；仍失败则内存缓存 + toast 提示 |
| 存储读取失败 | 返回空数组/零值，不影响游戏进行 |
| 音频加载失败 | 静默降级为无音效模式 |
| 音频播放中用户切换静音 | 立即停止所有 InnerAudioContext |
| 游戏进行中来电话/切后台 | onHide 暂停计时器并保存现场；onShow 询问"继续"或"放弃" |
| Canvas 绘制分享卡失败 | 降级为纯文字分享 |
| 分包加载超时 | loading 动画，10s 超时后提示"网络不佳，请重试" |

---

## 7. 性能约束与优化

| 约束 | 策略 |
|------|------|
| 主包 ≤ 2MB | 首页 + 2 个热门游戏 + 共享模块。音效放分包或 CDN |
| 分包各 ≤ 2MB | 每个分包最多 5 个页面 |
| 渲染性能 | 舒尔特方格等用 CSS Grid；仅分享卡片用 Canvas |
| 页面栈 ≤ 10 层 | 游戏结果页复用路由 |
| setData 频率 | 计时器更新节流至 100ms，高频动画用 WXS |

---

## 8. 开发阶段

| 阶段 | 内容 | 产出 |
|------|------|------|
| Phase 0 | 项目骨架：主包 + 分包架构 + 共享模块 + 路由 | 可运行的空壳小程序 |
| Phase 1 | 主包 2 个热门游戏（舒尔特 + 番茄） | 完整游戏流程跑通 |
| Phase 2 | 分包 A + B（4 个游戏） | 验证分包加载 |
| Phase 3 | 分包 C（5 个游戏） | 完成反应类 |
| Phase 4 | 分包 D（4 个游戏） | 完成记忆类（含 Dual N-Back） |
| Phase 5 | 分包 E（3 个游戏）+ 分享功能 | 全部完成 |

---

## 9. 待确认事项

- [ ] 音效文件来源：自行录制 / 使用免费音效库 / 使用 TTS 合成字母朗读
- [ ] 小程序类目选择：建议"工具 > 教育"或"游戏 > 休闲益智"
- [ ] 是否需要用户授权：不需要（纯本地存储，无个人信息收集）
- [ ] 分享卡片视觉风格：待设计
