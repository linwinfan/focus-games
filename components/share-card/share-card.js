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
      if (visible) {
        setTimeout(() => this._draw(), 100);
      }
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

        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#4A90D9');
        gradient.addColorStop(1, '#6BB0E8');
        ctx.fillStyle = gradient;
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

        // 分隔线
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(60, 260);
        ctx.lineTo(w - 60, 260);
        ctx.stroke();

        // 底部提示
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

    onShareToChat() {
      // 微信小程序中直接通过 showShareMenu 实现转发
      wx.showToast({ title: '请点击右上角转发', icon: 'none' });
    }
  }
});
