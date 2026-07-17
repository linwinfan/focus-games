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
