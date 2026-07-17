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
