# 专注力训练微信小程序

> 基于 [focus-game.org](https://focus-game.org/zh/focus-games) 改写的微信小程序版本，包含 20 个专注力训练游戏，覆盖专注训练、认知控制、注意与反应、工作记忆、专注流程五大类别。

## 功能特色

-  **20 个专注力训练游戏** — 舒尔特方格、Dual N-Back、斯特鲁普测试等经典认知训练
-  **完整音效系统** — 点击/正确/错误/倒计时/完成/字母朗读/呼吸引导等 30+ 音效
-  **本地历史记录** — 所有成绩自动保存到本地，支持趋势分析和最佳成绩追踪
-  **成绩分享** — Canvas 绘制精美成绩卡片，一键转发给朋友
-  **分包加载** — 主包 + 5 分包架构，启动快、加载流畅
-  **无需后端** — 纯本地存储，零服务器依赖，开箱即用

## 游戏列表

### 专注训练
| 游戏 | 说明 |
|------|------|
| 舒尔特方格 | 按顺序寻找数字，练习视觉扫描和专注节奏 |
| 反向舒尔特 | 从大到小搜索数字，增加逆向思维挑战 |
| 儿童舒尔特 | 3x3 到 5x5 方格，适合儿童入门 |

### 认知控制
| 游戏 | 说明 |
|------|------|
| 斯特鲁普测试 | 按颜色作答而忽略文字内容 |
| 反向斯特鲁普 | 按文字内容而不是颜色作答 |

### 注意与反应
| 游戏 | 说明 |
|------|------|
| 注意力测试 | Go/No-Go 检测，评估专注状态 |
| 反应时间测试 | 测量反应速度与误触情况 |
| 视觉搜索测试 | 在复杂视野中快速寻找目标 |
| 专注反应测试 | 在干扰信息中快速识别目标 |
| 专注力测试 | 3 分钟三阶段综合测试 |

### 工作记忆
| 游戏 | 说明 |
|------|------|
| 记忆序列游戏 | 复现视觉序列，训练短时记忆 |
| 数字记忆测试 | 逐步记忆更长的数字序列 |
| 工作记忆测试 | 记忆序列与计算交替进行 |
| Dual N-Back | 视觉和声音结合的工作记忆训练 |

### 专注流程
| 功能 | 说明 |
|------|------|
| 番茄专注计时器 | 安排专注与休息时间 |
| 专注呼吸练习 | 4-4-4 箱式 / 4-7-8 放松呼吸法 |
| 7 天训练计划 | 系统提升专注力的每日计划 |
| 每日挑战 | 每天 5 分钟综合挑战 |

## 快速开始

### 前置条件

- 已安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 已注册微信小程序 AppID

### 运行步骤

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd focus-games

# 2. 用微信开发者工具打开本项目目录

# 3. 修改 AppID
# 打开 project.config.json，将 "touristappid" 替换为你的真实 AppID

# 4. 开发工具中点击"编译"即可预览

# 5. 如需重新生成音效（可选）
node scripts/generate-audio.js
```

## 项目结构

```
focus-games/
├── app.js / app.json / app.wxss     # 全局入口
├── project.config.json               # 项目配置
├── pages/                            # 主包页面
│   ├── index/                        # 首页（分类入口 + 最近使用）
│   ├── games-list/                   # 分类游戏列表
│   ├── profile/                      # 个人中心（统计 + 设置）
│   ├── schulte-table/                # 舒尔特方格 ⭐ 热门
│   └── pomodoro/                     # 番茄计时器 ⭐ 热门
├── pages-focus/                      # 分包A：专注训练
├── pages-cognitive/                  # 分包B：认知控制
├── pages-reaction/                   # 分包C：注意与反应
├── pages-memory/                     # 分包D：工作记忆
├── pages-flow/                       # 分包E：专注流程
├── utils/                            # 共享工具
│   ├── storage.js                    # 历史记录管理
│   ├── audio.js                      # 音效管理器
│   └── timer.js                      # 计时器工具
├── components/                       # 共享组件
│   ├── game-header/                  # 游戏顶部导航
│   ├── result-panel/                 # 结果展示面板
│   ├── history-list/                 # 历史记录列表
│   ├── difficulty-selector/          # 难度选择器
│   ├── countdown-overlay/            # 倒计时蒙层
│   └── share-card/                   # 分享卡片
├── config/
│   └── games.js                      # 游戏配置元数据
├── audio/                            # 音效文件
│   ├── click.wav                     # 点击音
│   ├── correct.wav                   # 正确音
│   ├── wrong.wav                     # 错误音
│   ├── countdown.wav                 # 倒计时音
│   ├── complete.wav                  # 完成音
│   ├── breathe_in.wav                # 吸气音
│   ├── breathe_out.wav               # 呼气音
│   └── letters/                      # 字母朗读 A-Z
├── images/                           # 图标资源
│   ├── icon-focus.svg                # 专注训练图标
│   ├── icon-cognitive.svg            # 认知控制图标
│   ├── icon-reaction.svg             # 注意与反应图标
│   ├── icon-memory.svg               # 工作记忆图标
│   └── icon-flow.svg                 # 专注流程图标
└── scripts/
    ├── generate-audio.js             # 音效生成脚本
    └── svg-to-png.md                 # SVG 转 PNG 指南
```

## 分包说明

| 分包 | 路径 | 包含内容 | 大小估算 |
|------|------|----------|----------|
| 主包 | `pages/` | 首页、列表、个人中心、舒尔特、番茄 | ~1.2MB |
| 分包A | `pages-focus/` | 反向舒尔特、儿童舒尔特 | ~200KB |
| 分包B | `pages-cognitive/` | 斯特鲁普、反向斯特鲁普 | ~150KB |
| 分包C | `pages-reaction/` | 5 个注意与反应游戏 | ~300KB |
| 分包D | `pages-memory/` | 4 个工作记忆游戏 | ~350KB |
| 分包E | `pages-flow/` | 呼吸练习、训练计划、每日挑战 | ~200KB |

## 后续计划

- [ ] 替换为专业录制的音效（当前为程序生成的合成音）
- [ ] 完善图标资源（当前为 SVG 占位，需转 PNG 或使用 2.28.0+ 基础库）
- [ ] 增加更多游戏变体（如 Reverse N-Back、Task Switching 等）
- [ ] 添加数据导出功能（CSV 格式）
- [ ] 适配深色模式

## 技术栈

- 微信小程序原生框架 (WXML / WXSS / JavaScript)
- 无第三方框架
- 无后端服务（纯wx.storage本地存储）

## 参考

- 原版网站：https://focus-game.org/zh/focus-games
- 微信开发文档：https://developers.weixin.qq.com/miniprogram/dev/framework/

## License

详见 [LICENSE](./LICENSE) 文件。
