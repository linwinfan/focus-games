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
