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
