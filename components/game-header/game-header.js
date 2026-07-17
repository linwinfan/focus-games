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
